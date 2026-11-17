import { aiBehaviorLog, logAudit } from '../data/store.js';
import { evaluatePolicy } from '../../core/policy.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

const productionUrl = 'https://auru.space/';

async function observeProduction() {
  const attempts = [];
  const origin = new URL(productionUrl).origin;
  for (const method of ['HEAD', 'GET']) {
    let url = productionUrl;
    for (let hop = 0; hop < 3; hop++) {
      try {
        const result = await fetch(url, {
          method,
          redirect: 'manual',
          signal: AbortSignal.timeout(3000),
        });
        const location = result.headers.get('location');
        await result.body?.cancel().catch(() => {});
        attempts.push({ method, url, httpStatus: result.status });
        if (result.ok) return attempts;
        if (![301, 302, 303, 307, 308].includes(result.status) || !location) break;
        const target = new URL(location, url);
        if (target.origin !== origin || target.username || target.password || target.href === url) break;
        url = target.href;
      } catch {
        attempts.push({ method, url, error: 'HTTP požiadavka zlyhala alebo vypršala.' });
        break;
      }
    }
  }
  return attempts;
}

function recordObservation(command, response, attempts) {
  const observation = { time: new Date().toISOString(), command, response };
  if (attempts) observation.evidence = { url: productionUrl, attempts };
  aiBehaviorLog.unshift(observation);
  if (aiBehaviorLog.length > 50) aiBehaviorLog.pop();
  logAudit('AI_OBSERVATION', 'super-admin', command);
  return observation;
}

export async function handleAI(request) {
  const path = new URL(request.url).pathname;

  if (path === '/api/ai/behavior' && request.method === 'GET') {
    return json({ logs: aiBehaviorLog.slice(0, 50) });
  }

  if (path === '/api/ai/autonomous/status' && request.method === 'GET') {
    return json({ active: false, status: 'unavailable', reason: 'Overený autonómny engine nie je pripojený.' });
  }

  if (path === '/api/ai/command' && request.method === 'POST') {
    const body = await request.json().catch(() => null);
    const command = body?.command;
    if (typeof command !== 'string' || !command.trim()) {
      return json({ error: 'Príkaz musí byť neprázdny text.' }, 400);
    }

    const policy = evaluatePolicy(command);
    if (policy.status === 'BLOCKED') return json({ error: policy.reason }, 403);

    const operation = command.trim().toLowerCase();
    if (operation === 'stav api') {
      const response = 'Rozhranie Trinity AI prijalo túto požiadavku a odpovedalo.';
      return json(recordObservation(operation, response));
    }

    if (operation === 'stav produkcie') {
      const attempts = await observeProduction();
      const details = attempts.map(attempt => attempt.httpStatus
        ? `${attempt.method} ${attempt.url} HTTP ${attempt.httpStatus}`
        : `${attempt.method} ${attempt.url} — ${attempt.error}`).join(' · ');
      const responded = attempts.some(attempt => attempt.httpStatus >= 200 && attempt.httpStatus < 300);
      const observation = recordObservation(operation, details, attempts);
      return responded ? json(observation) : json({
        status: 'unverified',
        error: `Dostupnosť produkcie sa nepodarilo potvrdiť. ${observation.response}`,
        observation,
      }, 502);
    }

    return json({
      status: 'unsupported',
      error: 'Pre tento príkaz chýba overiteľná implementácia. Dostupné príkazy: stav api, stav produkcie.',
    }, 422);
  }

  if (path.startsWith('/api/ai/autonomous/') ||
      ['/api/ai/learn', '/api/ai/evolve', '/api/ai/decision', '/api/ai/permissions'].includes(path) ||
      path.startsWith('/api/ai/permissions/')) {
    return json({ status: 'unavailable', error: 'Pre túto operáciu chýba overená implementácia.' }, 501);
  }

  return json({ error: 'Endpoint not found' }, 404);
}
