import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BreakTimer } from "@/components/break-timer";

describe("BreakTimer", () => {
  it("renders break time message", () => {
    render(
      <BreakTimer
        durationMinutes={5}
        onBreakEnd={vi.fn()}
        onSkip={vi.fn()}
        notificationSound="secret-discovered"
      />,
    );
    expect(screen.getByText(/break time/i)).toBeInTheDocument();
  });

  it("shows skip button", () => {
    render(
      <BreakTimer
        durationMinutes={5}
        onBreakEnd={vi.fn()}
        onSkip={vi.fn()}
        notificationSound="secret-discovered"
      />,
    );
    expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
  });

  it("catches up to elapsed wall-clock time after a delayed interval callback", async () => {
    vi.useFakeTimers();

    const startedAt = new Date("2026-04-21T10:00:00.000Z");
    vi.setSystemTime(startedAt);

    let intervalCallback: (() => void) | null = null;

    const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation((callback) => {
      intervalCallback = callback as () => void;
      return 1;
    });
    const clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation(() => {});

    render(
      <BreakTimer
        durationMinutes={5}
        onBreakEnd={vi.fn()}
        onSkip={vi.fn()}
        notificationSound="off"
      />,
    );

    expect(screen.getByText("05:00")).toBeInTheDocument();

    await act(async () => {
      vi.setSystemTime(new Date(startedAt.getTime() + 5_000));
      intervalCallback?.();
    });

    expect(screen.getByText("04:55")).toBeInTheDocument();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });
});
