# Catalog page ("All courses")

## Goal

Build `/catalog` matching `design/biblion-catalog.png`, wired to real Sanity content: all courses, real categories as filter pills, a working sort control, and a "Continue learning" strip using the same static/mock progress treatment already approved for the course page.

## Skills and docs read

- `AGENTS.md` sections 3, 5, 6, 7, 8, 13.
- Prior work in this repo: `prompts/course-page.md` (established precedent for the mock-progress panel, added `rating`/`ratingCount`/`tags` to the course schema, the `poster`/`thumbnail` and duration-type data drift, and the shared `Header`/`Footer`).

## Code inspected

- `sanity/lib/queries.ts` — `COURSES_QUERY`/`getCourses()` already returns all courses via `COURSE_CARD_PROJECTION` (title, slug, summary, coverImage, level, price, popular, studentCount, rating, ratingCount, tags, instructor, category, `_updatedAt`). No lesson/module data on the list query today.
- `sanity/lib/queries.ts` — `getCategories()` / `CATEGORIES_QUERY` already exists and returns real categories.
- Live dataset check (via a throwaway script against `SANITY_API_READ_TOKEN`): **10 courses**, categories are **AI Engineering, Backend & Infrastructure, Data, Languages, Security, Web Development** — different set/count than the design's mockup ("24 courses"; Web Development/Design/Data & AI/CMS & Content/Career). The page will render whatever the dataset actually has, per the grounded-data principle already applied on the course page.
- `lib/mock-progress.ts` — `computeMockProgress(course: CourseDetail)` from the course-page work; reused here for the "Continue learning" strip instead of inventing a second mock system.
- `lib/duration.ts` — `toSeconds`/`formatClock`/`formatDurationTotal`, reused for per-card lesson-count/duration.
- `components/ui/{SearchField,Badge,ProgressBar}.tsx`, `components/layout/{Header,Footer}.tsx`, `components/icons.tsx` — reused as-is; `SearchField`'s shortcut hint is hardcoded to `"/"`, needs a label override for `⌘K`.
- `studio/schemaTypes/documents/course.ts` — no course "code" field (e.g. "NEXT-007") exists; every catalog card in the design prominently shows one.

## Decisions and assumptions

1. **Course code**: adding a small `code` field (string, e.g. "NEXT-007") to `course.ts` — same reasoning as the `rating`/`tags` additions on the course page: a genuine, small marketing field the design needs, not fabricated per-render. If left blank on a course, the card just omits that line.
2. **"NEW" badge**: not a stored flag. Derived from `_updatedAt`/`_createdAt`: courses created in the last 60 days show "New" — same treatment as "Popular" (`course.popular`), just computed instead of authored. Adding `_createdAt` to `COURSE_CARD_PROJECTION` (a free Sanity system field).
3. **Per-card lesson count / total duration / "Intro" duration**: `COURSES_QUERY` gets one extra lightweight field, `"lessonDurations": modules[].lessons[]->duration` (durations only, not full lesson docs) so the list query stays cheap. The card sums/counts these for "N LESSONS · Xh Ym", and uses the first one for the "Intro · duration" row instead of a fabricated "02:14".
4. **Card header color**: the design's dark header blocks are flat solid colors, not photos (unlike the course page's video-preview card or the homepage's lesson thumbnails) — no `coverImage` bleed-through anywhere in the reference. Reproducing that: a small fixed rotating palette (near-black, maroon, warm dark-gray, rust) assigned by the course's position in the (rendered) list, purely decorative chrome, same spirit as a card-color rotation — not a data claim.
5. **Whole card is one `<Link>`** to `/courses/[slug]`. The design's "Intro · duration" row and the enrolled row's "Resume →" therefore render as plain text/icons, not nested links (a link can't nest inside a link) — the real, clickable Resume affordance lives on the course page itself (already built). The two standalone "Continue learning" cards above the grid are not full-card links, so their "Resume" button is a real link there.
6. **"Continue learning" / enrolled state (mock progress, same as course page)**: no progress backend exists yet. Reusing the already-approved pattern: pick the first 2 courses from `getCourses()`, fetch each one's full detail (`getCourseBySlug`) and run the existing `computeMockProgress`, and use that both for the two "Continue learning" cards and to flip the matching grid cards into their "ENROLLED" row instead of price/lesson-count. If the catalog has fewer than 2 courses the strip just shows fewer cards; if a course has only 1 lesson (no valid resume position) it's skipped from the enrolled set.
7. **Category filter pills + sort control are real, client-side, and scoped to "catalog," not "search"**: filtering/sorting the already-fetched course list is core catalog functionality (AGENTS.md section 1 lists "the catalog" as in-scope), distinct from the search feature (section 11), so it's fine to build now. Sort options: Most Popular (`studentCount` desc, default — matches the design's default label), Highest Rated (`rating` desc, nulls last), Price: Low to High, Newest (`_createdAt` desc). "All courses" is a client-only sentinel, not a real category.
8. **Search bar**: the design's "Search every lesson, chapter, and moment..." box is the future search feature's entry point (section 11), not a course-title filter. It's a plain `<form method="get" action="/search">` with a named `q` input — no JS, submits to `/search` (not built yet, same 404-for-now pattern as `/lessons/[slug]`). The `⌘K` hint is decorative only, matching the landing page's existing (non-functional) `/` hint — adding a `shortcutLabel` prop to `SearchField` to render it instead of hardcoding a second copy of the hint markup.
9. **Rating count formatting** ("3.2K"): `Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })`, no hand-rolled formatter.
10. **"24 COURSES" header stat**: total unfiltered course count, server-rendered once, doesn't live-update as pills/sort change (it describes the catalog, not the current view).

