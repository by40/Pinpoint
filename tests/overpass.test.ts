import { describe, it, expect } from "vitest";
import { formatDistance } from "@/lib/overpass";

describe("formatDistance", () => {
  it("shows yards under 0.1 miles", () => {
    // 0.05 km ≈ 0.0311 mi ≈ 55 yd
    expect(formatDistance(0.05)).toBe("55 yd");
    expect(formatDistance(0)).toBe("0 yd");
  });

  it("shows miles to one decimal at/above 0.1 miles", () => {
    expect(formatDistance(1.60934)).toBe("1.0 mi"); // exactly 1 mile
    expect(formatDistance(8.04672)).toBe("5.0 mi"); // 5 miles
  });

  it("crosses the yards→miles boundary at 0.1 mi", () => {
    expect(formatDistance(0.16)).toMatch(/ yd$/); // ~0.099 mi → still yards
    expect(formatDistance(0.17)).toMatch(/ mi$/); // ~0.106 mi → miles
  });
});
