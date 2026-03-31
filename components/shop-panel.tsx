"use client";

import { useState } from "react";
import { DECORATION_CATALOG, type DecorationCategory } from "@/lib/decoration-catalog";

type ShopPanelProps = {
  socks: number;
  purchased: string[];
  onPurchase: (itemId: string) => void;
};

const CATEGORIES: { id: DecorationCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wall", label: "Wall" },
  { id: "floor", label: "Floor" },
  { id: "furniture", label: "Furniture" },
];

export function ShopPanel({ socks, purchased, onPurchase }: ShopPanelProps) {
  const [filter, setFilter] = useState<DecorationCategory | "all">("all");

  const items = filter === "all"
    ? DECORATION_CATALOG
    : DECORATION_CATALOG.filter((item) => item.category === filter);

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {/* Category filters */}
      <div style={{ display: "flex", gap: 8 }}>
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

      {/* Item grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
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
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{item.cost} 🧦</span>
              {owned ? (
                <span data-owned style={{ fontSize: 12, color: "var(--accent)" }}>Owned</span>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  disabled={!canAfford}
                  onClick={() => onPurchase(item.id)}
                  aria-label={`Buy ${item.name}`}
                  style={{ padding: "8px 12px", fontSize: 13 }}
                >
                  Buy
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Room unlock progress */}
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--card)",
          textAlign: "center",
        }}
      >
        <strong>Next Room</strong>
        <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 8px" }}>
          🧦 {Math.min(socks, 1000)} / 1,000
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
    </section>
  );
}
