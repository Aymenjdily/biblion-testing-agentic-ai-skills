import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { PlayIcon } from "@/components/icons";
import { formatClock, toSeconds } from "@/lib/duration";
import type { CourseDetail } from "@/sanity/lib/queries";

/**
 * Dark intro card. There's no course-trailer field in the schema, so this
 * links to the course's first lesson at second 0 instead of a fabricated
 * intro video, and shows that lesson's real duration.
 */
export function VideoPreviewCard({ course }: { course: CourseDetail }) {
  const firstLesson = course.modules[0]?.lessons[0];
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="relative h-56 overflow-hidden rounded-card bg-ink-900">
      <Image
        src={urlFor(course.coverImage).width(800).height(450).url()}
        alt=""
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ink-900/95 via-ink-900/85 to-ink-900/55" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <p className="font-mono text-[11px] tracking-[0.18em] text-ember-400">
            COURSE · {course.category.title.toUpperCase()}
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold leading-tight text-white">
            {course.title}
          </h2>

          <div className="mt-4 flex items-center justify-between gap-4">
            {firstLesson ? (
              <Link
                href={`/lessons/${firstLesson.slug}?start=0`}
                className="flex items-center gap-3 text-sm font-medium text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20">
                  <PlayIcon className="h-3.5 w-3.5 translate-x-px text-white" />
                </span>
                Watch intro · {formatClock(toSeconds(firstLesson.duration))}
              </Link>
            ) : (
              <span />
            )}
            <p className="font-mono text-[11px] tracking-wide text-neutral-300">
              {totalLessons} LESSONS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
