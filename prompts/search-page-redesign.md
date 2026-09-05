# Search results page redesign

## Goal

Rebuild `/search` to match `design/biblion-search.png`: a submit button on the search bar, All/Moments/Lessons filter tabs, redesigned result cards (numbered, badge, highlighted description terms, real chapter labels, real per-moment position indicator), a "Refine results" sidebar (type/course/level/clip-length filters), a grounded "No luck?" catalog callout, client-local recent searches, and pagination ("Show all N results").

## Skills and docs read

- `AGENTS.md` sections 6, 7, 11, 13.
- Prior work: `prompts/search.md`, `prompts/video-ingestion.md` — the existing `/search` page, `lib/search.ts`'s grounding architecture, and the video/chapter data now available.

## Code inspected

- Current `app/search/page.tsx`, `components/search/{SearchResultsList,LessonResultCard,VideoResultCard,SearchEmptyState}.tsx`, `lib/search.ts`, `sanity/lib/queries.ts` (`getLessonsByIds`, `LessonSearchResult`).
- Confirmed the aggregate stats the "No luck?" callout needs are real and cheap: `{"courseCount": count(*[_type=="course"]), "momentCount": count(*[_type=="video"].chapters[])}` → currently `{courseCount: 10, momentCount: 471}` in the live dataset. The design's "24 courses and 640+" is just placeholder-mockup numbers; ours will show the real, current counts instead.
- `components/ui/Checkbox.tsx` already exists and fits the sidebar's type/course checkboxes exactly as-is.

## Decisions and assumptions

