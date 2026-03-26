import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

type ExecFn = (command: string, args: string[]) => Promise<string>;

type SyncDependencies = {
  rootDir?: string;
  listChangedFiles?: () => Promise<string[]>;
  exec?: ExecFn;
};

type PendingFileStatus = {
  path: string;
  status:
    | "added"
    | "copied"
    | "deleted"
    | "changed"
    | "modified"
    | "renamed"
    | "typechange"
    | "untracked";
  label: string | null;
};

type RecentSyncCommit = {
  sha: string;
  date: string;
  subject: string;
  labels: string[];
};

type SyncMetadataDependencies = {
  rootDir?: string;
  listPendingFiles?: () => Promise<PendingFileStatus[]>;
  listRecentSyncCommits?: () => Promise<RecentSyncCommit[]>;
  exec?: ExecFn;
};

export type GitSyncPlan =
  | {
      kind: "noop";
      message: string;
      files: [];
    }
  | {
      kind: "commit";
      message: string;
      files: string[];
      commitMessage: string;
    };

export type GitSyncMetadata = {
  pendingFiles: PendingFileStatus[];
  pendingCount: number;
  recentCommits: RecentSyncCommit[];
  lastSyncedAt: string | null;
  lastSyncedCommit: RecentSyncCommit | null;
};

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

const execFileAsync = promisify(execFile);

function toDataLabel(filePath: string) {
  const dataPrefix = "data/";
  if (!filePath.startsWith(dataPrefix)) {
    return null;
  }

  const relativePath = filePath.slice(dataPrefix.length);
  const [section] = relativePath.split("/", 1);
  return section || path.parse(relativePath).name;
}

function parseStatusCode(statusCode: string): PendingFileStatus["status"] {
  if (statusCode === "??") {
    return "untracked";
  }

  if (statusCode.includes("R")) {
    return "renamed";
  }

  if (statusCode.includes("C")) {
    return "copied";
  }

  if (statusCode.includes("A")) {
    return "added";
  }

  if (statusCode.includes("D")) {
    return "deleted";
  }

  if (statusCode.includes("T")) {
    return "typechange";
  }

  if (statusCode.includes("M")) {
    return "modified";
  }

  return "changed";
}

function parseStatusLine(line: string): PendingFileStatus | null {
  const statusCode = line.slice(0, 2);
  const entry = line.slice(3).trim();

  if (!entry) {
    return null;
  }

  const pathName = entry.includes(" -> ") ? entry.split(" -> ").at(-1) ?? entry : entry;

  return {
    path: pathName,
    status: parseStatusCode(statusCode),
    label: toDataLabel(pathName),
  };
}

function extractCommitLabels(subject: string) {
  const match = subject.match(/\((.*)\)$/);

  if (!match) {
    return [];
  }

  return uniqueSorted(
    match[1]
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean),
  );
}

export function buildSyncCommitMessage(labels: string[]) {
  const uniqueLabels = uniqueSorted(labels.filter(Boolean));

  if (uniqueLabels.length === 0) {
    return "sync: update tracker data";
  }

  return `sync: update tracker data (${uniqueLabels.join(", ")})`;
}

export async function createGitSyncPlan({
  rootDir = process.cwd(),
  listChangedFiles = async () => {
    const { stdout } = await execFileAsync("git", [
      "-C",
      rootDir,
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
      "--",
      "data/",
    ]);

    return stdout
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => parseStatusLine(line)?.path ?? null)
      .filter((filePath): filePath is string => Boolean(filePath));
  },
}: SyncDependencies = {}): Promise<GitSyncPlan> {
  const changedFiles = uniqueSorted((await listChangedFiles()).filter((file) => file.startsWith("data/")));

  if (changedFiles.length === 0) {
    return {
      kind: "noop",
      message: "Nothing to sync.",
      files: [],
    };
  }

  const labels = uniqueSorted(changedFiles.map((file) => toDataLabel(file)).filter((label): label is string => Boolean(label)));

  return {
    kind: "commit",
    message: "Tracker data ready to sync.",
    files: changedFiles,
    commitMessage: buildSyncCommitMessage(labels),
  };
}

export async function createGitSyncMetadata({
  rootDir = process.cwd(),
  listPendingFiles = async () => {
    const { stdout } = await execFileAsync("git", [
      "-C",
      rootDir,
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
      "--",
      "data/",
    ]);

    return stdout
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => parseStatusLine(line))
      .filter((entry): entry is PendingFileStatus => Boolean(entry));
  },
  listRecentSyncCommits = async () => {
    const { stdout } = await execFileAsync("git", [
      "-C",
      rootDir,
      "log",
      "--date=iso-strict",
      "--format=%H%x1f%cI%x1f%s",
      "--grep=^sync: update tracker data",
      "--",
      "data/",
    ]);

    return stdout
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => {
        const [sha, date, subject] = line.split("\x1f");

        return {
          sha,
          date,
          subject,
          labels: extractCommitLabels(subject),
        };
      });
  },
}: SyncMetadataDependencies = {}): Promise<GitSyncMetadata> {
  const [pendingFiles, recentCommits] = await Promise.all([
    listPendingFiles(),
    listRecentSyncCommits(),
  ]);

  const trackedPendingFiles = uniqueSorted(
    pendingFiles.filter((file) => file.path.startsWith("data/")).map((file) => file.path),
  ).map((filePath) => {
    const entry = pendingFiles.find((file) => file.path === filePath);

    return {
      path: filePath,
      status: entry?.status ?? "changed",
      label: toDataLabel(filePath),
    };
  });

  return {
    pendingFiles: trackedPendingFiles,
    pendingCount: trackedPendingFiles.length,
    recentCommits,
    lastSyncedAt: recentCommits[0]?.date ?? null,
    lastSyncedCommit: recentCommits[0] ?? null,
  };
}

export async function runGitSync({
  rootDir = process.cwd(),
  listChangedFiles,
  exec = async (command, args) => {
    const { stdout } = await execFileAsync(command, args, { cwd: rootDir });
    return stdout;
  },
}: SyncDependencies = {}) {
  const plan = await createGitSyncPlan({ rootDir, listChangedFiles });

  if (plan.kind === "noop") {
    return plan;
  }

  await exec("git", ["add", "--", ...plan.files]);
  await exec("git", ["commit", "-m", plan.commitMessage]);
  await exec("git", ["push", "origin", "main"]);

  return plan;
}
