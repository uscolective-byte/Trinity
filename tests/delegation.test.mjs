import test from 'node:test';
import assert from 'node:assert/strict';
import dispatcher from '../workers/dispatcher/src/index.mjs';
import { requestWorkerHelp } from '../workers/shared/delegation.mjs';
import { createDelegatedTaskHandler } from '../workers/shared/delegated-handler.mjs';
import { handleWorkers } from '../src/routes/workers.js';

const task = { instruction: 'Summarize this public document' };
const payload = { capability: 'research', task, mode: 'read', depth: 0, requestId: 'test-1' };
function post(url, body, token = 'secret') {
  return new Request(url, {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
const dispatcherUrl = 'https://dispatcher.internal/delegate';

test('dispatcher rejects missing or incorrect credentials', async () => {
  const r = await dispatcher.fetch(post(dispatcherUrl, payload, 'wrong'), { TRINITY_DELEGATION_SECRET: 'secret' });
  assert.equal(r.status, 401);
});

test('dispatcher rejects write operations', async () => {
  const r = await dispatcher.fetch(post(dispatcherUrl, { ...payload, mode: 'write' }), { TRINITY_DELEGATION_SECRET: 'secret' });
  assert.equal(r.status, 403);
});

test('dispatcher refuses unbounded recursive delegation', async () => {
  const r = await dispatcher.fetch(post(dispatcherUrl, { ...payload, depth: 2 }), { TRINITY_DELEGATION_SECRET: 'secret' });
  assert.equal(r.status, 409);
});

test('dispatcher reports missing helper without auto-provisioning', async () => {
  const r = await dispatcher.fetch(post(dispatcherUrl, payload), { TRINITY_DELEGATION_SECRET: 'secret' });
  assert.equal(r.status, 202);
  assert.equal((await r.json()).status, 'helper_not_configured');
});

test('dispatcher delegates to a registered read-only helper', async () => {
  let downstream;
  const env = {
    TRINITY_DELEGATION_SECRET: 'secret',
    RESEARCH_HELPER: {
      async fetch(request) {
        downstream = await request.json();
        return Response.json({ summary: 'ok' });
      },
    },
  };
  const r = await dispatcher.fetch(post(dispatcherUrl, payload), env);
  const body = await r.json();
  assert.equal(r.status, 200);
  assert.equal(body.result.summary, 'ok');
  assert.equal(downstream.depth, 1);
  assert.equal(downstream.capability, 'research');
});

test('requestWorkerHelp requires configured dispatcher and secret', async () => {
  const r = await requestWorkerHelp({}, payload);
  assert.equal(r.status, 503);
});

test('requestWorkerHelp invokes dispatcher through service binding', async () => {
  let path;
  const env = {
    TRINITY_DELEGATION_SECRET: 'secret',
    TRINITY_DISPATCHER: {
      async fetch(request) {
        path = new URL(request.url).pathname;
        return Response.json({ status: 'completed' });
      },
    },
  };
  const r = await requestWorkerHelp(env, payload);
  assert.equal(r.status, 200);
  assert.equal(path, '/delegate');
});

test('a helper adapter verifies token, role and read-only mode', async () => {
  const handler = createDelegatedTaskHandler('research', async () => ({ answer: 'done' }));
  const bad = await handler(post('https://helper.internal/internal/task', payload, 'wrong'), { TRINITY_DELEGATION_SECRET: 'secret' });
  assert.equal(bad.status, 401);
  const good = await handler(post('https://helper.internal/internal/task', { ...payload, depth: 1 }), { TRINITY_DELEGATION_SECRET: 'secret' });
  assert.equal(good.status, 200);
  assert.equal((await good.json()).result.answer, 'done');
});

test('dashboard returns capabilities without configured dispatcher', async () => {
  const request = new Request('https://admin.internal/api/workers/capabilities');
  const response = await handleWorkers(request, {});
  assert.equal(response.status, 200);
  assert.equal((await response.json()).delegated, false);
});
