import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon. Apple's own guidance is to avoid transparency here —
// iOS applies its own corner rounding/mask, so this stays a flat, opaque
// square filled with the site's cream background.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf7f1",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24">
          <path d="M2 4.5 12 7.5V21L2 18V4.5Z" fill="#ea580c" />
          <path d="M22 4.5 12 7.5V21l10-3V4.5Z" fill="#fb923c" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
