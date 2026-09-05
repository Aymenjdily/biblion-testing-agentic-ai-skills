import Markdown from "react-markdown";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchField } from "@/components/ui/SearchField";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { runSearch } from "@/lib/search";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const search = await searchParams;
  const rawQuery = Array.isArray(search.q) ? search.q[0] : search.q;
  const query = (rawQuery ?? "").trim();

  const response = query
    ? await runSearch(query)
    : { query: "", reply: null, results: [], resultCount: 0, courseCount: 0 };

  return (
    <div className="flex-1">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10 md:py-14">
        <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-ember-600">
          <span className="h-2 w-2 bg-ember-600" />
          SEARCH
        </p>

        <form action="/search" method="get" className="mt-5">
          <SearchField
            name="q"
            defaultValue={query}
            placeholder="Search every lesson, chapter, and moment..."
          />
        </form>

        {!query ? (
          <p className="mt-10 text-center text-sm text-neutral-500">
            Type a query above to search the catalog.
          </p>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="font-display text-2xl font-bold text-ink-900">
                Results for &ldquo;{query}&rdquo;
              </h1>
              <p className="font-mono text-[11px] tracking-wide text-neutral-400">
                {response.resultCount} RESULT{response.resultCount === 1 ? "" : "S"}
                {response.courseCount > 0 &&
                  ` ACROSS ${response.courseCount} COURSE${response.courseCount === 1 ? "" : "S"}`}
              </p>
            </div>

            {response.reply && (
              <div className="prose prose-sm mt-3 max-w-none text-neutral-600">
                <Markdown>{response.reply}</Markdown>
              </div>
            )}

            <div className="mt-6">
              {response.results.length === 0 ? (
                <SearchEmptyState query={query} />
              ) : (
                <SearchResultsList results={response.results} />
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
