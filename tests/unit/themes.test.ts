import { describe, it, expect } from "vitest";
import { getTheme, getCurrentRoomVariant, getCurrentFocusActivity } from "@/lib/themes";
import { getDecorationsForTheme, DECORATION_CATALOG } from "@/lib/decoration-catalog";

describe("getTheme", () => {
  it("returns bean theme by default", () => {
    const theme = getTheme("bean");
    expect(theme.id).toBe("bean");
    expect(theme.currencyName).toBe("socks");
    expect(theme.currencyIcon).toBe("🧦");
  });

  it("returns zelda theme", () => {
    const theme = getTheme("zelda");
    expect(theme.id).toBe("zelda");
    expect(theme.currencyName).toBe("rupees");
    expect(theme.currencyIcon).toBe("💎");
  });

  it("zelda has 3 room variants", () => {
    const theme = getTheme("zelda");
    expect(theme.roomVariants).toHaveLength(3);
  });

  it("zelda has 4 focus activities", () => {
    const theme = getTheme("zelda");
    expect(theme.focusActivities).toHaveLength(4);
  });

  it("bean has 1 room variant and 1 focus activity", () => {
    const theme = getTheme("bean");
    expect(theme.roomVariants).toHaveLength(1);
    expect(theme.focusActivities).toHaveLength(1);
  });
});

describe("getCurrentRoomVariant", () => {
  it("returns the only variant for bean", () => {
    const theme = getTheme("bean");
    const room = getCurrentRoomVariant(theme);
    expect(room.name).toBe("Bean's Room");
  });

  it("returns a variant for zelda", () => {
    const theme = getTheme("zelda");
    const room = getCurrentRoomVariant(theme);
    expect(theme.roomVariants).toContainEqual(room);
  });
});

describe("getCurrentFocusActivity", () => {
  it("returns knitting for bean", () => {
    const theme = getTheme("bean");
    const activity = getCurrentFocusActivity(theme);
    expect(activity.id).toBe("knitting");
  });

  it("returns an activity for zelda", () => {
    const theme = getTheme("zelda");
    const activity = getCurrentFocusActivity(theme);
    expect(theme.focusActivities).toContainEqual(activity);
  });
});

describe("getDecorationsForTheme", () => {
  it("bean theme gets base 18 items only", () => {
    const items = getDecorationsForTheme("bean");
    expect(items).toHaveLength(18);
    expect(items.every((i) => !i.themeId || i.themeId === "bean")).toBe(true);
  });

  it("zelda theme gets base 18 + 10 zelda items", () => {
    const items = getDecorationsForTheme("zelda");
    expect(items).toHaveLength(28);
  });

  it("total catalog has 28 items", () => {
    expect(DECORATION_CATALOG).toHaveLength(28);
  });
});
