export type DecorationTier = "basic" | "mid" | "premium";
export type DecorationCategory = "wall" | "floor" | "furniture";
export type ThemeId = "bean" | "zelda";

export type Decoration = {
  id: string;
  name: string;
  category: DecorationCategory;
  tier: DecorationTier;
  cost: number;
  emoji: string;
  slotType: "wall" | "floor";
  themeId?: ThemeId;
};

export const DECORATION_CATALOG: Decoration[] = [
  // === Base decorations (available in all themes) ===
  // Basic tier (50–100)
  { id: "small-plant", name: "Small Plant", category: "floor", tier: "basic", cost: 50, emoji: "🌱", slotType: "floor" },
  { id: "basic-rug", name: "Basic Rug", category: "floor", tier: "basic", cost: 60, emoji: "🟫", slotType: "floor" },
  { id: "simple-poster", name: "Simple Poster", category: "wall", tier: "basic", cost: 70, emoji: "🖼️", slotType: "wall" },
  { id: "desk-lamp", name: "Desk Lamp", category: "furniture", tier: "basic", cost: 80, emoji: "💡", slotType: "floor" },
  { id: "bookshelf", name: "Bookshelf", category: "furniture", tier: "basic", cost: 90, emoji: "📚", slotType: "floor" },
  { id: "trash-can", name: "Trash Can", category: "furniture", tier: "basic", cost: 100, emoji: "🗑️", slotType: "floor" },

  // Mid tier (150–300)
  { id: "cozy-armchair", name: "Cozy Armchair", category: "furniture", tier: "mid", cost: 150, emoji: "🪑", slotType: "floor" },
  { id: "window-curtains", name: "Window with Curtains", category: "wall", tier: "mid", cost: 180, emoji: "🪟", slotType: "wall" },
  { id: "wall-clock", name: "Wall Clock", category: "wall", tier: "mid", cost: 200, emoji: "🕐", slotType: "wall" },
  { id: "potted-tree", name: "Potted Tree", category: "floor", tier: "mid", cost: 220, emoji: "🌳", slotType: "floor" },
  { id: "side-table", name: "Side Table", category: "furniture", tier: "mid", cost: 250, emoji: "🪵", slotType: "floor" },
  { id: "floor-lamp", name: "Floor Lamp", category: "furniture", tier: "mid", cost: 300, emoji: "🪔", slotType: "floor" },

  // Premium tier (400–700)
  { id: "fancy-desk", name: "Fancy Desk", category: "furniture", tier: "premium", cost: 400, emoji: "🖥️", slotType: "floor" },
  { id: "large-painting", name: "Large Painting", category: "wall", tier: "premium", cost: 450, emoji: "🎨", slotType: "wall" },
  { id: "cat-bed", name: "Cat Bed", category: "floor", tier: "premium", cost: 500, emoji: "🐱", slotType: "floor" },
  { id: "string-lights", name: "String Lights", category: "wall", tier: "premium", cost: 550, emoji: "✨", slotType: "wall" },
  { id: "coffee-machine", name: "Coffee Machine", category: "furniture", tier: "premium", cost: 600, emoji: "☕", slotType: "floor" },
  { id: "record-player", name: "Record Player", category: "furniture", tier: "premium", cost: 700, emoji: "🎵", slotType: "floor" },

  // === Zelda theme decorations ===
  { id: "heros-shield", name: "Hero's Shield", category: "wall", tier: "basic", cost: 75, emoji: "🛡️", slotType: "wall", themeId: "zelda" },
  { id: "potion-bottle", name: "Potion Bottle", category: "furniture", tier: "basic", cost: 85, emoji: "🧪", slotType: "floor", themeId: "zelda" },
  { id: "wall-torch", name: "Wall Torch", category: "wall", tier: "mid", cost: 180, emoji: "🔥", slotType: "wall", themeId: "zelda" },
  { id: "treasure-chest", name: "Treasure Chest", category: "floor", tier: "mid", cost: 200, emoji: "📦", slotType: "floor", themeId: "zelda" },
  { id: "magic-crystal", name: "Magic Crystal", category: "furniture", tier: "mid", cost: 250, emoji: "🔮", slotType: "floor", themeId: "zelda" },
  { id: "enchanted-bookshelf", name: "Enchanted Bookshelf", category: "furniture", tier: "mid", cost: 280, emoji: "📖", slotType: "floor", themeId: "zelda" },
  { id: "ancient-map", name: "Ancient Map", category: "wall", tier: "premium", cost: 500, emoji: "🗺️", slotType: "wall", themeId: "zelda" },
  { id: "fairy-bottle", name: "Fairy in a Bottle", category: "furniture", tier: "premium", cost: 550, emoji: "🧚", slotType: "floor", themeId: "zelda" },
  { id: "dragon-egg", name: "Dragon Egg", category: "floor", tier: "premium", cost: 600, emoji: "🥚", slotType: "floor", themeId: "zelda" },
  { id: "master-sword-display", name: "Sword Display", category: "wall", tier: "premium", cost: 650, emoji: "⚔️", slotType: "wall", themeId: "zelda" },
];

export function getDecoration(id: string): Decoration | undefined {
  return DECORATION_CATALOG.find((item) => item.id === id);
}

export function getDecorationsByCategory(category: DecorationCategory): Decoration[] {
  return DECORATION_CATALOG.filter((item) => item.category === category);
}

export function getDecorationsForTheme(themeId: ThemeId): Decoration[] {
  return DECORATION_CATALOG.filter((item) => !item.themeId || item.themeId === themeId);
}
