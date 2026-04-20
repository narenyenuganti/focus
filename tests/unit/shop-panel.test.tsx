import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShopPanel } from "@/components/shop-panel";

const defaultProps = {
  socks: 500,
  purchased: [] as string[],
  onPurchase: vi.fn(),
};

describe("ShopPanel", () => {
  it("renders garden catalog items in the grid", () => {
    render(<ShopPanel {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /Cherry blossom/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Hart's-tongue fern/i)).toBeInTheDocument();
    expect(screen.getByText(/Ancient oak/i)).toBeInTheDocument();
  });

  it("marks purchased items as owned", () => {
    render(<ShopPanel {...defaultProps} purchased={["fern"]} />);
    const fernCard = document.querySelector('[data-item-id="fern"]');
    expect(fernCard).not.toBeNull();
    expect(fernCard).toHaveClass("owned");
    expect(fernCard?.querySelector(".mg-buy")).toHaveTextContent("Owned");
  });

  it("shows Save up on items the wallet can't afford", () => {
    render(<ShopPanel {...defaultProps} socks={10} />);
    const cards = Array.from(document.querySelectorAll(".mg-card"));
    expect(cards.length).toBeGreaterThan(0);
    const saveUpButtons = cards
      .map((card) => card.querySelector(".mg-buy"))
      .filter((btn): btn is Element => Boolean(btn))
      .filter((btn) => btn.textContent?.includes("Save up"));
    expect(saveUpButtons.length).toBeGreaterThan(0);
    saveUpButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("narrows grid by category dropdown", () => {
    render(<ShopPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    fireEvent.click(screen.getByRole("option", { name: /Stones/i }));
    expect(screen.getByText(/Standing stone/i)).toBeInTheDocument();
    expect(screen.queryByText(/Hart's-tongue fern/i)).not.toBeInTheDocument();
  });
});
