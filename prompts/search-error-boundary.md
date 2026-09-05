# Search error boundary and graceful failure

## Goal

Stop a single unhandled throw in the search agent from taking down the whole
`/search` page. The page must stay usable when the agent fails.

## Root cause

- `app/search/page.tsx` awaits `runSearch` with no `try`/`catch`.
- `app/` has no `error.tsx` boundary, so a server render error reaches the client
  and the page renders nothing.
- The sibling `app/api/search/route.ts` already catches and returns a 500, so the
  page is the odd one out.

## Skills read

- Repo `AGENTS.md` (server/client boundaries, small changes, reuse components).
- Existing patterns: `components/search/SearchEmptyState.tsx`,
  `app/search/loading.tsx`, `app/api/search/route.ts`.

## Code inspected

- `app/search/page.tsx`, `lib/search.ts`, `lib/sanity-context.ts`,
  `components/search/SearchEmptyState.tsx`, `components/layout/Header.tsx`
  (a client component, so it is safe inside a client `error.tsx`), `app/layout.tsx`.

## Decisions

- Add `app/search/error.tsx` as the last-resort boundary. It is a client
  component with `reset`, so the user can retry without a full reload.
- Wrap `runSearch` in `app/search/page.tsx`. A fault degrades to an error card in
  the results area, and the search field stays visible.
- Add a `SearchErrorState` component next to `SearchEmptyState`, with a "Try
  again" link (a full reload of the same query) and a catalog link.
- Fail fast in `lib/search.ts`: throw a clear message when `OPENAI_API_KEY` is
  missing, instead of an obscure provider error deeper in the call.

## Files to touch

- `app/search/error.tsx` (new)
- `components/search/SearchErrorState.tsx` (new)
- `app/search/page.tsx`
- `lib/search.ts`

## Requirements

- No token or secret reaches the browser. `error.tsx` shows a generic message,
  never the raw error text.
- Match the visual language of `SearchEmptyState`.

## Security

- The error card never prints the caught error to the user. Server logs keep the
  detail.

## Acceptance criteria

- A throw in `runSearch` renders the search page shell plus an error card, not a
  blank page.
- The user can retry the same query.

## Checks

- Type check and lint (a build too if the environment has `node_modules`).

## Manual test

1. Visit `/search?q=server actions` with a broken provider (unset
   `OPENAI_API_KEY`).
2. Confirm the page shows the header, the search field, and the error card with a
   working "Try again".
