import type { ButtonHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

type ButtonVariant = "primary" | "secondary" | "link";
type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-[120ms] ease-out disabled:pointer-events-none disabled:opacity-32";

const variants: Record<ButtonVariant, string> = {
  primary:
    "rounded-control bg-indigo text-white hover:bg-indigo-deep active:bg-indigo-deep",
  secondary:
    "rounded-control bg-card text-ink border border-ink/90 hover:bg-neutral-50",
  link: "text-indigo underline decoration-1 underline-offset-4 hover:text-indigo-deep",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-[46px] px-5 text-sm",
  sm: "h-[34px] px-4 text-[12.5px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const sizing = variant === "link" ? "" : sizes[size];
  return (
    <button
      className={clsx(base, variants[variant], sizing, className)}
      {...props}
    />
  );
}
