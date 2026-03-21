import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";

vi.mock("@/lib/server/git-sync", () => ({
  runGitSync: vi.fn(async () => ({
    kind: "commit",
    files: ["data/focus/sessions.json"],
    commitMessage: "sync: update tracker data (focus)",
  })),
  createGitSyncMetadata: vi.fn(async () => ({
    pendingFiles: [
      {
        path: "data/focus/sessions.json",
        status: "modified",
        label: "focus",
      },
    ],
    pendingCount: 1,
    recentCommits: [
      {
        sha: "abc1234",
        date: "2026-03-20T10:00:00.000Z",
        subject: "sync: update tracker data (focus)",
        labels: ["focus"],
      },
    ],
    lastSyncedAt: "2026-03-20T10:00:00.000Z",
    lastSyncedCommit: {
      sha: "abc1234",
      date: "2026-03-20T10:00:00.000Z",
      subject: "sync: update tracker data (focus)",
      labels: ["focus"],
    },
  })),
}));

import { GET, POST } from "@/app/api/sync/route";

test("returns sync metadata as json", async () => {
  const response = await GET();

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    ok: true,
    metadata: {
      pendingFiles: [
        {
          path: "data/focus/sessions.json",
          status: "modified",
          label: "focus",
        },
      ],
      pendingCount: 1,
      recentCommits: [
        {
          sha: "abc1234",
          date: "2026-03-20T10:00:00.000Z",
          subject: "sync: update tracker data (focus)",
          labels: ["focus"],
        },
      ],
      lastSyncedAt: "2026-03-20T10:00:00.000Z",
      lastSyncedCommit: {
        sha: "abc1234",
        date: "2026-03-20T10:00:00.000Z",
        subject: "sync: update tracker data (focus)",
        labels: ["focus"],
      },
    },
  });
});

test("returns a committed sync result as JSON", async () => {
  const response = await POST(
    new NextRequest("http://localhost/api/sync", { method: "POST" }),
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    ok: true,
    kind: "commit",
    files: ["data/focus/sessions.json"],
    commitMessage: "sync: update tracker data (focus)",
  });
});
