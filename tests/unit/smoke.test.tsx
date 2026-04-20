import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import HomePage from "@/app/page";
import { FocusTimer } from "@/components/focus-timer";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

test("renders the password entry experience", async () => {
  render(await HomePage());
  expect(screen.getByText(/unlock your tracker/i)).toBeInTheDocument();
});

test("renders focus timer transport controls", async () => {
  const user = userEvent.setup();

  render(
    <FocusTimer
      todayMinutes={0}
      todaySessions={0}
      weeklyMinutes={0}
      weeklyGoalMinutes={1200}
      streakDays={0}
      presets={[
        { label: "Classic Pomodoro", minutes: 25 },
        { label: "Deep Work", minutes: 90 },
      ]}
      notificationSound="secret-discovered"
      ambientMusic={false}
      breakDurationMinutes={5}
      onSocksEarned={() => {}}

    />,
  );

  expect(screen.getByRole("button", { name: "Begin" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Finish" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Reset" })).not.toBeInTheDocument();
  expect(screen.getByRole("tab", { name: /Classic Pomodoro/ })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: /Deep Work/ })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Begin" }));

  expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Begin" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Finish" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Reset" })).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Pause" }));

  expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
});
