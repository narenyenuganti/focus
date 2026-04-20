"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GardenGlyph } from "@/components/garden-glyph";
import {
  GARDEN_CATALOG,
  GARDEN_CATEGORIES,
  RARITY_LABEL,
  getGardenItem,
  type GardenCategory,
  type GardenRarity,
} from "@/lib/garden-catalog";

type ShopPanelProps = {
  socks: number;
  purchased: string[];
  onPurchase: (itemId: string) => void;
};

type FilterCategory = "All" | GardenCategory;
type FilterRarity = "any" | GardenRarity;

const FEATURED_ID = "sakura";
const RARITIES: FilterRarity[] = ["any", "common", "rare", "legendary"];

export function ShopPanel({ socks, purchased, onPurchase }: ShopPanelProps) {
  const [cat, setCat] = useState<FilterCategory>("All");
  const [rarity, setRarity] = useState<FilterRarity>("any");
  const [query, setQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!catOpen) return;
    const onDown = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [catOpen]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<FilterCategory, number>();
    counts.set("All", GARDEN_CATALOG.length);
    for (const c of GARDEN_CATEGORIES) {
      counts.set(c, GARDEN_CATALOG.filter((item) => item.cat === c).length);
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GARDEN_CATALOG.filter((item) => {
      if (cat !== "All" && item.cat !== cat) return false;
      if (rarity !== "any" && item.rarity !== rarity) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cat, rarity, query]);

  const featured = getGardenItem(FEATURED_ID) ?? GARDEN_CATALOG[0];
  const ownedCount = purchased.filter((id) =>
    GARDEN_CATALOG.some((item) => item.id === id),
  ).length;

  return (
    <section>
      <div className="section-head">
        <h2 className="serif">
          The <em>market</em>
        </h2>
        <div className="market-head-meta">
          <span>
            <strong className="mono">{socks}</strong> seeds
          </span>
          <span className="sep">·</span>
          <span>
            <strong className="mono">{ownedCount}</strong> of {GARDEN_CATALOG.length} owned
          </span>
        </div>
      </div>

      <article className="market-hero">
        <div className="mh-art">
          <div className="mh-art-bg" />
          <GardenGlyph kind={featured.glyph} size={220} />
          <span className="mh-tag">This week's bloom</span>
        </div>
        <div className="mh-copy">
          <div className="mh-eyebrow">
            {RARITY_LABEL[featured.rarity]} · {featured.cat.slice(0, -1)}
          </div>
          <h3 className="serif">{featured.name}</h3>
          <p>
            {featured.blurb} Plant one this week and it blooms through every focused
            session, shedding petals that drift across the whole garden.
          </p>
          <div className="mh-actions">
            <button
              type="button"
              className="btn primary"
              disabled={purchased.includes(featured.id) || socks < featured.cost}
              onClick={() => onPurchase(featured.id)}
            >
              {purchased.includes(featured.id)
                ? "In your garden"
                : `Acquire for ${featured.cost} seeds →`}
            </button>
            <button type="button" className="btn ghost">
              Preview in garden
            </button>
          </div>
          <div className="mh-meta">
            <div>
              <span className="k">Bloom time</span>
              <span className="v">7 days</span>
            </div>
            <div>
              <span className="k">Grows in</span>
              <span className="v">Open ground</span>
            </div>
            <div>
              <span className="k">Pairs with</span>
              <span className="v">Lantern, pond</span>
            </div>
          </div>
        </div>
      </article>

      <div className="market-toolbar">
        <div className={`cat-dropdown ${catOpen ? "open" : ""}`} ref={catRef}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={catOpen}
            onClick={() => setCatOpen((o) => !o)}
          >
            <span>{cat}</span>
            <span className="caret" aria-hidden="true">
              ▾
            </span>
          </button>
          <div className="cat-menu" role="listbox">
            {(["All", ...GARDEN_CATEGORIES] as FilterCategory[]).map((c) => (
              <button
                key={c}
                type="button"
                role="option"
                aria-selected={cat === c}
                className={c === cat ? "on" : ""}
                onClick={() => {
                  setCat(c);
                  setCatOpen(false);
                }}
              >
                <span>{c}</span>
                <span className="count">{categoryCounts.get(c) ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
        <div />
        <div className="toolbar-right">
          <div className="rarity-pills" role="tablist" aria-label="Rarity">
            {RARITIES.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={rarity === r}
                className={rarity === r ? "on" : ""}
                onClick={() => setRarity(r)}
              >
                {r === "any" ? "All rarities" : RARITY_LABEL[r]}
              </button>
            ))}
          </div>
          <label className="market-search">
            <span className="sr-only">Search seeds</span>
            <input
              type="search"
              placeholder="Search seeds…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="market-grid">
        {filtered.map((item) => {
          const owned = purchased.includes(item.id);
          const canAfford = socks >= item.cost;
          return (
            <article
              key={item.id}
              data-item-id={item.id}
              className={`mg-card r-${item.rarity} ${owned ? "owned" : ""}`}
            >
              <div className="mg-ribbon">{RARITY_LABEL[item.rarity]}</div>
              <div className="mg-art">
                <div className="mg-art-glow" />
                <GardenGlyph kind={item.glyph} size={110} />
              </div>
              <div className="mg-name">
                <strong>{item.name}</strong>
                <span className="mg-cat">{item.cat}</span>
              </div>
              <p className="mg-blurb">{item.blurb}</p>
              <div className="mg-foot">
                <span className="mg-price">
                  <span className="seed-dot" />
                  <span className="mono">{item.cost}</span>
                  <span className="mg-price-unit">seeds</span>
                </span>
                <button
                  type="button"
                  className="mg-buy"
                  disabled={owned || !canAfford}
                  onClick={() => onPurchase(item.id)}
                  aria-label={owned ? `${item.name} owned` : `Acquire ${item.name}`}
                >
                  {owned ? "Owned" : !canAfford ? "Save up" : "Acquire →"}
                </button>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 ? (
          <div className="mg-empty">Nothing here by that name. Try a different filter.</div>
        ) : null}
      </div>

      <div className="market-footnote">
        <div>
          <div className="k">How seeds work</div>
          <p>
            One seed for every minute of focus. Seeds never expire; legendary items
            unlock after a streak.
          </p>
        </div>
        <div>
          <div className="k">Refund policy</div>
          <p>Uproot anything within a week for a full refund. The garden holds no grudges.</p>
        </div>
        <div>
          <div className="k">Coming soon</div>
          <p>Seasonal collections, gifting a seed to a friend, and a tiny shed for tools.</p>
        </div>
      </div>
    </section>
  );
}
