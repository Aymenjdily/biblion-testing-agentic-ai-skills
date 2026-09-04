import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  BiblionMark,
  ChevronDownIcon,
  NextIcon,
  PlayIcon,
  SearchIcon,
} from "@/components/icons";

const demoResults = [
  {
    course: "NEXT.JS FOUNDATIONS",
    lesson: "LESSON 5.1",
    title: "Streaming SSR with Suspense boundaries",
    description:
      "Nested boundaries, fallback orchestration, and streaming order in the App Router.",
    timestamp: "12:34",
  },
  {
    course: "REACT IN PRODUCTION",
    lesson: "LESSON 3.2",
    title: "Data fetching and caching strategies",
    description: "Request memoization, cache tags, and when to revalidate on demand.",
    timestamp: "04:17",
  },
  {
    course: "APP ROUTER MASTERY",
    lesson: "LESSON 2.4",
    title: "Server Components, client boundaries",
    description: "What runs where, how props cross the boundary, and common pitfalls.",
    timestamp: "21:08",
  },
];

const stats = [
  { value: "12,400+", label: "LESSON MOMENTS INDEXED" },
  { value: "0.4 s", label: "MEDIAN SEARCH LATENCY" },
  { value: "4.9 / 5", label: "AVERAGE LEARNER RATING" },
];

const logos = [
  { name: "NORTHWIND", className: "font-mono tracking-[0.3em]" },
  { name: "Lumen & Co.", className: "font-display font-bold" },
  { name: "hexlab", className: "font-display font-bold lowercase" },
  { name: "FRAMELY", className: "tracking-[0.3em]" },
  { name: "Arcadia", className: "font-display italic font-semibold" },
];

