import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { TrackerShell } from "@/components/tracker-shell";
import { buildDashboardSnapshot } from "@/lib/server/dashboard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/notifications", () => ({
  notify: vi.fn(),
  requestNotificationPermission: vi.fn(),
}));

vi.mock("@/lib/lofi", () => ({
  createLofiPlayer: () => ({
    start: vi.fn(),
    stop: vi.fn(),
  }),
  warmUpAudio: vi.fn(),
}));

function buildSnapshot() {
  return {
    ...buildDashboardSnapshot({
      focusSessions: [],
      sleepEntries: [],
      workouts: [],
      healthMetrics: [],
      dailyLogs: [],
      settings: {
        displayName: "Naren",
        weeklyFocusGoalMinutes: 1200,
        focusPresets: [{ label: "Classic Pomodoro", minutes: 25, breakMinutes: 5 }],
        notificationSound: "off",
        ambientMusic: false,
        breakDurationMinutes: 5,
        theme: "terracotta",
        gardenAutoTimeOfDay: true,
      },
    }),
    economy: {
      wallet: { socks: 0, totalEarned: 0 },
      inventory: { purchased: [] },
      room: { placements: {} },
      roomState: { unlockedRooms: ["basic"], selectedRoom: "basic" },
    },
  };
}

test("keeps a running focus timer when switching away and back", async () => {
  vi.useFakeTimers();

  const startedAt = new Date("2026-04-21T10:00:00.000Z");
  vi.setSystemTime(startedAt);

  render(<TrackerShell snapshot={buildSnapshot()} />);

  fireEvent.click(screen.getByRole("button", { name: "Begin" }));

  await act(async () => {
    vi.setSystemTime(new Date(startedAt.getTime() + 5_000));
    vi.advanceTimersByTime(5_000);
  });

  const runningDial = screen.getByRole("img", { name: /remaining/ });
  const runningLabel = runningDial.getAttribute("aria-label");

  expect(runningLabel).not.toBe("25:00 remaining");

  fireEvent.click(screen.getByRole("button", { name: "Garden" }));
  fireEvent.click(screen.getByRole("button", { name: "Focus" }));

  expect(screen.getByRole("img", { name: runningLabel ?? /remaining/ })).toBeInTheDocument();
  expect(screen.queryByRole("img", { name: /25:00/ })).not.toBeInTheDocument();

  vi.useRealTimers();
});
