import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShopPanel } from "@/components/shop-panel";

const defaultProps = {
  socks: 500,
  purchased: [] as string[],
  onPurchase: vi.fn(),
  themeId: "bean" as const,
  currencyIcon: "🧦",
  unlockedRooms: ["basic"],
  selectedRoom: "basic",
  onUnlockRoom: vi.fn(),
  onSelectRoom: vi.fn(),
};

describe("ShopPanel", () => {
  it("renders all decoration items", () => {
    render(<ShopPanel {...defaultProps} />);
    expect(screen.getByText("Small Plant")).toBeInTheDocument();
    expect(screen.getByText("Record Player")).toBeInTheDocument();
  });

  it("shows owned badge on purchased items", () => {
    render(<ShopPanel {...defaultProps} purchased={["small-plant"]} />);
    const plantCard = screen.getByText("Small Plant").closest("[data-item-id]");
    expect(plantCard?.querySelector("[data-owned]")).toBeInTheDocument();
  });

  it("disables buy button when insufficient socks", () => {
    render(<ShopPanel {...defaultProps} socks={10} />);
    const buyButtons = screen.getAllByRole("button", { name: /buy/i });
    expect(buyButtons.every((btn) => btn.hasAttribute("disabled"))).toBe(true);
  });

  it("renders room variants section", () => {
    render(<ShopPanel {...defaultProps} socks={1000} />);
    // Click the Rooms tab
    fireEvent.click(screen.getByText("Rooms"));
    expect(screen.getByText("Basic Room")).toBeInTheDocument();
    expect(screen.getByText("Cozy Cottage")).toBeInTheDocument();
    expect(screen.getByText("Dungeon Workshop")).toBeInTheDocument();
  });
});
