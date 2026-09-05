# PostHog tracking for search and lesson-playback features

## Goal

Instrument the features built since the basic PostHog setup (AGENTS.md section 7's analytics list, items already partially covered for catalog/course engagement but not yet for search or lesson playback):

- Search performed (with the query)
- Search result opened (with result type)
- Video played
- Watch depth
- Resume used
- Lesson completed

Follow PostHog's Next.js conventions (snake_case event names, capture server-side for server-side actions, `posthog-node` with an explicit `flush()` since this isn't a long-lived server) and this project's existing convention (`lib/posthog-server.ts`, `instrumentation-client.ts`, `posthog.identify(user.id, ...)` in `components/auth/NavAuth.tsx`). Track no personally identifying content beyond the Clerk user id PostHog already has from `identify()` — event properties stay structural (slugs, counts, percentages, the query text itself, which is a content-interest signal, not personal data).

## Skills / docs read

- Existing PostHog wiring: `instrumentation-client.ts`, `lib/posthog-server.ts`, and every current `posthog.capture(...)` call site (`components/auth/NavAuth.tsx`, `components/catalog/CatalogExplorer.tsx`, `components/catalog/CatalogSearchForm.tsx`, `components/catalog/ContinueLearningCard.tsx`, `components/course/EnrollmentCard.tsx`, `components/ui/CtaButton.tsx`, `app/courses/[slug]/page.tsx`).
- AGENTS.md section 7 (analytics moments to instrument) and section 5 (PostHog boundary: public key in the browser, private key server-only).
- YouTube IFrame Player API (`https://developers.google.com/youtube/iframe_api_reference`) — the only way to observe play/pause/time-update events on the provider's own embed without building a custom player (AGENTS.md section 7 forbids a custom player; listening to the existing iframe via the provider's own JS API is explicitly still "the provider's own embed").

## Code inspected

