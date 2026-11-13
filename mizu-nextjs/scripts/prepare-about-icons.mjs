import { mkdir, writeFile } from 'node:fs/promises';

const directory = new URL('../public/tech-icons/', import.meta.url);
await mkdir(directory, { recursive: true });
const icons = ['nextdotjs', 'typescript', 'html5', 'python', 'fastapi', 'kotlin', 'qt', 'github', 'docker', 'kubernetes', 'vercel', 'cloudflare', 'anthropic', 'claude', 'openai'];
await Promise.all(icons.map(async (icon) => {
  const version = icon === 'openai' ? '14.0.0' : '16.0.0';
  const response = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@${version}/icons/${icon}.svg`);
  if (!response.ok) throw new Error(`Cannot fetch ${icon}: ${response.status}`);
  const svg = await response.text();
  if (!svg.includes('<svg')) throw new Error(`Invalid SVG: ${icon}`);
  await writeFile(new URL(`${icon}.svg`, directory), svg);
}));
const license = await fetch('https://cdn.jsdelivr.net/npm/simple-icons@16.0.0/LICENSE.md');
if (!license.ok) throw new Error('Cannot fetch Simple Icons license');
await writeFile(new URL('LICENSE.txt', directory), await license.text());
await writeFile(new URL('SOURCE.txt', directory), 'Brand icons: Simple Icons 16.0.0 (OpenAI: 14.0.0), https://github.com/simple-icons/simple-icons\nCC0-1.0; see LICENSE.txt. Brand names and marks belong to their respective owners.\n');
console.log(`Saved ${icons.length} local SVG brand icons.`);
