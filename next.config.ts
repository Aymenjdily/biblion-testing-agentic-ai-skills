import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sanity's own image CDN already resizes/crops via urlFor()'s width()/height()
    // query params, so re-optimizing through Next's server-side image proxy is
    // redundant — and on networks that resolve external hosts via NAT64 (an IPv6
    // address synthesized from a public IPv4 one), Next 16's SSRF guard
    // misclassifies that synthesized address as a private IP and blocks the
    // fetch outright. Skipping Next's optimizer avoids both problems.
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
