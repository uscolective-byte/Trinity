// Trinity Dispatcher: service-bound role routing, never auto-provisions Workers.
import { CAPABILITIES, MAX_DEPTH, jsonResult, validateDelegation } from '../../shared/delegation.mjs';

const BINDINGS = Object.freeze({
  coding: 'CODING_HELPER',
  browser: 'BROWSER_HELPER',
  research: 'RESEARCH_HELPER',
  memory: 'MEMORY_HELPER',
  model: 'MODEL_HELPER',
  tools: 'TOOLS_HELPER',
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      // Service-level signal only, not public fleet status.
      return jsonResult({ service: 'trinity-dispatcher', status: 'online' });
    }
    if (url.pathname !== '/delegate' || request.method !== 'POST') {
      return jsonResult({ error: 'Not found' }, 404);
    }
    if (!env.TRINITY_DELEGATION_SECRET ||
        request.headers.get('authorization') !== 'Bearer ' + env.TRINITY_DELEGATION_SECRET) {
      return jsonResult({ error: 'Unauthorized' }, 401);
    }
    if (Number(request.headers.get('content-length') ?? 0) > 8192) {
      return jsonResult({ error: 'Task too large' }, 413);
    }
    let data;
    try {
      data = await request.json();
    } catch {
      return jsonResult({ error: 'Invalid JSON' }, 400);
    }
    const error = validateDelegation(data);
    if (error) return jsonResult({ error }, 400);
    if (!CAPABILITIES.includes(data.capability)) return jsonResult({ error: 'Unknown role' }, 400);
    if (data.mode !== 'read') {
      return jsonResult({ status: 'approval_required', reason: 'Only read-only delegation is enabled' }, 403);
    }
    if (data.depth >= MAX_DEPTH) return jsonResult({ error: 'Maximum depth reached' }, 409);

    const bindingName = BINDINGS[data.capability];
    const target = env[bindingName];
    if (!target || typeof target.fetch !== 'function') {
      return jsonResult({
        status: 'helper_not_configured',
        capability: data.capability,
        action: 'Configure an existing helper service binding; new provisioning requires admin approval',
        requestId: data.requestId,
      }, 202);
    }
    try {
      const response = await target.fetch(new Request('https://helper.internal/internal/task', {
        method: 'POST',
        headers: {
          authorization: 'Bearer ' + env.TRINITY_DELEGATION_SECRET,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          task: data.task,
          mode: 'read',
          depth: data.depth + 1,
          capability: data.capability,
          requestId: data.requestId,
        }),
        signal: AbortSignal.timeout(8000),
      }));
      const body = await response.text();
      if (!response.ok) {
        return jsonResult({
          status: 'helper_failed',
          capability: data.capability,
          requestId: data.requestId,
          helperStatus: response.status,
        }, 502);
      }
      // Helper must return JSON; do not reflect arbitrary headers.
      let result;
      try { result = JSON.parse(body); } catch {
        return jsonResult({ error: 'Invalid helper response', requestId: data.requestId }, 502);
      }
      return jsonResult({
        status: 'completed',
        capability: data.capability,
        requestId: data.requestId,
        result,
      });
    } catch {
      return jsonResult({ status: 'unavailable', error: 'Helper call failed', requestId: data.requestId }, 502);
    }
  },
};
