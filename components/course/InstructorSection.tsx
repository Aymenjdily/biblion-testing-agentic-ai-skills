import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { NextIcon } from "@/components/icons";
import { toPlainText } from "@/lib/plain-text";
import type { CourseDetail } from "@/sanity/lib/queries";

export function InstructorSection({ instructor }: { instructor: CourseDetail["instructor"] }) {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:gap-8 sm:px-10">
        <div className="flex items-center gap-4">
          <Avatar image={instructor.photo} alt={instructor.name} size={80} />

          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.18em] text-neutral-400">
              YOUR INSTRUCTOR
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-ink-900">
              {instructor.name}
            </h3>
          </div>
        </div>

        <p className="text-[15px] leading-7 text-neutral-600 sm:max-w-lg sm:flex-1 sm:line-clamp-2">
          {toPlainText(instructor.bio)}
        </p>

        <Link
          href={`/instructors/${instructor.slug}`}
          className="flex shrink-0 items-center gap-2 text-sm font-medium text-ember-600 transition-colors hover:text-ember-700 sm:ml-auto"
        >
          View instructor
          <NextIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
