import { rm } from "node:fs/promises";
import path from "node:path";

const TEST_DATA_DIR = path.join(process.cwd(), ".test-data");

export async function resetTestData() {
  await rm(TEST_DATA_DIR, { recursive: true, force: true });
}
