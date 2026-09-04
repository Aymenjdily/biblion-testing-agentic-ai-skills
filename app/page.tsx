import Link from "next/link";
import { BiblionMark, BellIcon, ChevronDownIcon } from "@/components/icons";
import { SearchField } from "@/components/ui/SearchField";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { VideoMomentCard, type VideoMomentResult } from "@/components/search/VideoMomentCard";
import { LessonCard, type LessonResult } from "@/components/search/LessonCard";

type Result = VideoMomentResult | LessonResult;

const courses = [
  "Next.js for Production",
  "TypeScript in Depth",
  "Systems Design Basics",
];

const results: Result[] = [
  {
    type: "video-moment",
    title: "Revalidation windows in the fetch cache",
    lessonLabel: "Lesson 5.1 · Data Fetching and Caching · Next.js for Production",
    description:
      "Walks through how a revalidate value is chosen and what invalidates an entry early.",
    timestamp: "12:34",
    clipLength: "08:12",
  },
  {
    type: "lesson",
    title: "Caching strategies for server components",
    lessonLabel: "Lesson 5.3 · Data Fetching and Caching · Next.js for Production",
    topics: ["Request memoization", "Cache tagging", "Opting out"],
  },
  {
    type: "video-moment",
    title: "Stale-while-revalidate, in practice",
    lessonLabel: "Lesson 5.4 · Data Fetching and Caching · Next.js for Production",
    description:
      "Compares a short revalidate window against on-demand invalidation for a busy catalog.",
    timestamp: "04:02",
    clipLength: "05:47",
    progressPct: 70,
    completed: true,
  },
  {
    type: "video-moment",
    title: "Tagging entries for on-demand invalidation",
    lessonLabel: "Lesson 5.5 · Data Fetching and Caching · Next.js for Production",
    description:
      "Shows how a mutation can invalidate a narrow set of cache entries by tag instead of clearing everything.",
    timestamp: "01:58",
    clipLength: "06:20",
  },
  {
    type: "lesson",
    title: "Client-side caching with the Router Cache",
    lessonLabel: "Lesson 5.6 · Data Fetching and Caching · Next.js for Production",
    topics: ["Prefetching", "Soft navigation", "Manual invalidation"],
  },
  {
    type: "video-moment",
    title: "Debugging a stale response in production",
    lessonLabel: "Lesson 5.7 · Data Fetching and Caching · Next.js for Production",
    description:
      "A live walkthrough of tracing a cached response back to the revalidate window that produced it.",
    timestamp: "09:15",
    clipLength: "07:03",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* ---- App nav ---- */}
      <header className="sticky top-0 z-10 border-b border-divider bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-360 items-center gap-8 px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo text-white">
              <BiblionMark className="h-4 w-4" />
            </span>
            <span className="font-serif text-[19px]">Biblion</span>
          </Link>

          <nav className="hidden items-center gap-6 text-[13px] sm:flex">
            <a href="#" className="text-neutral-500 transition-colors hover:text-ink">
              Catalog
            </a>
            <a href="#" className="font-medium text-ink">
              My learning
            </a>
          </nav>

          <div className="ml-auto w-full max-w-140">
            <SearchField
              compact
              defaultValue="caching"
              aria-label="Search courses, lessons and video moments"
            />
          </div>

          <div className="ml-auto flex items-center gap-4 sm:ml-0">
            <button
              type="button"
              aria-label="Notifications"
              className="text-neutral-500 transition-colors hover:text-ink"
            >
              <BellIcon className="h-4.5 w-4.5" strokeWidth={1.3} />
            </button>
            <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-teal-tint text-[11px] font-medium text-teal">
              SK
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-360 flex-1 px-6 sm:px-10">
        {/* ---- Sidebar ---- */}
        <aside className="hidden w-64 shrink-0 border-r border-divider py-10 pr-8 md:block">
          <p className="font-mono text-[11px] tracking-wide text-neutral-400">REFINE</p>

          <div className="mt-6">
            <p className="text-[13px] font-medium text-ink">Level</p>
            <div className="mt-3 flex flex-col gap-3">
              <Checkbox label="Intermediate" defaultChecked />
              <Checkbox label="Advanced" />
              <Checkbox label="Beginner" />
            </div>
          </div>

          <div className="mt-6 border-t border-divider pt-6">
            <p className="text-[13px] font-medium text-ink">Result type</p>
            <div className="mt-3 flex flex-col gap-3">
              <Checkbox label="Video moments" defaultChecked />
              <Checkbox label="Lessons" defaultChecked />
            </div>
          </div>

          <div className="mt-6 border-t border-divider pt-6">
            <p className="text-[13px] font-medium text-ink">Course</p>
            <ul className="mt-3 flex flex-col gap-3 text-[12.5px] text-neutral-500">
              {courses.map((course) => (
                <li key={course}>
                  <a href="#" className="transition-colors hover:text-ink">
                    {course}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ---- Results ---- */}
        <main className="flex-1 py-10 md:pl-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl text-ink">
                28 results for &ldquo;caching&rdquo;
              </h1>
              <p className="mt-1 text-[12.5px] text-neutral-500">
                Across 8 courses · 19 video moments, 9 lessons
              </p>
            </div>

            <button
              type="button"
              className="flex h-7.5 items-center gap-2 rounded-control border border-border bg-card px-3.5 text-[12.5px] text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Most relevant
              <ChevronDownIcon className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {results.map((result) =>
              result.type === "video-moment" ? (
                <VideoMomentCard key={result.title} result={result} />
              ) : (
                <LessonCard key={result.title} result={result} />
              )
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="secondary">Load more results</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
