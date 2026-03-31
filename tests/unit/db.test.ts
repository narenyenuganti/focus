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

  const sessions = db.prepare("SELECT * FROM focus_sessions").all() as {
    id: string;
    started_at: string;
    duration_minutes: number;
  }[];
  expect(sessions).toHaveLength(1);
  expect(sessions[0].id).toBe("s1");
  expect(sessions[0].duration_minutes).toBe(25);

  const wallet = db.prepare("SELECT socks, total_earned FROM wallet WHERE id = 1").get() as {
    socks: number;
    total_earned: number;
  };
  expect(wallet.socks).toBe(10);
  expect(wallet.total_earned).toBe(15);

  const items = db.prepare("SELECT item_id FROM inventory ORDER BY item_id").all() as {
    item_id: string;
  }[];
  expect(items.map((i) => i.item_id)).toEqual(["poster-cat", "rug-green"]);

  const placements = db.prepare("SELECT slot_id, item_id FROM room_placements").all() as {
    slot_id: string;
    item_id: string;
  }[];
  expect(placements).toEqual([{ slot_id: "slot-wall-1", item_id: "poster-cat" }]);

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

test("focus_sessions insert and retrieval", () => {
  const db = createDb(path.join(tmpDir, "tracker.db"));

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

test("earnSocks increments wallet", () => {
  const db = createDb(path.join(tmpDir, "tracker.db"));

  db.prepare("UPDATE wallet SET socks = 5, total_earned = 5 WHERE id = 1").run();
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
