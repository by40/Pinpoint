import { describe, it, expect } from "vitest";
import { resolveQuery, resolveShopQuery } from "@/lib/categories";

describe("resolveQuery", () => {
  it("rejects clearly non-clothing searches", () => {
    for (const q of ["poster", "laptop", "pizza", "iphone"]) {
      const r = resolveQuery(q);
      expect(r.rejected, `"${q}" should be rejected`).toBe(true);
      expect(r.matched).toBe(false);
    }
  });

  it("name-matches an unknown but plausibly-clothing word (not rejected)", () => {
    const r = resolveQuery("zylospun");
    expect(r.rejected).toBeFalsy();
    expect(r.matched).toBe(false);
    expect(r.nameMatch).toBe("zylospun");
  });

  it("matches a product brand to broad shop types", () => {
    const r = resolveQuery("nike");
    expect(r.matched).toBe(true);
    expect(r.brands.length).toBeGreaterThan(0);
    expect(r.shopTypes.length).toBeGreaterThan(0);
  });

  it("narrows shop types when an item is named with a brand", () => {
    const broad = resolveQuery("nike");
    const narrowed = resolveQuery("nike trainers");
    expect(narrowed.matched).toBe(true);
    expect(narrowed.brands.length).toBeGreaterThan(0);
    expect(narrowed.shopTypes.length).toBeGreaterThan(0);
    // The item ("trainers") constrains types, so it shouldn't be the brand's
    // full broad category list.
    expect(narrowed.shopTypes).not.toEqual(broad.shopTypes);
  });

  it("treats a retailer/own-store chain as a store to find (no broad shop types)", () => {
    const r = resolveQuery("jd sports");
    expect(r.matched).toBe(true);
    expect(r.shopTypes).toEqual([]);
    expect(r.nameMatch).toBeTruthy();
  });

  it("always returns the documented ResolvedQuery shape", () => {
    const r = resolveQuery("levis");
    expect(r).toHaveProperty("shopTypes");
    expect(r).toHaveProperty("brands");
    expect(r).toHaveProperty("matched");
    expect(r).toHaveProperty("nameMatch");
    expect(Array.isArray(r.shopTypes)).toBe(true);
    expect(Array.isArray(r.brands)).toBe(true);
  });
});

describe("resolveShopQuery (Shops mode)", () => {
  it("searches by name only — no broad shop-type expansion", () => {
    const r = resolveShopQuery("the cool shop");
    expect(r.shopTypes).toEqual([]); // key: no stockist expansion
    expect(r.nameMatch).toBe("the cool shop");
    expect(r.matched).toBe(true);
  });

  it("includes the recognised brand so official stores match by brand= too", () => {
    const r = resolveShopQuery("nike");
    expect(r.shopTypes).toEqual([]);
    expect(r.nameMatch).toBe("nike");
    expect(r.brands).toContain("Nike");
  });

  it("never rejects — an unmatched/non-clothing name just returns a name search", () => {
    const r = resolveShopQuery("tesco");
    expect(r.rejected).toBeFalsy();
    expect(r.matched).toBe(true);
    expect(r.nameMatch).toBe("tesco");
    expect(r.shopTypes).toEqual([]);
  });

  it("trims the name", () => {
    expect(resolveShopQuery("  zara  ").nameMatch).toBe("zara");
  });
});
