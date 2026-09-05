/**
 * Parses a lesson's stored videoUrl into a real provider embed. Per AGENTS.md
 * section 7, playback is always the provider's own embed — never a custom
 * player. Every lesson in the current dataset is YouTube; Vimeo/Bunny are
 * implemented best-effort per section 5's three supported providers but are
 * unexercised until content of those kinds exists.
 */

export type VideoEmbed = {
  provider: "youtube" | "vimeo" | "bunny" | "unknown";
  embedUrl: string | null;
  originalUrl: string;
};

function extractYouTubeId(url: URL): string | null {
  if (url.hostname.includes("youtu.be")) {
    return url.pathname.slice(1) || null;
  }
  if (url.hostname.includes("youtube.com")) {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const embedMatch = url.pathname.match(/^\/embed\/([\w-]{11})/);
    if (embedMatch) return embedMatch[1];
  }
  return null;
}

export function getVideoEmbed(videoUrl: string, startSeconds = 0): VideoEmbed {
  const safeStart = Number.isFinite(startSeconds) && startSeconds > 0 ? Math.floor(startSeconds) : 0;

  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return { provider: "unknown", embedUrl: null, originalUrl: videoUrl };
  }

  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    const params = new URLSearchParams({ rel: "0" });
    if (safeStart > 0) params.set("start", String(safeStart));
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`,
      originalUrl: videoUrl,
    };
  }

  if (url.hostname.includes("vimeo.com")) {
    const vimeoMatch = url.pathname.match(/\/(\d+)/);
    if (vimeoMatch) {
      const params = new URLSearchParams();
      if (safeStart > 0) params.set("t", `${safeStart}s`);
      const query = params.toString();
      return {
        provider: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}${query ? `?${query}` : ""}`,
        originalUrl: videoUrl,
      };
    }
  }

  if (url.hostname.includes("mediadelivery.net")) {
    if (safeStart > 0) url.searchParams.set("t", String(safeStart));
    return { provider: "bunny", embedUrl: url.toString(), originalUrl: videoUrl };
  }

  return { provider: "unknown", embedUrl: null, originalUrl: videoUrl };
}
