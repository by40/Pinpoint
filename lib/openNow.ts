import type { Shop } from "@/lib/overpass";

export type OpenState = "open" | "closed" | "unknown";

/**
 * Resolve each shop's open/closed status from its OSM `opening_hours` string.
 *
 * OSM opening_hours syntax is deceptively complex (day ranges, public holidays,
 * "off", "24/7", seasonal rules…), so we lean on the `opening_hours` library
 * rather than hand-rolling. It's loaded with a dynamic import so its weight stays
 * out of the initial search bundle — we only need it once results arrive.
 *
 * Anything we can't confidently evaluate (no hours tag, "unknown" state, or a
 * string the parser rejects) resolves to "unknown" so it's never wrongly hidden
 * or labelled.
 */
export async function computeOpenStates(
  shops: Shop[],
  date: Date = new Date()
): Promise<Record<string, OpenState>> {
  const states: Record<string, OpenState> = {};
  const withHours = shops.filter((s) => s.openingHours);
  if (withHours.length === 0) return states;

  let OH: typeof import("opening_hours").default;
  try {
    OH = (await import("opening_hours")).default;
  } catch {
    // Library failed to load — degrade gracefully, treat everything as unknown.
    return states;
  }

  for (const shop of withHours) {
    try {
      const oh = new OH(shop.openingHours!, null);
      states[shop.id] = oh.getUnknown(date) ? "unknown" : oh.getState(date) ? "open" : "closed";
    } catch {
      states[shop.id] = "unknown";
    }
  }
  return states;
}
