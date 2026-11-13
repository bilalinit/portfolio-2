import type { CSSProperties } from "react";
import styles from "./SkillIcon.module.css";

const brands: Record<string, string> = {
  "Next.js & React": "nextdotjs", "TypeScript & JavaScript": "typescript", "HTML & CSS": "html5",
  "Python & FastAPI": "python", "Kotlin & Android": "kotlin", "Python & PyQt6": "qt",
  "Claude Code": "claude", Codex: "openai", "OpenAI Agents SDK": "openai", "Git & GitHub": "github", "Docker & Docker Compose": "docker",
  "Kubernetes & Helm": "kubernetes", Vercel: "vercel", "Cloudflare Pages": "cloudflare",
};
const symbols: Record<string, string> = {
  "Graphic design": "m4 20 4-1 12-12-5-5L3 14l1 6Zm8-15 5 5M3 14l5 5",
  "Motion graphics": "m9 5 11 7-11 7V5ZM3 7v10",
  "2D & 3D animation": "m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5M12 12 3 7m9 5v10",
  "Composition & typography": "M4 5h16M12 5v15M8 20h8M4 5v3m16-3v3",
  "Compositing & VFX": "m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5",
  "APIs & real-time features": "m8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18",
  "OpenAI Agents SDK": "M9 3h6v6H9V3ZM2 16h6v6H2v-6Zm14 0h6v6h-6v-6ZM12 9v4M5 16v-3h14v3",
  "Agent frameworks & workflows": "M3 3h6v6H3V3Zm12 12h6v6h-6v-6ZM9 6h6a3 3 0 0 1 3 3v6M6 9v6a3 3 0 0 0 3 3h6",
  "Integrations & automation": "m13 2-9 12h7l-1 8 10-12h-8l1-8Z",
  "Desktop applications": "M3 3h18v13H3V3Zm9 13v5m-5 0h10",
  "Voice & transcription tools": "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5Zm-4 6v1a7 7 0 0 0 14 0v-1m-7 8v3m-4 0h8",
  Codex: "m4 6 6 6-6 6m9 0h7",
};

export default function SkillIcon({ skill }: { skill: string }) {
  const brand = brands[skill];
  if (brand) return <span aria-hidden="true" className={styles.brand} style={{ "--icon": `url('/tech-icons/${brand}.svg')` } as CSSProperties} />;
  return <svg className={styles.symbol} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={symbols[skill] || "M4 4h16v16H4z"} /></svg>;
}
