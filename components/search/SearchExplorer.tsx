"use client";

import { useMemo, useState } from "react";
import { clsx } from "@/lib/clsx";
import { ChevronDownIcon, CourseIcon, PlayIcon } from "@/components/icons";
import { LessonResultCard } from "@/components/search/LessonResultCard";
import { VideoResultCard } from "@/components/search/VideoResultCard";
import { SearchSidebar } from "@/components/search/SearchSidebar";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { RecentSearches } from "@/components/search/RecentSearches";
import { toSeconds } from "@/lib/duration";
import type { SearchResultItem } from "@/lib/search";
import type { CourseCard, SearchStats } from "@/sanity/lib/queries";

export type ClipLength = "any" | "short" | "medium" | "long";
type SortKey = "relevant" | "course";
type Level = NonNullable<CourseCard["level"]>;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevant", label: "Most Relevant" },
  { key: "course", label: "Course (A–Z)" },
];

const PAGE_SIZE = 8;

function matchesClipLength(durationSeconds: number, filter: ClipLength): boolean {
  if (filter === "any") return true;
  if (filter === "short") return durationSeconds < 300;
  if (filter === "medium") return durationSeconds >= 300 && durationSeconds < 900;
  return durationSeconds >= 900;
}

export function SearchExplorer({
  query,
  results,
  stats,
}: {
  query: string;
  results: SearchResultItem[];
  stats: SearchStats;
}) {
  const [showMoments, setShowMoments] = useState(true);
  const [showLessons, setShowLessons] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<Set<Level>>(new Set());
  const [clipLength, setClipLength] = useState<ClipLength>("any");
  const [sortKey, setSortKey] = useState<SortKey>("relevant");
  const [sortOpen, setSortOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const momentCount = results.filter((r) => r.kind === "video").length;
  const lessonCount = results.filter((r) => r.kind === "lesson").length;

  const courses = useMemo(() => {
    const byCourse = new Map<string, { title: string; count: number }>();
    for (const r of results) {
      const ctx = r.lesson.context;
      if (!ctx) continue;
      const existing = byCourse.get(ctx.courseSlug);
      byCourse.set(ctx.courseSlug, {
        title: ctx.courseTitle,
        count: (existing?.count ?? 0) + 1,
      });
    }
    return Array.from(byCourse.entries())
      .map(([slug, v]) => ({ slug, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (r.kind === "video" && !showMoments) return false;
      if (r.kind === "lesson" && !showLessons) return false;

      const ctx = r.lesson.context;
      if (selectedCourses.size > 0 && (!ctx || !selectedCourses.has(ctx.courseSlug))) return false;
      if (selectedLevels.size > 0 && (!ctx?.courseLevel || !selectedLevels.has(ctx.courseLevel)))
        return false;
      if (!matchesClipLength(toSeconds(r.lesson.duration), clipLength)) return false;

      return true;
    });
  }, [results, showMoments, showLessons, selectedCourses, selectedLevels, clipLength]);

  const sorted = useMemo(() => {
    if (sortKey === "relevant") return filtered;
    return [...filtered].sort((a, b) =>
      (a.lesson.context?.courseTitle ?? "").localeCompare(b.lesson.context?.courseTitle ?? ""),
    );
  }, [filtered, sortKey]);

  const visible = showAll ? sorted : sorted.slice(0, PAGE_SIZE);
  const activeSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)!.label;

  function toggleFromSet<T>(set: Set<T>, value: T, setSet: (next: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSet(next);
  }

  function reset() {
    setShowMoments(true);
    setShowLessons(true);
    setSelectedCourses(new Set());
    setSelectedLevels(new Set());
    setClipLength("any");
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowMoments(true);
                setShowLessons(true);
              }}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                showMoments && showLessons
                  ? "bg-ink-900 text-white"
                  : "border border-border bg-surface text-ink-900 hover:bg-neutral-50",
              )}
            >
              All · {results.length}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMoments(true);
                setShowLessons(false);
              }}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                showMoments && !showLessons
                  ? "bg-ink-900 text-white"
                  : "border border-border bg-surface text-ink-900 hover:bg-neutral-50",
              )}
            >
              <PlayIcon className="h-3 w-3" />
              Moments · {momentCount}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMoments(false);
                setShowLessons(true);
              }}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                !showMoments && showLessons
                  ? "bg-ink-900 text-white"
                  : "border border-border bg-surface text-ink-900 hover:bg-neutral-50",
              )}
            >
              <CourseIcon className="h-3 w-3" />
              Lessons · {lessonCount}
            </button>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-neutral-500 transition-colors hover:text-ink-900"
            >
              {activeSortLabel.toUpperCase()}
              <ChevronDownIcon className="h-3 w-3" />
            </button>

            {sortOpen && (
              <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-control border border-border bg-surface shadow-[0_4px_16px_rgba(28,25,23,0.1)]">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setSortKey(option.key);
                      setSortOpen(false);
                    }}
                    className={clsx(
                      "block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50",
                      option.key === sortKey ? "font-semibold text-ember-600" : "text-ink-900",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="mt-6">
            <SearchEmptyState query={query} onClearFilters={results.length > 0 ? reset : undefined} />
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {visible.map((result, index) =>
                result.kind === "video" ? (
                  <VideoResultCard
                    key={`${result.lessonId}-${result.matchedSecond}`}
                    result={result}
                    index={index}
                    query={query}
                  />
                ) : (
                  <LessonResultCard
                    key={result.lessonId}
                    result={result}
                    index={index}
                    query={query}
                  />
                ),
              )}
            </div>

            {!showAll && sorted.length > PAGE_SIZE && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 rounded-control border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:bg-neutral-50"
                >
                  Show all {sorted.length} results ↓
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <SearchSidebar
          momentCount={momentCount}
          lessonCount={lessonCount}
          showMoments={showMoments}
          showLessons={showLessons}
          onToggleMoments={() => setShowMoments((v) => !v)}
          onToggleLessons={() => setShowLessons((v) => !v)}
          courses={courses}
          selectedCourses={selectedCourses}
          onToggleCourse={(slug) => toggleFromSet(selectedCourses, slug, setSelectedCourses)}
          coursesExpanded={coursesExpanded}
          onExpandCourses={() => setCoursesExpanded(true)}
          selectedLevels={selectedLevels}
          onToggleLevel={(level) => toggleFromSet(selectedLevels, level, setSelectedLevels)}
          clipLength={clipLength}
          onSetClipLength={setClipLength}
          onReset={reset}
          stats={stats}
        />
        <RecentSearches currentQuery={query} />
      </div>
    </div>
  );
}
