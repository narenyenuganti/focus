import type { ReactNode } from "react";

type SpriteProps = {
  x?: number;
  y?: number;
};

function SmallPlant({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="4" y="12" width="12" height="10" rx="1" fill="#CD853F" stroke="#8B6914" strokeWidth="1" />
      <rect x="8" y="2" width="4" height="10" fill="#228B22" />
      <rect x="3" y="4" width="6" height="5" rx="2" fill="#32CD32" />
      <rect x="11" y="6" width="5" height="4" rx="2" fill="#2E8B2E" />
    </g>
  );
}

function BasicRug({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="40" height="16" rx="2" fill="#8B2252" stroke="#CD3278" strokeWidth="1" />
      <rect x="6" y="4" width="28" height="8" fill="none" stroke="#FF69B4" strokeWidth="1" />
    </g>
  );
}

function SimplePoster({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="22" height="18" rx="1" fill="#FFF" stroke="#8B7355" strokeWidth="2" />
      <rect x="3" y="3" width="16" height="12" fill="#87CEEB" />
      <circle cx="8" cy="7" r="3" fill="#FFD700" opacity="0.8" />
      <path d="M3,12 L10,7 L16,10 L19,7 L19,15 L3,15Z" fill="#5a9e3e" opacity="0.7" />
    </g>
  );
}

function DeskLamp({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="6" y="14" width="8" height="4" rx="1" fill="#555" />
      <rect x="8" y="6" width="4" height="8" fill="#777" />
      <path d="M4,6 L16,6 L14,0 L6,0 Z" fill="#FFD700" />
      <ellipse cx="10" cy="6" rx="4" ry="1" fill="#FFF8DC" opacity="0.4" />
    </g>
  );
}

function Bookshelf({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="28" height="28" fill="#8B4513" stroke="#5C3010" strokeWidth="1" />
      <rect x="0" y="13" width="28" height="2" fill="#5C3010" />
      <rect x="3" y="2" width="6" height="11" fill="#8B0000" />
      <rect x="10" y="4" width="5" height="9" fill="#228B22" />
      <rect x="16" y="1" width="7" height="12" fill="#4169E1" />
      <rect x="3" y="16" width="8" height="10" fill="#B8860B" />
      <rect x="13" y="18" width="5" height="8" fill="#9932CC" />
      <rect x="20" y="16" width="6" height="10" fill="#DC143C" />
    </g>
  );
}

function TrashCan({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="2" y="4" width="16" height="16" rx="1" fill="#888" stroke="#666" strokeWidth="1" />
      <rect x="0" y="2" width="20" height="3" rx="1" fill="#999" />
      <rect x="7" y="0" width="6" height="3" rx="1" fill="#777" />
    </g>
  );
}

function CozyArmchair({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="8" width="28" height="18" rx="4" fill="#8b5e3c" stroke="#6d4a2e" strokeWidth="1" />
      <rect x="-2" y="2" width="32" height="10" rx="4" fill="#a0704c" />
      <ellipse cx="14" cy="16" rx="10" ry="6" fill="#d4785c" />
      <rect x="2" y="26" width="4" height="6" rx="1" fill="#6d4a2e" />
      <rect x="22" y="26" width="4" height="6" rx="1" fill="#6d4a2e" />
    </g>
  );
}

function WindowCurtains({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="30" height="24" fill="#6ba3be" stroke="#8B7355" strokeWidth="2" />
      <line x1="15" y1="0" x2="15" y2="24" stroke="#8B7355" strokeWidth="1.5" />
      <line x1="0" y1="12" x2="30" y2="12" stroke="#8B7355" strokeWidth="1.5" />
      <path d="M-2,0 Q-6,10 -3,24 L0,24 L0,0Z" fill="#c75050" opacity="0.8" />
      <path d="M32,0 Q36,10 33,24 L30,24 L30,0Z" fill="#c75050" opacity="0.8" />
    </g>
  );
}

