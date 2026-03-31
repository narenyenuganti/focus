import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { FocusTimer } from "@/components/focus-timer";
import { getTheme } from "@/lib/themes";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

test("catches up to elapsed wall-clock time after a delayed interval callback", async () => {
  vi.useFakeTimers();

  const startedAt = new Date("2026-03-26T15:00:00.000Z");
  vi.setSystemTime(startedAt);

  let intervalCallback: (() => void) | null = null;

  const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
    intervalCallback = callback as () => void;
    return 1;
  });
  const clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation(() => {});

  render(
    <FocusTimer
      todayMinutes={0}
      todaySessions={0}
      weeklyMinutes={0}
      weeklyGoalMinutes={1200}
      presets={[{ label: "Classic Pomodoro", minutes: 25 }]}
      completionSound="secret-discovered"
      ambientMusic={false}
      breakDurationMinutes={5}
      breakEndChime={false}
      placements={{}}
      theme={getTheme("bean")}
      onSocksEarned={() => {}}
      onNavigateToShop={() => {}}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Start" }));

  expect(intervalCallback).not.toBeNull();
  expect(screen.getByText("25:00")).toBeInTheDocument();

  await act(async () => {
    vi.setSystemTime(new Date(startedAt.getTime() + 5_000));
    intervalCallback?.();
  });

  expect(screen.getByText("24:55")).toBeInTheDocument();

  setIntervalSpy.mockRestore();
  clearIntervalSpy.mockRestore();
  vi.useRealTimers();
});
