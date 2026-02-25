import { readdir } from "node:fs/promises";
import { join, basename } from "node:path";

const ROOT = join(import.meta.dir, "..");
const COLLECTIONS_DIR = join(ROOT, "collections");
const OUTPUT_DIR = join(ROOT, "postman");
const COLLECTION_NAME = "Cademi Webhooks";

interface PostmanRequest {
  name: string;
  request: {
    method: string;
    header: { key: string; value: string }[];
    url: { raw: string; host: string[] };
    body: {
      mode: string;
      raw: string;
      options: { raw: { language: string } };
    };
  };
}

interface PostmanFolder {
  name: string;
  item: PostmanRequest[];
}

interface PostmanCollection {
  info: {
    name: string;
    schema: string;
  };
  variable: { key: string; value: string }[];
  item: PostmanFolder[];
}

async function getCollectionDirs(): Promise<string[]> {
  const entries = await readdir(COLLECTIONS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

async function getEventFiles(collectionDir: string): Promise<string[]> {
  const eventsDir = join(COLLECTIONS_DIR, collectionDir, "events");
  const entries = await readdir(eventsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => e.name)
    .sort();
}

function buildRequest(eventName: string, payload: string): PostmanRequest {
  return {
    name: eventName,
    request: {
      method: "POST",
      header: [{ key: "Content-Type", value: "application/json" }],
      url: { raw: "{{endpoint}}", host: ["{{endpoint}}"] },
      body: {
        mode: "raw",
        raw: payload,
        options: { raw: { language: "json" } },
      },
    },
  };
}

async function buildFolder(collectionDir: string): Promise<PostmanFolder> {
  const files = await getEventFiles(collectionDir);

  const items: PostmanRequest[] = [];
  for (const file of files) {
    const path = join(COLLECTIONS_DIR, collectionDir, "events", file);
    const raw = await Bun.file(path).text();
    items.push(buildRequest(basename(file, ".json"), raw));
  }

  console.log(`  ${collectionDir}/ (${items.length} events)`);
  return { name: collectionDir, item: items };
}

// ---

const dirs = await getCollectionDirs();
console.log(`Building "${COLLECTION_NAME}" with ${dirs.length} folder(s)...\n`);

const folders: PostmanFolder[] = [];
for (const dir of dirs) {
  folders.push(await buildFolder(dir));
}

const collection: PostmanCollection = {
  info: {
    name: COLLECTION_NAME,
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "endpoint", value: "https://your-endpoint.com/webhook" },
  ],
  item: folders,
};

const outputPath = join(OUTPUT_DIR, "cademi.postman_collection.json");
await Bun.write(outputPath, JSON.stringify(collection, null, 2) + "\n");

console.log(`\n  -> ${outputPath}`);
console.log("\nDone.");
