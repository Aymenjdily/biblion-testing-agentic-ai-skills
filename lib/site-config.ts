// Single source of truth for site-wide metadata constants — every metadata
// file (layout, opengraph-image, robots, sitemap) reads from here instead of
// repeating the URL/name/description.

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://biblion.example.com";
export const siteName = "Biblion";
export const siteDescription =
  "Find the exact second — search across every course, lesson, and video moment.";
