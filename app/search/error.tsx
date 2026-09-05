"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { AlertsIcon, UndoIcon } from "@/components/icons";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("search page error", error);
  }, [error]);

  return (
    <div className="flex-1">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10 md:py-14">
        <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-ember-600">
          <span className="h-2 w-2 bg-ember-600" />
          SEARCH
        </p>

        <div className="mt-8 flex flex-col items-center rounded-card border border-border bg-surface px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-ember-600">
            <AlertsIcon className="h-5 w-5" />
          </span>
          <h1 className="mt-5 font-display text-xl font-bold text-ink-900">
            Search is unavailable right now
          </h1>
          <p className="mt-2 max-w-sm text-sm text-neutral-500">
            Something went wrong on our side. Try again in a moment, or browse the full catalog.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>
              <UndoIcon className="h-4 w-4" />
              Try again
            </Button>
            <Link href="/catalog">
              <Button variant="secondary">Browse full catalog</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
