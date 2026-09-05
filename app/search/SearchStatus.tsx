"use client";

import { useSearchParams } from "next/navigation";
import { SearchField } from "@/components/ui/SearchField";
import { Button } from "@/components/ui/Button";

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-ember-200 border-t-ember-600"
    />
  );
}

function StatusRow({ query }: { query: string }) {
  return (
    <>
      <form className="mt-5 flex gap-3" onSubmit={(e) => e.preventDefault()}>
        <SearchField
          name="q"
          defaultValue={query}
          readOnly
          placeholder="Search every lesson, chapter, and moment..."
          shortcut
          shortcutLabel="⌘K"
          className="flex-1"
        />
        <Button type="submit" className="px-6" disabled>
          Search
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-2.5 text-sm text-neutral-500">
        <Spinner />
        {query ? (
          <span>
            Searching for <span className="font-medium text-ink-900">&ldquo;{query}&rdquo;</span>
            &hellip;
          </span>
        ) : (
          <span>Searching&hellip;</span>
        )}
      </div>
    </>
  );
}

/**
 * Static fallback for the Suspense boundary around SearchStatus in
 * app/search/loading.tsx — no useSearchParams call, so it's safe to
 * prerender. Shown for the instant before the real query is known.
 */
export function SearchStatusFallback() {
  return <StatusRow query="" />;
}

/**
 * The query-dependent part of the search loading skeleton. useSearchParams
 * needs its own Suspense boundary (see SearchStatusFallback above), which is
 * why this is split out of app/search/loading.tsx rather than inlined.
 */
export function SearchStatus() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  return <StatusRow query={query} />;
}