## Files expected to touch/create

Create:
- `app/catalog/page.tsx` (Server Component: fetches courses, categories, and the 2 enrolled-demo course details/progress)
- `components/catalog/CatalogExplorer.tsx` (client: category pills, sort dropdown, grid — owns the only interactive state on this page)
- `components/catalog/CourseCard.tsx` (grid card)
- `components/catalog/ContinueLearningCard.tsx`

Modify:
- `studio/schemaTypes/documents/course.ts` — add `code` field.
- `sanity/lib/queries.ts` — add `_createdAt` to `COURSE_CARD_PROJECTION`; add `lessonDurations` to `COURSES_QUERY`; update `CourseCard` type.
- `components/ui/SearchField.tsx` — add optional `shortcutLabel` (default `"/"`).
- `components/layout/Header.tsx` — bold/active state for the "Catalog" nav link (it's already a real `<Link href="/catalog">`; just needs the active-state styling this design shows).

## Requirements

- Server Component page; `CatalogExplorer` is the one client component (category/sort state only — no writes, no fetches).
- Reuse `Badge`, `ProgressBar`, `SearchField`, icons, and existing Tailwind tokens; no new colors/radii/fonts.
- Responsive: pills row scrolls horizontally on mobile instead of wrapping into a mess; "Continue learning" cards stack to one column; grid goes 3 → 2 → 1 columns.
- No client-side Sanity access or token exposure.

## Security considerations

- All Sanity reads stay server-side in `app/catalog/page.tsx` / `sanity/lib/*`.
- The mock progress computation reads no per-user data and requires no auth — same as the course page.

## Acceptance criteria

- `/catalog` renders all real seeded courses (10 today) with real title, code (if set), category, level, instructor, rating (if set), price, lesson count, and total duration.
- Category pills reflect the real 6 categories in this dataset; selecting one filters the grid; "All courses" resets it.
- Sort control reorders the grid across all four options without a page reload.
- The 2 "Continue learning" cards and their matching grid cards' enrolled rows show consistent course/lesson labels and percentages.
- Search box submits to `/search?q=...` (expected 404 for now).
- Mobile (375px): no horizontal page scroll; pills scroll horizontally; grid and continue-learning cards stack.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.

## Checks to run

- Web root: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Studio: additive schema field only, no migration needed.

## Manual test steps

1. `npm run dev`, visit `/catalog`.
2. Compare against `design/biblion-catalog.png` at 1440px (accepting the real category/course-count/color differences called out above).
3. Click through each category pill and the sort control; confirm the grid updates.
4. Resize to 375px; confirm no horizontal scroll and sensible stacking.
5. Click a course card → lands on `/courses/[slug]`; click the "Continue learning" Resume button → lands on `/lessons/[slug]?start=...`.
6. Submit the search box → navigates to `/search?q=...` (404 expected, not built yet).
