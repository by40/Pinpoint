import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pre-release password gate. While SITE_LOCKED === "true", every route is
// rewritten to /gate unless the visitor presents the auth cookie. Flip
// SITE_LOCKED off (or delete this file + app/gate + app/api/gate) to launch.
// (In Next 16 the old `middleware.ts` convention is renamed to `proxy.ts`.)

const COOKIE = "pinpoint_gate";

// Paths that must stay reachable even while the site is locked.
function isAllowed(pathname: string): boolean {
  // The gate itself + its verify endpoint.
  if (pathname === "/gate" || pathname === "/api/gate") return true;
  // Google Search Console verification file — Google re-checks it, so keep it
  // reachable to avoid losing the verified property during the locked period.
  if (pathname === "/google4172a2c1ad8a831a.html") return true;
  // Static assets / fonts / images (NOT sitemap.xml or robots.txt — those are
  // intentionally locked too, per the pre-release "lock everything" choice).
  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    /\.(?:png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|otf|css|js|mp4|webmanifest)$/.test(pathname)
  ) {
    return true;
  }
  return false;
}

export function proxy(request: NextRequest) {
  // Gate disabled — pass everything straight through.
  if (process.env.SITE_LOCKED !== "true") return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (isAllowed(pathname)) return NextResponse.next();

  // Already authenticated?
  const token = process.env.GATE_TOKEN;
  if (token && request.cookies.get(COOKIE)?.value === token) {
    return NextResponse.next();
  }

  // Show the gate without changing the visible URL.
  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on everything except Next's build assets (the function above handles
  // the rest of the allow-listing). Keep this a static constant.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
