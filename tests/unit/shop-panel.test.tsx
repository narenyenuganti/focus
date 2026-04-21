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
    expect(fernCard).toBeDisabled();
  });

  it("disables cards the wallet can't afford", () => {
    render(<ShopPanel {...defaultProps} socks={10} />);
    const disabled = Array.from(document.querySelectorAll<HTMLButtonElement>(".market-card"))
      .filter((card) => !card.classList.contains("owned"))
      .filter((card) => card.disabled);
    expect(disabled.length).toBeGreaterThan(0);
    disabled.forEach((card) => {
      expect(card.querySelector(".price")).toHaveTextContent(/\d+h/);
    });
  });

  it("narrows grid by category tab", () => {
    render(<ShopPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("tab", { name: /Stones/i }));
    expect(screen.getByText(/Standing stone/i)).toBeInTheDocument();
    expect(screen.queryByText(/Hart's-tongue fern/i)).not.toBeInTheDocument();
  });
});
