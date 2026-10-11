// Shared, bounded delegation client. Copy/import in each Trinity Worker.
// No dynamic Cloudflare deployments are performed by this module.
export const CAPABILITIES = Object.freeze([
  'coding', 'browser', 'research', 'memory', 'model', 'tools',
]);
export const MAX_DEPTH = 2;
const MAX_TASK_BYTES = 8192;

export function jsonResult(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function validateDelegation(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Request must be an object';
  if (!CAPABILITIES.includes(input.capability)) return 'Unknown capability';
  if (input.mode !== undefined && input.mode !== 'read' && input.mode !== 'write') return 'Invalid mode';
  if (!Number.isInteger(input.depth ?? 0) || (input.depth ?? 0) < 0 || (input.depth ?? 0) > MAX_DEPTH) {
    return 'Invalid delegation depth';
  }
  if (!input.task || typeof input.task !== 'object' || Array.isArray(input.task)) return 'Invalid task';
  if (typeof input.task.instruction !== 'string' || input.task.instruction.trim().length < 1) {
    return 'Task instruction is required';
  }
  if (typeof input.requestId !== 'undefined' &&
      (typeof input.requestId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(input.requestId))) {
    return 'Invalid requestId';
  }
  try {
    if (new TextEncoder().encode(JSON.stringify(input)).byteLength > MAX_TASK_BYTES) return 'Task too large';
  } catch {
    return 'Invalid task';
  }
  return null;
}

export async function requestWorkerHelp(env, input) {
  const error = validateDelegation(input);
  if (error) return jsonResult({ error }, 400);
  if (input.mode === 'write') {
    return jsonResult({ status: 'approval_required', reason: 'Write/execute/deploy tasks must use a separate approved workflow' }, 403);
  }
  if ((input.depth ?? 0) >= MAX_DEPTH) {
    return jsonResult({ error: 'Maximum delegation depth reached' }, 409);
  }
  if (!env?.TRINITY_DISPATCHER || !env?.TRINITY_DELEGATION_SECRET) {
    return jsonResult({ status: 'not_configured', error: 'Dispatcher binding or secret is missing' }, 503);
  }

  const requestId = input.requestId ?? crypto.randomUUID();
  const message = {
    capability: input.capability,
    task: input.task,
    mode: 'read',
    depth: input.depth ?? 0,
    requestId,
  };
  try {
    const response = await env.TRINITY_DISPATCHER.fetch(new Request('https://dispatcher.internal/delegate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + env.TRINITY_DELEGATION_SECRET,
        'content-type': 'application/json',
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(10000),
    }));
    const body = await response.text();
    // Do not pass arbitrary downstream headers back to public clients.
    return new Response(body, {
      status: response.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return jsonResult({ status: 'unavailable', error: 'Dispatcher request failed', requestId }, 502);
  }
}
