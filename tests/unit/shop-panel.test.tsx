import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShopPanel } from "@/components/shop-panel";

describe("ShopPanel", () => {
  it("renders all decoration items", () => {
    render(
      <ShopPanel
        socks={500}
        purchased={[]}
        onPurchase={vi.fn()}
      />,
    );
    expect(screen.getByText("Small Plant")).toBeInTheDocument();
    expect(screen.getByText("Record Player")).toBeInTheDocument();
  });

  it("shows owned badge on purchased items", () => {
    render(
      <ShopPanel
        socks={500}
        purchased={["small-plant"]}
        onPurchase={vi.fn()}
      />,
    );
    const plantCard = screen.getByText("Small Plant").closest("[data-item-id]");
    expect(plantCard?.querySelector("[data-owned]")).toBeInTheDocument();
  });

  it("disables buy button when insufficient socks", () => {
    render(
      <ShopPanel
        socks={10}
        purchased={[]}
        onPurchase={vi.fn()}
      />,
    );
    const buyButtons = screen.getAllByRole("button", { name: /buy/i });
    expect(buyButtons.every((btn) => btn.hasAttribute("disabled"))).toBe(true);
  });
});
