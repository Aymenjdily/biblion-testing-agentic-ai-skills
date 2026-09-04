export function ProgressBar({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={className}>
      <div className="h-2 w-full rounded-full bg-border">
        <div
          className="h-2 rounded-full bg-ember-600 transition-[width] duration-[220ms] ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {label && (
        <span className="mt-1.5 block font-mono text-xs text-neutral-500">
          {label}
        </span>
      )}
    </div>
  );
}