function WallClock({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="10" cy="10" r="10" fill="#FFF" stroke="#8B7355" strokeWidth="2" />
      <circle cx="10" cy="10" r="1.5" fill="#333" />
      <line x1="10" y1="10" x2="10" y2="4" stroke="#333" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="15" y2="10" stroke="#333" strokeWidth="1" />
    </g>
  );
}

function PottedTree({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="6" y="20" width="12" height="12" rx="1" fill="#CD853F" stroke="#8B6914" strokeWidth="1" />
      <rect x="10" y="10" width="4" height="10" fill="#8B6914" />
      <circle cx="12" cy="6" r="8" fill="#228B22" />
      <circle cx="7" cy="4" r="5" fill="#32CD32" />
      <circle cx="17" cy="5" r="5" fill="#2E8B2E" />
    </g>
  );
}

function SideTable({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="24" height="4" rx="1" fill="#A0622D" stroke="#5C3010" strokeWidth="1" />
      <rect x="2" y="4" width="4" height="16" fill="#5C3010" />
      <rect x="18" y="4" width="4" height="16" fill="#5C3010" />
    </g>
  );
}

function FloorLamp({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="6" y="28" width="8" height="4" rx="1" fill="#555" />
      <rect x="8" y="8" width="4" height="20" fill="#777" />
      <path d="M2,8 L18,8 L16,0 L4,0 Z" fill="#FFD54F" />
      <ellipse cx="10" cy="8" rx="6" ry="2" fill="#FFF8DC" opacity="0.3" />
    </g>
  );
}

function FancyDesk({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,0 40,0 44,4 4,4" fill="#A0622D" stroke="#5C3010" strokeWidth="1" />
      <rect x="4" y="4" width="40" height="3" fill="#8B4513" stroke="#5C3010" strokeWidth="1" />
      <rect x="6" y="7" width="4" height="16" fill="#5C3010" />
      <rect x="36" y="7" width="4" height="16" fill="#5C3010" />
      <rect x="12" y="-10" width="20" height="10" rx="1" fill="#333" stroke="#555" strokeWidth="1" />
      <rect x="14" y="-8" width="16" height="6" fill="#4a90d9" />
    </g>
  );
}

function LargePainting({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="36" height="28" rx="1" fill="#FFF" stroke="#8B7355" strokeWidth="2.5" />
      <rect x="3" y="3" width="30" height="22" fill="#1a1a3a" />
      <circle cx="12" cy="10" r="5" fill="#FFD700" opacity="0.7" />
      <path d="M3,18 L12,10 L22,16 L33,8 L33,25 L3,25Z" fill="#2E5090" opacity="0.6" />
    </g>
  );
}

function CatBed({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="14" cy="14" rx="14" ry="8" fill="#d4785c" stroke="#b85e42" strokeWidth="1" />
      <ellipse cx="14" cy="12" rx="10" ry="5" fill="#f0c0a0" />
      <circle cx="10" cy="10" r="5" fill="#888" />
      <circle cx="16" cy="9" r="4" fill="#999" />
      <rect x="7" y="6" width="2" height="3" fill="#888" transform="rotate(-15 8 6)" />
      <rect x="14" y="5" width="2" height="3" fill="#999" transform="rotate(15 15 5)" />
    </g>
  );
}

function StringLights({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M0,4 Q8,8 16,4 Q24,0 32,4 Q40,8 48,4" fill="none" stroke="#555" strokeWidth="1" />
      <circle cx="8" cy="6" r="3" fill="#FF6B6B" />
      <circle cx="16" cy="4" r="3" fill="#FFD700" />
      <circle cx="24" cy="2" r="3" fill="#87CEEB" />
      <circle cx="32" cy="4" r="3" fill="#90EE90" />
      <circle cx="40" cy="6" r="3" fill="#DDA0DD" />
    </g>
  );
}

