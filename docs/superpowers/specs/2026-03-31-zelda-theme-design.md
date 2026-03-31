# Switchable Theme System — Bean + Zelda Theme

**Date:** 2026-03-31
**Status:** Approved
**Goal:** Add a theme setting that lets the user switch between the original Bean theme and a new Zelda-inspired fantasy adventure theme. Default is Bean. Persisted in settings.

---

## 1. Settings Addition

New field in settings schema:
- `theme`: `"bean" | "zelda"`, default `"bean"`
- Added to `settingsSchema` and `settingsPatchSchema`
- Switchable in the Settings tab via a dropdown labeled "Theme"
- Changing saves immediately via existing settings save flow

---

## 2. Theme Interface

Each theme provides:

```ts
type ThemeConfig = {
  id: "bean" | "zelda";
  label: string;
  currencyName: string;       // "socks" or "rupees"
  currencyIcon: string;       // "🧦" or "💎"
  extraDecorations: Decoration[];  // theme-specific items added to base 18
  roomVariants: RoomVariant[];     // 1+ room background configs
  focusActivities: FocusActivity[]; // 1+ focus animations
  emotionalStates: EmotionalStateSet; // idle/focusing/celebrating/sad with variants
};
```

---

## 3. Bean Theme (default, unchanged)

- Character: Brown oval Bean with CSS/SVG eyes, tracking cursor
- 1 room variant: warm wall (#FDF6E3) + floor (#F5ECD7)
- 1 focus activity: knitting (back turned, needles + yarn)
- 4 emotional states, 1 variant each (idle, focusing, celebrating, sad)
- Currency: "socks" 🧦
- Extra decorations: none (base 18 only)

---

## 4. Zelda Theme

### Character: Chibi Adventurer
Original SVG — small hero (~80x90px area) with:
- Green pointed cap
- Green tunic body
- Simple face with same eye-tracking behavior as Bean
- Click-to-react with wiggle + silly face + chirp (same system)

### 8 Emotional States (2 variants per state, random pick)

| State | Variant A | Variant B |
|-------|-----------|-----------|
| Idle | Standing ready, sword at side | Looking around alertly |
| Focusing | Back turned, doing activity | Intense concentration with glow |
| Celebrating | Sword raised + rupee floats | Victory pose with sparkles |
| Sad | Defeated slump, sword drops | Sits on ground, head down |

On each state transition, randomly pick variant A or B.

### 4 Focus Activities (rotated by `new Date().getHours() % 4`)

| Index | Activity | Animation |
|-------|----------|-----------|
| 0 | Reading spellbook | Pages turning loop |
| 1 | Forging at anvil | Hammering loop |
| 2 | Meditating | Glowing triangle floats above, gentle pulse |
| 3 | Sword training | Practice swing loop |

### 3 Room Variants (rotated alongside activities, `hours % 3`)

| Index | Room | Wall Color | Floor Color |
|-------|------|-----------|-------------|
| 0 | Cozy Cottage | #D4A574 (wood) | #8B7355 (stone) |
| 1 | Forest Clearing | #7CB342 (green) | #5D8233 (grass) |
| 2 | Dungeon Workshop | #6B6B6B (stone) | #4A4A4A (dark stone) |

### Currency
- Name: "rupees"
- Icon: "💎" (or inline SVG green diamond)
- Same earning rate (1 per full minute, floor)
- Same wallet data — display label changes, number is the same

### Extra Decorations (+10 fantasy items)

| ID | Name | Category | Tier | Cost | Emoji | Slot |
|----|------|----------|------|------|-------|------|
| heros-shield | Hero's Shield | wall | basic | 75 | 🛡️ | wall |
| potion-bottle | Potion Bottle | furniture | basic | 85 | 🧪 | floor |
| treasure-chest | Treasure Chest | floor | mid | 200 | 📦 | floor |
| magic-crystal | Magic Crystal | furniture | mid | 250 | 🔮 | floor |
| wall-torch | Wall Torch | wall | mid | 180 | 🔥 | wall |
| ancient-map | Ancient Map | wall | premium | 500 | 🗺️ | wall |
| master-sword-display | Sword Display | wall | premium | 650 | ⚔️ | wall |
| fairy-bottle | Fairy in a Bottle | furniture | premium | 550 | 🧚 | floor |
| dragon-egg | Dragon Egg | floor | premium | 600 | 🥚 | floor |
| enchanted-bookshelf | Enchanted Bookshelf | furniture | mid | 280 | 📖 | floor |

---

## 5. Architecture

### New files
- `lib/themes.ts` — theme registry: exports `THEMES` map, `getTheme(id)`, `ThemeConfig` type
- `components/zelda-hero.tsx` — Zelda adventurer SVG character with states + eye tracking
- `components/zelda-hero.module.css` — animations for the adventurer

### Modified files
- `lib/server/schema.ts` — add `theme` field to settings
- `lib/decoration-catalog.ts` — add `themeId` optional field to `Decoration`, add 10 zelda items
- `components/bean.tsx` — no changes (stays as-is)
- `components/room-view.tsx` — accept room colors from theme config instead of hardcoded vars
- `components/tracker-shell.tsx` — read theme from settings, pass to components
- `components/focus-timer.tsx` — pass theme to RoomView, use theme's character component
- `components/shop-panel.tsx` — filter decorations by theme (base + current theme's extras)
- `components/settings-panel.tsx` — add Theme dropdown
- Top bar + shop: show theme's `currencyIcon` + `currencyName` instead of hardcoded 🧦/socks

### Shared across themes (no changes needed)
- Color scheme (warm cozy light CSS variables)
- Timer logic, presets, break timer, lo-fi music, completion sounds
- Economy data (wallet.json, inventory.json, room.json)
- All API routes
- Bottom nav, stats, sync
- Layout structure

---

## 6. Data Model

The wallet stores a raw number. "socks" vs "rupees" is purely a display concern driven by the active theme. No data migration needed when switching themes.

Decorations: each decoration gets an optional `themeId?: "bean" | "zelda"` field. Items without a `themeId` are universal (base 18). Items with `themeId: "zelda"` only show in the shop when zelda theme is active. Purchased zelda items remain in inventory if you switch back to bean — they just won't show in the shop or room editor until you switch back.
