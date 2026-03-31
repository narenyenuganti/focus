export type DecorationTier = "basic" | "mid" | "premium";
export type DecorationCategory = "wall" | "floor" | "furniture";

export type Decoration = {
  id: string;
  name: string;
  category: DecorationCategory;
  tier: DecorationTier;
  cost: number;
  emoji: string;
  slotType: "wall" | "floor";
};

export const DECORATION_CATALOG: Decoration[] = [
  // Basic tier (50–100 socks)
  { id: "small-plant", name: "Small Plant", category: "floor", tier: "basic", cost: 50, emoji: "🌱", slotType: "floor" },
  { id: "basic-rug", name: "Basic Rug", category: "floor", tier: "basic", cost: 60, emoji: "🟫", slotType: "floor" },
  { id: "simple-poster", name: "Simple Poster", category: "wall", tier: "basic", cost: 70, emoji: "🖼️", slotType: "wall" },
  { id: "desk-lamp", name: "Desk Lamp", category: "furniture", tier: "basic", cost: 80, emoji: "💡", slotType: "floor" },
  { id: "bookshelf", name: "Bookshelf", category: "furniture", tier: "basic", cost: 90, emoji: "📚", slotType: "floor" },
  { id: "trash-can", name: "Trash Can", category: "furniture", tier: "basic", cost: 100, emoji: "🗑️", slotType: "floor" },

  // Mid tier (150–300 socks)
  { id: "cozy-armchair", name: "Cozy Armchair", category: "furniture", tier: "mid", cost: 150, emoji: "🪑", slotType: "floor" },
  { id: "window-curtains", name: "Window with Curtains", category: "wall", tier: "mid", cost: 180, emoji: "🪟", slotType: "wall" },
  { id: "wall-clock", name: "Wall Clock", category: "wall", tier: "mid", cost: 200, emoji: "🕐", slotType: "wall" },
  { id: "potted-tree", name: "Potted Tree", category: "floor", tier: "mid", cost: 220, emoji: "🌳", slotType: "floor" },
  { id: "side-table", name: "Side Table", category: "furniture", tier: "mid", cost: 250, emoji: "🪵", slotType: "floor" },
  { id: "floor-lamp", name: "Floor Lamp", category: "furniture", tier: "mid", cost: 300, emoji: "🪔", slotType: "floor" },

  // Premium tier (400–700 socks)
  { id: "fancy-desk", name: "Fancy Desk", category: "furniture", tier: "premium", cost: 400, emoji: "🖥️", slotType: "floor" },
  { id: "large-painting", name: "Large Painting", category: "wall", tier: "premium", cost: 450, emoji: "🎨", slotType: "wall" },
  { id: "cat-bed", name: "Cat Bed", category: "floor", tier: "premium", cost: 500, emoji: "🐱", slotType: "floor" },
  { id: "string-lights", name: "String Lights", category: "wall", tier: "premium", cost: 550, emoji: "✨", slotType: "wall" },
  { id: "coffee-machine", name: "Coffee Machine", category: "furniture", tier: "premium", cost: 600, emoji: "☕", slotType: "floor" },
  { id: "record-player", name: "Record Player", category: "furniture", tier: "premium", cost: 700, emoji: "🎵", slotType: "floor" },
];

export function getDecoration(id: string): Decoration | undefined {
  return DECORATION_CATALOG.find((item) => item.id === id);
}

export function getDecorationsByCategory(category: DecorationCategory): Decoration[] {
  return DECORATION_CATALOG.filter((item) => item.category === category);
}
