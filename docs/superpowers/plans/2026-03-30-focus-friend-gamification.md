# Focus Friend Gamification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Naren into a cozy, gamified focus app with a Bean character, room decoration system, socks currency, shop, break timer, lo-fi ambient music, and warm light theme — while preserving all existing timer, tracking, and sync functionality.

**Architecture:** The existing Next.js app keeps its server-side data layer (`lib/server/`) and API routes. The client-side layout shifts from a two-column dark design to a single-column warm light theme with bottom tab navigation. New economy data (wallet, inventory, room placements) is stored as JSON files alongside existing collections. The Bean character is a pure CSS/SVG component with 4 animation states driven by the existing timer state machine. A new Web Audio lo-fi synthesizer extends the existing `lib/sounds.ts` pattern.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 3, Zod, Web Audio API, CSS animations/transitions, Vitest + jsdom

---

## File Structure

### New files to create:
- `lib/server/economy.ts` — Server-side wallet/inventory/room read/write logic
- `lib/economy-types.ts` — Shared TypeScript types + Zod schemas for economy data
- `lib/lofi.ts` — Web Audio API lo-fi ambient music synthesizer
- `lib/decoration-catalog.ts` — Static catalog of all 18 decorations with metadata
- `components/bean.tsx` — Bean character SVG + CSS animation states
- `components/bean.module.css` — Bean animation keyframes and styles
- `components/room-view.tsx` — Room background with decoration slots and Bean
- `components/room-editor.tsx` — Room tab: drag decorations to slots
- `components/shop-panel.tsx` — Shop tab: browse/buy decorations
- `components/break-timer.tsx` — Post-session break countdown with shop redirect
- `components/bottom-nav.tsx` — 5-tab bottom navigation bar
- `components/mute-button.tsx` — Lo-fi music mute toggle
- `app/api/economy/route.ts` — GET wallet + inventory + room data
- `app/api/economy/purchase/route.ts` — POST buy a decoration
- `app/api/economy/place/route.ts` — POST/DELETE place/remove decoration in room
- `app/api/economy/earn/route.ts` — POST award socks after focus session
- `data/economy/wallet.json` — Initial wallet data
- `data/economy/inventory.json` — Initial inventory data
- `data/economy/room.json` — Initial room placements data
- `tests/unit/economy.test.ts` — Economy server logic tests
- `tests/unit/decoration-catalog.test.ts` — Catalog validation tests
- `tests/unit/bean.test.tsx` — Bean component render + state tests
- `tests/unit/lofi.test.ts` — Lo-fi synthesizer tests
- `tests/unit/break-timer.test.tsx` — Break timer component tests
- `tests/unit/shop-panel.test.tsx` — Shop panel component tests
- `tests/unit/room-editor.test.tsx` — Room editor component tests

### Existing files to modify:
- `app/globals.css` — Full theme overhaul: dark → warm light
- `app/layout.tsx` — Switch font from Onest to Poppins
- `tailwind.config.ts` — Add cozy theme color tokens
- `lib/server/schema.ts` — Add economy schemas, extend settings with `ambientMusic`, `breakDurationMinutes`, `breakEndChime`
- `lib/server/settings.ts` — No changes needed (generic enough already)
- `lib/server/dashboard.ts` — Add economy data to snapshot
- `lib/sounds.ts` — Add `break-end` sound alias to Fairy Fountain
- `components/tracker-shell.tsx` — Replace two-column layout with single-column + bottom nav + tab routing
- `components/focus-timer.tsx` — Integrate Bean, lo-fi audio, break timer, currency award
- `components/settings-panel.tsx` — Add ambient music toggle, break duration, break-end chime toggle
- `components/stats-overview.tsx` — Minor re-theme (CSS handles most of it)
- `app/page.tsx` — Pass economy data to TrackerShell

---

### Task 1: Economy Data Layer — Types, Schemas, and Server Logic

**Files:**
- Create: `lib/economy-types.ts`
- Create: `lib/server/economy.ts`
- Modify: `lib/server/schema.ts`
- Create: `data/economy/wallet.json`
- Create: `data/economy/inventory.json`
- Create: `data/economy/room.json`
- Test: `tests/unit/economy.test.ts`

- [ ] **Step 1: Write failing tests for economy logic**

```ts
// tests/unit/economy.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  readWallet,
  writeWallet,
  earnSocks,
  readInventory,
  addToInventory,
  readRoomPlacements,
  placeDecoration,
  removeDecoration,
  purchaseDecoration,
} from "@/lib/server/economy";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

const { readFile, writeFile, mkdir } = await import("node:fs/promises");
const mockedReadFile = vi.mocked(readFile);
const mockedWriteFile = vi.mocked(writeFile);
const mockedMkdir = vi.mocked(mkdir);

beforeEach(() => {
  vi.clearAllMocks();
  mockedMkdir.mockResolvedValue(undefined);
  mockedWriteFile.mockResolvedValue(undefined);
});

describe("readWallet", () => {
  it("returns default wallet when file does not exist", async () => {
    mockedReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const wallet = await readWallet();
    expect(wallet).toEqual({ socks: 0, totalEarned: 0 });
  });

  it("parses existing wallet file", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ socks: 150, totalEarned: 300 }));
    const wallet = await readWallet();
    expect(wallet).toEqual({ socks: 150, totalEarned: 300 });
  });
});

describe("earnSocks", () => {
  it("adds socks to wallet and increments totalEarned", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ socks: 100, totalEarned: 200 }));
    const wallet = await earnSocks(25);
    expect(wallet).toEqual({ socks: 125, totalEarned: 225 });
  });

  it("rejects zero or negative amounts", async () => {
    await expect(earnSocks(0)).rejects.toThrow();
    await expect(earnSocks(-5)).rejects.toThrow();
  });
});

describe("readInventory", () => {
  it("returns empty array when file does not exist", async () => {
    mockedReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const inventory = await readInventory();
    expect(inventory).toEqual({ purchased: [] });
  });
});

describe("addToInventory", () => {
  it("appends item id to purchased list", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ purchased: ["small-plant"] }));
    const inventory = await addToInventory("basic-rug");
    expect(inventory.purchased).toContain("small-plant");
    expect(inventory.purchased).toContain("basic-rug");
  });

  it("does not add duplicate items", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ purchased: ["small-plant"] }));
    const inventory = await addToInventory("small-plant");
    expect(inventory.purchased).toEqual(["small-plant"]);
  });
});

describe("readRoomPlacements", () => {
  it("returns empty placements when file does not exist", async () => {
    mockedReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const room = await readRoomPlacements();
    expect(room).toEqual({ placements: {} });
  });
});

describe("placeDecoration", () => {
  it("places a decoration in a slot", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ placements: {} }));
    const room = await placeDecoration("wall-1", "simple-poster");
    expect(room.placements["wall-1"]).toBe("simple-poster");
  });

  it("replaces existing decoration in slot", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ placements: { "wall-1": "simple-poster" } }));
    const room = await placeDecoration("wall-1", "large-painting");
    expect(room.placements["wall-1"]).toBe("large-painting");
  });
});

describe("removeDecoration", () => {
  it("removes a decoration from a slot", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ placements: { "wall-1": "simple-poster" } }));
    const room = await removeDecoration("wall-1");
    expect(room.placements["wall-1"]).toBeUndefined();
  });
});

describe("purchaseDecoration", () => {
  it("deducts socks and adds to inventory", async () => {
    // First call: readWallet (wallet.json), second: readInventory (inventory.json)
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify({ socks: 200, totalEarned: 400 }))
      .mockResolvedValueOnce(JSON.stringify({ purchased: [] }));
    const result = await purchaseDecoration("small-plant", 50);
    expect(result.wallet.socks).toBe(150);
    expect(result.inventory.purchased).toContain("small-plant");
  });

  it("rejects purchase when insufficient socks", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ socks: 10, totalEarned: 10 }));
    await expect(purchaseDecoration("small-plant", 50)).rejects.toThrow("Insufficient socks");
  });

  it("rejects purchase of already owned item", async () => {
    mockedReadFile
      .mockResolvedValueOnce(JSON.stringify({ socks: 200, totalEarned: 400 }))
      .mockResolvedValueOnce(JSON.stringify({ purchased: ["small-plant"] }));
    await expect(purchaseDecoration("small-plant", 50)).rejects.toThrow("Already owned");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/economy.test.ts`