function CoffeeMachine({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="2" y="4" width="20" height="20" rx="2" fill="#333" stroke="#222" strokeWidth="1" />
      <rect x="5" y="7" width="14" height="10" rx="1" fill="#555" />
      <rect x="8" y="20" width="8" height="6" fill="#222" />
      <rect x="6" y="26" width="12" height="2" rx="1" fill="#444" />
      <circle cx="12" cy="12" r="3" fill="#4a90d9" />
      <rect x="0" y="0" width="24" height="4" rx="1" fill="#444" />
    </g>
  );
}

function RecordPlayer({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="32" height="24" rx="2" fill="#8B4513" stroke="#5C3010" strokeWidth="1" />
      <circle cx="14" cy="12" r="8" fill="#1a1a1a" />
      <circle cx="14" cy="12" r="3" fill="#8B0000" />
      <circle cx="14" cy="12" r="1" fill="#FFD700" />
      <rect x="22" y="4" width="8" height="3" rx="1" fill="#A0A0A0" />
    </g>
  );
}

function HerosShield({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M12,0 L24,4 L24,16 L12,24 L0,16 L0,4 Z" fill="#4169E1" stroke="#1a3a8c" strokeWidth="1.5" />
      <path d="M12,4 L20,7 L20,14 L12,20 L4,14 L4,7 Z" fill="#6495ED" />
      <path d="M10,8 L14,8 L14,12 L16,12 L12,18 L8,12 L10,12 Z" fill="#FFD700" />
    </g>
  );
}

function PotionBottle({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="5" y="0" width="6" height="4" rx="1" fill="#999" />
      <rect x="3" y="4" width="10" height="3" fill="#777" />
      <path d="M2,7 L14,7 L12,20 L4,20 Z" fill="#90EE90" stroke="#228B22" strokeWidth="1" />
      <rect x="5" y="14" width="6" height="2" fill="#ADFF2F" opacity="0.5" />
    </g>
  );
}

function WallTorch({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="6" y="8" width="6" height="16" fill="#8B7355" />
      <rect x="4" y="6" width="10" height="3" rx="1" fill="#A08050" />
      <ellipse cx="9" cy="4" rx="5" ry="5" fill="#FF6B35" />
      <ellipse cx="9" cy="2" rx="3" ry="4" fill="#FFD700" />
      <ellipse cx="9" cy="0" rx="2" ry="2" fill="#FFF8DC" opacity="0.7" />
    </g>
  );
}

function TreasureChest({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="8" width="24" height="12" rx="1" fill="#8B4513" stroke="#5C3010" strokeWidth="1" />
      <path d="M0,8 Q12,0 24,8" fill="#A0622D" stroke="#5C3010" strokeWidth="1" />
      <rect x="9" y="6" width="6" height="6" rx="1" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
    </g>
  );
}

function MagicCrystal({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points="10,0 18,8 14,20 6,20 2,8" fill="#9370DB" stroke="#6A0DAD" strokeWidth="1" />
      <polygon points="10,2 16,8 13,18 7,18 4,8" fill="#B8A9E8" opacity="0.5" />
      <rect x="8" y="4" width="2" height="6" fill="#E8E0FF" opacity="0.6" />
    </g>
  );
}

function EnchantedBookshelf({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="28" height="28" fill="#4a3520" stroke="#3a2510" strokeWidth="1" />
      <rect x="0" y="13" width="28" height="2" fill="#3a2510" />
      <rect x="3" y="2" width="6" height="11" fill="#9370DB" />
      <rect x="10" y="4" width="5" height="9" fill="#4169E1" />
      <rect x="16" y="1" width="7" height="12" fill="#DC143C" />
      <rect x="3" y="16" width="8" height="10" fill="#228B22" />
      <rect x="13" y="18" width="5" height="8" fill="#FFD700" />
      <rect x="20" y="16" width="6" height="10" fill="#9932CC" />
      <circle cx="24" cy="4" r="2" fill="#90EE90" opacity="0.6" />
      <circle cx="2" cy="20" r="2" fill="#87CEEB" opacity="0.6" />
    </g>
  );
}

