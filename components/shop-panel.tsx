"use client";

import { useState } from "react";
import { getDecorationsForTheme, type DecorationCategory, type ThemeId } from "@/lib/decoration-catalog";

type ShopPanelProps = {
  socks: number;
  purchased: string[];
  onPurchase: (itemId: string) => void;
  themeId: ThemeId;
  currencyIcon: string;
};

const CATEGORIES: { id: DecorationCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wall", label: "Wall" },
  { id: "floor", label: "Floor" },
  { id: "furniture", label: "Furniture" },
];

export function ShopPanel({ socks, purchased, onPurchase, themeId, currencyIcon }: ShopPanelProps) {
  const [filter, setFilter] = useState<DecorationCategory | "all">("all");

  const themeDecorations = getDecorationsForTheme(themeId);
  const items = filter === "all"
    ? themeDecorations
    : themeDecorations.filter((item) => item.category === filter);

  return (
    <section style={{ display: "grid", gap: 16, width: "100%" }}>
      {/* Category filters */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
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
        {items.map((item) => {
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
              <span style={{ fontSize: 32 }}>{item.emoji}</span>
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
    </section>
  );
}
