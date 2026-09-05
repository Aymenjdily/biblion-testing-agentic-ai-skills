# Intelligent search: Sanity Context MCP + server search API + results page

> **Addendum (post-implementation):** AGENTS.md section 6 specifies the OpenAI
> provider, but the user has no OpenAI billing and can't add any.
>
> First tried `@ai-sdk/google` (Gemini free tier) — worked functionally
> (verified a real, grounded video-moment result end to end), but Gemini's
> free tier is 5 requests/minute, and this multi-step tool-calling search
> uses 3-4 model calls per query, so it was exhausted almost immediately in
> real use.
>
> Switched to `@ai-sdk/groq` instead (`GROQ_API_KEY` in `.env.example`).
> Nothing else in the architecture is provider-specific — the MCP
> connection, grounding logic, and Zod schema are unchanged. Swapping
> providers again later is a one-line change (the import and the `model:`
> line in `lib/search.ts`).
>
> Groq's real free-tier limit turned out to be 8000 tokens/minute per
> organization (`llama-3.3-70b-versatile` isn't available on this account at
> all — confirmed against the live `/v1/models` endpoint; settled on
> `openai/gpt-oss-20b`). The MCP's full tool set (`initial_context`,
> `groq_query`, `schema_explorer`, `array_field_reader`) resends its schemas
> on every step of a multi-step tool-calling loop, and every tool result
> gets appended to the growing history sent on the *next* step — that
> compounds fast against an 8000 TPM ceiling. Tried `groq/compound-mini`
> for its 70000 TPM limit, but Groq's compound models run their own
> built-in tool orchestration and reject custom tool calling outright.
>
> Fix: dropped `initial_context`/`schema_explorer`/`array_field_reader`
> from the tool set entirely and hand-wrote the (small, stable) schema
> directly into the system prompt instead, so the model never needs to call
> them. Kept only `groq_query` (its own description trimmed — the MCP's
> built-in ~8280-char GROQ tutorial duplicates guidance already in the
> system prompt) plus `submit_results`. Lowered `MAX_STEPS` to 5 (system
> prompt targets 2 groq_query calls + 1 submit_results) so a stray extra
> step can't compound past the budget. Verified live: a cold query now
> returns full grounded results in one request. Back-to-back queries within
> the same 60-second window can still get starved by the shared TPM budget
> — an inherent free-tier throughput ceiling, not a code bug.

## Goal

Wire up AGENTS.md section 11's search feature end to end: the Sanity Context MCP connection, a server-side search API route that calls an LLM with MCP tools and returns grounded, structured results, and a full results page (video and lesson cards) — scoped to courses and lessons.

## Skills read

- `create-agent-with-sanity-context` — MCP connection pattern, Next.js + Vercel AI SDK reference, Studio setup, env vars.
- `dial-your-context` — how to write the Context document's `instructions`/`groqFilter` as pure deltas, verified against real data.
- `shape-your-agent` — system prompt structure (skipped the full interactive tone session — see decision 9).
- `AGENTS.md` sections 6, 7, 8, 9, 10, 11, 12, 13.

## Investigation and hard findings

