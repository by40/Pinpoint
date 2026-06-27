export interface Shop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  shopType: string;
  brand?: string;
  address: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  distanceKm: number;
  priceRange: 1 | 2 | 3;
}

// A resolved clothing search: OSM shop types + brand names.
// - `matched`: whether the query was recognised at all.
// - `nameMatch`: a term to also match against shop names (used for unrecognised
//   queries, and for retailer searches like "JD Sports" so we find the store
//   itself by name as well as by brand tag), or null.
export interface ResolvedQuery {
  shopTypes: string[];
  brands: string[];
  matched: boolean;
  nameMatch: string | null;
  // True when the query is clearly NOT clothing (e.g. "poster", "laptop"); the
  // API short-circuits these to no results with a "clothing only" message.
  rejected?: boolean;
}

// Cap on results returned to the client. City-centre clothing searches can
// return hundreds of shops; the nearest ~60 is plenty and keeps the list/map fast.
const MAX_RESULTS = 60;

// Distances are stored in km but the UI is UK-facing, so display in miles
// (or yards for very short hops) to stay consistent with the miles radius slider.
export function formatDistance(distanceKm: number): string {
  const miles = distanceKm * 0.621371;
  if (miles < 0.1) return `${Math.round(miles * 1760)} yd`;
  return `${miles.toFixed(1)} mi`;
}

