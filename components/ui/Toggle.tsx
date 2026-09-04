"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

export function Toggle({
  label,
  defaultChecked = false,
  className,
}: {
  label: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className={clsx("flex cursor-pointer items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => setChecked((v) => !v)}
        className={clsx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-[120ms] ease-out",
          checked ? "bg-ember-600" : "bg-neutral-300"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-[120ms] ease-out",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
      <span className="text-sm text-ink-900">{label}</span>
    </label>
  );
}
