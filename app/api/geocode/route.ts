import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to Nominatim so users who deny/lack geolocation can still
// search by typing a town or postcode. Proxying lets us set the required
// User-Agent and keep Nominatim's usage policy (UK-scoped, low volume, cached).
const USER_AGENT = "Pinpoint/1.0 (+https://pinpointapp.uk; local shop finder)";
const MAX_LEN = 80;

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // place coords are stable; cache a day
const cache = new Map<string, { at: number; value: { lat: number; lon: number; label: string } | null }>();

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q")?.trim() ?? "").slice(0, MAX_LEN);
  if (!q) return NextResponse.json({ error: "Missing place" }, { status: 400 });

  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    if (!hit.value) return NextResponse.json({ error: "Place not found" }, { status: 404 });
    return NextResponse.json(hit.value, {
      headers: { "Cache-Control": "public, s-maxage=86400" },
    });
  }

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=gb&q=` +
      encodeURIComponent(q);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Geocode error: ${res.status}`);

    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!data.length) {
      cache.set(key, { at: Date.now(), value: null });
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const value = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      label: data[0].display_name.split(",").slice(0, 2).join(",").trim(),
    };
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    cache.set(key, { at: Date.now(), value });

    return NextResponse.json(value, { headers: { "Cache-Control": "public, s-maxage=86400" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
