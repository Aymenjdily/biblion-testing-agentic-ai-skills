import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, readToken } from '../env'

// Server-only: the dataset is private and this client carries the read token.
// Never import this module from a client component.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: readToken,
  useCdn: false, // private datasets can't be served through the CDN
})
