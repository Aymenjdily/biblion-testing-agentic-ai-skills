import Link from "next/link";
import { Eyebrow, Badge } from "@/components/ui/Badge";
import { ChevronLeftIcon, RatingIcon, FlameIcon } from "@/components/icons";
import { toPlainText } from "@/lib/plain-text";
import type { CourseDetail } from "@/sanity/lib/queries";

const LEVEL_LABEL: Record<CourseDetail["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function CourseHero({
  course,
  totalLessons,
  totalDurationLabel,
}: {
  course: CourseDetail;
  totalLessons: number;
  totalDurationLabel: string;
}) {
  const updated = new Date(course._updatedAt);

  return (
    <div>
      <Link
        href="/catalog"
        className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-neutral-500 transition-colors hover:text-ink-900"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        CATALOG · {course.category.title.toUpperCase()}
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Eyebrow>
          {course.category.title.toUpperCase()} · {LEVEL_LABEL[course.level].toUpperCase()}
        </Eyebrow>
        {course.popular && (
          <Badge variant="popular">
            <FlameIcon className="mr-1.5 -ml-1 h-3 w-3" />
            Popular
          </Badge>
        )}
      </div>

      <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 md:text-5xl">
        {course.title}
      </h1>

      <p className="mt-5 max-w-2xl text-[17px] leading-8 text-neutral-600">
        {toPlainText(course.summary)}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] text-neutral-500">
        {course.rating != null && (
          <span className="flex items-center gap-1.5 text-ink-900">
            <RatingIcon className="h-3.5 w-3.5 text-ember-500" />
            {course.rating.toFixed(1)}
            {course.ratingCount != null && (
              <span className="text-neutral-500">
                &nbsp;({course.ratingCount.toLocaleString()} ratings)
              </span>
            )}
          </span>
        )}
        <span>·</span>
        <span>{course.studentCount.toLocaleString()} learners</span>
        <span>·</span>
        <span>
          {totalLessons} lessons · {totalDurationLabel}
        </span>
        <span>·</span>
        <span>
          Updated{" "}
          {updated.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
      </div>

      {course.tags && course.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wide text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
