import { readdir, stat, rm, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const agentEnabled = process.env.NEXT_PUBLIC_AGENT_ENABLED !== "false";
const agentUrl = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";
const parsedAgent = new URL(agentUrl);
const hostname = parsedAgent.hostname.toLowerCase();
const privateHost = hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") ||
  /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname) ||
  hostname.startsWith("[");
if (!['http:', 'https:'].includes(parsedAgent.protocol) || parsedAgent.username || parsedAgent.password || parsedAgent.pathname !== '/' || parsedAgent.search || parsedAgent.hash) {
  throw new Error("NEXT_PUBLIC_AGENT_URL must be an HTTP(S) origin without credentials or paths.");
}

if (process.env.CF_PAGES && process.env.NEXT_PUBLIC_AGENT_ENABLED !== "false") {
  const backend = process.env.NEXT_PUBLIC_AGENT_URL;
  if (!backend || parsedAgent.protocol !== "https:" || privateHost) {
    throw new Error("Set NEXT_PUBLIC_AGENT_URL to Nami's public HTTPS application URL before deploying.");
  }
}

// Static Next.js hydration needs inline scripts/styles. Limit connections to
// the configured chat origin and deny embedding/plugins independently.
const headers = await readFile("public/_headers", "utf8");
await writeFile("out/_headers", headers.replace("connect-src 'self'", `connect-src 'self'${agentEnabled ? ` ${parsedAgent.origin}` : ""}`));

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
