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

    CREATE TABLE IF NOT EXISTS room_state (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      selected_room TEXT NOT NULL DEFAULT 'basic'
    );

    CREATE TABLE IF NOT EXISTS unlocked_rooms (
      room_id TEXT PRIMARY KEY
    );
  `);

  // Seed wallet row if empty
  const walletRow = db.prepare("SELECT id FROM wallet WHERE id = 1").get();
  if (!walletRow) {
    db.prepare("INSERT INTO wallet (id, socks, total_earned) VALUES (1, 0, 0)").run();
  }

  // Seed room state if empty
  const roomStateRow = db.prepare("SELECT id FROM room_state WHERE id = 1").get();
  if (!roomStateRow) {
    db.prepare("INSERT INTO room_state (id, selected_room) VALUES (1, 'basic')").run();
    db.prepare("INSERT OR IGNORE INTO unlocked_rooms (room_id) VALUES ('basic')").run();
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

export function resetDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
