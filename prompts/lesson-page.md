# Lesson page

## Goal

Build `/lessons/[slug]` matching `design/biblion-lesson.png`, wired to real Sanity content, with the lesson's video actually playing on the page through a provider embed (per AGENTS.md section 7 — no custom player).

## Skills and docs read

- `AGENTS.md` sections 3, 5, 6, 7 ("Playback stays on the site through a provider embed... Do not build a custom player"), 8 (data shape), 9 (video ingestion is separate offline tooling, not built yet), 13.
- Prior work: `prompts/course-page.md` and `prompts/catalog-page.md` — established the mock-progress pattern, the `poster`/`thumbnail` and `duration` string/number data drift, and the shared `Header`/`Footer`/`Avatar` components.

## Code inspected

- `sanity/lib/queries.ts` — `getLessonBySlug` already returns the lesson (title, videoUrl, poster, duration, freePreview, studentCount, notes, keyPoints, proTip, resources) plus a derived `context` (courseTitle, courseSlug, moduleIndex, moduleTitle, lessonIndex) via a reverse reference to the course. `getCourseBySlug` already returns the full course with modules→lessons (real `_id`, title, slug, duration, freePreview, resourceCount) — reusing this instead of re-deriving sibling-lesson data.
- `lib/mock-progress.ts` (`flattenLessons`, `computeMockProgress`) — reused, plus one new function for this page (see decisions).
- `lib/duration.ts` (`toSeconds`, `formatClock`, `formatDurationTotal`), `lib/plain-text.ts` — reused.
- `studio/schemaTypes/documents/lesson.ts` — confirms current fields; no video/chapter/transcript document type exists anywhere in the schema (section 9's ingestion pipeline hasn't been built).
- Live dataset checks: every lesson's `resources[].type` is `"link"` (no article/download/code in practice); `proTip` is populated on some lessons, null on others; `notes` is real Portable Text (paragraphs, an h2, bullet lists) — no code-block content anywhere, since the schema's `notes` field doesn't register a custom code-block type; `videoUrl` is a YouTube `watch?v=` URL on every seeded lesson (no Vimeo/Bunny content exists yet).
- `package.json` — `@portabletext/react` is not installed yet, despite being in AGENTS.md's approved tech stack (section 6) for exactly this (`notes`). Adding it.
- `components/course/CourseContent.tsx`, `components/ui/{Badge,ProgressBar,Avatar}.tsx`, `components/layout/{Header,Footer}.tsx` — reused patterns/components.

## Decisions and assumptions

