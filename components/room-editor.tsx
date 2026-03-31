"use client";

import { useState } from "react";
import { getDecoration } from "@/lib/decoration-catalog";
import type { RoomPlacements } from "@/lib/economy-types";

const ALL_SLOTS = [
  "wall-1", "wall-2", "wall-3", "wall-4",
  "floor-1", "floor-2", "floor-3", "floor-4",
] as const;

const SLOT_POSITIONS: Record<string, React.CSSProperties> = {
  "wall-1": { position: "absolute", top: "8%", left: "8%" },
  "wall-2": { position: "absolute", top: "8%", left: "75%" },
  "wall-3": { position: "absolute", top: "30%", left: "5%" },
  "wall-4": { position: "absolute", top: "30%", left: "80%" },
  "floor-1": { position: "absolute", bottom: "8%", left: "5%" },
  "floor-2": { position: "absolute", bottom: "8%", left: "75%" },
  "floor-3": { position: "absolute", bottom: "28%", left: "10%" },
  "floor-4": { position: "absolute", bottom: "28%", left: "72%" },
};

type RoomEditorProps = {
  placements: RoomPlacements["placements"];
  purchased: string[];
  onPlace: (slotId: string, itemId: string) => void;
  onRemove: (slotId: string) => void;
};

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
      {/* Room with slots */}
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
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60%", background: "var(--wall)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "var(--floor)", borderTop: "2px solid var(--border)" }} />

        {ALL_SLOTS.map((slotId) => {
          const itemId = placements[slotId];
          const decoration = itemId ? getDecoration(itemId) : null;
          const pos = SLOT_POSITIONS[slotId];

          return (
            <button
              key={slotId}
              type="button"
              aria-label={decoration ? `${decoration.name} in ${slotId} — click to remove` : `Empty slot ${slotId}`}
              onClick={() => handleSlotClick(slotId)}
              style={{
                ...pos,
                width: 48,
                height: 48,
                borderRadius: 10,
                border: decoration ? "2px solid var(--accent)" : "2px dashed var(--border)",
                background: decoration ? "rgba(29, 90, 93, 0.08)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                cursor: "pointer",
                zIndex: 5,
              }}
            >
              {decoration ? decoration.emoji : ""}
            </button>
          );
        })}
      </div>

      {/* Inventory bar */}
      <div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          {selectedItem ? "Now click a slot to place it" : "Select an item to place"}
        </p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
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
              <span style={{ fontSize: 24 }}>{item!.emoji}</span>
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
