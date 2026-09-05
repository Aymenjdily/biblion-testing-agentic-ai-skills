"use client";

import { useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CheckIcon, ChevronDownIcon, PlayIcon } from "@/components/icons";
import { formatClock, toSeconds } from "@/lib/duration";
import { flattenLessons, computeLessonProgress } from "@/lib/mock-progress";
import { useLessonProgress } from "@/components/lesson/LessonProgressContext";
import { clsx } from "@/lib/clsx";
import type { CourseDetail } from "@/sanity/lib/queries";

export function LessonSidebar({
  course,
  currentLessonId,
}: {
  course: CourseDetail;
  currentLessonId: string;
}) {
  const { completed } = useLessonProgress();
  const flat = flattenLessons(course);
  const progress = computeLessonProgress(course, currentLessonId);
  const currentModuleIndex = flat[progress.currentIndex]?.moduleIndex ?? 0;
  const [expandedModule, setExpandedModule] = useState<number | null>(currentModuleIndex);

  const nextLesson = progress.currentIndex >= 0 ? flat[progress.currentIndex + 1] : undefined;
  const percent = completed
    ? Math.round(((progress.currentIndex + 1) / progress.totalLessons) * 100)
    : progress.percent;

  return (
    <div className="flex flex-col gap-4">
      {nextLesson && (
        <Link
          href={`/lessons/${nextLesson.slug}`}
          className="block rounded-card bg-ink-900 p-5 transition-colors hover:bg-neutral-800"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] tracking-wide text-neutral-400">UP NEXT</p>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember-600">
              <PlayIcon className="h-3 w-3 translate-x-px text-white" />
            </span>
          </div>
          <p className="mt-2 font-display text-lg font-semibold text-white">
            {nextLesson.moduleIndex + 1}.{nextLesson.lessonIndex + 1} · {nextLesson.title}
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-wide text-neutral-400">
            {formatClock(toSeconds(nextLesson.duration))}
          </p>
        </Link>
      )}

      <div className="rounded-card border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink-900">{course.title}</h3>
          <span className="font-display text-sm font-bold text-ember-600">{percent}%</span>
        </div>
        <ProgressBar value={percent} max={100} className="mt-3" />

        <div className="mt-5 space-y-1">
          {course.modules.map((courseModule, moduleIndex) => {
            const isExpanded = expandedModule === moduleIndex;
            const completedInModule = courseModule.lessons.filter(
              (l) =>
                progress.completedLessonIds.has(l._id) ||
                (completed && l._id === currentLessonId),
            ).length;

            return (
              <div key={courseModule._key} className="border-b border-border pb-1 last:border-0">
                <button
                  type="button"
                  onClick={() => setExpandedModule(isExpanded ? null : moduleIndex)}
                  className="flex w-full items-center justify-between gap-2 py-2.5 text-left"
                >
                  <span>
                    <span className="block font-mono text-[10px] tracking-wide text-neutral-400">
                      MODULE {String(moduleIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-ink-900">{courseModule.title}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-[11px] text-neutral-400">
                      {completedInModule}/{courseModule.lessons.length}
                    </span>
                    <ChevronDownIcon
                      className={clsx(
                        "h-3.5 w-3.5 text-neutral-400 transition-transform",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-0.5 pb-2">
                    {courseModule.lessons.map((lesson, lessonIndex) => {
                      const isCurrent = lesson._id === currentLessonId;
                      const isDone =
                        progress.completedLessonIds.has(lesson._id) || (completed && isCurrent);

                      return (
                        <Link
                          key={lesson._id}
                          href={`/lessons/${lesson.slug}`}
                          className={clsx(
                            "flex items-center gap-3 rounded-control px-2 py-2 text-sm transition-colors",
                            isCurrent ? "bg-soft" : "hover:bg-neutral-50",
                          )}
                        >
                          {isDone ? (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success">
                              <CheckIcon className="h-2 w-2 text-white" strokeWidth={2.6} />
                            </span>
                          ) : isCurrent ? (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ember-600">
                              <PlayIcon className="h-1.5 w-1.5 translate-x-px text-white" />
                            </span>
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-neutral-300" />
                          )}

                          <span
                            className={clsx(
                              "min-w-0 flex-1 truncate",
                              isCurrent ? "font-semibold text-ink-900" : "text-neutral-600",
                            )}
                          >
                            {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                          </span>

                          <span className="shrink-0 font-mono text-[11px] text-neutral-400">
                            {formatClock(toSeconds(lesson.duration))}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
