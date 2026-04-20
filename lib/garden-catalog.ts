import type { GlyphKind } from "@/components/garden-glyph";

export type GardenRarity = "common" | "rare" | "legendary";

export type GardenCategory =
  | "Plants"
  | "Trees"
  | "Stones"
  | "Light"
  | "Water"
  | "Creatures"
  | "Sky"
  | "Seasonal";

export type GardenItem = {
  id: string;
  name: string;
  cat: GardenCategory;
  cost: number;
  rarity: GardenRarity;
  glyph: GlyphKind;
  blurb: string;
};

export const GARDEN_CATEGORIES: GardenCategory[] = [
  "Plants",
  "Trees",
  "Stones",
  "Light",
  "Water",
  "Creatures",
  "Sky",
  "Seasonal",
];

export const RARITY_LABEL: Record<GardenRarity, string> = {
  common: "Common",
  rare: "Rare",
  legendary: "Legendary",
};

export const GARDEN_CATALOG: GardenItem[] = [
  // Plants
  { id: "fern", name: "Hart's-tongue fern", cat: "Plants", cost: 40, rarity: "common", glyph: "fern", blurb: "Loves damp, shaded corners." },
  { id: "lavender", name: "English lavender", cat: "Plants", cost: 60, rarity: "common", glyph: "lavender", blurb: "Attracts bees in summer." },
  { id: "foxglove", name: "Foxglove", cat: "Plants", cost: 90, rarity: "common", glyph: "foxglove", blurb: "Tall spires of speckled bells." },
  { id: "poppy", name: "Field poppy", cat: "Plants", cost: 50, rarity: "common", glyph: "poppy", blurb: "A flash of scarlet among the grass." },
  { id: "iris", name: "Japanese iris", cat: "Plants", cost: 110, rarity: "rare", glyph: "iris", blurb: "Violet petals on still water." },
  { id: "mushroom", name: "Fairy-ring mushrooms", cat: "Plants", cost: 70, rarity: "common", glyph: "mushroom", blurb: "A quiet circle after rain." },
  { id: "thistle", name: "Globe thistle", cat: "Plants", cost: 80, rarity: "common", glyph: "thistle", blurb: "Spiked blue pompons in late summer." },
  { id: "rose", name: "Climbing rose", cat: "Plants", cost: 150, rarity: "rare", glyph: "rose", blurb: "Wild and a little thorny." },
  { id: "tulip", name: "Tulip bed", cat: "Plants", cost: 80, rarity: "common", glyph: "tulip", blurb: "Seven colours, nodding in rain." },
  { id: "sunflower", name: "Sunflowers", cat: "Plants", cost: 130, rarity: "rare", glyph: "sunflower", blurb: "Always turning to the better light." },
  { id: "hydrangea", name: "Mophead hydrangea", cat: "Plants", cost: 140, rarity: "rare", glyph: "hydrangea", blurb: "Blue in acid soil, pink in sweet." },
  { id: "wisteria", name: "Wisteria arch", cat: "Plants", cost: 260, rarity: "rare", glyph: "wisteria", blurb: "A slow purple waterfall." },
  { id: "bamboo", name: "Black bamboo", cat: "Plants", cost: 200, rarity: "rare", glyph: "bamboo", blurb: "The sound of wind made visible." },
  { id: "mossbed", name: "Moss bed", cat: "Plants", cost: 90, rarity: "common", glyph: "moss", blurb: "A slow green patience." },
  { id: "clover", name: "Four-leaf clover", cat: "Plants", cost: 110, rarity: "rare", glyph: "clover", blurb: "Lucky to find, luckier to plant." },
  { id: "orchid", name: "Ghost orchid", cat: "Plants", cost: 540, rarity: "legendary", glyph: "orchid", blurb: "Blooms only after a hundred quiet hours." },

  // Trees
  { id: "olive", name: "Olive tree", cat: "Trees", cost: 180, rarity: "rare", glyph: "olive", blurb: "Silver leaves, slow and patient." },
  { id: "maple", name: "Japanese maple", cat: "Trees", cost: 240, rarity: "rare", glyph: "maple", blurb: "Crimson lace in autumn." },
  { id: "willow", name: "Weeping willow", cat: "Trees", cost: 280, rarity: "rare", glyph: "willow", blurb: "Best planted beside still water." },
  { id: "cypress", name: "Italian cypress", cat: "Trees", cost: 220, rarity: "rare", glyph: "cypress", blurb: "A dark green exclamation." },
  { id: "sakura", name: "Cherry blossom", cat: "Trees", cost: 480, rarity: "legendary", glyph: "sakura", blurb: "Blooms for one focused week a year." },
  { id: "oak", name: "Ancient oak", cat: "Trees", cost: 900, rarity: "legendary", glyph: "oak", blurb: "The garden's memory, rooted deep." },
  { id: "birch", name: "Silver birch", cat: "Trees", cost: 210, rarity: "rare", glyph: "birch", blurb: "White bark, coin-like leaves." },
  { id: "pine", name: "Mountain pine", cat: "Trees", cost: 260, rarity: "rare", glyph: "pine", blurb: "Smells of nothing but itself." },
  { id: "ginkgo", name: "Ginkgo", cat: "Trees", cost: 320, rarity: "rare", glyph: "ginkgo", blurb: "Older than memory. Yellow in November." },
  { id: "apple", name: "Apple tree", cat: "Trees", cost: 300, rarity: "rare", glyph: "apple", blurb: "Blossom in May, fruit by October." },
  { id: "redwood", name: "Young redwood", cat: "Trees", cost: 1100, rarity: "legendary", glyph: "redwood", blurb: "Will outlive the app, the phone, and you." },
  { id: "bonsai", name: "Pine bonsai", cat: "Trees", cost: 420, rarity: "legendary", glyph: "bonsai", blurb: "A forest, held in the palm." },

  // Stones
  { id: "stone", name: "Standing stone", cat: "Stones", cost: 80, rarity: "common", glyph: "stone", blurb: "A small monument to the days." },
  { id: "cairn", name: "Hill cairn", cat: "Stones", cost: 120, rarity: "common", glyph: "cairn", blurb: "Balanced one stone at a time." },
  { id: "bench", name: "Stone bench", cat: "Stones", cost: 140, rarity: "common", glyph: "bench", blurb: "A place to sit and read." },
  { id: "torii", name: "Torii gate", cat: "Stones", cost: 360, rarity: "legendary", glyph: "torii", blurb: "A threshold into quiet." },
  { id: "steppingst", name: "Stepping stones", cat: "Stones", cost: 110, rarity: "common", glyph: "stepping", blurb: "Cross the grass without crushing it." },
  { id: "boulder", name: "Mossy boulder", cat: "Stones", cost: 180, rarity: "rare", glyph: "boulder", blurb: "Has sat here longer than the village." },
  { id: "birdbath", name: "Stone birdbath", cat: "Stones", cost: 220, rarity: "rare", glyph: "birdbath", blurb: "Robins visit at first light." },
  { id: "sundial", name: "Brass sundial", cat: "Stones", cost: 340, rarity: "rare", glyph: "sundial", blurb: "Marks the hour — only when it must." },
  { id: "zengarden", name: "Zen gravel garden", cat: "Stones", cost: 460, rarity: "legendary", glyph: "zen", blurb: "Rake it between sessions; it keeps count for you." },
  { id: "statue", name: "Weathered statue", cat: "Stones", cost: 520, rarity: "legendary", glyph: "statue", blurb: "A quiet witness, face half lost to moss." },

  // Light
  { id: "lantern", name: "Paper lantern", cat: "Light", cost: 120, rarity: "common", glyph: "lantern", blurb: "Lit at dusk; a warm speck in the dark." },
  { id: "firefly", name: "Fireflies", cat: "Light", cost: 260, rarity: "rare", glyph: "firefly", blurb: "A constellation that drifts low." },
  { id: "moonlamp", name: "Moon-stone lamp", cat: "Light", cost: 400, rarity: "legendary", glyph: "moonlamp", blurb: "Glows brighter during night sessions." },
  { id: "candle", name: "Storm candle", cat: "Light", cost: 80, rarity: "common", glyph: "candle", blurb: "Steady in the smallest breeze." },
  { id: "torch", name: "Garden torch", cat: "Light", cost: 150, rarity: "common", glyph: "torch", blurb: "Keeps the mosquitoes, and doubts, away." },
  { id: "string", name: "String lights", cat: "Light", cost: 200, rarity: "rare", glyph: "string", blurb: "Slung between two trees; a soft ceiling." },
  { id: "glowworm", name: "Glowworm grotto", cat: "Light", cost: 340, rarity: "rare", glyph: "glowworm", blurb: "A small sky, underground." },
  { id: "starlantern", name: "Star lantern", cat: "Light", cost: 280, rarity: "rare", glyph: "starlantern", blurb: "A paper cut-out of the night." },
  { id: "bonfire", name: "Autumn bonfire", cat: "Light", cost: 480, rarity: "legendary", glyph: "bonfire", blurb: "For the longest, quietest evenings." },

  // Water
  { id: "pond", name: "Reflecting pond", cat: "Water", cost: 320, rarity: "rare", glyph: "pond", blurb: "A mirror for the sky." },
  { id: "stream", name: "Brook with stones", cat: "Water", cost: 420, rarity: "rare", glyph: "stream", blurb: "Small sound, large calm." },
  { id: "fountain", name: "Stone fountain", cat: "Water", cost: 560, rarity: "legendary", glyph: "fountain", blurb: "Carved, forever trickling." },

  // Creatures
  { id: "butterfly", name: "Butterflies", cat: "Creatures", cost: 180, rarity: "rare", glyph: "butterfly", blurb: "Yellow ones. They mind their business." },
  { id: "bird", name: "Robin", cat: "Creatures", cost: 220, rarity: "rare", glyph: "bird", blurb: "Stops by for the last sessions of the day." },
  { id: "koi", name: "Koi fish", cat: "Creatures", cost: 340, rarity: "legendary", glyph: "koi", blurb: "Requires a pond to swim in." },
  { id: "fox", name: "Garden fox", cat: "Creatures", cost: 720, rarity: "legendary", glyph: "fox", blurb: "Seen only after long streaks." },
  { id: "rabbit", name: "White rabbit", cat: "Creatures", cost: 260, rarity: "rare", glyph: "rabbit", blurb: "Tap her nose and she hops away." },
  { id: "deer", name: "Young deer", cat: "Creatures", cost: 480, rarity: "legendary", glyph: "deer", blurb: "Grazes in the clearing at dawn." },
  { id: "turtle", name: "Garden turtle", cat: "Creatures", cost: 300, rarity: "rare", glyph: "turtle", blurb: "Slow and steady — tap to tuck in." },
  { id: "frog", name: "Pond frog", cat: "Creatures", cost: 200, rarity: "rare", glyph: "frog", blurb: "Sits on a lily pad; leaps when startled." },
  { id: "squirrel", name: "Red squirrel", cat: "Creatures", cost: 240, rarity: "rare", glyph: "squirrel", blurb: "Darts up and down the oak." },
  { id: "hedgehog", name: "Hedgehog", cat: "Creatures", cost: 280, rarity: "rare", glyph: "hedgehog", blurb: "Visits at dusk. Curls up if touched." },
  { id: "dragonfly", name: "Dragonfly", cat: "Creatures", cost: 180, rarity: "rare", glyph: "dragonfly", blurb: "A blue flicker above the pond." },
  { id: "snail", name: "Garden snail", cat: "Creatures", cost: 80, rarity: "common", glyph: "snail", blurb: "On his own time. Retracts on tap." },
  { id: "ladybug", name: "Ladybug", cat: "Creatures", cost: 90, rarity: "common", glyph: "ladybug", blurb: "Lucky. Flies off when bothered." },
  { id: "cat", name: "House cat", cat: "Creatures", cost: 420, rarity: "legendary", glyph: "cat", blurb: "Appears unprompted. Stretches on tap." },
  { id: "mouse", name: "Field mouse", cat: "Creatures", cost: 140, rarity: "common", glyph: "mouse", blurb: "Scurries between the hedges." },
  { id: "owl", name: "Tawny owl", cat: "Creatures", cost: 540, rarity: "legendary", glyph: "owl", blurb: "In the oak after dusk. Blinks wisely." },
  { id: "bee", name: "Honey bee", cat: "Creatures", cost: 120, rarity: "common", glyph: "bee", blurb: "Visits the lavender; hums off when tapped." },
  { id: "duck", name: "Mallard duck", cat: "Creatures", cost: 260, rarity: "rare", glyph: "duck", blurb: "Paddles the pond. Dips for a tap." },

  // Sky
  { id: "sun", name: "Morning sun", cat: "Sky", cost: 0, rarity: "common", glyph: "sun", blurb: "The garden's first light." },
  { id: "clouds", name: "Drifting clouds", cat: "Sky", cost: 60, rarity: "common", glyph: "clouds", blurb: "Low, slow, painterly." },
  { id: "moon", name: "Crescent moon", cat: "Sky", cost: 160, rarity: "rare", glyph: "moon", blurb: "Appears during evening focus." },
  { id: "stars", name: "Night stars", cat: "Sky", cost: 280, rarity: "rare", glyph: "stars", blurb: "A handful, not a sky full." },
  { id: "aurora", name: "Aurora", cat: "Sky", cost: 1200, rarity: "legendary", glyph: "aurora", blurb: "Unlocks after 100h of focus." },

  // Seasonal
  { id: "petals", name: "Falling petals", cat: "Seasonal", cost: 140, rarity: "rare", glyph: "petals", blurb: "Adds drift to spring sessions." },
  { id: "snowfall", name: "First snow", cat: "Seasonal", cost: 220, rarity: "rare", glyph: "snow", blurb: "Softens the garden in winter." },
  { id: "autumn", name: "Autumn colours", cat: "Seasonal", cost: 200, rarity: "rare", glyph: "autumn", blurb: "Warms the palette for a month." },
];

export function getGardenItem(id: string): GardenItem | undefined {
  return GARDEN_CATALOG.find((item) => item.id === id);
}
