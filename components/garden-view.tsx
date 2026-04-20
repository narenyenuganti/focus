"use client";

import { GardenGlyph, type GlyphKind } from "@/components/garden-glyph";

type GardenPlant = {
  key: string;
  kind: GlyphKind;
  label: string;
  size: number;
};

type GardenViewProps = {
  plants: GardenPlant[];
  seeds: number;
  todayMinutes: number;
  weeklyMinutes: number;
  streakDays: number;
};

export function GardenView({
  plants,
  seeds,
  todayMinutes,
  weeklyMinutes,
  streakDays,
}: GardenViewProps) {
  return (
    <>
      <div className="section-head">
        <h2 className="serif">
          Your <em>garden</em>
        </h2>
        <span className="meta">Grown over {streakDays} days</span>
      </div>

      <div className="garden" role="img" aria-label="Focus garden">
        <div className="garden-sun" aria-hidden="true" />
        <div className="garden-ground" aria-hidden="true" />
        {plants.length > 0 ? (
          <div className="garden-plot">
            {plants.map((plant) => (
              <div key={plant.key} className="plant">
                <GardenGlyph kind={plant.kind} size={plant.size} />
                <span className="plant-label">{plant.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="garden-stats">
        <div>
          <span className="k">Seeds</span>
          <span className="v mono">{seeds}</span>
        </div>
        <div>
          <span className="k">Plants</span>
          <span className="v mono">{plants.length}</span>
        </div>
        <div>
          <span className="k">Today</span>
          <span className="v mono">
            {todayMinutes}
            <small>m</small>
          </span>
        </div>
        <div>
          <span className="k">Week</span>
          <span className="v mono">
            {weeklyMinutes}
            <small>m</small>
          </span>
        </div>
      </div>

      <p className="garden-note">
        Every focused minute plants a seed. Seeds grow into plants — ferns,
        lavender, and eventually a tree — visible only to you. The garden rewards
        attention, not achievement; it will not ask you to come back.
      </p>
    </>
  );
}

export type { GardenPlant };
