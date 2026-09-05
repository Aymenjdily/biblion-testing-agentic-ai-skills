import { formatClock } from "@/lib/duration";
import { getVideoEmbed } from "@/lib/video-provider";

/**
 * Plays the lesson's real video through the provider's own embed — per
 * AGENTS.md section 7, never a custom-built player.
 */
export function VideoEmbed({
  videoUrl,
  title,
  startSeconds,
}: {
  videoUrl: string;
  title: string;
  startSeconds: number;
}) {
  const embed = getVideoEmbed(videoUrl, startSeconds);

  return (
    <div>
      {startSeconds > 0 && (
        <p className="mb-2 font-mono text-[11px] tracking-wide text-neutral-500">
          Resuming from {formatClock(startSeconds)}
        </p>
      )}

      <div className="overflow-hidden rounded-card bg-ink-900">
        <div className="relative aspect-video w-full">
          {embed.embedUrl ? (
            <iframe
              key={embed.embedUrl}
              src={embed.embedUrl}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <a
              href={embed.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80 hover:text-white"
            >
              Watch on original site
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
