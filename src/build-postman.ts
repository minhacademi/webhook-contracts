import { readdir } from "node:fs/promises";
import { join, basename } from "node:path";

const ROOT = join(import.meta.dir, "..");
const COLLECTIONS_DIR = join(ROOT, "collections");
const OUTPUT_DIR = join(ROOT, "postman");

interface PostmanCollection {
  info: {
    name: string;
    schema: string;
  };
  variable: { key: string; value: string }[];
  item: PostmanItem[];
}

interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: { key: string; value: string }[];
    url: { raw: string; host: string[] };
    body: { mode: string; raw: string; options: { raw: { language: string } } };
  };
}

async function getCollectionDirs(): Promise<string[]> {
  const entries = await readdir(COLLECTIONS_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function getEventFiles(collectionDir: string): Promise<string[]> {
  const eventsDir = join(COLLECTIONS_DIR, collectionDir, "events");
  const entries = await readdir(eventsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => e.name)
    .sort();
}

function buildRequest(eventName: string, payload: string): PostmanItem {
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

async function buildCollection(collectionDir: string): Promise<void> {
  const files = await getEventFiles(collectionDir);

  const items: PostmanItem[] = [];
  for (const file of files) {
    const path = join(COLLECTIONS_DIR, collectionDir, "events", file);
    const raw = await Bun.file(path).text();
    const eventName = basename(file, ".json");
    items.push(buildRequest(eventName, raw));
  }

  const collection: PostmanCollection = {
    info: {
      name: collectionDir,
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    variable: [
      { key: "endpoint", value: "https://your-endpoint.com/webhook" },
    ],
    item: items,
  };

  const outputPath = join(OUTPUT_DIR, `${collectionDir}.postman_collection.json`);
  await Bun.write(outputPath, JSON.stringify(collection, null, 2) + "\n");
  console.log(`  ${outputPath}`);
}

// ---

const collections = await getCollectionDirs();
console.log(`Building ${collections.length} collection(s)...\n`);

for (const dir of collections) {
  await buildCollection(dir);
}

console.log("\nDone.");
