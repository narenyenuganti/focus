import { rmSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb, resetDb } from "@/lib/server/db";
import {
  readWallet,
  earnSocks,
  readInventory,
  addToInventory,
  readRoomPlacements,
  placeDecoration,
  removeDecoration,
  purchaseDecoration,
} from "@/lib/server/economy";

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(path.join(tmpdir(), "economy-test-"));
  vi.stubEnv("TRACKER_DATA_DIR", tmpDir);
  resetDb();
});

afterEach(() => {
  resetDb();
  vi.unstubAllEnvs();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("readWallet", () => {
  it("returns default wallet when no data", () => {
    const wallet = readWallet();
    expect(wallet).toEqual({ socks: 0, totalEarned: 0 });
  });

  it("reads wallet after update", () => {
    const db = getDb();
    db.prepare("UPDATE wallet SET socks = 150, total_earned = 300 WHERE id = 1").run();
    const wallet = readWallet();
    expect(wallet).toEqual({ socks: 150, totalEarned: 300 });
  });
});

describe("earnSocks", () => {
  it("adds socks to wallet and increments totalEarned", () => {
    const db = getDb();
    db.prepare("UPDATE wallet SET socks = 100, total_earned = 200 WHERE id = 1").run();
    const wallet = earnSocks(25);
    expect(wallet).toEqual({ socks: 125, totalEarned: 225 });
  });

  it("rejects zero or negative amounts", () => {
    expect(() => earnSocks(0)).toThrow();
    expect(() => earnSocks(-5)).toThrow();
  });
});

describe("readInventory", () => {
  it("returns empty array when no items", () => {
    const inventory = readInventory();
    expect(inventory).toEqual({ purchased: [] });
  });
});

describe("addToInventory", () => {
  it("appends item id to purchased list", () => {
    const db = getDb();
    db.prepare("INSERT INTO inventory (item_id) VALUES (?)").run("small-plant");
    const inventory = addToInventory("basic-rug");
    expect(inventory.purchased).toContain("small-plant");
    expect(inventory.purchased).toContain("basic-rug");
  });

  it("does not add duplicate items", () => {
    const db = getDb();
    db.prepare("INSERT INTO inventory (item_id) VALUES (?)").run("small-plant");
    const inventory = addToInventory("small-plant");
    expect(inventory.purchased).toEqual(["small-plant"]);
  });
});

describe("readRoomPlacements", () => {
  it("returns empty placements when none exist", () => {
    const room = readRoomPlacements();
    expect(room).toEqual({ placements: {} });
  });
});

describe("placeDecoration", () => {
  it("places a decoration in a slot", () => {
    const room = placeDecoration("wall-1", "simple-poster");
    expect(room.placements["wall-1"]).toBe("simple-poster");
  });

  it("replaces existing decoration in slot", () => {
    placeDecoration("wall-1", "simple-poster");
    const room = placeDecoration("wall-1", "large-painting");
    expect(room.placements["wall-1"]).toBe("large-painting");
  });
});

describe("removeDecoration", () => {
  it("removes a decoration from a slot", () => {
    placeDecoration("wall-1", "simple-poster");
    const room = removeDecoration("wall-1");
    expect(room.placements["wall-1"]).toBeUndefined();
  });
});

describe("purchaseDecoration", () => {
  it("deducts socks and adds to inventory", () => {
    const db = getDb();
    db.prepare("UPDATE wallet SET socks = 200, total_earned = 400 WHERE id = 1").run();
    const result = purchaseDecoration("small-plant", 50);
    expect(result.wallet.socks).toBe(150);
    expect(result.inventory.purchased).toContain("small-plant");
  });

  it("rejects purchase when insufficient socks", () => {
    const db = getDb();
    db.prepare("UPDATE wallet SET socks = 10, total_earned = 10 WHERE id = 1").run();
    expect(() => purchaseDecoration("small-plant", 50)).toThrow("Insufficient socks");
  });

  it("rejects purchase of already owned item", () => {
    const db = getDb();
    db.prepare("UPDATE wallet SET socks = 200, total_earned = 400 WHERE id = 1").run();
    db.prepare("INSERT INTO inventory (item_id) VALUES (?)").run("small-plant");
    expect(() => purchaseDecoration("small-plant", 50)).toThrow("Already owned");
  });
});
