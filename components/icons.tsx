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

/* ---- Solid icon set (Font Awesome solid style, 24px grid, filled glyphs) ---- */

const solid = { viewBox: "0 0 24 24", fill: "currentColor" };

export function CourseIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 6.2C10.1 4.9 7.5 4.4 4 4.4v14c3.5 0 6.1.5 8 1.8 1.9-1.3 4.5-1.8 8-1.8v-14c-3.5 0-6.1.5-8 1.8Zm0 2.1c1.6-.9 3.6-1.5 6-1.6v10.2c-2.4.1-4.4.7-6 1.6V8.3Z" />
    </svg>
  );
}

export function LevelIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 3.8 1 9l11 5.2L20.6 10v5.4h2.4V9L12 3.8ZM6 12.6V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.4l-6 2.8-6-2.8Z" />
    </svg>
  );
}

export function DurationIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm1 5h-2v6l4.7 2.8 1-1.7-3.7-2.2V7Z" />
    </svg>
  );
}

export function SavedIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M7 3h10a1 1 0 0 1 1 1v17.2l-6-4.2-6 4.2V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function ProgressIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M3 20.5V11h2.5v6.5H20v3H3ZM11 6.4l3.4-3.9 2.8 2.3L21 1.5h-3V0h5.5v5.5h-1.8V2.8L13.4 10l-3-2.5-2.8 3.4-1.5-1.2L11 6.4Z" transform="translate(0 1)" />
    </svg>
  );
}

export function AlertsIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 2a6.5 6.5 0 0 0-6.5 6.5c0 4.9-1.7 5.9-1.7 5.9h16.4s-1.7-1-1.7-5.9A6.5 6.5 0 0 0 12 2Zm-2.3 16a2.3 2.3 0 0 0 4.6 0H9.7Z" />
    </svg>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M3 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm17 3.3 4-2.5v10.4l-4-2.5v-5.4Z" />
    </svg>
  );
}

export function CertificateIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 3.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6ZM8.4 13.6 6.8 22l5.2-3 5.2 3-1.6-8.4a7.7 7.7 0 0 1-7.2 0Z" />
    </svg>
  );
}

export function ProTipIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 2a7 7 0 0 1 4 12.7c-.6.5-1 1.4-1 2.3H9c0-.9-.4-1.8-1-2.3A7 7 0 0 1 12 2ZM9.2 18h5.6v.8a2 2 0 0 1-2 2h-1.6a2 2 0 0 1-2-2V18Z" />
    </svg>
  );
}

export function ModulesIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 2 22 7.7l-10 5.7L2 7.7 12 2Zm-10 11 10 5.7 10-5.7v3.8L12 22.5 2 16.8V13Z" />
    </svg>
  );
}

export function InstructorIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 12.2a5.1 5.1 0 1 0 0-10.2 5.1 5.1 0 0 0 0 10.2Zm0 2c-5 0-9 2.4-9 5.4V22h18v-2.4c0-3-4-5.4-9-5.4Z" />
    </svg>
  );
}

export function RatingIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="m12 1.8 2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 16.9l-6 3.3 1.3-6.7-5-4.7 6.8-.8L12 1.8Z" />
    </svg>
  );
}

export function DoneIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.7 7.1-5.6 5.6-2.8-2.8-1.4 1.4 4.2 4.2 7-7-1.4-1.4Z" />
    </svg>
  );
}

export function NextIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M13.2 4.2 20.9 12l-7.7 7.8-1.5-1.5 5.3-5.3H3.5v-2.1h13.5l-5.3-5.3 1.5-1.4Z" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 6 L9 12 L15 18" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5.5" y="11" width="13" height="9" rx="1.8" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

export function InfinityIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 8.5a3.5 3.5 0 1 0 0 7c2.5 0 3.5-2.2 5-3.5 1.5-1.3 2.5-3.5 5-3.5a3.5 3.5 0 1 1 0 7c-2.5 0-3.5-2.2-5-3.5-1.5-1.3-2.5-3.5-5-3.5Z" />
    </svg>
  );
}

export function UndoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 8.5h6.5a5.5 5.5 0 1 1-5.2 7.3" />
      <path d="M5 8.5V4.5" />
      <path d="M5 8.5H9" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...solid} {...props}>
      <path d="M12 2c1 2.5-.5 3.8-1.7 5.2C9 8.6 8 10 8 12a4 4 0 0 0 8 0c0-1-.3-1.8-.8-2.6.8.6 1.8 1.8 1.8 3.6a5 5 0 0 1-10 0c0-4 3-5.5 3.7-7C11 4.8 11.3 3.3 12 2Z" />
    </svg>
  );
}

export function BiblionMark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M2 4.5 12 7.5V21L2 18V4.5Z" fill="var(--color-ember-600)" />
      <path d="M22 4.5 12 7.5V21l10-3V4.5Z" fill="var(--color-ember-400)" />
    </svg>
  );
}