1. **Chapter labels become real, displayed data.** `getLessonsByIds` currently only returns a flat `validSeconds: number[]` (just enough to verify a claimed timestamp). Extending it to return the lesson's video `chapters` (full `{startSeconds, label}`) and `chunks` (`{startSeconds, text}`), so `lib/search.ts` can attach the *real* matched chapter's label to a video result (e.g. "Chapter · Invalidation strategies") instead of just a number. If a result ever matches a `chunk` instead of a `chapter` (transcript-level, not exercised yet per the video-ingestion prompt), the label falls back to a generic "Transcript" — never a fabricated per-chunk title.
2. **"CLIP" length** on a moment card is the lesson's real total video duration (same value already shown elsewhere as `lesson.duration`) — the design's "clip" is just this card's label for it, not a separate cut-in/cut-out concept we don't have data for.
3. **The mini position bar** under a moment's thumbnail is real: `matchedSecond / totalDurationSeconds`, computed client-side from data already on the result.
4. **Description highlighting** (`revalidateTag("course:next-007")`, `cached data` in orange): the model already writes a one-line `description` grounded in what it found; instructing it to wrap technical terms/code in backticks, then rendering that one line through `react-markdown` (already installed) restricted to inline output (no block wrapping) with a styled `code` renderer. This is real model output, not decoration — if the model doesn't use backticks, the line just renders as plain text.
5. **Filter tabs (All/Moments/Lessons) + the sidebar's TYPE checkboxes are the same filter**, shown twice per the design — one state, two controls, both client-side over the single already-fetched result list (no extra request, same principle as the existing sort control).
6. **Course filter**: checkboxes with real counts, computed from the fetched results (not a separate query) — "Show 3 more" if there are more than 5 courses represented.
7. **Level filter**: needs the course's `level`, which isn't in `getLessonsByIds` today — adding it. Beginner/Intermediate/Advanced pills, multi-select, client-side.
8. **Clip length filter**: "Any / Under 5m / 5–15m / 15m+", client-side against real `lesson.duration`. Applies to both result kinds (a lesson result's underlying video has the same real duration).
9. **Recent searches**: `localStorage`-backed, client-only, per-viewer — same treatment as other per-viewer-only state in this app (no backend, nothing fabricated, just real past queries the same browser actually ran). Capped at 5, most recent first, clicking one navigates to `/search?q=...` for real.
10. **"No luck?" callout** is always shown (not just on empty results, matching the design showing it alongside 28 real results) — a static catalog pointer with the two real aggregate numbers from decision/finding above, refreshed via the existing `getCourses()` plus one new tiny aggregate query.
11. **Pagination**: show the first 8 results, "Show all N results" reveals the rest — same expand pattern already used in `CourseContent`/`CatalogExplorer`.
12. **Explicit "Search" submit button**: `SearchField` currently has no button; adding one inline in the search page's form (a plain submit button styled to match — no `SearchField` API change needed, since the button lives beside it in the form, not inside the component).
13. **Numbered result index** (01, 02, ...) is the position in the current filtered+sorted list, recomputed on every filter/sort change — cosmetic, not a stored fact.

## Files to create

- `components/search/SearchExplorer.tsx` (client) — replaces `SearchResultsList`: owns kind filter, course filter, level filter, clip-length filter, sort, and pagination; renders the tabs row + result cards.
- `components/search/SearchSidebar.tsx` — "Refine results" panel (type/course/level/clip-length) + "No luck?" callout + recent searches; the filter controls here drive the *same* state as `SearchExplorer`, so these two need to share state — implementing as one client component tree (`SearchExplorer` renders both the results and, as a sibling, the sidebar, or a shared context) rather than two independent components guessing at each other's state.
- `components/search/RecentSearches.tsx` (client, localStorage).
- `lib/recent-searches.ts` — tiny localStorage read/write/push helpers, wrapped in try/catch (private-browsing-safe, per artifact/browser-storage norms already followed elsewhere in this app).

## Files to modify

- `app/search/page.tsx` — add the submit button, fetch the two aggregate stats, pass everything into the new layout (results + sidebar side by side, matching the design's two-column layout).
- `components/search/LessonResultCard.tsx`, `components/search/VideoResultCard.tsx` — redesign to match: numbered index, badge style (peach "MOMENT" vs outline "LESSON"), description rendered via `react-markdown` (inline-only), real chapter/transcript label, moment position bar, "Open lesson →" / "Watch from …→" links.
- `sanity/lib/queries.ts` — `getLessonsByIds` returns full `chapters`/`chunks` (not just flattened seconds) and the course's `level`; add the tiny aggregate-stats query.
- `lib/search.ts` — attach the resolved chapter/transcript label to video results; system prompt gets one added line asking for backtick-wrapped technical terms in `description`.
- `components/search/SearchEmptyState.tsx` — reused as today when the *filtered* view has zero results (distinct from zero raw results), pointing back to "clear filters" as well as the catalog.

## Requirements

- All filtering/sorting/pagination stays client-side over the one server-fetched result list — no new network round-trips.
- No new colors/radii/fonts; reuse `Checkbox`, `Badge`, existing icons (`ClockIcon` for recent searches, `PlayIcon`/`CourseIcon` for the type icons already used).
- Recent searches never call the server and are wrapped defensively (storage can throw or be unavailable).
- Reused across both result-card types: no per-card network calls, everything from the one `runSearch` response.

## Security considerations

- No new server surface; the aggregate stats query is read-only via the existing server-only Sanity client.
- `localStorage` holds only the viewer's own past query strings — no user IDs, no cross-viewer data.

## Acceptance criteria

- Visiting `/search?q=revalidate` (or similar) renders the redesigned two-column layout matching the reference: tabs, sidebar filters with real counts, redesigned cards, "No luck?" callout with real numbers.
- Selecting "Moments" (either the tab or the sidebar checkbox) filters to video-kind results only, keeping the other control in sync.
- Course/level/clip-length filters narrow the list correctly; "Reset" clears all of them.
- A search performed once shows up in "Recent searches" on a subsequent visit to `/search` (same browser); clicking it re-runs that query for real.
- "Show all N results" reveals results beyond the first 8.
- Mobile (375px): sidebar stacks below the results, no horizontal overflow.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.

## Checks to run

- Web root: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Live verification still depends on OpenAI billing credits being available (same open item as the last two prompts) — acceptance criteria involving actual search results will be spot-checked once that's resolved.

## Manual test steps

1. `npm run dev`, visit `/search?q=<a query that matches a real chapter>`.
2. Confirm the tabs/sidebar checkboxes filter in sync, course/level/clip filters narrow results, Reset clears them.
3. Confirm a moment card shows a real chapter label and a position bar that visually lines up with `matchedSecond / duration`.
4. Confirm the description's backtick-wrapped terms (if the model used any) render as styled inline code, not literal backticks.
5. Run 2-3 different searches, revisit `/search` with no query, confirm they appear under Recent Searches in most-recent-first order.
6. Resize to 375px, confirm the sidebar stacks and nothing overflows.
