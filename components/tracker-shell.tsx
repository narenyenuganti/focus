"use client";

import {
  BarChart3,
  LogOut,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { logoutTracker } from "@/app/actions/auth";
import { FocusTimer } from "@/components/focus-timer";
import { SettingsPanel } from "@/components/settings-panel";
import { StatsOverview } from "@/components/stats-overview";
import { SyncButton } from "@/components/sync-button";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type TrackerShellProps = {
  snapshot: TrackerSnapshot;
};

const NAV_ITEMS = [
  { key: "statistics", label: "Statistics", icon: BarChart3 },
] as const;

type ActivePanel = (typeof NAV_ITEMS)[number]["key"] | "settings";

export function TrackerShell({ snapshot }: TrackerShellProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null);
  const statisticsCards = [
    {
      label: "today",
      value: `${snapshot.focus.todayMinutes}m`,
      detail: `${snapshot.focus.todaySessions} focus sessions`,
    },
    {
      label: "this week",
      value: `${snapshot.focus.weeklyMinutes}m`,
      detail: `${snapshot.insights.goalProgress[0]?.percent ?? 0}% of ${snapshot.settings.weeklyFocusGoalMinutes}m goal`,
    },
  ];

  function renderPanel() {
    if (!activePanel) {
      return null;
    }

    if (activePanel === "statistics") {
      return (
        <div className="panel-shell panel-shell--statistics">
          <StatsOverview cards={statisticsCards} />
        </div>
      );
    }

    if (activePanel === "settings") {
      return <SettingsPanel settings={snapshot.settings} />;
    }

    return null;
  }

  return (
    <div className="hub-shell">
      <div className="hub-bg hub-bg--amber" />
      <div className="hub-bg hub-bg--teal" />

      <header className="hub-topbar">
        {snapshot.topMetrics.map((metric) => (
          <article key={metric.label} className={`metric-pill tone-${metric.tone}`}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </header>

      <main className="hub-main">
        <section className="hub-focus-column">
          <FocusTimer
            todayMinutes={snapshot.focus.todayMinutes}
            todaySessions={snapshot.focus.todaySessions}
            weeklyMinutes={snapshot.focus.weeklyMinutes}
            weeklyGoalMinutes={snapshot.settings.weeklyFocusGoalMinutes}
            presets={snapshot.settings.focusPresets}
            completionSound={snapshot.settings.completionSound}
          />
        </section>
        <aside className={activePanel ? "hub-panel-column is-visible" : "hub-panel-column"}>
          {renderPanel()}
        </aside>
      </main>

      <footer className="hub-bottombar">
        <div className="utility-cluster">
          <SyncButton />
        </div>

        <nav className="nav-cluster" aria-label="Tracker panels">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.key === activePanel;

            return (
              <button
                key={item.key}
                type="button"
                className={active ? "nav-pill is-active" : "nav-pill"}
                onClick={() =>
                  setActivePanel((current) => (current === item.key ? null : item.key))
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="utility-cluster">
          <form action={logoutTracker}>
            <button type="submit" className="utility-button danger" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </form>
          <button
            type="button"
            className={activePanel === "settings" ? "utility-button is-active" : "utility-button"}
            aria-label="Settings"
            onClick={() =>
              setActivePanel((current) => (current === "settings" ? null : "settings"))
            }
          >
            <Settings size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
