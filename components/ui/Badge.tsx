import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";
import { CheckIcon } from "@/components/icons";

type BadgeVariant = "soft" | "popular" | "neutral" | "success" | "info";

const variants: Record<BadgeVariant, string> = {
  soft: "bg-soft text-ember-800",
  popular: "bg-ember-600 text-white",
  neutral: "bg-neutral-100 text-neutral-700 border border-border",
  success: "bg-success text-white",
  info: "bg-info text-white",
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
        "inline-flex h-[30px] items-center rounded-full px-4 text-xs font-semibold uppercase tracking-wide",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}

/** Small solid-color tag used to label a result type, e.g. "VIDEO MOMENT". */
export function Eyebrow({
  color = "ember",
  children,
}: {
  color?: "ember" | "info" | "success";
  children: ReactNode;
}) {
  const dot = { ember: "bg-ember-500", info: "bg-info", success: "bg-success" }[color];
  const text = {
    ember: "text-ember-700",
    info: "text-info",
    success: "text-success",
  }[color];
  return (
    <span className={clsx("inline-flex items-center gap-2 font-mono text-[11px] tracking-wide", text)}>
      <span className={clsx("h-3.5 w-3.5 rounded-chip", dot)} />
      {children}
    </span>
  );
}

/** "Lesson completed" / "Completed" indicator — success check in a filled circle. */
export function CompletedTag({ children = "Completed" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-success">
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-success">
        <CheckIcon className="h-2.5 w-2.5 text-white" strokeWidth={2.2} />
      </span>
      {children}
    </span>
  );
}
