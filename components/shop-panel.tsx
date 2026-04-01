"use client";

import { useState } from "react";
import { getDecorationsForTheme, type DecorationCategory, type ThemeId } from "@/lib/decoration-catalog";
import { ROOM_CATALOG } from "@/lib/room-catalog";
import { DecorationSprite } from "@/components/sprites/decorations";

type ShopPanelProps = {
  socks: number;
  purchased: string[];
  onPurchase: (itemId: string) => void;
  themeId: ThemeId;
  currencyIcon: string;
  unlockedRooms: string[];
  selectedRoom: string;
  onUnlockRoom: (roomId: string) => void;
  onSelectRoom: (roomId: string) => void;
};

type FilterId = DecorationCategory | "all" | "rooms";

const CATEGORIES: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wall", label: "Wall" },
  { id: "floor", label: "Floor" },
  { id: "furniture", label: "Furniture" },
  { id: "rooms", label: "Rooms" },
];

export function ShopPanel({
  socks,
  purchased,
  onPurchase,
  themeId,
  currencyIcon,
  unlockedRooms,
  selectedRoom,
  onUnlockRoom,
  onSelectRoom,
}: ShopPanelProps) {
  const [filter, setFilter] = useState<FilterId>("all");

  const themeDecorations = getDecorationsForTheme(themeId);
  const decorationItems = filter === "all"
    ? themeDecorations
    : filter === "rooms"
      ? []
      : themeDecorations.filter((item) => item.category === filter);

  const showRooms = filter === "rooms";

  return (
    <section style={{ display: "grid", gap: 16, width: "100%" }}>
      {/* Category filters */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={filter === cat.id ? "nav-pill is-active" : "nav-pill"}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Room variants grid */}
      {showRooms && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, width: "100%" }}>
          {ROOM_CATALOG.map((room) => {
            const isUnlocked = unlockedRooms.includes(room.id);
            const isSelected = selectedRoom === room.id;
            const canAfford = socks >= room.cost;
            return (
              <div
                key={room.id}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: isSelected ? "var(--pill-bg)" : "var(--card)",
                  display: "grid",
                  gap: 8,
                  textAlign: "center",
                }}
              >
                {/* Mini room preview */}
                <svg
                  viewBox="0 0 80 60"
                  width="80"
                  height="60"
                  style={{ imageRendering: "pixelated", margin: "0 auto" }}
                  shapeRendering="crispEdges"
                >
                  <polygon points="5,15 65,15 65,40 5,40" fill={room.wallColor} stroke={room.baseboardColor} strokeWidth="1" />
                  <polygon points="65,15 75,10 75,50 65,40" fill={room.wallDarkColor} stroke={room.baseboardColor} strokeWidth="1" />
                  <polygon points="5,40 65,40 75,50 75,58 0,58 0,45" fill={room.floorColor} stroke={room.baseboardColor} strokeWidth="1" />
                </svg>
                <strong style={{ fontSize: 14 }}>{room.name}</strong>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{room.description}</span>
                {room.cost === 0 ? (
                  <span style={{ fontSize: 12, color: "var(--accent)" }}>Free</span>
                ) : (
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{room.cost} {currencyIcon}</span>
                )}
                {isUnlocked ? (
                  isSelected ? (
                    <span style={{ fontSize: 12, color: "var(--accent)" }}>Active</span>
                  ) : (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => onSelectRoom(room.id)}
                      style={{ padding: "8px 12px", fontSize: 13, width: "100%" }}
                    >
                      Select
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    className="primary-button"
                    disabled={!canAfford}
                    onClick={() => onUnlockRoom(room.id)}
                    aria-label={`Unlock ${room.name}`}
                    style={{ padding: "8px 12px", fontSize: 13, width: "100%" }}
                  >
                    Unlock
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decoration items grid */}
      {!showRooms && (
        <>
          {/* Room unlock progress */}
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--card)",
              textAlign: "center",
              width: "100%",
            }}
          >
            <strong>Next Room</strong>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 8px" }}>
              {currencyIcon} {Math.min(socks, 1000)} / 1,000
            </p>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: "var(--border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, (socks / 1000) * 100)}%`,
                  borderRadius: 4,
                  background: "var(--action)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Item grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, width: "100%" }}>
            {decorationItems.map((item) => {
              const owned = purchased.includes(item.id);
              const canAfford = socks >= item.cost;
              return (
                <div
                  key={item.id}
                  data-item-id={item.id}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: owned ? "var(--pill-bg)" : "var(--card)",
                    opacity: owned ? 0.7 : 1,
                    display: "grid",
                    gap: 8,
                    textAlign: "center",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    style={{ imageRendering: "pixelated", margin: "0 auto" }}
                    shapeRendering="crispEdges"
                  >
                    <DecorationSprite spriteId={item.sprite} x={4} y={4} />
                  </svg>
                  <strong style={{ fontSize: 14 }}>{item.name}</strong>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{item.cost} {currencyIcon}</span>
                  {owned ? (
                    <span data-owned style={{ fontSize: 12, color: "var(--accent)" }}>Owned</span>
                  ) : (
                    <button
                      type="button"
                      className="primary-button"
                      disabled={!canAfford}
                      onClick={() => onPurchase(item.id)}
                      aria-label={`Buy ${item.name}`}
                      style={{ padding: "8px 12px", fontSize: 13, width: "100%" }}
                    >
                      Buy
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
