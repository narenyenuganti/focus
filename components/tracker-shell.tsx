"use client";

import {
  BarChart3,
  Dumbbell,
  HeartPulse,
  ChevronUp,
  Info,
  ListTodo,
  LogOut,
  MoonStar,
  Music2,
  Play,
  SkipForward,
  Sparkles,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { logoutTracker } from "@/app/actions/auth";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { AnnouncementModal } from "@/components/announcement-modal";
import { DailyLogPanel } from "@/components/daily-log-panel";
import { FocusTimer } from "@/components/focus-timer";
import { HealthPanel } from "@/components/health-panel";
import { InsightsPanel } from "@/components/insights-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { SleepPanel } from "@/components/sleep-panel";
import { StatsOverview } from "@/components/stats-overview";
import { SyncButton } from "@/components/sync-button";
import { WorkoutPanel } from "@/components/workout-panel";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type TrackerShellProps = {
  snapshot: TrackerSnapshot;
};

const NAV_ITEMS = [
  { key: "statistics", label: "Statistics", icon: BarChart3 },
  { key: "insights", label: "Insights", icon: Sparkles },
  { key: "sleep", label: "Sleep", icon: MoonStar },
  { key: "workouts", label: "Workouts", icon: Dumbbell },
  { key: "health", label: "Health", icon: HeartPulse },
] as const;

type ActivePanel = (typeof NAV_ITEMS)[number]["key"] | "daily-log" | "settings";

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
    {
      label: "sleep",
      value: `${snapshot.sleep.averageHours}h`,
      detail: `${snapshot.settings.sleepGoalHours}h nightly target`,
    },
    {
      label: "workouts",
      value: `${snapshot.workouts.weeklyCount}`,
      detail: `${snapshot.workouts.weeklyMinutes} / ${snapshot.settings.weeklyWorkoutGoalMinutes} weekly minutes`,
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
          <ActivityHeatmap entries={snapshot.focus.heatmap} />
        </div>
      );
    }

    if (activePanel === "sleep") {
      return <SleepPanel summary={snapshot.sleep} />;
    }

    if (activePanel === "insights") {
      return <InsightsPanel summary={snapshot.insights} />;
    }

    if (activePanel === "workouts") {
      return <WorkoutPanel summary={snapshot.workouts} />;
    }

    if (activePanel === "health") {
      return <HealthPanel summary={snapshot.health} />;
    }

    if (activePanel === "settings") {
      return <SettingsPanel settings={snapshot.settings} />;
    }

    return <DailyLogPanel summary={snapshot.dailyLog} />;
  }

  return (
    <div className="hub-shell">
      <div className="hub-bg hub-bg--amber" />
      <div className="hub-bg hub-bg--teal" />
      <AnnouncementModal />

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
          <div className="hub-dots" aria-hidden="true">
            <span className="is-active" />
            <span />
            <span />
          </div>
          <FocusTimer
            todayMinutes={snapshot.focus.todayMinutes}
            todaySessions={snapshot.focus.todaySessions}
            weeklyMinutes={snapshot.focus.weeklyMinutes}
            weeklyGoalMinutes={snapshot.settings.weeklyFocusGoalMinutes}
            presets={snapshot.settings.focusPresets}
          />
        </section>
        <aside className={activePanel ? "hub-panel-column is-visible" : "hub-panel-column"}>
          {renderPanel()}
        </aside>
      </main>

      <div className="mini-player" aria-label="Ambient player">
        <button type="button" className="mini-player__button" aria-label="Play ambient track">
          <Play size={16} />
        </button>
        <div className="mini-player__track">
          <span className="mini-player__eyebrow">Ambient mix</span>
          <span className="mini-player__title">Lofi Girl</span>
        </div>
        <button type="button" className="mini-player__button" aria-label="Next track">
          <SkipForward size={16} />
        </button>
        <button type="button" className="mini-player__expand" aria-label="Expand player">
          <ChevronUp size={16} />
        </button>
      </div>

      <footer className="hub-bottombar">
        <div className="utility-cluster">
          <button
            type="button"
            className={activePanel === "daily-log" ? "utility-button is-active" : "utility-button"}
            onClick={() =>
              setActivePanel((current) => (current === "daily-log" ? null : "daily-log"))
            }
            aria-label="Daily log"
          >
            <ListTodo size={16} />
          </button>
          <SyncButton />
          <button type="button" className="utility-button" aria-label="Music">
            <Music2 size={16} />
          </button>
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
          <button
            type="button"
            className={activePanel === "statistics" ? "utility-button is-active" : "utility-button"}
            aria-label="Statistics overview"
            onClick={() =>
              setActivePanel((current) => (current === "statistics" ? null : "statistics"))
            }
          >
            <Info size={16} />
          </button>
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
