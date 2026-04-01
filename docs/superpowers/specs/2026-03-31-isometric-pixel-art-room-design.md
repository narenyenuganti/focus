# Isometric Pixel Art Room Overhaul

## Summary

Replace the current flat 2D DOM/CSS room with an isometric (3/4 view) pixel art room rendered in SVG. Redesign both characters (Bean and Zelda Hero) as pixel art sprites. Replace all emoji decorations with pixel art SVGs. Add an unlockable room variant system where earning currency unlocks distinct themed rooms.

## Visual Style

- **Cozy pixel art** aesthetic inspired by Stardew Valley
- **Isometric 3/4 view** — back wall, side wall, and floor plane receding into depth
- **SVG-based rendering** with `image-rendering: pixelated` and `shape-rendering: crispEdges` for crisp pixel edges at any scale
- Stays DOM-native (no canvas, no WebGL, no game engine)
- Warm color palette carried forward from current `globals.css` variables

## Characters

### Shared Specs
- **Size:** 32-48px tall at base render size
- **Rendering:** Inline SVG with pixel-aligned shapes (rects, polygons)
- **Features:** Eye highlights (white 2px squares), rosy cheeks (semi-transparent warm rects), expressive mouth
- **Interactivity preserved:**
  - Mouse-tracking eyes (existing `TrackingEyes` component adapted for pixel art)
  - Click reactions (tapped state with wiggle, chirp sound)
  - State machine: `idle | focusing | celebrating | sad`
- **Animations:** CSS keyframes, same approach as current but with pixel-appropriate movements (2px step translations instead of smooth transforms where it enhances the pixel feel)

### Bean Character
- Rounded golden body (bean shape via rounded rect)
- Pixel art knitting needles + yarn during focus state
- Idle: subtle 2px bob
- Celebrating: bounce with floating pixel sparkles
- Sad: slump with dropped needles

### Zelda Hero Character
- Green pixel cap, tan head, green tunic, brown belt with gold buckle, brown boots
- Activity emoji overlay during focusing (retained from current design)
- Idle: sway variant + lookAround variant (random selection)
- Celebrating: victory jump with pixel sword raise
- Sad: sit down with shield lowered

## Room Rendering

### Isometric Structure
- **Back wall:** Full-width polygon, wood plank texture (horizontal lines at intervals)
- **Side wall (right):** Angled polygon connecting back wall to floor, slightly darker shade for depth
- **Floor plane:** Polygon receding from wall base to bottom of viewport, wood board texture (horizontal + converging vertical lines)
- **Baseboard/trim:** Darker strip at wall-floor junction
- **Shadow gradient:** Subtle darkening at wall base for grounding

### Room Container
- Max-width 480px (matches current `room-view.tsx`)
- Min-height 320px
- SVG viewBox sized to contain isometric geometry
- Character positioned on floor plane, centered
- Decoration slots repositioned for isometric grid (see Decorations section)

### Rendering Approach
The room is a single SVG element containing:
1. Room geometry (walls, floor) as polygons
2. Room-specific features (window, fireplace, etc.) as grouped SVG elements
3. Decoration slots as positioned groups
4. Character component rendered as an SVG group (`<g>`) inside the room SVG, positioned on the floor plane via `transform`

## Decorations

### Approach
All 26 existing emoji decorations replaced with pixel art SVG components. Each decoration is a self-contained SVG group (`<g>`) that can be placed at a slot position.

### Categories (unchanged)
- **Wall:** Shields, torches, paintings, maps, windows, clocks, banners, mirrors
- **Floor:** Plants, rugs, chests, eggs, crystals
- **Furniture:** Chairs, lamps, desks, bookshelves, beds, tables

### Tiers (unchanged pricing)
- **Basic:** 50-100 currency
- **Mid:** 150-300 currency
- **Premium:** 400-700 currency

### Slot System
8 decoration slots adapted for isometric perspective:
- 4 wall slots: positioned on back wall surface at varying heights and horizontal positions
- 4 floor slots: positioned on floor plane, distributed across the visible floor area
- Decorations rendered with appropriate z-index based on their floor position (further back = lower z-index)

