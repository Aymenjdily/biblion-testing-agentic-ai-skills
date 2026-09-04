import type { SVGProps } from "react";

/**
 * Biblion icon set — 1.5px stroke, 24px grid, round caps/joins.
 * Color is used only to communicate state; icons default to currentColor.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.3" y1="15.3" x2="20.5" y2="20.5" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M8 5.5 L18.5 12 L8 18.5 Z" fill="currentColor" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="12" x2="12" y2="7.5" />
      <line x1="12" y1="12" x2="15.5" y2="14" />
    </svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <line x1="10" y1="7" x2="19" y2="7" />
      <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <line x1="10" y1="12" x2="19" y2="12" />
      <circle cx="6" cy="17" r="1.2" fill="currentColor" stroke="none" />
      <line x1="10" y1="17" x2="19" y2="17" />
    </svg>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4h10v16l-5-4-5 4Z" />
    </svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3 L15 3 L18 6 L18 14 L11 18 L4 14 L4 6 Z" />
      <circle cx="9.5" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12.5 L9 17 L19.5 6" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9 L12 15 L18 9" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 10a7 7 0 0 1 14 0v3.5l1.5 3H3.5L5 13.5Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function BiblionMark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M12 7c2-1.6 6-1.6 8 0v11c-2-1.6-6-1.6-8 0V7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 7c-2-1.6-6-1.6-8 0v11c2-1.6 6-1.6 8 0V7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}
