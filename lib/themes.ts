import type { ThemeId } from "@/lib/decoration-catalog";

export type RoomVariant = {
  name: string;
  wallColor: string;
  floorColor: string;
};

export type FocusActivity = {
  name: string;
  id: string;
};

export type ThemeConfig = {
  id: ThemeId;
  label: string;
  currencyName: string;
  currencyIcon: string;
  roomVariants: RoomVariant[];
  focusActivities: FocusActivity[];
};

const BEAN_THEME: ThemeConfig = {
  id: "bean",
  label: "Bean",
  currencyName: "socks",
  currencyIcon: "🧦",
  roomVariants: [
    { name: "Bean's Room", wallColor: "var(--wall)", floorColor: "var(--floor)" },
  ],
  focusActivities: [
    { name: "Knitting", id: "knitting" },
  ],
};

const ZELDA_THEME: ThemeConfig = {
  id: "zelda",
  label: "Adventure",
  currencyName: "rupees",
  currencyIcon: "💎",
  roomVariants: [
    { name: "Cozy Cottage", wallColor: "#D4A574", floorColor: "#8B7355" },
    { name: "Forest Clearing", wallColor: "#7CB342", floorColor: "#5D8233" },
    { name: "Dungeon Workshop", wallColor: "#6B6B6B", floorColor: "#4A4A4A" },
  ],
  focusActivities: [
    { name: "Reading Spellbook", id: "spellbook" },
    { name: "Forging at Anvil", id: "forging" },
    { name: "Meditating", id: "meditating" },
    { name: "Sword Training", id: "training" },
  ],
};

const THEMES: Record<ThemeId, ThemeConfig> = {
  bean: BEAN_THEME,
  zelda: ZELDA_THEME,
};

export function getTheme(id: ThemeId): ThemeConfig {
  return THEMES[id] ?? BEAN_THEME;
}

export function getCurrentRoomVariant(theme: ThemeConfig): RoomVariant {
  if (theme.roomVariants.length === 1) return theme.roomVariants[0];
  const index = new Date().getHours() % theme.roomVariants.length;
  return theme.roomVariants[index];
}

export function getCurrentFocusActivity(theme: ThemeConfig): FocusActivity {
  if (theme.focusActivities.length === 1) return theme.focusActivities[0];
  const index = new Date().getHours() % theme.focusActivities.length;
  return theme.focusActivities[index];
}
