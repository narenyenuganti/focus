import type { ThemeId } from "@/lib/decoration-catalog";

export type FocusActivity = {
  name: string;
  id: string;
};

export type ThemeConfig = {
  id: ThemeId;
  label: string;
  currencyName: string;
  currencyIcon: string;
  focusActivities: FocusActivity[];
};

const BEAN_THEME: ThemeConfig = {
  id: "bean",
  label: "Bean",
  currencyName: "socks",
  currencyIcon: "🧦",
  focusActivities: [
    { name: "Knitting", id: "knitting" },
  ],
};

const ZELDA_THEME: ThemeConfig = {
  id: "zelda",
  label: "Adventure",
  currencyName: "rupees",
  currencyIcon: "💎",
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

export function getCurrentFocusActivity(theme: ThemeConfig): FocusActivity {
  if (theme.focusActivities.length === 1) return theme.focusActivities[0];
  const index = new Date().getHours() % theme.focusActivities.length;
  return theme.focusActivities[index];
}
