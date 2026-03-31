import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createSessionToken } from "@/lib/auth/session";
import { getDefaultSettings, readSettings, updateSettings } from "@/lib/server/settings";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { GET, PUT } from "@/app/api/settings/route";

const cookiesMock = vi.mocked(cookies);

let rootDir: string;

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), "tracker-settings-"));
  vi.stubEnv("TRACKER_DATA_DIR", rootDir);
  cookiesMock.mockResolvedValue({
    get: () => ({ value: createSessionToken() }),
  } as never);
});

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

test("returns sensible defaults when the settings file is missing", async () => {
  const settings = await readSettings({ rootDir });

  expect(settings).toEqual({
    displayName: "Naren",
    weeklyFocusGoalMinutes: 1200,
    focusPresets: [
      { label: "Classic Pomodoro", minutes: 25 },
      { label: "Eisenhower", minutes: 50 },
      { label: "52 / 17", minutes: 52 },
      { label: "Deep Work", minutes: 90 },
    ],
    completionSound: "secret-discovered",
    ambientMusic: true,
    breakDurationMinutes: 5,
    breakEndChime: true,
    theme: "bean",
  });
});

test("reads and writes repo-native settings", async () => {
  const updated = await updateSettings(
    {
      displayName: "Naren",
      weeklyFocusGoalMinutes: 1800,
      focusPresets: [
        { label: "Deep Work", minutes: 90 },
        { label: "Sprint", minutes: 45 },
      ],
    },
    { rootDir },
  );

  expect(updated.displayName).toBe("Naren");
  expect(updated.focusPresets).toHaveLength(2);

  const settings = await readSettings({ rootDir });

  expect(settings).toEqual(updated);
});

test("serves and updates settings through the authenticated route", async () => {
  const getResponse = await GET();

  expect(getResponse.status).toBe(200);
  await expect(getResponse.json()).resolves.toEqual({
    ok: true,
    settings: getDefaultSettings(),
  });

  const putResponse = await PUT(
    new NextRequest("http://localhost/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        displayName: "Naren",
        weeklyFocusGoalMinutes: 1500,
        weeklyWorkoutGoalMinutes: 210,
        sleepGoalHours: 8.5,
        focusPresets: [{ label: "Deep Work", minutes: 90 }],
      }),
    }),
  );

  expect(putResponse.status).toBe(200);
  await expect(putResponse.json()).resolves.toEqual({
    ok: true,
    settings: {
      displayName: "Naren",
      weeklyFocusGoalMinutes: 1500,
      focusPresets: [{ label: "Deep Work", minutes: 90 }],
      completionSound: "secret-discovered",
      ambientMusic: true,
      breakDurationMinutes: 5,
      breakEndChime: true,
      theme: "bean",
    },
  });
});
