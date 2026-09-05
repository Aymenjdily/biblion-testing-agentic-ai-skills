"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { clsx } from "@/lib/clsx";
import type { CourseCard, SearchStats } from "@/sanity/lib/queries";
import type { ClipLength } from "@/components/search/SearchExplorer";

type CourseFacet = { slug: string; title: string; count: number };
type Level = CourseCard["level"];

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const CLIP_LENGTHS: { key: ClipLength; label: string }[] = [
  { key: "any", label: "Any" },
  { key: "short", label: "Under 5m" },
  { key: "medium", label: "5–15m" },
  { key: "long", label: "15m+" },
];

const VISIBLE_COURSES = 5;

export function SearchSidebar({
  momentCount,
  lessonCount,
  showMoments,
  showLessons,
  onToggleMoments,
  onToggleLessons,
  courses,
  selectedCourses,
  onToggleCourse,
  coursesExpanded,
  onExpandCourses,
  selectedLevels,
  onToggleLevel,
  clipLength,
  onSetClipLength,
  onReset,
  stats,
}: {
  momentCount: number;
  lessonCount: number;
  showMoments: boolean;
  showLessons: boolean;
  onToggleMoments: () => void;
  onToggleLessons: () => void;
  courses: CourseFacet[];
  selectedCourses: Set<string>;
  onToggleCourse: (slug: string) => void;
  coursesExpanded: boolean;
  onExpandCourses: () => void;
  selectedLevels: Set<NonNullable<Level>>;
  onToggleLevel: (level: NonNullable<Level>) => void;
  clipLength: ClipLength;
  onSetClipLength: (value: ClipLength) => void;
  onReset: () => void;
  stats: SearchStats;
}) {
  const visibleCourses = coursesExpanded ? courses : courses.slice(0, VISIBLE_COURSES);
  const hiddenCourseCount = courses.length - VISIBLE_COURSES;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Refine results</h2>
          <button
            type="button"
            onClick={onReset}
            className="font-mono text-[11px] tracking-wide text-ember-600 transition-colors hover:text-ember-700"
          >
            RESET
          </button>
        </div>

        <div className="mt-5">
          <p className="font-mono text-[11px] tracking-wide text-neutral-400">TYPE</p>
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <Checkbox label="Video moments" checked={showMoments} onChange={onToggleMoments} />
              <span className="font-mono text-[11px] text-neutral-400">{momentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <Checkbox label="Lessons" checked={showLessons} onChange={onToggleLessons} />
              <span className="font-mono text-[11px] text-neutral-400">{lessonCount}</span>
            </div>
          </div>
        </div>

        {courses.length > 0 && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="font-mono text-[11px] tracking-wide text-neutral-400">COURSE</p>
            <div className="mt-3 space-y-2.5">
              {visibleCourses.map((course) => (
                <div key={course.slug} className="flex items-center justify-between">
                  <Checkbox
                    label={course.title}
                    checked={selectedCourses.has(course.slug)}
                    onChange={() => onToggleCourse(course.slug)}
                  />
                  <span className="font-mono text-[11px] text-neutral-400">{course.count}</span>
                </div>
              ))}
            </div>
            {!coursesExpanded && hiddenCourseCount > 0 && (
              <button
                type="button"
                onClick={onExpandCourses}
                className="mt-2.5 font-mono text-[11px] tracking-wide text-ember-600 transition-colors hover:text-ember-700"
              >
                Show {hiddenCourseCount} more ↓
              </button>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-border pt-5">
          <p className="font-mono text-[11px] tracking-wide text-neutral-400">LEVEL</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onToggleLevel(level as NonNullable<Level>)}
                className={clsx(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors",
                  selectedLevels.has(level as NonNullable<Level>)
                    ? "bg-ink-900 text-white"
                    : "border border-border bg-surface text-ink-900 hover:bg-neutral-50",
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <p className="font-mono text-[11px] tracking-wide text-neutral-400">CLIP LENGTH</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CLIP_LENGTHS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => onSetClipLength(option.key)}
                className={clsx(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  clipLength === option.key
                    ? "bg-ink-900 text-white"
                    : "border border-border bg-surface text-ink-900 hover:bg-neutral-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-card bg-ink-900 p-5">
        <h3 className="font-display text-lg font-bold text-white">No luck?</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Browse the full catalog of {stats.courseCount} course{stats.courseCount === 1 ? "" : "s"} and{" "}
          {stats.momentCount}+ searchable video moments.
        </p>
        <Link href="/catalog" className="mt-4 block">
          <Button className="w-full">Open catalog →</Button>
        </Link>
      </div>
    </div>
  );
}
