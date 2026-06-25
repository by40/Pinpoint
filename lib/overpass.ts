export interface Shop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  shopType: string;
  address: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  distanceKm: number;
  priceRange: 1 | 2 | 3;
}

// Distances are stored in km but the UI is UK-facing, so display in miles
// (or yards for very short hops) to stay consistent with the miles radius slider.
export function formatDistance(distanceKm: number): string {
  const miles = distanceKm * 0.621371;
  if (miles < 0.1) return `${Math.round(miles * 1760)} yd`;
  return `${miles.toFixed(1)} mi`;
}

function estimatePriceRange(shopType: string): 1 | 2 | 3 {
  const s = shopType.toLowerCase();
  const budget = ["charity", "second_hand", "discount", "variety_store", "pawnbroker", "thrift"];
  const premium = ["jewellery", "jewelry", "antiques", "art", "boutique", "cosmetics", "perfumery", "leather", "tailor", "watches", "optician"];
  if (budget.some((t) => s.includes(t))) return 1;
  if (premium.some((t) => s.includes(t))) return 3;
  return 2;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.join(", ") || "Address not listed";
}

function buildQuery(tags: string[], lat: number, lon: number, radius: number): string {
  const tagFilters = tags
    .map(
      (t) =>
        `  node["shop"="${t}"](around:${radius},${lat},${lon});\n  way["shop"="${t}"](around:${radius},${lat},${lon});`
    )
    .join("\n");

  return `[out:json][timeout:25];\n(\n${tagFilters}\n);\nout center tags;`;
}

function buildFallbackQuery(query: string, lat: number, lon: number, radius: number): string {
  // Search for any shop whose name contains the query term.
  // Two escaping layers: first regex-escape metacharacters so terms like "c++"
  // or "(vintage" can't produce an invalid Overpass regex, then escape for the
  // QL string literal (double every backslash so the regex engine receives the
  // escapes intact, then escape quotes).
  const escaped = query
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  return `[out:json][timeout:25];\n(\n  node["shop"]["name"~"${escaped}",i](around:${radius},${lat},${lon});\n  way["shop"]["name"~"${escaped}",i](around:${radius},${lat},${lon});\n);\nout center tags;`;
}

// Public Overpass mirrors, tried in order. The public endpoints are heavily
// rate-limited and occasionally down, so we fail over between them.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

// Identify the app politely per Overpass etiquette, with a contact URL.
const USER_AGENT = "Pinpoint/1.0 (+https://pinpointapp.uk; local shop finder)";

// Short-lived in-memory cache to spare the public Overpass mirrors from
// repeated identical lookups (e.g. radius re-runs, popular queries in an area).
// Best-effort only: serverless instances don't share memory, so this is a
// per-instance soft cache, not a guarantee.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; shops: Shop[] }>();

function cacheKey(tags: string[], query: string, lat: number, lon: number, radius: number): string {
  // Round coords to ~110m so near-identical fixes share a cache entry.
  const k = tags.length > 0 ? `t:${[...tags].sort().join(",")}` : `q:${query.toLowerCase()}`;
  return `${k}|${lat.toFixed(3)}|${lon.toFixed(3)}|${radius}`;
}

// POST a query to the Overpass mirrors with one retry and endpoint failover.
async function runOverpass(ql: string): Promise<OverpassResponse> {
  let lastErr: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json, */*",
            "User-Agent": USER_AGENT,
          },
          body: `data=${encodeURIComponent(ql)}`,
          signal: AbortSignal.timeout(20000),
        });
        // 429 (rate limited) and 504 (gateway timeout) are worth retrying/failing over.
        if (res.status === 429 || res.status === 504) {
          lastErr = new Error(`Overpass busy: ${res.status}`);
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
          continue;
        }
        if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
        return (await res.json()) as OverpassResponse;
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Overpass unavailable");
}

export async function queryNearbyShops(
  tags: string[],
  query: string,
  lat: number,
  lon: number,
  radius: number
): Promise<Shop[]> {
  const key = cacheKey(tags, query, lat, lon, radius);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.shops;

  const ql = tags.length > 0 ? buildQuery(tags, lat, lon, radius) : buildFallbackQuery(query, lat, lon, radius);

  const data = await runOverpass(ql);
  const seen = new Set<string>();
  const shops: Shop[] = [];

  for (const el of data.elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name) continue;

    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (elLat == null || elLon == null) continue;

    // Deduplicate by name + approximate position
    const key = `${name}|${elLat.toFixed(4)}|${elLon.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    shops.push({
      id: `${el.type}-${el.id}`,
      name,
      lat: elLat,
      lon: elLon,
      shopType: tags.shop ?? "shop",
      address: buildAddress(tags),
      website: tags.website || tags["contact:website"],
      phone: tags.phone || tags["contact:phone"],
      openingHours: tags.opening_hours,
      distanceKm: haversineKm(lat, lon, elLat, elLon),
      priceRange: estimatePriceRange(tags.shop ?? "shop"),
    });
  }

  shops.sort((a, b) => a.distanceKm - b.distanceKm);

  // Bound cache growth: drop the oldest entry once it gets large.
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), shops });

  return shops;
}
