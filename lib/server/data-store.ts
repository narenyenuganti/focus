import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ZodType } from "zod";
import { collectionDefinitions, type CollectionName } from "@/lib/server/schema";

type StoreOptions = {
  rootDir?: string;
};

function getDataRoot(rootDir = process.cwd()) {
  if (process.env.TRACKER_DATA_DIR) {
    return path.resolve(rootDir, process.env.TRACKER_DATA_DIR);
  }

  return path.join(rootDir, "data");
}

function getCollectionFile(collection: CollectionName, rootDir?: string) {
  return path.join(getDataRoot(rootDir), `${collection}.json`);
}

async function ensureParentDirectory(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

function parseCollection<T>(schema: ZodType<T>, rawValue: string) {
  return schema.parse(JSON.parse(rawValue));
}

export async function readCollection<TCollection extends CollectionName>(
  collection: TCollection,
  options: StoreOptions = {},
) {
  const filePath = getCollectionFile(collection, options.rootDir);
  const schema = collectionDefinitions[collection] as ZodType<
    (typeof collectionDefinitions)[TCollection]["_type"]
  >;

  try {
    const raw = await readFile(filePath, "utf8");
    return parseCollection(schema, raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return schema.parse([]);
    }

    throw error;
  }
}

export async function writeCollection<TCollection extends CollectionName>(
  collection: TCollection,
  value: (typeof collectionDefinitions)[TCollection]["_type"],
  options: StoreOptions = {},
) {
  const filePath = getCollectionFile(collection, options.rootDir);
  const schema = collectionDefinitions[collection] as ZodType<
    (typeof collectionDefinitions)[TCollection]["_type"]
  >;
  const validatedValue = schema.parse(value);

  await ensureParentDirectory(filePath);
  await writeFile(filePath, `${JSON.stringify(validatedValue, null, 2)}\n`, "utf8");

  return validatedValue;
}
