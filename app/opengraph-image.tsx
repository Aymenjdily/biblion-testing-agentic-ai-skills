import { ImageResponse } from "next/og";
import { siteDescription } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default social-preview card, shown for any route that doesn't
// define its own opengraph-image. Uses the real BiblionMark shape and brand
// tokens (app/globals.css) rather than a generic placeholder.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#1c1917",
          padding: 80,
        }}
      >
        <svg width="88" height="88" viewBox="0 0 24 24">
          <path d="M2 4.5 12 7.5V21L2 18V4.5Z" fill="#ea580c" />
          <path d="M22 4.5 12 7.5V21l10-3V4.5Z" fill="#fb923c" />
        </svg>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#fbf7f1",
            letterSpacing: -2,
          }}
        >
          Biblion
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#a8a29e",
            textAlign: "center",
            maxWidth: 880,
          }}
        >
          {siteDescription}
        </div>
      </div>
    ),
    { ...size },
  );
}