1. **No custom player, no chapters/transcript UI**: the design's dark player shows a custom scrubber, a "CHAPTER 3" overlay label, a chapters-list icon, and a "Transcript" tab with real text. None of that data exists — video documents with chapters/transcript chunks are explicitly separate, not-yet-built offline tooling (AGENTS.md section 9), and AGENTS.md section 7 forbids a custom player outright. So: the video area is the provider's own YouTube iframe (native controls, thumbnail, play button — not the mockup's custom dark transport bar), sized/rounded to match the layout. The "Transcript" tab renders a real, honest empty state ("Transcript isn't available for this lesson yet.") instead of fabricated text. No chapter overlay, no "CHAPTERS ON" toggle.
2. **Resume position**: `?start=<seconds>` (the query param every existing Resume link already produces, from the course/catalog pages) is read from `searchParams` and passed to the YouTube embed's `start` parameter, so playback genuinely starts there. A small real text line ("Resuming from 4:12") shows above the player when `start > 0` — plain page copy, not custom player chrome.
3. **Provider embed utility**: `lib/video-provider.ts` parses `videoUrl` and returns an embeddable URL for YouTube (`youtube.com/watch?v=`, `youtu.be/`, already-embed URLs) and best-effort support for Vimeo and Bunny per AGENTS.md section 5's three supported providers — Vimeo/Bunny are implemented but unexercised by current seed content (all of it is YouTube). Anything unrecognized falls back to a plain "Watch on [host]" link instead of an embed.
4. **"English captions" / instructor subtitle**: no captions data and no instructor "role" field exist (same call already made on the course page for the latter). Both are omitted rather than fabricated. The meta row keeps duration and learner count, both real.
5. **Resources tab**: real `resources` array, each `type` value (`link`, or `article`/`download`/`code` if ever authored) shown as its real uppercase label with a matching icon — not the mockup's fabricated "DOC"/"REPO" labels, since those values don't exist in the schema or data.
6. **"Mark complete"**: no progress backend exists yet (learner progress tracking is a separate AGENTS.md section 1 deliverable). Same treatment as the course page's static enrollment panel: a real client-side toggle with no persistence — clicking it flips the current lesson's sidebar row to a checkmark and bumps the displayed percent for this page view only (resets on reload). No server route, no write.
7. **Sidebar/module progress is relative to the lesson being viewed**, not the independent random mock-position used on the course/catalog pages: every lesson before the current one (in flattened module/lesson order) shows completed, the current one is the active/highlighted row, everything after is upcoming. This is a more honest mock for a lesson page than reusing `computeMockProgress`'s unrelated resume pick. New function `computeLessonProgress(course, lessonId)` added to `lib/mock-progress.ts` alongside the existing one (which stays as-is for the course/catalog pages).
8. **Sidebar module list**: only the current lesson's module is expanded by default; other modules are collapsed showing an "N/total" count, expandable on click — same interaction pattern as `CourseContent`'s "Show all modules", reused as a new small client component rather than duplicating `CourseContent` itself (different row/card shape: narrower rail, no free-preview badges, no durations-total header).
9. **Prev/next lesson nav**: the breadcrumb's compact `← 2.2 / 2.4 →` and the header's "Next lesson →" button, and the sidebar's "Up next" card, are all derived from the real flattened lesson order of the already-fetched course (previous/next `_id` before/after the current one). Hidden/disabled at the start or end of the course.
10. **Route**: `app/lessons/[slug]/page.tsx`, Server Component. Fetches `getLessonBySlug(slug)`, 404s if null or if it has no resolvable course context; then fetches `getCourseBySlug(context.courseSlug)` for the full module/lesson list. `generateStaticParams` from a new `getLessonSlugs()` (mirrors `getCourseSlugs()`).
11. **Free preview / access**: per AGENTS.md section 7, "Free preview is a label, not access control" — the page plays every lesson's video regardless of `freePreview`; that flag is just shown as a badge where relevant (sidebar rows), consistent with the course page.

## Files expected to touch/create

Create:
- `app/lessons/[slug]/page.tsx`
- `components/lesson/LessonHero.tsx` (breadcrumb, title, meta, instructor, mark-complete/next-lesson actions)
- `components/lesson/VideoEmbed.tsx` (provider iframe, resume text)
- `components/lesson/LessonTabs.tsx` (client: Lesson notes / Resources / Transcript tab switcher)
- `components/lesson/LessonSidebar.tsx` (client: up-next card + module/lesson accordion, owns the "Mark complete" local state so the sidebar and header button stay in sync)
- `lib/video-provider.ts`

Modify:
- `package.json` — add `@portabletext/react`.
- `sanity/lib/queries.ts` — add `LESSON_SLUGS_QUERY`/`getLessonSlugs()`.
- `lib/mock-progress.ts` — add `computeLessonProgress(course, lessonId)`.

## Requirements

- Server Component page; only the tabs and the sidebar (which owns the mark-complete toggle) are client components.
- No client-side Sanity access or token exposure.
- Video plays via the provider's real embed (iframe), never a custom-built player; `start` seconds honored when present.
- Portable Text `notes` rendered with `@portabletext/react` (headings, paragraphs, bullet lists at minimum — whatever block types the content actually uses).
- Reuse `Badge`, `ProgressBar`, `Avatar`, icons, and existing Tailwind tokens; no new colors/radii/fonts.
- Responsive: two-column layout (content + sidebar) stacks to one column on mobile; tabs remain usable; sidebar module list collapses sensibly.

## Security considerations

- All Sanity reads stay server-side in the page component / `sanity/lib/*`.
- The mark-complete toggle and progress display are local UI state only — no writes, no auth surface.
- The video embed only ever renders the provider's own iframe URL derived from the stored `videoUrl` — no user input is interpolated into it (the only variable part, `start`, is validated as a non-negative integer before use).

## Acceptance criteria

- Visiting a real seeded lesson (e.g. `/lessons/nextjs-app-router-in-depth-server-components`) renders real title, breadcrumb (course/module), duration, learner count, instructor, notes (rendered Portable Text), key points, pro tip (when present), and real resources.
- The YouTube video actually plays and, when visited with `?start=120`, starts at 2:00.
- Prev/next lesson controls and the sidebar's "Up next" card navigate to real sibling lessons; they're absent/disabled at the course's first/last lesson.
- Sidebar shows the current lesson highlighted, prior lessons checked, later lessons upcoming, and updates when "Mark complete" is clicked (no persistence across reload).
- Mobile (375px): no horizontal scroll; layout stacks; tabs and sidebar remain usable.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.

## Checks to run

- Web root: `npm install` (new dependency), `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Manual test steps

1. `npm run dev`, visit `/courses/nextjs-app-router-in-depth`, click any lesson row — lands on the real lesson page.
2. Confirm the video loads and plays (YouTube iframe, real content).
3. From the course page's "Resume" link (has a `?start=` param), confirm the lesson opens and starts partway through, with the "Resuming from …" line shown.
4. Click through Lesson notes / Resources / Transcript tabs; confirm notes render real Portable Text and Transcript shows the honest empty state.
5. Click "Mark complete"; confirm the sidebar row updates and the percent bumps, then reload and confirm it resets (no fake persistence).
6. Click prev/next lesson controls and the sidebar's module rows; confirm real navigation.
7. Resize to 375px; confirm no horizontal scroll and sensible stacking.
