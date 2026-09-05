import {
  CourseIcon,
  ListIcon,
  ProgressIcon,
  ProTipIcon,
  RatingIcon,
  DurationIcon,
} from "@/components/icons";
import type { CourseDetail } from "@/sanity/lib/queries";

const ICONS = {
  book: CourseIcon,
  code: ListIcon,
  chart: ProgressIcon,
  bulb: ProTipIcon,
  star: RatingIcon,
  clock: DurationIcon,
} as const;

export function WhatYoullLearn({
  outcomes,
}: {
  outcomes: CourseDetail["learningOutcomes"];
}) {
  if (!outcomes?.length) return null;

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 md:py-20">
        <h2 className="font-display text-3xl font-bold text-ink-900">What you&apos;ll learn</h2>

        <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {outcomes.map((outcome, i) => {
            const Icon = ICONS[outcome.icon as keyof typeof ICONS] ?? CourseIcon;
            return (
              <div key={i} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-soft text-ember-600">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-[17px] font-semibold text-ink-900">
                    {outcome.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-500">{outcome.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
