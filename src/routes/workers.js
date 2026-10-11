// Auth for /api/workers/* is enforced by src/index.js before this route.
import { requestWorkerHelp, jsonResult, CAPABILITIES } from '../../workers/shared/delegation.mjs';

export async function handleWorkers(request, env) {
  const { pathname } = new URL(request.url);
  if (pathname === '/api/workers/capabilities' && request.method === 'GET') {
    return jsonResult({ capabilities: CAPABILITIES, delegated: Boolean(env?.TRINITY_DISPATCHER) });
  }
  if (pathname === '/api/workers/help' && request.method === 'POST') {
    if (Number(request.headers.get('content-length') ?? 0) > 8192) {
      return jsonResult({ error: 'Task too large' }, 413);
    }
    let input;
    try {
      input = await request.json();
    } catch {
      return jsonResult({ error: 'Invalid JSON' }, 400);
    }
    return requestWorkerHelp(env, input);
  }
  return jsonResult({ error: 'Endpoint not found' }, 404);
}
