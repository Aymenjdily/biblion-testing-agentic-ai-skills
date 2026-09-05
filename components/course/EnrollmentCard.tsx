"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { InfinityIcon, SavedIcon, CertificateIcon, UndoIcon } from "@/components/icons";
import type { MockProgress } from "@/lib/mock-progress";

export function EnrollmentCard({
  progress,
  resourceCount,
  firstLessonSlug,
}: {
  progress: MockProgress;
  resourceCount: number;
  firstLessonSlug: string | undefined;
}) {
  const { resume } = progress;

  return (
    <div className="rounded-card border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-wide text-ember-600">YOU&apos;RE ENROLLED</p>
        <p className="font-display text-lg font-bold text-ink-900">{progress.percent}%</p>
      </div>

      <ProgressBar value={progress.percent} max={100} className="mt-3" />

      <p className="mt-2 text-sm text-neutral-500">
        {progress.completedCount} of {progress.totalLessons} lessons completed
      </p>

      {resume ? (
        <Link
          href={`/lessons/${resume.lesson.slug}?start=${resume.resumeSeconds}`}
          className="mt-5 block"
          onClick={() =>
            posthog.capture("lesson_resumed", {
              lesson_slug: resume.lesson.slug,
              resume_seconds: resume.resumeSeconds,
              progress_percent: progress.percent,
            })
          }
        >
          <Button className="w-full">
            Resume · Lesson {resume.lesson.moduleIndex + 1}.{resume.lesson.lessonIndex + 1}
          </Button>
        </Link>
      ) : firstLessonSlug ? (
        <Link
          href={`/lessons/${firstLessonSlug}?start=0`}
          className="mt-5 block"
          onClick={() =>
            posthog.capture("lesson_started", {
              lesson_slug: firstLessonSlug,
            })
          }
        >
          <Button className="w-full">Start course</Button>
        </Link>
      ) : null}

      <span className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-500">
        <UndoIcon className="h-3.5 w-3.5" />
        Start over
      </span>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-neutral-600">
        <span className="flex items-center gap-2">
          <InfinityIcon className="h-3.5 w-3.5 text-neutral-500" />
          Lifetime access
        </span>
        <span className="flex items-center gap-2">
          <SavedIcon className="h-3.5 w-3.5 text-neutral-500" />
          {resourceCount} resources
        </span>
        <span className="flex items-center gap-2">
          <CertificateIcon className="h-3.5 w-3.5 text-neutral-500" />
          Certificate
        </span>
      </div>
    </div>
  );
}
