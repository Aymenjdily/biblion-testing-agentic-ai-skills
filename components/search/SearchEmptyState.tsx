import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/icons";

export function SearchEmptyState({
  query,
  onClearFilters,
}: {
  query: string;
  /** When present, results exist but the current filters hide all of them. */
  onClearFilters?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-border bg-surface px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-ember-600">
        <SearchIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 font-display text-xl font-bold text-ink-900">
        {onClearFilters ? "No results match these filters" : `No results for “${query}”`}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        {onClearFilters
          ? "Try clearing a filter, or browse the full catalog to see everything we teach."
          : "Try a different phrase, or browse the full catalog to see everything we teach."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        {onClearFilters && (
          <Button variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        <Link href="/catalog">
          <Button variant={onClearFilters ? "secondary" : "primary"}>Browse full catalog</Button>
        </Link>
      </div>
    </div>
  );
}
