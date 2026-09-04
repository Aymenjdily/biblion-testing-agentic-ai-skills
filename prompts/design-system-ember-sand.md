# Implementation prompt — Biblion Design System v1.0 "Ember & Sand"

## Goal

Replace the existing v3 design system (indigo/amber/teal, Instrument Serif, Inter Tight)
with the new reference `design/design-system.jpeg` (DESIGN SYSTEM — V1.0, light theme,
"Ember & Sand"). The old reference `design/biblion-design-system-v3.svg` is already
deleted from the working tree and stays deleted.

## Reference (source of truth)

`design/design-system.jpeg` — sections 01 Color, 02 Typography, 03 Buttons & Controls,
04 Iconography, 05 Components, plus the sheet header/footer token summary.

## Skills / docs read

- `AGENTS.md` (project rules, section 3: reproduce the reference exactly)
- Existing code: `app/globals.css`, `app/layout.tsx`, `app/style-guide/page.tsx`,
  `components/ui/*`, `components/icons.tsx`, `components/search/*`, `app/page.tsx`
- Tailwind v4 (`@theme` token syntax, already in use)

## Decisions & assumptions

- Fonts via `next/font/google`: **Space Grotesk** (500/600/700 — display & headings),
  **Inter** (400/500/600 — UI, body, labels), **JetBrains Mono** (400/500 — tokens,
  code, timestamps). Replaces Instrument Serif + Inter Tight.
- Tokens defined in `@theme` in `app/globals.css` using the exact names/values from the
  sheet (Tailwind-ready): full `ember` ramp (50–800, 600 = primary), `neutral` ramp
  (50–700 = stone values), `ink-900`, surfaces `background/soft/surface/border`,
  semantic `success/warning/error/info`.
- Existing component APIs stay stable (`Button`, `Badge`, `SearchField`, `ProgressBar`,
  `Checkbox`, search cards). Only their internals and token references change.
- Icons: keep the hand-rolled SVG approach (no new dependency), add the solid
  (Font Awesome style, filled glyph) set shown in section 04.
- The home page (`app/page.tsx`) mock search surface keeps its layout; only class
  tokens are remapped (ink→ink-900, canvas→background, indigo→ember, teal→success,
  font-serif→font-display) so it renders with the new system.

## Files to touch

1. `app/globals.css` — full token rework (color, type, radius 6/10/14/pill, motion).
2. `app/layout.tsx` — swap Google fonts to Space Grotesk / Inter / JetBrains Mono.
3. `components/ui/Button.tsx` — primary (ember-600, hover 700, disabled 300), secondary
   (surface, border, hover neutral-50), ghost (ember text), danger (error red ramp);
   height 40, radius 10, focus ring 2px ember-300.
4. `components/ui/Badge.tsx` — `FREE PREVIEW` (soft bg / ember-800 text) and `POPULAR`
   (ember-600 bg / white) uppercase pill badges per section 05; semantic variants.
5. `components/ui/SearchField.tsx` — ember-300/ember-500 focus ring per section 03.
6. `components/ui/Checkbox.tsx` — ember accent.
7. `components/ui/ProgressBar.tsx` — ember-600 bar (per course card, 68% ember).
8. `components/ui/Toggle.tsx` — NEW: ember pill switch (spec: "Email reminders").
9. `components/icons.tsx` — add solid icon set: course, level, duration, saved,
   progress, alerts, video, certificate, pro tip, modules, instructor, rating, done,
   next (24px grid, filled, currentColor).
10. `app/style-guide/page.tsx` — rewrite as a live version of the sheet: header
    (logo, "UI TOKENS · COMPONENTS · FOUNDATIONS", V1.0 / LIGHT THEME · SEP 2026),
    01 Color (ember ramp, neutrals, semantic, surfaces), 02 Typography (7 steps with
    Space Grotesk/Inter/JetBrains Mono specimen cards), 03 Buttons & Controls
    (default/hover/disabled rows, inputs, toggle), 04 Iconography (16 solid icons),
    05 Components (course card + video moment card + badges), footer token summary.
11. `app/page.tsx`, `components/search/LessonCard.tsx`,
    `components/search/VideoMomentCard.tsx` — token remap to the new system only,
    no layout changes.

## Security considerations

None. No env, auth, or data access involved. Client-presentational only.

## Acceptance criteria

- `design/design-system.jpeg` is the only file in `design/`; v3 svg stays removed.
- Style guide page visually matches the sheet: ember ramp values, 3 type families with
  correct steps (48/56 display, 36/44 H1, 28/36 H2, 22/30 H3, 16/26 body, 14/22 small,
  12/18 caption), button states (default→hover→disabled, h-40 r-10, focus 2px ember-300),
  solid icon grid, FREE PREVIEW / POPULAR badges, course + video moment cards.
- No v3 tokens (`indigo`, `canvas`, `font-serif`, `amber-*`, `teal*`, `inter-tight`)
  remain anywhere in `app/` or `components/`.
- Home page and search cards render with the new tokens, layout unchanged.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (routes changed)

## Manual test steps

1. `npm run dev`, open `/style-guide`:
   - Ember ramp swatches show 50–800 with the exact hex labels from the sheet.
   - Typography specimens render in Space Grotesk / Inter / JetBrains Mono.
   - Buttons show default/hover/disabled for primary, secondary, ghost, danger; focus
     ring is 2px ember-300.
   - Search field shows `/` hint; focus draws the ember ring. Toggle switches on ember.
   - 16 solid icons render filled; badges read FREE PREVIEW and POPULAR.
   - Course card shows POPULAR pill, play overlay, $49, instructor initials AR, 68% bar.
   - Video moment card shows 12:34 chip, Watch from 12:34 ember button.
2. Open `/`: nav, sidebar, and result cards use ember/neutral/ink, layout unchanged.
