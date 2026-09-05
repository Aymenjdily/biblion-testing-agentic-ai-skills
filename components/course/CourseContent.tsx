"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CheckIcon, PlayIcon, ChevronDownIcon } from "@/components/icons";
import { formatClock, formatDurationTotal, toSeconds } from "@/lib/duration";
import { toPlainText } from "@/lib/plain-text";
import type { CourseDetail } from "@/sanity/lib/queries";
import type { MockProgress } from "@/lib/mock-progress";

const VISIBLE_MODULES = 2;

export function CourseContent({
  course,
  progress,
  totalLessons,
  totalDurationLabel,
}: {
  course: CourseDetail;
  progress: MockProgress;
  totalLessons: number;
  totalDurationLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const modules = expanded ? course.modules : course.modules.slice(0, VISIBLE_MODULES);
  const hiddenCount = course.modules.length - VISIBLE_MODULES;

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 md:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-3xl font-bold text-ink-900">Course content</h2>
          <p className="font-mono text-[11px] tracking-wide text-neutral-400">
            {course.modules.length} MODULES · {totalLessons} LESSONS · {totalDurationLabel.toUpperCase()}{" "}
            TOTAL
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {modules.map((courseModule, moduleIndex) => {
            const moduleSeconds = courseModule.lessons.reduce(
              (sum, l) => sum + toSeconds(l.duration),
              0,
            );

            return (
              <div key={courseModule._key}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[11px] tracking-wide text-ember-600">
                      MODULE {String(moduleIndex + 1).padStart(2, "0")}{" "}
                      <span className="ml-2 font-display text-base font-semibold text-ink-900">
                        {courseModule.title}
                      </span>
                    </p>
                    {courseModule.summary && (
                      <p className="mt-1 text-sm text-neutral-500">
                        {toPlainText(courseModule.summary)}
                      </p>
                    )}
                  </div>
                  <p className="font-mono text-[11px] tracking-wide text-neutral-400">
                    {courseModule.lessons.length} LESSONS ·{" "}
                    {formatDurationTotal(moduleSeconds).toUpperCase()}
                  </p>
                </div>

                <div className="mt-4 divide-y divide-border rounded-card border border-border">
                  {courseModule.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = progress.completedLessonIds.has(lesson._id);
                    const isResume = progress.resume?.lesson._id === lesson._id;

                    return (
                      <Link
                        key={lesson._id}
                        href={
                          isResume
                            ? `/lessons/${lesson.slug}?start=${progress.resume?.resumeSeconds}`
                            : `/lessons/${lesson.slug}`
                        }
                        className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors ${
                          isResume ? "border-l-2 border-ember-600 bg-soft/60" : "hover:bg-neutral-50"
                        }`}
                      >
                        {isCompleted ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success">
                            <CheckIcon className="h-2.5 w-2.5 text-white" strokeWidth={2.4} />
                          </span>
                        ) : isResume ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember-600">
                            <PlayIcon className="h-2 w-2 translate-x-px text-white" />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-300">
                            <PlayIcon className="h-2 w-2 translate-x-px text-neutral-400" />
                          </span>
                        )}

                        <span
                          className={`w-9 shrink-0 font-mono text-[13px] ${
                            isCompleted || isResume ? "text-neutral-500" : "text-neutral-400"
                          }`}
                        >
                          {moduleIndex + 1}.{lessonIndex + 1}
                        </span>

                        <span
                          className={`min-w-35 flex-1 text-[15px] sm:truncate ${
                            isResume
                              ? "font-semibold text-ink-900"
                              : isCompleted
                                ? "text-ink-900"
                                : "text-neutral-500"
                          }`}
                        >
                          {lesson.title}
                        </span>

                        <span className="ml-auto flex shrink-0 items-center gap-3">
                          {lesson.freePreview && <Badge variant="soft">Free preview</Badge>}

                          {isResume && (
                            <span className="font-mono text-[11px] tracking-wide text-ember-600">
                              RESUME {formatClock(progress.resume?.resumeSeconds ?? 0)}
                            </span>
                          )}

                          <span className="font-mono text-[13px] tabular-nums text-neutral-400">
                            {formatClock(toSeconds(lesson.duration))}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {!expanded && hiddenCount > 0 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-2 font-mono text-[13px] font-medium text-ember-600 transition-colors hover:text-ember-700"
            >
              Show all {course.modules.length} modules
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

