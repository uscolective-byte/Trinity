/**
 * AUTH ENDPOINTS
 * POST /api/auth/login   — validate password + 2FA, issue session token
 * GET  /api/auth/session — validate token
 * POST /api/auth/logout  — destroy session
 */

import { ADMIN, sessions, loginHistory, logAudit } from '../data/store.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function genToken() {
  return 'tok_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '');

  // POST /api/auth/login
  if (path === '/login' && request.method === 'POST') {
    const body = await request.json();
    const { password, twofa } = body;

    if (password !== ADMIN.password) {
      loginHistory.unshift({
        time: new Date().toISOString(),
        ip: request.headers.get('cf-connecting-ip') || 'unknown',
        success: false,
        reason: 'wrong password',
      });
      logAudit('LOGIN_FAILED', 'unknown', 'Nesprávne heslo');
      return json({ error: 'Nesprávne heslo' }, 401);
    }

    if (twofa !== ADMIN.twofaCode) {
      loginHistory.unshift({
        time: new Date().toISOString(),
        ip: request.headers.get('cf-connecting-ip') || 'unknown',
        success: false,
        reason: 'wrong 2FA',
      });
      logAudit('LOGIN_FAILED', ADMIN.username, 'Nesprávny 2FA kód');
      return json({ error: 'Nesprávny 2FA kód' }, 401);
    }

    const token = genToken();
    sessions.set(token, { user: ADMIN.username, role: ADMIN.role, createdAt: Date.now() });
    loginHistory.unshift({
      time: new Date().toISOString(),
      ip: request.headers.get('cf-connecting-ip') || 'unknown',
      success: true,
      reason: 'OK',
    });
    logAudit('LOGIN_SUCCESS', ADMIN.username, 'Super-admin prihlásený');
    return json({ token, user: ADMIN.username, role: ADMIN.role });
  }

  // GET /api/auth/session
  if (path === '/session' && request.method === 'GET') {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const session = sessions.get(token);
    if (!session) return json({ valid: false }, 401);
    return json({ valid: true, user: session.user, role: session.role });
  }

  // POST /api/auth/logout
  if (path === '/logout' && request.method === 'POST') {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    sessions.delete(token);
    logAudit('LOGOUT', ADMIN.username);
    return json({ ok: true });
  }

  return json({ error: 'Endpoint not found' }, 404);
}

export function requireAuth(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const session = sessions.get(token);
  return session || null;
}
