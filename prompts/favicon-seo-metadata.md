# Favicon, SEO, and metadata

## Goal

Give the site a real favicon/app-icon set and a complete metadata layer: per-page titles/descriptions, Open Graph and Twitter cards, a shared OG image, `robots.txt`, and `sitemap.xml` — using Next.js's file-based metadata conventions throughout.

## Skills / docs read

- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/{app-icons,opengraph-image,robots,sitemap}.md`
- Confirmed for this Next version (16.3.4): `ImageResponse` comes from `next/og`; `favicon` cannot be code-generated (must be a real `.ico` file — `icon`/`apple-icon` are the code-generatable ones); `robots.ts`/`sitemap.ts` export `MetadataRoute.Robots`/`MetadataRoute.Sitemap`.

## Code inspected

- `app/layout.tsx` — current metadata is just `{ title: "Biblion", description: "..." }`, no OG/Twitter, no `metadataBase`, no icons declared (relying entirely on the stock `app/favicon.ico`, which is still Next's default template icon, not a Biblion one).
- `components/icons.tsx` — `BiblionMark`, the real two-tone open-book brand mark (`fill="var(--color-ember-600)"` / `var(--color-ember-400)"`), used bare (no background chip) everywhere it appears (`Header`, `Footer`, home page, style guide).
- `app/globals.css` — brand tokens: `--color-ember-600: #ea580c`, `--color-ember-400: #fb923c`, `--color-background: #fbf7f1` (cream), `--color-ink-900: #1c1917`.
- `sanity/lib/queries.ts` — `getCourseBySlug`/`getLessonBySlug` (used once each, in the matching `page.tsx`) will be called a second time by each route's new `generateMetadata`; per the Next docs' own recommended pattern, wrapping them in React's `cache()` keeps it to one real fetch per request.
- `lib/plain-text.ts` — existing `toPlainText()` helper (Portable Text → plain string) — reusable for lesson `notes` excerpts in meta descriptions.
- `proxy.ts` — `clerkMiddleware()` gates nothing at the route level (everything is publicly browsable; auth state is checked inline per AGENTS.md), so every content route (`/`, `/catalog`, `/courses/[slug]`, `/lessons/[slug]`, `/search`) is real, crawlable content. `/sign-in`, `/sign-up`, and `/style-guide` have no unique content for search engines.
- No production domain exists yet (unreleased, GitHub-only). Per your answer, using a clearly-fake placeholder (`https://biblion.example.com`) via `NEXT_PUBLIC_SITE_URL`, swapped for the real domain at deploy time.

## Decisions

- **Site URL**: add `NEXT_PUBLIC_SITE_URL` to `.env.example` (placeholder `https://biblion.example.com`, documented as swap-before-deploy) and a small `lib/site-config.ts` exporting `siteUrl`/`siteName`/`siteDescription` so every metadata file reads from one place instead of repeating strings.
- **Favicon/icons** (three files, all reusing the real `BiblionMark` colors, no new brand asset needed):
  - `app/icon.tsx` — code-generated via `ImageResponse` (`next/og`), 32×32, the two-tone book mark on a transparent background. This is what modern browsers actually use for the tab icon.
  - `app/apple-icon.tsx` — code-generated via `ImageResponse`, 180×180, same mark on an **opaque** cream (`#fbf7f1`) background (Apple's own guidance: touch icons shouldn't be transparent; iOS applies its own corner rounding, so this stays a flat square).
  - `app/favicon.ico` — a real static `.ico` replacing the current stock Next.js default. `ImageResponse` cannot generate a `favicon.ico` (Next's own docs are explicit about this), so this is built once via a throwaway Node script (`sharp` — already present as a transitive Next dependency — rasterizes the mark to a 32×32 PNG, wrapped in a minimal single-frame ICO container), then the script is deleted; only the binary `.ico` output is committed. This exists purely as the legacy fallback some crawlers/older browsers request at the literal `/favicon.ico` path regardless of `<link>` tags.
- **Root layout metadata** (`app/layout.tsx`): `metadataBase` (from `siteUrl`), a `title` template (`{ default: "Biblion", template: "%s · Biblion" }`), the existing description kept as the default, `openGraph` (type `website`, `siteName`, locale `en_US`) and `twitter` (`summary_large_image`) defaults, and a default `robots` of `index, follow`.
- **Shared OG image** (`app/opengraph-image.tsx`): one site-wide `ImageResponse`-generated 1200×630 image (dark `ink-900` background, the book mark, "Biblion" wordmark, and the existing tagline) — used as the fallback social-preview card for every route that doesn't define its own. Per-page dynamic OG images (compositing each course's real cover image) would be a natural next step but is its own separate, more involved piece of work (fetching a remote Sanity image into `ImageResponse`) — out of scope here per AGENTS.md's "don't overbuild," flagged for you to request separately if wanted.
- **Per-route `generateMetadata`**, using real content already fetched by each page (all reusing the shared `cache()`-wrapped fetchers, so no extra network calls):
  - `/catalog` — static-ish title ("Course catalog"), description mentioning the real course/category counts already fetched on that page.
  - `/courses/[slug]` — title from the course's real title, description from its real `summary`, `openGraph.images` from its real `coverImage` (via `urlFor`).
  - `/lessons/[slug]` — title `"{lesson.title} · {course.title}"`, description from `toPlainText(lesson.notes)` (truncated), `openGraph.images` from the lesson's real `poster`.
  - `/search` — title reflecting the query when present ("Search results for '…'"), else a generic search title; always `robots: { index: false }` since query-string result pages are thin/duplicate content not worth indexing.
  - `/sign-in`, `/sign-up`, `/style-guide` — `robots: { index: false, follow: false }` (utility/internal pages, no unique content).
