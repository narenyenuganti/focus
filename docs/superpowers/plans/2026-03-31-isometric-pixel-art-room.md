# Isometric Pixel Art Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat 2D DOM/CSS room with an isometric pixel art room, redesign both characters as pixel art sprites, replace emoji decorations with pixel art SVGs, and add unlockable room variants.

**Architecture:** The room becomes a single SVG rendered by `room-view.tsx`. Characters are SVG groups positioned inside the room SVG. Decorations are SVG components looked up from a sprite registry. Room variants are defined in a new `room-catalog.ts` and unlocked via the existing economy system.

**Tech Stack:** React 19, Next.js 15, SVG (inline JSX), CSS Modules, Vitest + React Testing Library

---

## File Structure

### New Files
- `lib/room-catalog.ts` — Room variant definitions (geometry, colors, features, costs, slot positions)
- `components/sprites/decorations.tsx` — All 28 decoration sprites as named SVG components + registry lookup
- `components/sprites/room-features.tsx` — Shared room feature SVG components (fireplace, window, chains, trees)
- `tests/unit/room-catalog.test.ts` — Tests for room catalog

### Modified Files
- `lib/decoration-catalog.ts` — Replace `emoji` field with `sprite` key string
- `lib/themes.ts` — Decouple room variants from themes; theme only defines character + currency
- `lib/economy-types.ts` — Add `unlockedRooms` to schema
- `components/room-view.tsx` — Rewrite to render isometric SVG room
- `components/bean.tsx` — Rewrite with pixel art SVG sprite
- `components/bean.module.css` — Update animations for pixel art
- `components/zelda-hero.tsx` — Rewrite with pixel art SVG sprite
- `components/zelda-hero.module.css` — Update animations for pixel art
- `components/room-editor.tsx` — Update to use sprite previews and isometric slot layout
- `components/shop-panel.tsx` — Add room variant section, use sprite previews
- `components/focus-timer.tsx` — Pass selected room variant ID to RoomView
- `tests/unit/decoration-catalog.test.ts` — Update: `emoji` → `sprite` field checks
- `tests/unit/themes.test.ts` — Update: room variants no longer on theme
- `tests/unit/bean.test.tsx` — Update for new pixel art rendering
- `tests/unit/zelda-hero.test.tsx` — Update for new pixel art rendering
- `tests/unit/room-editor.test.tsx` — Update for sprite-based previews
- `tests/unit/shop-panel.test.tsx` — Update for room variant section

---

### Task 1: Room Catalog — Data Layer

**Files:**
- Create: `lib/room-catalog.ts`
- Create: `tests/unit/room-catalog.test.ts`

- [ ] **Step 1: Write the failing test for room catalog**

```ts
// tests/unit/room-catalog.test.ts
import { describe, it, expect } from "vitest";
import {
  ROOM_CATALOG,
  getRoomVariant,
  getUnlockableRooms,
} from "@/lib/room-catalog";

describe("ROOM_CATALOG", () => {
  it("has 4 room variants", () => {
    expect(ROOM_CATALOG).toHaveLength(4);
  });

  it("every room has required fields", () => {
    for (const room of ROOM_CATALOG) {
      expect(room.id).toBeTruthy();
      expect(room.name).toBeTruthy();
      expect(typeof room.cost).toBe("number");
      expect(room.cost).toBeGreaterThanOrEqual(0);
      expect(room.wallColor).toBeTruthy();
      expect(room.wallDarkColor).toBeTruthy();
      expect(room.floorColor).toBeTruthy();
      expect(room.floorDarkColor).toBeTruthy();
      expect(room.wallSlots).toHaveLength(4);
      expect(room.floorSlots).toHaveLength(4);
    }
  });

  it("has no duplicate ids", () => {
    const ids = ROOM_CATALOG.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has exactly one free room", () => {
    const freeRooms = ROOM_CATALOG.filter((r) => r.cost === 0);
    expect(freeRooms).toHaveLength(1);
    expect(freeRooms[0].id).toBe("basic");
  });
});

describe("getRoomVariant", () => {
  it("returns room by id", () => {
    const room = getRoomVariant("basic");
    expect(room).toBeDefined();
    expect(room!.name).toBe("Basic Room");
  });

  it("returns undefined for unknown id", () => {
    expect(getRoomVariant("nonexistent")).toBeUndefined();
  });
});

describe("getUnlockableRooms", () => {
  it("returns rooms sorted by cost ascending", () => {
    const rooms = getUnlockableRooms();
    for (let i = 1; i < rooms.length; i++) {
      expect(rooms[i].cost).toBeGreaterThanOrEqual(rooms[i - 1].cost);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/room-catalog.test.ts`
Expected: FAIL — module `@/lib/room-catalog` not found

- [ ] **Step 3: Write the room catalog implementation**

```ts
// lib/room-catalog.ts
export type SlotPosition = {
  x: number;
  y: number;
};

export type RoomFeatureId =
  | "window"
  | "fireplace"
  | "chains"
  | "torch-sconce"
  | "trees"
  | "mushrooms"
  | "curtained-window";

export type RoomVariantDef = {
  id: string;
  name: string;
  cost: number;
  description: string;
  wallColor: string;
  wallDarkColor: string;
  floorColor: string;
  floorDarkColor: string;
  baseboardColor: string;
  features: RoomFeatureId[];
  wallSlots: SlotPosition[];
  floorSlots: SlotPosition[];
};

export const ROOM_CATALOG: RoomVariantDef[] = [
  {
    id: "basic",
    name: "Basic Room",
    cost: 0,
    description: "Simple wood plank walls and plain floor.",
    wallColor: "#5c4a3a",
    wallDarkColor: "#4a3a2e",
    floorColor: "#B8960B",
    floorDarkColor: "#A07808",
    baseboardColor: "#3d2e1f",
    features: ["window"],
    wallSlots: [
      { x: 50, y: 85 },
      { x: 180, y: 85 },
      { x: 50, y: 120 },
      { x: 180, y: 120 },
    ],
    floorSlots: [
      { x: 40, y: 195 },
      { x: 200, y: 195 },
      { x: 60, y: 225 },
      { x: 180, y: 225 },
    ],
  },
  {
    id: "cozy-cottage",
    name: "Cozy Cottage",
    cost: 500,
    description: "Warm wood with fireplace and curtained window.",
    wallColor: "#6b5540",
    wallDarkColor: "#5a4530",
    floorColor: "#C4860B",
    floorDarkColor: "#A87008",
    baseboardColor: "#4a3520",
    features: ["curtained-window", "fireplace"],
    wallSlots: [
      { x: 50, y: 85 },
      { x: 180, y: 85 },
      { x: 50, y: 120 },
      { x: 180, y: 120 },
    ],
    floorSlots: [
      { x: 40, y: 195 },
      { x: 200, y: 195 },
      { x: 60, y: 225 },
      { x: 180, y: 225 },
    ],
  },
  {
    id: "forest-clearing",
    name: "Forest Clearing",
    cost: 800,
    description: "Open sky, grass floor, tree stumps and mushrooms.",
    wallColor: "#7CB342",
    wallDarkColor: "#5D8233",
    floorColor: "#5a8a30",
    floorDarkColor: "#4a7525",
    baseboardColor: "#3d5a1f",
    features: ["trees", "mushrooms"],
    wallSlots: [
      { x: 50, y: 85 },
      { x: 180, y: 85 },
      { x: 50, y: 120 },
      { x: 180, y: 120 },
    ],
    floorSlots: [
      { x: 40, y: 195 },
      { x: 200, y: 195 },
      { x: 60, y: 225 },
      { x: 180, y: 225 },
    ],
  },
  {
    id: "dungeon-workshop",
    name: "Dungeon Workshop",
    cost: 1200,
    description: "Stone brick walls, dark floor, chains and torches.",
    wallColor: "#6B6B6B",
    wallDarkColor: "#555555",
    floorColor: "#4A4A4A",
    floorDarkColor: "#3a3a3a",
    baseboardColor: "#333333",
    features: ["chains", "torch-sconce"],
    wallSlots: [
      { x: 50, y: 85 },
      { x: 180, y: 85 },
      { x: 50, y: 120 },
      { x: 180, y: 120 },
    ],
    floorSlots: [
      { x: 40, y: 195 },
      { x: 200, y: 195 },
      { x: 60, y: 225 },
      { x: 180, y: 225 },
    ],
  },
];

export function getRoomVariant(id: string): RoomVariantDef | undefined {
  return ROOM_CATALOG.find((r) => r.id === id);
}

export function getUnlockableRooms(): RoomVariantDef[] {
  return [...ROOM_CATALOG].sort((a, b) => a.cost - b.cost);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/room-catalog.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/room-catalog.ts tests/unit/room-catalog.test.ts
git commit -m "feat: add room catalog with unlockable variant definitions"
```

