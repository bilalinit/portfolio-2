import { readdir, stat, rm } from "node:fs/promises";
import { join } from "node:path";

if (process.env.CF_PAGES && process.env.NEXT_PUBLIC_AGENT_ENABLED !== "false") {
  const backend = process.env.NEXT_PUBLIC_AGENT_URL;
  if (!backend || !backend.startsWith("https://") || /localhost|127\.0\.0\.1/.test(backend)) {
    throw new Error("Set NEXT_PUBLIC_AGENT_URL to Nami's public HTTPS application URL before deploying.");
  }
}

// Legacy reference video is unused by the site and exceeds Pages' asset limit.
// Keep public/showreel.mp4 intact; exclude only its generated deployment copy.
await rm("out/showreel.mp4", { force: true });

async function checkAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await checkAssets(path);
    else if ((await stat(path)).size > 25 * 1024 * 1024) {
      throw new Error(`Cloudflare Pages asset exceeds 25 MiB: ${path}`);
    }
  }
}
await checkAssets("out");
console.log("Cloudflare Pages output ready: out/");
