# SQLite Storage Migration

Replace git-synced JSON files with a local SQLite database for focus sessions and economy data. Settings stays as a JSON file.

## Motivation

The current git-based sync (git add, commit, push on manual button click) is heavy and fragile for what is a single-user personal tracker. SQLite gives us proper transactions, queries, and a single-file database with zero external dependencies.

## What Changes

### New: `data/tracker.db`

Single SQLite database file replaces `data/focus/sessions.json` and `data/economy/*.json`.

### Database Schema

```sql
CREATE TABLE focus_sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  mode TEXT NOT NULL
);

CREATE TABLE wallet (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  socks INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE inventory (
  item_id TEXT PRIMARY KEY
);

CREATE TABLE room_placements (
  slot_id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL
);
```

Wallet is a single-row table enforced by `CHECK (id = 1)`.

### New: `lib/server/db.ts`

- Exports `getDb()` — lazy singleton that opens `data/tracker.db` via `better-sqlite3`
- On first call, runs `CREATE TABLE IF NOT EXISTS` for all tables
- Runs one-time migration: reads existing JSON files, inserts rows, deletes the JSON files
- All queries use `better-sqlite3` synchronous API (no async needed)

### Replace: `lib/server/data-store.ts`

Remove `readCollection` / `writeCollection`. Replace with typed query functions in the modules that use them.

### Replace: `lib/server/focus.ts`

Current functions stay but use SQL internally:

- `appendFocusSession(session)` — `INSERT INTO focus_sessions`
- `getFocusSessions()` — `SELECT * FROM focus_sessions`
- Aggregation helpers (`todayMinutes`, `weeklyMinutes`, etc.) can use SQL `SUM`/`WHERE` instead of in-memory reduce

### Replace: `lib/server/economy.ts`

Same function signatures, SQL underneath:

- `readWallet()` — `SELECT * FROM wallet WHERE id = 1`
- `earnSocks(amount)` — `UPDATE wallet SET socks = socks + ?, total_earned = total_earned + ?`
- `readInventory()` — `SELECT item_id FROM inventory` returning `{ purchased: string[] }`
- `addToInventory(itemId)` — `INSERT INTO inventory`
- `readRoomPlacements()` — `SELECT * FROM room_placements` returning `{ placements: Record<string, string> }`
- `placeDecoration(slotId, itemId)` — `INSERT OR REPLACE INTO room_placements`
- `removeDecoration(slotId)` — `DELETE FROM room_placements WHERE slot_id = ?`
- `purchaseDecoration(itemId, cost)` — transaction: deduct wallet + insert inventory

### Remove

- `lib/server/git-sync.ts` — no longer needed
- `app/api/sync/route.ts` — no longer needed
- `components/sync-button.tsx` — no longer needed
- References to sync in `components/stats-overview.tsx` or anywhere else
- `data/focus/sessions.json` — migrated into SQLite, then deleted
- `data/economy/wallet.json` — migrated into SQLite, then deleted
- `data/economy/inventory.json` — migrated into SQLite, then deleted
- `data/economy/room.json` — migrated into SQLite, then deleted

### Untouched

- `data/config/settings.json` — stays as JSON file, read/written whole
- `lib/server/settings.ts` — no changes
- `data/health/metrics.json`, `data/sleep/entries.json`, `data/workouts/entries.json`, `data/journal/daily.json` — stay as JSON files, untouched
- All API route signatures and response shapes
- All client components
- `getTrackerSnapshot()` return type
- Zod validation on API inputs

## Migration Strategy

On first `getDb()` call:

1. Create tables if they don't exist
2. Check if `data/focus/sessions.json` exists (migration marker)
3. If it exists, read all JSON files, insert into SQLite within a transaction
4. Delete the migrated JSON files
5. Future calls skip migration (files no longer exist)

## New Dependency

- `better-sqlite3` — synchronous SQLite bindings for Node.js
- `@types/better-sqlite3` — TypeScript types (dev dependency)

## Test Plan

- Unit test: migration reads JSON, inserts into SQLite, deletes JSON files
- Unit test: `appendFocusSession` + `getFocusSessions` round-trip
- Unit test: `earnSocks` increments wallet correctly
- Unit test: `purchaseDecoration` deducts wallet and adds to inventory atomically
- Unit test: `placeDecoration` / `removeDecoration` round-trip
- Existing API tests continue to pass (same response shapes)
- Manual: start app, verify existing data appears, verify timer still works end-to-end
