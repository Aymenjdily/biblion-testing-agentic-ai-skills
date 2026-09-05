"use client";

import posthog from "posthog-js";
import { SearchField } from "@/components/ui/SearchField";

export function CatalogSearchForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const query = (e.currentTarget.elements.namedItem("q") as HTMLInputElement)?.value ?? "";
    posthog.capture("search_performed", { query_length: query.length });
  }

  return (
    <form action="/search" method="get" className="mt-8" onSubmit={handleSubmit}>
      <SearchField
        name="q"
        placeholder="Search every lesson, chapter, and moment..."
        shortcut
        shortcutLabel="⌘K"
      />
    </form>
  );
}
