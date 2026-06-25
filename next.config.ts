import type { NextConfig } from "next";

// Content-Security-Policy (enforcing). Verified against the live site with a
// headless browser running a full search flow (map tiles, MapLibre blob workers,
// Overpass fetch, Vercel Analytics) — zero violations. We keep 'unsafe-inline'
// for script/style because Next's App Router embeds inline hydration scripts and
// the UI uses inline styles; a nonce-based policy would force every static page
// to render dynamically. The allowlisted directives below still block the
// high-value vectors (object/embed, foreign connect/img, framing, base-uri).
const csp = [
  "default-src 'self'",
  // Next.js App Router embeds inline hydration scripts; allow inline for now.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tiles.openfreemap.org https://*.openfreemap.org",
  "font-src 'self' data:",
  "connect-src 'self' https://tiles.openfreemap.org https://*.openfreemap.org",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    // Lock down powerful features; the app only needs geolocation, on its own origin.
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Pin the workspace root to this project. Without this, a stray lockfile in a
  // parent directory (e.g. ~/package-lock.json) makes Next infer the wrong root.
  turbopack: { root: process.cwd() },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
