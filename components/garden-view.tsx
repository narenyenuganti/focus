"use client";

import { GardenScene } from "@/components/garden-scene";

type GardenViewProps = {
  seeds: number;
  plantsCount: number;
  streakDays: number;
  owned: ReadonlySet<string>;
  theme: string;
};

export function GardenView({
  seeds,
  plantsCount,
  streakDays,
  owned,
  theme,
}: GardenViewProps) {
  const ownedByCategory = groupOwned(owned);

  return (
    <div className="view">
      <GardenScene theme={theme} owned={owned} />

      <div className="garden-layout">
        <div>
          <h2
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 40,
              letterSpacing: "-0.03em",
              margin: "0 0 12px",
              lineHeight: 1,
            }}
          >
            Your garden,{" "}
            <em style={{ color: "var(--accent)" }}>tended</em>.
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: "46ch", margin: 0 }}>
            Each completed session plants something small. Tap the creatures to
            say hello — they remember who fed them. Rearrange freely; the garden
            keeps its own time.
          </p>
          <div className="rule-orn">
            <span className="diamond">· · ·</span>
          </div>
          <div style={{ display: "flex", gap: 40, fontSize: 13 }}>
            <Meta label="Streak" value={`${streakDays} days`} />
            <Meta label="Hours earned" value={`${seeds}`} />
            <Meta label="Plants" value={`${plantsCount}`} />
          </div>
        </div>

        <div className="garden-sidebar">
          <h3 className="section-head">Inventory</h3>
          {ownedByCategory.length === 0 ? (
            <p className="small-p">
              Nothing in the garden yet. Focus for a spell, then visit the
              market.
            </p>
          ) : (
            <div className="inventory-list">
              {ownedByCategory.map(([name, count]) => (
                <div className="inventory-row" key={name}>
                  <span className="name">{name}</span>
                  <span className="count">×{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontStyle: "italic",
          fontSize: 20,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function groupOwned(owned: ReadonlySet<string>): Array<[string, number]> {
  // Simple pluralizer: capitalize, show ×1 for each purchased item.
  const names = Array.from(owned).map(humanize);
  const counts = new Map<string, number>();
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
  return Array.from(counts.entries());
}

function humanize(id: string) {
  return id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
