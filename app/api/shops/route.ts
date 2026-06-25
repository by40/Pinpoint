import { NextRequest, NextResponse } from "next/server";
import { resolveQuery } from "@/lib/categories";
import { queryNearbyShops } from "@/lib/overpass";

const MAX_QUERY_LEN = 80;

// Best-effort per-IP rate limit (fixed window). This is an open proxy to the
// public Overpass mirrors, so we cap how fast a single client can hit it to
// avoid getting our deployment IP rate-limited or banned. Note: serverless
// instances don't share memory, so this is a soft, per-instance guard — a
// durable store (e.g. Upstash/Vercel KV) is the production-grade upgrade.
const RATE_LIMIT = 30; // requests
const RATE_WINDOW_MS = 60 * 1000; // per minute
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    return { limited: false, retryAfter: 0 };
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfter: 0 };
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { limited, retryAfter } = rateLimited(ip);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q")?.trim() ?? "").slice(0, MAX_QUERY_LEN);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  const radius = Math.min(parseInt(searchParams.get("radius") ?? "3000"), 20000);

  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Missing or invalid coordinates" }, { status: 400 });
  }

  try {
    const resolved = resolveQuery(q);
    const shops = await queryNearbyShops(resolved, lat, lon, radius);
    return NextResponse.json(
      { shops, tags: resolved.shopTypes, brands: resolved.brands },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