---

### Task 2: Decoration Catalog — Replace Emoji with Sprite Keys

**Files:**
- Modify: `lib/decoration-catalog.ts`
- Modify: `tests/unit/decoration-catalog.test.ts`

- [ ] **Step 1: Update the test to expect `sprite` instead of `emoji`**

In `tests/unit/decoration-catalog.test.ts`, change the field check:

```ts
// Replace this line in "every item has required fields" test:
      expect(item.emoji).toBeTruthy();
// With:
      expect(item.sprite).toBeTruthy();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/decoration-catalog.test.ts`
Expected: FAIL — `item.sprite` is undefined

- [ ] **Step 3: Update decoration-catalog.ts — replace `emoji` with `sprite`**

In `lib/decoration-catalog.ts`:

1. In the `Decoration` type, replace `emoji: string` with `sprite: string`.

2. In `DECORATION_CATALOG`, replace every `emoji: "..."` with `sprite: "<id>"` where the sprite key matches the item's `id`. For example:
   - `{ id: "small-plant", ..., emoji: "🌱", ... }` → `{ id: "small-plant", ..., sprite: "small-plant", ... }`
   - `{ id: "basic-rug", ..., emoji: "🟫", ... }` → `{ id: "basic-rug", ..., sprite: "basic-rug", ... }`
   - Apply the same pattern to all 28 items.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/decoration-catalog.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/decoration-catalog.ts tests/unit/decoration-catalog.test.ts
git commit -m "refactor: replace emoji with sprite keys in decoration catalog"
```

---

### Task 3: Decoration Sprites — Pixel Art SVG Components

**Files:**
- Create: `components/sprites/decorations.tsx`

- [ ] **Step 1: Create the decoration sprite registry**

Create `components/sprites/decorations.tsx` with all 28 decoration sprites as SVG groups and a lookup function. Each sprite is a React component that renders an SVG `<g>` element with pixel art shapes.

```tsx
// components/sprites/decorations.tsx
import type { ReactNode } from "react";

type SpriteProps = {
  x?: number;
  y?: number;
};

function SmallPlant({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="4" y="12" width="12" height="10" rx="1" fill="#CD853F" stroke="#8B6914" strokeWidth="1" />
      <rect x="8" y="2" width="4" height="10" fill="#228B22" />
      <rect x="3" y="4" width="6" height="5" rx="2" fill="#32CD32" />
      <rect x="11" y="6" width="5" height="4" rx="2" fill="#2E8B2E" />
    </g>
  );
}

function BasicRug({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="40" height="16" rx="2" fill="#8B2252" stroke="#CD3278" strokeWidth="1" />
      <rect x="6" y="4" width="28" height="8" fill="none" stroke="#FF69B4" strokeWidth="1" />
    </g>
  );
}

function SimplePoster({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="22" height="18" rx="1" fill="#FFF" stroke="#8B7355" strokeWidth="2" />
      <rect x="3" y="3" width="16" height="12" fill="#87CEEB" />
      <circle cx="8" cy="7" r="3" fill="#FFD700" opacity="0.8" />
      <path d="M3,12 L10,7 L16,10 L19,7 L19,15 L3,15Z" fill="#5a9e3e" opacity="0.7" />
    </g>
  );
}

function DeskLamp({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="6" y="14" width="8" height="4" rx="1" fill="#555" />
      <rect x="8" y="6" width="4" height="8" fill="#777" />
      <path d="M4,6 L16,6 L14,0 L6,0 Z" fill="#FFD700" />
      <ellipse cx="10" cy="6" rx="4" ry="1" fill="#FFF8DC" opacity="0.4" />
    </g>
  );
}

function Bookshelf({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="28" height="28" fill="#8B4513" stroke="#5C3010" strokeWidth="1" />
      <rect x="0" y="13" width="28" height="2" fill="#5C3010" />
      <rect x="3" y="2" width="6" height="11" fill="#8B0000" />
      <rect x="10" y="4" width="5" height="9" fill="#228B22" />
      <rect x="16" y="1" width="7" height="12" fill="#4169E1" />
      <rect x="3" y="16" width="8" height="10" fill="#B8860B" />
      <rect x="13" y="18" width="5" height="8" fill="#9932CC" />
      <rect x="20" y="16" width="6" height="10" fill="#DC143C" />
    </g>
  );
}

function TrashCan({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="2" y="4" width="16" height="16" rx="1" fill="#888" stroke="#666" strokeWidth="1" />
      <rect x="0" y="2" width="20" height="3" rx="1" fill="#999" />
      <rect x="7" y="0" width="6" height="3" rx="1" fill="#777" />
    </g>
  );
}

function CozyArmchair({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="8" width="28" height="18" rx="4" fill="#8b5e3c" stroke="#6d4a2e" strokeWidth="1" />
      <rect x="-2" y="2" width="32" height="10" rx="4" fill="#a0704c" />
      <ellipse cx="14" cy="16" rx="10" ry="6" fill="#d4785c" />
      <rect x="2" y="26" width="4" height="6" rx="1" fill="#6d4a2e" />
      <rect x="22" y="26" width="4" height="6" rx="1" fill="#6d4a2e" />
    </g>
  );
}

