import "server-only";

import { createMCPClient } from "@ai-sdk/mcp";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/fetch";

// Server-only: connects to the Sanity Context MCP server. Never imported by
// a client component — the read token stays on the server.

const AGENT_CONTEXT_SLUG = "search";

const AGENT_CONTEXT_INSTRUCTIONS_QUERY = defineQuery(`
  *[_type == "sanity.agentContext" && slug.current == $slug][0].instructions
`);

let cachedInstructions: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches just the Context document's raw `instructions` field — via the
 * app's own server-only Sanity client, not the Context MCP (whose groqFilter
 * deliberately excludes `sanity.agentContext` from query results) and not
 * the MCP's `/initial-context` endpoint (whose full schema+tools+instructions
 * payload, at ~1000+ tokens, doesn't fit this app's tight per-minute token
 * budget — see lib/search.ts). This is ~300-400 tokens, small enough to
 * inject into every request, restoring the documented promise (AGENTS.md
 * section 10) that editing the Context document in Studio changes agent
 * behavior without a code deploy — cached for 5 minutes rather than fetched
 * per-request, so an edit takes effect on the next request after the cache
 * expires, not literally instantly.
 */
export async function fetchAgentContextInstructions(): Promise<string | null> {
  const isStale = Date.now() - cacheTimestamp > CACHE_TTL_MS;
  if (isStale) {
    try {
      cachedInstructions = await sanityFetch<string | null>(AGENT_CONTEXT_INSTRUCTIONS_QUERY, {
        slug: AGENT_CONTEXT_SLUG,
      });
      cacheTimestamp = Date.now();
    } catch {
      // Fall through and return whatever's cached (possibly null/stale).
    }
  }

  return cachedInstructions;
}

export async function createSanityMCPClient() {
  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;
  if (!mcpUrl) {
    throw new Error("SANITY_CONTEXT_MCP_URL is not set");
  }

  return createMCPClient({
    transport: {
      type: "http",
      url: mcpUrl,
      headers: {
        Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
      },
    },
  });
}
