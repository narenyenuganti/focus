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
