import { Header } from "@/components/layout/Header";

export default function SearchLoading() {
  return (
    <div className="flex-1">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10 md:py-14">
        <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
        <div className="mt-5 h-13 w-full animate-pulse rounded-control bg-neutral-100" />
        <div className="mt-10 h-5 w-48 animate-pulse rounded bg-neutral-200" />

        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-card border border-border bg-neutral-50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
