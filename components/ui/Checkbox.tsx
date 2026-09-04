import type { InputHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";
import { CheckIcon } from "@/components/icons";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className, defaultChecked, ...props }: CheckboxProps) {
  return (
    <label className={clsx("group flex cursor-pointer items-center gap-2.5 text-[12.5px] text-neutral-700", className)}>
      <span className="relative flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-chip border border-neutral-300 bg-card peer-checked:border-indigo group-has-[:checked]:border-indigo group-has-[:checked]:bg-indigo">
        <CheckIcon
          className="h-2 w-2 text-white opacity-0 group-has-[:checked]:opacity-100"
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
