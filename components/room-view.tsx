"use client";

import { Bean, type BeanState } from "@/components/bean";
import { ZeldaHero } from "@/components/zelda-hero";
import { getDecoration } from "@/lib/decoration-catalog";
import { getCurrentRoomVariant } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";
import type { RoomPlacements } from "@/lib/economy-types";

const WALL_SLOTS = ["wall-1", "wall-2", "wall-3", "wall-4"] as const;
const FLOOR_SLOTS = ["floor-1", "floor-2", "floor-3", "floor-4"] as const;

const WALL_POSITIONS: Record<string, { top: string; left: string }> = {
  "wall-1": { top: "8%", left: "8%" },
  "wall-2": { top: "8%", left: "75%" },
  "wall-3": { top: "30%", left: "5%" },
  "wall-4": { top: "30%", left: "80%" },
};

const FLOOR_POSITIONS: Record<string, { bottom: string; left: string }> = {
  "floor-1": { bottom: "8%", left: "5%" },
  "floor-2": { bottom: "8%", left: "75%" },
  "floor-3": { bottom: "28%", left: "10%" },
  "floor-4": { bottom: "28%", left: "72%" },
};

type RoomViewProps = {
  beanState: BeanState;
  socksEarned?: number;
  placements: RoomPlacements["placements"];
  theme: ThemeConfig;
  children?: React.ReactNode;
};

export function RoomView({ beanState, socksEarned, placements, theme, children }: RoomViewProps) {
  const roomVariant = getCurrentRoomVariant(theme);

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
      {/* Wall */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60%",
          background: roomVariant.wallColor,
        }}
      />
      {/* Floor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: roomVariant.floorColor,
          borderTop: "2px solid var(--border)",
        }}
      />

      {/* Wall decorations */}
      {WALL_SLOTS.map((slotId) => {
        const itemId = placements[slotId];
        const decoration = itemId ? getDecoration(itemId) : null;
        const pos = WALL_POSITIONS[slotId];
        return decoration ? (
          <span
            key={slotId}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              fontSize: 28,
              zIndex: 2,
            }}
            title={decoration.name}
          >
            {decoration.emoji}
          </span>
        ) : null;
      })}

      {/* Floor decorations */}
      {FLOOR_SLOTS.map((slotId) => {
        const itemId = placements[slotId];
        const decoration = itemId ? getDecoration(itemId) : null;
        const pos = FLOOR_POSITIONS[slotId];
        return decoration ? (
          <span
            key={slotId}
            style={{
              position: "absolute",
              bottom: pos.bottom,
              left: pos.left,
              fontSize: 28,
              zIndex: 2,
            }}
            title={decoration.name}
          >
            {decoration.emoji}
          </span>
        ) : null;
      })}

      {/* Character (centered in room) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
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
