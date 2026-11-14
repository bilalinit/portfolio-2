const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const snapshot = require('../data/github-activity.json');
const source = import('../lib/github-contributions.mjs');

function calendarFixture({ omitTooltip = false, totalOffset = 0 } = {}) {
  const days = snapshot.profiles[0].weeks.flat();
  // Upstream markup is row-major; ensure dates don't depend on DOM order.
  const cells = [...days].reverse().map((day, i) => {
    const count = day.contributionCount ? `${day.contributionCount.toLocaleString('en-US')} contributions` : 'No contributions';
    return `<td data-date="${day.date}" id="day-${i}" data-level="0"></td>${omitTooltip && i === 0 ? '' : `<tool-tip for="day-${i}">${count} on November 9th.</tool-tip>`}`;
  }).join('');
  return `<h2 id="js-contribution-activity-description">${(snapshot.profiles[0].total + totalOffset).toLocaleString('en-US')} contributions in the last year</h2>${cells}`;
}

test('parses a complete public calendar and preserves exact totals and date order', async () => {
  const { parseGithubCalendar, isGithubActivity } = await source;
  const result = parseGithubCalendar(calendarFixture(), '2026-11-13T12:00:00Z');
  assert.equal(result.profiles[0].login, 'AhmedSaeed4');
  assert.equal(result.profiles[0].total, snapshot.profiles[0].total);
  assert.equal(result.profiles[0].start, snapshot.profiles[0].start);
  assert.equal(result.profiles[0].end, snapshot.profiles[0].end);
  assert.equal(isGithubActivity(result), true);
});
test('rejects missing daily counts, truncated markup and inconsistent totals', async () => {
  const { parseGithubCalendar } = await source;
  assert.throws(() => parseGithubCalendar(calendarFixture({ omitTooltip: true })), /Incomplete/);
  assert.throws(() => parseGithubCalendar('<html>Rate limited</html>'), /Incomplete/);
  assert.throws(() => parseGithubCalendar(calendarFixture({ totalOffset: 1 })), /total mismatch/);
});
test('rejects wrong accounts, missing weeks and invalid dates before client rendering', async () => {
  const { isGithubActivity } = await source;
  for (const mutate of [
    data => { data.profiles[0].login = 'another-account'; },
    data => { data.profiles[0].weeks.pop(); },
    data => { data.profiles[0].weeks[0][0].date = '2026-02-30'; },
    data => { data.refreshedAt = 'not-a-date'; },
  ]) {
    const data = structuredClone(snapshot);
    mutate(data);
    assert.equal(isGithubActivity(data), false);
  }
});

async function endpointHarness(t) {
  const savedFetch = global.fetch;
  const savedCaches = global.caches;
  t.after(() => { global.fetch = savedFetch; if (savedCaches === undefined) delete global.caches; else global.caches = savedCaches; });
  const entries = new Map();
  global.caches = { default: {
    match: async key => entries.get(key.url)?.clone(),
    put: async (key, response) => { entries.set(key.url, response.clone()); },
  } };
  const promises = [];
  const { onRequestGet } = await import('../functions/api/github-activity.js');
  return { run: url => onRequestGet({ request: new Request(url), waitUntil: promise => promises.push(promise) }), flush: () => Promise.all(promises) };
}
test('endpoint caches validated GitHub data hourly and ignores query cache busting', async t => {
  const harness = await endpointHarness(t);
  let calls = 0;
  global.fetch = async url => { calls++; assert.equal(url, 'https://github.com/users/AhmedSaeed4/contributions'); return new Response(calendarFixture()); };
  const first = await harness.run('https://mizu.example/api/github-activity?account=other');
  assert.equal(first.status, 200);
  assert.equal(first.headers.get('cache-control'), 'public, max-age=3600');
  assert.equal((await first.json()).profiles[0].login, 'AhmedSaeed4');
  await harness.flush();
  const second = await harness.run('https://mizu.example/api/github-activity?refresh=anything');
  assert.equal(second.status, 200);
  assert.equal(calls, 1);
});
test('endpoint reports failure without fabricating fresh dates or counts', async t => {
  const harness = await endpointHarness(t);
  global.fetch = async () => new Response('Unavailable', { status: 429 });
  const response = await harness.run('https://mizu.example/api/github-activity');
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.refreshedAt, undefined);
  assert.equal(body.profiles, undefined);
});
test('only the activity API invokes Pages Functions, leaving static pages unmetered', () => {
  const routes = JSON.parse(readFileSync('public/_routes.json', 'utf8'));
  assert.deepEqual(routes.include, ['/api/github-activity']);
  assert.deepEqual(routes.exclude, []);
});
