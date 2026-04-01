import { describe, it, expect } from "vitest";
import {
  ROOM_CATALOG,
  getRoomVariant,
  getUnlockableRooms,
} from "@/lib/room-catalog";

describe("ROOM_CATALOG", () => {
  it("has 4 room variants", () => {
    expect(ROOM_CATALOG).toHaveLength(4);
  });

  it("every room has required fields", () => {
    for (const room of ROOM_CATALOG) {
      expect(room.id).toBeTruthy();
      expect(room.name).toBeTruthy();
      expect(typeof room.cost).toBe("number");
      expect(room.cost).toBeGreaterThanOrEqual(0);
      expect(room.wallColor).toBeTruthy();
      expect(room.wallDarkColor).toBeTruthy();
      expect(room.floorColor).toBeTruthy();
      expect(room.floorDarkColor).toBeTruthy();
      expect(room.wallSlots).toHaveLength(4);
      expect(room.floorSlots).toHaveLength(4);
    }
  });

  it("has no duplicate ids", () => {
    const ids = ROOM_CATALOG.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has exactly one free room", () => {
    const freeRooms = ROOM_CATALOG.filter((r) => r.cost === 0);
    expect(freeRooms).toHaveLength(1);
    expect(freeRooms[0].id).toBe("basic");
  });
});

describe("getRoomVariant", () => {
  it("returns room by id", () => {
    const room = getRoomVariant("basic");
    expect(room).toBeDefined();
    expect(room!.name).toBe("Basic Room");
  });

  it("returns undefined for unknown id", () => {
    expect(getRoomVariant("nonexistent")).toBeUndefined();
  });
});

describe("getUnlockableRooms", () => {
  it("returns rooms sorted by cost ascending", () => {
    const rooms = getUnlockableRooms();
    for (let i = 1; i < rooms.length; i++) {
      expect(rooms[i].cost).toBeGreaterThanOrEqual(rooms[i - 1].cost);
    }
  });
});
