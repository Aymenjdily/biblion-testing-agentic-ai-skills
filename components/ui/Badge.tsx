import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";
import { CheckIcon } from "@/components/icons";

type BadgeVariant = "amber" | "neutral" | "tealTint" | "teal";

const variants: Record<BadgeVariant, string> = {
  amber: "bg-amber-tint text-amber-ink",
  neutral: "bg-neutral-50 text-neutral-700 border border-border",
  tealTint: "bg-teal-tint text-teal",
  teal: "bg-teal text-white",
};

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex h-[30px] items-center rounded-full px-4 text-xs font-medium",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}

/** Small solid-color tag used to label a result type, e.g. "VIDEO MOMENT". */
export function Eyebrow({
  color = "amber",
  children,
}: {
  color?: "amber" | "indigo" | "teal";
  children: ReactNode;
}) {
  const dot = { amber: "bg-amber", indigo: "bg-indigo", teal: "bg-teal" }[color];
  const text = { amber: "text-amber-ink", indigo: "text-indigo", teal: "text-teal" }[
    color
  ];
  return (
    <span className={clsx("inline-flex items-center gap-2 font-mono text-[11px] tracking-wide", text)}>
      <span className={clsx("h-3.5 w-3.5 rounded-chip", dot)} />
      {children}
    </span>
  );
}

/** "Lesson completed" / "Completed" indicator — teal check in a filled circle. */
export function CompletedTag({ children = "Completed" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-teal">
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-teal">
        <CheckIcon className="h-2.5 w-2.5 text-white" strokeWidth={2.2} />
      </span>
      {children}
    </span>
  );
}
