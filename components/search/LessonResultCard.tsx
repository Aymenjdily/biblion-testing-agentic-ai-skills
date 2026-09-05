import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CourseIcon, NextIcon, CheckIcon } from "@/components/icons";
import type { SearchResultItem } from "@/lib/search";

export function LessonResultCard({ result }: { result: SearchResultItem }) {
  const { lesson } = result;
  const { context } = lesson;

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="flex items-start gap-4 rounded-card border border-border bg-surface p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-soft text-ember-600">
        <CourseIcon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] tracking-wide text-ember-600">
            {context ? (
              <>
                {context.courseTitle.toUpperCase()} · LESSON {context.moduleIndex + 1}.
                {context.lessonIndex + 1}
              </>
            ) : (
              "LESSON"
            )}
          </p>
          {lesson.freePreview && <Badge variant="soft">Free preview</Badge>}
        </div>

        <h3 className="mt-1 font-display text-lg font-semibold text-ink-900">{lesson.title}</h3>
        <p className="mt-1 text-sm text-neutral-600">{result.description}</p>

        {lesson.keyPoints.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {lesson.keyPoints.slice(0, 3).map((point) => (
              <li key={point} className="flex items-start gap-2 text-[13px] text-neutral-500">
                <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-ember-600" strokeWidth={2.4} />
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>

      <NextIcon className="h-4 w-4 shrink-0 text-neutral-400" />
    </Link>
  );
}
