import { render, screen } from "@testing-library/react";
import React from "react";
import { expect, test } from "vitest";
import { InsightsPanel } from "@/components/insights-panel";
import { buildInsightsSummary } from "@/lib/server/insights";

test("builds streak, progress, and milestones from raw tracker activity", () => {
  const summary = buildInsightsSummary({
    today: "2026-03-20",
    focusSessions: [
      {
        startedAt: "2026-03-20T08:00:00.000Z",
        durationMinutes: 45,
      },
      {
        startedAt: "2026-03-19T08:00:00.000Z",
        durationMinutes: 30,
      },
      {
        startedAt: "2026-03-18T08:00:00.000Z",
        durationMinutes: 15,
      },
      {
        startedAt: "2026-03-16T08:00:00.000Z",
        durationMinutes: 60,
      },
    ],
    workouts: [
      {
        date: "2026-03-20",
        type: "Lift",
        durationMinutes: 120,
      },
      {
        date: "2026-03-18",
        type: "Run",
        durationMinutes: 45,
      },
      {
        date: "2026-03-17",
        type: "Ride",
        durationMinutes: 60,
      },
      {
        date: "2026-03-16",
        type: "Mobility",
        durationMinutes: 30,
      },
    ],
    goals: {
      focusMinutes: 180,
      workoutMinutes: 180,
      workoutCount: 4,
    },
  });

  expect(summary.focusStreakDays).toBe(3);
  expect(summary.goalProgress).toEqual([
    {
      id: "focus-minutes",
      label: "Focus minutes",
      current: 150,
      target: 180,
      percent: 83,
    },
    {
      id: "workout-minutes",
      label: "Workout minutes",
      current: 255,
      target: 180,
      percent: 100,
    },
    {
      id: "workout-count",
      label: "Workouts",
      current: 4,
      target: 4,
      percent: 100,
    },
  ]);
  expect(summary.milestones.map((badge) => badge.label)).toEqual([
    "Focus 60",
    "Focus 120",
    "Workout 60",
    "Workout 180",
    "4 workouts",
  ]);
});

test("renders the insights panel from derived summary data", () => {
  const summary = buildInsightsSummary({
    today: "2026-03-20",
    focusSessions: [
      {
        startedAt: "2026-03-20T08:00:00.000Z",
        durationMinutes: 45,
      },
    ],
    workouts: [
      {
        date: "2026-03-20",
        type: "Lift",
        durationMinutes: 120,
      },
    ],
    goals: {
      focusMinutes: 180,
      workoutMinutes: 180,
      workoutCount: 4,
    },
  });

  render(React.createElement(InsightsPanel, { summary }));

  expect(screen.getByText("Personal insights")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Where the habits compound" })).toBeInTheDocument();
  expect(screen.getByText("1 day streak")).toBeInTheDocument();
  expect(screen.getAllByText("Focus minutes").length).toBeGreaterThan(0);
  expect(screen.queryByText("No milestones yet")).not.toBeInTheDocument();
});
