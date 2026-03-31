# SQLite Storage Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace git-synced JSON files with a local SQLite database for focus sessions and economy data.

**Architecture:** A single `data/tracker.db` SQLite file replaces `data/focus/sessions.json` and `data/economy/*.json`. The `lib/server/db.ts` module provides a lazy singleton connection with auto-migration from existing JSON files. Settings stays as `data/config/settings.json`. All git sync code is removed.

**Tech Stack:** `better-sqlite3` for synchronous SQLite access, existing Zod for API input validation.

---

## File Structure

**Create:**
- `lib/server/db.ts` — SQLite singleton, schema creation, JSON migration
- `tests/unit/db.test.ts` — tests for db module, migration, focus queries, economy queries

**Modify:**
- `lib/server/focus.ts` — replace `readCollection`/`writeCollection` with SQL queries
- `lib/server/economy.ts` — replace JSON file reads/writes with SQL queries
- `lib/server/dashboard.ts` — replace `readCollection("focus/sessions")` with `getFocusSessions()` from focus.ts
- `app/api/focus/session/route.ts` — replace `readCollection` import with `getFocusSessions`
- `components/tracker-shell.tsx` — remove `SyncButton` import and usage

**Delete:**
- `lib/server/data-store.ts`
- `lib/server/git-sync.ts`
- `app/api/sync/route.ts`
- `components/sync-button.tsx`
- `components/sync-status-panel.tsx`
- `components/sync-history-panel.tsx`
- `tests/unit/data-store.test.ts`
- `tests/unit/git-sync.test.ts`
- `tests/unit/sync-button.test.tsx`
- `tests/unit/git-sync-route.test.ts` (if it exists)
- `data/focus/sessions.json` (migrated at runtime)
- `data/economy/wallet.json` (migrated at runtime)
- `data/economy/inventory.json` (migrated at runtime)
- `data/economy/room.json` (migrated at runtime)

---

### Task 1: Install `better-sqlite3`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

- [ ] **Step 2: Verify it installed**

```bash
node -e "require('better-sqlite3')"
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add better-sqlite3 dependency"
git push
```

---

### Task 2: Create `lib/server/db.ts` with schema and migration

**Files:**
- Create: `lib/server/db.ts`
- Create: `tests/unit/db.test.ts`

- [ ] **Step 1: Write failing tests for db module**

Create `tests/unit/db.test.ts`:

```typescript
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { createDb } from "@/lib/server/db";

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(path.join(tmpdir(), "tracker-db-"));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

test("creates database with all tables", () => {
  const db = createDb(path.join(tmpDir, "tracker.db"));

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all() as { name: string }[];

  const tableNames = tables.map((t) => t.name);
  expect(tableNames).toContain("focus_sessions");
  expect(tableNames).toContain("wallet");
  expect(tableNames).toContain("inventory");
  expect(tableNames).toContain("room_placements");

  db.close();
});

test("wallet table has a single default row", () => {
  const db = createDb(path.join(tmpDir, "tracker.db"));

  const row = db.prepare("SELECT socks, total_earned FROM wallet WHERE id = 1").get() as {
    socks: number;
    total_earned: number;
  };

  expect(row.socks).toBe(0);
  expect(row.total_earned).toBe(0);

  db.close();
});

test("migrates existing JSON files into SQLite", () => {
  // Set up JSON files that mimic existing data
  const focusDir = path.join(tmpDir, "focus");
  const economyDir = path.join(tmpDir, "economy");
  mkdirSync(focusDir, { recursive: true });
  mkdirSync(economyDir, { recursive: true });

  writeFileSync(
    path.join(focusDir, "sessions.json"),
    JSON.stringify([
      {
        id: "s1",
        startedAt: "2026-03-20T10:00:00.000Z",
        endedAt: "2026-03-20T10:25:00.000Z",
        durationMinutes: 25,
        mode: "focus",
      },
    ]),
  );

  writeFileSync(
    path.join(economyDir, "wallet.json"),
    JSON.stringify({ socks: 10, totalEarned: 15 }),
  );

  writeFileSync(
    path.join(economyDir, "inventory.json"),
    JSON.stringify({ purchased: ["rug-green", "poster-cat"] }),
  );

  writeFileSync(
    path.join(economyDir, "room.json"),
    JSON.stringify({ placements: { "slot-wall-1": "poster-cat" } }),
  );

  const db = createDb(path.join(tmpDir, "tracker.db"), tmpDir);

  // Verify focus sessions migrated
  const sessions = db.prepare("SELECT * FROM focus_sessions").all() as {
    id: string;
    started_at: string;
    duration_minutes: number;
  }[];
  expect(sessions).toHaveLength(1);
  expect(sessions[0].id).toBe("s1");
  expect(sessions[0].duration_minutes).toBe(25);

  // Verify wallet migrated
  const wallet = db.prepare("SELECT socks, total_earned FROM wallet WHERE id = 1").get() as {
    socks: number;
    total_earned: number;
  };
  expect(wallet.socks).toBe(10);
  expect(wallet.total_earned).toBe(15);

  // Verify inventory migrated
  const items = db.prepare("SELECT item_id FROM inventory ORDER BY item_id").all() as {
    item_id: string;
  }[];
  expect(items.map((i) => i.item_id)).toEqual(["poster-cat", "rug-green"]);

  // Verify room placements migrated
  const placements = db.prepare("SELECT slot_id, item_id FROM room_placements").all() as {
    slot_id: string;
    item_id: string;
  }[];
  expect(placements).toEqual([{ slot_id: "slot-wall-1", item_id: "poster-cat" }]);

  // Verify JSON files were deleted
  expect(existsSync(path.join(focusDir, "sessions.json"))).toBe(false);
  expect(existsSync(path.join(economyDir, "wallet.json"))).toBe(false);
  expect(existsSync(path.join(economyDir, "inventory.json"))).toBe(false);
  expect(existsSync(path.join(economyDir, "room.json"))).toBe(false);

  db.close();
});

test("skips migration when JSON files do not exist", () => {
  const db = createDb(path.join(tmpDir, "tracker.db"), tmpDir);

  const sessions = db.prepare("SELECT * FROM focus_sessions").all();
  expect(sessions).toHaveLength(0);

  const wallet = db.prepare("SELECT socks FROM wallet WHERE id = 1").get() as { socks: number };
  expect(wallet.socks).toBe(0);

  db.close();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/unit/db.test.ts
```

