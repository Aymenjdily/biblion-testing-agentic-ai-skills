"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";
import { clsx } from "@/lib/clsx";
import { ChevronDownIcon } from "@/components/icons";
import { CourseCard } from "@/components/catalog/CourseCard";
import type { Category, CourseListItem } from "@/sanity/lib/queries";
import type { MockProgress } from "@/lib/mock-progress";

type SortKey = "popular" | "rating" | "price" | "newest";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most Popular" },
  { key: "rating", label: "Highest Rated" },
  { key: "price", label: "Price: Low to High" },
  { key: "newest", label: "Newest" },
];

function sortCourses(courses: CourseListItem[], key: SortKey): CourseListItem[] {
  const sorted = [...courses];
  switch (key) {
    case "popular":
      return sorted.sort((a, b) => b.studentCount - a.studentCount);
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "price":
      return sorted.sort((a, b) => a.price - b.price);
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime(),
      );
  }
}

export function CatalogExplorer({
  courses,
  categories,
  enrolledProgress,
}: {
  courses: CourseListItem[];
  categories: Category[];
  enrolledProgress: Map<string, MockProgress>;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [sortOpen]);

  const filtered = useMemo(() => {
    const scoped =
      selectedCategory == null
        ? courses
        : courses.filter((c) => c.category.slug === selectedCategory);
    return sortCourses(scoped, sortKey);
  }, [courses, selectedCategory, sortKey]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)!.label;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => { setSelectedCategory(null); posthog.capture("catalog_category_filtered", { category: "all" }); }}
            className={clsx(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory == null
                ? "bg-ink-900 text-white"
                : "border border-border bg-surface text-ink-900 hover:bg-neutral-50",
            )}
          >
            All courses
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => { setSelectedCategory(category.slug); posthog.capture("catalog_category_filtered", { category: category.slug, category_title: category.title }); }}
              className={clsx(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === category.slug
                  ? "bg-ink-900 text-white"
                  : "border border-border bg-surface text-ink-900 hover:bg-neutral-50",
              )}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-neutral-500 transition-colors hover:text-ink-900"
          >
            {activeSortLabel.toUpperCase()}
            <ChevronDownIcon className="h-3 w-3" />
          </button>

          {sortOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-control border border-border bg-surface shadow-[0_4px_16px_rgba(28,25,23,0.1)]">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setSortKey(option.key);
                    setSortOpen(false);
                    posthog.capture("catalog_sort_changed", { sort_key: option.key, sort_label: option.label });
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

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-neutral-500">
          No courses in this category yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, index) => (
            <CourseCard
              key={course._id}
              course={course}
              index={index}
              progress={enrolledProgress.get(course._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
