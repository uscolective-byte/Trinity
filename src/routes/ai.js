/**
 * AI CORE ENDPOINTS
 * GET   /api/ai/permissions       — list AI permissions
 * PATCH /api/ai/permissions/:id   — toggle permission
 * GET   /api/ai/behavior          — behavior log
 * POST  /api/ai/command            — send command to Gemini (or simulated fallback)
 */

import { aiPermissions, aiBehaviorLog, logAudit } from '../data/store.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

export async function handleAI(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const section = parts[3]; // permissions | behavior | command
  const id = parts[4];

  // GET /api/ai/permissions
  if (section === 'permissions' && !id && request.method === 'GET') {
    return json({ permissions: aiPermissions });
  }

  // PATCH /api/ai/permissions/:id
  if (section === 'permissions' && id && request.method === 'PATCH') {
    const perm = aiPermissions.find((p) => p.id === id);
    if (!perm) return json({ error: 'Permission not found' }, 404);
    const body = await request.json();
    if (typeof body.enabled === 'boolean') {
      perm.enabled = body.enabled;
      logAudit('AI_PERMISSION_TOGGLE', 'super-admin', `${perm.name} → ${body.enabled ? 'ON' : 'OFF'}`);
    }
    return json({ permission: perm });
  }

  // GET /api/ai/behavior
  if (section === 'behavior' && request.method === 'GET') {
    return json({ logs: aiBehaviorLog.slice(0, 50) });
  }

  // POST /api/ai/command
  if (section === 'command' && request.method === 'POST') {
    const body = await request.json();
    const command = body.command || '';

    // Check if the AI has permission to act
    aiBehaviorLog.unshift({
      time: new Date().toISOString(),
      command,
      response: 'processing',
    });

    let response;
    let engine = 'simulated';

    // Try Gemini if key is available
    const apiKey = env?.gemini || env?.GEMINI || env?.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Si TRINITY AI Core — centrálna autonómna inteligencia pre Underground Street Collective. Si super-admin asistent. Odpovedaj stručne, profesionálne, v slovenčine. Príkaz od super-admina: ${command}` }] }],
            }),
          }
        );
        const geminiData = await geminiRes.json();
        if (geminiData.error) {
          // Gemini unavailable (overload, etc.) — fall back to simulated response
          response = simulateResponse(command) + '\n\n[Note: Gemini je momentálne nedostupný (' + geminiData.error.message + '). Spúšťam simulovaný režim.]';
          engine = 'gemini-fallback';
        } else {
          response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Bez odpovede.';
          engine = 'gemini';
        }
      } catch (e) {
        response = simulateResponse(command) + '\n\n[Gemini nedostupný: ' + e.message + ']';
        engine = 'gemini-fallback';
      }
    } else {
      // Simulated response
      response = simulateResponse(command);
    }

    aiBehaviorLog[0].response = response;
    logAudit('AI_COMMAND', 'super-admin', command.slice(0, 80));
    return json({ command, response, engine });
  }

  return json({ error: 'Endpoint not found' }, 404);
}

function simulateResponse(command) {
  const c = command.toLowerCase();
  if (c.includes('web') || c.includes('stránk')) return 'Web pripravený — šablóna vygenerovaná v AI Studiu. Môžeš upraviť obsah a štýl.';
  if (c.includes('stav') || c.includes('status')) return 'Systém TRINITY: 4 piliere ONLINE, 2 STANDBY. Žiadne kritické incidenty. CI: 2 zlyhania v repozitároch (Trinity, USC).';
  if (c.includes('voz') || c.includes('car')) return 'Flotila Rent-a-Car: 18 vozidiel, 12 aktívnych, 4 rezervované, 2 v servise.';
  if (c.includes('logist')) return 'Logistika: 42 zásielok, 15 v preprave, 4 sklady aktívne, 1280 položiek na sklade.';
  return `Príkaz prijatý: "${command}". TRINITY AI Core analyzuje a pripravuje akčný plán. (Simulovaný režim — pre reálne AI odpovede pripoj Gemini kľúč.)`;
}
