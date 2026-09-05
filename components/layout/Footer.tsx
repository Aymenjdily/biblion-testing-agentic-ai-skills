import { BiblionMark } from "@/components/icons";

export function Footer() {
  return (
    <section className="bg-ink-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-10 sm:px-10">
        <BiblionMark className="h-7 w-7 text-ember-500" />
        <p className="text-[15px] text-neutral-300">Every lesson, searchable to the second.</p>
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
  );
}
