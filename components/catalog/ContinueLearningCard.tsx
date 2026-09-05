"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PlayIcon } from "@/components/icons";
import type { MockProgress } from "@/lib/mock-progress";

export function ContinueLearningCard({
  courseTitle,
  progress,
}: {
  courseTitle: string;
  progress: MockProgress;
}) {
  const { resume } = progress;
  if (!resume) return null;

  return (
    <div className="flex items-center gap-6 rounded-card border border-border border-l-2 border-l-ember-600 bg-surface p-5">
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-semibold text-ink-900">{courseTitle}</h3>
        <p className="mt-1 truncate font-mono text-[11px] tracking-wide text-neutral-500">
          MODULE {String(resume.lesson.moduleIndex + 1).padStart(2, "0")} · LESSON{" "}
          {resume.lesson.moduleIndex + 1}.{resume.lesson.lessonIndex + 1} —{" "}
          {resume.lesson.title.toUpperCase()}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={progress.percent} max={100} className="flex-1" />
          <span className="shrink-0 text-sm font-semibold text-ink-900">{progress.percent}%</span>
        </div>
      </div>

      <Link
        href={`/lessons/${resume.lesson.slug}?start=${resume.resumeSeconds}`}
        onClick={() =>
          posthog.capture("resume_used", {
            lesson_slug: resume.lesson.slug,
            resume_seconds: resume.resumeSeconds,
            progress_percent: progress.percent,
            surface: "catalog_continue_card",
          })
        }
        className="flex h-10 shrink-0 items-center gap-2 rounded-control bg-soft px-4 text-[13px] font-medium text-ember-700 transition-colors hover:bg-ember-100"
      >
        <PlayIcon className="h-3 w-3 translate-x-px" />
        Resume
      </Link>
    </div>
  );
}
