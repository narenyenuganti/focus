"use client";

import { useMemo, useState } from "react";
import { GardenGlyph } from "@/components/garden-glyph";
import {
  GARDEN_CATALOG,
  GARDEN_CATEGORIES,
  type GardenCategory,
} from "@/lib/garden-catalog";

type ShopPanelProps = {
  socks: number;
  purchased: string[];
  onPurchase: (itemId: string) => void;
};

type FilterCategory = "All" | GardenCategory;

const FILTERS: FilterCategory[] = ["All", ...GARDEN_CATEGORIES];

export function ShopPanel({ socks, purchased, onPurchase }: ShopPanelProps) {
  const [cat, setCat] = useState<FilterCategory>("All");

  const items = useMemo(() => {
    return cat === "All" ? GARDEN_CATALOG : GARDEN_CATALOG.filter((item) => item.cat === cat);
  }, [cat]);

  return (
    <section className="view">
      <div className="market-head">
        <h2>Market</h2>
        <div className="balance">
          <div className="label">Balance</div>
          <span className="val">{socks}h</span>
        </div>
      </div>

      <div className="market-categories" role="tablist" aria-label="Category">
        {FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            className={cat === c ? "active" : ""}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="market-grid-v4">
        {items.map((item) => {
          const owned = purchased.includes(item.id);
          const canAfford = socks >= item.cost;
          return (
            <button
              key={item.id}
              type="button"
              data-item-id={item.id}
              className={`market-card ${owned ? "owned" : ""}`}
              disabled={owned || !canAfford}
              onClick={() => {
                if (!owned) onPurchase(item.id);
              }}
              title={item.blurb}
            >
              <div className="art">
                <GardenGlyph kind={item.glyph} size={96} />
              </div>
              <h3 className="name">{item.name}</h3>
              <div className="meta">
                <span className={`price ${owned ? "owned-tag" : ""}`}>
                  {owned ? "Owned" : `${item.cost}h`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
