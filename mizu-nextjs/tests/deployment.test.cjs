const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

for (const url of ['', 'http://backend.vercel.app', 'https://localhost', 'https://127.0.0.1',
  'https://192.168.1.2', 'https://10.0.0.1', 'https://172.20.1.1', 'https://[::1]',
  'https://user:password@backend.vercel.app', 'https://backend.vercel.app/api/agent',
  'https://backend.vercel.app?query=1', 'https://backend.vercel.app#fragment']) {
  test('Cloudflare build rejects unsafe backend origin ' + url, () => {
    const result = spawnSync(process.execPath, ['scripts/prepare-pages.mjs'], {
      env: { ...process.env, CF_PAGES: '1', NEXT_PUBLIC_AGENT_ENABLED: 'true', NEXT_PUBLIC_AGENT_URL: url },
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /NEXT_PUBLIC_AGENT_URL/);
  });
}