function estimatePriceRange(shopType: string): 1 | 2 | 3 {
  const s = shopType.toLowerCase();
  const budget = ["charity", "second_hand", "discount", "variety_store", "thrift"];
  const premium = ["boutique", "jewellery", "jewelry", "designer", "tailor", "leather", "watches", "department_store"];
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

// Make a string safe to embed in an Overpass QL regex string literal.
// Two escaping layers: first regex-escape metacharacters so values like "Dr.
// Martens", "size?" or "(vintage" can't produce an invalid/over-broad regex,
// then escape for the QL string literal (double every backslash so the regex
// engine receives the escapes intact, then escape quotes).
function escapeQL(value: string): string {
  return value
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

// Build the Overpass query for a clothing search: shop-type filters, brand=*
// filters, and — for unrecognised queries (likely an unknown brand) — a
// shop-name match so e.g. a "Gucci" store is still found by name.
function buildQuery(
  shopTypes: string[],
  brands: string[],
  nameTerm: string | null,
  lat: number,
  lon: number,
  radius: number
): string {
  const around = `(around:${radius},${lat},${lon})`;
  const parts: string[] = [];

  // Combine all shop types into ONE regex alternation per element kind rather
  // than a separate clause each. A search like "Nike" can resolve to several
  // shop types; emitting 2 clauses per type makes Overpass plan a big union that
  // is slow (and times out) in dense areas. One `shop~"^(a|b|c)$"` is far cheaper.
  if (shopTypes.length) {
    const re = `^(${shopTypes.map(escapeQL).join("|")})$`;
    parts.push(`  node["shop"~"${re}"]${around};`);
    parts.push(`  way["shop"~"${re}"]${around};`);
  }
  if (brands.length) {
    const re = `(${brands.map(escapeQL).join("|")})`;
    parts.push(`  node["brand"~"${re}",i]${around};`);
    parts.push(`  way["brand"~"${re}",i]${around};`);
  }
  if (nameTerm) {
    // Constrain name matches to clothing-type shops, so an unknown query like
    // "Sony" can't surface an electronics shop that happens to match by name.
    const nn = escapeQL(nameTerm);
    const types = `^(${NAME_MATCH_SHOP_TYPES.join("|")})$`;
    parts.push(`  node["shop"~"${types}"]["name"~"${nn}",i]${around};`);
    parts.push(`  way["shop"~"${types}"]["name"~"${nn}",i]${around};`);
  }

  return `[out:json][timeout:20];\n(\n${parts.join("\n")}\n);\nout center tags;`;
}

// Shop types considered "clothing/fashion" — used to keep name-based matches
// scoped to relevant shops.
const NAME_MATCH_SHOP_TYPES = [
  "clothes", "shoes", "boutique", "fashion", "fashion_accessories", "accessories",
  "second_hand", "charity", "sports", "outdoor", "department_store", "bag",
  "jewelry", "jewellery", "watches", "tailor", "baby_goods",
];

// Public Overpass mirrors, tried in order. The public endpoints are heavily
// rate-limited and occasionally down, so we fail over between them. kumi.systems
// is generally the fastest/most lenient for server-side callers, so it leads.
const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

// Per-request abort. Since mirrors are raced in parallel, overall latency is the
// fastest responder; this just caps how long we'll wait before giving up on all.
const PER_REQUEST_TIMEOUT_MS = 9000;

// Identify the app politely per Overpass etiquette, with a contact URL.
const USER_AGENT = "Pinpoint/1.0 (+https://pinpointapp.uk; local shop finder)";

// Short-lived in-memory cache to spare the public Overpass mirrors from
// repeated identical lookups (e.g. radius re-runs, popular queries in an area).
// Best-effort only: serverless instances don't share memory, so this is a
// per-instance soft cache, not a guarantee.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; shops: Shop[] }>();

function cacheKey(resolved: ResolvedQuery, lat: number, lon: number, radius: number): string {
  // Round coords to ~110m so near-identical fixes share a cache entry.
  const types = [...resolved.shopTypes].sort().join(",");
  const brands = [...resolved.brands].sort().join(",");
  const name = (resolved.nameMatch ?? "").toLowerCase();
  return `t:${types}|b:${brands}|n:${name}|${lat.toFixed(3)}|${lon.toFixed(3)}|${radius}`;
}

// Query all Overpass mirrors in parallel and take the FIRST successful response
// (Promise.any). Public mirrors are individually slow/rate-limited, especially
// for a shared server IP; racing them means one busy mirror can't stall the
// request — overall latency becomes the *fastest* mirror, not the sum. Losing
// requests self-abort at PER_REQUEST_TIMEOUT_MS.
async function runOverpass(ql: string): Promise<OverpassResponse> {
  const body = `data=${encodeURIComponent(ql)}`;
  const attempts = OVERPASS_ENDPOINTS.map(async (endpoint) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json, */*",
        "User-Agent": USER_AGENT,
      },
      body,
      signal: AbortSignal.timeout(PER_REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Overpass ${res.status} @ ${endpoint}`);
    return (await res.json()) as OverpassResponse;
  });

  try {
    return await Promise.any(attempts);
  } catch {
    // AggregateError → every mirror failed/timed out.
    throw new Error("Overpass unavailable");
  }
}

export async function queryNearbyShops(
  resolved: ResolvedQuery,
  lat: number,
  lon: number,
  radius: number
): Promise<Shop[]> {
  // Non-clothing queries are rejected upstream; never hit Overpass for them.
  if (resolved.rejected || (resolved.shopTypes.length === 0 && resolved.brands.length === 0 && !resolved.nameMatch)) {
    return [];
  }

  const key = cacheKey(resolved, lat, lon, radius);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.shops;

  // The resolver decides whether to also match on shop name (for unrecognised
  // queries and retailer searches); item/brand searches rely on type + brand=.
  const ql = buildQuery(resolved.shopTypes, resolved.brands, resolved.nameMatch, lat, lon, radius);

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
    const dedupKey = `${name}|${elLat.toFixed(4)}|${elLon.toFixed(4)}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    shops.push({
      id: `${el.type}-${el.id}`,
      name,
      lat: elLat,
      lon: elLon,
      shopType: tags.shop ?? "shop",
      brand: tags.brand,
      address: buildAddress(tags),
      website: tags.website || tags["contact:website"],
      phone: tags.phone || tags["contact:phone"],
      openingHours: tags.opening_hours,
      distanceKm: haversineKm(lat, lon, elLat, elLon),
      priceRange: estimatePriceRange(tags.shop ?? "shop"),
    });
  }

  // Rank confirmed stockists first: a shop tagged with the searched brand
  // definitely carries it, so it's the most relevant. Everything else falls back
  // to nearest-first. (We still can't confirm live stock for non-branded shops.)
  const wantedBrands = resolved.brands.map((b) => b.toLowerCase());
  const isStockist = (s: Shop) =>
    !!s.brand && wantedBrands.some((b) => s.brand!.toLowerCase().includes(b));

  shops.sort((a, b) => {
    const aS = isStockist(a) ? 0 : 1;
    const bS = isStockist(b) ? 0 : 1;
    if (aS !== bS) return aS - bS;
    return a.distanceKm - b.distanceKm;
  });
  const capped = shops.slice(0, MAX_RESULTS);

  // Bound cache growth: drop the oldest entry once it gets large.
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), shops: capped });

  return capped;
}
