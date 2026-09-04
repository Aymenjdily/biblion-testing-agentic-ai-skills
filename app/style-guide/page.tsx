import { Button } from "@/components/ui/Button";
import { Badge, CompletedTag } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SearchField } from "@/components/ui/SearchField";
import {
  BookmarkIcon,
  ClockIcon,
  ListIcon,
  PlayIcon,
  TargetIcon,
} from "@/components/icons";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-16 first:border-t-0 first:pt-0">
      <h2 className="font-serif text-3xl text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-neutral-500">{subtitle}</p>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Spec({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] text-neutral-400">{children}</p>;
}

const swatches = [
  { name: "Indigo", hex: "#3B2FD6", use: "Primary action, links", className: "bg-indigo" },
  { name: "Indigo deep", hex: "#2A1FA8", use: "Hover, pressed", className: "bg-indigo-deep" },
  { name: "Amber", hex: "#E8A33D", use: "Timestamps, chapters", className: "bg-amber" },
  { name: "Teal", hex: "#10796B", use: "Progress, completed", className: "bg-teal" },
  { name: "Ink", hex: "#16181D", use: "Text, borders at 100%", className: "bg-ink" },
];

const neutrals = [
  { step: "50", className: "bg-neutral-50 border border-border" },
  { step: "200", className: "bg-neutral-200" },
  { step: "300", className: "bg-neutral-300" },
  { step: "400", className: "bg-neutral-400" },
  { step: "500", className: "bg-neutral-500" },
  { step: "700", className: "bg-neutral-700" },
  { step: "900", className: "bg-neutral-900" },
];

