/**
 * AI CORE ENDPOINTS
 * GET   /api/ai/permissions       — list AI permissions
 * PATCH /api/ai/permissions/:id   — toggle permission
 * GET   /api/ai/behavior          — behavior log
 * POST  /api/ai/command            — send command to Gemini (or simulated fallback)
 */

import { handleDialogue } from './dialogue.mjs';
import { requireAuth } from './auth.js';

import { aiPermissions, aiBehaviorLog, aiKnowledgeBase, aiEvolutionScore, aiCapabilities, aiAutonomousLog, aiMetrics, aiActive, pillars, logAudit } from '../data/store.js';

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

  // Authenticated conversation with contextual replies and safe approvals.
  // /api/ai/command stays backward-compatible; /api/ai/dialogue is the new alias.
  if ((section === 'command' || section === 'dialogue') && request.method === 'POST') {
    return handleDialogue(request, env, requireAuth(request));
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

