"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { DailyLogPanelContent } from "@/components/daily-log-panel";
import { HealthPanelContent } from "@/components/health-panel";
import { SleepPanelContent } from "@/components/sleep-panel";
import { WorkoutPanelContent } from "@/components/workout-panel";
import type { getTrackerSnapshot } from "@/lib/server/dashboard";

type TrackerSnapshot = Awaited<ReturnType<typeof getTrackerSnapshot>>;

type TrackingPanelProps = {
  dailyLog: TrackerSnapshot["dailyLog"];
  workouts: TrackerSnapshot["workouts"];
  sleep: TrackerSnapshot["sleep"];
  health: TrackerSnapshot["health"];
};

const TRACKING_TABS = [
  { id: "daily-log", label: "Daily log" },
  { id: "workouts", label: "Workouts" },
  { id: "sleep", label: "Sleep" },
  { id: "health", label: "Health" },
] as const;

type TrackingTab = (typeof TRACKING_TABS)[number]["id"];

export function TrackingPanel({
  dailyLog,
  workouts,
  sleep,
  health,
}: TrackingPanelProps) {
  const [activeTab, setActiveTab] = useState<TrackingTab>("daily-log");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function moveFocus(nextIndex: number) {
    const nextTab = TRACKING_TABS[nextIndex];

    setActiveTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();

    if (event.key === "Home") {
      moveFocus(0);
      return;
    }

    if (event.key === "End") {
      moveFocus(TRACKING_TABS.length - 1);
      return;
    }

    const nextIndex =
      event.key === "ArrowRight"
        ? (index + 1) % TRACKING_TABS.length
        : (index - 1 + TRACKING_TABS.length) % TRACKING_TABS.length;

    moveFocus(nextIndex);
  }

  return (
    <section className="panel-shell panel-shell--grouped">
      <div className="section-copy">
        <p className="eyebrow">Tracking</p>
        <h2>Personal logs</h2>
        <p className="lede">
          Daily notes, workouts, sleep, and health all stay in one single-user workspace.
        </p>
      </div>

      <div className="panel-metrics">
        <article>
          <span>Mood</span>
          <strong>{dailyLog.latestMood || "-"}</strong>
        </article>
        <article>
          <span>Workouts</span>
          <strong>{workouts.weeklyCount}</strong>
        </article>
        <article>
          <span>Sleep</span>
          <strong>{sleep.averageHours}h</strong>
        </article>
        <article>
          <span>Energy</span>
          <strong>{health.energy || "-"}</strong>
        </article>
      </div>

      <div className="panel-tabs" role="tablist" aria-label="Tracking tabs" aria-orientation="horizontal">
        {TRACKING_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tracking-panel-${tab.id}`}
            id={`tracking-tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={activeTab === tab.id ? "panel-tab is-active" : "panel-tab"}
            ref={(node) => {
              tabRefs.current[TRACKING_TABS.findIndex((item) => item.id === tab.id)] = node;
            }}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) =>
              handleTabKeyDown(event, TRACKING_TABS.findIndex((item) => item.id === tab.id))
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel-tabpanels">
        <div
          role="tabpanel"
          id="tracking-panel-daily-log"
          aria-labelledby="tracking-tab-daily-log"
          hidden={activeTab !== "daily-log"}
          className="panel-tabpanel"
        >
          <DailyLogPanelContent summary={dailyLog} />
        </div>
        <div
          role="tabpanel"
          id="tracking-panel-workouts"
          aria-labelledby="tracking-tab-workouts"
          hidden={activeTab !== "workouts"}
          className="panel-tabpanel"
        >
          <WorkoutPanelContent summary={workouts} />
        </div>
        <div
          role="tabpanel"
          id="tracking-panel-sleep"
          aria-labelledby="tracking-tab-sleep"
          hidden={activeTab !== "sleep"}
          className="panel-tabpanel"
        >
          <SleepPanelContent summary={sleep} />
        </div>
        <div
          role="tabpanel"
          id="tracking-panel-health"
          aria-labelledby="tracking-tab-health"
          hidden={activeTab !== "health"}
          className="panel-tabpanel"
        >
          <HealthPanelContent summary={health} />
        </div>
      </div>
    </section>
  );
}
