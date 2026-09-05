import 'server-only'

import type { QueryParams } from 'next-sanity'

import { client } from './client'

// Single server-only entry point for reading content. Every query function in
// queries.ts goes through this instead of calling the client directly.
export async function sanityFetch<QueryResponse>(
  query: string,
  params: QueryParams = {},
): Promise<QueryResponse> {
  return client.fetch<QueryResponse>(query, params)
}
