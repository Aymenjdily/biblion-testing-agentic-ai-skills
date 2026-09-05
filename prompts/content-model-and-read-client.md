# Sanity content model, standalone Studio, and server-side read client

## Goal

Model Biblion's content (course, module, lesson, instructor, category) in Sanity, split the project into the two standalone workspaces AGENTS.md requires (Studio / web), and build the server-only read data layer the web app will use to fetch this content. No pages, no search, no video ingestion, no progress tracking — those are separate future prompts.

## Skills and docs read

- `AGENTS.md` sections 5 ("How the app is structured"), 6 (tech stack), 8 (data shape).
- `sanity-best-practices` skill: `references/schema.md`, `references/nextjs.md`, `references/project-structure.md`.

## Code inspected

- Root `package.json` currently bundles both `next` and `sanity`/`@sanity/vision` as one app.
- `sanity.config.ts`, `sanity.cli.ts`, `sanity/env.ts`, `sanity/lib/{client,image,live}.ts`, `sanity/schemaTypes/index.ts`, `sanity/structure.ts`, and `app/studio/[[...tool]]/page.tsx` are the output of the Next.js "embedded Studio" template (`next-sanity` quickstart) — the Studio is mounted inside the Next.js app at `/studio`.
- `.env.example` currently only lists Clerk vars; no Sanity vars exist yet.
- `lib/clsx.ts` is the only file in the web `lib/` dir today.

## Problem: current setup violates AGENTS.md section 5

AGENTS.md is explicit: *"A Studio workspace holds the Sanity schema and content authoring, nothing else... A web workspace holds the Next.js pages... Do not embed the Studio inside Next.js."* The current template is the embedded pattern, which the `sanity-best-practices` skill also flags as legacy/not recommended for exactly the reasons AGENTS.md gives (independent deploys, Studio auto-updates, TypeGen). So this prompt includes migrating to the standalone monorepo layout the skill documents, not just adding schemas on top of the embedded setup.

## Decisions and assumptions

