import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let rootDir: string;
let origEnv: string | undefined;

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), "economy-test-"));
  origEnv = process.env.TRACKER_DATA_DIR;
  process.env.TRACKER_DATA_DIR = path.join(rootDir, "data");
  await mkdir(path.join(rootDir, "data", "economy"), { recursive: true });
});

afterEach(async () => {
  if (origEnv === undefined) {
    delete process.env.TRACKER_DATA_DIR;
  } else {
    process.env.TRACKER_DATA_DIR = origEnv;
  }
  await rm(rootDir, { recursive: true, force: true });
});

// Dynamic import so env var is picked up
async function loadEconomy() {
  const mod = await import("@/lib/server/economy");
  return mod;
}

describe("readWallet", () => {
  it("returns default wallet when file does not exist", async () => {
    const { readWallet } = await loadEconomy();
    const wallet = await readWallet();
    expect(wallet).toEqual({ socks: 0, totalEarned: 0 });
  });

  it("parses existing wallet file", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "wallet.json"),
      JSON.stringify({ socks: 150, totalEarned: 300 }),
    );
    const { readWallet } = await loadEconomy();
    const wallet = await readWallet();
    expect(wallet).toEqual({ socks: 150, totalEarned: 300 });
  });
});

describe("earnSocks", () => {
  it("adds socks to wallet and increments totalEarned", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "wallet.json"),
      JSON.stringify({ socks: 100, totalEarned: 200 }),
    );
    const { earnSocks } = await loadEconomy();
    const wallet = await earnSocks(25);
    expect(wallet).toEqual({ socks: 125, totalEarned: 225 });
  });

  it("rejects zero or negative amounts", async () => {
    const { earnSocks } = await loadEconomy();
    await expect(earnSocks(0)).rejects.toThrow();
    await expect(earnSocks(-5)).rejects.toThrow();
  });
});

describe("readInventory", () => {
  it("returns empty array when file does not exist", async () => {
    const { readInventory } = await loadEconomy();
    const inventory = await readInventory();
    expect(inventory).toEqual({ purchased: [] });
  });
});

describe("addToInventory", () => {
  it("appends item id to purchased list", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "inventory.json"),
      JSON.stringify({ purchased: ["small-plant"] }),
    );
    const { addToInventory } = await loadEconomy();
    const inventory = await addToInventory("basic-rug");
    expect(inventory.purchased).toContain("small-plant");
    expect(inventory.purchased).toContain("basic-rug");
  });

  it("does not add duplicate items", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "inventory.json"),
      JSON.stringify({ purchased: ["small-plant"] }),
    );
    const { addToInventory } = await loadEconomy();
    const inventory = await addToInventory("small-plant");
    expect(inventory.purchased).toEqual(["small-plant"]);
  });
});

describe("readRoomPlacements", () => {
  it("returns empty placements when file does not exist", async () => {
    const { readRoomPlacements } = await loadEconomy();
    const room = await readRoomPlacements();
    expect(room).toEqual({ placements: {} });
  });
});

describe("placeDecoration", () => {
  it("places a decoration in a slot", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "room.json"),
      JSON.stringify({ placements: {} }),
    );
    const { placeDecoration } = await loadEconomy();
    const room = await placeDecoration("wall-1", "simple-poster");
    expect(room.placements["wall-1"]).toBe("simple-poster");
  });

  it("replaces existing decoration in slot", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "room.json"),
      JSON.stringify({ placements: { "wall-1": "simple-poster" } }),
    );
    const { placeDecoration } = await loadEconomy();
    const room = await placeDecoration("wall-1", "large-painting");
    expect(room.placements["wall-1"]).toBe("large-painting");
  });
});

describe("removeDecoration", () => {
  it("removes a decoration from a slot", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "room.json"),
      JSON.stringify({ placements: { "wall-1": "simple-poster" } }),
    );
    const { removeDecoration } = await loadEconomy();
    const room = await removeDecoration("wall-1");
    expect(room.placements["wall-1"]).toBeUndefined();
  });
});

describe("purchaseDecoration", () => {
  it("deducts socks and adds to inventory", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "wallet.json"),
      JSON.stringify({ socks: 200, totalEarned: 400 }),
    );
    await writeFile(
      path.join(rootDir, "data", "economy", "inventory.json"),
      JSON.stringify({ purchased: [] }),
    );
    const { purchaseDecoration } = await loadEconomy();
    const result = await purchaseDecoration("small-plant", 50);
    expect(result.wallet.socks).toBe(150);
    expect(result.inventory.purchased).toContain("small-plant");
  });

  it("rejects purchase when insufficient socks", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "wallet.json"),
      JSON.stringify({ socks: 10, totalEarned: 10 }),
    );
    const { purchaseDecoration } = await loadEconomy();
    await expect(purchaseDecoration("small-plant", 50)).rejects.toThrow("Insufficient socks");
  });

  it("rejects purchase of already owned item", async () => {
    await writeFile(
      path.join(rootDir, "data", "economy", "wallet.json"),
      JSON.stringify({ socks: 200, totalEarned: 400 }),
    );
    await writeFile(
      path.join(rootDir, "data", "economy", "inventory.json"),
      JSON.stringify({ purchased: ["small-plant"] }),
    );
    const { purchaseDecoration } = await loadEconomy();
    await expect(purchaseDecoration("small-plant", 50)).rejects.toThrow("Already owned");
  });
});
