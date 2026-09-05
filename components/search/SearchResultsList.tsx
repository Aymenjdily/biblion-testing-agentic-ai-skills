"use client";

import { useMemo, useState } from "react";
import { clsx } from "@/lib/clsx";
import { ChevronDownIcon } from "@/components/icons";
import { LessonResultCard } from "@/components/search/LessonResultCard";
import { VideoResultCard } from "@/components/search/VideoResultCard";
import type { SearchResultItem } from "@/lib/search";

type SortKey = "relevant" | "course";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevant", label: "Most Relevant" },
  { key: "course", label: "Course (A–Z)" },
];

function sortResults(results: SearchResultItem[], key: SortKey): SearchResultItem[] {
  if (key === "relevant") return results;
  return [...results].sort((a, b) =>
    (a.lesson.context?.courseTitle ?? "").localeCompare(b.lesson.context?.courseTitle ?? ""),
  );
}

export function SearchResultsList({ results }: { results: SearchResultItem[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("relevant");
  const [sortOpen, setSortOpen] = useState(false);

  const sorted = useMemo(() => sortResults(results, sortKey), [results, sortKey]);
  const activeLabel = SORT_OPTIONS.find((o) => o.key === sortKey)!.label;

  return (
    <div>
      <div className="flex justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-neutral-500 transition-colors hover:text-ink-900"
          >
            {activeLabel.toUpperCase()}
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

      <div className="mt-4 space-y-4">
        {sorted.map((result) =>
          result.kind === "video" ? (
            <VideoResultCard key={`${result.lessonId}-${result.matchedSecond}`} result={result} />
          ) : (
            <LessonResultCard key={result.lessonId} result={result} />
          ),
        )}
      </div>
    </div>
  );
}
