"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { formatClock } from "@/lib/duration";
import { getVideoEmbed } from "@/lib/video-provider";

/**
 * Plays the lesson's real video through the provider's own embed — per
 * AGENTS.md section 7, never a custom-built player. The YouTube IFrame
 * Player API is attached to this same iframe purely to observe play state
 * and elapsed time for analytics — it doesn't add, remove, or replace any
 * player control.
 */

type YTPlayerState = { PLAYING: number; PAUSED: number; ENDED: number };
type YTPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};
type YTPlayerEvent = { data: number };
type YTNamespace = {
  PlayerState: YTPlayerState;
  Player: new (
    element: HTMLIFrameElement,
    options: { events: { onStateChange: (event: YTPlayerEvent) => void } },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return youtubeApiPromise;
}

const WATCH_DEPTH_MILESTONES = [25, 50, 75, 100];
const POLL_INTERVAL_MS = 5000;

export function VideoEmbed({
  videoUrl,
  title,
  startSeconds,
  lessonSlug,
}: {
  videoUrl: string;
  title: string;
  startSeconds: number;
  lessonSlug: string;
}) {
  const embed = getVideoEmbed(videoUrl, startSeconds);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (embed.provider !== "youtube" || !iframeRef.current) return;

    let cancelled = false;
    let player: YTPlayer | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let hasFiredPlay = false;
    const firedMilestones = new Set<number>();

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return;

      player = new YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              if (!hasFiredPlay) {
                hasFiredPlay = true;
                posthog.capture("video_played", {
                  lesson_slug: lessonSlug,
                  provider: embed.provider,
                  start_seconds: startSeconds,
                });
              }
              if (!pollId) {
                pollId = setInterval(() => {
                  const duration = player?.getDuration();
                  const current = player?.getCurrentTime();
                  if (!duration || current == null) return;
                  const percent = (current / duration) * 100;
                  for (const milestone of WATCH_DEPTH_MILESTONES) {
                    if (percent >= milestone && !firedMilestones.has(milestone)) {
                      firedMilestones.add(milestone);
                      posthog.capture("video_watch_depth", {
                        lesson_slug: lessonSlug,
                        provider: embed.provider,
                        depth_percent: milestone,
                      });
                    }
                  }
                }, POLL_INTERVAL_MS);
              }
            } else if (pollId) {
              clearInterval(pollId);
              pollId = null;
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      player?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the actual video changes
  }, [embed.embedUrl]);

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
              ref={iframeRef}
              src={embed.embedUrl}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              suppressHydrationWarning
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
