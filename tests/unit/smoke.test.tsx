import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("renders the password entry experience", () => {
  render(<HomePage />);
  expect(screen.getByText(/unlock your tracker/i)).toBeInTheDocument();
});
