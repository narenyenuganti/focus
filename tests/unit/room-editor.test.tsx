import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoomEditor } from "@/components/room-editor";

describe("RoomEditor", () => {
  it("renders room with empty slots", () => {
    render(
      <RoomEditor
        placements={{}}
        purchased={["small-plant", "simple-poster"]}
        onPlace={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const emptySlots = screen.getAllByRole("button", { name: /empty slot/i });
    expect(emptySlots.length).toBe(8);
  });

  it("renders inventory bar with owned unplaced items", () => {
    render(
      <RoomEditor
        placements={{ "wall-1": "simple-poster" }}
        purchased={["small-plant", "simple-poster"]}
        onPlace={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText("Small Plant")).toBeInTheDocument();
  });
});
