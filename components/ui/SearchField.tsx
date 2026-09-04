import type { InputHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";
import { SearchIcon } from "@/components/icons";

interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Show the / shortcut hint on the right (full-size field only). */
  shortcut?: boolean;
  compact?: boolean;
}

export function SearchField({
  shortcut = false,
  compact = false,
  className,
  ...props
}: SearchFieldProps) {
  return (
    <div
      className={clsx(
        "relative flex w-full items-center rounded-control border border-border bg-surface transition-shadow duration-[120ms] ease-out",
        "focus-within:border-ember-400 focus-within:shadow-[0_0_0_3px_var(--color-ember-200),0_0_0_5px_var(--color-ember-300)]",
        compact ? "h-[34px]" : "h-[52px] shadow-[0_1px_1.5px_rgba(28,25,23,0.06)]",
        className
      )}
    >
      <SearchIcon
        className={clsx(
          "pointer-events-none absolute text-neutral-500",
          compact ? "left-2.5 h-3.5 w-3.5" : "left-4 h-4 w-4"
        )}
      />
      <input
        type="text"
        className={clsx(
          "h-full w-full bg-transparent text-neutral-700 placeholder:text-neutral-400 focus:outline-none",
          compact ? "pl-8 pr-3 text-[12.5px]" : "pl-11 pr-16 text-[15px]"
        )}
        {...props}
      />
      {shortcut && !compact && (
        <kbd className="pointer-events-none absolute right-3 flex h-7 items-center rounded-chip border border-border bg-neutral-50 px-2 font-mono text-[11px] text-neutral-500">
          /
        </kbd>
      )}
    </div>
  );
}
