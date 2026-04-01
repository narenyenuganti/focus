import type { RoomFeatureId } from "@/lib/room-catalog";

type FeatureProps = {
  x?: number;
  y?: number;
};

function WindowFeature({ x = 100, y = 80 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="50" height="40" fill="#6ba3be" stroke="#8B7355" strokeWidth="3" />
      <line x1="25" y1="0" x2="25" y2="40" stroke="#8B7355" strokeWidth="2" />
      <line x1="0" y1="20" x2="50" y2="20" stroke="#8B7355" strokeWidth="2" />
      <rect x="4" y="4" width="8" height="4" fill="#FFE87C" rx="1" />
      <rect x="30" y="10" width="6" height="3" fill="#FFE87C" rx="1" />
    </g>
  );
}

function CurtainedWindowFeature({ x = 95, y = 75 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="5" y="5" width="50" height="40" fill="#6ba3be" stroke="#8B7355" strokeWidth="3" />
      <line x1="30" y1="5" x2="30" y2="45" stroke="#8B7355" strokeWidth="2" />
      <line x1="5" y1="25" x2="55" y2="25" stroke="#8B7355" strokeWidth="2" />
      <path d="M3,3 Q-3,22 1,47 L5,47 L5,3Z" fill="#c75050" opacity="0.8" />
      <path d="M57,3 Q63,22 59,47 L55,47 L55,3Z" fill="#c75050" opacity="0.8" />
    </g>
  );
}

function FireplaceFeature({ x = 232, y = 90 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="24" height="50" fill="#8B7355" stroke="#5C3010" strokeWidth="1.5" />
      <rect x="3" y="3" width="18" height="30" fill="#1a1a1a" />
      <ellipse cx="12" cy="28" rx="6" ry="4" fill="#FF6B35" />
      <ellipse cx="12" cy="26" rx="4" ry="5" fill="#FFD700" />
      <ellipse cx="12" cy="24" rx="2" ry="3" fill="#FFF8DC" opacity="0.7" />
      <rect x="-2" y="-2" width="28" height="4" rx="1" fill="#A0622D" />
    </g>
  );
}

function ChainsFeature({ x = 235, y = 70 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="5" cy="5" rx="3" ry="4" fill="none" stroke="#999" strokeWidth="1.5" />
      <ellipse cx="5" cy="12" rx="2.5" ry="3.5" fill="none" stroke="#888" strokeWidth="1.5" />
      <ellipse cx="5" cy="19" rx="3" ry="4" fill="none" stroke="#999" strokeWidth="1.5" />
      <ellipse cx="5" cy="26" rx="2.5" ry="3.5" fill="none" stroke="#888" strokeWidth="1.5" />
      <ellipse cx="18" cy="8" rx="3" ry="4" fill="none" stroke="#999" strokeWidth="1.5" />
      <ellipse cx="18" cy="15" rx="2.5" ry="3.5" fill="none" stroke="#888" strokeWidth="1.5" />
      <ellipse cx="18" cy="22" rx="3" ry="4" fill="none" stroke="#999" strokeWidth="1.5" />
    </g>
  );
}

function TorchSconceFeature({ x = 240, y = 120 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="3" y="6" width="5" height="14" fill="#8B7355" />
      <rect x="1" y="4" width="9" height="3" rx="1" fill="#A08050" />
      <ellipse cx="5" cy="2" rx="4" ry="4" fill="#FF6B35" />
      <ellipse cx="5" cy="0" rx="3" ry="3" fill="#FFD700" />
    </g>
  );
}

function TreesFeature({ x = 20, y = 60 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="60" width="8" height="40" fill="#6d4a2e" />
      <circle cx="4" cy="50" r="14" fill="#3d7a2a" />
      <circle cx="4" cy="40" r="10" fill="#4a9e3e" />
      <rect x="190" y="65" width="6" height="35" fill="#6d4a2e" />
      <circle cx="193" cy="55" r="12" fill="#3d7a2a" />
      <circle cx="193" cy="46" r="8" fill="#4a9e3e" />
    </g>
  );
}

function MushroomsFeature({ x = 60, y = 200 }: FeatureProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="6" width="3" height="6" fill="#F5DEB3" />
      <ellipse cx="1.5" cy="5" rx="5" ry="4" fill="#DC143C" />
      <circle cx="-1" cy="4" r="1" fill="#FFF" />
      <circle cx="3" cy="3" r="1" fill="#FFF" />
      <rect x="20" y="8" width="2" height="5" fill="#F5DEB3" />
      <ellipse cx="21" cy="7" rx="4" ry="3" fill="#FFD700" />
    </g>
  );
}

const FEATURE_REGISTRY: Record<RoomFeatureId, (props: FeatureProps) => React.JSX.Element> = {
  window: WindowFeature,
  "curtained-window": CurtainedWindowFeature,
  fireplace: FireplaceFeature,
  chains: ChainsFeature,
  "torch-sconce": TorchSconceFeature,
  trees: TreesFeature,
  mushrooms: MushroomsFeature,
};

export function RoomFeature({ featureId, x, y }: { featureId: RoomFeatureId; x?: number; y?: number }) {
  const Feature = FEATURE_REGISTRY[featureId];
  if (!Feature) return null;
  return <Feature x={x} y={y} />;
}