const features = [
  {
    index: "01",
    title: "Moment-level results",
    text: "Every match carries a timestamp — one click opens the lesson at exactly that second.",
  },
  {
    index: "02",
    title: "Grounded in your catalog",
    text: "Results come only from your content. Never an invented course, chapter, price, or duration.",
  },
  {
    index: "03",
    title: "Progress that follows",
    text: "Completion and resume positions stay in sync across the catalog, course, and lesson pages.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-ember-600">
      <span className="h-2 w-2 bg-ember-600" />
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <div className="flex-1">
      {/* ---- Nav + hero on soft ember gradient ---- */}
      <div className="bg-hero-shader">
        <header className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <BiblionMark className="h-8 w-8" />
            <span className="font-logo text-[22px] font-bold text-ink-900">Biblion</span>
          </Link>

          <nav className="hidden items-center gap-10 text-sm text-neutral-600 md:flex">
            <a href="#" className="transition-colors hover:text-ink-900">
              Product
            </a>
            <a href="#" className="transition-colors hover:text-ink-900">
              Catalog
            </a>
            <a href="#" className="transition-colors hover:text-ink-900">
              Instructors
            </a>
            <a href="#" className="transition-colors hover:text-ink-900">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-6">
            <a href="#" className="hidden text-sm text-neutral-600 transition-colors hover:text-ink-900 sm:block">
              Sign in
            </a>
            <Button className="px-6">Get started</Button>
          </div>
        </header>

        {/* ---- Hero ---- */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:px-10 md:pb-28 md:pt-20">
          <div className="flex flex-wrap items-end justify-between gap-12">
            <div className="max-w-2xl">
              <Eyebrow>AI VIDEO SEARCH FOR COURSE PLATFORMS</Eyebrow>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink-900 md:text-[72px]">
                Every lesson,
                <br />
                searchable <span className="text-ember-600">to the second.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
                Biblion indexes every transcript and chapter in your catalog, so
                learners ask in plain language and land on the exact moment a topic is
                taught.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-7">
                <Button className="px-7">Start free trial</Button>
                <a
                  href="#"
                  className="flex items-center gap-2 text-[15px] font-semibold text-ink-900 transition-colors hover:text-ember-700"
                >
                  View live demo
                  <NextIcon className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-8 font-mono text-[11px] tracking-[0.18em] text-neutral-400">
                FREE PREVIEW LESSONS · NO CREDIT CARD REQUIRED
              </p>
            </div>

            <div className="hidden flex-col gap-10 lg:flex">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-[32px] font-bold leading-none text-ink-900">
                    {s.value}
                  </p>
                  <p className="mt-2 font-mono text-[11px] tracking-[0.18em] text-neutral-500">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ---- Search demo card ---- */}
      <section className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="overflow-hidden rounded-card border border-border bg-surface shadow-[0_1px_1.5px_rgba(28,25,23,0.06)]">
          <div className="flex items-center gap-4 border-b border-border px-6 py-4">
            <SearchIcon className="h-4 w-4 text-neutral-500" />
            <p className="min-w-0 flex-1 truncate text-[15px] text-ink-900">
              how do I stream HTML with Suspense?
            </p>
            <p className="hidden font-mono text-[11px] tracking-wide text-neutral-400 sm:block">
              28 RESULTS · 0.4 S
            </p>
            <button
              type="button"
              className="hidden items-center gap-1.5 font-mono text-[11px] tracking-wide text-neutral-500 transition-colors hover:text-ink-900 sm:flex"
            >
              MOST RELEVANT
              <ChevronDownIcon className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-border">
            {demoResults.map((r) => (
              <div key={r.title} className="flex flex-wrap items-center gap-5 px-6 py-5">
                <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-neutral-700 to-ink-900">
                  <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <PlayIcon className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-ink-900/80 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-white">
                    {r.timestamp}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] tracking-wide text-ember-600">
                    {r.course} · {r.lesson}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-ink-900">
                    {r.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">{r.description}</p>
                </div>

                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-medium text-ink-900 transition-colors duration-[120ms] hover:bg-neutral-50"
                >
                  <PlayIcon className="h-3 w-3 text-ember-600" />
                  Watch · {r.timestamp}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Logo strip ---- */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <p className="text-center font-mono text-[11px] tracking-[0.24em] text-neutral-400">
          POWERING LEARNING TEAMS AT
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-14 gap-y-6 divide-neutral-300 max-md:divide-x-0 md:divide-x">
          {logos.map((l) => (
            <p
              key={l.name}
              className={`px-14 text-lg text-neutral-400 first:pl-0 last:pr-0 ${l.className}`}
            >
              {l.name}
            </p>
          ))}
        </div>
      </section>

      {/* ---- Why Biblion ---- */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 md:py-28">
          <Eyebrow>WHY BIBLION</Eyebrow>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
            <h2 className="max-w-xl font-display text-4xl font-bold leading-tight text-ink-900">
              Built for serious course platforms
            </h2>
            <p className="max-w-md text-[15px] leading-7 text-neutral-600">
              Search is grounded in your own catalog — every answer traces back to a
              real course, a real lesson, and a real timestamp.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.index}>
                <p className="font-mono text-sm text-ember-600">{f.index}</p>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink-900">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-neutral-500">{f.text}</p>
                <a
                  href="#"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ember-600 transition-colors hover:text-ember-700"
                >
                  Learn more
                  <NextIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Dark CTA + footer ---- */}
      <section className="bg-ink-900">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 text-center sm:px-10">
          <BiblionMark className="mx-auto h-8 w-8 text-ember-500" />
          <h2 className="mt-8 font-display text-4xl font-bold text-white md:text-5xl">
            Start finding the exact moment.
          </h2>
          <p className="mt-4 text-[15px] text-neutral-400">
            Free for your first course · no credit card required
          </p>
          <Button className="mt-9 px-8">Get started free</Button>
        </div>

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-6 sm:px-10">
          <p className="font-mono text-[11px] tracking-[0.18em] text-neutral-500">
            © 2026 BIBLION
          </p>
          <p className="font-mono text-[11px] tracking-[0.18em] text-neutral-500">
            PRIVACY · TERMS · CONTACT
          </p>
        </div>

        <div className="overflow-hidden" aria-hidden="true">
          <p className="-mb-[0.23em] select-none bg-gradient-to-b from-ember-400 via-ember-600 to-ember-800 bg-clip-text text-center font-display text-[19vw] font-bold leading-none tracking-tight text-transparent">
            BIBLION
          </p>
        </div>
      </section>
    </div>
  );
}
