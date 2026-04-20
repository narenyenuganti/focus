"use client";

import { useMemo } from "react";

type HeatmapEntry = {
  date: string;
  minutes: number;
  level: number;
};

type LedgerViewProps = {
  heatmap: HeatmapEntry[];
  todayMinutes: number;
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  streakDays: number;
  totalSessions: number;
  totalMinutes: number;
};

const WEEKS = 24;
const DAYS_PER_WEEK = 7;
const CELL_COUNT = WEEKS * DAYS_PER_WEEK;

function buildCellsFromHeatmap(heatmap: HeatmapEntry[]) {
  const cells: Array<{ level: number; date?: string; minutes?: number }> = Array.from(
    { length: CELL_COUNT },
    () => ({ level: 0 }),
  );

  if (heatmap.length === 0) return cells;

  const byDate = new Map(heatmap.map((entry) => [entry.date, entry]));
  const sorted = [...heatmap].sort((a, b) => a.date.localeCompare(b.date));
  const lastDate = new Date(`${sorted[sorted.length - 1].date}T00:00:00.000Z`);

  for (let i = 0; i < CELL_COUNT; i += 1) {
    const cellDate = new Date(lastDate.getTime());
    cellDate.setUTCDate(lastDate.getUTCDate() - (CELL_COUNT - 1 - i));
    const key = cellDate.toISOString().slice(0, 10);
    const entry = byDate.get(key);
    if (entry) {
      cells[i] = { level: entry.level, date: entry.date, minutes: entry.minutes };
    } else {
      cells[i] = { level: 0, date: key };
    }
  }
  return cells;
}

export function LedgerView({
  heatmap,
  todayMinutes,
  weeklyMinutes,
  weeklyGoalMinutes,
  streakDays,
  totalSessions,
  totalMinutes,
}: LedgerViewProps) {
  const cells = useMemo(() => buildCellsFromHeatmap(heatmap), [heatmap]);
  const goalPct = weeklyGoalMinutes > 0
    ? Math.min(100, Math.round((weeklyMinutes / weeklyGoalMinutes) * 100))
    : 0;
  const lifetimeHours = Math.round(totalMinutes / 60);
  const year = new Date().getUTCFullYear();

  return (
    <section>
      <div className="section-head">
        <h2 className="serif">
          The <em>ledger</em>
        </h2>
        <span className="meta">Since January · {year}</span>
      </div>

      <div className="ledger">
        <div className="ledger-main">
          <div className="eyebrow">Focus minutes · last 24 weeks</div>
          <div className="heatmap" aria-label="Focus activity heatmap">
            {cells.map((cell, i) => (
              <div
                key={i}
                className="heat"
                data-level={cell.level}
                title={
                  cell.date
                    ? `${cell.date}: ${cell.minutes ?? 0} focus minutes`
                    : undefined
                }
              />
            ))}
          </div>
          <div className="months">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>

        <div className="ledger-side">
          <div>
            <div className="eyebrow">This week</div>
            <div className="big-num serif">
              {weeklyMinutes}
              <em>m</em>
            </div>
            {weeklyGoalMinutes > 0 ? (
              <>
                <div className="goal-copy">
                  {goalPct}% of {weeklyGoalMinutes}m goal
                </div>
                <div className="goal-bar">
                  <span style={{ width: `${goalPct}%` }} />
                </div>
              </>
            ) : null}
          </div>

          <div className="kpi-row">
            <div>
              <span className="k">Today</span>
              <span className="v">{todayMinutes}m</span>
            </div>
            <div>
              <span className="k">Streak</span>
              <span className="v">{streakDays}d</span>
            </div>
          </div>

          <div className="kpi-row">
            <div>
              <span className="k">Sessions</span>
              <span className="v">{totalSessions}</span>
            </div>
            <div>
              <span className="k">Lifetime</span>
              <span className="v">{lifetimeHours}h</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
