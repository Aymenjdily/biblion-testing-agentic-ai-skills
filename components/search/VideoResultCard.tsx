"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { urlFor } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/Badge";
import { PlayIcon, NextIcon } from "@/components/icons";
import { InlineMarkdown } from "@/components/search/InlineMarkdown";
import { formatClock, toSeconds } from "@/lib/duration";
import type { SearchResultItem } from "@/lib/search";

export function VideoResultCard({
  result,
  index,
  query,
}: {
  result: SearchResultItem;
  index: number;
  query: string;
}) {
  const { lesson, matchedSecond, momentLabel } = result;
  const { context } = lesson;
  const startSeconds = matchedSecond ?? 0;
  const durationSeconds = toSeconds(lesson.duration);
  const positionPercent = durationSeconds > 0 ? (startSeconds / durationSeconds) * 100 : 0;

  return (
    <Link
      href={`/lessons/${lesson.slug}?start=${startSeconds}`}
      onClick={() =>
        posthog.capture("search_result_opened", {
          result_type: "video",
          query,
          position: index + 1,
          lesson_slug: lesson.slug,
          matched_second: startSeconds,
        })
      }
      className="flex items-start gap-4 rounded-card border border-border bg-surface p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)]"
    >
      <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-neutral-700 to-ink-900">
        {lesson.poster?.asset && (
          <Image
            src={urlFor(lesson.poster).width(288).height(192).url()}
            alt=""
            fill
            className="object-cover opacity-70"
          />
        )}
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <PlayIcon className="h-3.5 w-3.5 translate-x-px text-white" />
        </span>
        <span className="absolute bottom-1.5 right-1.5 rounded bg-ink-900/80 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-white">
          CLIP {formatClock(durationSeconds)}
        </span>
        <div className="absolute inset-x-2 bottom-6 h-1 rounded-full bg-white/25">
          <span
            className="absolute -top-0.5 h-2 w-2 rounded-full bg-ember-500"
            style={{ left: `calc(${Math.min(100, Math.max(0, positionPercent))}% - 4px)` }}
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <span className="shrink-0 font-mono text-[13px] text-neutral-300">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Badge variant="soft">Moment</Badge>
          <p className="min-w-0 font-mono text-[11px] tracking-wide text-ember-600">
            {context ? (
              <>
                {context.courseTitle.toUpperCase()} · MODULE{" "}
                {String(context.moduleIndex + 1).padStart(2, "0")} · LESSON {context.moduleIndex + 1}.
                {context.lessonIndex + 1}
              </>
            ) : (
              "LESSON"
            )}
          </p>
        </div>

        <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">{lesson.title}</h3>
        <p className="mt-1 text-sm text-neutral-600">
          <InlineMarkdown>{result.description}</InlineMarkdown>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="flex h-8 items-center gap-1.5 rounded-full bg-ink-900 px-3.5 font-mono text-[12px] text-white">
            <PlayIcon className="h-2.5 w-2.5" />
            {formatClock(startSeconds)}
          </span>
          {momentLabel && (
            <span className="text-[13px] text-neutral-500">
              {momentLabel === "Transcript" ? "Transcript match" : `Chapter · ${momentLabel}`}
            </span>
          )}
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-sm font-medium text-ember-600">
            Watch from {formatClock(startSeconds)}
            <NextIcon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
