// Import into EACH pre-existing helper Worker and call before its normal router.
// Supply only a read-only implementation for the named capability.
import { MAX_DEPTH, jsonResult, validateDelegation } from './delegation.mjs';

export function createDelegatedTaskHandler(capability, runReadOnly) {
  if (typeof runReadOnly !== 'function') throw new TypeError('runReadOnly handler required');
  return async function handleDelegatedTask(request, env) {
    if (new URL(request.url).pathname !== '/internal/task') return null;
    if (request.method !== 'POST') return jsonResult({ error: 'Method not allowed' }, 405);
    if (!env.TRINITY_DELEGATION_SECRET ||
        request.headers.get('authorization') !== 'Bearer ' + env.TRINITY_DELEGATION_SECRET) {
      return jsonResult({ error: 'Unauthorized' }, 401);
    }
    if (Number(request.headers.get('content-length') ?? 0) > 8192) {
      return jsonResult({ error: 'Task too large' }, 413);
    }
    let input;
    try { input = await request.json(); } catch {
      return jsonResult({ error: 'Invalid JSON' }, 400);
    }
    const error = validateDelegation(input);
    if (error) return jsonResult({ error }, 400);
    if (input.capability !== capability || input.mode !== 'read') {
      return jsonResult({ error: 'Capability or mode not allowed' }, 403);
    }
    if ((input.depth ?? 0) > MAX_DEPTH) return jsonResult({ error: 'Max depth exceeded' }, 409);
    try {
      const result = await runReadOnly(input.task, { requestId: input.requestId, depth: input.depth }, env);
      return jsonResult({ ok: true, result, requestId: input.requestId });
    } catch {
      return jsonResult({ error: 'Helper execution failed', requestId: input.requestId }, 502);
    }
  };
}
