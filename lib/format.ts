const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Formats a count as a compact string, e.g. 3214 -> "3.2K". */
export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value);
}
