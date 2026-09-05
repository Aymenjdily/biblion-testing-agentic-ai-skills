# Tune the search Context document and shape the system prompt

## Goal

Use `dial-your-context` to verify and correct the Sanity Context document's `instructions`/`groqFilter`, and `shape-your-agent` to tighten `lib/search.ts`'s inline system prompt — plus fix a real gap the verification pass surfaced: the Context document's instructions currently have **zero effect** on the deployed app.

## Skills read

- `.claude/skills/dial-your-context/SKILL.md` — pure-deltas-only instructions, verify every claim against live data before writing it, don't duplicate what the schema already shows.
- `.claude/skills/shape-your-agent/SKILL.md` — system prompt is for behavior/tone/boundaries, not data guidance; concrete tone rules over vague ones; the "cut test" (only keep a boundary if you can name the real message that triggers it); under 500 words.

## What I found

**The Context document exists** (`sanity.agentContext`, id `sanity-context-search`, slug `search`) from earlier work this session, with a `groqFilter` and `instructions` that were reasonable when written. Read directly via the Sanity data API (not the Context MCP, which itself excludes this document type from query results by design) and verified against the live dataset:

| Claim in the current instructions | Verified reality |
|---|---|
| `lesson.duration` is "normally a string like '12:34'... some store raw seconds instead" | **120/120 lessons** store a raw number of seconds. **0/120** use the "MM:SS" string format. |
| `lesson.poster` "some already-imported lessons only have the legacy `thumbnail` field" | **0/120** lessons have `poster` set. **120/120** only have `thumbnail`. |
| Videos "most... have an empty `chunks` array" | **0/120** videos have any `chunks`. It's not "most" — it's currently all of them. |
| "Roughly half" of videos have chapters | **59/120 (49.2%)** — this one was accurate. |

The first three are real drift (the instructions describe an earlier, partially-seeded state), not judgment calls — I'm correcting them to the verified numbers rather than asking you to arbitrate.

**The bigger finding**: I traced how the Context document's `instructions` actually reaches the model. It's only ever injected via the MCP's `initial_context` tool/endpoint — confirmed by fetching the raw `groq_query` tool description directly from the MCP, which is a generic ~8280-char GROQ tutorial with no trace of our custom instructions. The earlier Groq-token-budget fix (see `prompts/search.md`'s addendum) removed `initial_context` from the tool set entirely to fit the free tier's 8000 TPM cap, and hand-wrote an equivalent (but independent) schema summary directly into `lib/search.ts`'s system prompt instead. Net effect: **editing the Context document in Studio currently does nothing** — it's disconnected from the running app, contradicting AGENTS.md section 10's premise ("edits to it reach the agent on the next request").

## Decisions

- **Context document `groqFilter`**: leaving unchanged — `_type in ["course", "lesson", "instructor", "category", "video"]` is still exactly the real content scope (verified: 10 courses, 120 lessons, 5 instructors, 6 categories, 120 videos, zero drafts).
- **Context document `instructions`**: correct the three stale claims above to the verified facts; everything else in it (course reverse-lookup, video-lookup-by-URL, chapters-first/chunks-fallback rule, query patterns) already checked out and stays as-is.
- **Reconnect the Context document to the running app**, at low, bounded token cost: fetch only the document's raw `instructions` field directly (a tiny, targeted GROQ query via the existing server-only Sanity client — not the Context MCP, and not the `/initial-context` endpoint, both of which pull in much larger boilerplate we don't need), cached for 5 minutes (same pattern as the now-unused `fetchInitialContext`). Measured: the raw instructions text is ~360 tokens — small next to the successful live runs already observed using ~6000–8000 tokens total. This restores "edit in Studio, no code deploy" without reintroducing the token blowout, and removes the duplication between the Context document and the hand-written schema notes in the system prompt (the system prompt keeps only the *procedural* steps; the *data facts* live in one place again — the Context document).
- **System prompt** (`lib/search.ts`): per shape-your-agent,
  - Add one short **Voice** line — there's currently zero guidance on the tone of the one user-facing field (`reply`), a real, nameable gap (the cut test passes: a learner will see this text).
  - Fix the one factual inaccuracy it duplicates today ("chunks... often empty for now" → chunks is currently *always* empty, not "often" — matters because it tells the model not to bother expecting transcript hits right now).
  - Drop the schema notes the system prompt currently hand-writes (lesson/video/course field shapes) now that the Context document's real instructions are injected instead — avoids maintaining the same facts in two places, per dial-your-context's own "never duplicate" rule.
  - Everything else (job steps, ranking rules, budget discipline, grounding boundary) already reads as concrete and triggered — keeping it.

## Files expected to touch

- Sanity content: `sanity.agentContext` document at slug `search` (edited via a temporary write-token script, per the same one-off pattern used earlier this session — not a repo file).
- `lib/sanity-context.ts` — new small cached fetcher for just the raw `instructions` field (replacing the unused `fetchInitialContext`, which pulled the much larger full payload).
- `lib/search.ts` — inject the fetched instructions into the system prompt; drop the now-redundant hand-written schema notes; add the Voice line; fix the chunks-accuracy line.
- `prompts/search.md` — addendum note explaining the Context document is reconnected (supersedes the earlier "instructions unused" note).

## Security considerations

- No secrets involved; the fetch uses the existing server-only read token, same as every other content query.
- The Context document is still never reachable through the client-facing MCP tool (groqFilter excludes it) — this new fetch goes through the app's own server-only Sanity client, not through anything exposed to the model as a callable tool.

## Acceptance criteria

- Live search still returns grounded, real results within Groq's free-tier budget (no regression from the added ~360 tokens — reverify against the same query that worked last time).
- Editing the Context document's `instructions` in Studio and re-running a search (after the 5-minute cache window) changes agent behavior without a code deploy.
- The three corrected facts (duration format, poster/thumbnail, chunks) read accurately in both the Context document and nowhere stale in the system prompt.

## Checks to run

- `npx tsc --noEmit`, `npm run build`.
- Live: re-run the same `"caching and revalidation"` query used in the last verification pass and confirm it still resolves a real chapter match within budget.

## Manual test steps

1. `curl -X POST localhost:3000/api/search -d '{"query":"caching and revalidation"}'` — confirm real, grounded results, same as before.
2. Edit the Context document's `instructions` in Sanity Studio (small, obviously-visible change), wait 5 minutes, re-run the same query, confirm the change is reflected in agent behavior (e.g., add a temporary rule and watch it take effect).
3. Revert the temporary test edit.
