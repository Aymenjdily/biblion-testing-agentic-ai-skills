/**
 * `lesson.duration` is authored as a "MM:SS" string per the current schema,
 * but some already-imported content predates that convention and stores raw
 * seconds as a number (a pre-existing seed/import mismatch, not something
 * this page can fix) — so every reader here accepts both.
 */
export function toSeconds(duration: string | number): number {
  if (typeof duration === "number") return duration;
  const parts = duration.split(":").map((p) => parseInt(p, 10) || 0);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/** Formats a seconds count as "MM:SS" (or "H:MM:SS" past an hour) for display. */
export function formatClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Formats a total seconds count as "Xh Ym" (or "Ym" under an hour). */
export function formatDurationTotal(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
}