### Catalog Structure
`decoration-catalog.ts` changes from:
```ts
{ id: "small-plant", emoji: "🌱", name: "Small Plant", ... }
```
to:
```ts
{ id: "small-plant", sprite: "small-plant", name: "Small Plant", ... }
```
Each `sprite` key maps to a pixel art SVG component in a new `sprites/` directory or a sprite registry.

## Room Variant System

### Unlockable Rooms
Currency earned from focus sessions unlocks new room themes. Each room is a distinct isometric layout with unique visual features.

| Room | Cost | Description |
|------|------|-------------|
| **Basic Room** | Free (default) | Simple wood plank walls, plain wood floor, single window |
| **Cozy Cottage** | 500 | Warm wood with fireplace on side wall, curtained window, patterned floor |
| **Forest Clearing** | 800 | Open sky replacing back wall, grass floor, tree stumps, mushrooms |
| **Dungeon Workshop** | 1200 | Stone brick walls, dark slate floor, chain details, multiple torch sconces |

### Implementation
- New `room-catalog.ts` alongside `decoration-catalog.ts`
- Each room variant defines: wall polygons + colors, floor polygons + colors, built-in features (SVG groups), slot positions
- Room selection UI added to shop (new tab or section)
- Unlocked rooms stored in user state alongside decoration inventory
- Theme (Bean vs Zelda) is independent of room variant — any character works in any room

### Room Variant Structure
```ts
interface RoomVariant {
  id: string;
  name: string;
  cost: number;
  description: string;
  wallColor: string;
  wallDarkColor: string;
  floorColor: string;
  floorDarkColor: string;
  features: RoomFeature[]; // built-in SVG elements (fireplace, chains, etc.)
  slotPositions: { wall: Position[]; floor: Position[] };
}
```

## Files Changed

### Modified
- **`components/room-view.tsx`** — Rewritten to render isometric SVG room. Accepts room variant ID, loads variant config, renders walls/floor/features/slots as SVG. Character positioned on floor plane.
- **`components/bean.tsx`** — Rewritten with pixel art SVG sprite. Same state machine and interactivity, new visual rendering.
- **`components/bean.module.css`** — Updated animations for pixel art (step-based translations where appropriate).
- **`components/zelda-hero.tsx`** — Rewritten with pixel art SVG sprite. Same state machine, new rendering.
- **`components/zelda-hero.module.css`** — Updated animations.
- **`components/room-editor.tsx`** — Slot buttons updated for isometric positions. Decoration previews show pixel art instead of emoji.
- **`components/shop-panel.tsx`** — Add room variant section. Decoration previews show pixel art.
- **`components/focus-timer.tsx`** — Pass room variant ID to RoomView. Minor integration changes.
- **`lib/decoration-catalog.ts`** — Emoji strings replaced with sprite keys. Same structure otherwise.
- **`lib/themes.ts`** — Room variants decoupled from themes. Theme now only determines character + currency. Room variant is a separate user choice.

### New
- **`components/sprites/`** — Directory containing pixel art SVG components for all decorations and room features.
- **`lib/room-catalog.ts`** — Room variant definitions (geometry, colors, features, slot positions, costs).
- **`components/sprites/decorations/`** — One component per decoration (e.g., `small-plant.tsx`, `wall-torch.tsx`).
- **`components/sprites/room-features/`** — Shared room feature components (fireplace, window, chains, etc.).

## What's NOT Changing
- Focus timer logic, session tracking, currency earning
- Audio system (lo-fi synthesizer, sound effects)
- Overall app layout, routing, dashboard
- SQLite data layer
- Shop economy (tier pricing, purchase flow)
- Room editor UX flow (tap slot → pick decoration)

## Testing Considerations
- Visual regression: compare room renders across room variants and both characters
- State transitions: verify all character states (idle/focusing/celebrating/sad) render correctly in pixel art
- Decoration placement: verify all 8 slots work in isometric layout across all room variants
- Room unlocking: verify purchase flow, state persistence, room switching
- Responsive: room SVG should scale cleanly at different viewport widths
- Animation performance: CSS keyframe animations should remain smooth
