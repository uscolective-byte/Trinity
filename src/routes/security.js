/**
 * SECURITY ENDPOINTS
 * GET   /api/security/audit      — audit log
 * GET   /api/security/firewall   — firewall rules
 * PATCH /api/security/firewall/:id — toggle rule
 * GET   /api/security/access     — access levels
 * GET   /api/security/logins     — login history
 */

import { auditLog, firewallRules, accessLevels, loginHistory, logAudit } from '../data/store.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

export async function handleSecurity(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const section = parts[3]; // audit | firewall | access | logins
  const id = parts[4];

  // GET /api/security/audit
  if (section === 'audit' && request.method === 'GET') {
    return json({ logs: auditLog.slice(0, 50) });
  }

  // GET /api/security/firewall
  if (section === 'firewall' && !id && request.method === 'GET') {
    return json({ rules: firewallRules });
  }

  // PATCH /api/security/firewall/:id
  if (section === 'firewall' && id && request.method === 'PATCH') {
    const rule = firewallRules.find((r) => r.id === id);
    if (!rule) return json({ error: 'Rule not found' }, 404);
    const body = await request.json();
    if (typeof body.enabled === 'boolean') {
      rule.enabled = body.enabled;
      logAudit('FIREWALL_TOGGLE', 'super-admin', `${rule.name} → ${body.enabled ? 'ON' : 'OFF'}`);
    }
    return json({ rule });
  }

  // GET /api/security/access
  if (section === 'access' && request.method === 'GET') {
    return json({ levels: accessLevels });
  }

  // GET /api/security/logins
  if (section === 'logins' && request.method === 'GET') {
    return json({ history: loginHistory.slice(0, 50) });
  }

  return json({ error: 'Endpoint not found' }, 404);
}
