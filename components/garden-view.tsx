"use client";

import { useState } from "react";
import { GardenScene } from "@/components/garden-scene";

type GardenViewProps = {
  seeds: number;
  plantsCount: number;
  streakDays: number;
  nextUnlockName?: string;
  nextUnlockCost?: number;
};

const TIMES: Array<{ id: number; label: string }> = [
  { id: 0.1, label: "Dawn" },
  { id: 0.3, label: "Morning" },
  { id: 0.5, label: "Noon" },
  { id: 0.75, label: "Evening" },
  { id: 0.92, label: "Dusk" },
];

function defaultTimeOfDay() {
  if (typeof window === "undefined") return 0.5;
  const h = new Date().getHours();
  return Math.max(0.05, Math.min(0.95, (h - 6) / 14));
}

export function GardenView({
  seeds,
  plantsCount,
  streakDays,
  nextUnlockName = "Reflecting pond",
  nextUnlockCost = 320,
}: GardenViewProps) {
  const [timeOfDay, setTimeOfDay] = useState<number>(defaultTimeOfDay);
  const unlockPct = nextUnlockCost > 0
    ? Math.min(100, (seeds / nextUnlockCost) * 100)
    : 0;

  return (
    <>
      <div className="section-head">
        <h2 className="serif">
          Your <em>garden</em>
        </h2>
        <div className="time-scrubber" role="tablist" aria-label="Time of day">
          {TIMES.map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={Math.abs(timeOfDay - t.id) < 0.05}
              className={Math.abs(timeOfDay - t.id) < 0.05 ? "on" : ""}
              onClick={() => setTimeOfDay(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="garden-frame">
        <GardenScene timeOfDay={timeOfDay} />
        <div className="garden-frame-overlay">
          <div className="garden-chip">
            <span className="k">Streak</span>
            <span className="v mono">{streakDays}d</span>
          </div>
          <div className="garden-chip">
            <span className="k">Plants</span>
            <span className="v mono">{plantsCount}</span>
          </div>
          <div className="garden-chip">
            <span className="k">Seeds</span>
            <span className="v mono">{seeds}</span>
          </div>
        </div>
      </div>

      <div className="garden-story">
        <div className="gs-col">
          <div className="gs-k">This season</div>
          <div className="gs-v serif">Spring, year two</div>
          <div className="gs-sub">
            Lavender budding · cherries in bloom · fireflies by week six
          </div>
        </div>
        <div className="gs-col">
          <div className="gs-k">Next to unlock</div>
          <div className="gs-v serif">
            {nextUnlockName} <em>→</em>
          </div>
          <div className="gs-sub">
            <div className="goal-bar" style={{ marginTop: 6 }}>
              <span style={{ width: `${unlockPct}%` }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              {seeds} / {nextUnlockCost} seeds
            </span>
          </div>
        </div>
        <div className="gs-col">
          <div className="gs-k">Weather</div>
          <div className="gs-v serif">Clear, 18°</div>
          <div className="gs-sub">A soft westerly. Butterflies are out.</div>
        </div>
      </div>

      <p
        style={{
          marginTop: 28,
          fontSize: 14,
          color: "var(--ink-soft)",
          maxWidth: 720,
          lineHeight: 1.75,
        }}
      >
        Every focused minute plants a seed. Your garden grows quietly, in its own
        time — ferns take a week, oaks take a season. It doesn't keep score and
        it won't ask you to come back. It is simply here when you are.
      </p>
    </>
  );
}
