import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertsIcon, UndoIcon } from "@/components/icons";

export function SearchErrorState({ query }: { query: string }) {
  const retryHref = `/search?q=${encodeURIComponent(query)}`;

  return (
    <div className="flex flex-col items-center rounded-card border border-border bg-surface px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-ember-600">
        <AlertsIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-xl font-bold text-ink-900">
        Search is unavailable right now
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        We could not run that search. Try again in a moment, or browse the full catalog.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a href={retryHref}>
          <Button>
            <UndoIcon className="h-4 w-4" />
            Try again
          </Button>
        </a>
        <Link href="/catalog">
          <Button variant="secondary">Browse full catalog</Button>
        </Link>
      </div>
    </div>
  );
}
