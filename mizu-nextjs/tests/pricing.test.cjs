const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('data/pricing.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {} };
vm.runInNewContext(js, context);
const { buildQuoteDraft, serviceChoices } = context.exports;

test('custom service is included in the subject and brief, without removed questions', () => {
  const draft = buildQuoteDraft([serviceChoices.other, 'Small project'], '  Internal tool for our team  ', '  AI assistant  ');
  assert.match(draft.subject, /AI assistant/);
  assert.match(draft.body, /Service: AI assistant\nScope: Small project/);
  assert.match(draft.body, /PROJECT DETAILS\nInternal tool for our team\n/);
  assert.doesNotMatch(draft.body, /Design level:|Preferred start:|undefined/);
});

test('uncertain visitors can request a conversation without optional details', () => {
  const draft = buildQuoteDraft([serviceChoices.unsure, 'Not sure yet'], '   ');
  assert.match(draft.body, /Service: I'm not sure yet\nScope: Not sure yet/);
  assert.doesNotMatch(draft.body, /PROJECT DETAILS|Design level:|Preferred start:/);
});

test('a standard service never includes stale custom-service text', () => {
  const draft = buildQuoteDraft(['Branding', 'Logo & visual identity'], '', 'Old custom idea');
  assert.match(draft.subject, /Branding/);
  assert.match(draft.body, /Service: Branding/);
  assert.doesNotMatch(draft.body + draft.subject, /Old custom idea/);
});
