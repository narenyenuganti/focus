import { describe, it, expect } from "vitest";
import { DECORATION_CATALOG, getDecoration, getDecorationsByCategory } from "@/lib/decoration-catalog";

describe("DECORATION_CATALOG", () => {
  it("has 28 items (18 base + 10 zelda)", () => {
    expect(DECORATION_CATALOG).toHaveLength(28);
  });

  it("every item has required fields", () => {
    for (const item of DECORATION_CATALOG) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.category).toMatch(/^(wall|floor|furniture)$/);
      expect(item.tier).toMatch(/^(basic|mid|premium)$/);
      expect(item.cost).toBeGreaterThan(0);
      expect(item.sprite).toBeTruthy();
    }
  });

  it("has no duplicate ids", () => {
    const ids = DECORATION_CATALOG.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getDecoration", () => {
  it("returns decoration by id", () => {
    const item = getDecoration("small-plant");
    expect(item).toBeDefined();
    expect(item!.name).toBe("Small Plant");
  });

  it("returns undefined for unknown id", () => {
    expect(getDecoration("nonexistent")).toBeUndefined();
  });
});

describe("getDecorationsByCategory", () => {
  it("filters by category", () => {
    const wallItems = getDecorationsByCategory("wall");
    expect(wallItems.length).toBeGreaterThan(0);
    expect(wallItems.every((item) => item.category === "wall")).toBe(true);
  });
});
