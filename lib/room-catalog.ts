export type SlotPosition = {
  x: number;
  y: number;
};

export type RoomFeatureId =
  | "window"
  | "fireplace"
  | "chains"
  | "torch-sconce"
  | "trees"
  | "mushrooms"
  | "curtained-window";

export type RoomVariantDef = {
  id: string;
  name: string;
  cost: number;
  description: string;
  wallColor: string;
  wallDarkColor: string;
  floorColor: string;
  floorDarkColor: string;
  baseboardColor: string;
  features: RoomFeatureId[];
  wallSlots: SlotPosition[];
  floorSlots: SlotPosition[];
};

export const ROOM_CATALOG: RoomVariantDef[] = [
  {
    id: "basic",
    name: "Basic Room",
    cost: 0,
    description: "Simple wood plank walls and plain floor.",
    wallColor: "#5c4a3a",
    wallDarkColor: "#4a3a2e",
    floorColor: "#B8960B",
    floorDarkColor: "#A07808",
    baseboardColor: "#3d2e1f",
    features: ["window"],
    wallSlots: [
      { x: 50, y: 85 },
      { x: 180, y: 85 },
      { x: 50, y: 120 },
      { x: 180, y: 120 },
    ],
    floorSlots: [
      { x: 40, y: 195 },
      { x: 200, y: 195 },
      { x: 60, y: 225 },
      { x: 180, y: 225 },
    ],
  },
  {
    id: "cozy-cottage",
    name: "Cozy Cottage",
    cost: 500,
    description: "Warm wood with fireplace and curtained window.",
    wallColor: "#6b5540",
    wallDarkColor: "#5a4530",
    floorColor: "#C4860B",
    floorDarkColor: "#A87008",
    baseboardColor: "#4a3520",
    features: ["curtained-window", "fireplace"],
    wallSlots: [
      { x: 50, y: 85 },
      { x: 180, y: 85 },
      { x: 50, y: 120 },
      { x: 180, y: 120 },
    ],
    floorSlots: [
      { x: 40, y: 195 },
      { x: 200, y: 195 },
      { x: 60, y: 225 },
      { x: 180, y: 225 },
    ],
  },
  {
    id: "forest-clearing",
    name: "Forest Clearing",
    cost: 800,
    description: "Open sky, grass floor, tree stumps and mushrooms.",
    wallColor: "#7CB342",
    wallDarkColor: "#5D8233",
    floorColor: "#5a8a30",
    floorDarkColor: "#4a7525",
    baseboardColor: "#3d5a1f",
    features: ["trees", "mushrooms"],
    wallSlots: [
      { x: 50, y: 85 },
      { x: 180, y: 85 },
      { x: 50, y: 120 },
      { x: 180, y: 120 },
    ],
    floorSlots: [
      { x: 40, y: 195 },
      { x: 200, y: 195 },
      { x: 60, y: 225 },
      { x: 180, y: 225 },
    ],
  },
  {
    id: "dungeon-workshop",
    name: "Dungeon Workshop",
    cost: 1200,
    description: "Stone brick walls, dark floor, chains and torches.",
    wallColor: "#6B6B6B",
    wallDarkColor: "#555555",
    floorColor: "#4A4A4A",
    floorDarkColor: "#3a3a3a",
    baseboardColor: "#333333",
    features: ["chains", "torch-sconce"],
    wallSlots: [
      { x: 50, y: 85 },
      { x: 180, y: 85 },
      { x: 50, y: 120 },
      { x: 180, y: 120 },
    ],
    floorSlots: [
      { x: 40, y: 195 },
      { x: 200, y: 195 },
      { x: 60, y: 225 },
      { x: 180, y: 225 },
    ],
  },
];

export function getRoomVariant(id: string): RoomVariantDef | undefined {
  return ROOM_CATALOG.find((r) => r.id === id);
}

export function getUnlockableRooms(): RoomVariantDef[] {
  return [...ROOM_CATALOG].sort((a, b) => a.cost - b.cost);
}
