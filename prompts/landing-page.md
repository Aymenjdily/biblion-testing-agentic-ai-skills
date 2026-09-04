# Implementation prompt — Biblion landing page (home)

## Goal

Implement the Biblion marketing landing page at `/` from the reference
`design/biblion-landing-pro.png`, using the Ember & Sand design system already in
place (`app/globals.css`, `components/ui/*`, `components/icons.tsx`). Presentational
only — no backend, no auth, no search logic. Static content exactly as shown.

## Reference (source of truth)

`design/biblion-landing-pro.png` (desktop, one section per screen region):

1. **Nav** (on a soft ember-tinted gradient): Biblion mark + wordmark; links
   Product / Catalog / Instructors / Pricing; right "Sign in" text link + solid ember
   "Get started" button (h-10, rounded-control).
2. **Hero**: gradient background fading from soft ember tint to `--color-background`.
   Mono ember eyebrow "AI VIDEO SEARCH FOR COURSE PLATFORMS" (small ember square
   marker). Display H1 "Every lesson," / "searchable" (ink) + " to the second."
   (ember-600). Body sub copy. Primary "Start free trial" + dark "View live demo →".
   Mono caption "FREE PREVIEW LESSONS · NO CREDIT CARD REQUIRED". Right column with
   three stats: 12,400+ LESSON MOMENTS INDEXED / 0.4 s MEDIAN SEARCH LATENCY /
   4.9 / 5 AVERAGE LEARNER RATING.
3. **Search demo card**: large white rounded-card with border. Header row: search
   icon + query "how do I stream HTML with Suspense?", right side mono
   "28 RESULTS · 0.4 S" and "MOST RELEVANT ⌄". Three result rows separated by
   dividers — dark ink thumbnail with play circle + timestamp chip (12:34 / 04:17 /
   21:08), mono ember eyebrow (COURSE · LESSON x.y), bold title, gray description,
   right-side bordered pill button "▶ Watch · mm:ss".
4. **Logo strip**: "POWERING LEARNING TEAMS AT" mono caption; five text wordmarks in
   neutral gray with varied weights/styles (NORTHWIND, Lumen & Co., hexlab, FRAMELY,
   Arcadia).
5. **Why Biblion**: eyebrow "WHY BIBLION"; H2 "Built for serious course platforms"
   left + supporting paragraph right; three numbered columns (01 Moment-level results,
   02 Grounded in your catalog, 03 Progress that follows), each with copy and an
   ember "Learn more →" link.
6. **Dark CTA**: ink-900 section, centered ember book glyph, "Start finding the exact
   moment." white display, sub line, solid ember "Get started free" button; footer
   bar "© 2026 BIBLION" left, "PRIVACY · TERMS · CONTACT" right (mono, gray).
7. **Giant wordmark**: oversized "BIBLION" display text as the bottom crop
   (decorative; solid ember tone since the photo-fill texture is not reproducible).

## Code inspected

- `app/page.tsx` (currently empty `<main>`), `app/layout.tsx`, `app/globals.css`,
  `components/ui/{Button,Badge,SearchField,ProgressBar,Checkbox,Toggle}.tsx`,
  `components/icons.tsx` (solid set incl. PlayIcon, SearchIcon, BiblionMark, NextIcon).

## Decisions & assumptions

- Single file `app/page.tsx` (server component) with small local section components;
  reuses existing `Button`, icons and tokens. No new UI primitives needed except a
  couple of inline elements (stat block, demo result row) kept local to the page.
- Nav links, buttons, "Learn more", footer links are `href="#"` placeholders —
  real routes come with later features.
- The demo search card mirrors the design's layout (it is not the real search UI).
- Responsive down to mobile: nav links collapse, hero stats stack, demo rows stack,
  three columns stack; desktop matches the reference exactly.
- No new images/assets; thumbnails are CSS gradient blocks per the design.

## Files to touch

- `app/page.tsx` — full landing page (only file).

## Security considerations

None. Static presentational page, no env, no data fetching, no client state
(Toggle not used here).

## Acceptance criteria

- `/` reproduces the reference top to bottom: nav, hero + stats, search demo card
  with 3 result rows, logo strip, Why Biblion 3 columns, dark CTA + footer bar,
  giant bottom wordmark.
- Uses only Ember & Sand tokens (ember ramp, neutral ramp, ink-900, surfaces) and
  the three type families (Space Grotesk / Inter / JetBrains Mono) per the design
  system steps.
- Desktop matches the reference; layout adapts sensibly at mobile widths.
- No dead code or leftover v3 tokens.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Manual test steps

1. `npm run dev` → `/`: compare each section against `design/biblion-landing-pro.png`
   (spacing, type scale, colors, states).
2. Resize to mobile (~375px): sections stack without horizontal scroll.
3. Tab through the page: focus ring is 2px ember-300 everywhere.