function WindowCurtains({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="30" height="24" fill="#6ba3be" stroke="#8B7355" strokeWidth="2" />
      <line x1="15" y1="0" x2="15" y2="24" stroke="#8B7355" strokeWidth="1.5" />
      <line x1="0" y1="12" x2="30" y2="12" stroke="#8B7355" strokeWidth="1.5" />
      <path d="M-2,0 Q-6,10 -3,24 L0,24 L0,0Z" fill="#c75050" opacity="0.8" />
      <path d="M32,0 Q36,10 33,24 L30,24 L30,0Z" fill="#c75050" opacity="0.8" />
    </g>
  );
}

function WallClock({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="10" cy="10" r="10" fill="#FFF" stroke="#8B7355" strokeWidth="2" />
      <circle cx="10" cy="10" r="1.5" fill="#333" />
      <line x1="10" y1="10" x2="10" y2="4" stroke="#333" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="15" y2="10" stroke="#333" strokeWidth="1" />
    </g>
  );
}

function PottedTree({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="6" y="20" width="12" height="12" rx="1" fill="#CD853F" stroke="#8B6914" strokeWidth="1" />
      <rect x="10" y="10" width="4" height="10" fill="#8B6914" />
      <circle cx="12" cy="6" r="8" fill="#228B22" />
      <circle cx="7" cy="4" r="5" fill="#32CD32" />
      <circle cx="17" cy="5" r="5" fill="#2E8B2E" />
    </g>
  );
}

function SideTable({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="24" height="4" rx="1" fill="#A0622D" stroke="#5C3010" strokeWidth="1" />
      <rect x="2" y="4" width="4" height="16" fill="#5C3010" />
      <rect x="18" y="4" width="4" height="16" fill="#5C3010" />
    </g>
  );
}

function FloorLamp({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="6" y="28" width="8" height="4" rx="1" fill="#555" />
      <rect x="8" y="8" width="4" height="20" fill="#777" />
      <path d="M2,8 L18,8 L16,0 L4,0 Z" fill="#FFD54F" />
      <ellipse cx="10" cy="8" rx="6" ry="2" fill="#FFF8DC" opacity="0.3" />
    </g>
  );
}

function FancyDesk({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,0 40,0 44,4 4,4" fill="#A0622D" stroke="#5C3010" strokeWidth="1" />
      <rect x="4" y="4" width="40" height="3" fill="#8B4513" stroke="#5C3010" strokeWidth="1" />
      <rect x="6" y="7" width="4" height="16" fill="#5C3010" />
      <rect x="36" y="7" width="4" height="16" fill="#5C3010" />
      <rect x="12" y="-10" width="20" height="10" rx="1" fill="#333" stroke="#555" strokeWidth="1" />
      <rect x="14" y="-8" width="16" height="6" fill="#4a90d9" />
    </g>
  );
}

function LargePainting({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="36" height="28" rx="1" fill="#FFF" stroke="#8B7355" strokeWidth="2.5" />
      <rect x="3" y="3" width="30" height="22" fill="#1a1a3a" />
      <circle cx="12" cy="10" r="5" fill="#FFD700" opacity="0.7" />
      <path d="M3,18 L12,10 L22,16 L33,8 L33,25 L3,25Z" fill="#2E5090" opacity="0.6" />
    </g>
  );
}

function CatBed({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="14" cy="14" rx="14" ry="8" fill="#d4785c" stroke="#b85e42" strokeWidth="1" />
      <ellipse cx="14" cy="12" rx="10" ry="5" fill="#f0c0a0" />
      <circle cx="10" cy="10" r="5" fill="#888" />
      <circle cx="16" cy="9" r="4" fill="#999" />
      <rect x="7" y="6" width="2" height="3" fill="#888" transform="rotate(-15 8 6)" />
      <rect x="14" y="5" width="2" height="3" fill="#999" transform="rotate(15 15 5)" />
    </g>
  );
}

function StringLights({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M0,4 Q8,8 16,4 Q24,0 32,4 Q40,8 48,4" fill="none" stroke="#555" strokeWidth="1" />
      <circle cx="8" cy="6" r="3" fill="#FF6B6B" />
      <circle cx="16" cy="4" r="3" fill="#FFD700" />
      <circle cx="24" cy="2" r="3" fill="#87CEEB" />
      <circle cx="32" cy="4" r="3" fill="#90EE90" />
      <circle cx="40" cy="6" r="3" fill="#DDA0DD" />
    </g>
  );
}

function CoffeeMachine({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="2" y="4" width="20" height="20" rx="2" fill="#333" stroke="#222" strokeWidth="1" />
      <rect x="5" y="7" width="14" height="10" rx="1" fill="#555" />
      <rect x="8" y="20" width="8" height="6" fill="#222" />
      <rect x="6" y="26" width="12" height="2" rx="1" fill="#444" />
      <circle cx="12" cy="12" r="3" fill="#4a90d9" />
      <rect x="0" y="0" width="24" height="4" rx="1" fill="#444" />
    </g>
  );
}

function RecordPlayer({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="32" height="24" rx="2" fill="#8B4513" stroke="#5C3010" strokeWidth="1" />
      <circle cx="14" cy="12" r="8" fill="#1a1a1a" />
      <circle cx="14" cy="12" r="3" fill="#8B0000" />
      <circle cx="14" cy="12" r="1" fill="#FFD700" />
      <rect x="22" y="4" width="8" height="3" rx="1" fill="#A0A0A0" />
    </g>
  );
}

function HerosShield({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M12,0 L24,4 L24,16 L12,24 L0,16 L0,4 Z" fill="#4169E1" stroke="#1a3a8c" strokeWidth="1.5" />
      <path d="M12,4 L20,7 L20,14 L12,20 L4,14 L4,7 Z" fill="#6495ED" />
      <path d="M10,8 L14,8 L14,12 L16,12 L12,18 L8,12 L10,12 Z" fill="#FFD700" />
    </g>
  );
}

function PotionBottle({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="5" y="0" width="6" height="4" rx="1" fill="#999" />
      <rect x="3" y="4" width="10" height="3" fill="#777" />
      <path d="M2,7 L14,7 L12,20 L4,20 Z" fill="#90EE90" stroke="#228B22" strokeWidth="1" />
      <rect x="5" y="14" width="6" height="2" fill="#ADFF2F" opacity="0.5" />
    </g>
  );
}

function WallTorch({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="6" y="8" width="6" height="16" fill="#8B7355" />
      <rect x="4" y="6" width="10" height="3" rx="1" fill="#A08050" />
      <ellipse cx="9" cy="4" rx="5" ry="5" fill="#FF6B35" />
      <ellipse cx="9" cy="2" rx="3" ry="4" fill="#FFD700" />
      <ellipse cx="9" cy="0" rx="2" ry="2" fill="#FFF8DC" opacity="0.7" />
    </g>
  );
}

