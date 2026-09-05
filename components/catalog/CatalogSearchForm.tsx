import { SearchField } from "@/components/ui/SearchField";

export function CatalogSearchForm() {
  return (
    // search_performed fires server-side in lib/search.ts's runSearch() once
    // the query actually executes, with real result counts — not here.
    <form action="/search" method="get" className="mt-8">
      <SearchField
        name="q"
        placeholder="Search every lesson, chapter, and moment..."
        shortcut
        shortcutLabel="⌘K"
      />
    </form>
  );
}
