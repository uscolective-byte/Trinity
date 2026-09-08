/**
 * INTEGRATION ENDPOINTS
 * GET   /api/integrations       — list integrations
 * PATCH /api/integrations/:id   — toggle connect/disconnect
 */

import { integrations, logAudit } from '../data/store.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

export async function handleIntegrations(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const id = parts[3]; // /api/integrations/:id

  // GET /api/integrations
  if (!id && request.method === 'GET') {
    return json({ integrations });
  }

  // PATCH /api/integrations/:id
  if (id && request.method === 'PATCH') {
    const integ = integrations.find((i) => i.id === id);
    if (!integ) return json({ error: 'Integration not found' }, 404);
    const body = await request.json();
    if (body.status) {
      integ.status = body.status;
      logAudit('INTEGRATION_TOGGLE', 'super-admin', `${integ.name} → ${body.status}`);
    }
    return json({ integration: integ });
  }

  return json({ error: 'Endpoint not found' }, 404);
}
