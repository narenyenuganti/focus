import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import {
  buildSyncCommitMessage,
  createGitSyncPlan,
  createGitSyncMetadata,
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

test("detects modified tracked data files from porcelain output", async () => {
  const focusDir = path.join(rootDir, "data", "focus");
  const sessionPath = path.join(focusDir, "sessions.json");

  await mkdir(focusDir, { recursive: true });
  await writeFile(sessionPath, '{"sessions":[]}\n');

  execFileSync("git", ["init"], { cwd: rootDir });
  execFileSync("git", ["config", "user.name", "Tracker Tests"], { cwd: rootDir });
  execFileSync("git", ["config", "user.email", "tracker@example.com"], { cwd: rootDir });
  execFileSync("git", ["add", "--", "data/focus/sessions.json"], { cwd: rootDir });
  execFileSync("git", ["commit", "-m", "seed"], { cwd: rootDir });

  await writeFile(sessionPath, '{"sessions":[{"minutes":25}]}\n');

  const result = await createGitSyncPlan({ rootDir });

  expect(result.kind).toBe("commit");
  if (result.kind === "commit") {
    expect(result.files).toEqual(["data/focus/sessions.json"]);
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
    {
      command: "git",
      args: ["push", "origin", "main"],
    },
  ]);
});

test("collects sync metadata without creating a commit", async () => {
  const result = await createGitSyncMetadata({
    rootDir,
    listPendingFiles: async () => [
      { path: "data/focus/sessions.json", status: "modified" },
      { path: "app/page.tsx", status: "modified" },
      { path: "data/sleep/entries.json", status: "untracked" },
    ],
    listRecentSyncCommits: async () => [
      {
        sha: "abc1234",
        date: "2026-03-20T10:00:00.000Z",
        subject: "sync: update tracker data (focus, sleep)",
        labels: ["focus", "sleep"],
      },
      {
        sha: "def5678",
        date: "2026-03-19T10:00:00.000Z",
        subject: "sync: update tracker data (workouts)",
        labels: ["workouts"],
      },
    ],
  });

  expect(result.pendingCount).toBe(2);
  expect(result.pendingFiles).toEqual([
    { path: "data/focus/sessions.json", status: "modified", label: "focus" },
    { path: "data/sleep/entries.json", status: "untracked", label: "sleep" },
  ]);
  expect(result.lastSyncedAt).toBe("2026-03-20T10:00:00.000Z");
  expect(result.lastSyncedCommit?.sha).toBe("abc1234");
  expect(result.recentCommits[0].labels).toEqual(["focus", "sleep"]);
});
