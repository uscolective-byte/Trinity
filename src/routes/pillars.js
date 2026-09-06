/**
 * PILLAR ENDPOINTS
 * GET   /api/pillars        — list all pillars
 * GET   /api/pillars/:id     — pillar detail with related data
 * PATCH /api/pillars/:id     — update pillar status
 */

import { pillars, vehicles, workers, shipments, solidarityProjects, logAudit } from '../data/store.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

export async function handlePillars(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const id = parts[3]; // /api/pillars/:id

  // GET /api/pillars
  if (!id && request.method === 'GET') {
    return json({ pillars });
  }

  // GET /api/pillars/:id
  if (id && request.method === 'GET') {
    const pillar = pillars.find((p) => p.id === id);
    if (!pillar) return json({ error: 'Pillar not found' }, 404);

    let detail = { ...pillar };
    if (id === 'rentacar') detail.vehicles = vehicles;
    if (id === 'personnel') detail.workers = workers;
    if (id === 'logistics') detail.shipments = shipments;
    if (id === 'solidarity') detail.projects = solidarityProjects;
    if (id === 'trinity') detail.subPillars = pillars.filter((p) => p.id !== 'trinity').map((p) => ({ id: p.id, name: p.name, status: p.status }));
    return json({ pillar: detail });
  }

  // PATCH /api/pillars/:id — toggle status
  if (id && request.method === 'PATCH') {
    const pillar = pillars.find((p) => p.id === id);
    if (!pillar) return json({ error: 'Pillar not found' }, 404);
    const body = await request.json();
    if (body.status) {
      pillar.status = body.status;
      logAudit(`PILLAR_UPDATE`, 'super-admin', `${pillar.name} → ${body.status}`);
    }
    return json({ pillar });
  }

  return json({ error: 'Endpoint not found' }, 404);
}
