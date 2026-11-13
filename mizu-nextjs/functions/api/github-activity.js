import { GITHUB_LOGIN, parseGithubCalendar } from '../../lib/github-contributions.mjs';

export async function onRequestGet(context) {
  // One fixed public profile and one canonical cache key. No query-string
  // cache busting, tokens, database, or paid third-party calendar service.
  const key = new Request(`${new URL(context.request.url).origin}/api/github-activity`);
  const cache = caches.default;
  const cached = await cache.match(key);
  if (cached) return cached;
  try {
    const response = await fetch(`https://github.com/users/${GITHUB_LOGIN}/contributions`, {
      headers: { Accept: 'text/html', 'Accept-Language': 'en-US', 'User-Agent': 'Mizu-Portfolio-GitHub-Activity' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('GitHub unavailable');
    const data = parseGithubCalendar(await response.text());
    const output = Response.json(data, { headers: {
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    } });
    context.waitUntil(cache.put(key, output.clone()).catch(() => {}));
    return output;
  } catch {
    // The client keeps its dated snapshot on failure; don't claim stale
    // counts were refreshed or cache malformed GitHub markup as valid data.
    return Response.json({ error: 'GitHub activity is temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  }
}
