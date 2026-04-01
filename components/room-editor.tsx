"use client";

import { useState } from "react";
import { getDecoration } from "@/lib/decoration-catalog";
import { DecorationSprite } from "@/components/sprites/decorations";
import type { RoomPlacements } from "@/lib/economy-types";

const WALL_SLOTS = ["wall-1", "wall-2", "wall-3", "wall-4"] as const;
const FLOOR_SLOTS = ["floor-1", "floor-2", "floor-3", "floor-4"] as const;

type RoomEditorProps = {
  placements: RoomPlacements["placements"];
  purchased: string[];
  onPlace: (slotId: string, itemId: string) => void;
  onRemove: (slotId: string) => void;
};

function SlotButton({
  slotId,
  placements,
  onClick,
}: {
  slotId: string;
  placements: RoomPlacements["placements"];
  onClick: (slotId: string) => void;
}) {
  const itemId = placements[slotId];
  const decoration = itemId ? getDecoration(itemId) : null;

  return (
    <button
      type="button"
      aria-label={decoration ? `${decoration.name} in ${slotId} — click to remove` : `Empty slot ${slotId}`}
      onClick={() => onClick(slotId)}
      style={{
        width: 56,
        height: 56,
        borderRadius: 12,
        border: decoration ? "2px solid var(--accent)" : "2px dashed var(--border)",
        background: decoration ? "rgba(29, 90, 93, 0.08)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {decoration ? (
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ imageRendering: "pixelated" }} shapeRendering="crispEdges">
          <DecorationSprite spriteId={decoration.sprite} x={4} y={4} />
        </svg>
      ) : null}
    </button>
  );
}

export function RoomEditor({ placements, purchased, onPlace, onRemove }: RoomEditorProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const placedItemIds = new Set(Object.values(placements));
  const unplacedItems = purchased
    .filter((id) => !placedItemIds.has(id))
    .map((id) => getDecoration(id))
    .filter(Boolean);

  function handleSlotClick(slotId: string) {
    const currentItem = placements[slotId];
    if (currentItem) {
      onRemove(slotId);
      return;
    }
    if (selectedItem) {
      onPlace(slotId, selectedItem);
      setSelectedItem(null);
    }
  }

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {/* Room with grid-based slots */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          borderRadius: 20,
          overflow: "hidden",
          border: "2px solid var(--border)",
          background: "var(--card)",
        }}
      >
        {/* Wall section */}
        <div
          style={{
            background: "var(--wall)",
            padding: "20px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 56px)",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {WALL_SLOTS.map((slotId) => (
            <SlotButton key={slotId} slotId={slotId} placements={placements} onClick={handleSlotClick} />
          ))}
        </div>

        {/* Floor section */}
        <div
          style={{
            background: "var(--floor)",
            borderTop: "2px solid var(--border)",
            padding: "20px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 56px)",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {FLOOR_SLOTS.map((slotId) => (
            <SlotButton key={slotId} slotId={slotId} placements={placements} onClick={handleSlotClick} />
          ))}
        </div>
      </div>

      {/* Inventory bar */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          {selectedItem ? "Now click a slot to place it" : "Select an item to place"}
        </p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, justifyContent: "center" }}>
          {unplacedItems.map((item) => (
            <button
              key={item!.id}
              type="button"
              onClick={() => setSelectedItem(item!.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: selectedItem === item!.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                background: selectedItem === item!.id ? "var(--pill-bg)" : "var(--card)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" style={{ imageRendering: "pixelated" }} shapeRendering="crispEdges">
                <DecorationSprite spriteId={item!.sprite} x={2} y={2} />
              </svg>
              <span style={{ fontSize: 11, whiteSpace: "nowrap" }}>{item!.name}</span>
            </button>
          ))}
          {unplacedItems.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>No unplaced items. Visit the shop!</p>
          )}
        </div>
      </div>
    </section>
  );
}
