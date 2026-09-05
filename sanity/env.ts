export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-04'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
)

// Deliberately not exported as a top-level constant here: this file is
// imported by sanity/lib/image.ts, which is safe to use from client
// components. A top-level `assertValue` for the read token would run (and
// throw) during client-bundle module evaluation even when only projectId/
// dataset are used, since importing any export executes the whole module.
// sanity/lib/client.ts (server-only) reads the token directly instead.
export function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
