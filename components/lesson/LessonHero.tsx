import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { MarkCompleteButton } from "@/components/lesson/MarkCompleteButton";
import { CertificateIcon, ChevronLeftIcon, ClockIcon, NextIcon } from "@/components/icons";
import { formatClock, toSeconds } from "@/lib/duration";
import type { CourseDetail, LessonContext } from "@/sanity/lib/queries";

type SiblingLesson = { slug: string; moduleIndex: number; lessonIndex: number } | null;

export function LessonHero({
  title,
  duration,
  studentCount,
  context,
  instructor,
  prev,
  next,
}: {
  title: string;
  duration: string | number;
  studentCount: number;
  context: LessonContext;
  instructor: CourseDetail["instructor"];
  prev: SiblingLesson;
  next: SiblingLesson;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/courses/${context.courseSlug}`}
          className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-neutral-500 transition-colors hover:text-ink-900"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          {context.courseTitle.toUpperCase()} · MODULE {String(context.moduleIndex + 1).padStart(2, "0")} ·{" "}
          {context.moduleTitle.toUpperCase()}
        </Link>

        <div className="flex items-center gap-4 font-mono text-[13px] text-neutral-400">
          {prev && (
            <Link
              href={`/lessons/${prev.slug}`}
              className="flex items-center gap-1.5 transition-colors hover:text-ink-900"
            >
              <ChevronLeftIcon className="h-3 w-3" />
              {prev.moduleIndex + 1}.{prev.lessonIndex + 1}
            </Link>
          )}
          {next && (
            <Link
              href={`/lessons/${next.slug}`}
              className="flex items-center gap-1.5 transition-colors hover:text-ink-900"
            >
              {next.moduleIndex + 1}.{next.lessonIndex + 1}
              <NextIcon className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-wide text-ember-600">
            <span className="h-2 w-2 bg-ember-600" />
            LESSON {context.moduleIndex + 1}.{context.lessonIndex + 1}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink-900">{title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatClock(toSeconds(duration))}
            </span>
            <span>·</span>
            <span>{studentCount.toLocaleString()} learners</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Avatar image={instructor.photo} alt={instructor.name} size={36} />
            <span className="text-sm text-ink-900">{instructor.name}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <MarkCompleteButton />
          {next ? (
            <Link
              href={`/lessons/${next.slug}`}
              className="inline-flex h-10 items-center gap-2 rounded-control bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Next lesson
              <NextIcon className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="inline-flex h-10 items-center gap-2 rounded-control bg-neutral-100 px-5 text-sm font-medium text-neutral-400">
              <CertificateIcon className="h-3.5 w-3.5" />
              Course complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
