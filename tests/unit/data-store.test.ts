import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { readCollection, writeCollection } from "@/lib/server/data-store";

let rootDir: string;

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), "tracker-data-"));
});

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
});

test("writes and reads repo-backed collections", async () => {
  await writeCollection(
    "focus/sessions",
    [
      {
        id: "focus-1",
        startedAt: "2026-03-20T10:00:00.000Z",
        endedAt: "2026-03-20T10:25:00.000Z",
        durationMinutes: 25,
        mode: "focus",
      },
    ],
    { rootDir },
  );

  const records = await readCollection("focus/sessions", { rootDir });

  expect(records).toEqual([
    {
      id: "focus-1",
      startedAt: "2026-03-20T10:00:00.000Z",
      endedAt: "2026-03-20T10:25:00.000Z",
      durationMinutes: 25,
      mode: "focus",
    },
  ]);
});

test("returns empty defaults when collection files do not exist", async () => {
  const records = await readCollection("sleep/entries", { rootDir });

  expect(records).toEqual([]);
});