function TreasureChest({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="8" width="24" height="12" rx="1" fill="#8B4513" stroke="#5C3010" strokeWidth="1" />
      <path d="M0,8 Q12,0 24,8" fill="#A0622D" stroke="#5C3010" strokeWidth="1" />
      <rect x="9" y="6" width="6" height="6" rx="1" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
    </g>
  );
}

function MagicCrystal({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points="10,0 18,8 14,20 6,20 2,8" fill="#9370DB" stroke="#6A0DAD" strokeWidth="1" />
      <polygon points="10,2 16,8 13,18 7,18 4,8" fill="#B8A9E8" opacity="0.5" />
      <rect x="8" y="4" width="2" height="6" fill="#E8E0FF" opacity="0.6" />
    </g>
  );
}

function EnchantedBookshelf({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="28" height="28" fill="#4a3520" stroke="#3a2510" strokeWidth="1" />
      <rect x="0" y="13" width="28" height="2" fill="#3a2510" />
      <rect x="3" y="2" width="6" height="11" fill="#9370DB" />
      <rect x="10" y="4" width="5" height="9" fill="#4169E1" />
      <rect x="16" y="1" width="7" height="12" fill="#DC143C" />
      <rect x="3" y="16" width="8" height="10" fill="#228B22" />
      <rect x="13" y="18" width="5" height="8" fill="#FFD700" />
      <rect x="20" y="16" width="6" height="10" fill="#9932CC" />
      <circle cx="24" cy="4" r="2" fill="#90EE90" opacity="0.6" />
      <circle cx="2" cy="20" r="2" fill="#87CEEB" opacity="0.6" />
    </g>
  );
}

function AncientMap({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="28" height="22" rx="1" fill="#F5DEB3" stroke="#8B7355" strokeWidth="1.5" />
      <path d="M4,8 Q10,4 16,10 Q22,6 24,12" fill="none" stroke="#8B6914" strokeWidth="1" />
      <path d="M6,14 Q12,18 20,12" fill="none" stroke="#8B6914" strokeWidth="1" />
      <circle cx="20" cy="8" r="2" fill="none" stroke="#DC143C" strokeWidth="1" />
      <text x="19" y="10" fontSize="4" fill="#DC143C">X</text>
    </g>
  );
}

function FairyBottle({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="5" y="0" width="6" height="3" rx="1" fill="#A0A0A0" />
      <path d="M3,3 L13,3 L14,6 L12,20 L4,20 L2,6 Z" fill="#ADD8E6" stroke="#87CEEB" strokeWidth="1" opacity="0.8" />
      <circle cx="8" cy="12" r="3" fill="#90EE90" opacity="0.7" />
      <circle cx="8" cy="12" r="1.5" fill="#FFF" opacity="0.8" />
    </g>
  );
}

function DragonEgg({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="10" cy="12" rx="9" ry="12" fill="#8B0000" stroke="#5C0000" strokeWidth="1" />
      <ellipse cx="10" cy="12" rx="6" ry="9" fill="#A52A2A" opacity="0.5" />
      <ellipse cx="7" cy="8" rx="2" ry="3" fill="#CD5C5C" opacity="0.5" />
      <path d="M6,4 L8,0 L10,4 L12,1 L14,4" fill="#FF6347" stroke="#8B0000" strokeWidth="0.5" />
    </g>
  );
}

function SwordDisplay({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="24" height="4" rx="1" fill="#8B7355" />
      <rect x="4" y="4" width="2" height="6" fill="#8B7355" />
      <rect x="18" y="4" width="2" height="6" fill="#8B7355" />
      <rect x="11" y="-2" width="2" height="24" fill="#C0C0C0" />
      <rect x="7" y="10" width="10" height="2" rx="1" fill="#8B7355" />
      <rect x="10" y="22" width="4" height="4" rx="1" fill="#8B4513" />
      <polygon points="11,0 13,0 12,-4" fill="#C0C0C0" />
    </g>
  );
}

const SPRITE_REGISTRY: Record<string, (props: SpriteProps) => ReactNode> = {
  "small-plant": SmallPlant,
  "basic-rug": BasicRug,
  "simple-poster": SimplePoster,
  "desk-lamp": DeskLamp,
  bookshelf: Bookshelf,
  "trash-can": TrashCan,
  "cozy-armchair": CozyArmchair,
  "window-curtains": WindowCurtains,
  "wall-clock": WallClock,
  "potted-tree": PottedTree,
  "side-table": SideTable,
  "floor-lamp": FloorLamp,
  "fancy-desk": FancyDesk,
  "large-painting": LargePainting,
  "cat-bed": CatBed,
  "string-lights": StringLights,
  "coffee-machine": CoffeeMachine,
  "record-player": RecordPlayer,
  "heros-shield": HerosShield,
  "potion-bottle": PotionBottle,
  "wall-torch": WallTorch,
  "treasure-chest": TreasureChest,
  "magic-crystal": MagicCrystal,
  "enchanted-bookshelf": EnchantedBookshelf,
  "ancient-map": AncientMap,
  "fairy-bottle": FairyBottle,
  "dragon-egg": DragonEgg,
  "master-sword-display": SwordDisplay,
};

export function DecorationSprite({ spriteId, x = 0, y = 0 }: { spriteId: string; x?: number; y?: number }) {
  const Sprite = SPRITE_REGISTRY[spriteId];
  if (!Sprite) return null;
  return <>{Sprite({ x, y })}</>;
}

export function getDecorationSpriteIds(): string[] {
  return Object.keys(SPRITE_REGISTRY);
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add components/sprites/decorations.tsx
git commit -m "feat: add pixel art SVG sprites for all 28 decorations"
```

---

### Task 4: Room Feature Sprites

**Files:**
- Create: `components/sprites/room-features.tsx`

- [ ] **Step 1: Create room feature SVG components**

```tsx
// components/sprites/room-features.tsx
type FeatureProps = {
  x?: number;
  y?: number;
};

export function WindowFeature({ x = 100, y = 80 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="50" height="40" fill="#6ba3be" stroke="#8B7355" strokeWidth="3" />
      <line x1="25" y1="0" x2="25" y2="40" stroke="#8B7355" strokeWidth="2" />
      <line x1="0" y1="20" x2="50" y2="20" stroke="#8B7355" strokeWidth="2" />
      <rect x="4" y="4" width="8" height="4" fill="#FFE87C" rx="1" />
      <rect x="30" y="10" width="6" height="3" fill="#FFE87C" rx="1" />
    </g>
  );
}

export function CurtainedWindowFeature({ x = 95, y = 75 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="5" y="5" width="50" height="40" fill="#6ba3be" stroke="#8B7355" strokeWidth="3" />
      <line x1="30" y1="5" x2="30" y2="45" stroke="#8B7355" strokeWidth="2" />
      <line x1="5" y1="25" x2="55" y2="25" stroke="#8B7355" strokeWidth="2" />
      <path d="M3,3 Q-3,22 1,47 L5,47 L5,3Z" fill="#c75050" opacity="0.8" />
      <path d="M57,3 Q63,22 59,47 L55,47 L55,3Z" fill="#c75050" opacity="0.8" />
    </g>
  );
}

export function FireplaceFeature({ x = 232, y = 90 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Fireplace frame on side wall — drawn at an angle */}
      <rect x="0" y="0" width="24" height="50" fill="#8B7355" stroke="#5C3010" strokeWidth="1.5" />
      <rect x="3" y="3" width="18" height="30" fill="#1a1a1a" />
      {/* Fire */}
      <ellipse cx="12" cy="28" rx="6" ry="4" fill="#FF6B35" />
      <ellipse cx="12" cy="26" rx="4" ry="5" fill="#FFD700" />
      <ellipse cx="12" cy="24" rx="2" ry="3" fill="#FFF8DC" opacity="0.7" />
      {/* Mantle */}
      <rect x="-2" y="-2" width="28" height="4" rx="1" fill="#A0622D" />
    </g>
  );
}

