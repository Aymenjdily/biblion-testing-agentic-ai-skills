#!/usr/bin/env node
/**
 * Offline video ingestion (AGENTS.md section 9). Run manually:
 *
 *   WRITE_TOKEN=<editor-role token> node scripts/ingest-videos.mjs
 *
 * Never imported by the app, never runs in the request path. Safe to
 * re-run — upserts by a stable _id.
 *
 * Builds one `video` document per entry in seed/videos.json (all YouTube).
 * Chapters are parsed from the video's public description (no API key
 * needed). Transcript `chunks` are left empty: unauthenticated caption
 * access was verified unavailable at the time this was written (see
 * prompts/video-ingestion.md) — every extraction method tested returned
 * empty/errored, for both auto-generated and manually-uploaded captions.
 */

import { readFile } from "node:fs/promises";
import { createClient } from "next-sanity";

const PROJECT_ID = "vfyf5mvo";
const DATASET = "production";
const REQUEST_DELAY_MS = 400;

function assertWriteToken() {
  const token = process.env.WRITE_TOKEN;
  if (!token) {
    console.error("Set WRITE_TOKEN to an editor-role Sanity token (npx sanity tokens add ... --role=editor).");
    process.exit(1);
  }
  return token;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parses YouTube's own chapter-timestamp convention out of a video description. */
function parseChapters(description) {
  const timestampLine = /^\W*((?:\d{1,2}:)?\d{1,2}:\d{2})\s+(.+)$/;
  const candidates = [];

  for (const line of description.split("\n")) {
    const match = line.match(timestampLine);
    if (!match) continue;

    const seconds = match[1]
      .split(":")
      .map(Number)
      .reduce((total, part) => total * 60 + part, 0);
    const label = match[2].trim();
    if (label) candidates.push({ startSeconds: seconds, label });
  }

  // Chapters must strictly increase — guards against stray timestamp-shaped
  // text elsewhere in the description producing a false, unordered set.
  const chapters = [];
  for (const candidate of candidates) {
    const prev = chapters[chapters.length - 1];
    if (!prev || candidate.startSeconds > prev.startSeconds) {
      chapters.push(candidate);
    }
  }

  return chapters.length >= 2 ? chapters : [];
}

async function fetchDescription(videoId) {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { "Accept-Language": "en-US" },
  });
  if (!res.ok) throw new Error(`watch page fetch failed: ${res.status}`);

  const html = await res.text();
  const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;\s*(?:var |const |let |<\/script>)/);
  if (!match) throw new Error("ytInitialPlayerResponse not found in page");

  const data = JSON.parse(match[1]);
  return data?.videoDetails?.shortDescription ?? "";
}

async function main() {
  const writeToken = assertWriteToken();
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: "2026-09-04",
    token: writeToken,
    useCdn: false,
  });

  const videos = JSON.parse(await readFile(new URL("../seed/videos.json", import.meta.url), "utf-8"));
  const entries = Object.entries(videos);

  console.log(`Ingesting ${entries.length} videos...`);

  let succeeded = 0;
  let withChapters = 0;
  let failed = 0;

  for (const [lessonSlug, meta] of entries) {
    try {
      const description = await fetchDescription(meta.id);
      const chapters = parseChapters(description);
      if (chapters.length > 0) withChapters++;

      // Sanity document IDs can't start with a hyphen, which some YouTube
      // ids do (digits/underscores are fine) — prefix the _id only, never
      // the stored id.
      const safeIdSuffix = meta.id.startsWith("-") ? `v${meta.id}` : meta.id;

      await client.createOrReplace({
        _id: `video.${safeIdSuffix}`,
        _type: "video",
        id: meta.id,
        url: `https://www.youtube.com/watch?v=${meta.id}`,
        chapters,
        chunks: [],
      });

      succeeded++;
      console.log(`✓ ${lessonSlug} (${meta.id}) — ${chapters.length} chapters`);
    } catch (error) {
      failed++;
      console.error(`✗ ${lessonSlug} (${meta.id}) — ${error.message}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log(
    `\nDone. ${succeeded} succeeded (${withChapters} with chapters), ${failed} failed, out of ${entries.length}.`,
  );
}

main();
