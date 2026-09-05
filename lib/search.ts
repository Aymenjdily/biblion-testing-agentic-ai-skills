import "server-only";

import { groq } from "@ai-sdk/groq";
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createSanityMCPClient } from "@/lib/sanity-context";
import { getLessonsByIds, type LessonSearchResult } from "@/sanity/lib/queries";
import { getPostHogClient } from "@/lib/posthog-server";

// Groq (free tier via console.groq.com, no billing required) — far more
// headroom than Gemini's free tier for this multi-step tool-calling search
// (Gemini's 5 req/min was exhausted by a single query). See GROQ_API_KEY in
// .env.example. Swap providers here if that changes; nothing else in this
// file is provider-specific.
//
// Tried groq/compound-mini for its much higher 70000 TPM limit (verified via
// this account's real x-ratelimit-limit-tokens headers), but Groq's compound
// models run their own built-in tool-orchestration system and reject custom
// tool calling outright ("tool calling is not supported with this model") —
// not usable here since this search depends on MCP + submit_results tools.
// Back to gpt-oss-20b (8000 TPM); the fix has to be reducing request size.
const DEFAULT_MODEL = "openai/gpt-oss-20b";
// The system prompt targets 2 groq_query calls + 1 submit_results; a lower
// cap than that keeps a stray extra step from compounding the per-step
// token cost past the free tier's per-minute budget (see the mcpTools
// comment below for how that cost compounds across steps).
const MAX_STEPS = 5;

const searchResultItemSchema = z.object({
  kind: z.enum(["lesson", "video"]),
  lessonId: z.string().describe("The real Sanity _id of the matching lesson document."),
  matchedSecond: z
    .number()
    .optional()
    .describe("Only for kind 'video' — the matched second within the video, from real chapter/transcript data."),
  description: z
    .string()
    .describe(
      "One short sentence grounding why this lesson matched the query. Wrap code, function names, or technical terms in backticks, e.g. `revalidateTag(\"course:next-007\")`.",
    ),
});

const submitResultsSchema = z.object({
  results: z
    .array(searchResultItemSchema)
    .describe("Matching lessons, best match first."),
  reply: z
    .string()
    .optional()
    .describe("One short sentence summarizing the results, e.g. 'Found 6 lessons on streaming and Suspense.'"),
});

export type SubmitResultsInput = z.infer<typeof submitResultsSchema>;

const submitResultsTool = tool({
  description:
    "Submit the final ranked search results. Call this exactly once, as your last action, after you've found matching lessons via groq_query.",
  inputSchema: submitResultsSchema,
});

function buildSystemPrompt(): string {
  return `You are Biblion's course search agent. You find lessons matching a learner's plain-language query and return them as structured results — never as conversational prose, never to the learner directly.

# Schema (only the fields you need — do not call initial_context or schema_explorer, they are not available and would waste budget)

- \`lesson\` document: title, slug, videoUrl (matches a video document's url), notes (Portable Text — use \`pt::text(notes)\` to text-match it), keyPoints (array of strings), duration, freePreview.
- \`video\` document: id, url, chapters (array of {startSeconds, label} — the table of contents, clean labels), chunks (array of {startSeconds, text} — noisier transcript pieces, often empty for now).
- \`course\` document: title, modules (array of {title, summary, lessons: array of references to lesson}). A lesson does not store its course — find it with \`*[_type == "course" && references($lessonId)][0]{title}\` if you need course context (usually you don't; the app resolves display data itself).

# Your job

1. Use \`groq_query\` to find lessons matching the query in one shot: \`*[_type == "lesson" && (title match $kw || pt::text(notes) match $kw || keyPoints[] match $kw)]{_id, title}\`. Text match is token-based: split the query into keywords, wildcard each (e.g. \`"caching*"\`), and OR them — never match the whole query as one phrase.
2. For each candidate lesson (there are usually only a few), look up its video document by URL in a second, single batched query: \`*[_type == "video" && url in $videoUrls]{url, chapters, chunks}\`. Match chapters first (real timestamps); only fall back to \`chunks\` if no chapter matches. An empty \`chunks\` array is normal, not an error.
3. Rank matches by specificity: a title match outranks a keyword buried in notes; a chapter match outranks either.
4. Call \`submit_results\` exactly once, as your final action, with the matching lessons in ranked order (best first). Cap at 20 results.
5. Emit \`kind: "video"\` with a real \`matchedSecond\` ONLY when you found an actual matching chapter or chunk with that exact \`startSeconds\` — never estimate or invent a timestamp. Otherwise emit \`kind: "lesson"\` with no \`matchedSecond\`.
6. If nothing matches, call \`submit_results\` with an empty \`results\` array. Never invent a lesson that didn't come back from a real query.

This runs on a strict token-per-minute budget: use as few tool calls as possible (2 groq_query calls total is the target — one for lessons, one batched lookup for videos), and project only the fields listed above, never whole documents. Never state a lesson's price, duration, or any other display fact directly — you only identify which lessons matched and why; the application resolves and displays the real data.`;
}

export type SearchResultItem = SubmitResultsInput["results"][number] & {
  lesson: LessonSearchResult;
  // The real chapter's label for this matchedSecond, or "Transcript" when it
  // only matched a transcript chunk (chunks have no title of their own).
  // Undefined for kind "lesson".
  momentLabel?: string;
};