export function ChainsFeature({ x = 235, y = 70 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Chain links on side wall */}
      <ellipse cx="5" cy="5" rx="3" ry="4" fill="none" stroke="#999" strokeWidth="1.5" />
      <ellipse cx="5" cy="12" rx="2.5" ry="3.5" fill="none" stroke="#888" strokeWidth="1.5" />
      <ellipse cx="5" cy="19" rx="3" ry="4" fill="none" stroke="#999" strokeWidth="1.5" />
      <ellipse cx="5" cy="26" rx="2.5" ry="3.5" fill="none" stroke="#888" strokeWidth="1.5" />
      {/* Second chain */}
      <ellipse cx="18" cy="8" rx="3" ry="4" fill="none" stroke="#999" strokeWidth="1.5" />
      <ellipse cx="18" cy="15" rx="2.5" ry="3.5" fill="none" stroke="#888" strokeWidth="1.5" />
      <ellipse cx="18" cy="22" rx="3" ry="4" fill="none" stroke="#999" strokeWidth="1.5" />
    </g>
  );
}

export function TorchSconceFeature({ x = 240, y = 120 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="3" y="6" width="5" height="14" fill="#8B7355" />
      <rect x="1" y="4" width="9" height="3" rx="1" fill="#A08050" />
      <ellipse cx="5" cy="2" rx="4" ry="4" fill="#FF6B35" />
      <ellipse cx="5" cy="0" rx="3" ry="3" fill="#FFD700" />
    </g>
  );
}

export function TreesFeature({ x = 20, y = 60 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Back "wall" is open sky — draw tree silhouettes */}
      <rect x="0" y="60" width="8" height="40" fill="#6d4a2e" />
      <circle cx="4" cy="50" r="14" fill="#3d7a2a" />
      <circle cx="4" cy="40" r="10" fill="#4a9e3e" />
      {/* Second tree */}
      <rect x="190" y="65" width="6" height="35" fill="#6d4a2e" />
      <circle cx="193" cy="55" r="12" fill="#3d7a2a" />
      <circle cx="193" cy="46" r="8" fill="#4a9e3e" />
    </g>
  );
}

export function MushroomsFeature({ x = 60, y = 200 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Small mushrooms on the ground */}
      <rect x="0" y="6" width="3" height="6" fill="#F5DEB3" />
      <ellipse cx="1.5" cy="5" rx="5" ry="4" fill="#DC143C" />
      <circle cx="-1" cy="4" r="1" fill="#FFF" />
      <circle cx="3" cy="3" r="1" fill="#FFF" />
      {/* Second mushroom */}
      <rect x="20" y="8" width="2" height="5" fill="#F5DEB3" />
      <ellipse cx="21" cy="7" rx="4" ry="3" fill="#FFD700" />
    </g>
  );
}

import type { RoomFeatureId } from "@/lib/room-catalog";

const FEATURE_REGISTRY: Record<RoomFeatureId, (props: FeatureProps) => JSX.Element> = {
  window: WindowFeature,
  "curtained-window": CurtainedWindowFeature,
  fireplace: FireplaceFeature,
  chains: ChainsFeature,
  "torch-sconce": TorchSconceFeature,
  trees: TreesFeature,
  mushrooms: MushroomsFeature,
};

export function RoomFeature({ featureId, x, y }: { featureId: RoomFeatureId; x?: number; y?: number }) {
  const Feature = FEATURE_REGISTRY[featureId];
  if (!Feature) return null;
  return <Feature x={x} y={y} />;
}
```

- [ ] **Step 2: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add components/sprites/room-features.tsx
git commit -m "feat: add pixel art SVG room feature components"
```

---

### Task 5: Pixel Art Bean Character

**Files:**
- Modify: `components/bean.tsx`
- Modify: `components/bean.module.css`
- Modify: `tests/unit/bean.test.tsx`

- [ ] **Step 1: Update bean test for pixel art rendering**

The test needs to check the new pixel art SVG renders correctly. The key change: celebrating state still shows currency earned, idle state still has the aria-label, but the internal rendering is now SVG-based.

In `tests/unit/bean.test.tsx`, update the focusing test since the text face "– –" will change to an SVG representation:

```ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Bean } from "@/components/bean";

describe("Bean", () => {
  it("renders with idle state by default", () => {
    render(<Bean state="idle" />);
    expect(screen.getByLabelText("Bean character")).toBeInTheDocument();
  });

  it("renders focusing state", () => {
    render(<Bean state="focusing" />);
    const bean = screen.getByLabelText("Bean character");
    expect(bean).toBeInTheDocument();
    expect(bean.className).toContain("focusing");
  });

  it("renders celebrating state with socks earned", () => {
    render(<Bean state="celebrating" socksEarned={25} />);
    expect(screen.getByText("+25 🧦")).toBeInTheDocument();
  });

  it("renders sad state", () => {
    render(<Bean state="sad" />);
    expect(screen.getByLabelText("Bean character")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/bean.test.tsx`
Expected: The focusing test may fail because we changed the assertion from text content to className check.

- [ ] **Step 3: Rewrite bean.tsx as pixel art SVG**

Replace the contents of `components/bean.tsx` with a pixel art SVG character. Keep the same component API (`BeanState`, `BeanProps`, eye tracking, click reactions, chirp sound). The body is now an SVG instead of a CSS div.

Key changes:
- Body is an SVG `<g>` group with pixel art rects instead of a CSS div
- Eyes are pixel-style rects (4x5px) with white 2px highlight squares, still tracking mouse
- Rosy cheeks as semi-transparent rects
- Mouth as a small path or rect
- Knitting needles as SVG rects during focus state
- The overall container div and CSS class approach stays the same for animations

