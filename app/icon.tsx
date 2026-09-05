import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Reuses the exact BiblionMark paths (components/icons.tsx) and brand ember
// tones (app/globals.css) — this is the browser tab / bookmark icon.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24">
          <path d="M2 4.5 12 7.5V21L2 18V4.5Z" fill="#ea580c" />
          <path d="M22 4.5 12 7.5V21l10-3V4.5Z" fill="#fb923c" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
