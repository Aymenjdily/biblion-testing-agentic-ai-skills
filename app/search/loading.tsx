import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchStatus, SearchStatusFallback } from "@/app/search/SearchStatus";

function ResultCardSkeleton({ withThumbnail = false }: { withThumbnail?: boolean }) {
  return (
    <div className="flex items-start gap-4 rounded-card border border-border bg-surface p-5">
      {withThumbnail ? (
        <div className="h-24 w-36 shrink-0 animate-pulse rounded-lg bg-neutral-200" />
      ) : (
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-control bg-neutral-200" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-5 animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-3 w-36 animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2.5 h-3.5 w-full animate-pulse rounded bg-neutral-100" />
        <div className="mt-1.5 h-3.5 w-4/5 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-border bg-surface p-5">
        <div className="h-5 w-28 animate-pulse rounded bg-neutral-200" />

        <div className="mt-5 space-y-2.5">
          <div className="h-2.5 w-10 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
        </div>

        <div className="mt-5 space-y-2.5 border-t border-border pt-5">
          <div className="h-2.5 w-14 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-neutral-100" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-neutral-100" />
          ))}
        </div>
      </div>

      <div className="h-36 animate-pulse rounded-card bg-neutral-100" />
    </div>
  );
}

export default function SearchLoading() {
  return (
    <div className="flex-1">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 md:py-14">
        <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-ember-600">
          <span className="h-2 w-2 animate-pulse bg-ember-600" />
          SEARCH
        </p>

        <Suspense fallback={<SearchStatusFallback />}>
          <SearchStatus />
        </Suspense>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <div className="h-9 w-20 animate-pulse rounded-full bg-neutral-200" />
                <div className="h-9 w-28 animate-pulse rounded-full bg-neutral-100" />
                <div className="h-9 w-24 animate-pulse rounded-full bg-neutral-100" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
            </div>

            <div className="mt-6 space-y-4">
              <ResultCardSkeleton withThumbnail />
              <ResultCardSkeleton />
              <ResultCardSkeleton withThumbnail />
              <ResultCardSkeleton />
            </div>
          </div>

          <SidebarSkeleton />
        </div>
      </div>

      <Footer />
    </div>
  );
}