export default function StyleGuide() {
  return (
    <div className="mx-auto max-w-360 px-6 py-16 sm:px-10">
      {/* ---- Header ---- */}
      <header className="flex items-end justify-between border-b-2 border-ink pb-6">
        <div>
          <h1 className="font-serif text-5xl">Biblion</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Design system · typography, color, components and the search surface they build
          </p>
        </div>
        <div className="hidden text-right font-mono text-xs text-neutral-400 sm:block">
          <p className="font-medium text-indigo">v3.0</p>
          <p>Light · Sept 2026</p>
          <p>Next.js · Tailwind · Sanity</p>
        </div>
      </header>

      {/* ---- Color ---- */}
      <Section
        title="Color"
        subtitle="Indigo is the only thing you can click. Amber marks a moment in time. Teal means finished."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map((s) => (
            <div key={s.name}>
              <div className={`h-26 rounded-card ${s.className}`} />
              <p className="mt-3 text-sm font-semibold">{s.name}</p>
              <Spec>{s.hex}</Spec>
              <p className="mt-1 text-xs text-neutral-400">{s.use}</p>
            </div>
          ))}
          <div>
            <div className="h-26 rounded-card border border-border bg-card">
              <div className="h-13 rounded-t-card bg-neutral-50" />
            </div>
            <p className="mt-3 text-sm font-semibold">Canvas &amp; card</p>
            <Spec>#F7F7F5 / #FFFFFF</Spec>
            <p className="mt-1 text-xs text-neutral-400">Page and surface</p>
          </div>
        </div>

        <div className="mt-10">
          <Spec>NEUTRAL RAMP</Spec>
          <div className="mt-2 flex overflow-hidden rounded-chip">
            {neutrals.map((n) => (
              <div key={n.step} className={`h-6 flex-1 ${n.className}`} />
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            <Spec>50 · 200 · 300 · 400 · 500 · 700 · 900</Spec>
            <Spec>Body text on canvas: 14.8:1 · Indigo on white: 8.6:1</Spec>
          </div>
        </div>
      </Section>

      {/* ---- Typography ---- */}
      <Section
        title="Typography"
        subtitle="Instrument Serif for anything a learner reads as a title. Inter Tight for interface. JetBrains Mono for time."
      >
        <div className="flex flex-col divide-y divide-[#EDEDE9]">
          <div className="flex items-baseline justify-between gap-6 py-4">
            <p className="font-serif text-[56px] leading-[60px] tracking-[-0.01em]">
              Find the exact second
            </p>
            <Spec>Display · Instrument Serif 400 · 56/60 · −0.01em</Spec>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-4">
            <p className="font-serif text-4xl leading-[42px]">Data Fetching and Caching</p>
            <Spec>H1 · Instrument Serif 400 · 36/42</Spec>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-4">
            <p className="font-serif text-[26px] italic leading-8">Module 5 — Lesson 5.1</p>
            <Spec>H2 · Instrument Serif italic · 26/32</Spec>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-4">
            <p className="text-xl font-semibold leading-7">Continue where you left off</p>
            <Spec>H3 · Inter Tight 600 · 20/28</Spec>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-4">
            <p className="max-w-[68ch] text-base leading-6 text-neutral-700">
              Every result is grounded in real course content — a lesson that exists, at a
              second that exists. Nothing here is invented.
            </p>
            <Spec>Body · Inter Tight 400 · 16/24 · max 68ch</Spec>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-4">
            <p className="text-[13px] text-neutral-500">
              Lesson 5.1 in Next.js for Production · 24 min · Intermediate
            </p>
            <Spec>Meta · Inter Tight 400 · 13/18 · neutral 500</Spec>
          </div>
          <div className="flex items-baseline justify-between gap-6 py-4">
            <p className="font-mono text-sm">
              <span className="font-medium text-amber-ink">12:34</span>
              <span className="text-neutral-400"> — 08:12 clip · 92% match</span>
            </p>
            <Spec>Time · JetBrains Mono 500 · 14/20 · tabular</Spec>
          </div>
        </div>
      </Section>

      {/* ---- Components ---- */}
      <Section
        title="Components & states"
        subtitle="Every interactive element ships with rest, hover, focus and disabled. Focus is a 2px indigo ring, always visible."
      >
        <div className="flex flex-wrap items-start gap-8">
          <div>
            <Button>Continue lesson</Button>
            <Spec>PRIMARY · REST</Spec>
          </div>
          <div>
            <Button className="bg-indigo-deep hover:bg-indigo-deep">Continue lesson</Button>
            <Spec>HOVER</Spec>
          </div>
          <div>
            <Button className="ring-2 ring-indigo/40 ring-offset-2">Continue lesson</Button>
            <Spec>FOCUS</Spec>
          </div>
          <div>
            <Button disabled>Continue lesson</Button>
            <Spec>DISABLED</Spec>
          </div>
          <div>
            <Button variant="secondary">View course</Button>
            <Spec>SECONDARY</Spec>
          </div>
          <div>
            <Button variant="link">Browse the catalog</Button>
            <Spec>LINK</Spec>
          </div>
        </div>

        <div className="mt-10 max-w-xl">
          <SearchField shortcut placeholder="how does the fetch cache revalidate" />
          <Spec>SEARCH FIELD · 52px · ALWAYS FULL WIDTH OF ITS COLUMN</Spec>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Badge variant="amber">Free preview</Badge>
          <Badge variant="neutral">Beginner</Badge>
          <Badge variant="tealTint">Intermediate</Badge>
          <Badge variant="teal">Advanced</Badge>
          <CompletedTag>Lesson completed</CompletedTag>
        </div>
        <Spec>BADGES · PILL, 30px, NEVER MORE THAN TWO PER CARD</Spec>

        <div className="mt-10 flex flex-wrap items-center gap-12">
          <div className="w-[420px] max-w-full">
            <p className="text-[13px] font-medium">Course progress</p>
            <ProgressBar value={12} max={20} label="12 / 20 lessons" className="mt-2" />
          </div>

          <div className="flex items-center gap-3 text-neutral-900">
            {[PlayIcon, ClockIcon, ListIcon, BookmarkIcon, TargetIcon].map((Icon, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card"
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            ))}
          </div>
        </div>
        <Spec>ICONS · 1.5PX STROKE · 24PX GRID · COLOR ONLY FOR STATE</Spec>
      </Section>

      {/* ---- Footer tokens ---- */}
      <div className="flex flex-wrap justify-between gap-4 border-t border-border pt-8">
        <Spec>SPACING 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64</Spec>
        <Spec>RADIUS 4 CHIP · 8 CONTROL · 10 CARD · 14 SURFACE</Spec>
        <Spec>MOTION 120ms STATE · 220ms ENTRANCE · EASE-OUT</Spec>
        <Spec>BIBLION DESIGN SYSTEM</Spec>
      </div>
    </div>
  );
}
