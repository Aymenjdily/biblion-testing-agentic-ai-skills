# Offline video ingestion pipeline

## Goal

Build the `video` document type and the offline ingestion script that populates it from the real YouTube videos already in `seed/videos.json` — chapters now, transcript chunks deferred (see findings below) — and wire the new data into search so video-moment results can start appearing.

## Skills and docs read

- `AGENTS.md` sections 5, 6, 8 (video document shape), 9 (ingestion pipeline), 11 (two-stage chapter-then-transcript matching), 13.
- Prior work: `prompts/search.md` (the search agent currently assumes no video data exists at all — that assumption needs updating).

## Investigation and hard findings

1. **Chapters are reliably extractable, transcripts are not — verified directly, not assumed.** Tested four independent methods against real videos (a direct scrape of the watch page's caption track URL, the same with session cookies, a real headless-browser session, and the maintained `youtubei.js` library's dedicated transcript API): all four returned an empty body or a 400 error, for both auto-generated and manually-uploaded caption tracks. This points to YouTube having tightened anti-bot restrictions on unauthenticated caption access, not something fixable with a different scraping trick.
2. **Chapters, by contrast, work cleanly and need no auth**: fetching a video's public watch page and parsing `ytInitialPlayerResponse.videoDetails.shortDescription` for YouTube's own chapter-timestamp convention (lines like `0:00 Introduction`) is reliable — spot-checked across 6 real videos from the seed data, 4 of 6 had parseable chapters (0, 3, 7, and 24 chapters respectively), 2 had none. That's an expected, healthy real-world hit rate, not a bug — some videos just don't have chapters.
3. **Decision already made with you**: ship chapters now, leave `chunks` as an empty array for every video for now. Search can match by chapter (real, grounded); transcript-level fallback matching won't fire until a working transcript source exists. Revisit later if you want to pursue audio transcription (Whisper) or another source — that's a separate, heavier piece of work (audio download, transcription cost/time, its own ToS considerations) and not part of this prompt.
4. **Only YouTube needs to be supported.** Every video in `seed/videos.json` (all 120, one per lesson) is a YouTube URL; Vimeo/Bunny have no content and no ingestion case to build (per AGENTS.md section 9: "Do not treat a provider as supported until both ingestion and playback exist for it").
5. **No lesson schema change needed.** Per AGENTS.md section 8, "Lessons link to them by video URL" — the video document is looked up by matching `video.url` (or the derived `id`) against the lesson's existing `videoUrl` field at query time, not a reference field.

## Decisions and assumptions

1. **New schema type**: `studio/schemaTypes/documents/video.ts` — `id` (string, the YouTube video id), `url` (url), `chapters` (array of `{startSeconds: number, label: string}` objects), `chunks` (array of `{startSeconds: number, text: string}` objects, empty for every document from this ingestion run). Registered in `studio/schemaTypes/index.ts`. This is a genuine internal lookup type — per AGENTS.md section 7, "Treat these documents as an internal lookup and never show them to the user as results" — so no `preview` polish needed beyond the basics, and it's not added to the search Context filter's *displayable* types conceptually, only queryable so the agent can look up chapters (the filter change in decision 4 below is what makes that possible).
2. **Ingestion script**: `scripts/ingest-videos.mjs`, run manually (`node scripts/ingest-videos.mjs`), not part of the request path, not scheduled. For each entry in `seed/videos.json`:
   - Fetch `https://www.youtube.com/watch?v=<id>` (no API key — public page).
   - Extract `ytInitialPlayerResponse.videoDetails.shortDescription`.
   - Parse chapters: lines matching `<timestamp> <label>`, timestamp as `M:SS`, `MM:SS`, or `H:MM:SS`. Discard the whole set unless there are 2+ matches (YouTube's own minimum for chapters to be meaningful) and enforce strictly increasing `startSeconds` (drop any line that doesn't increase past the previous one — guards against the false-positive duplicate timestamps seen in testing, e.g. a repeated "0:00").
   - Build `_id: `video.${id}``, `id`, `url` (the canonical `https://www.youtube.com/watch?v=<id>` form), `chapters`, `chunks: []`.
   - `createOrReplace` via a one-off write token (same pattern as the search Context document: `npx sanity tokens add ... --role=editor`, used once, deleted after the run).
   - Per-video error handling: log and skip on failure (network error, unparseable response) rather than aborting the whole batch — safe to re-run, idempotent.
   - A small delay between requests (a few hundred ms) to stay reasonable about request volume against a public page.
