"use client";

import { useEffect, useState } from "react";
import { GardenScene } from "@/components/garden-scene";

type GardenViewProps = {
  seeds: number;
  plantsCount: number;
  streakDays: number;
  owned: ReadonlySet<string>;
  autoTimeOfDay: boolean;
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

function currentTimeOfDay(): number {
  if (typeof window === "undefined") return 0.5;
  const h = new Date().getHours();
  if (h >= 5 && h < 8) return 0.1;
  if (h >= 8 && h < 11) return 0.3;
  if (h >= 11 && h < 15) return 0.5;
  if (h >= 15 && h < 18) return 0.75;
  return 0.92;
}

export function GardenView({
  seeds,
  plantsCount,
  streakDays,
  owned,
  autoTimeOfDay,
  nextUnlockName = "Reflecting pond",
  nextUnlockCost = 320,
}: GardenViewProps) {
  const [timeOfDay, setTimeOfDay] = useState<number>(currentTimeOfDay);

  useEffect(() => {
    if (!autoTimeOfDay) return;
    setTimeOfDay(currentTimeOfDay());
    const id = window.setInterval(() => setTimeOfDay(currentTimeOfDay()), 60_000);
    return () => window.clearInterval(id);
  }, [autoTimeOfDay]);

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
          {TIMES.map((t) => {
            const active = Math.abs(timeOfDay - t.id) < 0.05;
            return (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={active}
                aria-disabled={autoTimeOfDay || undefined}
                className={active ? "on" : ""}
                disabled={autoTimeOfDay}
                title={autoTimeOfDay ? "Auto-following real time — disable in Settings to scrub" : undefined}
                onClick={() => {
                  if (autoTimeOfDay) return;
                  setTimeOfDay(t.id);
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="garden-frame">
        <GardenScene timeOfDay={timeOfDay} owned={owned} />
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
