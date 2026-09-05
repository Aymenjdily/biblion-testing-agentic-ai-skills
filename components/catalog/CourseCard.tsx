import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PlayIcon, RatingIcon, NextIcon } from "@/components/icons";
import { formatDurationTotal, toSeconds } from "@/lib/duration";
import { formatCompactNumber } from "@/lib/format";
import type { CourseListItem } from "@/sanity/lib/queries";
import type { MockProgress } from "@/lib/mock-progress";

const LEVEL_LABEL: Record<CourseListItem["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// Decorative header tints — purely presentational card variety (the reference
// design uses flat color blocks, not photos), built from existing tokens via
// color-mix rather than introducing new brand colors.
const HEADER_TINTS = [
  "var(--color-ink-900)",
  "color-mix(in srgb, var(--color-ember-800) 55%, black)",
  "color-mix(in srgb, var(--color-neutral-700) 65%, black)",
  "color-mix(in srgb, var(--color-ember-600) 50%, black)",
];

export function CourseCard({
  course,
  index,
  progress,
}: {
  course: CourseListItem;
  index: number;
  progress?: MockProgress;
}) {
  const lessonSeconds = course.lessonDurations.flat().map(toSeconds);
  const lessonCount = lessonSeconds.length;
  const totalSeconds = lessonSeconds.reduce((sum, seconds) => sum + seconds, 0);
  const introDuration = lessonSeconds[0] ?? null;
  const tint = HEADER_TINTS[index % HEADER_TINTS.length];

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-shadow hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)]"
    >
      <div
        className="relative flex h-48 flex-col justify-between overflow-hidden p-5"
        style={{ background: tint }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 100% 0%, color-mix(in srgb, var(--color-ember-400) 20%, transparent), transparent 70%)",
          }}
        />

        <div className="relative flex items-start justify-between">
          {course.code && (
            <p className="font-mono text-[11px] tracking-[0.14em] text-neutral-400">
              {course.code}
            </p>
          )}
          {course.popular ? (
            <Badge variant="soft">Popular</Badge>
          ) : course.isNew ? (
            <Badge variant="popular">New</Badge>
          ) : null}
        </div>

        <div className="relative">
          <h3 className="font-display text-xl font-bold leading-tight text-white">
            {course.title}
          </h3>
          {introDuration != null && (
            <div className="mt-3 flex items-center gap-2.5 text-[13px] text-white/85">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <PlayIcon className="h-2.5 w-2.5 translate-x-px text-white" />
              </span>
              Intro · {formatDurationTotal(introDuration)}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] tracking-wide text-ember-600">
          {course.category.title.toUpperCase()} · {LEVEL_LABEL[course.level].toUpperCase()}
        </p>

        <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
          <span>{course.instructor.name}</span>
          {course.rating != null && (
            <span className="flex items-center gap-1">
              ·
              <RatingIcon className="h-3 w-3 text-ember-500" />
              {course.rating.toFixed(1)}
              {course.ratingCount != null && (
                <span className="text-neutral-400">
                  ({formatCompactNumber(course.ratingCount)})
                </span>
              )}
            </span>
          )}
        </div>

        <div className="mt-3 border-t border-border pt-3">
          {progress ? (
            <div>
              <p className="font-mono text-[11px] tracking-wide text-ember-600">ENROLLED</p>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="font-display text-base font-bold text-ink-900">
                  {progress.percent}%
                </span>
                <ProgressBar value={progress.percent} max={100} className="flex-1" />
                <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-ember-600">
                  Resume
                  <NextIcon className="h-3 w-3" />
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ink-900">
                ${course.price}
              </span>
              <span className="font-mono text-[11px] tracking-wide text-neutral-400">
                {lessonCount} LESSONS · {formatDurationTotal(totalSeconds).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
