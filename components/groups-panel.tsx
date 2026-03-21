"use client";

import { useState } from "react";
import { DailyLogPanelContent } from "@/components/daily-log-panel";
import { WorkoutPanelContent } from "@/components/workout-panel";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type GroupsPanelProps = {
  dailyLog: TrackerSnapshot["dailyLog"];
  workouts: TrackerSnapshot["workouts"];
};

const GROUP_TABS = [
  { id: "daily-log", label: "Daily log" },
  { id: "workouts", label: "Workouts" },
] as const;

type GroupTab = (typeof GROUP_TABS)[number]["id"];

export function GroupsPanel({ dailyLog, workouts }: GroupsPanelProps) {
  const [activeTab, setActiveTab] = useState<GroupTab>("daily-log");

  return (
    <section className="panel-shell panel-shell--grouped">
      <div className="section-copy">
        <p className="eyebrow">Groups</p>
        <h2>Shared capture</h2>
        <p className="lede">
          Keep the daily reflection and workout log together without leaving the tracker.
        </p>
      </div>

      <div className="panel-tabs" role="tablist" aria-label="Groups tabs">
        {GROUP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`groups-panel-${tab.id}`}
            id={`groups-tab-${tab.id}`}
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
          id="groups-panel-daily-log"
          aria-labelledby="groups-tab-daily-log"
          hidden={activeTab !== "daily-log"}
          className="panel-tabpanel"
        >
          <DailyLogPanelContent summary={dailyLog} />
        </div>
        <div
          role="tabpanel"
          id="groups-panel-workouts"
          aria-labelledby="groups-tab-workouts"
          hidden={activeTab !== "workouts"}
          className="panel-tabpanel"
        >
          <WorkoutPanelContent summary={workouts} />
        </div>
      </div>
    </section>
  );
}