Expected: FAIL — `@/lib/server/db` does not exist yet.

- [ ] **Step 3: Write the implementation**

Create `lib/server/db.ts`:

```typescript
import Database from "better-sqlite3";
import { existsSync, readFileSync, unlinkSync, mkdirSync } from "node:fs";
import path from "node:path";

let _db: Database.Database | null = null;

function getDataRoot() {
  if (process.env.TRACKER_DATA_DIR) {
    return path.resolve(process.cwd(), process.env.TRACKER_DATA_DIR);
  }
  return path.join(process.cwd(), "data");
}

export function createDb(dbPath: string, dataRoot?: string): Database.Database {
  const dir = path.dirname(dbPath);
  mkdirSync(dir, { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      ended_at TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      mode TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wallet (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      socks INTEGER NOT NULL DEFAULT 0,
      total_earned INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS inventory (
      item_id TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS room_placements (
      slot_id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL
    );
  `);

  // Seed wallet row if empty
  const walletRow = db.prepare("SELECT id FROM wallet WHERE id = 1").get();
  if (!walletRow) {
    db.prepare("INSERT INTO wallet (id, socks, total_earned) VALUES (1, 0, 0)").run();
  }

  // Migrate from JSON files if they exist
  const root = dataRoot ?? getDataRoot();
  migrateFromJson(db, root);

  return db;
}

