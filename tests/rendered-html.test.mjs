import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("build packages the SAC application, APIs and database migrations", async () => {
  const serverBundle = await readFile(path.join(root, "dist", "server", "index.js"), "utf8");
  assert.match(serverBundle, /SAC \| Recepción segura/);
  assert.match(serverBundle, /api\/receptions/);
  assert.ok((await stat(path.join(root, "dist", ".openai", "drizzle", "0000_same_goliath.sql"))).size > 1_000);
  assert.ok((await stat(path.join(root, "dist", ".openai", "drizzle", "0001_seed_pilot_collaborators.sql"))).size > 500);
});

test("compiled client contains the final SAC experience and no legacy brand", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "dist", "client", ".vite", "manifest.json"), "utf8"));
  const assetFiles = Object.values(manifest).map((entry) => entry.file).filter((file) => file.endsWith(".js"));
  const bundles = (await Promise.all(assetFiles.map((file) => readFile(path.join(root, "dist", "client", file), "utf8")))).join("\n");
  assert.match(bundles, /Bienvenido a SAC/);
  assert.match(bundles, /Pregúntale a SACI/);
  assert.doesNotMatch(bundles, /Academia SAC/i);
});