- **`app/robots.ts`**: allow everything except `/api/`, point at the real sitemap URL via `siteUrl`.
- **`app/sitemap.ts`**: home, `/catalog`, `/search`, every real course slug (`getCourseSlugs`), every real lesson slug (`getLessonSlugs`) — sensible `changeFrequency`/`priority` per route type, no fabricated `lastModified` beyond what's cheaply available (course/lesson `_updatedAt` where already selected by an existing query; otherwise omitted rather than guessed).

## Files expected to touch

- `.env.example` — add `NEXT_PUBLIC_SITE_URL`.
- `lib/site-config.ts` — new, small shared constants.
- `app/layout.tsx` — expand root metadata.
- `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx` — new, code-generated.
- `app/favicon.ico` — replaced (binary), generated once via a throwaway script (not committed).
- `app/robots.ts`, `app/sitemap.ts` — new.
- `app/catalog/page.tsx`, `app/courses/[slug]/page.tsx`, `app/lessons/[slug]/page.tsx`, `app/search/page.tsx` — add `generateMetadata`.
- `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`, `app/style-guide/page.tsx` — add a static `noindex` `metadata` export.
- `sanity/lib/queries.ts` — wrap `getCourseBySlug`/`getLessonBySlug` in React's `cache()`.

## Security considerations

- No secrets involved; `NEXT_PUBLIC_SITE_URL` is public by nature (it's the site's own URL).
- `robots.ts` disallows `/api/` so search engines don't attempt to crawl/index the internal search API route.

## Acceptance criteria

- Every page has a real, unique `<title>` and meta description (no leftover generic "Biblion" title on content pages).
- Browser tab shows the real Biblion book-mark icon (not the stock Next.js icon).
- Sharing any course or lesson URL (e.g. pasting into Slack/Twitter/iMessage preview tools) shows a real Open Graph card with the right title/description/image.
- `/robots.txt` and `/sitemap.xml` both resolve and list real routes/slugs.
- `/sign-in`, `/sign-up`, `/style-guide`, and `/search` are all marked `noindex`.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass.

## Checks to run

- Web root: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Manual test steps

1. `npm run dev`; open `/`, `/catalog`, a real `/courses/[slug]`, a real `/lessons/[slug]`, and `/search?q=caching` — check each tab's title and the page source's `<meta>`/`<link rel="icon">` tags.
2. Visit `/favicon.ico`, `/icon`, `/apple-icon`, `/opengraph-image` directly — confirm each renders a real branded image, not a 404 or the stock icon.
3. Visit `/robots.txt` and `/sitemap.xml` — confirm real course/lesson URLs appear and `/api/` is disallowed.
4. Paste a course or lesson URL into a social-preview debugger (e.g. https://cards-dev.twitter.com/validator or Slack's own unfurl) once deployed — confirm a real card renders.
