import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Bean } from "@/components/bean";

describe("Bean", () => {
  it("renders with idle state by default", () => {
    render(<Bean state="idle" />);
    expect(screen.getByLabelText("Bean character")).toBeInTheDocument();
  });

  it("renders focusing state", () => {
    render(<Bean state="focusing" />);
    const bean = screen.getByLabelText("Bean character");
    expect(bean).toBeInTheDocument();
    expect(bean.className).toContain("focusing");
  });

  it("renders celebrating state with socks earned", () => {
    render(<Bean state="celebrating" socksEarned={25} />);
    expect(screen.getByText("+25 🧦")).toBeInTheDocument();
  });

  it("renders sad state", () => {
    render(<Bean state="sad" />);
    expect(screen.getByLabelText("Bean character")).toBeInTheDocument();
  });
});
