import "server-only";

import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { createSanityMCPClient, fetchInitialContext } from "@/lib/sanity-context";
import { getLessonsByIds, type LessonSearchResult } from "@/sanity/lib/queries";

const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_STEPS = 8;

const searchResultItemSchema = z.object({
  kind: z.enum(["lesson", "video"]),
  lessonId: z.string().describe("The real Sanity _id of the matching lesson document."),
  matchedSecond: z
    .number()
    .optional()
    .describe("Only for kind 'video' — the matched second within the video, from real chapter/transcript data."),
  description: z
    .string()
    .describe("One short sentence grounding why this lesson matched the query."),
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

function buildSystemPrompt(initialContext: string | null): string {
  return `You are Biblion's course search agent. You find lessons matching a learner's plain-language query and return them as structured results — never as conversational prose, never to the learner directly.

${initialContext ? `# Data reference\n\nUse this to understand the schema and tools available.\n\n${initialContext}\n` : ""}
# Your job

1. Use \`groq_query\` to find lessons matching the query. Text match is token-based: split the query into keywords and OR wildcard-match across the lesson's title, notes (via \`pt::text(notes)\`), and keyPoints — never match the whole query as one phrase.
2. Rank matches by specificity: a title match outranks a keyword buried in notes.
3. Call \`submit_results\` exactly once, as your final action, with the matching lessons in ranked order (best first). Cap at 20 results.
4. Every result's \`kind\` must be "lesson" — there is no video/chapter/transcript data in this dataset yet, so never emit "video" or a \`matchedSecond\`.
5. If nothing matches, call \`submit_results\` with an empty \`results\` array. Never invent a lesson that didn't come back from a real query.

Never state a lesson's price, duration, or any other display fact directly — you only identify which lessons matched and why; the application resolves and displays the real data.`;
}

export type SearchResultItem = SubmitResultsInput["results"][number] & {
  lesson: LessonSearchResult;
};

export type SearchResponse = {
  query: string;
  reply: string | null;
  results: SearchResultItem[];
  resultCount: number;
  courseCount: number;
};

export async function runSearch(query: string): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query, reply: null, results: [], resultCount: 0, courseCount: 0 };
  }

  const mcpClient = await createSanityMCPClient();

  try {
    const initialContext = await fetchInitialContext();
    const allMcpTools = await mcpClient.tools();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- excluded: already in the system prompt
    const { initial_context, ...mcpTools } = allMcpTools;

    const result = await generateText({
      model: openai(process.env.OPENAI_SEARCH_MODEL || DEFAULT_MODEL),
      system: buildSystemPrompt(initialContext),
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
      return { query, reply: null, results: [], resultCount: 0, courseCount: 0 };
    }

    const parsed = submitResultsSchema.safeParse(submitCall.input);
    if (!parsed.success) {
      return { query, reply: null, results: [], resultCount: 0, courseCount: 0 };
    }

    // Ground every result: re-fetch the exact lessons from Sanity directly.
    // Any lessonId the model invented (not a real document) is dropped here.
    const lessonIds = parsed.data.results.map((r) => r.lessonId);
    const realLessons = await getLessonsByIds(lessonIds);
    const lessonsById = new Map(realLessons.map((lesson) => [lesson._id, lesson]));

    const results: SearchResultItem[] = parsed.data.results.flatMap((item) => {
      const lesson = lessonsById.get(item.lessonId);
      return lesson ? [{ ...item, lesson }] : [];
    });

    const courseCount = new Set(
      results.map((r) => r.lesson.context?.courseSlug).filter(Boolean),
    ).size;

    return {
      query,
      reply: parsed.data.reply ?? null,
      results,
      resultCount: results.length,
      courseCount,
    };
  } finally {
    await mcpClient.close();
  }
}