The full rewrite of `bean.tsx` should:
- Keep `BeanState`, `BeanProps` types exported exactly as before
- Keep `playChirp()`, eye tracking logic, click handler, tap state
- Replace the body rendering with an SVG `<svg width="48" height="56" viewBox="0 0 48 56" style={{ imageRendering: "pixelated" }} shapeRendering="crispEdges">`
- Pixel art body: golden rounded rect, eyes with highlights, cheeks, mouth
- Knitting needles shown when `state === "focusing"`

- [ ] **Step 4: Update bean.module.css for pixel art animations**

Update the `.body` class to remove the old CSS shape styles (border-radius, background color — these are now in SVG). Keep the animation keyframes (bob, bounce, slump, wiggleTap, floatUp). Adjust the `.body` dimensions to match the new SVG size.

Key changes:
- `.body` — remove `border-radius`, `background`, keep `position: relative`, update size to match SVG
- Keep all `@keyframes` — they still apply transforms to the `.body` div
- Remove `.face`, `.svgFace` — no longer needed (eyes are inside the SVG)
- Remove `.needles`, `.needle`, `.yarn` — knitting is now SVG-based

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/bean.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add components/bean.tsx components/bean.module.css tests/unit/bean.test.tsx
git commit -m "feat: rewrite Bean character as pixel art SVG sprite"
```

---

### Task 6: Pixel Art Zelda Hero Character

**Files:**
- Modify: `components/zelda-hero.tsx`
- Modify: `components/zelda-hero.module.css`
- Modify: `tests/unit/zelda-hero.test.tsx`

- [ ] **Step 1: Update zelda-hero test for pixel art rendering**

Read the existing test first, then update to check for the pixel art SVG. The key assertion changes: check aria-label and className-based state instead of specific SVG sub-elements.

```ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ZeldaHero } from "@/components/zelda-hero";
import { getTheme } from "@/lib/themes";

const theme = getTheme("zelda");

