import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

type ExecFn = (command: string, args: string[]) => Promise<string>;

type SyncDependencies = {
  rootDir?: string;
  listChangedFiles?: () => Promise<string[]>;
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
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.slice(3).trim())
      .filter(Boolean);
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

  return plan;
}
