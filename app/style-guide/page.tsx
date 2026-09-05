import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SearchField } from "@/components/ui/SearchField";
import { Toggle } from "@/components/ui/Toggle";
import {
  AlertsIcon,
  CertificateIcon,
  CourseIcon,
  DoneIcon,
  DurationIcon,
  InstructorIcon,
  LevelIcon,
  ModulesIcon,
  NextIcon,
  PlayIcon,
  ProTipIcon,
  ProgressIcon,
  RatingIcon,
  SavedIcon,
  SearchIcon,
  VideoIcon,
  BiblionMark,
} from "@/components/icons";

function Section({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-16 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-6">
        <h2 className="flex items-baseline gap-5">
          <span className="font-mono text-sm font-medium text-ember-600">{index}</span>
          <span className="font-display text-[28px] font-semibold leading-9 text-ink-900">
            {title}
          </span>
        </h2>
        {note && (
          <p className="hidden font-mono text-[11px] tracking-wide text-neutral-400 sm:block">
            {note}
          </p>
        )}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Spec({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] text-neutral-400">{children}</p>;
}

function Swatch({
  name,
  hex,
  className,
}: {
  name: string;
  hex: string;
  className: string;
}) {
  return (
    <div>
      <div className={`h-16 rounded-card border border-border ${className}`} />
      <p className="mt-2.5 text-center text-xs font-semibold text-ink-900">{name}</p>
      <p className="text-center font-mono text-[10px] text-neutral-500">{hex}</p>
    </div>
  );
}

const emberRamp = [
  { name: "ember-50", hex: "#FFF7ED", className: "bg-ember-50" },
  { name: "ember-100", hex: "#FFEDD5", className: "bg-ember-100" },
  { name: "ember-200", hex: "#FED7AA", className: "bg-ember-200" },
  { name: "ember-300", hex: "#FDBA74", className: "bg-ember-300" },
  { name: "ember-400", hex: "#FB923C", className: "bg-ember-400" },
  { name: "ember-500", hex: "#F97316", className: "bg-ember-500" },
  { name: "ember-600 · primary", hex: "#EA580C", className: "bg-ember-600" },
  { name: "ember-700", hex: "#C2410C", className: "bg-ember-700" },
  { name: "ember-800", hex: "#9A3412", className: "bg-ember-800" },
];

const neutralRamp = [
  { name: "neutral-50", hex: "#FAFAF9", className: "bg-neutral-50" },
  { name: "neutral-100", hex: "#F5F5F4", className: "bg-neutral-100" },
  { name: "neutral-200", hex: "#E7E5E4", className: "bg-neutral-200" },
  { name: "neutral-300", hex: "#D6D3D1", className: "bg-neutral-300" },
  { name: "neutral-400", hex: "#A8A29E", className: "bg-neutral-400" },
  { name: "neutral-500", hex: "#78716C", className: "bg-neutral-500" },
  { name: "neutral-600", hex: "#57534E", className: "bg-neutral-600" },
  { name: "neutral-700", hex: "#44403C", className: "bg-neutral-700" },
  { name: "ink-900", hex: "#1C1917", className: "bg-ink-900" },
];

const semantic = [
  { name: "Success", hex: "#16A34A", use: "Completed · passed", dot: "bg-success" },
  { name: "Warning", hex: "#D97706", use: "Expiring · caution", dot: "bg-warning" },
  { name: "Error", hex: "#DC2626", use: "Failed · destructive", dot: "bg-error" },
  { name: "Info", hex: "#2563EB", use: "New · announcements", dot: "bg-info" },
];

const surfaces = [
  { name: "Background", hex: "#FBF7F1", className: "bg-background" },
  { name: "Surface", hex: "#FFFFFF", className: "bg-surface" },
  { name: "Soft", hex: "#FFF3E6", className: "bg-soft" },
  { name: "Border", hex: "#EAE3D9", className: "bg-border" },
];

const typeScale = [
  {
    label: "DISPLAY — SPACE GROTESK BOLD · 48/56",
    sample: "Find the exact moment.",
    className: "font-display text-[48px] font-bold leading-[56px]",
  },
  {
    label: "H1 — SPACE GROTESK BOLD · 36/44",
    sample: "Course catalog",
    className: "font-display text-4xl font-bold leading-[44px]",
  },
  {
    label: "H2 — SPACE GROTESK SEMIBOLD · 28/36",
    sample: "Module overview",
    className: "font-display text-[28px] font-semibold leading-9",
  },
  {
    label: "H3 — INTER SEMIBOLD · 22/30",
    sample: "Lesson 5.1 · Streaming SSR",
    className: "text-[22px] font-semibold leading-[30px]",
  },
  {
    label: "BODY — INTER REGULAR · 16/26",
    sample: "Authors publish courses; learners search in plain language.",
    className: "text-base leading-[26px]",
  },
  {
    label: "SMALL — INTER REGULAR · 14/22",
    sample: "12 lessons · 3.5 h · Intermediate",
    className: "text-sm leading-[22px]",
  },
  {
    label: "CAPTION — INTER MEDIUM · 12/18",
    sample: "LAST ACCESSED 2 HOURS AGO",
    className: "text-xs font-medium leading-[18px] text-neutral-500",
  },
];

const families = [
  { name: "Space Grotesk", use: "Display & headings", className: "font-display font-bold" },
  { name: "Inter", use: "UI, body & labels", className: "font-sans font-semibold" },
  { name: "JetBrains Mono", use: "Tokens, code & timestamps", className: "font-mono font-medium" },
];

const icons = [
  { name: "course", Icon: CourseIcon },
  { name: "play", Icon: PlayIcon },
  { name: "search", Icon: SearchIcon },
  { name: "level", Icon: LevelIcon },
  { name: "duration", Icon: DurationIcon },
  { name: "saved", Icon: SavedIcon },
  { name: "progress", Icon: ProgressIcon },
  { name: "alerts", Icon: AlertsIcon },
  { name: "video", Icon: VideoIcon },
  { name: "certificate", Icon: CertificateIcon },
  { name: "pro tip", Icon: ProTipIcon },
  { name: "modules", Icon: ModulesIcon },
  { name: "instructor", Icon: InstructorIcon },
  { name: "rating", Icon: RatingIcon },
  { name: "done", Icon: DoneIcon },
  { name: "next", Icon: NextIcon },
];

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

export default function StyleGuide() {
  return (
    <div className="mx-auto max-w-360 px-6 py-16 sm:px-10">
      {/* ---- Header ---- */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-ember-600 pb-6">
        <div className="flex items-center gap-4">
          <BiblionMark className="h-11 w-11" />
          <div>
            <h1 className="font-logo text-4xl font-bold text-ink-900">Biblion.</h1>
            <p className="mt-1 font-mono text-xs tracking-widest text-neutral-500">
              UI TOKENS · COMPONENTS · FOUNDATIONS
            </p>
          </div>
        </div>
        <div className="text-right font-mono text-xs leading-5 text-neutral-500">
          <p className="font-medium text-ember-600">DESIGN SYSTEM — V1.0</p>
          <p>AI-POWERED LEARNING PLATFORM</p>
          <p>LIGHT THEME · UPDATED SEP 2026</p>
        </div>
      </header>

      {/* ---- 01 Color ---- */}
      <Section index="01" title="Color — Ember & Sand" note="TAILWIND-READY TOKENS">
        <div>
          <Spec>BRAND — EMBER</Spec>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
            {emberRamp.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <Spec>NEUTRALS — SAND &amp; INK</Spec>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
            {neutralRamp.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <Spec>SEMANTIC</Spec>
            <div className="mt-4 flex flex-col gap-4">
              {semantic.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className={`h-4 w-4 rounded-full ${s.dot}`} />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{s.name}</p>
                    <p className="font-mono text-[10px] text-neutral-500">{s.hex}</p>
                  </div>
                  <p className="ml-auto text-xs text-neutral-500">{s.use}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Spec>SURFACES</Spec>
            <div className="mt-4 flex flex-col gap-4">
              {surfaces.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className={`h-4 w-4 rounded border border-border ${s.className}`} />
                  <p className="text-sm font-semibold text-ink-900">{s.name}</p>
                  <p className="ml-auto font-mono text-[10px] text-neutral-500">{s.hex}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ---- 02 Typography ---- */}
      <Section index="02" title="Typography" note="3 FAMILIES · 7 STEPS">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col">
            {typeScale.map((t) => (
              <div
                key={t.label}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-4 last:border-b-0"
              >
                <p className={`text-ink-900 ${t.className}`}>{t.sample}</p>
                <Spec>{t.label}</Spec>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {families.map((f) => (
              <div
                key={f.name}
                className="rounded-card border border-border bg-surface p-5 shadow-[0_1px_1.5px_rgba(28,25,23,0.06)]"
              >
                <div className="flex items-center gap-4">
                  <span className={`text-4xl text-ember-600 ${f.className}`}>Aa</span>
                  <div>
                    <p className="font-display text-lg font-semibold text-ink-900">{f.name}</p>
                    <p className="text-sm text-neutral-500">{f.use}</p>
                  </div>
                </div>
                <p className="mt-3 font-mono text-[11px] text-neutral-400">
                  AaBbCcDdEeFf 0123456789
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---- 03 Buttons & Controls ---- */}
      <Section index="03" title="Buttons & Controls" note="8PT GRID · FOCUS VISIBLE">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Spec>PRIMARY</Spec>
            <div className="mt-4 flex flex-col items-start gap-4">
              <Button>Continue learning</Button>
              <Button className="bg-ember-700 hover:bg-ember-700">Continue learning</Button>
              <Button disabled>Continue learning</Button>
            </div>
          </div>
          <div>
            <Spec>SECONDARY</Spec>
            <div className="mt-4 flex flex-col items-start gap-4">
              <Button variant="secondary">View syllabus</Button>
              <Button variant="secondary" className="bg-neutral-100 hover:bg-neutral-100">
                View syllabus
              </Button>
              <Button variant="secondary" disabled>
                View syllabus
              </Button>
            </div>
          </div>
          <div>
            <Spec>GHOST</Spec>
            <div className="mt-4 flex flex-col items-start gap-4">
              <Button variant="ghost">Browse catalog</Button>
              <Button variant="ghost" className="text-ember-700 hover:text-ember-700">
                Browse catalog
              </Button>
              <Button variant="ghost" disabled>
                Browse catalog
              </Button>
            </div>
          </div>
          <div>
            <Spec>DANGER</Spec>
            <div className="mt-4 flex flex-col items-start gap-4">
              <Button variant="danger">Delete progress</Button>
              <Button variant="danger" className="bg-[#b91c1c] hover:bg-[#b91c1c]">
                Delete progress
              </Button>
              <Button variant="danger" disabled>
                Delete progress
              </Button>
            </div>
          </div>
          <div>
            <Spec>ICON</Spec>
            <div className="mt-4 flex gap-4">
              <button
                type="button"
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center rounded-control border border-border bg-surface text-ink-900 transition-colors duration-[120ms] hover:bg-neutral-50"
              >
                <SearchIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                className="flex h-10 w-10 items-center justify-center rounded-control border border-border bg-surface text-ink-900 transition-colors duration-[120ms] hover:bg-neutral-50"
              >
                <AlertsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="mt-10 font-mono text-[11px] text-neutral-400">
          ROWS: DEFAULT → HOVER → DISABLED · HEIGHT 40 · RADIUS 10 · FOCUS RING 2PX EMBER-300
        </p>

        <div className="mt-10">
          <Spec>INPUTS &amp; TOGGLES</Spec>
          <div className="mt-4 grid items-center gap-6 lg:grid-cols-[1fr_1fr_auto]">
            <SearchField shortcut placeholder="Search lessons, topics, moments…" />
            <SearchField defaultValue="streaming ssr" aria-label="Search example" />
            <Toggle label="Email reminders" defaultChecked />
          </div>
        </div>
      </Section>

      {/* ---- 04 Iconography ---- */}
      <Section index="04" title="Iconography" note="FONT AWESOME SOLID · 24PX GRID">
        <div className="grid grid-cols-4 gap-6 sm:grid-cols-8">
          {icons.map(({ name, Icon }) => (
            <div key={name} className="flex flex-col items-center gap-2.5">
              <span className="flex h-14 w-14 items-center justify-center rounded-card border border-border bg-surface text-ember-600">
                <Icon className="h-6 w-6" />
              </span>
              <Spec>{name}</Spec>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- 05 Components ---- */}
      <Section index="05" title="Components">
        <div className="flex flex-wrap gap-4">
          <Badge variant="soft">Free preview</Badge>
          <Badge variant="popular">Popular</Badge>
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-2">
          {/* Course card */}
          <article className="rounded-card border border-border bg-surface p-5 shadow-[0_1px_1.5px_rgba(28,25,23,0.06)]">
            <div className="flex gap-5">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-card bg-gradient-to-br from-ember-400 via-ember-600 to-ember-800">
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-ember-700">
                  Popular
                </span>
                <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
                  <PlayIcon className="h-4 w-4 text-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-[11px] tracking-wide text-ember-600">
                    DATA FETCHING
                  </p>
                  <p className="font-display text-xl font-bold text-ink-900">$49</p>
                </div>
                <h3 className="mt-1.5 font-display text-[22px] font-semibold leading-[30px] text-ink-900">
                  Caching Strategies in Next.js
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  12 lessons · 3.5 h · Intermediate
                </p>
                <div className="mt-2 flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-soft text-[10px] font-bold text-ember-700">
                    AR
                  </span>
                  <span className="text-sm text-neutral-700">Ava Reyes</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={68} max={100} className="flex-1" />
                  <span className="font-mono text-xs font-medium text-ember-600">68%</span>
                </div>
              </div>
            </div>
          </article>

          {/* Video moment card */}
          <article className="rounded-card border border-border bg-surface p-5 shadow-[0_1px_1.5px_rgba(28,25,23,0.06)]">
            <div className="flex gap-5">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-card bg-gradient-to-br from-neutral-700 to-ink-900">
                <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <PlayIcon className="h-4 w-4 text-white" />
                </span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-ink-900/80 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white">
                  12:34
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-[11px] tracking-wide text-ember-600">
                    NEXT.JS FOUNDATIONS · LESSON 5.1
                  </p>
                  <p className="font-mono text-[11px] text-neutral-400">CLIP 2:10</p>
                </div>
                <h3 className="mt-1.5 font-display text-[22px] font-semibold leading-[30px] text-ink-900">
                  Streaming SSR with Suspense boundaries
                </h3>
                <p className="mt-1.5 text-sm leading-[22px] text-neutral-500">
                  Covers nested Suspense boundaries, fallback orchestration, and streaming
                  order in the App Router.
                </p>
                <Button className="mt-3">
                  <PlayIcon className="h-3.5 w-3.5" />
                  Watch from 12:34
                </Button>
              </div>
            </div>
          </article>
        </div>
      </Section>

      {/* ---- Footer tokens ---- */}
      <div className="flex flex-wrap justify-between gap-4 border-t border-border pt-8">
        <Spec>SPACING 4 · 8 · 12 · 16 · 24 · 32 · 48</Spec>
        <Spec>RADIUS 6 / 10 / 14 / PILL</Spec>
        <Spec>ELEVATION E1–E3</Spec>
        <Spec>GRID 8PT · 12 COL</Spec>
        <Spec>BIBLION DS · © 2026</Spec>
      </div>
    </div>
  );
}