function AncientMap({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="28" height="22" rx="1" fill="#F5DEB3" stroke="#8B7355" strokeWidth="1.5" />
      <path d="M4,8 Q10,4 16,10 Q22,6 24,12" fill="none" stroke="#8B6914" strokeWidth="1" />
      <path d="M6,14 Q12,18 20,12" fill="none" stroke="#8B6914" strokeWidth="1" />
      <circle cx="20" cy="8" r="2" fill="none" stroke="#DC143C" strokeWidth="1" />
    </g>
  );
}

function FairyBottle({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="5" y="0" width="6" height="3" rx="1" fill="#A0A0A0" />
      <path d="M3,3 L13,3 L14,6 L12,20 L4,20 L2,6 Z" fill="#ADD8E6" stroke="#87CEEB" strokeWidth="1" opacity="0.8" />
      <circle cx="8" cy="12" r="3" fill="#90EE90" opacity="0.7" />
      <circle cx="8" cy="12" r="1.5" fill="#FFF" opacity="0.8" />
    </g>
  );
}

function DragonEgg({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="10" cy="12" rx="9" ry="12" fill="#8B0000" stroke="#5C0000" strokeWidth="1" />
      <ellipse cx="10" cy="12" rx="6" ry="9" fill="#A52A2A" opacity="0.5" />
      <ellipse cx="7" cy="8" rx="2" ry="3" fill="#CD5C5C" opacity="0.5" />
      <path d="M6,4 L8,0 L10,4 L12,1 L14,4" fill="#FF6347" stroke="#8B0000" strokeWidth="0.5" />
    </g>
  );
}

function SwordDisplay({ x = 0, y = 0 }: SpriteProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="24" height="4" rx="1" fill="#8B7355" />
      <rect x="4" y="4" width="2" height="6" fill="#8B7355" />
      <rect x="18" y="4" width="2" height="6" fill="#8B7355" />
      <rect x="11" y="-2" width="2" height="24" fill="#C0C0C0" />
      <rect x="7" y="10" width="10" height="2" rx="1" fill="#8B7355" />
      <rect x="10" y="22" width="4" height="4" rx="1" fill="#8B4513" />
      <polygon points="11,0 13,0 12,-4" fill="#C0C0C0" />
    </g>
  );
}

const SPRITE_REGISTRY: Record<string, (props: SpriteProps) => ReactNode> = {
  "small-plant": SmallPlant,
  "basic-rug": BasicRug,
  "simple-poster": SimplePoster,
  "desk-lamp": DeskLamp,
  bookshelf: Bookshelf,
  "trash-can": TrashCan,
  "cozy-armchair": CozyArmchair,
  "window-curtains": WindowCurtains,
  "wall-clock": WallClock,
  "potted-tree": PottedTree,
  "side-table": SideTable,
  "floor-lamp": FloorLamp,
  "fancy-desk": FancyDesk,
  "large-painting": LargePainting,
  "cat-bed": CatBed,
  "string-lights": StringLights,
  "coffee-machine": CoffeeMachine,
  "record-player": RecordPlayer,
  "heros-shield": HerosShield,
  "potion-bottle": PotionBottle,
  "wall-torch": WallTorch,
  "treasure-chest": TreasureChest,
  "magic-crystal": MagicCrystal,
  "enchanted-bookshelf": EnchantedBookshelf,
  "ancient-map": AncientMap,
  "fairy-bottle": FairyBottle,
  "dragon-egg": DragonEgg,
  "master-sword-display": SwordDisplay,
};

export function DecorationSprite({ spriteId, x = 0, y = 0 }: { spriteId: string; x?: number; y?: number }) {
  const Sprite = SPRITE_REGISTRY[spriteId];
  if (!Sprite) return null;
  return <>{Sprite({ x, y })}</>;
}

export function getDecorationSpriteIds(): string[] {
  return Object.keys(SPRITE_REGISTRY);
}
