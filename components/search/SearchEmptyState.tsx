import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/icons";

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-border bg-surface px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-ember-600">
        <SearchIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-xl font-bold text-ink-900">
        No results for &ldquo;{query}&rdquo;
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Try a different phrase, or browse the full catalog to see everything we teach.
      </p>
      <Link href="/catalog" className="mt-6">
        <Button>Browse full catalog</Button>
      </Link>
    </div>
  );
}
