import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

test("renders the password entry experience", async () => {
  render(await HomePage());
  expect(screen.getByText(/unlock your tracker/i)).toBeInTheDocument();
});