- `lib/search.ts` — `runSearch()` is the single chokepoint for every search execution: called both by `app/search/page.tsx` (the only UI entry point users actually hit) and `app/api/search/route.ts` (unused by any UI today, but a real execution path). Instrumenting here, once, covers the catalog quick-search box, direct `/search?q=` visits, and result-page re-searches — no client-side duplication needed.
- `components/catalog/CatalogSearchForm.tsx` — already fires a client-side `search_performed` with `query_length` on submit, before the actual search runs. This predates the real search feature and only approximates intent. Replacing it with the authoritative server-side event (fired after `runSearch` actually has real results) avoids a duplicate event name with two incompatible schemas and avoids double counting the same search.
- `components/course/EnrollmentCard.tsx` (`lesson_resumed`) and `components/catalog/ContinueLearningCard.tsx` (`continue_learning_clicked`) — both already fire on what is functionally the same action (clicking a resume link built from mock progress's `resumeSeconds`), just from two different surfaces, under two different event names. Consolidating into one canonical `resume_used` event (with a `surface` property) matches PostHog's one-event-one-meaning convention and is what "resume used" in the request maps to — no new mechanism needed, just a rename plus a shared property.
- `components/lesson/VideoEmbed.tsx` / `lib/video-provider.ts` — the video is a bare provider iframe with no playback visibility today. Every seeded lesson is YouTube (per the code's own comment); Vimeo/Bunny are embed-only stubs with no real content to exercise them. Video-play and watch-depth tracking will only be wired for YouTube; Vimeo/Bunny embeds won't emit these events yet (flagged below).
- `components/lesson/MarkCompleteButton.tsx` / `components/lesson/LessonProgressContext.tsx` — "mark complete" is local-only UI state (no progress backend exists yet, by an earlier, explicit decision). `lesson_completed` fires on the click that flips local state to completed — a real user action worth tracking regardless of backend persistence. The context doesn't currently carry the lesson slug; adding it is required to put `lesson_slug` on the event.
- `app/lessons/[slug]/page.tsx` — already has `lesson.slug` and passes `startSeconds` to `VideoEmbed`; both needed as event properties.
- No page currently resolves the Clerk user id server-side (`app/courses/[slug]/page.tsx`'s existing `course_viewed` capture hardcodes `distinctId: "anonymous"`). The new server-side `search_performed` event will resolve the real signed-in user id via `auth()` from `@clerk/nextjs/server` when available, matching the same id PostHog already has from the client's `identify()` call, and fall back to the same `"anonymous"` literal otherwise — the existing convention, not a new one.

## Decisions

- **Event names** (snake_case, verb_object, matching existing `course_viewed`/`lesson_started`/`lesson_resumed` style):
  - `search_performed` — server-side, in `runSearch()`.
  - `search_result_opened` — client-side, on a result card click.
  - `video_played` — client-side, first real YouTube "playing" state per page load.
  - `video_watch_depth` — client-side, one event per 25/50/75/100% milestone crossed, deduped per page load.
  - `resume_used` — client-side, replacing `lesson_resumed` and `continue_learning_clicked`.
  - `lesson_completed` — client-side, on the mark-complete toggle turning on (not off).
- **Properties** (all structural — slugs, counts, percentages, provider names, the search query text itself):
  - `search_performed`: `query`, `query_length`, `result_count`, `lesson_result_count`, `moment_result_count`, `course_count`.
  - `search_result_opened`: `result_type` (`"lesson" | "video"`), `query`, `position` (1-based rank in the list), `lesson_slug`, `matched_second` (video results only).
  - `video_played`: `lesson_slug`, `provider`, `start_seconds` (nonzero if the page loaded with a resume/moment offset).
  - `video_watch_depth`: `lesson_slug`, `provider`, `depth_percent` (25 | 50 | 75 | 100).
  - `resume_used`: `lesson_slug`, `resume_seconds`, `progress_percent`, `surface` (`"course_page" | "catalog_continue_card"`).
  - `lesson_completed`: `lesson_slug`.
- **Server vs. client capture**: `search_performed` is server-side (`posthog-node` via `getPostHogClient()`, with `await posthog.flush()` since this is a short-lived request, matching `app/courses/[slug]/page.tsx`'s existing pattern). Everything else fires where the user action actually happens — in the browser — via `posthog-js`, matching every other existing `capture()` call site.
- **Distinct id server-side**: resolve `const { userId } = await auth()` (`@clerk/nextjs/server`); use it as `distinctId` when signed in, else `"anonymous"` (existing convention). No email, name, or other profile data is added — PostHog already has that from the client's `identify()` call.
- **YouTube playback tracking**: add `enablejsapi=1` and `origin` to the YouTube embed URL in `lib/video-provider.ts` (Vimeo/Bunny untouched). Convert `VideoEmbed.tsx` to a client component that lazy-loads `https://www.youtube.com/iframe_api`, attaches a `YT.Player` to the existing iframe, and on `onStateChange`:
  - first transition into `PLAYING` → capture `video_played` once per mount.
  - while playing, poll `getCurrentTime()`/`getDuration()` (every 5s) and capture `video_watch_depth` the first time each of 25/50/75/100% is crossed (a `Set` of already-fired thresholds, reset per mount/video).
  - clear the poll interval on pause/end/unmount.
  - This is instrumentation on the provider's own player, not a custom player — no controls are replaced, per AGENTS.md section 7.
- **`lesson_completed` and lesson slug plumbing**: add a `lessonSlug` prop to `LessonProgressProvider` (set from `app/lessons/[slug]/page.tsx`), exposed through `useLessonProgress()` so `MarkCompleteButton` can include it without new prop drilling through `LessonHero`.
- **Removed/renamed events** (explicit, so nothing looks silently dropped): `search_performed` in `CatalogSearchForm.tsx` is removed (superseded by the server-side one). `lesson_resumed` (`EnrollmentCard.tsx`) and `continue_learning_clicked` (`ContinueLearningCard.tsx`) are renamed to `resume_used` with a `surface` property. `lesson_started` (`EnrollmentCard.tsx`, starting a course from lesson 1 — not a resume) is untouched; it's outside this request's scope.

## Files expected to touch

- `lib/search.ts` — server-side `search_performed` capture inside `runSearch()`.
- `components/catalog/CatalogSearchForm.tsx` — remove the premature client-side `search_performed`.
- `components/search/LessonResultCard.tsx`, `components/search/VideoResultCard.tsx` — `search_result_opened` on click.
- `components/course/EnrollmentCard.tsx`, `components/catalog/ContinueLearningCard.tsx` — rename to `resume_used` with `surface`.
- `components/lesson/LessonProgressContext.tsx` — add `lessonSlug` to context.
- `app/lessons/[slug]/page.tsx` — pass `lesson.slug` into `LessonProgressProvider`; pass `lesson.slug` into `VideoEmbed`.
- `components/lesson/MarkCompleteButton.tsx` — `lesson_completed` on completing.
- `components/lesson/VideoEmbed.tsx` — convert to client component; YouTube IFrame API wiring for `video_played`/`video_watch_depth`.
- `lib/video-provider.ts` — add `enablejsapi=1`/`origin` to the YouTube embed URL.

## Security / privacy considerations

- No email, name, IP, or free-text user content is ever added to an event property — only slugs, counts, percentages, provider names, and the search query text (a content-interest signal about the catalog, not the person).
- Server-side capture uses the Clerk user id already known to PostHog from the client `identify()` call — no new identifier is introduced.
- No secrets or tokens touch any event property.

## Acceptance criteria

- Submitting a search (from the catalog box, `/search?q=`, or a re-search on the results page) fires exactly one `search_performed`, server-side, with a real query and result counts — never twice, never client-side.
- Clicking any result card fires `search_result_opened` with the correct `result_type` and `position`.
- Playing a YouTube lesson video fires one `video_played`, then one `video_watch_depth` per milestone actually crossed (never more than four, never before the milestone is reached).
- Clicking any resume link (course page or catalog) fires `resume_used` with the correct `surface`.
- Clicking "Mark complete" fires `lesson_completed` once; un-marking does not fire an event.
- No event contains email, name, or free-text notes/content.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass.

## Checks to run

- Web root: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Manual test steps

1. `npm run dev`, open the PostHog Activity/Live events view (or console `debug: true` output) in another tab.
2. From `/catalog`, submit a real query in the search box → confirm one `search_performed` appears (server-side, real `query`/`result_count`), and confirm the old client-side one no longer fires.
3. On the results page, click a lesson card and a video/moment card → confirm two `search_result_opened` events with the right `result_type` and `position`.
4. Open a lesson with a YouTube video, press play, and let it run past a couple of watch-depth milestones (seeking forward is fine for testing) → confirm `video_played` once and `video_watch_depth` events at the crossed milestones only.
5. From the catalog's "Continue learning" card and from a course page's "Resume" button, click each → confirm both fire `resume_used` with `surface` set to `"catalog_continue_card"` and `"course_page"` respectively.
6. On a lesson page, click "Mark complete" → confirm `lesson_completed` fires with the right `lesson_slug`; click it again to un-mark → confirm no event fires.