export type SearchResponse = {
  query: string;
  reply: string | null;
  results: SearchResultItem[];
  resultCount: number;
  courseCount: number;
};

// Server-side capture: every real search execution goes through runSearch,
// whether it started at the catalog quick-search box, a direct /search?q=
// visit, or a re-search on the results page — one capture site here covers
// all of them without client-side duplication. distinctId matches the same
// Clerk user id PostHog already has from the client's identify() call; no
// other identifying data is added.
async function captureSearchPerformed(query: string, response: SearchResponse) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  const { userId } = await auth();
  posthog.capture({
    distinctId: userId ?? "anonymous",
    event: "search_performed",
    properties: {
      query,
      query_length: query.length,
      result_count: response.resultCount,
      lesson_result_count: response.results.filter((r) => r.kind === "lesson").length,
      moment_result_count: response.results.filter((r) => r.kind === "video").length,
      course_count: response.courseCount,
    },
  });
  await posthog.flush();
}

export async function runSearch(query: string): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query, reply: null, results: [], resultCount: 0, courseCount: 0 };
  }

  // Fail fast with a clear message so a missing key surfaces here, not as an
  // obscure provider error deeper in generateText.
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set — the search agent cannot reach the language model.");
  }

  const mcpClient = await createSanityMCPClient();

  try {
    // Every tool schema is resent on every step of a multi-step tool-calling
    // loop, and every tool result gets appended to the growing message
    // history sent on the *next* step — so on a strict per-minute token
    // budget, the cost compounds fast across steps, not just once.
    //
    // Measured against the real MCP endpoint: `initial_context` alone costs
    // ~2371 chars of schema (~593 tokens) plus a ~4072 char (~1018 token)
    // result if called, and `schema_explorer`/`array_field_reader` add
    // another ~4700 chars (~1200 tokens) of tool schema resent every step
    // for capabilities this search never uses. Dropping all three and
    // hand-writing the (small, stable) schema directly into the system
    // prompt above removes that cost entirely — the model never needs to
    // call them. Keeping only `groq_query`, with its description trimmed
    // (the MCP's built-in ~8280 char GROQ tutorial is redundant with the
    // query guidance already in the system prompt).
    const rawMcpTools = await mcpClient.tools();
    const mcpTools = {
      groq_query: {
        ...rawMcpTools.groq_query,
        description: "Query the dataset using GROQ. Always project only the fields you need.",
      } as typeof rawMcpTools.groq_query,
    };

    const result = await generateText({
      model: groq(process.env.GROQ_SEARCH_MODEL || DEFAULT_MODEL),
      system: buildSystemPrompt(),
      prompt: `Learner's search query: ${trimmed}`,
      tools: {
        ...mcpTools,
        submit_results: submitResultsTool,
      },
      stopWhen: stepCountIs(MAX_STEPS),
    });

    const submitCall = result.steps
      .flatMap((step) => step.toolCalls)
      .find((call) => call.toolName === "submit_results");

    if (!submitCall) {
      const response = { query, reply: null, results: [], resultCount: 0, courseCount: 0 };
      await captureSearchPerformed(trimmed, response);
      return response;
    }

    const parsed = submitResultsSchema.safeParse(submitCall.input);
    if (!parsed.success) {
      const response = { query, reply: null, results: [], resultCount: 0, courseCount: 0 };
      await captureSearchPerformed(trimmed, response);
      return response;
    }

    // Ground every result: re-fetch the exact lessons from Sanity directly.
    // Any lessonId the model invented (not a real document) is dropped here.
    const lessonIds = parsed.data.results.map((r) => r.lessonId);
    const realLessons = await getLessonsByIds(lessonIds);
    const lessonsById = new Map(realLessons.map((lesson) => [lesson._id, lesson]));

    const results: SearchResultItem[] = parsed.data.results.flatMap((item): SearchResultItem[] => {
      const lesson = lessonsById.get(item.lessonId);
      if (!lesson) return [];

      // Never trust a claimed matchedSecond — only keep it if it matches a
      // real chapter/chunk startSeconds on this lesson's video document, and
      // resolve the real label for it rather than anything the model said.
      if (item.kind === "video" && item.matchedSecond !== undefined) {
        const chapter = lesson.chapters.find((c) => c.startSeconds === item.matchedSecond);
        if (chapter) {
          return [{ ...item, lesson, momentLabel: chapter.label }];
        }
        const chunk = lesson.chunks.find((c) => c.startSeconds === item.matchedSecond);
        if (chunk) {
          return [{ ...item, lesson, momentLabel: "Transcript" }];
        }
      }

      return [{ ...item, kind: "lesson" as const, matchedSecond: undefined, lesson }];
    });

    const courseCount = new Set(
      results.map((r) => r.lesson.context?.courseSlug).filter(Boolean),
    ).size;

    const response = {
      query,
      reply: parsed.data.reply ?? null,
      results,
      resultCount: results.length,
      courseCount,
    };
    await captureSearchPerformed(trimmed, response);
    return response;
  } finally {
    await mcpClient.close();
  }
}
