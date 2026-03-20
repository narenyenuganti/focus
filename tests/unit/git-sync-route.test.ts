import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";

vi.mock("@/lib/server/git-sync", () => ({
  runGitSync: vi.fn(async () => ({
    kind: "commit",
    files: ["data/focus/sessions.json"],
    commitMessage: "sync: update tracker data (focus)",
  })),
}));

import { POST } from "@/app/api/sync/route";

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
