/**
 * Some already-imported content predates the current schema and still
 * stores a few "plain text" fields (course/module summary, instructor bio)
 * as Portable Text blocks instead — a pre-existing data drift, not something
 * this page can fix. Coerces either shape to a plain string for rendering.
 */
export function toPlainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((block) =>
        block && typeof block === "object" && Array.isArray((block as { children?: unknown }).children)
          ? (block as { children: { text?: string }[] }).children
              .map((span) => span.text ?? "")
              .join("")
          : "",
      )
      .join("\n");
  }
  return "";
}
