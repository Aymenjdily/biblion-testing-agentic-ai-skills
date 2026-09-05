import "server-only";

import { createMCPClient } from "@ai-sdk/mcp";

// Server-only: connects to the Sanity Context MCP server. Never imported by
// a client component — the read token stays on the server.

function initialContextUrl(mcpUrl: string): string {
  const url = new URL(mcpUrl);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/initial-context`;
  return url.toString();
}

let cachedInitialContext: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches the MCP's schema overview once and caches it — gives a latency
 * win (no tool call needed for the model to learn the schema) and a stable
 * system-prompt prefix for caching.
 */
export async function fetchInitialContext(): Promise<string | null> {
  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;
  if (!mcpUrl) return null;

  const isStale = Date.now() - cacheTimestamp > CACHE_TTL_MS;
  if (isStale || !cachedInitialContext) {
    try {
      const res = await fetch(initialContextUrl(mcpUrl), {
        headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` },
      });
      if (res.ok) {
        cachedInitialContext = await res.text();
        cacheTimestamp = Date.now();
      }
    } catch {
      // Fall through and return whatever's cached (possibly null).
    }
  }

  return cachedInitialContext;
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
