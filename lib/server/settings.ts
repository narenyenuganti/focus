import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  settingsPatchSchema,
  settingsSchema,
  type TrackerSettings,
} from "@/lib/server/schema";

type StoreOptions = {
  rootDir?: string;
};

function getDataRoot(rootDir = process.cwd()) {
  if (process.env.TRACKER_DATA_DIR) {
    return path.resolve(rootDir, process.env.TRACKER_DATA_DIR);
  }

  return path.join(rootDir, "data");
}

function getSettingsFilePath(rootDir?: string) {
  return path.join(getDataRoot(rootDir), "config", "settings.json");
}

async function ensureParentDirectory(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

function parseSettings(rawValue: string) {
  return settingsSchema.parse(JSON.parse(rawValue));
}

export function getDefaultSettings() {
  return settingsSchema.parse({});
}

export async function readSettings(options: StoreOptions = {}) {
  const filePath = getSettingsFilePath(options.rootDir);

  try {
    const raw = await readFile(filePath, "utf8");
    return parseSettings(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return getDefaultSettings();
    }

    throw error;
  }
}

export async function writeSettings(
  value: TrackerSettings,
  options: StoreOptions = {},
) {
  const filePath = getSettingsFilePath(options.rootDir);
  const validatedValue = settingsSchema.parse(value);

  await ensureParentDirectory(filePath);
  await writeFile(filePath, `${JSON.stringify(validatedValue, null, 2)}\n`, "utf8");

  return validatedValue;
}

export async function updateSettings(
  patch: Partial<TrackerSettings>,
  options: StoreOptions = {},
) {
  const currentSettings = await readSettings(options);
  const validatedPatch = settingsPatchSchema.parse(patch);

  return writeSettings(
    {
      ...currentSettings,
      ...validatedPatch,
    },
    options,
  );
}
