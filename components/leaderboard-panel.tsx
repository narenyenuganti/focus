"use client";

import { useState } from "react";
import { HealthPanelContent } from "@/components/health-panel";
import { SleepPanelContent } from "@/components/sleep-panel";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type LeaderboardPanelProps = {
  sleep: TrackerSnapshot["sleep"];
  health: TrackerSnapshot["health"];
};

const LEADERBOARD_TABS = [
  { id: "sleep", label: "Sleep" },
  { id: "health", label: "Health" },
] as const;

type LeaderboardTab = (typeof LEADERBOARD_TABS)[number]["id"];

export function LeaderboardPanel({ sleep, health }: LeaderboardPanelProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("sleep");

  return (
    <section className="panel-shell panel-shell--grouped">
      <div className="section-copy">
        <p className="eyebrow">Leaderboard</p>
        <h2>Personal rankings</h2>
        <p className="lede">
          Compare sleep and health signals in one place, then open the form you need.
        </p>
      </div>

      <div className="leaderboard-ranks" aria-label="Leaderboard summary">
        <article>
          <span>Sleep average</span>
          <strong>{sleep.averageHours}h</strong>
        </article>
        <article>
          <span>Latest quality</span>
          <strong>{sleep.latestQuality || "-"}</strong>
        </article>
        <article>
          <span>Energy</span>
          <strong>{health.energy || "-"}</strong>
        </article>
      </div>

      <div className="panel-tabs" role="tablist" aria-label="Leaderboard tabs">
        {LEADERBOARD_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`leaderboard-panel-${tab.id}`}
            id={`leaderboard-tab-${tab.id}`}
            className={activeTab === tab.id ? "panel-tab is-active" : "panel-tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel-tabpanels">
        <div
          role="tabpanel"
          id="leaderboard-panel-sleep"
          aria-labelledby="leaderboard-tab-sleep"
          hidden={activeTab !== "sleep"}
          className="panel-tabpanel"
        >
          <SleepPanelContent summary={sleep} />
        </div>
        <div
          role="tabpanel"
          id="leaderboard-panel-health"
          aria-labelledby="leaderboard-tab-health"
          hidden={activeTab !== "health"}
          className="panel-tabpanel"
        >
          <HealthPanelContent summary={health} />
        </div>
      </div>
    </section>
  );
}
