"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClockIcon, NextIcon } from "@/components/icons";
import { getRecentSearches, pushRecentSearch } from "@/lib/recent-searches";

export function RecentSearches({ currentQuery }: { currentQuery: string }) {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    if (currentQuery) pushRecentSearch(currentQuery);
    setSearches(getRecentSearches());
  }, [currentQuery]);

  if (searches.length === 0) return null;

  return (
    <div>
      <p className="font-mono text-[11px] tracking-wide text-neutral-400">RECENT SEARCHES</p>
      <div className="mt-3 space-y-1">
        {searches.map((query) => (
          <Link
            key={query}
            href={`/search?q=${encodeURIComponent(query)}`}
            className="flex items-center gap-2.5 rounded-control px-1 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-ink-900"
          >
            <ClockIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="min-w-0 flex-1 truncate">{query}</span>
            <NextIcon className="h-3 w-3 shrink-0 text-neutral-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