1. **Workspace split**: create a new top-level `studio/` folder as its own standalone Sanity app (own `package.json`, `sanity.config.ts`, `sanity.cli.ts`, `schemaTypes/`). Delete the embedded pieces from the web app: `app/studio/`, root `sanity.config.ts`, root `sanity.cli.ts`, and the root `sanity/` folder (its schema content moves into `studio/`, its `lib/{client,image}.ts` are rebuilt server-only under a new `sanity/` folder in the web app — see below). Root `package.json` keeps only web deps; `sanity` and `@sanity/vision` move to `studio/package.json`.
2. **Web's Sanity folder**: add `sanity/env.ts`, `sanity/lib/client.ts`, `sanity/lib/image.ts`, `sanity/lib/queries.ts`, `sanity/lib/fetch.ts` at the web app root (sibling to `app/`, `lib/`, `components/`). This is server-only: no `defineLive`, no client component ever imports it. AGENTS.md doesn't ask for Visual Editing/Presentation in this prompt's scope, so it isn't built — avoids overbuilding.
3. **Auth for reads**: the dataset is private, so `sanity/lib/client.ts` reads `SANITY_API_READ_TOKEN` (server-only env var, not `NEXT_PUBLIC_*`) and sets `useCdn: false` (private datasets can't use the CDN). `projectId`/`dataset` stay `NEXT_PUBLIC_*` since they're not secret and the Studio needs the same values.
4. **TypeGen**: configure `studio/sanity.cli.ts` to point TypeGen at the web app's queries and emit `sanity.types.ts` into the web root, per the monorepo pattern in `project-structure.md`. Query files use `defineQuery` so TypeGen can pick them up.
5. **Module numbering**: not stored. `Module {index+1}` / `Lesson {moduleIndex+1}.{lessonIndex+1}` are derived in the web layer from array order, per AGENTS.md section 8.
6. **Lesson ↔ course relationship**: lessons don't store a parent course (AGENTS.md is explicit). The read layer derives a lesson's course via a reverse GROQ lookup (`*[_type == "course" && references(^._id)]`), matched through the module's lesson references.
7. **Schema field types**:
   - `category`: `title`, `slug`, `description` (text).
   - `instructor`: `name`, `slug`, `photo` (image w/ hotspot), `expertise` (array of strings), `bio` (text).
   - `course`: `title`, `slug`, `summary` (text), `coverImage` (image w/ hotspot), `level` (string, list: Beginner/Intermediate/Advanced), `price` (number), `popular` (boolean — genuine on/off flag, not an expandable status), `studentCount` (number), `learningOutcomes` (array of `learningOutcome` objects: `icon` string list from a fixed icon set, `title`, `description`), `instructor` (reference), `category` (reference), `modules` (array of `module` objects, each: `title`, `summary`, `lessons` — array of references to `lesson`).
   - `lesson` (document): `title`, `slug`, `videoUrl` (url), `poster` (image), `duration` (string, e.g. "12:34"), `freePreview` (boolean), `studentCount` (number), `notes` (Portable Text `array of block`), `keyPoints` (array of strings), `proTip` (text, optional), `resources` (array of `resource` objects: `type` string list [article, link, download, code], `title`, `description`, `url`).
   - `module` and `resource` and `learningOutcome` are `object` types (embedded, not documents), per the schema skill's reference-vs-object matrix — they don't need independent editing or reuse across documents.
8. **IDs**: no manual `_id` assignment for any of these (none are singletons) — Sanity auto-generates them, per the skill's global rule.
9. **Icons**: `course` → `BookIcon`, `lesson` → `PlayIcon`, `instructor` → `UserIcon`, `category` → `TagIcon`, `module`/`resource`/`learningOutcome` objects get sensible icons too (`DocumentTextIcon`, `LinkIcon`, `BulbOutlineIcon`).
10. **Studio structure**: default `structureTool` document-type list is enough for this prompt — no custom singleton structure needed yet (the search config document from section 10 is a later prompt).
11. **Env files**: root `.env.example` gains `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, and `SANITY_API_READ_TOKEN` (server-only, commented as such). `studio/.env.example` gets `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` (Studio's own env convention).

## Files expected to touch/create

Delete:
- `app/studio/[[...tool]]/page.tsx` (and the now-empty `app/studio/` dir)
- `sanity.config.ts`, `sanity.cli.ts` (root)
- `sanity/` (root) — replaced by `studio/schemaTypes/` and a new server-only `sanity/` in web

Create — `studio/`:
- `studio/package.json`, `studio/tsconfig.json`
- `studio/sanity.config.ts`, `studio/sanity.cli.ts`
- `studio/structure.ts`
- `studio/schemaTypes/index.ts`
- `studio/schemaTypes/documents/course.ts`, `lesson.ts`, `instructor.ts`, `category.ts`
- `studio/schemaTypes/objects/module.ts`, `resource.ts`, `learning-outcome.ts`

Create — web root:
- `sanity/env.ts`
- `sanity/lib/client.ts`, `sanity/lib/image.ts`, `sanity/lib/fetch.ts`, `sanity/lib/queries.ts`

Modify:
- root `package.json` (drop `sanity`, `@sanity/vision`; keep `@sanity/image-url`, `next-sanity`)
- `.env.example` (add Sanity vars)
- `.gitignore` untouched (already ignores `.env*`)

## Requirements

- Studio runs standalone on its own Vite dev server (`npm run dev` inside `studio/`, port 3333), no Next.js involvement.
- Web app has zero Sanity Studio code paths left.
- Web's Sanity client never ships to the browser: `sanity/lib/client.ts` and everything importing the read token stay server-only (no `'use client'`, not imported by client components).
- `sanity/lib/fetch.ts` exports one small helper (e.g. `sanityFetch<T>(query, params)`) wrapping `client.fetch` with the project's `apiVersion`, used by every query function — no per-call ad hoc client config.
- `sanity/lib/queries.ts` exports typed, named GROQ queries (via `defineQuery`) and thin fetch functions for: course list (catalog), course by slug (with resolved instructor, category, and modules→lessons expanded), lesson by slug (with derived course/module context via reverse reference), instructor by slug, category list.
- All array fields use `defineArrayMember`; all fields use `defineField`; all schemas use `defineType`.
- Required-field validation on the fields content genuinely can't be blank (title, slug, videoUrl, references) per `schema.md` patterns.

## Security considerations

- `SANITY_API_READ_TOKEN` only ever read in `sanity/lib/client.ts`, never destructured into a value returned to a client component or route handler response consumed by the browser.
- No dataset name/project id secrecy assumptions — those stay `NEXT_PUBLIC_*` by design since the token, not the id, is what gates the private dataset.
- Studio has no auth of its own beyond Sanity's own project members (per AGENTS.md, "Authentication is Clerk... Do not use Sanity's auth").

## Acceptance criteria

- `npm install` succeeds in both root and `studio/`.
- `studio/`: `npx sanity dev` boots the Studio at localhost:3333, shows Course, Lesson, Instructor, Category document types in the list, and lets you create one of each with the modeled fields, including a course with a module containing lesson references.
- Root web app: `npm run build` and `npm run lint` succeed with no Sanity-Studio-related code left.
- The read functions in `sanity/lib/queries.ts` can be exercised from a scratch script or the Vision plugin and return the expected shape for a course (with expanded instructor/category/modules/lessons) and a lesson (with derived course context).

## Checks to run

- In `studio/`: `npm install`, `npx sanity dev` (manual smoke test), `npx sanity schema validate` if available.
- In web root: `npm run lint`, `npx tsc --noEmit` (or `next build` since routes/config change — the studio route removal touches routing).

## Manual test steps

1. `cd studio && npm install && npm run dev` — Studio opens at http://localhost:3333.
2. Create a Category ("Web Development"), an Instructor (with photo, expertise, bio), a Lesson (with notes, key points, a resource), then a Course referencing that instructor/category, with one module containing that lesson.
3. Confirm the Studio no longer appears at `/studio` on the Next.js app (`cd .. && npm run dev`, visit `localhost:3000/studio` → 404).
4. In web root, add `SANITY_API_READ_TOKEN` (a read-token from manage.sanity.io) and the `NEXT_PUBLIC_SANITY_*` vars to `.env.local`, then run a throwaway script or a temporary server component calling `getCourseBySlug` and confirm it returns the course with instructor, category, and modules→lessons resolved.
5. `npm run lint` and `npm run build` from web root both pass.