describe("ZeldaHero", () => {
  it("renders with idle state", () => {
    render(<ZeldaHero state="idle" currencyEarned={0} currencyIcon="💎" theme={theme} />);
    expect(screen.getByLabelText("Hero character")).toBeInTheDocument();
  });

  it("renders celebrating state with currency earned", () => {
    render(<ZeldaHero state="celebrating" currencyEarned={10} currencyIcon="💎" theme={theme} />);
    expect(screen.getByText("+10 💎")).toBeInTheDocument();
  });

  it("renders focusing state", () => {
    render(<ZeldaHero state="focusing" currencyEarned={0} currencyIcon="💎" theme={theme} />);
    const hero = screen.getByLabelText("Hero character");
    expect(hero).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/zelda-hero.test.tsx`
Expected: May fail if existing test asserts specific old markup

- [ ] **Step 3: Rewrite zelda-hero.tsx as pixel art SVG**

Replace the contents of `components/zelda-hero.tsx` with a pixel art SVG hero. Keep the same component API (`ZeldaHeroProps`, eye tracking, click reactions, chirp sound, variant selection).

The hero SVG should be a `<svg width="48" height="56" viewBox="0 0 48 56">` with:
- Pixel art green pointed cap (polygon)
- Tan head (rect with ear rects)
- Pixel eyes with blue irises and white highlights, tracking mouse
- Green tunic body (rect)
- Brown belt with gold buckle (rects)
- Arms (small rects)
- Brown boots (rects)
- Activity emoji overlay during focusing (kept as HTML overlay, same as before)

- [ ] **Step 4: Update zelda-hero.module.css**

Same approach as bean: remove old `.body` shape styles, keep animation keyframes. The `.body` div wraps the SVG.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/zelda-hero.test.tsx`
Expected: All 3 tests PASS

- [ ] **Step 6: Commit**

```bash
git add components/zelda-hero.tsx components/zelda-hero.module.css tests/unit/zelda-hero.test.tsx
git commit -m "feat: rewrite Zelda Hero as pixel art SVG sprite"
```

---

### Task 7: Themes — Decouple Room Variants

**Files:**
- Modify: `lib/themes.ts`
- Modify: `tests/unit/themes.test.ts`

- [ ] **Step 1: Update themes test**

Room variants are no longer on the theme. Remove `roomVariants` tests and `getCurrentRoomVariant` tests. The theme now only defines character and currency.

```ts
import { describe, it, expect } from "vitest";
import { getTheme, getCurrentFocusActivity } from "@/lib/themes";
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

  it("zelda has 4 focus activities", () => {
    const theme = getTheme("zelda");
    expect(theme.focusActivities).toHaveLength(4);
  });

  it("bean has 1 focus activity", () => {
    const theme = getTheme("bean");
    expect(theme.focusActivities).toHaveLength(1);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/themes.test.ts`
Expected: FAIL — tests reference removed exports like `getCurrentRoomVariant`

- [ ] **Step 3: Update themes.ts — remove room variants**

Remove `RoomVariant` type, `roomVariants` from `ThemeConfig`, `getCurrentRoomVariant` function. Remove the `roomVariants` arrays from `BEAN_THEME` and `ZELDA_THEME`.

Updated `lib/themes.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/themes.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/themes.ts tests/unit/themes.test.ts
git commit -m "refactor: decouple room variants from themes"
```

---

### Task 8: Economy Types — Add Unlocked Rooms

**Files:**
- Modify: `lib/economy-types.ts`

- [ ] **Step 1: Add `unlockedRooms` and `selectedRoom` to the economy schemas**

```ts
// Add to economy-types.ts — new schema for room state
export const roomStateSchema = z.object({
  unlockedRooms: z.array(z.string()).default(["basic"]),
  selectedRoom: z.string().default("basic"),
});

export type RoomState = z.infer<typeof roomStateSchema>;
```

- [ ] **Step 2: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add lib/economy-types.ts
git commit -m "feat: add room state schema for unlockable rooms"
```

---

### Task 9: Isometric Room View — Core Rendering

**Files:**
- Modify: `components/room-view.tsx`

- [ ] **Step 1: Rewrite room-view.tsx as isometric SVG**

Replace the flat div-based room with an isometric SVG. The room renders walls, floor, features, decorations, and the character.

```tsx
// components/room-view.tsx
"use client";

import { Bean, type BeanState } from "@/components/bean";
import { ZeldaHero } from "@/components/zelda-hero";
import { getDecoration } from "@/lib/decoration-catalog";
import { getRoomVariant, type RoomVariantDef } from "@/lib/room-catalog";
import { RoomFeature } from "@/components/sprites/room-features";
import { DecorationSprite } from "@/components/sprites/decorations";
import type { ThemeConfig } from "@/lib/themes";
import type { RoomPlacements } from "@/lib/economy-types";

const WALL_SLOTS = ["wall-1", "wall-2", "wall-3", "wall-4"] as const;
const FLOOR_SLOTS = ["floor-1", "floor-2", "floor-3", "floor-4"] as const;

type RoomViewProps = {
  beanState: BeanState;
  socksEarned?: number;
  placements: RoomPlacements["placements"];
  theme: ThemeConfig;
  roomId?: string;
  children?: React.ReactNode;
};

function IsometricRoom({ room, placements }: { room: RoomVariantDef; placements: RoomPlacements["placements"] }) {
  return (
    <svg
      viewBox="0 0 280 270"
      width="100%"
      style={{ imageRendering: "pixelated", display: "block" }}
      shapeRendering="crispEdges"
    >
      {/* Back wall */}
      <polygon
        points="20,60 240,60 240,170 20,170"
        fill={room.wallColor}
        stroke={room.baseboardColor}
        strokeWidth="2"
      />
      {/* Wall plank / texture lines */}
      <line x1="20" y1="88" x2="240" y2="88" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />
      <line x1="20" y1="115" x2="240" y2="115" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />
      <line x1="20" y1="142" x2="240" y2="142" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />

      {/* Side wall (right) */}
      <polygon
        points="240,60 270,40 270,190 240,170"
        fill={room.wallDarkColor}
        stroke={room.baseboardColor}
        strokeWidth="2"
      />
      <line x1="240" y1="88" x2="270" y2="73" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />
      <line x1="240" y1="115" x2="270" y2="105" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />
      <line x1="240" y1="142" x2="270" y2="137" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />

      {/* Floor */}
      <polygon
        points="20,170 240,170 270,190 270,260 0,260 0,190"
        fill={room.floorColor}
        stroke={room.baseboardColor}
        strokeWidth="2"
      />
      {/* Floor board lines */}
      <line x1="0" y1="210" x2="270" y2="210" stroke={room.floorDarkColor} strokeWidth="1" opacity="0.4" />
      <line x1="0" y1="230" x2="270" y2="230" stroke={room.floorDarkColor} strokeWidth="1" opacity="0.4" />
      <line x1="0" y1="250" x2="270" y2="250" stroke={room.floorDarkColor} strokeWidth="1" opacity="0.4" />

      {/* Shadow at wall base */}
      <rect x="20" y="170" width="220" height="6" fill="rgba(0,0,0,0.1)" />

      {/* Room features */}
      {room.features.map((featureId) => (
        <RoomFeature key={featureId} featureId={featureId} />
      ))}

      {/* Wall decorations */}
      {WALL_SLOTS.map((slotId, i) => {
        const itemId = placements[slotId];
        const decoration = itemId ? getDecoration(itemId) : null;
        const pos = room.wallSlots[i];
        return decoration ? (
          <DecorationSprite key={slotId} spriteId={decoration.sprite} x={pos.x} y={pos.y} />
        ) : null;
      })}

      {/* Floor decorations */}
      {FLOOR_SLOTS.map((slotId, i) => {
        const itemId = placements[slotId];
        const decoration = itemId ? getDecoration(itemId) : null;
        const pos = room.floorSlots[i];
        return decoration ? (
          <DecorationSprite key={slotId} spriteId={decoration.sprite} x={pos.x} y={pos.y} />
        ) : null;
      })}
    </svg>
  );
}

export function RoomView({ beanState, socksEarned, placements, theme, roomId = "basic", children }: RoomViewProps) {
  const room = getRoomVariant(roomId) ?? getRoomVariant("basic")!;

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          borderRadius: 20,
          overflow: "hidden",
          border: "2px solid var(--border)",
          background: "var(--card)",
          minHeight: 320,
        }}
      >
        <IsometricRoom room={room} placements={placements} />

        {/* Character (centered on floor plane) */}
        <div
          style={{
            position: "absolute",
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}
        >
          {theme.id === "zelda" ? (
            <ZeldaHero
              state={beanState}
              currencyEarned={socksEarned}
              currencyIcon={theme.currencyIcon}
              theme={theme}
            />
          ) : (
            <Bean state={beanState} socksEarned={socksEarned} currencyIcon={theme.currencyIcon} />
          )}
        </div>
      </div>

      {/* Timer display below room */}
      {children && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          {children}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Fix any TypeScript errors from the `getCurrentRoomVariant` removal**

Since `room-view.tsx` no longer calls `getCurrentRoomVariant`, and now accepts `roomId` as a prop, update any remaining imports. The `focus-timer.tsx` will be updated in a later task to pass `roomId`.

- [ ] **Step 3: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: May have errors in `focus-timer.tsx` since `RoomView` now expects `roomId` — that's expected and will be fixed in Task 12.

- [ ] **Step 4: Commit**

```bash
git add components/room-view.tsx
git commit -m "feat: rewrite room-view as isometric pixel art SVG"
```

---

### Task 10: Room Editor — Update for Isometric Sprites

**Files:**
- Modify: `components/room-editor.tsx`
- Modify: `tests/unit/room-editor.test.tsx`

- [ ] **Step 1: Update room-editor test**

The editor now shows pixel art sprites instead of emoji. Slot buttons render SVG previews instead of emoji text. The test needs to check for the decoration name rather than emoji content.

```ts
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoomEditor } from "@/components/room-editor";

describe("RoomEditor", () => {
  it("renders room with empty slots", () => {
    render(
      <RoomEditor
        placements={{}}
        purchased={["small-plant", "simple-poster"]}
        onPlace={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const emptySlots = screen.getAllByRole("button", { name: /empty slot/i });
    expect(emptySlots.length).toBe(8);
  });

  it("renders inventory bar with owned unplaced items", () => {
    render(
      <RoomEditor
        placements={{ "wall-1": "simple-poster" }}
        purchased={["small-plant", "simple-poster"]}
        onPlace={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText("Small Plant")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Update room-editor.tsx**

Replace emoji rendering in `SlotButton` and inventory bar with `<svg>` wrappers containing `<DecorationSprite>`. Import `DecorationSprite` from `@/components/sprites/decorations`.

In `SlotButton`: replace `{decoration.emoji}` with:
```tsx
<svg width="40" height="40" viewBox="0 0 40 40" style={{ imageRendering: "pixelated" }} shapeRendering="crispEdges">
  <DecorationSprite spriteId={decoration.sprite} x={4} y={4} />
</svg>
```

In the inventory bar items: replace `<span style={{ fontSize: 24 }}>{item!.emoji}</span>` with:
```tsx
<svg width="32" height="32" viewBox="0 0 32 32" style={{ imageRendering: "pixelated" }} shapeRendering="crispEdges">
  <DecorationSprite spriteId={item!.sprite} x={2} y={2} />
</svg>
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run tests/unit/room-editor.test.tsx`
Expected: All 2 tests PASS

- [ ] **Step 4: Commit**

```bash
git add components/room-editor.tsx tests/unit/room-editor.test.tsx
git commit -m "feat: update room editor to use pixel art sprite previews"
```

---

### Task 11: Shop Panel — Add Room Variants + Sprite Previews

**Files:**
- Modify: `components/shop-panel.tsx`
- Modify: `tests/unit/shop-panel.test.tsx`

- [ ] **Step 1: Update shop-panel test**

Add test for room variant section. Update existing tests for sprite-based decoration previews.

```ts
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShopPanel } from "@/components/shop-panel";

describe("ShopPanel", () => {
  it("renders all decoration items", () => {
    render(
      <ShopPanel
        socks={500}
        purchased={[]}
        onPurchase={vi.fn()}
        themeId="bean"
        currencyIcon="🧦"
        unlockedRooms={["basic"]}
        selectedRoom="basic"
        onUnlockRoom={vi.fn()}
        onSelectRoom={vi.fn()}
      />,
    );
    expect(screen.getByText("Small Plant")).toBeInTheDocument();
    expect(screen.getByText("Record Player")).toBeInTheDocument();
  });

  it("shows owned badge on purchased items", () => {
    render(
      <ShopPanel
        socks={500}
        purchased={["small-plant"]}
        onPurchase={vi.fn()}
        themeId="bean"
        currencyIcon="🧦"
        unlockedRooms={["basic"]}
        selectedRoom="basic"
        onUnlockRoom={vi.fn()}
        onSelectRoom={vi.fn()}
      />,
    );
    const plantCard = screen.getByText("Small Plant").closest("[data-item-id]");
    expect(plantCard?.querySelector("[data-owned]")).toBeInTheDocument();
  });

  it("disables buy button when insufficient socks", () => {
    render(
      <ShopPanel
        socks={10}
        purchased={[]}
        onPurchase={vi.fn()}
        themeId="bean"
        currencyIcon="🧦"
        unlockedRooms={["basic"]}
        selectedRoom="basic"
        onUnlockRoom={vi.fn()}
        onSelectRoom={vi.fn()}
      />,
    );
    const buyButtons = screen.getAllByRole("button", { name: /buy/i });
    expect(buyButtons.every((btn) => btn.hasAttribute("disabled"))).toBe(true);
  });

  it("renders room variants section", () => {
    render(
      <ShopPanel
        socks={1000}
        purchased={[]}
        onPurchase={vi.fn()}
        themeId="bean"
        currencyIcon="🧦"
        unlockedRooms={["basic"]}
        selectedRoom="basic"
        onUnlockRoom={vi.fn()}
        onSelectRoom={vi.fn()}
      />,
    );
    expect(screen.getByText("Basic Room")).toBeInTheDocument();
    expect(screen.getByText("Cozy Cottage")).toBeInTheDocument();
    expect(screen.getByText("Dungeon Workshop")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/shop-panel.test.tsx`
Expected: FAIL — ShopPanel doesn't accept the new props yet

- [ ] **Step 3: Update shop-panel.tsx**

Add `unlockedRooms`, `selectedRoom`, `onUnlockRoom`, `onSelectRoom` props. Add a "Rooms" category tab. Replace emoji decoration previews with SVG sprites. Add a room variant grid showing unlockable rooms from `ROOM_CATALOG`.

Key changes to `ShopPanelProps`:
```ts
type ShopPanelProps = {
  socks: number;
  purchased: string[];
  onPurchase: (itemId: string) => void;
  themeId: ThemeId;
  currencyIcon: string;
  unlockedRooms: string[];
  selectedRoom: string;
  onUnlockRoom: (roomId: string) => void;
  onSelectRoom: (roomId: string) => void;
};
```

Add "Rooms" to the category filter list. When "Rooms" is selected, render the room catalog grid instead of the decorations grid. Each room card shows name, description, cost, and unlock/select buttons.

Replace `<span style={{ fontSize: 32 }}>{item.emoji}</span>` in the decoration grid with:
```tsx
<svg width="40" height="40" viewBox="0 0 40 40" style={{ imageRendering: "pixelated" }} shapeRendering="crispEdges">
  <DecorationSprite spriteId={item.sprite} x={4} y={4} />
</svg>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/shop-panel.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add components/shop-panel.tsx tests/unit/shop-panel.test.tsx
git commit -m "feat: add room variant shop + pixel art sprite previews"
```

---

### Task 12: Focus Timer — Wire Room ID Through

**Files:**
- Modify: `components/focus-timer.tsx`

- [ ] **Step 1: Update FocusTimer to pass roomId to RoomView**

Add `roomId` prop to `FocusTimerProps` and pass it through to `<RoomView>`.

In `FocusTimerProps`, add:
```ts
roomId: string;
```

In the `<RoomView>` call, add `roomId={roomId}`:
```tsx
<RoomView
  beanState={beanState}
  socksEarned={socksJustEarned ?? undefined}
  placements={placements}
  theme={theme}
  roomId={roomId}
>
```

- [ ] **Step 2: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: May show errors in the page that renders `FocusTimer` since it now requires `roomId`. That will need to be passed from the page-level data.

- [ ] **Step 3: Commit**

```bash
git add components/focus-timer.tsx
git commit -m "feat: wire room variant ID through FocusTimer to RoomView"
```

---

### Task 13: Integration — Wire Room State Through the App

**Files:**
- Modify: Any page/route files that render `FocusTimer` and `ShopPanel`
- Modify: Any API routes for economy to handle room unlock/select

This task connects the room state to the app's data layer. The specifics depend on how the session page fetches and passes data — read the session route to determine the exact wiring.

- [ ] **Step 1: Read the session route to understand data flow**

Read the page that renders `FocusTimer` (likely `app/session/page.tsx` or similar) to understand how props are fetched and passed.

- [ ] **Step 2: Add room state to the data fetching layer**

Fetch `unlockedRooms` and `selectedRoom` alongside the existing wallet/inventory/placements data. If using SQLite, add a `room_state` table or column. If using local JSON, add to the existing economy data structure.

- [ ] **Step 3: Pass room state props through to FocusTimer and ShopPanel**

Wire `roomId` to `FocusTimer` and `unlockedRooms`/`selectedRoom`/`onUnlockRoom`/`onSelectRoom` to `ShopPanel`.

- [ ] **Step 4: Add API endpoint for room unlock/select**

Create or modify the economy API to handle:
- `POST /api/economy/unlock-room` — deduct cost, add room to unlocked list
- `POST /api/economy/select-room` — set selected room

- [ ] **Step 5: Run all tests to verify nothing is broken**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire room state through app data layer"
```

---

### Task 14: Final Integration Test — Full Run

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Start the dev server and verify visually**

Run: `npm run dev`

Verify in the browser:
- Isometric pixel art room renders with back wall, side wall, and floor
- Bean character displays as pixel art with idle bob animation
- Zelda Hero displays as pixel art when theme is switched
- Decorations render as pixel art in the room slots
- Room editor shows pixel art previews
- Shop shows pixel art decoration previews and room variants section
- Room variant purchase and selection works
- Focus timer flow works: start → focusing animation → complete → celebrate with currency
- Break timer still works after session completion

- [ ] **Step 3: Fix any visual issues found during manual testing**

Adjust SVG coordinates, colors, or sizing as needed based on visual inspection.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete isometric pixel art room overhaul"
```
