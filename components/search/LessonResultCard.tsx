"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { Badge } from "@/components/ui/Badge";
import { CourseIcon, NextIcon, CheckIcon } from "@/components/icons";
import { InlineMarkdown } from "@/components/search/InlineMarkdown";
import { formatClock, toSeconds } from "@/lib/duration";
import type { SearchResultItem } from "@/lib/search";

export function LessonResultCard({
  result,
  index,
  query,
}: {
  result: SearchResultItem;
  index: number;
  query: string;
}) {
  const { lesson } = result;
  const { context } = lesson;

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      onClick={() =>
        posthog.capture("search_result_opened", {
          result_type: "lesson",
          query,
          position: index + 1,
          lesson_slug: lesson.slug,
        })
      }
      className="flex items-start gap-4 rounded-card border border-border bg-surface p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-soft text-ember-600">
        <CourseIcon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="shrink-0 font-mono text-[13px] text-neutral-300">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Badge variant="neutral">Lesson</Badge>
            <p className="min-w-0 font-mono text-[11px] tracking-wide text-ember-600">
              {context ? (
                <>
                  {context.courseTitle.toUpperCase()} · LESSON {context.moduleIndex + 1}.
                  {context.lessonIndex + 1} · MODULE {String(context.moduleIndex + 1).padStart(2, "0")}
                </>
              ) : (
                "LESSON"
              )}
            </p>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-neutral-400">
            {formatClock(toSeconds(lesson.duration))}
          </span>
        </div>

        <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">{lesson.title}</h3>
        <p className="mt-1 text-sm text-neutral-600">
          <InlineMarkdown>{result.description}</InlineMarkdown>
        </p>

        {lesson.keyPoints.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {lesson.keyPoints.slice(0, 3).map((point) => (
              <span
                key={point}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-neutral-600"
              >
                <CheckIcon className="h-2.5 w-2.5 shrink-0 text-ember-600" strokeWidth={2.6} />
                {point}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <span className="flex items-center gap-1.5 text-sm font-medium text-ember-600">
            Open lesson
            <NextIcon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
