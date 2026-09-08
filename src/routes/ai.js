/**
 * AI CORE ENDPOINTS
 * GET   /api/ai/permissions       — list AI permissions
 * PATCH /api/ai/permissions/:id   — toggle permission
 * GET   /api/ai/behavior          — behavior log
 * POST  /api/ai/command            — send command to Gemini (or simulated fallback)
 */

import { aiPermissions, aiBehaviorLog, aiKnowledgeBase, aiEvolutionScore, aiCapabilities, aiAutonomousLog, aiMetrics, aiActive, pillars, logAudit } from '../data/store.js';
import { ghFetch } from './github.js';

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

  // ===== AUTONOMOUS ENGINE ENDPOINTS =====

  // GET /api/ai/autonomous/status — engine status + metrics
  if (section === 'autonomous' && id === 'status' && request.method === 'GET') {
    return json({
      active: aiActive.value,
      evolutionScore: aiEvolutionScore.value,
      metrics: aiMetrics,
      capabilities: aiCapabilities,
      knowledgeBaseSize: aiKnowledgeBase.length,
      recentCycles: aiAutonomousLog.slice(0, 10),
    });
  }

  // POST /api/ai/autonomous/cycle — run full autonomous cycle
  if (section === 'autonomous' && id === 'cycle' && request.method === 'POST') {
    const result = runAutonomousCycle();
    return json(result);
  }

  // POST /api/ai/autonomous/toggle — start/stop engine
  if (section === 'autonomous' && id === 'toggle' && request.method === 'POST') {
    aiActive.value = !aiActive.value;
    logAudit('AI_ENGINE_TOGGLE', 'super-admin', `Autonomous engine ${aiActive.value ? 'STARTED' : 'STOPPED'}`);
    return json({ active: aiActive.value });
  }

  // POST /api/ai/learn — ingest data + self-learning
  if (section === 'learn' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const source = body.source || 'manual';
    const payload = body.payload || {};
    const record = {
      id: `KB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source,
      payload,
      timestamp: new Date().toISOString(),
    };
    aiKnowledgeBase.push(record);
    const patterns = selfLearn();
    return json({ ingested: record, patterns, knowledgeBaseSize: aiKnowledgeBase.length });
  }

  // POST /api/ai/evolve — run self-evolution
  if (section === 'evolve' && request.method === 'POST') {
    const result = selfEvolve();
    return json(result);
  }

  // GET /api/ai/decision — get autonomous decision
  if (section === 'decision' && request.method === 'GET') {
    const decision = autonomousDecision();
    return json(decision);
  }

  // ===== AI REPO INTEGRATION (GitHub) =====

  // POST /api/ai/repo or /api/ai/repo/list — list directory in a repo
  if (section === 'repo' && (!id || id === 'list') && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { owner, repo, path: repoPath = '', branch = 'main' } = body;
    if (!owner || !repo) return json({ error: 'Chýba owner alebo repo' }, 400);
    const result = await ghFetch(`/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`, env);
    if (result.error) return json({ error: result.error }, 400);
    const items = Array.isArray(result.data)
      ? result.data.map(f => ({ name: f.name, path: f.path, type: f.type, size: f.size }))
      : [{ name: result.data.name, path: result.data.path, type: 'file', size: result.data.size }];
    return json({ items, branch, path: repoPath });
  }

  // POST /api/ai/repo/read — read a file from a repo
  if (section === 'repo' && id === 'read' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { owner, repo, path: repoPath, branch = 'main' } = body;
    if (!owner || !repo || !repoPath) return json({ error: 'Chýba owner, repo alebo path' }, 400);
    const result = await ghFetch(`/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`, env);
    if (result.error) return json({ error: result.error }, 400);
    const content = result.data.encoding === 'base64'
      ? atob(result.data.content.replace(/\n/g, ''))
      : result.data.content;
    // Ingest into knowledge base
    aiKnowledgeBase.push({
      id: `KB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source: 'github',
      payload: { owner, repo, path: repoPath, size: result.data.size },
      timestamp: new Date().toISOString(),
    });
    logAudit('AI_REPO_READ', 'TRINITY-AI', `${owner}/${repo}:${repoPath}`);
    return json({ path: repoPath, content, size: result.data.size, sha: result.data.sha, branch });
  }

  // POST /api/ai/repo/write — write/update a file in a repo
  if (section === 'repo' && id === 'write' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { owner, repo, path: repoPath, content, message, branch = 'main' } = body;
    if (!owner || !repo || !repoPath || content === undefined) return json({ error: 'Chýba owner, repo, path alebo content' }, 400);

    // Get existing SHA for updates
    let sha;
    const existing = await ghFetch(`/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`, env);
    if (!existing.error && existing.data?.sha) sha = existing.data.sha;

    const result = await ghFetch(`/repos/${owner}/${repo}/contents/${repoPath}`, env, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: message || `TRINITY AI Core: update ${repoPath}`,
        content: btoa(unescape(encodeURIComponent(content))),
        branch,
        ...(sha ? { sha } : {}),
      }),
    });
    if (result.error) return json({ error: result.error }, 400);
    logAudit('AI_REPO_WRITE', 'TRINITY-AI', `${owner}/${repo}:${repoPath} @${branch}`);
    return json({ success: true, commit: result.data.commit?.sha, path: repoPath, branch });
  }

  // POST /api/ai/repo/analyze — read file + Gemini analysis
  if (section === 'repo' && id === 'analyze' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const { owner, repo, path: repoPath, branch = 'main', question } = body;
    if (!owner || !repo || !repoPath) return json({ error: 'Chýba owner, repo alebo path' }, 400);

    // 1. Read the file
    const fileResult = await ghFetch(`/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`, env);
    if (fileResult.error) return json({ error: fileResult.error }, 400);
    const fileContent = fileResult.data.encoding === 'base64'
      ? atob(fileResult.data.content.replace(/\n/g, ''))
      : fileResult.data.content;

    // 2. Ask Gemini to analyze
    const apiKey = env?.gemini || env?.GEMINI || env?.GEMINI_API_KEY;
    let analysis;
    if (apiKey) {
      try {
        const prompt = `Si TRINITY AI Core — analyzuješ kód z GitHub repozitára ${owner}/${repo}. Súbor: ${repoPath}\n\nOtázka: ${question || 'Analyzuj tento kód a navrhni vylepšenia.'}\n\nKód:\n\`\`\`\n${fileContent.slice(0, 8000)}\n\`\`\`\n\nOdpovedaj v slovenčine, stručne a profesionálne.`;
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        const geminiData = await geminiRes.json();
        analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Bez odpovede z AI.';
      } catch (e) {
        analysis = `AI analýza nedostupná: ${e.message}. Súbor má ${fileContent.length} znakov.`;
      }
    } else {
      analysis = `Súbor ${repoPath} má ${fileContent.length} znakov. Pre AI analýzu pripoj Gemini kľúč.`;
    }

    // Ingest into knowledge base
    aiKnowledgeBase.push({
      id: `KB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source: 'github-analyze',
      payload: { owner, repo, path: repoPath, question },
      timestamp: new Date().toISOString(),
    });
    logAudit('AI_REPO_ANALYZE', 'TRINITY-AI', `${owner}/${repo}:${repoPath}`);
    return json({ path: repoPath, content: fileContent, analysis, size: fileResult.data.size, branch });
  }

  return json({ error: 'Endpoint not found' }, 404);
}

// ===== AUTONOMOUS ENGINE FUNCTIONS =====

function selfLearn() {
  const patterns = {};
  for (const record of aiKnowledgeBase) {
    const src = record.source;
    patterns[src] = (patterns[src] || 0) + 1;
  }
  aiMetrics.patterns = Object.keys(patterns).length;
  return patterns;
}

function selfEvolve() {
  const patterns = selfLearn();
  aiEvolutionScore.value += Object.values(patterns).reduce((a, b) => a + b, 0);
  aiMetrics.evolutions++;

  const newCapabilities = [];
  if (aiEvolutionScore.value > 10 && !aiCapabilities.find(c => c.id === 'adaptive-routing')?.unlocked) {
    const cap = aiCapabilities.find(c => c.id === 'adaptive-routing');
    if (cap) { cap.unlocked = true; cap.unlockedAt = new Date().toISOString(); newCapabilities.push(cap.name); }
  }
  if (aiEvolutionScore.value > 30 && !aiCapabilities.find(c => c.id === 'predictive-analysis')?.unlocked) {
    const cap = aiCapabilities.find(c => c.id === 'predictive-analysis');
    if (cap) { cap.unlocked = true; cap.unlockedAt = new Date().toISOString(); newCapabilities.push(cap.name); }
  }
  if (aiEvolutionScore.value > 60 && !aiCapabilities.find(c => c.id === 'auto-codegen')?.unlocked) {
    const cap = aiCapabilities.find(c => c.id === 'auto-codegen');
    if (cap) { cap.unlocked = true; cap.unlockedAt = new Date().toISOString(); newCapabilities.push(cap.name); }
  }
  if (aiEvolutionScore.value > 100 && !aiCapabilities.find(c => c.id === 'self-healing')?.unlocked) {
    const cap = aiCapabilities.find(c => c.id === 'self-healing');
    if (cap) { cap.unlocked = true; cap.unlockedAt = new Date().toISOString(); newCapabilities.push(cap.name); }
  }

  return { evolutionScore: aiEvolutionScore.value, newCapabilities, totalCapabilities: aiCapabilities.filter(c => c.unlocked).length };
}

function autonomousDecision() {
  const ecosystem = {};
  for (const p of pillars) {
    ecosystem[p.name] = p.status;
  }
  aiMetrics.decisions++;

  const anomalies = pillars.filter(p => p.status !== 'ONLINE');
  if (anomalies.length === 0) {
    return { decision: 'ALL_GOOD', ecosystem, action: 'Systém stabilný, žiadna akcia potrebná' };
  }
  const anomaly = anomalies[0];
  if (anomaly.id === 'logistics') {
    return { decision: 'CHECK_LOGISTICS', ecosystem, action: `Detekovaná anomália: ${anomaly.name}. Spúšťam logistickú diagnostiku.` };
  }
  if (anomaly.id === 'rentacar') {
    return { decision: 'CHECK_VEHICLES', ecosystem, action: `Detekovaná anomália: ${anomaly.name}. Spúšťam diagnostiku vozidiel.` };
  }
  return { decision: 'CHECK_PILLAR', ecosystem, action: `Detekovaná anomália: ${anomaly.name} (${anomaly.status}).` };
}

function autonomousTasks(decision) {
  aiMetrics.tasks++;
  const tasks = [];
  if (decision.decision === 'CHECK_LOGISTICS') {
    tasks.push({ task: 'Logistická diagnostika', status: 'running', detail: 'Kontrola zásielok a skladov' });
  } else if (decision.decision === 'CHECK_VEHICLES') {
    tasks.push({ task: 'Diagnostika vozidiel', status: 'running', detail: 'Kontrola GPS a stavu flotily' });
  } else if (decision.decision === 'CHECK_PILLAR') {
    tasks.push({ task: `Diagnostika: ${decision.action}`, status: 'running', detail: 'Kontrola piliera' });
  } else {
    tasks.push({ task: 'Systém stabilný', status: 'idle', detail: 'Žiadne akútne úlohy' });
  }
  return tasks;
}

function runAutonomousCycle() {
  aiMetrics.cycles++;
  const cycleStart = new Date().toISOString();

  // 1. Ingest ecosystem data
  const ecosystemData = pillars.map(p => ({ id: p.id, name: p.name, status: p.status, stats: p.stats }));
  aiKnowledgeBase.push({
    id: `KB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    source: 'ecosystem',
    payload: { pillars: ecosystemData },
    timestamp: cycleStart,
  });

  // 2. Self-learn (detect patterns)
  const patterns = selfLearn();

  // 3. Self-evolve
  const evolution = selfEvolve();

  // 4. Autonomous decision
  const decision = autonomousDecision();

  // 5. Autonomous tasks
  const tasks = autonomousTasks(decision);

  // 6. Log cycle
  const cycleLog = {
    cycle: aiMetrics.cycles,
    time: cycleStart,
    patterns: Object.keys(patterns).length,
    evolutionScore: aiEvolutionScore.value,
    newCapabilities: evolution.newCapabilities,
    decision: decision.decision,
    action: decision.action,
    tasks,
  };
  aiAutonomousLog.unshift(cycleLog);
  logAudit('AI_AUTONOMOUS_CYCLE', 'TRINITY-AI', `Cyklus #${aiMetrics.cycles}: ${decision.decision}`);

  return {
    cycle: aiMetrics.cycles,
    status: 'completed',
    decision: decision.decision,
    action: decision.action,
    patterns: Object.keys(patterns).length,
    evolutionScore: aiEvolutionScore.value,
    newCapabilities: evolution.newCapabilities,
    totalCapabilities: aiCapabilities.filter(c => c.unlocked).length,
    tasks,
    metrics: aiMetrics,
  };
}

function simulateResponse(command) {
  const c = command.toLowerCase();
  if (c.includes('web') || c.includes('stránk')) return 'Web pripravený — šablóna vygenerovaná v AI Studiu. Môžeš upraviť obsah a štýl.';
  if (c.includes('stav') || c.includes('status')) return 'Systém TRINITY: 4 piliere ONLINE, 2 STANDBY. Žiadne kritické incidenty. CI: 2 zlyhania v repozitároch (Trinity, USC).';
  if (c.includes('voz') || c.includes('car')) return 'Flotila Rent-a-Car: 18 vozidiel, 12 aktívnych, 4 rezervované, 2 v servise.';
  if (c.includes('logist')) return 'Logistika: 42 zásielok, 15 v preprave, 4 sklady aktívne, 1280 položiek na sklade.';
  return `Príkaz prijatý: "${command}". TRINITY AI Core analyzuje a pripravuje akčný plán. (Simulovaný režim — pre reálne AI odpovede pripoj Gemini kľúč.)`;
}
