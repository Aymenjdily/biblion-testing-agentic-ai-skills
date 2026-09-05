import type { Metadata } from "next";
import Markdown from "react-markdown";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchField } from "@/components/ui/SearchField";
import { Button } from "@/components/ui/Button";
import { SearchExplorer } from "@/components/search/SearchExplorer";
import { RecentSearches } from "@/components/search/RecentSearches";
import { runSearch } from "@/lib/search";
import { getSearchStats } from "@/sanity/lib/queries";

// Query-string result pages are thin/duplicate content, not worth indexing —
// and deliberately doesn't call runSearch() here, which would double the
// (rate-limited) search agent call the page itself already makes.
export async function generateMetadata({
  searchParams,
}: PageProps<"/search">): Promise<Metadata> {
  const search = await searchParams;
  const rawQuery = Array.isArray(search.q) ? search.q[0] : search.q;
  const query = (rawQuery ?? "").trim();

  return {
    title: query ? `Search results for "${query}"` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const search = await searchParams;
  const rawQuery = Array.isArray(search.q) ? search.q[0] : search.q;
  const query = (rawQuery ?? "").trim();

  const [response, stats] = await Promise.all([
    query
      ? runSearch(query)
      : Promise.resolve({ query: "", reply: null, results: [], resultCount: 0, courseCount: 0 }),
    getSearchStats(),
  ]);

  return (
    <div className="flex-1">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 md:py-14">
        <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-ember-600">
          <span className="h-2 w-2 bg-ember-600" />
          SEARCH
        </p>

        <form action="/search" method="get" className="mt-5 flex gap-3">
          <SearchField
            name="q"
            defaultValue={query}
            placeholder="Search every lesson, chapter, and moment..."
            shortcut
            shortcutLabel="⌘K"
            className="flex-1"
          />
          <Button type="submit" className="px-6">
            Search
          </Button>
        </form>

        {!query ? (
          <div className="mt-10">
            <p className="text-center text-sm text-neutral-500">
              Type a query above to search the catalog.
            </p>
            <div className="mx-auto mt-8 max-w-xs">
              <RecentSearches currentQuery="" />
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-neutral-600">
                <span className="font-display text-lg font-bold text-ink-900">
                  {response.resultCount} result{response.resultCount === 1 ? "" : "s"}
                </span>{" "}
                {response.courseCount > 0 &&
                  `across ${response.courseCount} course${response.courseCount === 1 ? "" : "s"}`}
              </p>
            </div>

            {response.reply && (
              <div className="prose prose-sm mt-3 max-w-none text-neutral-600">
                <Markdown>{response.reply}</Markdown>
              </div>
            )}

            <div className="mt-6">
              <SearchExplorer query={query} results={response.results} stats={stats} />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
