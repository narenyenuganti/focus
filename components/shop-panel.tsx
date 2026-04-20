"use client";

import { useState } from "react";
import {
  getDecorationsForTheme,
  type DecorationCategory,
  type ThemeId,
} from "@/lib/decoration-catalog";
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

function formatCategory(category: DecorationCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

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
  const decorationItems =
    filter === "all"
      ? themeDecorations
      : filter === "rooms"
        ? []
        : themeDecorations.filter((item) => item.category === filter);

  const showRooms = filter === "rooms";

  return (
    <section>
      <div className="section-head">
        <h2 className="serif">
          The <em>market</em>
        </h2>
        <span className="meta">{socks} seeds to spend</span>
      </div>

      <div className="filters" role="tablist">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={filter === cat.id}
            className={filter === cat.id ? "is-active" : ""}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {showRooms ? (
        <div className="market">
          {ROOM_CATALOG.map((room) => {
            const isUnlocked = unlockedRooms.includes(room.id);
            const isSelected = selectedRoom === room.id;
            const canAfford = socks >= room.cost;
            return (
              <article key={room.id} className={`market-item ${isUnlocked ? "owned" : ""}`}>
                <div className="art">
                  <svg viewBox="0 0 80 60" width="96" height="72" shapeRendering="crispEdges">
                    <polygon
                      points="5,15 65,15 65,40 5,40"
                      fill={room.wallColor}
                      stroke={room.baseboardColor}
                      strokeWidth="1"
                    />
                    <polygon
                      points="65,15 75,10 75,50 65,40"
                      fill={room.wallDarkColor}
                      stroke={room.baseboardColor}
                      strokeWidth="1"
                    />
                    <polygon
                      points="5,40 65,40 75,50 75,58 0,58 0,45"
                      fill={room.floorColor}
                      stroke={room.baseboardColor}
                      strokeWidth="1"
                    />
                  </svg>
                </div>
                <div className="name">
                  <strong>{room.name}</strong>
                  <span className="cat">Room</span>
                </div>
                <div className="buy">
                  <span className="price">
                    {room.cost === 0 ? "Free" : room.cost}
                    {room.cost > 0 ? <span className="unit"> seeds</span> : null}
                  </span>
                  {isUnlocked ? (
                    <button
                      type="button"
                      disabled={isSelected}
                      onClick={() => onSelectRoom(room.id)}
                      aria-label={`Select ${room.name}`}
                    >
                      {isSelected ? "Active ✓" : "Select →"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onUnlockRoom(room.id)}
                      aria-label={`Unlock ${room.name}`}
                    >
                      Unlock →
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="market">
          {decorationItems.map((item) => {
            const owned = purchased.includes(item.id);
            const canAfford = socks >= item.cost;
            return (
              <article
                key={item.id}
                data-item-id={item.id}
                className={`market-item ${owned ? "owned" : ""}`}
              >
                <div className="art">
                  <svg width="80" height="80" viewBox="0 0 40 40" shapeRendering="crispEdges">
                    <DecorationSprite spriteId={item.sprite} x={4} y={4} />
                  </svg>
                </div>
                <div className="name">
                  <strong>{item.name}</strong>
                  <span className="cat">{formatCategory(item.category)}</span>
                </div>
                <div className="buy">
                  <span className="price">
                    {item.cost}
                    <span className="unit"> {currencyIcon || "seeds"}</span>
                  </span>
                  {owned ? (
                    <button type="button" data-owned>
                      Owned ✓
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onPurchase(item.id)}
                      aria-label={`Buy ${item.name}`}
                    >
                      Acquire →
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
