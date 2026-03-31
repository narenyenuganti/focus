import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLofiPlayer } from "@/lib/lofi";

const mockOscillator = {
  type: "sine",
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), value: 0 },
  connect: vi.fn(),
};

const mockFilter = {
  type: "lowpass",
  frequency: { setValueAtTime: vi.fn() },
  Q: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({ ...mockGain, gain: { ...mockGain.gain } })),
  createBiquadFilter: vi.fn(() => ({ ...mockFilter })),
  close: vi.fn(),
  state: "running" as string,
};

vi.stubGlobal("AudioContext", vi.fn(() => mockAudioContext));

beforeEach(() => {
  vi.clearAllMocks();
  mockAudioContext.state = "running";
});

describe("createLofiPlayer", () => {
  it("creates a player with start and stop methods", () => {
    const player = createLofiPlayer();
    expect(player.start).toBeInstanceOf(Function);
    expect(player.stop).toBeInstanceOf(Function);
    expect(player.isPlaying).toBe(false);
  });

  it("sets isPlaying to true after start", () => {
    const player = createLofiPlayer();
    player.start();
    expect(player.isPlaying).toBe(true);
    player.stop();
  });

  it("sets isPlaying to false after stop", () => {
    const player = createLofiPlayer();
    player.start();
    player.stop();
    expect(player.isPlaying).toBe(false);
  });

  it("does not double-start", () => {
    const player = createLofiPlayer();
    player.start();
    player.start();
    expect(AudioContext).toHaveBeenCalledTimes(1);
    player.stop();
  });
});