1. **Studio is not deployed.** Direct test against the MCP: `{"code":-32004,"message":"Only datasets with deployed Studio applications are supported. Please deploy a Studio (v5.1.0+)..."}`. This blocks everything else — deploying is step 1.
2. **`@sanity/context` (the Studio plugin) requires `sanity: ^6`; this Studio runs `sanity: ^5.31.2`.** Per AGENTS.md section 12, not installing it — no Insights UI, no in-Studio form for the Context document. The Context document is created by direct write (a one-off script with a write token), not through a Studio plugin form.
3. **No video ingestion exists** (confirmed earlier this conversation, and re-confirmed by the user just now): no `video` document type, no chapters, no transcript chunks. **Decision already made with you**: ship lesson-only results now. Video-moment results stay structurally supported (schema, types, `VideoResultCard` component) but the agent is instructed it has no chapter/transcript tool data, so it will only ever emit `kind: "lesson"` until ingestion exists.
4. **Sanity CLI is already authenticated** in this environment (has a stored auth token) — `npx sanity deploy` and minting a write token can run non-interactively. Deploying publishes the Studio to a public `*.sanity.studio` URL; flagging this clearly since it's an externally-visible action, but it's a hard requirement (section 12) and part of what "implement search" necessarily entails.
5. **Every lesson has `notes` and `keyPoints` populated** (120/120) — good grounding material for lesson matching.
6. **No AI SDK packages installed yet.** Adding `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, `zod`, `react-markdown` (latest versions, per the skill's "don't guess versions" rule — checked via `npm info` at investigation time: `ai@7.0.93`, `@ai-sdk/openai@4.0.59`, `@ai-sdk/mcp@2.0.45`, `zod@4.5.4`, `react-markdown@10.1.0`; peer deps confirmed compatible).

## Decisions and assumptions

1. **Grounding architecture — the LLM never invents display data.** The model's only job is to find and rank matching lessons via MCP tools (`groq_query`, semantic search) and call one final tool, `submit_results`, with a minimal Zod-validated payload: `{ results: [{ kind: "lesson" | "video", lessonId, matchedSecond?, description }], reply? }`. The server then re-fetches those exact `lessonId`s directly from Sanity (a real GROQ query, not LLM-authored data) to build the actual display cards — title, slug, course/module labels, poster, duration, key points, free-preview flag. Any `lessonId` the LLM returns that doesn't resolve to a real lesson is silently dropped. This makes fabrication structurally impossible for anything except the one-line `description`/`reply`, which are clearly "the agent's gloss," not claimed facts like price or duration.
2. **No new schema fields.** Search runs entirely over the existing `course`/`lesson` schema (title, notes, keyPoints, freePreview, resources, module/lesson position). Nothing to add.
3. **Content filter (`groqFilter`)**: `_type in ["course", "lesson", "instructor", "category"]`. Instructor/category included so the agent can resolve names/labels if it needs to, even though only lessons are ever returned as results.
4. **Instructions field (dial-your-context, condensed)** — proposing this directly rather than a full interactive session, since I already know this schema in depth from building it across this conversation and have verified the claims below against the live dataset:
   - "A lesson does not store its course — find it via `*[_type == "course" && references(^._id)]`, matching the lesson through the course's `modules[].lessons[]` reference array to get its module/lesson position."
   - "`lesson.duration` is normally a string like \"12:34\", but some already-imported lessons store it as a raw number of seconds — handle both, and never state a duration back to the user directly; the server resolves and formats it."
   - "`lesson.poster` is the schema's image field, but some already-imported lessons only have the legacy `thumbnail` field populated — query `coalesce(poster, thumbnail)`."
   - "There is no `video` document type and no chapter/transcript data anywhere in this dataset. Never claim a specific timestamp or video moment — only match lessons by their `title`, `notes` (Portable Text — use `pt::text(notes)` for plain-text search), and `keyPoints`."
   - "Text match is token-based: split the query into keywords and OR wildcard matches across `title`, `pt::text(notes)`, and `keyPoints[]` — never match the whole query as one phrase."
   - "Rank by specificity: an exact/title match outranks a keyword hit buried in notes."
   I'll show you the exact proposed filter and instructions text again at the approval step below (section "Proposed Context document content") so you can amend before I write it.
5. **System prompt** (shape-your-agent, condensed): this agent has no conversational persona — it never talks to the user directly, it only searches and returns one tool call. So the "voice" half of shape-your-agent doesn't apply; the prompt is purely a task contract: what to search, how to rank, the grounding rule, and the mandatory final `submit_results` call. Full text in "Files to create."
6. **Model**: OpenAI via `@ai-sdk/openai`, per AGENTS.md section 6. Using `gpt-4.1-mini` (fast, cheap, strong tool-calling) by default, overridable via `OPENAI_SEARCH_MODEL` env var.
7. **Auth for the MCP itself**: reusing the existing `SANITY_API_READ_TOKEN` (Viewer role is sufficient for `groq_query`/semantic search, per the skill). Only the one-off Context-document-creation script needs a temporary write/editor token — minted via `npx sanity tokens add`, used once, not stored in `.env`.
8. **Architecture**: `lib/search.ts` holds the actual MCP-connect → `generateText` with tools → resolve real lesson data pipeline, used by both:
   - `app/api/search/route.ts` (POST `{ query }` → JSON `{ query, reply, results, resultCount, courseCount }`) — the standalone "server-side search API" you asked for, independently curl-able per AGENTS.md's checks section.
   - `app/search/page.tsx` (Server Component) — calls the same `lib/search.ts` function directly for the initial render (no internal HTTP hop), reads `?q=` (already the exact param both the catalog and homepage search boxes submit to).
9. **Results page** (section 11): eyebrow + count ("Found N results across M courses"), a sort control (Most Relevant [default, the LLM's ranked order] / Course A–Z), a card per result — `LessonResultCard` (course + module/lesson label, key points, description, opens `/courses/[slug]` → actually per section 11 "opens the lesson page", so `/lessons/[slug]`) and `VideoResultCard` (course + module/lesson label, thumbnail, clip length, description, matched second — unused for now per decision 3, action watches from that second on `/lessons/[slug]?start=`). Empty state points to `/catalog` when there are zero results.
10. **`reply` markdown line**: a short one-line agent gloss ("Found 6 lessons on streaming and Suspense boundaries.") shown above the results, rendered via `react-markdown` per AGENTS.md section 6. Optional — omitted if the model doesn't provide one.
11. **No Conversation Insights.** Recommended by the skill but out of scope here — this is a structured search endpoint, not a chat product, and AGENTS.md doesn't ask for it. Can add later.
12. **Loading/error states**: the results page is a Server Component awaiting the search call directly (can take a few seconds — real LLM + tool calls), shown with Next.js's `loading.tsx` for the route. On an API/model error, show the same empty state with a generic "couldn't complete that search" message — never a raw error to the user.

## Proposed Context document content (final review before I write it)

**Slug**: `search`
**Filter**: `_type in ["course", "lesson", "instructor", "category"]`
**Instructions**: the five bullet points in decision 4 above, written out in full in the actual document.

Say the word if you want to adjust the filter or add/remove any instruction before I create this document.

## Files to create

- `lib/sanity-context.ts` — MCP client creation + cached `/initial-context` fetch (mirrors the reference pattern).
- `lib/search.ts` — `runSearch(query: string)`: creates the MCP client, builds the system prompt (inline, ~150 words, task-only per decision 5), runs `generateText` with `{ ...mcpTools (minus initial_context), submit_results }` and `stopWhen: stepCountIs(8)`, extracts the `submit_results` tool call, resolves real lesson data via a new `getLessonsByIds` query, returns `{ reply, results, resultCount, courseCount }`.
- `sanity/lib/queries.ts` — add `LESSONS_BY_IDS_QUERY`/`getLessonsByIds(ids)` (batch fetch + the same course/module/lesson-index derivation `getLessonBySlug` already does, reused for N lessons at once).
- `app/api/search/route.ts` — thin POST handler calling `runSearch`.
- `app/search/page.tsx` — Server Component, reads `searchParams.q`, calls `runSearch` directly, renders header/count/sort + `SearchResultsList` (client, for the sort control) + empty state.
- `app/search/loading.tsx` — skeleton/spinner state.
- `components/search/LessonResultCard.tsx`, `components/search/VideoResultCard.tsx`, `components/search/SearchResultsList.tsx` (client: sort), `components/search/SearchEmptyState.tsx`.
- One-off `scripts/create-search-context.mjs` (or run inline, not committed) to write the `sanity.agentContext` document — run once, not part of the app's request path.

## Files to modify

- `package.json` — add `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, `zod`, `react-markdown`.
- `.env.example` — add `OPENAI_API_KEY`, `OPENAI_SEARCH_MODEL` (optional), `SANITY_CONTEXT_MCP_URL`.
- `sanity/lib/queries.ts` — the new batch query (decision above).

