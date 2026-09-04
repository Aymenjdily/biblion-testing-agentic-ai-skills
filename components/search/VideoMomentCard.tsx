import { Button } from "@/components/ui/Button";
import { CompletedTag, Eyebrow } from "@/components/ui/Badge";
import { PlayIcon } from "@/components/icons";

export interface VideoMomentResult {
  type: "video-moment";
  title: string;
  lessonLabel: string;
  description: string;
  timestamp: string;
  clipLength: string;
  progressPct?: number;
  completed?: boolean;
}

export function VideoMomentCard({ result }: { result: VideoMomentResult }) {
  const { title, lessonLabel, description, timestamp, clipLength, progressPct, completed } =
    result;

  return (
    <article className="flex gap-6 rounded-card border border-border bg-card p-4 shadow-[0_1px_1.5px_rgba(22,24,29,0.06)] transition-shadow duration-[120ms] hover:shadow-[0_4px_16px_rgba(22,24,29,0.08)]">
      <div className="relative h-[86px] w-[152px] shrink-0 overflow-hidden rounded-[6px] border border-border bg-neutral-200">
        <div
          className={
            "absolute inset-0 " + (completed ? "bg-teal/[0.07]" : "bg-indigo/[0.06]")
          }
        />
        <button
          type="button"
          aria-label={`Play from ${timestamp}`}
          className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink/[0.78] text-white transition-transform duration-[120ms] hover:scale-105"
        >
          <PlayIcon className="h-3.5 w-3.5" />
        </button>
        <span className="absolute bottom-1.5 right-1.5 rounded-chip bg-ink/80 px-1.5 py-0.5 font-mono text-[9.5px] tabular-nums text-white">
          {timestamp}
        </span>
        {progressPct !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-border">
            <div
              className="h-full bg-teal"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-center gap-4">
          <Eyebrow color="amber">VIDEO MOMENT</Eyebrow>
          {completed && <CompletedTag />}
        </div>
        <h3 className="mt-2 truncate font-serif text-[21px] leading-tight text-ink">
          {title}
        </h3>
        <p className="mt-1.5 text-[12.5px] text-neutral-500">{lessonLabel}</p>
        <p className="mt-1 max-w-[62ch] text-[12.5px] text-neutral-700">{description}</p>
      </div>

      <div className="flex w-[142px] shrink-0 flex-col items-center justify-center gap-1.5 self-center">
        <Button size="sm" className="w-full">
          Watch from {timestamp}
        </Button>
        <span className="font-mono text-[11px] text-neutral-400">{clipLength} clip</span>
      </div>
    </article>
  );
}
