import type { ButtonHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-[120ms] ease-out disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ember-600 text-white hover:bg-ember-700 active:bg-ember-700 disabled:bg-ember-300",
  secondary:
    "border border-border bg-surface text-ink-900 hover:bg-neutral-50 active:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-200",
  ghost:
    "text-ember-600 hover:text-ember-700 disabled:text-ember-300",
  danger:
    "bg-error text-white hover:bg-[#b91c1c] active:bg-[#b91c1c] disabled:bg-[#f5b5b5]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-5 text-sm",
  sm: "h-9 px-4 text-[13px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const sizing = variant === "ghost" ? "" : sizes[size];
  return (
    <button
      className={clsx(base, variants[variant], sizing, className)}
      {...props}
    />
  );
}
