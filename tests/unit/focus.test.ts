import { buildFocusSummary } from "@/lib/server/focus";

test("aggregates sessions into totals, today stats, and streaks", () => {
  const summary = buildFocusSummary(
    [
      {
        id: "session-1",
        startedAt: "2026-03-18T09:00:00.000Z",
        endedAt: "2026-03-18T09:25:00.000Z",
        durationMinutes: 25,
        mode: "focus",
      },
      {
        id: "session-2",
        startedAt: "2026-03-19T09:00:00.000Z",
        endedAt: "2026-03-19T09:50:00.000Z",
        durationMinutes: 50,
        mode: "focus",
      },
      {
        id: "session-3",
        startedAt: "2026-03-20T08:00:00.000Z",
        endedAt: "2026-03-20T08:30:00.000Z",
        durationMinutes: 30,
        mode: "focus",
      },
    ],
    {
      today: "2026-03-20",
    },
  );

  expect(summary.totalMinutes).toBe(105);
  expect(summary.totalSessions).toBe(3);
  expect(summary.todayMinutes).toBe(30);
  expect(summary.todaySessions).toBe(1);
  expect(summary.currentStreakDays).toBe(3);
  expect(summary.longestSessionMinutes).toBe(50);
  expect(summary.heatmap[0]).toEqual({
    date: "2026-03-18",
    minutes: 25,
    level: 2,
  });
});
