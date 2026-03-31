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