Expected: FAIL — modules not found

- [ ] **Step 3: Create economy types and schemas**

```ts
// lib/economy-types.ts
import { z } from "zod";

export const walletSchema = z.object({
  socks: z.number().int().min(0).default(0),
  totalEarned: z.number().int().min(0).default(0),
});

export const inventorySchema = z.object({
  purchased: z.array(z.string()).default([]),
});

export const roomPlacementsSchema = z.object({
  placements: z.record(z.string(), z.string()).default({}),
});

export type Wallet = z.infer<typeof walletSchema>;
export type Inventory = z.infer<typeof inventorySchema>;
export type RoomPlacements = z.infer<typeof roomPlacementsSchema>;
```

- [ ] **Step 4: Create economy server logic**

```ts
// lib/server/economy.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  walletSchema,
  inventorySchema,
  roomPlacementsSchema,
  type Wallet,
  type Inventory,
  type RoomPlacements,
} from "@/lib/economy-types";

function getDataRoot() {
  if (process.env.TRACKER_DATA_DIR) {
    return path.resolve(process.cwd(), process.env.TRACKER_DATA_DIR);
  }
  return path.join(process.cwd(), "data");
}

function economyPath(file: string) {
  return path.join(getDataRoot(), "economy", file);
}

async function ensureDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function readJsonOr<T>(filePath: string, fallback: T, parse: (raw: string) => T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return parse(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

async function writeJson(filePath: string, data: unknown) {
  await ensureDir(filePath);
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

// Wallet
export async function readWallet(): Promise<Wallet> {
  return readJsonOr(economyPath("wallet.json"), walletSchema.parse({}), (raw) =>
    walletSchema.parse(JSON.parse(raw)),
  );
}

export async function writeWallet(wallet: Wallet): Promise<Wallet> {
  const validated = walletSchema.parse(wallet);
  await writeJson(economyPath("wallet.json"), validated);
  return validated;
}

export async function earnSocks(amount: number): Promise<Wallet> {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }
  const wallet = await readWallet();
  return writeWallet({
    socks: wallet.socks + amount,
    totalEarned: wallet.totalEarned + amount,
  });
}

// Inventory
export async function readInventory(): Promise<Inventory> {
  return readJsonOr(economyPath("inventory.json"), inventorySchema.parse({}), (raw) =>
    inventorySchema.parse(JSON.parse(raw)),
  );
}

export async function writeInventory(inventory: Inventory): Promise<Inventory> {
  const validated = inventorySchema.parse(inventory);
  await writeJson(economyPath("inventory.json"), validated);
  return validated;
}

export async function addToInventory(itemId: string): Promise<Inventory> {
  const inventory = await readInventory();
  if (inventory.purchased.includes(itemId)) {
    return inventory;
  }
  return writeInventory({ purchased: [...inventory.purchased, itemId] });
}

// Room Placements
export async function readRoomPlacements(): Promise<RoomPlacements> {
  return readJsonOr(economyPath("room.json"), roomPlacementsSchema.parse({}), (raw) =>
    roomPlacementsSchema.parse(JSON.parse(raw)),
  );
}

export async function writeRoomPlacements(room: RoomPlacements): Promise<RoomPlacements> {
  const validated = roomPlacementsSchema.parse(room);
  await writeJson(economyPath("room.json"), validated);
  return validated;
}

export async function placeDecoration(slotId: string, itemId: string): Promise<RoomPlacements> {
  const room = await readRoomPlacements();
  return writeRoomPlacements({ placements: { ...room.placements, [slotId]: itemId } });
}

export async function removeDecoration(slotId: string): Promise<RoomPlacements> {
  const room = await readRoomPlacements();
  const { [slotId]: _, ...rest } = room.placements;
  return writeRoomPlacements({ placements: rest });
}

// Purchase
export async function purchaseDecoration(
  itemId: string,
  cost: number,
): Promise<{ wallet: Wallet; inventory: Inventory }> {
  const wallet = await readWallet();
  if (wallet.socks < cost) {
    throw new Error("Insufficient socks");
  }
  const inventory = await readInventory();
  if (inventory.purchased.includes(itemId)) {
    throw new Error("Already owned");
  }
  const updatedWallet = await writeWallet({
    socks: wallet.socks - cost,
    totalEarned: wallet.totalEarned,
  });
  const updatedInventory = await writeInventory({
    purchased: [...inventory.purchased, itemId],
  });
  return { wallet: updatedWallet, inventory: updatedInventory };
}
```

- [ ] **Step 5: Create initial economy data files**

```json
// data/economy/wallet.json
{
  "socks": 0,
  "totalEarned": 0
}
```

```json
// data/economy/inventory.json
{
  "purchased": []
}
```

```json
// data/economy/room.json
{
  "placements": {}
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/unit/economy.test.ts`
Expected: All 12 tests PASS

- [ ] **Step 7: Commit**

```bash
git add lib/economy-types.ts lib/server/economy.ts data/economy/ tests/unit/economy.test.ts
git commit -m "feat: add economy data layer — wallet, inventory, room placements"
```

---

### Task 2: Decoration Catalog

**Files:**
- Create: `lib/decoration-catalog.ts`
- Test: `tests/unit/decoration-catalog.test.ts`

- [ ] **Step 1: Write failing tests for decoration catalog**

```ts
// tests/unit/decoration-catalog.test.ts
import { describe, it, expect } from "vitest";
import { DECORATION_CATALOG, getDecoration, getDecorationsByCategory } from "@/lib/decoration-catalog";

describe("DECORATION_CATALOG", () => {
  it("has exactly 18 items", () => {
    expect(DECORATION_CATALOG).toHaveLength(18);
  });

  it("every item has required fields", () => {
    for (const item of DECORATION_CATALOG) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.category).toMatch(/^(wall|floor|furniture)$/);
      expect(item.tier).toMatch(/^(basic|mid|premium)$/);
      expect(item.cost).toBeGreaterThan(0);
      expect(item.emoji).toBeTruthy();
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/decoration-catalog.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create decoration catalog**

```ts
// lib/decoration-catalog.ts
export type DecorationTier = "basic" | "mid" | "premium";
export type DecorationCategory = "wall" | "floor" | "furniture";

export type Decoration = {
  id: string;
  name: string;
  category: DecorationCategory;
  tier: DecorationTier;
  cost: number;
  emoji: string;
  slotType: "wall" | "floor";
};

