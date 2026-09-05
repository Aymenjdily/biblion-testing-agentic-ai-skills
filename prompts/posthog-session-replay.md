# Implementation prompt — Route PostHog /ingest around Clerk auth

## Goal

Complete the PostHog session replay setup so recordings work reliably. The core
client integration already exists on `main` (`instrumentation-client.ts` inits
posthog-js with `api_host: "/ingest"`, and `next.config.ts` rewrites `/ingest/*`
to PostHog's hosts). This change removes the two remaining gaps: the Clerk
middleware still processes `/ingest` analytics traffic, and `.env.example` does
not list the PostHog token.

## Background (from the inbox report and project data)

- Session Replay had no recordings, though pageviews kept arriving. Diagnostic
  signals on recent `$pageview` events (posthog-js 1.427.2) showed the recorder
  script failing to load (`$sdk_debug_recording_script_not_loaded = true`).
- The reverse proxy on `main` fixes the recorder load by serving it first-party
  through `/ingest/static/*`. The recorder script path ends in `.js`, which the
  Clerk matcher already skips.
- The `/ingest` ingestion and flags requests have no file extension, so the Clerk
  matcher still runs auth middleware on them. Analytics traffic should never go
  through auth.

## Skills read

- `diagnosing-missing-recordings` (diagnostic signal meaning and verdicts).
- Next 16 bundled docs: `proxy.md` (middleware renamed to proxy), `rewrites.md`.

## Code inspected

- `proxy.ts` (Clerk middleware and its matcher), `instrumentation-client.ts` and
  `next.config.ts` (the existing PostHog setup on `main`), `.env.example`.

## Decisions and assumptions

- Add `ingest` to the Clerk matcher's negative lookahead so every `/ingest/*`
  request bypasses auth. This matches the documented Clerk + PostHog proxy setup.
- Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` to `.env.example` as the canonical
  variable list, next to the Clerk and Sanity entries. Keep the value blank.
- Leave the rest of the integration on `main` unchanged.

## Files touched

- `proxy.ts` — add `ingest` to the matcher exclusion.
- `.env.example` — add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`.

## Security considerations

- The project token is client-safe (public by design); it stays a
  `NEXT_PUBLIC_` value. No private key is added.
- Excluding `/ingest` from auth is correct: ingestion is anonymous by design and
  must not require a session.

## Acceptance criteria

- `/ingest/*` requests do not run the Clerk middleware.
- With a token set, session replay records; the recorder loads from
  `/ingest/static/...` on the app origin.
- Clerk auth on app routes is unchanged.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Manual test steps

1. Put a real token in `.env.local` (`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...`),
   then `npm run dev`.
2. Load a page. In DevTools → Network, confirm `/ingest/static/recorder.js`
   returns 200 from the app origin and `/ingest/flags` returns 200.
3. Browse a few seconds. In PostHog → Session Replay, confirm a new recording
   appears with `$recording_status = active`.
