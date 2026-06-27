import { describe, it, expect } from "vitest";
import { FEATURED_BRANDS, getBrand } from "@/lib/brands";
import { CITIES, getCity } from "@/lib/cities";
import { GUIDES, getGuide } from "@/lib/guides";

describe("content data integrity", () => {
  it("brand lookup works and slugs are unique", () => {
    expect(getBrand("nike")).toBeDefined();
    expect(getBrand("does-not-exist")).toBeUndefined();
    const slugs = FEATURED_BRANDS.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("city lookup works and slugs are unique", () => {
    expect(getCity("london")).toBeDefined();
    expect(getCity("atlantis")).toBeUndefined();
    const slugs = CITIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("guide lookup works and slugs are unique", () => {
    expect(GUIDES.length).toBeGreaterThan(0);
    expect(getGuide(GUIDES[0].slug)).toBeDefined();
    expect(getGuide("not-a-guide")).toBeUndefined();
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every brand/city has the fields the routes rely on", () => {
    for (const b of FEATURED_BRANDS) {
      expect(b.slug, JSON.stringify(b)).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(b.query).toBeTruthy();
    }
    for (const c of CITIES) {
      expect(c.slug).toBeTruthy();
      expect(typeof c.lat).toBe("number");
      expect(typeof c.lon).toBe("number");
    }
  });
});