export const DECORATION_CATALOG: Decoration[] = [
  // Basic tier (50–100 socks)
  { id: "small-plant", name: "Small Plant", category: "floor", tier: "basic", cost: 50, emoji: "🌱", slotType: "floor" },
  { id: "basic-rug", name: "Basic Rug", category: "floor", tier: "basic", cost: 60, emoji: "🟫", slotType: "floor" },
  { id: "simple-poster", name: "Simple Poster", category: "wall", tier: "basic", cost: 70, emoji: "🖼️", slotType: "wall" },
  { id: "desk-lamp", name: "Desk Lamp", category: "furniture", tier: "basic", cost: 80, emoji: "💡", slotType: "floor" },
  { id: "bookshelf", name: "Bookshelf", category: "furniture", tier: "basic", cost: 90, emoji: "📚", slotType: "floor" },
  { id: "trash-can", name: "Trash Can", category: "furniture", tier: "basic", cost: 100, emoji: "🗑️", slotType: "floor" },

  // Mid tier (150–300 socks)
  { id: "cozy-armchair", name: "Cozy Armchair", category: "furniture", tier: "mid", cost: 150, emoji: "🪑", slotType: "floor" },
  { id: "window-curtains", name: "Window with Curtains", category: "wall", tier: "mid", cost: 180, emoji: "🪟", slotType: "wall" },
  { id: "wall-clock", name: "Wall Clock", category: "wall", tier: "mid", cost: 200, emoji: "🕐", slotType: "wall" },
  { id: "potted-tree", name: "Potted Tree", category: "floor", tier: "mid", cost: 220, emoji: "🌳", slotType: "floor" },
  { id: "side-table", name: "Side Table", category: "furniture", tier: "mid", cost: 250, emoji: "🪵", slotType: "floor" },
  { id: "floor-lamp", name: "Floor Lamp", category: "furniture", tier: "mid", cost: 300, emoji: "🪔", slotType: "floor" },

  // Premium tier (400–700 socks)
  { id: "fancy-desk", name: "Fancy Desk", category: "furniture", tier: "premium", cost: 400, emoji: "🖥️", slotType: "floor" },
  { id: "large-painting", name: "Large Painting", category: "wall", tier: "premium", cost: 450, emoji: "🎨", slotType: "wall" },
  { id: "cat-bed", name: "Cat Bed", category: "floor", tier: "premium", cost: 500, emoji: "🐱", slotType: "floor" },
  { id: "string-lights", name: "String Lights", category: "wall", tier: "premium", cost: 550, emoji: "✨", slotType: "wall" },
  { id: "coffee-machine", name: "Coffee Machine", category: "furniture", tier: "premium", cost: 600, emoji: "☕", slotType: "floor" },
  { id: "record-player", name: "Record Player", category: "furniture", tier: "premium", cost: 700, emoji: "🎵", slotType: "floor" },
];

export function getDecoration(id: string): Decoration | undefined {
  return DECORATION_CATALOG.find((item) => item.id === id);
}

export function getDecorationsByCategory(category: DecorationCategory): Decoration[] {
  return DECORATION_CATALOG.filter((item) => item.category === category);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/decoration-catalog.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/decoration-catalog.ts tests/unit/decoration-catalog.test.ts
git commit -m "feat: add decoration catalog with 18 items across 3 tiers"
```

---

### Task 3: Economy API Routes

**Files:**
- Create: `app/api/economy/route.ts`
- Create: `app/api/economy/purchase/route.ts`
- Create: `app/api/economy/place/route.ts`
- Create: `app/api/economy/earn/route.ts`

- [ ] **Step 1: Create GET economy route**

```ts
// app/api/economy/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { readWallet, readInventory, readRoomPlacements } from "@/lib/server/economy";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [wallet, inventory, room] = await Promise.all([
    readWallet(),
    readInventory(),
    readRoomPlacements(),
  ]);

  return NextResponse.json({ wallet, inventory, room });
}
```

- [ ] **Step 2: Create POST earn route**

```ts
// app/api/economy/earn/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { earnSocks } from "@/lib/server/economy";

