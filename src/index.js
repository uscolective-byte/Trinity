/**
 * TENEBRIS CORE — TRINITY Admin Dashboard
 * Cloudflare Workers entry point & API router
 */

import { handleAuth, requireAuth } from './routes/auth.js';
import { handlePillars } from './routes/pillars.js';
import { handleSecurity } from './routes/security.js';
import { handleIntegrations } from './routes/integrations.js';
import { handleAI } from './routes/ai.js';
import { handleShop } from './routes/api-shop.js';
import { HTML } from './frontend/app.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- Frontend ---
    if (path === '/' || path === '/index.html') {
      return new Response(HTML, { headers: { 'content-type': 'text/html;charset=UTF-8' } });
    }

    // --- Existing status endpoint ---
    if (path === '/api/status') {
      return json({ status: 'ONLINE', system: 'TENEBRIS CORE', frequency: '369', message: 'Ulica nikdy nespí.' });
    }

    // --- API routes ---
    if (path.startsWith('/api/auth')) return handleAuth(request, env);

    // Protected routes — require valid session
    if (path.startsWith('/api/pillars') || path.startsWith('/api/security') || path.startsWith('/api/integrations') || path.startsWith('/api/ai')) {
      const session = requireAuth(request);
      if (!session) return json({ error: 'Neautorizovaný prístup' }, 401);
    }

    if (path.startsWith('/api/pillars')) return handlePillars(request, env);
    if (path.startsWith('/api/security')) return handleSecurity(request, env);
    if (path.startsWith('/api/integrations')) return handleIntegrations(request, env);
    if (path.startsWith('/api/ai')) return handleAI(request, env);

    // --- Shop (existing) ---
    if (path.startsWith('/api/shop')) return handleShop(request, env);

    return json({ error: 'Endpoint not found' }, 404);
  },
};
