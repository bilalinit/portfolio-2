const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function client(fetch) {
  const source = fs.readFileSync('lib/agentStream.ts', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, process: { env: {} }, fetch, Response, TextDecoder, AbortController, setTimeout, clearTimeout };
  vm.runInNewContext(js, context);
  return context.exports;
}
const options = () => ({ message: 'Hello', history: [], onActivity() {}, onDelta() {}, onDeltaReset() {} });
const response = chunks => new Response(new ReadableStream({ start(controller) {
  for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
  controller.close();
}}), { headers: { 'Content-Type': 'text/event-stream' } });
const final = 'event: final\ndata: {"response":"ok"}\n\n';

for (const [name, chunks] of [
  ['LF frames', [final]],
  ['split chunks', [final.slice(0, 8), final.slice(8)]],
  ['CRLF frames', [('event: activity\ndata: {"phase":"generating"}\n\n' + final).replaceAll('\n', '\r\n')]],
  ['split CRLF separator', ['event: final\r\ndata: {"response":"ok"}\r', '\n\r', '\n']],
  ['CR frames', [final.replaceAll('\n', '\r')]],
  ['missing final delimiter', [final.trim()]],
  ['comment keepalive', [': ping\n\n', final]],
]) test(name, async () => {
  const api = client(async () => response(chunks));
  assert.equal(await api.streamAgentChat(options()), 'ok');
});

for (const [name, text] of [
  ['null data', 'event: final\ndata: null\n\n'],
  ['array data', 'event: final\ndata: []\n\n'],
  ['invalid JSON', 'event: final\ndata: {bad}\n\n'],
  ['empty response', 'event: final\ndata: {"response":""}\n\n'],
  ['missing response', 'event: final\ndata: {}\n\n'],
  ['oversized response', 'event: final\ndata: ' + JSON.stringify({ response: 'x'.repeat(4001) }) + '\n\n'],
  ['oversized frame', 'x'.repeat(65537)],
  ['truncated stream', 'event: delta\ndata: {"text":"partial"}\n\n'],
  ['error event', 'event: error\ndata: {"message":"failed"}\n\n'],
]) test(name, async () => {
  const api = client(async () => response([text]));
  await assert.rejects(api.streamAgentChat(options()), error => error instanceof api.AgentStreamError && error.stage === 'stream');
});

test('delta/reset and literal HTML text', async () => {
  const events = [];
  const text = '<img src=x onerror=alert(1)>';
  const api = client(async () => response([
    'event: delta\ndata: {"text":"draft"}\n\n',
    'event: delta_reset\ndata: {}\n\n',
    'event: final\ndata: ' + JSON.stringify({ response: text }) + '\n\n',
  ]));
  assert.equal(await api.streamAgentChat({ ...options(), onDelta: text => events.push(text), onDeltaReset: () => events.push('reset') }), text);
  assert.deepEqual(events, ['draft', 'reset']);
});

test('untrusted activity names never resolve inherited object properties', async () => {
  const labels = [];
  const api = client(async () => response(['event: activity\ndata: {"phase":"tool","tool":"__proto__"}\n\n', final]));
  assert.equal(await api.streamAgentChat({ ...options(), onActivity: label => labels.push(label) }), 'ok');
  assert.deepEqual(labels, ['Working on it…']);
});

for (const [body, headers, expected] of [
  ['{"retryAfter":25}', {}, 25], ['invalid', { 'Retry-After': '35' }, 35],
  ['null', {}, 60], ['{"retryAfter":-1}', {}, 60],
]) test('429 cooldown ' + expected + ' from ' + body, async () => {
  const api = client(async () => new Response(body, { status: 429, headers }));
  await assert.rejects(api.streamAgentChat(options()), error => error.retryAfter === expected && !error.canFallback);
});

for (const status of [400, 404, 405, 413, 422, 500, 501, 502, 503]) test('fallback policy for HTTP ' + status, async () => {
  const api = client(async () => new Response('error', { status }));
  await assert.rejects(api.streamAgentChat(options()), error => error.canFallback === [404, 405, 501].includes(status));
});

test('network errors do not trigger a duplicate model request', async () => {
  const api = client(async () => { throw new TypeError('network'); });
  await assert.rejects(api.streamAgentChat(options()), error => !error.canFallback);
});

test('an aborted request settles', async () => {
  const api = client(async (_url, { signal }) => { if (signal.aborted) throw new Error('aborted'); });
  const controller = new AbortController(); controller.abort();
  await assert.rejects(api.streamAgentChat({ ...options(), signal: controller.signal }), error => error instanceof api.AgentStreamError);
});

test('reader is cancelled after authoritative final, without waiting for EOF', async () => {
  let cancelled = false;
  const api = client(async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode(final)); },
    cancel() { cancelled = true; },
  }), { headers: { 'Content-Type': 'text/event-stream' } }));
  assert.equal(await api.streamAgentChat(options()), 'ok');
  assert.equal(cancelled, true);
});

test('long histories and invalid old messages stay within the server budget', async () => {
  let sent;
  const api = client(async (_url, opts) => { sent = JSON.parse(opts.body); return response([final]); });
  const history = Array.from({ length: 100 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x'.repeat(1000) }));
  history.unshift({ role: 'user', content: 'x'.repeat(4001) });
  await api.streamAgentChat({ ...options(), history });
  assert.ok(sent.history.length <= 20);
  assert.ok(sent.history.reduce((sum, item) => sum + item.content.length, sent.message.length) <= 12000);
  assert.equal(sent.history[0].role, 'user');
});
