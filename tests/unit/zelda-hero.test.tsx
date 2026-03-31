import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ZeldaHero } from "@/components/zelda-hero";
import { getTheme } from "@/lib/themes";

const zeldaTheme = getTheme("zelda");

describe("ZeldaHero", () => {
  it("renders with idle state", () => {
    render(<ZeldaHero state="idle" currencyIcon="💎" theme={zeldaTheme} />);
    expect(screen.getByLabelText("Hero character")).toBeInTheDocument();
  });

  it("renders focusing state", () => {
    render(<ZeldaHero state="focusing" currencyIcon="💎" theme={zeldaTheme} />);
    expect(screen.getByLabelText("Hero character")).toBeInTheDocument();
  });

  it("renders celebrating state with currency earned", () => {
    render(<ZeldaHero state="celebrating" currencyEarned={25} currencyIcon="💎" theme={zeldaTheme} />);
    expect(screen.getByText("+25 💎")).toBeInTheDocument();
  });

  it("renders sad state", () => {
    render(<ZeldaHero state="sad" currencyIcon="💎" theme={zeldaTheme} />);
    expect(screen.getByLabelText("Hero character")).toBeInTheDocument();
  });

  it("does not show currency when earned is 0", () => {
    render(<ZeldaHero state="celebrating" currencyEarned={0} currencyIcon="💎" theme={zeldaTheme} />);
    expect(screen.queryByText(/\+0/)).not.toBeInTheDocument();
  });
});
