import { describe, it, expect } from "vitest";
import { computeOpenStates } from "@/lib/openNow";
import type { Shop } from "@/lib/overpass";

// computeOpenStates only reads `id` and `openingHours`, so minimal stubs suffice.
function shop(id: string, openingHours?: string): Shop {
  return { id, openingHours } as unknown as Shop;
}

describe("computeOpenStates", () => {
  it("classifies always-open, always-closed, missing and malformed hours", async () => {
    const states = await computeOpenStates([
      shop("always", "24/7"),
      shop("closed", "Mo-Su off"),
      shop("none"), // no opening_hours tag
      shop("broken", "garbage(("),
    ]);

    expect(states["always"]).toBe("open");
    expect(states["closed"]).toBe("closed");
    expect(states["none"]).toBeUndefined(); // not evaluated → treated as unknown by UI
    expect(states["broken"]).toBe("unknown");
  });

  it("returns an empty map when no shop has hours", async () => {
    const states = await computeOpenStates([shop("a"), shop("b")]);
    expect(states).toEqual({});
  });
});
