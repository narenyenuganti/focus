"use client";

import { Bean, type BeanState } from "@/components/bean";
import { ZeldaHero } from "@/components/zelda-hero";
import { getDecoration } from "@/lib/decoration-catalog";
import { getRoomVariant, type RoomVariantDef } from "@/lib/room-catalog";
import { RoomFeature } from "@/components/sprites/room-features";
import { DecorationSprite } from "@/components/sprites/decorations";
import type { ThemeConfig } from "@/lib/themes";
import type { RoomPlacements } from "@/lib/economy-types";

const WALL_SLOTS = ["wall-1", "wall-2", "wall-3", "wall-4"] as const;
const FLOOR_SLOTS = ["floor-1", "floor-2", "floor-3", "floor-4"] as const;

type RoomViewProps = {
  beanState: BeanState;
  socksEarned?: number;
  placements: RoomPlacements["placements"];
  theme: ThemeConfig;
  roomId?: string;
  children?: React.ReactNode;
};

function IsometricRoom({ room, placements }: { room: RoomVariantDef; placements: RoomPlacements["placements"] }) {
  return (
    <svg
      viewBox="0 0 280 270"
      width="100%"
      style={{ imageRendering: "pixelated", display: "block" }}
      shapeRendering="crispEdges"
    >
      {/* Back wall */}
      <polygon
        points="20,60 240,60 240,170 20,170"
        fill={room.wallColor}
        stroke={room.baseboardColor}
        strokeWidth="2"
      />
      {/* Wall texture lines */}
      <line x1="20" y1="88" x2="240" y2="88" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />
      <line x1="20" y1="115" x2="240" y2="115" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />
      <line x1="20" y1="142" x2="240" y2="142" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />

      {/* Side wall (right) */}
      <polygon
        points="240,60 270,40 270,190 240,170"
        fill={room.wallDarkColor}
        stroke={room.baseboardColor}
        strokeWidth="2"
      />
      <line x1="240" y1="88" x2="270" y2="73" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />
      <line x1="240" y1="115" x2="270" y2="105" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />
      <line x1="240" y1="142" x2="270" y2="137" stroke={room.baseboardColor} strokeWidth="1" opacity="0.3" />

      {/* Floor */}
      <polygon
        points="20,170 240,170 270,190 270,260 0,260 0,190"
        fill={room.floorColor}
        stroke={room.baseboardColor}
        strokeWidth="2"
      />
      {/* Floor board lines */}
      <line x1="0" y1="210" x2="270" y2="210" stroke={room.floorDarkColor} strokeWidth="1" opacity="0.4" />
      <line x1="0" y1="230" x2="270" y2="230" stroke={room.floorDarkColor} strokeWidth="1" opacity="0.4" />
      <line x1="0" y1="250" x2="270" y2="250" stroke={room.floorDarkColor} strokeWidth="1" opacity="0.4" />

      {/* Shadow at wall base */}
      <rect x="20" y="170" width="220" height="6" fill="rgba(0,0,0,0.1)" />

      {/* Room features */}
      {room.features.map((featureId) => (
        <RoomFeature key={featureId} featureId={featureId} />
      ))}

      {/* Wall decorations */}
      {WALL_SLOTS.map((slotId, i) => {
        const itemId = placements[slotId];
        const decoration = itemId ? getDecoration(itemId) : null;
        const pos = room.wallSlots[i];
        return decoration ? (
          <DecorationSprite key={slotId} spriteId={decoration.sprite} x={pos.x} y={pos.y} />
        ) : null;
      })}

      {/* Floor decorations */}
      {FLOOR_SLOTS.map((slotId, i) => {
        const itemId = placements[slotId];
        const decoration = itemId ? getDecoration(itemId) : null;
        const pos = room.floorSlots[i];
        return decoration ? (
          <DecorationSprite key={slotId} spriteId={decoration.sprite} x={pos.x} y={pos.y} />
        ) : null;
      })}
    </svg>
  );
}

export function RoomView({ beanState, socksEarned, placements, theme, roomId = "basic", children }: RoomViewProps) {
  const room = getRoomVariant(roomId) ?? getRoomVariant("basic")!;

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          borderRadius: 20,
          overflow: "hidden",
          border: "2px solid var(--border)",
          background: "var(--card)",
          minHeight: 320,
        }}
      >
        <IsometricRoom room={room} placements={placements} />

        {/* Character (centered on floor plane) */}
        <div
          style={{
            position: "absolute",
            top: "75%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}
        >
          {theme.id === "zelda" ? (
            <ZeldaHero
              state={beanState}
              currencyEarned={socksEarned}
              currencyIcon={theme.currencyIcon}
              theme={theme}
            />
          ) : (
            <Bean state={beanState} socksEarned={socksEarned} currencyIcon={theme.currencyIcon} />
          )}
        </div>
      </div>

      {/* Timer display below room */}
      {children && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          {children}
        </div>
      )}
    </>
  );
}