const earnSchema = z.object({
  amount: z.number().int().min(1),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = earnSchema.parse(await request.json());
  const wallet = await earnSocks(body.amount);
  return NextResponse.json({ wallet });
}
```

- [ ] **Step 3: Create POST purchase route**

```ts
// app/api/economy/purchase/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { purchaseDecoration } from "@/lib/server/economy";
import { getDecoration } from "@/lib/decoration-catalog";

const purchaseSchema = z.object({
  itemId: z.string().min(1),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = purchaseSchema.parse(await request.json());
  const decoration = getDecoration(body.itemId);
  if (!decoration) {
    return NextResponse.json({ error: "Unknown decoration" }, { status: 400 });
  }

  try {
    const result = await purchaseDecoration(body.itemId, decoration.cost);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 4: Create POST/DELETE place route**

```ts
// app/api/economy/place/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { placeDecoration, removeDecoration, readInventory } from "@/lib/server/economy";

const placeSchema = z.object({
  slotId: z.string().min(1),
  itemId: z.string().min(1),
});

const removeSchema = z.object({
  slotId: z.string().min(1),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = placeSchema.parse(await request.json());
  const inventory = await readInventory();
  if (!inventory.purchased.includes(body.itemId)) {
    return NextResponse.json({ error: "Item not owned" }, { status: 400 });
  }

  const room = await placeDecoration(body.slotId, body.itemId);
  return NextResponse.json({ room });
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isSessionTokenValid(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = removeSchema.parse(await request.json());
  const room = await removeDecoration(body.slotId);
  return NextResponse.json({ room });
}
```

- [ ] **Step 5: Run full test suite to verify no regressions**

Run: `npx vitest run`
Expected: All existing tests still PASS

- [ ] **Step 6: Commit**

```bash
git add app/api/economy/
git commit -m "feat: add economy API routes — earn, purchase, place, remove"
```

---

### Task 4: Extend Settings Schema for New Features

**Files:**
- Modify: `lib/server/schema.ts`
- Modify: `components/settings-panel.tsx`
- Test: `tests/unit/settings.test.ts` (existing — verify no regressions)

- [ ] **Step 1: Extend settings schema**

In `lib/server/schema.ts`, add three new fields to `settingsSchema` and `settingsPatchSchema`:

```ts
// Add to settingsSchema object:
  ambientMusic: z.boolean().default(true),
  breakDurationMinutes: z.number().int().min(1).max(30).default(5),
  breakEndChime: z.boolean().default(true),
```

```ts
// Add to settingsPatchSchema object:
  ambientMusic: z.boolean().optional(),
  breakDurationMinutes: z.number().int().min(1).max(30).optional(),
  breakEndChime: z.boolean().optional(),
```

- [ ] **Step 2: Run existing settings tests**

Run: `npx vitest run tests/unit/settings.test.ts`
Expected: PASS (defaults handle new fields)

- [ ] **Step 3: Commit**

```bash
git add lib/server/schema.ts
git commit -m "feat: extend settings schema with ambient music, break duration, break-end chime"
```

---

### Task 5: Add Economy Data to Dashboard Snapshot

**Files:**
- Modify: `lib/server/dashboard.ts`
- Modify: `app/page.tsx`
- Test: `tests/unit/dashboard.test.ts` (existing — verify no regressions)

- [ ] **Step 1: Add economy reads to getTrackerSnapshot**

In `lib/server/dashboard.ts`, import economy functions and add them to the snapshot:

```ts
// Add import at top:
import { readWallet, readInventory, readRoomPlacements } from "@/lib/server/economy";
import type { Wallet, Inventory, RoomPlacements } from "@/lib/economy-types";
```

In `getTrackerSnapshot`, add to the `Promise.all`:

```ts
  const [focusSessions, sleepEntries, workouts, healthMetrics, dailyLogs, settings, wallet, inventory, room] =
    await Promise.all([
      readCollection("focus/sessions"),
      readCollection("sleep/entries"),
      readCollection("workouts/entries"),
      readCollection("health/metrics"),
      readCollection("journal/daily"),
      readSettings(),
      readWallet(),
      readInventory(),
      readRoomPlacements(),
    ]);
```

Add to the return of `getTrackerSnapshot` (after `buildDashboardSnapshot` call):

```ts
  const dashboard = buildDashboardSnapshot({ ... });
  return { ...dashboard, economy: { wallet, inventory, room } };
```

- [ ] **Step 2: Run existing dashboard tests**

Run: `npx vitest run tests/unit/dashboard.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add lib/server/dashboard.ts
git commit -m "feat: include economy data in dashboard snapshot"
```

---

### Task 6: Theme Overhaul — Dark to Warm Cozy Light

**Files:**
- Modify: `app/globals.css` (full rewrite of CSS variables and color values)
- Modify: `app/layout.tsx` (switch font to Poppins)
- Modify: `tailwind.config.ts` (add theme tokens)

- [ ] **Step 1: Update layout.tsx to use Poppins font**

Replace in `app/layout.tsx`:

```ts
// Change import:
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "600"],
  variable: "--font-poppins",
});
```

Update the body className:

```tsx
<body className={poppins.variable}>{children}</body>
```

- [ ] **Step 2: Update tailwind.config.ts with cozy theme tokens**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./tests/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          bg: "#F8F5F0",
          card: "#FFFFFF",
          border: "#E8E4DC",
          primary: "#1D5A5D",
          action: "#B0C423",
          text: "#333333",
          muted: "#666666",
          pill: "#E8F5E9",
          wall: "#FDF6E3",
          floor: "#F5ECD7",
        },
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Rewrite globals.css root variables and base styles**

Replace the `:root` and `html,body` blocks in `app/globals.css`:

```css
:root {
  color-scheme: light;
  --bg: #F8F5F0;
  --card: #FFFFFF;
  --border: #E8E4DC;
  --text: #333333;
  --muted: #666666;
  --accent: #1D5A5D;
  --action: #B0C423;
  --pill-bg: #E8F5E9;
  --wall: #FDF6E3;
  --floor: #F5ECD7;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-poppins), ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

- [ ] **Step 4: Update all component color references across globals.css**

This is the largest single step. Replace every `rgba(purple/dark)` color reference with the cozy theme equivalents. Key substitutions:

- All `background: linear-gradient(180deg, rgba(28, 17, 46, …), rgba(10, 7, 19, …))` → `background: var(--card)`
- All `border: 1px solid rgba(197, 162, 255, …)` → `border: 1px solid var(--border)`
- All `border: 1px solid rgba(255, 255, 255, …)` → `border: 1px solid var(--border)`
- All `color: #c9bddf` / `color: rgba(244, 239, 255, …)` → `color: var(--muted)`
- All `color: #c084fc` / `color: #dccff9` → `color: var(--accent)`
- `.primary-button` gradient → `background: var(--action); color: white`
- `.primary-button--focus` gradient → `background: var(--action); box-shadow: 0 14px 32px rgba(176, 196, 35, 0.28)`
- `.hub-topbar` background → `background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(16px)`
- `.hub-bottombar` background → `background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(16px)`
- `.hub-shell::before` → remove or replace with subtle warm gradient
- `.hub-bg` elements → warm teal/cream gradients
- `.metric-pill` → `background: var(--pill-bg)`
- `.metric-pill.tone-amber strong` → `color: #d97706` (warm amber)
- `.metric-pill.tone-emerald strong` → `color: #059669`
- `.metric-pill.tone-sky strong` → `color: var(--accent)`
- Focus ring SVG gradients in `focus-timer.tsx` → teal-based: `#1D5A5D` to `#B0C423`
- `.focus-ring__track` stroke → `rgba(0,0,0,0.08)`
- Heatmap levels → teal scale: `.level-1: rgba(29,90,93,0.2)`, `.level-2: rgba(29,90,93,0.4)`, `.level-3: rgba(29,90,93,0.65)`, `.level-4: rgba(176,196,35,0.8)`
- `.panel-shell` → `background: var(--card); border: 1px solid var(--border); box-shadow: 0 4px 24px rgba(0,0,0,0.06)`
- `.field input`, `.field select`, `.field textarea` → `background: var(--bg); border-color: var(--border); color: var(--text)`
- Remove `backdrop-filter: blur()` from most elements (not needed on light theme)

- [ ] **Step 5: Verify the app builds**

Run: `npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 6: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/layout.tsx tailwind.config.ts
git commit -m "feat: overhaul theme from dark purple to warm cozy light"
```

---

### Task 7: Bean Character Component

**Files:**
- Create: `components/bean.tsx`
- Create: `components/bean.module.css`
- Test: `tests/unit/bean.test.tsx`

- [ ] **Step 1: Write failing tests for Bean component**

```tsx
// tests/unit/bean.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Bean } from "@/components/bean";

describe("Bean", () => {
  it("renders with idle state by default", () => {
    render(<Bean state="idle" />);
    expect(screen.getByLabelText("Bean character")).toBeInTheDocument();
    expect(screen.getByText("◡‿◡")).toBeInTheDocument();
  });

  it("renders focusing state with back turned", () => {
    render(<Bean state="focusing" />);
    expect(screen.getByText("– –")).toBeInTheDocument();
  });

  it("renders celebrating state", () => {
    render(<Bean state="celebrating" socksEarned={25} />);
    expect(screen.getByText("◡▽◡")).toBeInTheDocument();
    expect(screen.getByText("+25 🧦")).toBeInTheDocument();
  });

  it("renders sad state", () => {
    render(<Bean state="sad" />);
    expect(screen.getByText("◠_◠")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/bean.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Create Bean CSS module**

```css
/* components/bean.module.css */
.bean {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.body {
  width: 80px;
  height: 90px;
  border-radius: 40px 40px 35px 35px;
  background: #8B6914;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.5s ease, filter 0.5s ease;
  position: relative;
}

.face {
  color: white;
  font-size: 20px;
  user-select: none;
  line-height: 1;
}

/* Idle: gentle bobbing */
.idle .body {
  animation: bob 3s ease-in-out infinite;
}

/* Focusing: turned away */
.focusing .body {
  transform: rotateY(180deg);
}

.focusing .face {
  transform: rotateY(180deg);
}

/* Knitting needles */
.needles {
  position: absolute;
  bottom: -8px;
  display: none;
}

.focusing .needles {
  display: flex;
  gap: 4px;
  animation: knit 1.2s ease-in-out infinite;
}

.needle {
  width: 2px;
  height: 18px;
  background: #A0A0A0;
  border-radius: 1px;
}

.yarn {
  position: absolute;
  bottom: -16px;
  width: 24px;
  height: 2px;
  background: #FFFFFF;
  border-radius: 1px;
  display: none;
}

.focusing .yarn {
  display: block;
  animation: wiggle 1.2s ease-in-out infinite;
}

/* Celebrating: bounce */
.celebrating .body {
  animation: bounce 0.6s ease-in-out 3;
}

.socksEarned {
  position: absolute;
  top: -24px;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent, #1D5A5D);
  animation: floatUp 2s ease-out forwards;
  pointer-events: none;
}

/* Sad: slumped, muted */
.sad .body {
  filter: saturate(0.5) brightness(0.85);
  transform: scale(0.92);
  animation: slump 0.5s ease-out forwards;
}

.unravelYarn {
  position: absolute;
  bottom: -12px;
  width: 30px;
  height: 30px;
  display: none;
}

.sad .unravelYarn {
  display: block;
}

.unravelStrand {
  stroke: #FFFFFF;
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 60;
  stroke-dashoffset: 0;
  animation: unravel 1.5s ease-in forwards;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes knit {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}

@keyframes wiggle {
  0%, 100% { transform: translateX(-3px); }
  50% { transform: translateX(3px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
}

@keyframes slump {
  from { transform: scale(1); }
  to { transform: scale(0.92); }
}

@keyframes unravel {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: 60; }
}
```

- [ ] **Step 4: Create Bean component**

```tsx
// components/bean.tsx
"use client";

import styles from "./bean.module.css";

export type BeanState = "idle" | "focusing" | "celebrating" | "sad";

type BeanProps = {
  state: BeanState;
  socksEarned?: number;
};

export function Bean({ state, socksEarned }: BeanProps) {
  const faces: Record<BeanState, string> = {
    idle: "◡‿◡",
    focusing: "– –",
    celebrating: "◡▽◡",
    sad: "◠_◠",
  };

  return (
    <div className={`${styles.bean} ${styles[state]}`} aria-label="Bean character">
      <div className={styles.body}>
        <span className={styles.face}>{faces[state]}</span>
        <div className={styles.needles}>
          <div className={styles.needle} />
          <div className={styles.needle} />
        </div>
        <div className={styles.yarn} />
        <svg className={styles.unravelYarn} viewBox="0 0 30 30">
          <path className={styles.unravelStrand} d="M5,5 Q15,15 10,25 Q5,20 20,15 Q25,10 15,5" />
        </svg>
      </div>
      {state === "celebrating" && socksEarned != null && (
        <span className={styles.socksEarned}>+{socksEarned} 🧦</span>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/bean.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add components/bean.tsx components/bean.module.css tests/unit/bean.test.tsx
git commit -m "feat: add Bean character component with 4 animation states"
```

---

### Task 8: Room View Component

**Files:**
- Create: `components/room-view.tsx`

- [ ] **Step 1: Create room view component**

```tsx
// components/room-view.tsx
"use client";

import { Bean, type BeanState } from "@/components/bean";
import { getDecoration } from "@/lib/decoration-catalog";
import type { RoomPlacements } from "@/lib/economy-types";

const WALL_SLOTS = ["wall-1", "wall-2", "wall-3", "wall-4"] as const;
const FLOOR_SLOTS = ["floor-1", "floor-2", "floor-3", "floor-4"] as const;

const WALL_POSITIONS: Record<string, { top: string; left: string }> = {
  "wall-1": { top: "8%", left: "8%" },
  "wall-2": { top: "8%", left: "75%" },
  "wall-3": { top: "30%", left: "5%" },
  "wall-4": { top: "30%", left: "80%" },
};

const FLOOR_POSITIONS: Record<string, { bottom: string; left: string }> = {
  "floor-1": { bottom: "8%", left: "5%" },
  "floor-2": { bottom: "8%", left: "75%" },
  "floor-3": { bottom: "28%", left: "10%" },
  "floor-4": { bottom: "28%", left: "72%" },
};

type RoomViewProps = {
  beanState: BeanState;
  socksEarned?: number;
  placements: RoomPlacements["placements"];
  children?: React.ReactNode;
};

export function RoomView({ beanState, socksEarned, placements, children }: RoomViewProps) {
  return (
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
      {/* Wall */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60%",
          background: "var(--wall)",
        }}
      />
      {/* Floor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: "var(--floor)",
          borderTop: "2px solid var(--border)",
        }}
      />

      {/* Wall decorations */}
      {WALL_SLOTS.map((slotId) => {
        const itemId = placements[slotId];
        const decoration = itemId ? getDecoration(itemId) : null;
        const pos = WALL_POSITIONS[slotId];
        return decoration ? (
          <span
            key={slotId}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              fontSize: 28,
              zIndex: 2,
            }}
            title={decoration.name}
          >
            {decoration.emoji}
          </span>
        ) : null;
      })}

      {/* Floor decorations */}
      {FLOOR_SLOTS.map((slotId) => {
        const itemId = placements[slotId];
        const decoration = itemId ? getDecoration(itemId) : null;
        const pos = FLOOR_POSITIONS[slotId];
        return decoration ? (
          <span
            key={slotId}
            style={{
              position: "absolute",
              bottom: pos.bottom,
              left: pos.left,
              fontSize: 28,
              zIndex: 2,
            }}
            title={decoration.name}
          >
            {decoration.emoji}
          </span>
        ) : null;
      })}

      {/* Bean (centered on floor) */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
        }}
      >
        <Bean state={beanState} socksEarned={socksEarned} />
      </div>

      {/* Overlay content (timer display) */}
      {children && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
            zIndex: 4,
            textAlign: "center",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/room-view.tsx
git commit -m "feat: add room view component with wall/floor decoration slots"
```

---

### Task 9: Lo-fi Ambient Music Synthesizer

**Files:**
- Create: `lib/lofi.ts`
- Test: `tests/unit/lofi.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/unit/lofi.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLofiPlayer } from "@/lib/lofi";

// Mock Web Audio API
const mockOscillator = {
  type: "sine",
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), value: 0 },
  connect: vi.fn(),
};

const mockFilter = {
  type: "lowpass",
  frequency: { setValueAtTime: vi.fn() },
  Q: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({ ...mockGain, gain: { ...mockGain.gain } })),
  createBiquadFilter: vi.fn(() => ({ ...mockFilter })),
  close: vi.fn(),
  state: "running" as string,
};

vi.stubGlobal("AudioContext", vi.fn(() => mockAudioContext));

beforeEach(() => {
  vi.clearAllMocks();
  mockAudioContext.state = "running";
});

describe("createLofiPlayer", () => {
  it("creates a player with start and stop methods", () => {
    const player = createLofiPlayer();
    expect(player.start).toBeInstanceOf(Function);
    expect(player.stop).toBeInstanceOf(Function);
    expect(player.isPlaying).toBe(false);
  });

  it("sets isPlaying to true after start", () => {
    const player = createLofiPlayer();
    player.start();
    expect(player.isPlaying).toBe(true);
  });

  it("sets isPlaying to false after stop", () => {
    const player = createLofiPlayer();
    player.start();
    player.stop();
    expect(player.isPlaying).toBe(false);
  });

  it("does not double-start", () => {
    const player = createLofiPlayer();
    player.start();
    player.start();
    // Should only create one AudioContext
    expect(AudioContext).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/lofi.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create lo-fi synthesizer**

```ts
// lib/lofi.ts
// Lo-fi ambient music synthesizer using Web Audio API.
// Plays a gentle 4-chord pad loop at ~70 BPM with filtered noise warmth.

type LofiPlayer = {
  start: () => void;
  stop: () => void;
  isPlaying: boolean;
};

// Chord progression: Cmaj7 → Am7 → Fmaj7 → G7 (classic lo-fi)
const CHORDS = [
  [261.63, 329.63, 392.00, 493.88], // Cmaj7
  [220.00, 261.63, 329.63, 392.00], // Am7
  [174.61, 220.00, 261.63, 329.63], // Fmaj7
  [196.00, 246.94, 293.66, 349.23], // G7
];

const CHORD_DURATION = 7.5; // seconds per chord (~70 BPM, 4 beats)
const LOOP_DURATION = CHORD_DURATION * CHORDS.length; // 30 seconds total
const VOLUME = 0.08;

export function createLofiPlayer(): LofiPlayer {
  let ctx: AudioContext | null = null;
  let playing = false;
  let loopTimer: ReturnType<typeof setInterval> | null = null;
  let oscillators: OscillatorNode[] = [];

  function scheduleLoop() {
    if (!ctx || !playing) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(VOLUME, now);
    master.connect(ctx.destination);

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1, now);
    filter.connect(master);

    const newOscillators: OscillatorNode[] = [];

    for (let ci = 0; ci < CHORDS.length; ci++) {
      const chordStart = now + ci * CHORD_DURATION;
      const chord = CHORDS[ci];

      for (const freq of chord) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, chordStart);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, chordStart);
        noteGain.gain.linearRampToValueAtTime(0.3, chordStart + 0.8);
        noteGain.gain.linearRampToValueAtTime(0.25, chordStart + CHORD_DURATION - 0.5);
        noteGain.gain.linearRampToValueAtTime(0, chordStart + CHORD_DURATION);

        osc.connect(noteGain);
        noteGain.connect(filter);
        osc.start(chordStart);
        osc.stop(chordStart + CHORD_DURATION + 0.1);
        newOscillators.push(osc);
      }
    }

    oscillators = newOscillators;
  }

  const player: LofiPlayer = {
    get isPlaying() {
      return playing;
    },

    start() {
      if (playing) return;
      ctx = new AudioContext();
      playing = true;
      scheduleLoop();
      loopTimer = setInterval(() => scheduleLoop(), LOOP_DURATION * 1000);
    },

    stop() {
      playing = false;
      if (loopTimer) {
        clearInterval(loopTimer);
        loopTimer = null;
      }
      for (const osc of oscillators) {
        try { osc.stop(); } catch { /* already stopped */ }
      }
      oscillators = [];
      if (ctx) {
        void ctx.close();
        ctx = null;
      }
    },
  };

  return player;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/lofi.test.ts`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/lofi.ts tests/unit/lofi.test.ts
git commit -m "feat: add lo-fi ambient music synthesizer via Web Audio API"
```

---

### Task 10: Mute Button Component

**Files:**
- Create: `components/mute-button.tsx`

- [ ] **Step 1: Create mute button component**

```tsx
// components/mute-button.tsx
"use client";

import { Volume2, VolumeX } from "lucide-react";

type MuteButtonProps = {
  muted: boolean;
  onToggle: () => void;
};

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
  const Icon = muted ? VolumeX : Volume2;

  return (
    <button
      type="button"
      className="utility-button"
      aria-label={muted ? "Unmute ambient music" : "Mute ambient music"}
      onClick={onToggle}
      style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}
    >
      <Icon size={16} />
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/mute-button.tsx
git commit -m "feat: add mute button component for lo-fi ambient music"
```

---

### Task 11: Bottom Navigation Component

**Files:**
- Create: `components/bottom-nav.tsx`

- [ ] **Step 1: Create bottom nav component**

```tsx
// components/bottom-nav.tsx
"use client";

import { Timer, Home, ShoppingBag, BarChart3, Settings, LogOut } from "lucide-react";

export type TabId = "focus" | "room" | "shop" | "stats" | "settings";

const TABS: { id: TabId; label: string; icon: typeof Timer }[] = [
  { id: "focus", label: "Focus", icon: Timer },
  { id: "room", label: "Room", icon: Home },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

type BottomNavProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
};

export function BottomNav({ activeTab, onTabChange, onLogout }: BottomNavProps) {
  return (
    <footer className="hub-bottombar">
      <nav className="nav-cluster" aria-label="Main navigation" style={{ flex: 1, justifyContent: "center" }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={active ? "nav-pill is-active" : "nav-pill"}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="utility-cluster">
        <form action={onLogout}>
          <button type="submit" className="utility-button danger" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/bottom-nav.tsx
git commit -m "feat: add bottom navigation bar with 5 tabs"
```

---

### Task 12: Shop Panel Component

**Files:**
- Create: `components/shop-panel.tsx`
- Test: `tests/unit/shop-panel.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// tests/unit/shop-panel.test.tsx
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
      />,
    );
    expect(screen.getByText("Small Plant")).toBeInTheDocument();
    expect(screen.getByText("Record Player")).toBeInTheDocument();
  });

  it("shows purchased badge on owned items", () => {
    render(
      <ShopPanel
        socks={500}
        purchased={["small-plant"]}
        onPurchase={vi.fn()}
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
      />,
    );
    const buyButtons = screen.getAllByRole("button", { name: /buy/i });
    // All items cost >= 50, so all should be disabled
    expect(buyButtons.every((btn) => btn.hasAttribute("disabled"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/shop-panel.test.tsx`
Expected: FAIL

- [ ] **Step 3: Create shop panel component**

```tsx
// components/shop-panel.tsx
"use client";

import { useState } from "react";
import { DECORATION_CATALOG, type DecorationCategory } from "@/lib/decoration-catalog";

type ShopPanelProps = {
  socks: number;
  purchased: string[];
  onPurchase: (itemId: string) => void;
};

const CATEGORIES: { id: DecorationCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wall", label: "Wall" },
  { id: "floor", label: "Floor" },
  { id: "furniture", label: "Furniture" },
];

export function ShopPanel({ socks, purchased, onPurchase }: ShopPanelProps) {
  const [filter, setFilter] = useState<DecorationCategory | "all">("all");

  const items = filter === "all"
    ? DECORATION_CATALOG
    : DECORATION_CATALOG.filter((item) => item.category === filter);

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {/* Category filters */}
      <div style={{ display: "flex", gap: 8 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={filter === cat.id ? "nav-pill is-active" : "nav-pill"}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {items.map((item) => {
          const owned = purchased.includes(item.id);
          const canAfford = socks >= item.cost;
          return (
            <div
              key={item.id}
              data-item-id={item.id}
              style={{
                padding: 16,
                borderRadius: 16,
                border: "1px solid var(--border)",
                background: owned ? "var(--pill-bg)" : "var(--card)",
                opacity: owned ? 0.7 : 1,
                display: "grid",
                gap: 8,
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 32 }}>{item.emoji}</span>
              <strong style={{ fontSize: 14 }}>{item.name}</strong>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{item.cost} 🧦</span>
              {owned ? (
                <span data-owned style={{ fontSize: 12, color: "var(--accent)" }}>✓ Owned</span>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  disabled={!canAfford}
                  onClick={() => onPurchase(item.id)}
                  aria-label={`Buy ${item.name}`}
                  style={{ padding: "8px 12px", fontSize: 13 }}
                >
                  Buy
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Room unlock progress */}
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--card)",
          textAlign: "center",
        }}
      >
        <strong>Next Room</strong>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 8px" }}>
          🧦 {Math.min(socks, 1000)} / 1,000
        </p>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, (socks / 1000) * 100)}%`,
              borderRadius: 4,
              background: "var(--action)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/shop-panel.test.tsx`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add components/shop-panel.tsx tests/unit/shop-panel.test.tsx
git commit -m "feat: add shop panel with category filters and purchase flow"
```

---

### Task 13: Room Editor Component

**Files:**
- Create: `components/room-editor.tsx`
- Test: `tests/unit/room-editor.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// tests/unit/room-editor.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoomEditor } from "@/components/room-editor";

describe("RoomEditor", () => {
  it("renders room with empty slots as dashed outlines", () => {
    render(
      <RoomEditor
        placements={{}}
        purchased={["small-plant", "simple-poster"]}
        onPlace={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const emptySlots = screen.getAllByRole("button", { name: /empty slot/i });
    expect(emptySlots.length).toBe(8); // 4 wall + 4 floor
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
    // simple-poster is placed, small-plant is unplaced
    expect(screen.getByText("Small Plant")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/room-editor.test.tsx`
Expected: FAIL

- [ ] **Step 3: Create room editor component**

```tsx
// components/room-editor.tsx
"use client";

import { useState } from "react";
import { getDecoration } from "@/lib/decoration-catalog";
import type { RoomPlacements } from "@/lib/economy-types";

const ALL_SLOTS = [
  "wall-1", "wall-2", "wall-3", "wall-4",
  "floor-1", "floor-2", "floor-3", "floor-4",
] as const;

const SLOT_POSITIONS: Record<string, React.CSSProperties> = {
  "wall-1": { position: "absolute", top: "8%", left: "8%" },
  "wall-2": { position: "absolute", top: "8%", left: "75%" },
  "wall-3": { position: "absolute", top: "30%", left: "5%" },
  "wall-4": { position: "absolute", top: "30%", left: "80%" },
  "floor-1": { position: "absolute", bottom: "8%", left: "5%" },
  "floor-2": { position: "absolute", bottom: "8%", left: "75%" },
  "floor-3": { position: "absolute", bottom: "28%", left: "10%" },
  "floor-4": { position: "absolute", bottom: "28%", left: "72%" },
};

type RoomEditorProps = {
  placements: RoomPlacements["placements"];
  purchased: string[];
  onPlace: (slotId: string, itemId: string) => void;
  onRemove: (slotId: string) => void;
};

export function RoomEditor({ placements, purchased, onPlace, onRemove }: RoomEditorProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const placedItemIds = new Set(Object.values(placements));
  const unplacedItems = purchased
    .filter((id) => !placedItemIds.has(id))
    .map((id) => getDecoration(id))
    .filter(Boolean);

  function handleSlotClick(slotId: string) {
    const currentItem = placements[slotId];
    if (currentItem) {
      onRemove(slotId);
      return;
    }
    if (selectedItem) {
      onPlace(slotId, selectedItem);
      setSelectedItem(null);
    }
  }

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {/* Room with slots */}
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
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60%", background: "var(--wall)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "var(--floor)", borderTop: "2px solid var(--border)" }} />

        {ALL_SLOTS.map((slotId) => {
          const itemId = placements[slotId];
          const decoration = itemId ? getDecoration(itemId) : null;
          const pos = SLOT_POSITIONS[slotId];

          return (
            <button
              key={slotId}
              type="button"
              aria-label={decoration ? `${decoration.name} in ${slotId} — click to remove` : `Empty slot ${slotId} — select an item then click to place`}
              onClick={() => handleSlotClick(slotId)}
              style={{
                ...pos,
                width: 48,
                height: 48,
                borderRadius: 10,
                border: decoration ? "2px solid var(--accent)" : "2px dashed var(--border)",
                background: decoration ? "rgba(29, 90, 93, 0.08)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                cursor: "pointer",
                zIndex: 5,
              }}
            >
              {decoration ? decoration.emoji : ""}
            </button>
          );
        })}
      </div>

      {/* Inventory bar */}
      <div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          {selectedItem ? "Now click a slot to place it" : "Select an item to place"}
        </p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {unplacedItems.map((item) => (
            <button
              key={item!.id}
              type="button"
              onClick={() => setSelectedItem(item!.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: selectedItem === item!.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                background: selectedItem === item!.id ? "var(--pill-bg)" : "var(--card)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 24 }}>{item!.emoji}</span>
              <span style={{ fontSize: 11, whiteSpace: "nowrap" }}>{item!.name}</span>
            </button>
          ))}
          {unplacedItems.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>No unplaced items. Visit the shop!</p>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/room-editor.test.tsx`
Expected: All 2 tests PASS

- [ ] **Step 5: Commit**

```bash
git add components/room-editor.tsx tests/unit/room-editor.test.tsx
git commit -m "feat: add room editor component with slot-based decoration placement"
```

---

### Task 14: Break Timer Component

**Files:**
- Create: `components/break-timer.tsx`
- Modify: `lib/sounds.ts` (add break-end alias)
- Test: `tests/unit/break-timer.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// tests/unit/break-timer.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreakTimer } from "@/components/break-timer";

describe("BreakTimer", () => {
  it("renders break time message", () => {
    render(
      <BreakTimer
        durationMinutes={5}
        onBreakEnd={vi.fn()}
        onSkip={vi.fn()}
        breakEndChime={true}
      />,
    );
    expect(screen.getByText(/break time/i)).toBeInTheDocument();
  });

  it("shows skip button", () => {
    render(
      <BreakTimer
        durationMinutes={5}
        onBreakEnd={vi.fn()}
        onSkip={vi.fn()}
        breakEndChime={true}
      />,
    );
    expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/break-timer.test.tsx`
Expected: FAIL

- [ ] **Step 3: Add break-end sound alias to sounds.ts**

In `lib/sounds.ts`, add after the `SOUND_MAP` definition:

```ts
export function playBreakEndChime() {
  playFairyFountain();
}
```

- [ ] **Step 4: Create break timer component**

```tsx
// components/break-timer.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playBreakEndChime } from "@/lib/sounds";

type BreakTimerProps = {
  durationMinutes: number;
  onBreakEnd: () => void;
  onSkip: () => void;
  breakEndChime: boolean;
};

function formatBreakTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function BreakTimer({ durationMinutes, onBreakEnd, onSkip, breakEndChime }: BreakTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const onBreakEndRef = useRef(onBreakEnd);
  onBreakEndRef.current = onBreakEnd;

  const handleEnd = useCallback(() => {
    if (breakEndChime) {
      playBreakEndChime();
    }
    onBreakEndRef.current();
  }, [breakEndChime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleEnd]);

  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      <p style={{ fontSize: 14, color: "var(--accent)", fontWeight: 600, marginBottom: 8 }}>
        Break time! Browse the shop while you rest.
      </p>
      <p style={{ fontSize: 32, fontWeight: 300, color: "var(--text)", letterSpacing: 2 }}>
        {formatBreakTime(secondsRemaining)}
      </p>
      <button
        type="button"
        className="secondary-button"
        onClick={onSkip}
        aria-label="Skip break"
        style={{ marginTop: 12 }}
      >
        Skip Break
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/break-timer.test.tsx`
Expected: All 2 tests PASS

- [ ] **Step 6: Commit**

```bash
git add components/break-timer.tsx lib/sounds.ts tests/unit/break-timer.test.tsx
git commit -m "feat: add break timer component with auto shop redirect"
```

---

### Task 15: Integrate Everything into TrackerShell

**Files:**
- Modify: `components/tracker-shell.tsx` (major rewrite)
- Modify: `components/focus-timer.tsx` (integrate Bean, lo-fi, currency earn, break)
- Modify: `components/settings-panel.tsx` (add new settings)
- Modify: `app/page.tsx` (pass economy data)

- [ ] **Step 1: Update TrackerShell to use tab navigation**

Rewrite `components/tracker-shell.tsx` to use bottom nav with tab switching:

```tsx
// components/tracker-shell.tsx
"use client";

import { useState } from "react";
import { logoutTracker } from "@/app/actions/auth";
import { FocusTimer } from "@/components/focus-timer";
import { SettingsPanel } from "@/components/settings-panel";
import { StatsOverview } from "@/components/stats-overview";
import { SyncButton } from "@/components/sync-button";
import { ShopPanel } from "@/components/shop-panel";
import { RoomEditor } from "@/components/room-editor";
import { BottomNav, type TabId } from "@/components/bottom-nav";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";
import type { Wallet, Inventory, RoomPlacements } from "@/lib/economy-types";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type TrackerShellProps = {
  snapshot: TrackerSnapshot;
};

export function TrackerShell({ snapshot }: TrackerShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>("focus");
  const [wallet, setWallet] = useState<Wallet>(snapshot.economy.wallet);
  const [inventory, setInventory] = useState<Inventory>(snapshot.economy.inventory);
  const [room, setRoom] = useState<RoomPlacements>(snapshot.economy.room);

  const statisticsCards = [
    {
      label: "today",
      value: `${snapshot.focus.todayMinutes}m`,
      detail: `${snapshot.focus.todaySessions} focus sessions`,
    },
    {
      label: "this week",
      value: `${snapshot.focus.weeklyMinutes}m`,
      detail: `${snapshot.insights.goalProgress[0]?.percent ?? 0}% of ${snapshot.settings.weeklyFocusGoalMinutes}m goal`,
    },
  ];

  async function handlePurchase(itemId: string) {
    const response = await fetch("/api/economy/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setWallet(data.wallet);
    setInventory(data.inventory);
  }

  async function handlePlace(slotId: string, itemId: string) {
    const response = await fetch("/api/economy/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, itemId }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setRoom(data.room);
  }

  async function handleRemove(slotId: string) {
    const response = await fetch("/api/economy/place", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setRoom(data.room);
  }

  function handleSocksEarned(amount: number) {
    setWallet((prev) => ({
      socks: prev.socks + amount,
      totalEarned: prev.totalEarned + amount,
    }));
  }

  function handleNavigateToShop() {
    setActiveTab("shop");
  }

  return (
    <div className="hub-shell">
      {/* Top bar */}
      <header className="hub-topbar">
        {snapshot.topMetrics.map((metric) => (
          <article key={metric.label} className={`metric-pill tone-${metric.tone}`}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
        <article className="metric-pill tone-emerald">
          <strong>🧦 {wallet.socks}</strong>
          <span>socks</span>
        </article>
      </header>

      {/* Main content area */}
      <main className="hub-main">
        {activeTab === "focus" && (
          <section className="hub-focus-column">
            <FocusTimer
              todayMinutes={snapshot.focus.todayMinutes}
              todaySessions={snapshot.focus.todaySessions}
              weeklyMinutes={snapshot.focus.weeklyMinutes}
              weeklyGoalMinutes={snapshot.settings.weeklyFocusGoalMinutes}
              presets={snapshot.settings.focusPresets}
              completionSound={snapshot.settings.completionSound}
              ambientMusic={snapshot.settings.ambientMusic}
              breakDurationMinutes={snapshot.settings.breakDurationMinutes}
              breakEndChime={snapshot.settings.breakEndChime}
              placements={room.placements}
              onSocksEarned={handleSocksEarned}
              onNavigateToShop={handleNavigateToShop}
            />
          </section>
        )}

        {activeTab === "room" && (
          <section className="hub-focus-column">
            <RoomEditor
              placements={room.placements}
              purchased={inventory.purchased}
              onPlace={handlePlace}
              onRemove={handleRemove}
            />
          </section>
        )}

        {activeTab === "shop" && (
          <section className="hub-focus-column">
            <ShopPanel
              socks={wallet.socks}
              purchased={inventory.purchased}
              onPurchase={handlePurchase}
            />
          </section>
        )}

        {activeTab === "stats" && (
          <section className="hub-focus-column">
            <StatsOverview cards={statisticsCards} />
            <SyncButton />
          </section>
        )}

        {activeTab === "settings" && (
          <section className="hub-focus-column">
            <SettingsPanel settings={snapshot.settings} />
          </section>
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logoutTracker}
      />
    </div>
  );
}
```

- [ ] **Step 2: Update FocusTimer to integrate Bean, lo-fi, break, and currency**

This is the largest component change. Key modifications to `components/focus-timer.tsx`:

1. Add new props: `ambientMusic`, `breakDurationMinutes`, `breakEndChime`, `placements`, `onSocksEarned`, `onNavigateToShop`
2. Add Bean state tracking: `beanState` derived from `status`
3. Add lo-fi player: create on mount, start/stop with session
4. Add break timer state: `isOnBreak` flag after session completion
5. Wrap timer display inside `<RoomView>` component
6. Add `<MuteButton>` during sessions
7. After save completes, award socks via `POST /api/economy/earn` and show celebrating Bean

The critical state mapping:
- `status === "idle"` → `beanState = "idle"`
- `status === "running"` → `beanState = "focusing"`
- Session just completed → `beanState = "celebrating"` for 3 seconds, then → break
- User clicks Stop while paused → `beanState = "sad"` for 2 seconds, then → idle
- `isOnBreak === true` → show `<BreakTimer>`, auto-navigate to shop

Add these imports to the top:

```ts
import { RoomView } from "@/components/room-view";
import { MuteButton } from "@/components/mute-button";
import { BreakTimer } from "@/components/break-timer";
import { createLofiPlayer } from "@/lib/lofi";
import type { BeanState } from "@/components/bean";
import type { RoomPlacements } from "@/lib/economy-types";
```

Add new props to `FocusTimerProps`:

```ts
type FocusTimerProps = {
  todayMinutes: number;
  todaySessions: number;
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  presets: TrackerSettings["focusPresets"];
  completionSound: string;
  ambientMusic: boolean;
  breakDurationMinutes: number;
  breakEndChime: boolean;
  placements: RoomPlacements["placements"];
  onSocksEarned: (amount: number) => void;
  onNavigateToShop: () => void;
};
```

Add new state variables inside the component:

```ts
  const [beanState, setBeanState] = useState<BeanState>("idle");
  const [socksJustEarned, setSocksJustEarned] = useState<number | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const lofiPlayerRef = useRef<ReturnType<typeof createLofiPlayer> | null>(null);
```

Add lo-fi lifecycle: start when session starts + not muted, stop when paused/ended/muted:

```ts
  useEffect(() => {
    if (status === "running" && ambientMusic && !isMuted) {
      if (!lofiPlayerRef.current) {
        lofiPlayerRef.current = createLofiPlayer();
      }
      lofiPlayerRef.current.start();
    } else {
      lofiPlayerRef.current?.stop();
    }
    return () => { lofiPlayerRef.current?.stop(); };
  }, [status, ambientMusic, isMuted]);
```

Modify `saveSession` success handler to add celebration + socks + break flow:

```ts
  // After successful save (inside saveSession callback, after setStatus("idle")):
  const earnedAmount = completedFullSession ? durationMinutes : Math.max(1, elapsedMinutes);
  setBeanState("celebrating");
  setSocksJustEarned(earnedAmount);
  onSocksEarned(earnedAmount);
  void fetch("/api/economy/earn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: earnedAmount }),
  });
  setTimeout(() => {
    setBeanState("idle");
    setSocksJustEarned(null);
    setIsOnBreak(true);
    onNavigateToShop();
  }, 3000);
```

Modify the Reset/cancel button handler to trigger sad state:

```ts
  // On cancel/reset:
  setBeanState("sad");
  setTimeout(() => setBeanState("idle"), 2000);
```

Sync `beanState` with `status` for running/paused:

```ts
  useEffect(() => {
    if (status === "running") setBeanState("focusing");
    else if (status === "idle" && beanState !== "celebrating" && beanState !== "sad") setBeanState("idle");
  }, [status]);
```

Replace the `<div className="focus-ring">...</div>` block with:

```tsx
  <RoomView beanState={beanState} socksEarned={socksJustEarned ?? undefined} placements={placements}>
    <div className="timer-display" style={{ color: "var(--accent)" }}>
      {formatSeconds(secondsRemaining)}
    </div>
  </RoomView>
  {status === "running" && (
    <MuteButton muted={isMuted} onToggle={() => setIsMuted((prev) => !prev)} />
  )}
```

Add break timer rendering after timer-actions:

```tsx
  {isOnBreak && (
    <BreakTimer
      durationMinutes={breakDurationMinutes}
      onBreakEnd={() => setIsOnBreak(false)}
      onSkip={() => setIsOnBreak(false)}
      breakEndChime={breakEndChime}
    />
  )}
```

- [ ] **Step 3: Update settings panel with new options**

Add to `components/settings-panel.tsx` after the completion sound section:

```tsx
      <div className="panel-form-grid">
        <label className="field">
          <span>Ambient music during focus</span>
          <select
            value={settings.ambientMusic ? "on" : "off"}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                ambientMusic: event.target.value === "on",
              }))
            }
          >
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label className="field">
          <span>Break duration (minutes)</span>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.breakDurationMinutes}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                breakDurationMinutes: Number(event.target.value),
              }))
            }
          />
        </label>
      </div>

      <div className="panel-form-grid">
        <label className="field">
          <span>Break-end chime</span>
          <select
            value={settings.breakEndChime ? "on" : "off"}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                breakEndChime: event.target.value === "on",
              }))
            }
          >
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </label>
      </div>
```

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS (existing tests may need minor adjustments for new required props in FocusTimer)

- [ ] **Step 5: Fix any failing tests by adding default props**

If `tests/unit/focus-timer.test.tsx` or `tests/unit/smoke.test.tsx` fail due to missing new props, add the new props with defaults in the test renders:

```tsx
  ambientMusic={false}
  breakDurationMinutes={5}
  breakEndChime={false}
  placements={{}}
  onSocksEarned={() => {}}
  onNavigateToShop={() => {}}
```

- [ ] **Step 6: Verify the app builds and renders**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add components/tracker-shell.tsx components/focus-timer.tsx components/settings-panel.tsx app/page.tsx
git commit -m "feat: integrate Bean, room, shop, break timer, lo-fi into main app flow"
```

---

### Task 16: Final Verification and Cleanup

**Files:**
- Possibly modify: any files with TypeScript errors or test failures

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Run build**

Run: `npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Manual smoke test**

Start the dev server:
Run: `npx next dev`

Verify:
1. App loads with warm cozy light theme
2. Bean is visible in idle state, bobbing gently
3. Starting a focus session: Bean turns away, knitting animation plays, lo-fi music starts
4. Mute button toggles music
5. Timer countdown works, browser tab title updates
6. Completing a session: completion chime plays, Bean celebrates, socks awarded
7. Break timer starts, shop tab opens automatically
8. Shop shows decorations, can purchase with socks
9. Room tab shows slots, can place purchased decorations
10. Settings tab has new ambient music, break duration, break-end chime options
11. Stats tab shows existing statistics
12. Bottom nav switches between all 5 tabs

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address integration issues from final verification"
```

- [ ] **Step 6: Add .superpowers to .gitignore if not already present**

Check if `.superpowers/` is in `.gitignore`. If not:

```bash
echo ".superpowers/" >> .gitignore
git add .gitignore
git commit -m "chore: add .superpowers to gitignore"
```