## Requirements

- The API route and `lib/search.ts` are the only places that touch the OpenAI key, the MCP URL, or the Sanity read token — never sent to the browser.
- The results page is a Server Component; only the sort control is a client component, over the already-fetched result list (no extra network round-trip to re-sort).
- No custom player, no fabricated timestamps, no invented courses/lessons/prices — enforced structurally per decision 1, not just by prompt wording.
- Reuse `Badge`, `ProgressBar` (n/a here), icons, and existing Tailwind tokens; no new colors.

## Security considerations

- MCP token and OpenAI key are server-only env vars.
- The one-off write token used to create the Context document is used once at setup time and not persisted anywhere in the repo or `.env`.
- `submit_results`'s arguments are Zod-validated before use; any `lessonId` not found in a real Sanity fetch is dropped rather than trusted.

## Acceptance criteria

- Studio is deployed and reachable; `curl .../context/mcp/vfyf5mvo/production` no longer returns the "deploy a Studio" error.
- The Context document exists at slug `search` with the agreed filter/instructions.
- `curl -X POST localhost:3000/api/search -d '{"query":"how do I stream HTML with Suspense"}'` returns real, ranked lesson results (title, course, module/lesson label, real duration) with no fabricated fields.
- Visiting `/search?q=...` (from the catalog page's existing search box) renders the same results as a full page: count, sort control, lesson cards linking to real `/lessons/[slug]` pages.
- A nonsense query returns the empty state pointing to `/catalog`, not an error.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.

## Checks to run

- Web root: `npm install`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Verify against the live MCP endpoint (not mocked), per AGENTS.md section 13.

## Manual test steps

1. `npx sanity deploy` from `studio/` (confirm the public Studio URL it prints).
2. Run the one-off script to create the `search` Context document; confirm via `curl .../initial-context`.
3. `npm install`, add `OPENAI_API_KEY` to `.env.local`.
4. `npm run dev`; from `/catalog`, type a real query ("caching and revalidation") into the search box and submit — confirm it lands on `/search?q=...` with real, relevant lesson cards.
5. Try a query with no plausible match ("quantum blockchain yoga") — confirm the empty state, not an error or fabricated results.
6. Confirm every result card links to a real `/lessons/[slug]` page.
7. `curl -X POST http://localhost:3000/api/search -H "Content-Type: application/json" -d '{"query":"suspense boundaries"}'` and inspect the JSON directly.
