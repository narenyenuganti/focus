import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
