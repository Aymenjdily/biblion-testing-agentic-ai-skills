import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { PlayIcon } from "@/components/icons";
import { formatClock, toSeconds } from "@/lib/duration";
import type { SearchResultItem } from "@/lib/search";

/**
 * Renders a "video moment" result — a lesson matched at a specific timestamp
 * via chapter/transcript data. Not produced by the current agent (no video
 * ingestion exists yet — see prompts/search.md), but kept ready for when it
 * does: `result.matchedSecond` is real data once emitted, never fabricated.
 */
export function VideoResultCard({ result }: { result: SearchResultItem }) {
  const { lesson, matchedSecond } = result;
  const { context } = lesson;
  const startSeconds = matchedSecond ?? 0;

  return (
    <Link
      href={`/lessons/${lesson.slug}?start=${startSeconds}`}
      className="flex items-start gap-4 rounded-card border border-border bg-surface p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(28,25,23,0.08)]"
    >
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-neutral-700 to-ink-900">
        {lesson.poster?.asset && (
          <Image
            src={urlFor(lesson.poster).width(256).height(160).url()}
            alt=""
            fill
            className="object-cover opacity-80"
          />
        )}
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <PlayIcon className="h-3 w-3 text-white" />
        </span>
        <span className="absolute bottom-1 right-1 rounded bg-ink-900/80 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-white">
          {formatClock(startSeconds)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
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
        <h3 className="mt-1 font-display text-lg font-semibold text-ink-900">{lesson.title}</h3>
        <p className="mt-1 text-sm text-neutral-600">{result.description}</p>
      </div>

      <span className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-medium text-ink-900">
        <PlayIcon className="h-3 w-3 text-ember-600" />
        Watch · {formatClock(startSeconds)} / {formatClock(toSeconds(lesson.duration))}
      </span>
    </Link>
  );
}
