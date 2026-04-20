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

const DAYS = 30;

function buildRecentDays(heatmap: HeatmapEntry[]) {
  const byDate = new Map(heatmap.map((e) => [e.date, e]));
  const sorted = [...heatmap].sort((a, b) => a.date.localeCompare(b.date));
  const lastKey = sorted[sorted.length - 1]?.date;
  const today = lastKey ? new Date(`${lastKey}T00:00:00.000Z`) : new Date();
  const cells: Array<{ date: string; minutes: number }> = [];
  for (let i = 0; i < DAYS; i += 1) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - (DAYS - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const entry = byDate.get(key);
    cells.push({ date: key, minutes: entry?.minutes ?? 0 });
  }
  return cells;
}

function longestStreak(heatmap: HeatmapEntry[]) {
  if (heatmap.length === 0) return 0;
  const byDate = new Map(heatmap.map((e) => [e.date, e]));
  const sorted = [...heatmap].sort((a, b) => a.date.localeCompare(b.date));
  const first = new Date(`${sorted[0].date}T00:00:00.000Z`);
  const last = new Date(`${sorted[sorted.length - 1].date}T00:00:00.000Z`);
  const days = Math.round((last.getTime() - first.getTime()) / 86_400_000) + 1;
  let current = 0;
  let best = 0;
  for (let i = 0; i < days; i += 1) {
    const d = new Date(first);
    d.setUTCDate(first.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    if ((byDate.get(key)?.minutes ?? 0) > 0) {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

export function LedgerView({
  heatmap,
  streakDays,
  totalSessions,
  totalMinutes,
}: LedgerViewProps) {
  const days = useMemo(() => buildRecentDays(heatmap), [heatmap]);
  const longest = useMemo(() => longestStreak(heatmap), [heatmap]);
  const max = Math.max(1, ...days.map((d) => d.minutes));

  const hours = Math.floor(totalMinutes / 60);
  const leftoverMin = totalMinutes % 60;
  const last30Sessions = useMemo(() => {
    const byDate = new Map(heatmap.map((e) => [e.date, e]));
    return days.reduce((sum, d) => sum + (byDate.get(d.date)?.minutes ?? 0 > 0 ? 1 : 0), 0);
  }, [heatmap, days]);

  return (
    <section className="view">
      <h2
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 48,
          margin: "0 0 32px",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        A record of <em style={{ color: "var(--accent)" }}>quiet hours</em>.
      </h2>

      <div className="stats-grid">
        <div className="stat-cell">
          <div className="k">Sessions, 30d</div>
          <div className="v">{last30Sessions}</div>
        </div>
        <div className="stat-cell">
          <div className="k">Hours, total</div>
          <div className="v">
            {hours}
            <span className="u">h {leftoverMin}m</span>
          </div>
        </div>
        <div className="stat-cell">
          <div className="k">Current streak</div>
          <div className="v">
            {streakDays}
            <span className="u">days</span>
          </div>
        </div>
        <div className="stat-cell">
          <div className="k">Longest streak</div>
          <div className="v">
            {longest}
            <span className="u">days</span>
          </div>
        </div>
      </div>

      <div className="label" style={{ marginBottom: 4 }}>
        Daily minutes, last 30 days
      </div>
      <div className="streak-bars" aria-label="Daily minutes, last 30 days">
        {days.map((d, i) => {
          const height = (d.minutes / max) * 100;
          return (
            <div
              key={d.date}
              className={`bar ${i === days.length - 1 ? "today" : ""}`}
              style={{ height: `${height}%`, animationDelay: `${i * 20}ms` }}
              title={`${d.date}: ${d.minutes} minutes`}
            />
          );
        })}
      </div>

      <div className="label" style={{ marginTop: 40 }}>
        Lifetime · {totalSessions} sessions
      </div>
    </section>
  );
}
