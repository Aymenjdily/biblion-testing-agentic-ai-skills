import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Badge";
import { BookmarkIcon } from "@/components/icons";

export interface LessonResult {
  type: "lesson";
  title: string;
  lessonLabel: string;
  topics: string[];
}

export function LessonCard({ result }: { result: LessonResult }) {
  const { title, lessonLabel, topics } = result;

  return (
    <article className="flex gap-6 rounded-card border border-border bg-card p-4 shadow-[0_1px_1.5px_rgba(22,24,29,0.06)] transition-shadow duration-[120ms] hover:shadow-[0_4px_16px_rgba(22,24,29,0.08)]">
      <div className="flex h-[86px] w-[152px] shrink-0 items-center justify-center rounded-[6px] border border-border bg-neutral-50">
        <BookmarkIcon className="h-7 w-7 text-neutral-400" />
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <Eyebrow color="indigo">LESSON</Eyebrow>
        <h3 className="mt-2 truncate font-serif text-[21px] leading-tight text-ink">
          {title}
        </h3>
        <p className="mt-1.5 text-[12.5px] text-neutral-500">{lessonLabel}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full bg-neutral-50 px-3 py-1 text-[11px] text-neutral-700"
            >
              {topic}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-[142px] shrink-0 items-center justify-center self-center">
        <Button variant="secondary" size="sm" className="w-full">
          Open lesson
        </Button>
      </div>
    </article>
  );
}
