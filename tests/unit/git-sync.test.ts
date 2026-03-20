import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import {
  buildSyncCommitMessage,
  createGitSyncPlan,
  runGitSync,
} from "@/lib/server/git-sync";

test("builds a readable sync commit message", () => {
  expect(buildSyncCommitMessage(["focus", "sleep"])).toBe(
    "sync: update tracker data (focus, sleep)",
  );
});

let rootDir: string;

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), "tracker-sync-"));
});

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

test("plans a no-op when there are no changed data files", async () => {
  const result = await createGitSyncPlan({
    rootDir,
    listChangedFiles: async () => [],
  });

  expect(result.kind).toBe("noop");
  if (result.kind === "noop") {
    expect(result.message).toMatch(/nothing to sync/i);
  }
});

test("plans a commit for changed data files only", async () => {
  const result = await createGitSyncPlan({
    rootDir,
    listChangedFiles: async () => [
      "data/focus/sessions.json",
      "app/page.tsx",
      "data/sleep/entries.json",
    ],
  });

  expect(result.kind).toBe("commit");
  if (result.kind === "commit") {
    expect(result.files).toEqual([
      "data/focus/sessions.json",
      "data/sleep/entries.json",
    ]);
    expect(result.commitMessage).toBe(
      "sync: update tracker data (focus, sleep)",
    );
  }
});

test("runs the planned git sync commands without touching the real repo", async () => {
  const calls: Array<{ command: string; args: string[] }> = [];

  const result = await runGitSync({
    rootDir,
    listChangedFiles: async () => ["data/focus/sessions.json"],
    exec: async (command, args) => {
      calls.push({ command, args });
      if (command === "git" && args[0] === "rev-parse") {
        return "";
      }
      return "";
    },
  });

  expect(result.kind).toBe("commit");
  expect(calls).toEqual([
    {
      command: "git",
      args: ["add", "--", "data/focus/sessions.json"],
    },
    {
      command: "git",
      args: ["commit", "-m", "sync: update tracker data (focus)"],
    },
  ]);
});
