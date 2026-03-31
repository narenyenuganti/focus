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

function mockAudioContext() {
  const mockCtx = {
    createGain: () => ({
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    }),
    createOscillator: () => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { setValueAtTime: vi.fn() },
      type: "triangle",
    }),
    destination: {},
    currentTime: 0,
  };
  vi.stubGlobal("AudioContext", vi.fn(() => mockCtx));
}

function renderTimerWithFetch(
  onSocksEarned: (n: number) => void,
  presetMinutes = 25,
) {
  const fetchCalls: { url: string; body: Record<string, unknown> }[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      fetchCalls.push({ url, body });
      if (url === "/api/focus/session") {
        return new Response(
          JSON.stringify({ summary: { todayMinutes: body.durationMinutes ?? 0, todaySessions: 1 } }),
          { status: 200 },
        );
      }
      return new Response("{}", { status: 200 });
    }),
  );

  render(
    <FocusTimer
      todayMinutes={0}
      todaySessions={0}
      weeklyMinutes={0}
      weeklyGoalMinutes={1200}
      presets={[{ label: "Focus", minutes: presetMinutes }]}
      completionSound="secret-discovered"
      ambientMusic={false}
      breakDurationMinutes={5}
      breakEndChime={false}
      placements={{}}
      theme={getTheme("bean")}
      onSocksEarned={onSocksEarned}
    />,
  );

  return fetchCalls;
}

test("sub-minute early finish earns 0 currency and records 0 minutes", async () => {
  vi.useFakeTimers();
  mockAudioContext();
  const startedAt = new Date("2026-03-26T15:00:00.000Z");
  vi.setSystemTime(startedAt);

  const onSocksEarned = vi.fn();
  const fetchCalls = renderTimerWithFetch(onSocksEarned);

  // Start the session
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
  });

  // Advance only 4 seconds
  await act(async () => {
    vi.setSystemTime(new Date(startedAt.getTime() + 4_000));
    vi.advanceTimersByTime(1_000);
  });

  // Pause first — "Finish Session" only appears when paused
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  });

  // Finish early
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Finish Session" }));
  });

  // Allow pending promises to flush
  await act(async () => {
    await vi.runAllTimersAsync();
  });

  const sessionCall = fetchCalls.find((c) => c.url === "/api/focus/session");
  expect(sessionCall?.body.durationMinutes).toBe(0);

  const earnCall = fetchCalls.find((c) => c.url === "/api/economy/earn");
  expect(earnCall).toBeUndefined();
  expect(onSocksEarned).not.toHaveBeenCalled();

  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("32m 5s early finish earns 32 currency, not 33", async () => {
  vi.useFakeTimers();
  mockAudioContext();
  const startedAt = new Date("2026-03-26T15:00:00.000Z");
  vi.setSystemTime(startedAt);

  const onSocksEarned = vi.fn();
  // Use a 45-minute preset so 32m 5s is a valid early finish
  const fetchCalls = renderTimerWithFetch(onSocksEarned, 45);

  // Start the session
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
  });

  // Advance 32 minutes and 5 seconds (1925 seconds)
  await act(async () => {
    vi.setSystemTime(new Date(startedAt.getTime() + 1_925_000));
    vi.advanceTimersByTime(1_000);
  });

  // Pause first
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  });

  // Finish early
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Finish Session" }));
  });

  await act(async () => {
    await vi.runAllTimersAsync();
  });

  const sessionCall = fetchCalls.find((c) => c.url === "/api/focus/session");
  expect(sessionCall?.body.durationMinutes).toBe(32);

  const earnCall = fetchCalls.find((c) => c.url === "/api/economy/earn");
  expect(earnCall?.body.amount).toBe(32);
  expect(onSocksEarned).toHaveBeenCalledWith(32);

  vi.useRealTimers();
  vi.restoreAllMocks();
});
