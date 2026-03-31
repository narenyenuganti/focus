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
