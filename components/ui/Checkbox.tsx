import type { InputHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";
import { CheckIcon } from "@/components/icons";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className, defaultChecked, ...props }: CheckboxProps) {
  return (
    <label className={clsx("group flex cursor-pointer items-center gap-2.5 text-[13px] text-neutral-700", className)}>
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-chip border border-neutral-300 bg-surface peer-checked:border-ember-600 group-has-[:checked]:border-ember-600 group-has-[:checked]:bg-ember-600">
        <CheckIcon
          className="h-2.5 w-2.5 text-white opacity-0 group-has-[:checked]:opacity-100"
          strokeWidth={2.4}
        />
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        defaultChecked={defaultChecked}
        {...props}
      />
      {label}
    </label>
  );
}
