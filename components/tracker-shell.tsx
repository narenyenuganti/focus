"use client";

import {
  BarChart3,
  ChevronUp,
  Award,
  LogOut,
  Music2,
  Play,
  SkipForward,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { logoutTracker } from "@/app/actions/auth";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { AnnouncementModal } from "@/components/announcement-modal";
import { FocusTimer } from "@/components/focus-timer";
import { GroupsPanel } from "@/components/groups-panel";
import { InsightsPanel } from "@/components/insights-panel";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
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
  { key: "groups", label: "Groups", icon: Users },
  { key: "achievements", label: "Achievements", icon: Award },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
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

    if (activePanel === "groups") {
      return <GroupsPanel dailyLog={snapshot.dailyLog} workouts={snapshot.workouts} />;
    }

    if (activePanel === "leaderboard") {
      return <LeaderboardPanel sleep={snapshot.sleep} health={snapshot.health} />;
    }

    if (activePanel === "achievements") {
      return <InsightsPanel summary={snapshot.insights} />;
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
        <div className="mini-player__track">
          <span className="mini-player__eyebrow">Ambient mix</span>
          <span className="mini-player__title">Lofi Girl</span>
        </div>
        <div className="mini-player__controls">
          <button type="button" className="mini-player__button" aria-label="Play ambient track">
            <Play size={16} />
          </button>
          <button type="button" className="mini-player__button" aria-label="Next track">
            <SkipForward size={16} />
          </button>
          <button type="button" className="mini-player__expand" aria-label="Expand player">
            <ChevronUp size={16} />
          </button>
        </div>
      </div>

      <footer className="hub-bottombar">
        <div className="utility-cluster">
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