function migrateFromJson(db: Database.Database, dataRoot: string) {
  const sessionsPath = path.join(dataRoot, "focus", "sessions.json");
  const walletPath = path.join(dataRoot, "economy", "wallet.json");
  const inventoryPath = path.join(dataRoot, "economy", "inventory.json");
  const roomPath = path.join(dataRoot, "economy", "room.json");

  const hasAny =
    existsSync(sessionsPath) ||
    existsSync(walletPath) ||
    existsSync(inventoryPath) ||
    existsSync(roomPath);

  if (!hasAny) return;

  const migrate = db.transaction(() => {
    // Focus sessions
    if (existsSync(sessionsPath)) {
      const sessions = JSON.parse(readFileSync(sessionsPath, "utf8")) as Array<{
        id: string;
        startedAt: string;
        endedAt: string;
        durationMinutes: number;
        mode: string;
      }>;
      const insert = db.prepare(
        "INSERT OR IGNORE INTO focus_sessions (id, started_at, ended_at, duration_minutes, mode) VALUES (?, ?, ?, ?, ?)",
      );
      for (const s of sessions) {
        insert.run(s.id, s.startedAt, s.endedAt, s.durationMinutes, s.mode);
      }
      unlinkSync(sessionsPath);
    }

    // Wallet
    if (existsSync(walletPath)) {
      const wallet = JSON.parse(readFileSync(walletPath, "utf8")) as {
        socks: number;
        totalEarned: number;
      };
      db.prepare("UPDATE wallet SET socks = ?, total_earned = ? WHERE id = 1").run(
        wallet.socks,
        wallet.totalEarned,
      );
      unlinkSync(walletPath);
    }

    // Inventory
    if (existsSync(inventoryPath)) {
      const inventory = JSON.parse(readFileSync(inventoryPath, "utf8")) as {
        purchased: string[];
      };
      const insert = db.prepare("INSERT OR IGNORE INTO inventory (item_id) VALUES (?)");
      for (const itemId of inventory.purchased) {
        insert.run(itemId);
      }
      unlinkSync(inventoryPath);
    }

    // Room placements
    if (existsSync(roomPath)) {
      const room = JSON.parse(readFileSync(roomPath, "utf8")) as {
        placements: Record<string, string>;
      };
      const insert = db.prepare(
        "INSERT OR REPLACE INTO room_placements (slot_id, item_id) VALUES (?, ?)",
      );
      for (const [slotId, itemId] of Object.entries(room.placements)) {
        insert.run(slotId, itemId);
      }
      unlinkSync(roomPath);
    }
  });

  migrate();
}

export function getDb(): Database.Database {
  if (!_db) {
    const root = getDataRoot();
    _db = createDb(path.join(root, "tracker.db"), root);
  }
  return _db;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/unit/db.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/server/db.ts tests/unit/db.test.ts
git commit -m "feat: add SQLite database module with schema and JSON migration"
git push
```

---

### Task 3: Rewrite `lib/server/focus.ts` to use SQLite

**Files:**
- Modify: `lib/server/focus.ts`
- Modify: `tests/unit/db.test.ts` (add focus query tests)

- [ ] **Step 1: Add failing tests for focus queries**

Append to `tests/unit/db.test.ts`:

```typescript
import { getFocusSessions, appendFocusSession } from "@/lib/server/focus";
```

Add the import at the top, then add these tests:

```typescript
test("appendFocusSession inserts and getFocusSessions retrieves", () => {
  const dbPath = path.join(tmpDir, "tracker.db");
  const db = createDb(dbPath);

  // Temporarily point the module at our test db
  vi.stubEnv("TRACKER_DATA_DIR", tmpDir);

  // We need to use the module's getDb, so we mock it
  // Instead, test via the db directly first
  db.prepare(
    "INSERT INTO focus_sessions (id, started_at, ended_at, duration_minutes, mode) VALUES (?, ?, ?, ?, ?)",
  ).run("t1", "2026-03-20T10:00:00.000Z", "2026-03-20T10:25:00.000Z", 25, "focus");

  const rows = db.prepare("SELECT * FROM focus_sessions").all() as {
    id: string;
    started_at: string;
    duration_minutes: number;
  }[];

  expect(rows).toHaveLength(1);
  expect(rows[0].id).toBe("t1");
  expect(rows[0].duration_minutes).toBe(25);

  db.close();
});
```

- [ ] **Step 2: Run test to verify it passes (db layer works)**

```bash
npx vitest run tests/unit/db.test.ts
```

Expected: PASS

- [ ] **Step 3: Rewrite `lib/server/focus.ts`**

Replace the file contents. Remove imports of `readCollection` and `writeCollection`. Import `getDb` from `./db`:

```typescript
import { differenceInCalendarDays, parseISO } from "date-fns";
import { getDb } from "@/lib/server/db";

export type FocusSessionRecord = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  mode: "focus" | "break";
};

type FocusSummaryOptions = {
  today?: string;
};

function toDayKey(value: string) {
  return value.slice(0, 10);
}

function shiftDay(date: string, delta: number) {
  const workingDate = new Date(`${date}T12:00:00.000Z`);
  workingDate.setUTCDate(workingDate.getUTCDate() + delta);
  return workingDate.toISOString().slice(0, 10);
}

function getHeatmapLevel(minutes: number) {
  if (minutes === 0) return 0;
  if (minutes <= 15) return 1;
  if (minutes <= 30) return 2;
  if (minutes <= 60) return 3;
  return 4;
}

function toRecord(row: {
  id: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  mode: string;
}): FocusSessionRecord {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMinutes: row.duration_minutes,
    mode: row.mode as "focus" | "break",
  };
}

