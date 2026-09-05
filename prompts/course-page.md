# Course detail page

## Goal

Build the course detail page (`/courses/[slug]`) matching `design/biblion-course-page.png` exactly, wired to real Sanity content through the existing server-only read layer. Extract a shared `Header`/`Footer` from the landing page so the course page (and future pages) don't duplicate that markup.

## Skills and docs read

- `AGENTS.md` sections 3 (UI work), 5 (structure/boundaries), 6 (stack), 7 (decisions), 8 (data shape), 13 (checks).
- `sanity-best-practices` conventions already applied in this repo (`defineType`/`defineField`/`defineArrayMember`, GROQ projections in `sanity/lib/queries.ts`).

## Code inspected

- `sanity/lib/queries.ts` — `getCourseBySlug` already returns the course with instructor, category, and `modules[].lessons[]` expanded (title, slug, poster, duration, freePreview, studentCount). `CourseDetail`/`CourseCard` hand-written types (TypeGen not run yet).
- `studio/schemaTypes/documents/{course,lesson,instructor,category}.ts` and `objects/{module,resource,learning-outcome}.ts` — confirms current field names or a course's fixed fields: no `rating`, no `tags`, `lesson.duration` is a **string** ("12:34"), `lesson.poster` (not `thumbnail`).
- `seed/seed.ndjson` — 10 seeded courses incl. `course.nextjs-app-router-in-depth` (matches the design's course almost exactly: 4 modules, App Router topic). Note: the seed file uses field names (`thumbnail`, numeric `duration`) that predate the current schema (`poster`, string `duration`) — a pre-existing mismatch in the seed/import step, out of scope here. This page queries by current schema field names only; content must be (re-)seeded to match before it will render real data.
- `app/page.tsx` — header nav and footer markup are inlined only in the landing page; no shared `Header`/`Footer` component exists yet.
- `components/ui/{Badge,Button,ProgressBar,SearchField}.tsx`, `components/icons.tsx` — reusable pieces; icon set already covers most of this page (`RatingIcon`, `LevelIcon`, `DurationIcon`, `ModulesIcon`, `InstructorIcon`, `CertificateIcon`, `SavedIcon`, `DoneIcon`, `PlayIcon`, `CheckIcon`, `ChevronDownIcon`, `NextIcon`, `BiblionMark`). Missing: a "back" chevron-left, a lock icon, an infinity icon (lifetime access), an undo/refresh icon ("Start over"). Will add these to `components/icons.tsx` in the same style as the rest.
- `components/auth/NavAuth.tsx` — signed-in/signed-out nav controls, reused as-is inside the new `Header`.
- No catalog page or `/instructors/[slug]` page exist yet — both are separate future prompts per AGENTS.md section 1. Links to them are still real `<Link>`s to their eventual routes (`/catalog`, `/instructors/[slug]`) even though those routes 404 today.

## User decisions

- **Progress/enrollment panel**: confirmed with the user — build the panel and lesson-row checkmarks as pure UI matching the image, driven by local static/mock data (not a real progress read or write). No progress schema, no server route, no Clerk-keyed reads. This is a placeholder to be swapped for the real thing when learner progress tracking (a separate AGENTS.md section 1 deliverable) is built.

## Other decisions and assumptions

1. **Rating** (`4.9 (1,842 ratings)`): not in the current schema. Adding two small fields to `studio/schemaTypes/documents/course.ts`: `rating` (number, 0–5, one decimal) and `ratingCount` (number). These are genuine marketing fields in the same spirit as `studentCount`/`price`, not fabricated per-page data. If the user would rather omit the rating line instead of touching the schema, that's a one-line change to drop in review.
2. **Tech tags** (`NEXT.JS 15 · REACT 19 · TYPESCRIPT · VERCEL · POSTGRES`): not in the schema. Adding an optional `tags` field (array of strings) to `course.ts`. Empty/absent → the row simply doesn't render.
3. **"Watch intro" video card**: no course-trailer field exists. Instead of fabricating an intro video, the dark preview card shows the course cover image as its background and "Watch intro" links to the course's first lesson (`modules[0].lessons[0]`) at `?start=0`, labeled with that lesson's real duration — not a made-up "02:14".
4. **Course code eyebrow** (`COURSE · NEXT-007` in the design): replaced with real data — `COURSE · {category.title}` (uppercased), consistent with the breadcrumb above it.
5. **"12 resources" stat**: computed as a real count — sum of `resources` array length across every lesson in the course. Query adds `"resourceCount": count(resources)` per lesson so this can be summed server-side.
6. **"Lifetime access" / "Certificate" perks**: generic static platform copy shown identically on every course (like the landing page's static content), not per-course fabricated data — same treatment AGENTS.md gives other presentational-only surfaces.
7. **Aggregate stats** (`36 lessons · 6h 40m total`, per-module `4 lessons · 56 min`): derived in the page from the fetched modules/lessons, not stored. `duration` strings ("18:20") are parsed to seconds with a small helper and summed/formatted back to `Xh Ym`.
8. **Numbering**: `Module {i+1}`, lesson `{moduleIndex+1}.{lessonIndex+1}` derived from array order per AGENTS.md section 8, exactly like the existing `LessonContext` logic in `queries.ts`.
9. **"Show all N modules"**: real interactivity — collapse to the first 2 modules by default (as in the design, which shows 4 of the course's modules with a "Show all 6 modules" affordance for a *different*, longer example course), expand to all on click. Client component, no route change.
10. **Free preview badge / lock affordance**: `freePreview` is a real schema field; lessons without it show the small circular lock-style icon in place of the play icon (still just a label per AGENTS.md section 7 — "Free preview is a label, not access control" — clicking any lesson still navigates to it).
11. **Header/Footer extraction**: `components/layout/Header.tsx` and `components/layout/Footer.tsx`, lifted verbatim from `app/page.tsx`'s existing markup (same classes/behavior), then used by both `app/page.tsx` and the new course page so there's one source of truth. `Header` takes an optional `variant`/`transparent` prop only if needed for the non-gradient background here (the course page header sits on plain `bg-background`, not `bg-hero-shader`).
12. **Instructor section**: uses the course's resolved `instructor` (name, photo, bio via `instructor->{ ..., bio }` — bio isn't currently in `COURSE_BY_SLUG_QUERY`'s instructor projection, so it's added there). The design's instructor subtitle ("Staff engineer · previously Vercel · 12 yrs shipping React") isn't a discrete schema field — condensed from `expertise` isn't right either, so this line falls back to the first line of `bio` truncated, or — cleaner — treat that subtitle as absent from this schema and omit it, showing name + "View instructor" only if no separate field exists. **Flagging this for the approval pass**: recommend adding it as real data isn't worth a new field for one line; will omit the subtitle line and keep name + bio snippet + link, unless the user prefers a schema field instead.
13. **Route**: `app/courses/[slug]/page.tsx`, a Server Component, `generateStaticParams` from `getCourseSlugs()`, calls `getCourseBySlug(slug)`, `notFound()` if null.

## Files expected to touch/create

Create:
- `app/courses/[slug]/page.tsx`
- `components/layout/Header.tsx`, `components/layout/Footer.tsx`
- `components/course/CourseHero.tsx` (title/breadcrumb/meta/tags block)
- `components/course/VideoPreviewCard.tsx` (dark intro card)
- `components/course/EnrollmentCard.tsx` (progress panel, static mock data)
- `components/course/InstructorSection.tsx`
- `components/course/WhatYoullLearn.tsx`
- `components/course/CourseContent.tsx` (module/lesson accordion list, client component for expand/collapse)

Modify:
- `sanity/lib/queries.ts` — add `rating`, `ratingCount`, `tags` to `COURSE_CARD_PROJECTION`; add `bio` to the instructor projection; add `resourceCount` to the lesson projection inside `COURSE_BY_SLUG_QUERY`; update `CourseCard`/`CourseDetail` hand types.
- `studio/schemaTypes/documents/course.ts` — add `rating`, `ratingCount`, `tags` fields.
- `components/icons.tsx` — add `ChevronLeftIcon`, `LockIcon`, `InfinityIcon`, `UndoIcon`.
- `app/page.tsx` — swap inlined header/footer markup for the new `Header`/`Footer` components (no visual change).

## Requirements

- Server Component page; only the module-list expand/collapse and the (static) enrollment card interactivity are client components — everything else stays server-rendered, per AGENTS.md section 5 ("Pages ... are read only").
- No client-side Sanity access, no token anywhere near the browser.
- Responsive: two-column hero (content + video/enrollment rail) stacks to one column on mobile; module list and instructor row stack sensibly. Desktop matches the reference exactly.
- Reuse `Badge`, `Button`, `ProgressBar`, icons, and the Tailwind tokens already in `app/globals.css` — no new colors/radii/fonts.
- Images via `next/image` + `urlFor` from `sanity/lib/image.ts`.
- Portable Text / notes are not rendered on this page (that's the lesson page, a separate future prompt) — only `keyPoints`, `learningOutcomes`, module/lesson titles and durations are shown here.

## Security considerations

- All Sanity reads stay in the Server Component / `sanity/lib/*`; nothing token-bearing is imported by a client component.
- The static enrollment/progress UI reads no per-user data and calls no server route — it's inert mock state, so there's no auth/authorization surface to get wrong yet.

## Acceptance criteria

- Visiting `/courses/nextjs-app-router-in-depth` (once seeded content matches current schema field names) renders the page with real title, summary, level, price, instructor, category, learning outcomes, and the full module/lesson list with real durations and free-preview badges.
- `Show all N modules` reveals the remaining modules without a page reload.
- "Watch intro" and every lesson row link to real `/lessons/[slug]` URLs (that route doesn't exist yet — 404 is expected and fine, this prompt doesn't build it).
- Mobile viewport (375px) is usable: no horizontal scroll, video/enrollment rail moves below the hero copy, module rows remain legible.
- `npm run lint` and `npx tsc --noEmit` pass; `npm run build` succeeds.

## Checks to run

- Web root: `npm run lint`, `npx tsc --noEmit`, `npm run build` (new route + modified query/schema files).
- Studio: no schema-breaking change beyond additive fields, so no migration needed; `npx sanity schema validate` if convenient.

## Manual test steps

1. In `studio/`, add `rating`, `ratingCount`, `tags` to a seeded course (or re-import `seed/seed.ndjson` after reconciling the `poster`/`duration` field-name mismatch noted above) so the page has real content to render.
2. `npm run dev` in web root, visit `/courses/nextjs-app-router-in-depth`.
3. Compare against `design/biblion-course-page.png` side by side at desktop width (1440px) for spacing/type/color fidelity.
4. Resize to 375px and confirm the layout stacks cleanly with no overflow.
5. Click "Show all N modules", confirm the rest of the modules expand in place.
6. Click a lesson row and "Watch intro", confirm both navigate to the expected (currently 404) `/lessons/[slug]?start=...` URL with the right slug/seconds.
7. Confirm the header/footer look identical to the landing page's before this change (regression check on `app/page.tsx`).
