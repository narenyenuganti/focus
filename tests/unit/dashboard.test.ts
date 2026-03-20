import { buildDashboardSnapshot } from "@/lib/server/dashboard";

test("builds dashboard summaries across focus, sleep, workouts, health, and daily logs", () => {
  const snapshot = buildDashboardSnapshot({
    focusSessions: [
      {
        id: "focus-1",
        startedAt: "2026-03-20T08:00:00.000Z",
        endedAt: "2026-03-20T08:25:00.000Z",
        durationMinutes: 25,
        mode: "focus",
      },
    ],
    sleepEntries: [
      {
        id: "sleep-1",
        date: "2026-03-20",
        hours: 8,
        quality: 8,
      },
    ],
    workouts: [
      {
        id: "workout-1",
        date: "2026-03-20",
        type: "Lift",
        durationMinutes: 60,
        intensity: "moderate",
      },
    ],
    healthMetrics: [
      {
        id: "health-1",
        date: "2026-03-20",
        weight: 175,
        restingHeartRate: 54,
        energy: 8,
      },
    ],
    dailyLogs: [
      {
        id: "log-1",
        date: "2026-03-20",
        mood: 7,
        gratitude: ["Clear focus"],
        wins: ["Finished workout"],
      },
    ],
  });

  expect(snapshot.topMetrics.length).toBeGreaterThan(3);
  expect(snapshot.sleep.averageHours).toBe(8);
  expect(snapshot.workouts.weeklyMinutes).toBe(60);
  expect(snapshot.health.latestWeight).toBe(175);
  expect(snapshot.dailyLog.latestMood).toBe(7);
});