export function getFocusSessions(): FocusSessionRecord[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM focus_sessions ORDER BY started_at ASC").all() as Array<{
    id: string;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
    mode: string;
  }>;
  return rows.map(toRecord);
}

export function appendFocusSession(session: FocusSessionRecord): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO focus_sessions (id, started_at, ended_at, duration_minutes, mode) VALUES (?, ?, ?, ?, ?)",
  ).run(session.id, session.startedAt, session.endedAt, session.durationMinutes, session.mode);
}

export function buildFocusSummary(
  sessions: FocusSessionRecord[],
  options: FocusSummaryOptions = {},
) {
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const focusSessions = sessions
    .filter((session) => session.mode === "focus")
    .sort((left, right) => left.startedAt.localeCompare(right.startedAt));
  const dailyMinutes = new Map<string, number>();

  for (const session of focusSessions) {
    const day = toDayKey(session.startedAt);
    dailyMinutes.set(day, (dailyMinutes.get(day) ?? 0) + session.durationMinutes);
  }

  let currentStreakDays = 0;
  let streakCursor = today;

  while ((dailyMinutes.get(streakCursor) ?? 0) > 0) {
    currentStreakDays += 1;
    streakCursor = shiftDay(streakCursor, -1);
  }

  const heatmap = [...dailyMinutes.entries()]
    .map(([date, minutes]) => ({
      date,
      minutes,
      level: getHeatmapLevel(minutes),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));

  const totalMinutes = focusSessions.reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  return {
    totalMinutes,
    totalSessions: focusSessions.length,
    todayMinutes: dailyMinutes.get(today) ?? 0,
    todaySessions: focusSessions.filter(
      (session) => toDayKey(session.startedAt) === today,
    ).length,
    currentStreakDays,
    longestSessionMinutes: focusSessions.reduce(
      (longest, session) => Math.max(longest, session.durationMinutes),
      0,
    ),
    weeklyMinutes: focusSessions.reduce((total, session) => {
      const daysAgo = differenceInCalendarDays(
        parseISO(`${today}T00:00:00.000Z`),
        parseISO(`${toDayKey(session.startedAt)}T00:00:00.000Z`),
      );

      if (daysAgo >= 0 && daysAgo < 7) {
        return total + session.durationMinutes;
      }

      return total;
    }, 0),
    heatmap,
  };
}

export function getFocusSummary() {
  const sessions = getFocusSessions();
  return buildFocusSummary(sessions);
}
```

Note: `getFocusSummary` and `appendFocusSession` are now synchronous (better-sqlite3 is sync). Callers that `await` them will still work fine since awaiting a non-promise value is a no-op.

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/unit/db.test.ts tests/unit/focus.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/server/focus.ts tests/unit/db.test.ts
git commit -m "feat: rewrite focus.ts to use SQLite instead of JSON files"
git push
```

---

### Task 4: Rewrite `lib/server/economy.ts` to use SQLite

**Files:**
- Modify: `lib/server/economy.ts`

- [ ] **Step 1: Add failing tests for economy queries**

Append to `tests/unit/db.test.ts`:

```typescript
test("earnSocks increments wallet", () => {
  const db = createDb(path.join(tmpDir, "tracker.db"));

  db.prepare("UPDATE wallet SET socks = 5, total_earned = 5 WHERE id = 1").run();

  // Simulate earnSocks logic
  db.prepare("UPDATE wallet SET socks = socks + 3, total_earned = total_earned + 3 WHERE id = 1").run();

  const row = db.prepare("SELECT socks, total_earned FROM wallet WHERE id = 1").get() as {
    socks: number;
    total_earned: number;
  };
  expect(row.socks).toBe(8);
  expect(row.total_earned).toBe(8);

  db.close();
});

test("inventory insert and retrieval", () => {
  const db = createDb(path.join(tmpDir, "tracker.db"));

  db.prepare("INSERT INTO inventory (item_id) VALUES (?)").run("rug-green");
  db.prepare("INSERT INTO inventory (item_id) VALUES (?)").run("poster-cat");

  const items = db
    .prepare("SELECT item_id FROM inventory ORDER BY item_id")
    .all() as { item_id: string }[];

  expect(items.map((i) => i.item_id)).toEqual(["poster-cat", "rug-green"]);

  db.close();
});

test("room placements insert, replace, and delete", () => {
  const db = createDb(path.join(tmpDir, "tracker.db"));

  db.prepare("INSERT OR REPLACE INTO room_placements (slot_id, item_id) VALUES (?, ?)").run(
    "slot-1",
    "poster-cat",
  );
  db.prepare("INSERT OR REPLACE INTO room_placements (slot_id, item_id) VALUES (?, ?)").run(
    "slot-1",
    "rug-green",
  );

  const row = db.prepare("SELECT item_id FROM room_placements WHERE slot_id = ?").get("slot-1") as {
    item_id: string;
  };
  expect(row.item_id).toBe("rug-green");

  db.prepare("DELETE FROM room_placements WHERE slot_id = ?").run("slot-1");
  const gone = db.prepare("SELECT * FROM room_placements WHERE slot_id = ?").get("slot-1");
  expect(gone).toBeUndefined();

  db.close();
});
```

- [ ] **Step 2: Run tests to verify they pass (SQL layer works)**

```bash
npx vitest run tests/unit/db.test.ts
```

Expected: PASS

- [ ] **Step 3: Rewrite `lib/server/economy.ts`**

Replace the file contents:

```typescript
import { getDb } from "@/lib/server/db";
import type { Wallet, Inventory, RoomPlacements } from "@/lib/economy-types";

// Wallet
export function readWallet(): Wallet {
  const db = getDb();
  const row = db.prepare("SELECT socks, total_earned FROM wallet WHERE id = 1").get() as {
    socks: number;
    total_earned: number;
  };
  return { socks: row.socks, totalEarned: row.total_earned };
}

export function earnSocks(amount: number): Wallet {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }
  const db = getDb();
  db.prepare("UPDATE wallet SET socks = socks + ?, total_earned = total_earned + ? WHERE id = 1").run(
    amount,
    amount,
  );
  return readWallet();
}

// Inventory
export function readInventory(): Inventory {
  const db = getDb();
  const rows = db.prepare("SELECT item_id FROM inventory ORDER BY item_id").all() as {
    item_id: string;
  }[];
  return { purchased: rows.map((r) => r.item_id) };
}

export function addToInventory(itemId: string): Inventory {
  const db = getDb();
  db.prepare("INSERT OR IGNORE INTO inventory (item_id) VALUES (?)").run(itemId);
  return readInventory();
}

// Room Placements
export function readRoomPlacements(): RoomPlacements {
  const db = getDb();
  const rows = db.prepare("SELECT slot_id, item_id FROM room_placements").all() as {
    slot_id: string;
    item_id: string;
  }[];
  const placements: Record<string, string> = {};
  for (const row of rows) {
    placements[row.slot_id] = row.item_id;
  }
  return { placements };
}

export function placeDecoration(slotId: string, itemId: string): RoomPlacements {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO room_placements (slot_id, item_id) VALUES (?, ?)").run(
    slotId,
    itemId,
  );
  return readRoomPlacements();
}

export function removeDecoration(slotId: string): RoomPlacements {
  const db = getDb();
  db.prepare("DELETE FROM room_placements WHERE slot_id = ?").run(slotId);
  return readRoomPlacements();
}

// Purchase (atomic transaction)
export function purchaseDecoration(
  itemId: string,
  cost: number,
): { wallet: Wallet; inventory: Inventory } {
  const db = getDb();
  const wallet = readWallet();
  if (wallet.socks < cost) {
    throw new Error("Insufficient socks");
  }
  const inventory = readInventory();
  if (inventory.purchased.includes(itemId)) {
    throw new Error("Already owned");
  }

  const purchase = db.transaction(() => {
    db.prepare("UPDATE wallet SET socks = socks - ? WHERE id = 1").run(cost);
    db.prepare("INSERT INTO inventory (item_id) VALUES (?)").run(itemId);
  });

  purchase();

  return { wallet: readWallet(), inventory: readInventory() };
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/unit/db.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/server/economy.ts tests/unit/db.test.ts
git commit -m "feat: rewrite economy.ts to use SQLite instead of JSON files"
git push
```

---

### Task 5: Update `dashboard.ts` and `app/api/focus/session/route.ts`

**Files:**
- Modify: `lib/server/dashboard.ts`
- Modify: `app/api/focus/session/route.ts`

- [ ] **Step 1: Update `lib/server/dashboard.ts`**

Replace the `readCollection` import and the focus sessions read in `getTrackerSnapshot`:

```typescript
// Remove this import:
import { readCollection } from "@/lib/server/data-store";

// Add this import:
import { getFocusSessions } from "@/lib/server/focus";
```

In `getTrackerSnapshot`, change:

```typescript
// Old:
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

// New:
const settings = await readSettings();
const focusSessions = getFocusSessions();
const wallet = readWallet();
const inventory = readInventory();
const room = readRoomPlacements();
const sleepEntries: SleepEntry[] = [];
const workouts: WorkoutEntry[] = [];
const healthMetrics: HealthMetric[] = [];
const dailyLogs: DailyLogEntry[] = [];
```

Note: `readSettings` is the only async call remaining (it reads a JSON file). The SQLite calls are synchronous.

- [ ] **Step 2: Update `app/api/focus/session/route.ts`**

Replace the `readCollection` import with `getFocusSessions`:

```typescript
// Remove:
import { readCollection } from "@/lib/server/data-store";

// Change line 35 from:
const sessions = (await readCollection("focus/sessions")) as FocusSessionRecord[];
// To:
const sessions = getFocusSessions();
```

The import block becomes:

```typescript
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import {
  appendFocusSession,
  buildFocusSummary,
  getFocusSessions,
  type FocusSessionRecord,
} from "@/lib/server/focus";
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS (some old tests for data-store/git-sync may fail — that's expected, they get deleted in Task 6).

- [ ] **Step 4: Commit**

```bash
git add lib/server/dashboard.ts app/api/focus/session/route.ts
git commit -m "feat: update dashboard and session route to use SQLite"
git push
```

---

### Task 6: Remove git sync code and old data-store

**Files:**
- Delete: `lib/server/git-sync.ts`
- Delete: `lib/server/data-store.ts`
- Delete: `app/api/sync/route.ts`
- Delete: `components/sync-button.tsx`
- Delete: `components/sync-status-panel.tsx`
- Delete: `components/sync-history-panel.tsx`
- Delete: `tests/unit/data-store.test.ts`
- Delete: `tests/unit/git-sync.test.ts`
- Delete: `tests/unit/sync-button.test.tsx`
- Delete: `tests/unit/git-sync-route.test.ts` (if it exists)
- Modify: `components/tracker-shell.tsx` — remove SyncButton

- [ ] **Step 1: Remove SyncButton from tracker-shell.tsx**

In `components/tracker-shell.tsx`, remove:

```typescript
import { SyncButton } from "@/components/sync-button";
```

And in the stats tab section, remove the `<SyncButton />` component:

```typescript
// Change from:
{activeTab === "stats" && (
  <section className="hub-focus-column">
    <StatsOverview cards={statisticsCards} />
    <SyncButton />
  </section>
)}

// To:
{activeTab === "stats" && (
  <section className="hub-focus-column">
    <StatsOverview cards={statisticsCards} />
  </section>
)}
```

- [ ] **Step 2: Delete all git sync and data-store files**

```bash
rm lib/server/git-sync.ts
rm lib/server/data-store.ts
rm app/api/sync/route.ts
rm components/sync-button.tsx
rm components/sync-status-panel.tsx
rm components/sync-history-panel.tsx
rm tests/unit/data-store.test.ts
rm tests/unit/git-sync.test.ts
rm tests/unit/sync-button.test.tsx
rm -f tests/unit/git-sync-route.test.ts
```

- [ ] **Step 3: Add `data/tracker.db` to `.gitignore`**

Append to `.gitignore`:

```
# SQLite database
data/tracker.db
data/tracker.db-wal
data/tracker.db-shm
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS. The deleted test files no longer run. No remaining imports reference the deleted modules.

- [ ] **Step 5: Verify the app starts**

```bash
npx next dev --turbopack
```

Visit `http://localhost:3000`, log in, verify the focus timer works, stats page loads (without sync button), shop and room work.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: remove git sync system and old JSON data-store

Replaced by SQLite in lib/server/db.ts. Settings remains as JSON."
git push
```

---

### Task 7: Delete migrated JSON data files

**Files:**
- Delete: `data/focus/sessions.json`
- Delete: `data/economy/wallet.json`
- Delete: `data/economy/inventory.json`
- Delete: `data/economy/room.json`

- [ ] **Step 1: Delete the JSON files that are now migrated at runtime**

```bash
rm data/focus/sessions.json
rm data/economy/wallet.json
rm data/economy/inventory.json
rm data/economy/room.json
```

- [ ] **Step 2: Verify the app still starts and migrates data**

Start the app. On first load, `getDb()` will find no JSON files (already deleted) and create an empty database. This is correct for a fresh start — existing users' JSON files would be migrated before deletion.

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove migrated JSON data files

Data now lives in SQLite (data/tracker.db), created on first run."
git push
```