3. **Search wiring updates** (making the new data actually reachable):
   - The Context document's `groqFilter` gains `"video"`: `_type in ["course", "lesson", "instructor", "category", "video"]`.
   - The Context document's `instructions` gets a new bullet replacing the old "no video document type" claim: how to look up a lesson's video doc (`*[_type == "video" && url == ^.videoUrl][0]`), and the real two-stage rule — match chapters first; `chunks` is currently empty for every video, so transcript-level matching won't return anything yet (not an error, just no data).
   - `lib/search.ts`'s inline system prompt gets the same correction — it currently tells the model flatly "there is no video document type"; that's now false and needs updating to the real, current state (chapters queryable, chunks empty).
4. **No lesson-page UI changes.** A chapters list/table-of-contents on the lesson page would be a real, reasonable follow-up now that this data exists, but it's not part of what was asked here — flagging it as a natural next step rather than building it unprompted.
5. **Scope check against "grounded"**: a video-kind search result is only ever valid when it's backed by a real chapter's `startSeconds` — `lib/search.ts`'s existing resolution step (re-fetching from Sanity, dropping anything not real) already enforces this structurally; this prompt doesn't need to change that mechanism, only give the agent real chapter data to work with and correct its instructions about what exists.

## Files to create

- `studio/schemaTypes/documents/video.ts`
- `scripts/ingest-videos.mjs`

## Files to modify

- `studio/schemaTypes/index.ts` — register `video`.
- `lib/search.ts` — system prompt correction (decision 3).
- The Context document (`sanity.agentContext` at slug `search`) — `groqFilter` and `instructions`, written via the same one-off write-token script pattern used for its initial creation (not a code file, a content update).

## Requirements

- The ingestion script is never imported by the Next.js app and never runs in the request path.
- Idempotent — safe to re-run; `createOrReplace` keyed by a stable `_id`.
- Per-video failures don't stop the batch.
- No new fields on the `lesson` schema.

## Security considerations

- The one-off write token is used only for the duration of the ingestion run and the Context-document update, then deleted (same as the earlier search setup) — never stored in `.env`.
- The script itself needs no secrets besides that temporary write token; the YouTube fetch is a plain public HTTP request.

## Acceptance criteria

- Running the script populates real `video` documents for the videos that have parseable chapters (expect roughly half, per the sample) and creates a document with an empty `chapters` array for the rest (still useful as a stable lookup target, just no chapter data yet).
- `*[_type == "video"]` in Sanity returns real, non-fabricated chapter data matching what's actually in each video's description.
- The search agent can now find and use a lesson's video document; asking about a topic that's covered as a real chapter (based on a manually inspected example) returns a `video`-kind result with a real `matchedSecond` matching that chapter's actual timestamp — verified once billing/credits allow a live run (per the earlier billing blocker).
- Lessons whose videos have no chapters continue to work exactly as before (lesson-kind results only) — no regression.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.

## Checks to run

- Web root: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Studio: no migration needed (new document type only, additive).
- Manually spot-check a handful of created `video` documents' chapters against the actual video descriptions.

## Manual test steps

1. `node scripts/ingest-videos.mjs` — watch the log for per-video success/skip, confirm it completes without aborting.
2. In Sanity (via a quick query or Vision), confirm `count(*[_type == "video"])` == 120 and spot-check 2-3 documents' `chapters` against the real video's description on YouTube.
3. Re-run the script — confirm it's a no-op update (idempotent), not duplicate documents.
4. Once OpenAI billing is sorted, run a search for a topic you've confirmed is a real chapter in one of the ingested videos — confirm a video-kind result with the correct `matchedSecond`.
5. Run a search for a lesson that has no chapters — confirm it still returns a normal lesson-kind result, unaffected.
