export const HTML = `<!DOCTYPE html>
<html lang="sk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TRINITY // USC Admin Dashboard</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root { --neon: #ccff00; --bg: #050505; --panel: #0a0a0a; --border: #1a1a1a; }
  * { scrollbar-width: thin; scrollbar-color: #333 #0a0a0a; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  body { background: var(--bg); color: #d4d4d4; font-family: 'Courier New', monospace; }
  .neon { color: var(--neon); text-shadow: 0 0 8px rgba(204,255,0,0.3); }
  .neon-border { border: 1px solid var(--neon); box-shadow: 0 0 12px rgba(204,255,0,0.1); }
  .panel { background: var(--panel); border: 1px solid var(--border); }
  .panel-hover:hover { border-color: #333; }
  .badge { font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 2px; letter-spacing: 1px; }
  .badge-online { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
  .badge-standby { background: rgba(234,179,8,0.15); color: #eab308; border: 1px solid rgba(234,179,8,0.3); }
  .badge-offline { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
  .badge-connected { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
  .badge-disconnected { background: rgba(107,114,128,0.15); color: #9ca3af; border: 1px solid rgba(107,114,128,0.3); }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; border-left: 3px solid transparent; transition: all 0.15s; font-size: 13px; letter-spacing: 1px; }
  .nav-item:hover { background: #111; border-left-color: #333; }
  .nav-item.active { background: #111; border-left-color: var(--neon); color: var(--neon); }
  .btn-neon { background: var(--neon); color: #000; font-weight: bold; padding: 8px 16px; border: none; cursor: pointer; transition: all 0.2s; letter-spacing: 1px; font-size: 12px; }
  .btn-neon:hover { background: #fff; }
  .btn-ghost { background: transparent; border: 1px solid #333; color: #888; padding: 6px 14px; cursor: pointer; font-size: 12px; letter-spacing: 1px; }
  .btn-ghost:hover { border-color: var(--neon); color: var(--neon); }
  .input { background: #0d0d0d; border: 1px solid #222; color: #d4d4d4; padding: 10px 14px; font-family: monospace; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
  .input:focus { border-color: var(--neon); }
  .toggle { width: 40px; height: 22px; background: #222; border-radius: 11px; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
  .toggle.on { background: var(--neon); }
  .toggle::after { content: ''; position: absolute; width: 18px; height: 18px; background: #555; border-radius: 50%; top: 2px; left: 2px; transition: all 0.2s; }
  .toggle.on::after { left: 20px; background: #000; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 8px 12px; border-bottom: 1px solid #222; color: #666; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
  td { padding: 8px 12px; border-bottom: 1px solid #111; }
  tr:hover td { background: #0d0d0d; }
  .fade-in { animation: fadeIn 0.25s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .terminal { background: #000; border: 1px solid #1a1a1a; padding: 12px; font-size: 12px; max-height: 320px; overflow-y: auto; line-height: 1.6; }
  .blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style>
</head>
<body>
<div id="app"></div>
<script>
const API = '';
let token = localStorage.getItem('trinity_token') || null;
let currentUser = localStorage.getItem('trinity_user') || null;

// --- API helper ---
async function api(path, opts = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers['authorization'] = 'Bearer ' + token;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status === 401) { logout(); }
  return { ok: res.ok, status: res.status, data };
}

// --- Auth ---
function logout() {
  token = null; currentUser = null;
  localStorage.removeItem('trinity_token');
  localStorage.removeItem('trinity_user');
  location.hash = '#/login';
  render();
}

// --- Router ---
window.addEventListener('hashchange', render);

function render() {
  const hash = location.hash || '#/login';
  const app = document.getElementById('app');
  if (!token && hash !== '#/login') { location.hash = '#/login'; return; }
  if (token && hash === '#/login') { location.hash = '#/dashboard'; return; }

  if (hash === '#/login') { renderLogin(app); return; }

  const route = hash.replace('#/', '');
  const [view, param] = route.split('/');
  renderShell(app, view, param);
}

// --- Login View ---
function renderLogin(app) {
  app.innerHTML = \`
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-5xl font-black neon uppercase tracking-tighter">TRINITY</div>
        <div class="text-xs text-gray-600 tracking-[4px] mt-2">UNDERGROUND STREET COLLECTIVE // ADMIN ACCESS</div>
      </div>
      <div class="panel neon-border p-8 fade-in">
        <div class="text-xs text-gray-500 mb-1 tracking-widest">PRIHLÁSENIE SUPER-ADMINA</div>
        <div class="space-y-4 mt-4">
          <div>
            <label class="text-xs text-gray-600 block mb-1">HESLO</label>
            <input id="login-pass" type="password" class="input" placeholder="••••••••" autofocus>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">2FA KÓD</label>
            <input id="login-2fa" type="text" class="input" placeholder="6-miestny kód" maxlength="6">
          </div>
          <div id="login-error" class="text-xs text-red-500 hidden"></div>
          <button id="login-btn" class="btn-neon w-full py-3 uppercase">Vstúpiť do TRINITY</button>
        </div>
        <div class="mt-6 pt-6 border-t border-gray-800 text-xs text-gray-600">
          <div>Demo prístup:</div>
          <div class="text-gray-500 mt-1">Heslo: <span class="neon">tenebris369</span> · 2FA: <span class="neon">369369</span></div>
        </div>
      </div>
      <div class="text-center mt-6 text-xs text-gray-700 tracking-widest">ŽIADNE REČI. ČISTÝ HUSTLE.</div>
    </div>
  </div>\`;

  const btn = document.getElementById('login-btn');
  const doLogin = async () => {
    btn.textContent = 'Overujem...'; btn.disabled = true;
    const password = document.getElementById('login-pass').value;
    const twofa = document.getElementById('login-2fa').value;
    const err = document.getElementById('login-error');
    const { ok, data } = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ password, twofa }) });
    if (ok) {
      token = data.token; currentUser = data.user;
      localStorage.setItem('trinity_token', token);
      localStorage.setItem('trinity_user', currentUser);
      location.hash = '#/dashboard';
      render();
    } else {
      err.textContent = data.error || 'Prihlasovanie zlyhalo'; err.classList.remove('hidden');
      btn.textContent = 'Vstúpiť do TRINITY'; btn.disabled = false;
    }
  };
  btn.onclick = doLogin;
  document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-2fa').focus(); });
  document.getElementById('login-2fa').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
}

// --- Shell (sidebar + content) ---
function renderShell(app, view, param) {
  const nav = [
    { id: 'dashboard', icon: '◈', label: 'Hlavný panel' },
    { id: 'pillars', icon: '⊞', label: 'Piliere' },
    { id: 'security', icon: '⛨', label: 'Bezpečnosť' },
    { id: 'integrations', icon: '⧉', label: 'Integrácie' },
    { id: 'ai', icon: '✦', label: 'AI Core' },
    { id: 'github', icon: '⧄', label: 'GitHub' },
    { id: 'shop', icon: '⌗', label: 'USW Shop' },
  ];

  app.innerHTML = \`
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-60 panel border-r border-gray-800 flex flex-col flex-shrink-0" style="min-height:100vh">
      <div class="p-4 border-b border-gray-800">
        <div class="text-xl font-black neon uppercase">TRINITY</div>
        <div class="text-[10px] text-gray-600 tracking-widest">USC CORE [369]</div>
      </div>
      <nav class="flex-1 py-2">
        \${nav.map(n => \`<div class="nav-item \${view===n.id?'active':''}" onclick="location.hash='#/\${n.id}'"><span class="text-lg">\${n.icon}</span> \${n.label}</div>\`).join('')}
      </nav>
      <div class="p-4 border-t border-gray-800 text-xs">
        <div class="text-gray-500">Prihlásený:</div>
        <div class="neon font-bold mt-1">\${currentUser || 'admin'}</div>
        <button onclick="logout()" class="btn-ghost w-full mt-3 uppercase text-[10px]">Odhlásiť</button>
      </div>
    </aside>
    <!-- Content -->
    <main class="flex-1 overflow-y-auto" style="min-height:100vh">
      <div id="content" class="p-6 md:p-8 fade-in"></div>
    </main>
  </div>\`;

  const content = document.getElementById('content');
  const views = { dashboard: renderDashboard, pillars: renderPillars, security: renderSecurity, integrations: renderIntegrations, ai: renderAI, github: renderGitHub, shop: renderShop };
  (views[view] || renderDashboard)(content, param);
}

// --- Dashboard View ---
async function renderDashboard(c) {
  c.innerHTML = \`<div class="flex items-center justify-between mb-8">
    <div><h1 class="text-3xl font-black neon uppercase">Hlavný panel</h1><div class="text-xs text-gray-600 tracking-widest mt-1">PREHĽAD EKOSYSTÉMU TRINITY</div></div>
    <div class="text-xs text-gray-600">FREQ: <span class="neon">369</span> · \${new Date().toLocaleString('sk-SK')}</div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6" id="pillar-cards"></div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="panel p-5"><h2 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">⚠ Upozornenia</h2><div id="alerts" class="space-y-2"></div></div>
    <div class="panel p-5"><h2 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">📟 Systémové logy</h2><div id="syslogs" class="terminal"></div></div>
  </div>\`;

  const [{ data: pData }, { data: aData }, { data: lData }] = await Promise.all([
    api('/api/pillars'), api('/api/status'), api('/api/security/audit')
  ]);
  // Use local alert + log data (embedded for speed)
  const pillars = pData?.pillars || [];
  const cards = document.getElementById('pillar-cards');
  cards.innerHTML = pillars.map(p => \`
    <div class="panel panel-hover p-4 cursor-pointer" onclick="location.hash='#/pillars'">
      <div class="flex items-center justify-between mb-2"><span class="text-lg">\${p.icon}</span><span class="badge badge-\${p.status.toLowerCase()}">\${p.status}</span></div>
      <div class="text-xs font-bold text-gray-300 mt-2">\${p.name}</div>
      <div class="text-[10px] text-gray-600 mt-1">\${Object.entries(p.stats).map(([k,v])=>k+': '+v).join(' · ')}</div>
    </div>\`).join('');

  const alerts = [
    { sev:'warning', msg:'CI zlyhanie: Trinity repo (Node.js 22.x)', time:'03.09' },
    { sev:'warning', msg:'CI zlyhanie: USC repo (chýba lock file)', time:'03.09' },
    { sev:'info', msg:'LOG-044 doručené: BA → Viedeň', time:'05.09' },
    { sev:'info', msg:'Synchronizácia pilierov dokončená', time:'06.09' },
  ];
  document.getElementById('alerts').innerHTML = alerts.map(a => \`
    <div class="flex items-start gap-3 text-xs p-2 hover:bg-gray-900">
      <span class="\${a.sev==='warning'?'text-yellow-500':'text-gray-500'}">\${a.sev==='warning'?'▲':'●'}</span>
      <span class="flex-1 text-gray-400">\${a.msg}</span><span class="text-gray-700">\${a.time}</span>
    </div>\`).join('');

  const logs = [
    {l:'info',m:'TRINITY Core inicializovaný'},
    {l:'info',m:'Pripojené: Cloudflare, GitHub, Gemini'},
    {l:'warn',m:'Firebase: nepripojené'},
    {l:'info',m:'Synchronizácia: 4 ONLINE, 2 STANDBY'},
  ];
  document.getElementById('syslogs').innerHTML = logs.map(l => \`
    <div><span class="\${l.l==='warn'?'text-yellow-500':'text-gray-600'}">[\${l.l.toUpperCase()}]</span> <span class="text-gray-400">\${l.m}</span></div>\`).join('') + '<div><span class="neon">></span> <span class="blink">_</span></div>';
}

// --- Pillars View ---
async function renderPillars(c, param) {
  if (param) return renderPillarDetail(c, param);
  const { data } = await api('/api/pillars');
  const pillars = data?.pillars || [];
  c.innerHTML = \`
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">Piliere</h1><div class="text-xs text-gray-600 tracking-widest mt-1">ŠESŤ FUNKČNÝCH OBLASTÍ TRINITY</div></div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    \${pillars.map(p => \`
    <div class="panel panel-hover p-5 cursor-pointer fade-in" onclick="location.hash='#/pillars/\${p.id}'">
      <div class="flex items-start justify-between mb-3">
        <div class="text-3xl">\${p.icon}</div>
        <span class="badge badge-\${p.status.toLowerCase()}">\${p.status}</span>
      </div>
      <h3 class="font-bold text-gray-200 text-sm mt-2">\${p.name}</h3>
      <p class="text-xs text-gray-600 mt-2 leading-relaxed">\${p.description}</p>
      <div class="mt-4 pt-3 border-t border-gray-800 grid grid-cols-2 gap-2">
        \${Object.entries(p.stats).map(([k,v]) => \`<div class="text-[10px]"><span class="text-gray-600">\${k}</span><br><span class="neon font-bold">\${v}</span></div>\`).join('')}
      </div>
    </div>\`).join('')}
  </div>\`;
}

async function renderPillarDetail(c, id) {
  const { data } = await api('/api/pillars/' + id);
  const p = data?.pillar;
  if (!p) { c.innerHTML = '<div class="text-gray-600">Pilier nenájdený</div>'; return; }
  let extra = '';
  if (p.vehicles) extra = renderTable(p.vehicles, ['id','model','plate','status','driver']);
  if (p.workers) extra = renderTable(p.workers, ['id','name','role','status','contract']);
  if (p.shipments) extra = renderTable(p.shipments, ['id','from','to','status','vehicle','eta']);
  if (p.projects) extra = renderTable(p.projects, ['id','name','status','beneficiaries','coordinator']);
  if (p.subPillars) extra = p.subPillars.map(s => \`<div class="flex justify-between text-xs p-2 border-b border-gray-800"><span>\${s.name}</span><span class="badge badge-\${s.status.toLowerCase()}">\${s.status}</span></div>\`).join('');

  c.innerHTML = \`
  <div class="mb-6 flex items-center gap-4">
    <button onclick="location.hash='#/pillars'" class="btn-ghost">← Späť</button>
    <div><h1 class="text-2xl font-black neon uppercase">\${p.icon} \${p.name}</h1><div class="text-xs text-gray-600 mt-1">\${p.description}</div></div>
  </div>
  <div class="flex items-center gap-3 mb-6">
    <span class="badge badge-\${p.status.toLowerCase()}">\${p.status}</span>
    <button id="toggle-status" class="btn-neon text-xs">\${p.status==='ONLINE'?'Deaktivovať':'Aktivovať'}</button>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
    \${Object.entries(p.stats).map(([k,v]) => \`<div class="panel p-4"><div class="text-[10px] text-gray-600 uppercase tracking-widest">\${k}</div><div class="text-2xl font-black neon mt-1">\${v}</div></div>\`).join('')}
  </div>
  <div class="panel p-5 mb-6"><h3 class="text-sm font-bold neon uppercase mb-3 border-b border-gray-800 pb-2">Funkcie</h3><ul class="space-y-2">\${p.functions.map(f => \`<li class="text-xs text-gray-400 flex items-center gap-2"><span class="neon">▸</span> \${f}</li>\`).join('')}</ul></div>
  \${extra ? \`<div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-3 border-b border-gray-800 pb-2">Dáta</h3>\${extra}</div>\` : ''}
  \`;

  document.getElementById('toggle-status').onclick = async (e) => {
    const newStatus = p.status === 'ONLINE' ? 'STANDBY' : 'ONLINE';
    await api('/api/pillars/' + id, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
    renderPillarDetail(c, id);
  };
}

function renderTable(items, cols) {
  if (!items || !items.length) return '<div class="text-xs text-gray-600">Žiadne dáta</div>';
  return \`<table><thead><tr>\${cols.map(c => \`<th>\${c}</th>\`).join('')}</tr></thead><tbody>
    \${items.map(item => \`<tr>\${cols.map(col => \`<td>\${typeof item[col]==='object'?JSON.stringify(item[col]):item[col]??'—'}</td>\`).join('')}</tr>\`).join('')}
  </tbody></table>\`;
}

// --- Security View ---
async function renderSecurity(c) {
  const [{ data: fw }, { data: audit }, { data: access }, { data: logins }] = await Promise.all([
    api('/api/security/firewall'), api('/api/security/audit'), api('/api/security/access'), api('/api/security/logins')
  ]);
  c.innerHTML = \`
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">Bezpečnosť</h1><div class="text-xs text-gray-600 tracking-widest mt-1">FIREWALL · PRÍSTUP · AUDIT</div></div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Firewall pravidlá</h3>
      <div class="space-y-3" id="fw-rules">\${(fw?.rules||[]).map(r => \`
      <div class="flex items-center justify-between p-2 hover:bg-gray-900">
        <div><div class="text-xs font-bold text-gray-300">\${r.name}</div><div class="text-[10px] text-gray-600">\${r.action} · \${r.source} · :\${r.port}</div></div>
        <div class="toggle \${r.enabled?'on':''}" onclick="toggleFW('\${r.id}')"></div>
      </div>\`).join('')}</div>
    </div>
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Prístupové úrovne</h3>
      <table><thead><tr><th>Úroveň</th><th>Názov</th><th>Používatelia</th><th>Povolenia</th></tr></thead><tbody>
      \${(access?.levels||[]).map(l => \`<tr><td class="neon font-bold">\${l.id}</td><td>\${l.name}</td><td>\${l.users}</td><td class="text-gray-500">\${l.permissions}</td></tr>\`).join('')}
      </tbody></table>
    </div>
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Audit logy</h3>
      <div class="terminal" style="max-height:260px">\${(audit?.logs||[]).map(l => \`<div><span class="text-gray-600">[\${l.timestamp.slice(11,19)}]</span> <span class="\${l.severity==='warning'?'text-yellow-500':'text-gray-500'}">\${l.action}</span> <span class="text-gray-400">\${l.detail}</span></div>\`).join('') || '<div class="text-gray-600">Žiadne záznamy</div>'}</div>
    </div>
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">História prihlásení</h3>
      <table><thead><tr><th>Čas</th><th>IP</th><th>Výsledok</th><th>Dôvod</th></tr></thead><tbody>
      \${(logins?.history||[]).map(l => \`<tr><td class="text-gray-500">\${l.time.slice(11,19)}</td><td>\${l.ip}</td><td class="\${l.success?'text-green-500':'text-red-500'}">\${l.success?'OK':'FAIL'}</td><td class="text-gray-500">\${l.reason}</td></tr>\`).join('') || '<tr><td colspan="4" class="text-gray-600 text-center py-4">Žiadne prihlásenia</td></tr>'}
      </tbody></table>
    </div>
  </div>\`;
}

window.toggleFW = async (id) => {
  const { data } = await api('/api/security/firewall');
  const rule = (data?.rules||[]).find(r => r.id === id);
  await api('/api/security/firewall/' + id, { method: 'PATCH', body: JSON.stringify({ enabled: !rule.enabled }) });
  renderSecurity(document.getElementById('content'));
};

// --- Integrations View ---
async function renderIntegrations(c) {
  const { data } = await api('/api/integrations');
  const ints = data?.integrations || [];
  c.innerHTML = \`
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">Integrácie</h1><div class="text-xs text-gray-600 tracking-widest mt-1">EXTERNÉ SYSTÉMY A KONEKTORY</div></div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="int-cards">
    \${ints.map(i => \`
    <div class="panel panel-hover p-5">
      <div class="flex items-start justify-between mb-3"><div class="text-3xl">\${i.icon}</div><span class="badge badge-\${i.status}">\${i.status}</span></div>
      <h3 class="font-bold text-gray-200 text-sm">\${i.name}</h3>
      <p class="text-xs text-gray-600 mt-1">\${i.detail}</p>
      \${i.domain?\`<div class="text-[10px] text-gray-700 mt-2">Domena: \${i.domain}</div>\`:''}
      \${i.repos?\`<div class="text-[10px] text-gray-700 mt-2">Repos: \${i.repos.join(', ')}</div>\`:''}
      \${i.model?\`<div class="text-[10px] text-gray-700 mt-2">Model: \${i.model}</div>\`:''}
      <button onclick="toggleInt('\${i.id}')" class="\${i.status==='connected'?'btn-ghost':'btn-neon'} w-full mt-4 text-xs uppercase">\${i.status==='connected'?'Odpojiť':'Pripojiť'}</button>
    </div>\`).join('')}
  </div>\`;
}

window.toggleInt = async (id) => {
  const { data } = await api('/api/integrations');
  const integ = (data?.integrations||[]).find(i => i.id === id);
  const newStatus = integ.status === 'connected' ? 'disconnected' : 'connected';
  await api('/api/integrations/' + id, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
  renderIntegrations(document.getElementById('content'));
};

// --- AI Core View ---
async function renderAI(c) {
  const [{ data: perms }, { data: behavior }, { data: auto }] = await Promise.all([
    api('/api/ai/permissions'), api('/api/ai/behavior'), api('/api/ai/autonomous/status')
  ]);
  const m = auto?.metrics || { cycles: 0, decisions: 0, tasks: 0, patterns: 0, evolutions: 0 };
  const caps = auto?.capabilities || [];
  const cycles = auto?.recentCycles || [];

  c.innerHTML = \`
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-3xl font-black neon uppercase">✦ TRINITY AI Core</h1><div class="text-xs text-gray-600 tracking-widest mt-1">CENTRÁLNA AUTONÓMNA INTELIGENCIA</div></div>
    <div class="flex items-center gap-3">
      <span class="badge \${auto?.active?'badge-online':'badge-disconnected'}">\${auto?.active?'ENGINE ACTIVE':'ENGINE IDLE'}</span>
      <button id="ai-toggle-engine" class="\${auto?.active?'btn-ghost':'btn-neon'} text-xs uppercase">\${auto?.active?'Stop':'Štart'}</button>
    </div>
  </div>

  <!-- Metrics bar -->
  <div class="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
    <div class="panel p-3 text-center"><div class="text-[10px] text-gray-600 uppercase">Cykly</div><div class="text-xl font-black neon">\${m.cycles}</div></div>
    <div class="panel p-3 text-center"><div class="text-[10px] text-gray-600 uppercase">Rozhodnutia</div><div class="text-xl font-black neon">\${m.decisions}</div></div>
    <div class="panel p-3 text-center"><div class="text-[10px] text-gray-600 uppercase">Úlohy</div><div class="text-xl font-black neon">\${m.tasks}</div></div>
    <div class="panel p-3 text-center"><div class="text-[10px] text-gray-600 uppercase">Vzorce</div><div class="text-xl font-black neon">\${m.patterns}</div></div>
    <div class="panel p-3 text-center"><div class="text-[10px] text-gray-600 uppercase">Evolúcie</div><div class="text-xl font-black neon">\${m.evolutions}</div></div>
    <div class="panel p-3 text-center"><div class="text-[10px] text-gray-600 uppercase">Evo Score</div><div class="text-xl font-black neon">\${auto?.evolutionScore || 0}</div></div>
  </div>

  <!-- Autonomous cycle controls -->
  <div class="panel p-5 mb-6">
    <h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">⚙ Autonómny engine</h3>
    <div class="flex flex-wrap gap-3 mb-4">
      <button id="ai-cycle" class="btn-neon text-xs uppercase">Spusti autonómny cyklus</button>
      <button id="ai-learn" class="btn-ghost text-xs uppercase">Samoučenie</button>
      <button id="ai-evolve" class="btn-ghost text-xs uppercase">Samoevolúcia</button>
      <button id="ai-decision" class="btn-ghost text-xs uppercase">Autonómne rozhodnutie</button>
    </div>
    <div id="ai-cycle-result" class="terminal" style="min-height:60px"><div class="text-gray-600">Stav engine: \${auto?.active?'AKTÍVNY':'NEAKTÍVNY'} · Knowledge base: \${auto?.knowledgeBaseSize || 0} záznamov</div></div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Command panel -->
    <div class="panel p-5">
      <h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Príkazový panel</h3>
      <textarea id="ai-cmd" class="input mb-3" rows="3" placeholder="Zadaj príkaz pre AI Core..."></textarea>
      <button id="ai-send" class="btn-neon w-full uppercase">Vykonaj príkaz</button>
      <div id="ai-response" class="terminal mt-4" style="min-height:100px"><div class="text-gray-600">Čakám na príkaz od super-admina...</div></div>
    </div>

    <!-- Capabilities -->
    <div class="panel p-5">
      <h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">🧬 Schopnosti (samoevolúcia)</h3>
      <div class="space-y-2">
        \${caps.map(cap => \`
        <div class="flex items-center justify-between p-2 \${cap.unlocked?'':'opacity-40'}">
          <div class="flex items-center gap-2">
            <span class="\${cap.unlocked?'neon':'text-gray-700'}">\${cap.unlocked?'◆':'◇'}</span>
            <span class="text-xs \${cap.unlocked?'text-gray-300':'text-gray-600'}">\${cap.name}</span>
          </div>
          <span class="text-[10px] \${cap.unlocked?'text-green-500':'text-gray-700'}">\${cap.unlocked?'UNLOCKED':'LOCKED'}</span>
        </div>\`).join('')}
      </div>
    </div>

    <!-- Permissions -->
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Povolenia a obmedzenia</h3>
      <div class="space-y-3" id="ai-perms">\${(perms?.permissions||[]).map(p => \`
      <div class="flex items-center justify-between p-2 hover:bg-gray-900">
        <div><div class="text-xs font-bold text-gray-300">\${p.name}</div><div class="text-[10px] text-gray-600">\${p.scope}</div></div>
        <div class="toggle \${p.enabled?'on':''}" onclick="togglePerm('\${p.id}')"></div>
      </div>\`).join('')}</div>
    </div>

    <!-- Autonomous cycle log -->
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">🔄 Cyklus logy</h3>
      <div class="terminal" style="max-height:200px">\${cycles.map(cy => \`<div><span class="text-gray-600">[#\${cy.cycle}]</span> <span class="text-gray-400">\${cy.decision}</span> → <span class="neon">\${cy.action?.slice(0,50)}</span> <span class="text-gray-700">(score: \${cy.evolutionScore})</span>\${cy.newCapabilities?.length?\` <span class="text-green-500">NEW: \${cy.newCapabilities.join(', ')}</span>\`:''}</div>\`).join('') || '<div class="text-gray-600">Žiadne cykly. Spusti autonómny cyklus.</div>'}</div>
    </div>

    <!-- Behavior monitoring -->
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">📡 Monitoring správania</h3>
      <div class="terminal" style="max-height:200px">\${(behavior?.logs||[]).map(l => \`<div><span class="text-gray-600">[\${l.time.slice(11,19)}]</span> <span class="text-gray-400">\${l.command}</span> → <span class="neon">\${(l.response||'').slice(0,60)}</span></div>\`).join('') || '<div class="text-gray-600">Žiadna aktivita</div>'}</div>
    </div>
  </div>\`;

  // Command panel
  document.getElementById('ai-send').onclick = async () => {
    const cmd = document.getElementById('ai-cmd').value.trim();
    if (!cmd) return;
    const box = document.getElementById('ai-response');
    box.innerHTML = '<div class="text-yellow-500">Spracúvam príkaz...<span class="blink">_</span></div>';
    const { ok, data } = await api('/api/ai/command', { method: 'POST', body: JSON.stringify({ command: cmd }) });
    if (ok) box.innerHTML = \`<div class="text-gray-600">> \${cmd}</div><div class="neon mt-2">\${data.response}</div><div class="text-[10px] text-gray-700 mt-2">Engine: \${data.engine}</div>\`;
    else box.innerHTML = \`<div class="text-red-500">Chyba: \${data.error}</div>\`;
  };

  // Toggle engine
  document.getElementById('ai-toggle-engine').onclick = async () => {
    await api('/api/ai/autonomous/toggle', { method: 'POST' });
    renderAI(c);
  };

  // Run autonomous cycle
  document.getElementById('ai-cycle').onclick = async () => {
    const box = document.getElementById('ai-cycle-result');
    box.innerHTML = '<div class="text-yellow-500">Spúšťam autonómny cyklus...<span class="blink">_</span></div>';
    const { ok, data } = await api('/api/ai/autonomous/cycle', { method: 'POST' });
    if (ok) {
      box.innerHTML = \`<div class="text-green-500">✓ Cyklus #\${data.cycle} dokončený</div>
        <div class="text-gray-400 mt-1">Rozhodnutie: <span class="neon">\${data.decision}</span></div>
        <div class="text-gray-400">Akcia: \${data.action}</div>
        <div class="text-gray-400">Vzorce: \${data.patterns} · Evo score: \${data.evolutionScore} · Schopnosti: \${data.totalCapabilities}/\${(auto?.capabilities||[]).length}</div>
        \${data.newCapabilities?.length?\`<div class="text-green-500 mt-1">🧬 Nové schopnosti: \${data.newCapabilities.join(', ')}</div>\`:''}
        <div class="text-gray-600 mt-1">Úlohy: \${data.tasks.map(t=>t.task+' ('+t.status+')').join(', ')}</div>\`;
      setTimeout(() => renderAI(c), 2000);
    } else {
      box.innerHTML = '<div class="text-red-500">Chyba: ' + (data?.error || 'unknown') + '</div>';
    }
  };

  // Self-learning
  document.getElementById('ai-learn').onclick = async () => {
    const { ok, data } = await api('/api/ai/learn', { method: 'POST', body: JSON.stringify({ source: 'manual', payload: { trigger: 'super-admin' } }) });
    if (ok) {
      document.getElementById('ai-cycle-result').innerHTML = \`<div class="text-green-500">✓ Samoučenie: \${data.patterns ? Object.entries(data.patterns).map(([k,v])=>k+':'+v).join(', ') : 'žiadne vzorce'}</div><div class="text-gray-500">Knowledge base: \${data.knowledgeBaseSize} záznamov</div>\`;
      setTimeout(() => renderAI(c), 1500);
    }
  };

  // Self-evolution
  document.getElementById('ai-evolve').onclick = async () => {
    const { ok, data } = await api('/api/ai/evolve', { method: 'POST' });
    if (ok) {
      document.getElementById('ai-cycle-result').innerHTML = \`<div class="text-green-500">✓ Samoevolúcia: score \${data.evolutionScore}</div>\${data.newCapabilities?.length?\`<div class="text-green-500">🧬 Nové schopnosti: \${data.newCapabilities.join(', ')}</div>\`:'<div class="text-gray-500">Žiadne nové schopnosti (potrebuj vyšší score)</div>'}<div class="text-gray-500">Odomknuté: \${data.totalCapabilities}/\${caps.length}</div>\`;
      setTimeout(() => renderAI(c), 1500);
    }
  };

  // Autonomous decision
  document.getElementById('ai-decision').onclick = async () => {
    const { ok, data } = await api('/api/ai/decision');
    if (ok) {
      const ecoStr = Object.entries(data.ecosystem||{}).map(([k,v])=>k+':'+v).join(', ');
      document.getElementById('ai-cycle-result').innerHTML = \`<div class="text-green-500">✓ Rozhodnutie: \${data.decision}</div><div class="text-gray-400">\${data.action}</div><div class="text-gray-600 mt-1">Ecosystem: \${ecoStr}</div>\`;
    }
  };
}

window.togglePerm = async (id) => {
  const { data } = await api('/api/ai/permissions');
  const perm = (data?.permissions||[]).find(p => p.id === id);
  await api('/api/ai/permissions/' + id, { method: 'PATCH', body: JSON.stringify({ enabled: !perm.enabled }) });
  renderAI(document.getElementById('content'));
};

// --- GitHub View ---
let ghState = { owner: null, repo: null, branch: 'main', path: '', repos: [] };

async function renderGitHub(c) {
  c.innerHTML = \`
  <div class="flex items-center justify-between mb-6">
    <div><h1 class="text-3xl font-black neon uppercase">⧄ GitHub</h1><div class="text-xs text-gray-600 tracking-widest mt-1">PREPOJENIE S REPOZITÁRMI · AI CODE ACCESS</div></div>
    <button id="gh-refresh" class="btn-ghost text-xs uppercase">↻ Obnoviť</button>
  </div>
  <div id="gh-content" class="fade-in"><div class="text-gray-600 text-sm">Načítavam repozitáre...</div></div>\`;

  document.getElementById('gh-refresh').onclick = () => renderGitHub(c);
  await loadGitHubRepos(c);
}

async function loadGitHubRepos(c) {
  const content = document.getElementById('gh-content');
  const { ok, data } = await api('/api/github/repos');
  if (!ok) {
    content.innerHTML = \`
    <div class="panel p-6 text-center">
      <div class="text-red-500 text-sm mb-2">⚠ \${data.error || 'Chyba pripojenia'}</div>
      <div class="text-xs text-gray-600">Pre prepojenie s GitHub pridaj GITHUBE token (Personal Access Token) v Base44 Secrets.</div>
    </div>\`;
    return;
  }
  ghState.repos = data.repos || [];
  if (ghState.repos.length === 0) {
    content.innerHTML = '<div class="panel p-6 text-center text-gray-600 text-sm">Žiadne repozitáre nájdené.</div>';
    return;
  }
  content.innerHTML = \`
  <div class="text-xs text-gray-600 mb-3">Nájdené \${ghState.repos.length} repozitárov. Klikni na repozitár pre prehliadanie.</div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    \${ghState.repos.map(r => \`
    <div class="panel panel-hover p-4 cursor-pointer" onclick="openRepo('\${r.owner}','\${r.name}','\${r.default_branch}')">
      <div class="flex items-start justify-between mb-2">
        <div class="text-lg">\${r.private?'🔒':'📦'}</div>
        <span class="text-[10px] text-gray-600">\${r.language || '—'}</span>
      </div>
      <div class="text-sm font-bold text-gray-200">\${r.name}</div>
      <div class="text-[10px] text-gray-600 mt-1">\${r.owner}/\${r.name}</div>
      \${r.description?\`<div class="text-[10px] text-gray-500 mt-2">\${r.description.slice(0,60)}</div>\`:''}
      <div class="text-[10px] text-gray-700 mt-2">⎇ \${r.default_branch} · ★ \${r.stars} · \${new Date(r.updated_at).toLocaleDateString('sk-SK')}</div>
    </div>\`).join('')}
  </div>\`;
}

window.openRepo = async (owner, repo, branch) => {
  ghState.owner = owner; ghState.repo = repo; ghState.branch = branch; ghState.path = '';
  await loadRepoContents(document.getElementById('gh-content'));
};

async function loadRepoContents(content) {
  const { ok, data } = await api('/api/github/repo/' + ghState.owner + '/' + ghState.repo + '/contents?path=' + encodeURIComponent(ghState.path) + '&branch=' + ghState.branch);
  if (!ok) {
    content.innerHTML = \`<div class="text-red-500 text-sm">\${data.error || 'Chyba'}</div>\`;
    return;
  }

  // Breadcrumb
  const crumbs = ghState.path ? ghState.path.split('/') : [];
  let breadcrumb = \`<span class="cursor-pointer neon" onclick="ghBrowse('')">\${ghState.repo}</span>\`;
  let curPath = '';
  for (const crumb of crumbs) {
    curPath = curPath ? curPath + '/' + crumb : crumb;
    breadcrumb += \` / <span class="cursor-pointer \${curPath===ghState.path?'text-gray-300':'text-gray-600'}" onclick="ghBrowse('\${curPath}')">\${crumb}</span>\`;
  }

  const items = data.items || [];
  const dirs = items.filter(i => i.type === 'dir').sort((a,b) => a.name.localeCompare(b.name));
  const files = items.filter(i => i.type === 'file').sort((a,b) => a.name.localeCompare(b.name));

  content.innerHTML = \`
  <div class="flex items-center gap-3 mb-4">
    <button onclick="renderGitHub(document.getElementById('content'))" class="btn-ghost text-xs">← Repozitáre</button>
    <div class="text-sm text-gray-400">\${breadcrumb}</div>
    <div class="ml-auto flex items-center gap-2">
      <select id="gh-branch" class="input text-xs" style="width:auto;padding:4px 8px">\${(data.branches||[]).map(b=>\`<option value="\${b.name}" \${b.name===ghState.branch?'selected':''}>\${b.name}</option>\`).join('')}</select>
    </div>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div class="panel p-4">
      <h3 class="text-xs font-bold neon uppercase mb-3 border-b border-gray-800 pb-2">📁 Súbory</h3>
      <div class="space-y-1">
        \${dirs.map(d => \`<div class="flex items-center gap-2 p-2 hover:bg-gray-900 cursor-pointer text-xs" onclick="ghBrowse('\${d.path}')"><span class="text-yellow-600">📁</span> \${d.name}</div>\`).join('')}
        \${files.map(f => \`<div class="flex items-center gap-2 p-2 hover:bg-gray-900 cursor-pointer text-xs" onclick="ghReadFile('\${f.path}')"><span class="text-gray-500">📄</span> \${f.name} <span class="text-gray-700 ml-auto">\${f.size > 1024 ? (f.size/1024).toFixed(1)+'KB' : f.size+'B'}</span></div>\`).join('')}
      </div>
    </div>
    <div class="panel p-4">
      <h3 class="text-xs font-bold neon uppercase mb-3 border-b border-gray-800 pb-2">📄 Náhľad súboru</h3>
      <div id="gh-file-view" class="text-gray-600 text-xs">Vyber súbor pre náhľad.</div>
    </div>
  </div>\`;

  const branchSelect = document.getElementById('gh-branch');
  if (branchSelect) branchSelect.onchange = (e) => { ghState.branch = e.target.value; loadRepoContents(content); };
}

window.ghBrowse = (path) => {
  ghState.path = path;
  loadRepoContents(document.getElementById('gh-content'));
};

window.ghReadFile = async (filePath) => {
  const view = document.getElementById('gh-file-view');
  view.innerHTML = '<div class="text-yellow-500">Načítavam...<span class="blink">_</span></div>';
  const { ok, data } = await api('/api/github/repo/' + ghState.owner + '/' + ghState.repo + '/contents?path=' + encodeURIComponent(filePath) + '&branch=' + ghState.branch);
  if (!ok || data.type !== 'file') {
    view.innerHTML = '<div class="text-red-500">' + (data.error || 'Nemôžem načítať súbor') + '</div>';
    return;
  }
  const isBinary = data.content.length > 0 && /[\x00-\x08\x0E-\x1F]/.test(data.content.slice(0, 1000));
  const preview = isBinary ? '[Binárny súbor — ' + data.size + 'B]' : data.content.slice(0, 5000);
  view.innerHTML = \`
  <div class="flex items-center justify-between mb-3">
    <div class="text-xs font-bold text-gray-300">\${data.name}</div>
    <div class="flex gap-2">
      <button onclick="ghAnalyze('\${filePath}')" class="btn-neon text-[10px] uppercase">AI Analyzuj</button>
      <button onclick="ghEdit('\${filePath}')" class="btn-ghost text-[10px] uppercase">Upraviť</button>
    </div>
  </div>
  <pre class="terminal text-[11px] overflow-x-auto" style="max-height:400px">\${preview.replace(/</g,'&lt;')}\${data.content.length > 5000 ? '\\n\\n... (' + data.content.length + ' znakov celkovo)' : ''}</pre>
  <div id="gh-analysis" class="mt-3"></div>\`;
};

window.ghAnalyze = async (filePath) => {
  const box = document.getElementById('gh-analysis');
  box.innerHTML = '<div class="text-yellow-500">AI analyzuje kód...<span class="blink">_</span></div>';
  const { ok, data } = await api('/api/ai/repo/analyze', { method: 'POST', body: JSON.stringify({ owner: ghState.owner, repo: ghState.repo, path: filePath, branch: ghState.branch }) });
  if (ok) {
    box.innerHTML = \`<div class="terminal text-[11px] neon" style="max-height:300px">\${data.analysis.replace(/</g,'&lt;')}</div>\`;
  } else {
    box.innerHTML = '<div class="text-red-500 text-xs">' + (data.error || 'AI analýza zlyhala') + '</div>';
  }
};

window.ghEdit = async (filePath) => {
  const { ok, data } = await api('/api/github/repo/' + ghState.owner + '/' + ghState.repo + '/contents?path=' + encodeURIComponent(filePath) + '&branch=' + ghState.branch);
  if (!ok || data.type !== 'file') return;
  const view = document.getElementById('gh-file-view');
  view.innerHTML = \`
  <div class="text-xs font-bold text-gray-300 mb-2">✏ Úprava: \${data.name}</div>
  <textarea id="gh-edit-area" class="input text-[11px]" style="font-family:monospace;min-height:300px;max-height:500px" rows="20">\${data.content.replace(/</g,'&lt;')}</textarea>
  <input id="gh-edit-msg" class="input text-xs mt-2" placeholder="Commit message..." value="TRINITY AI Core: update \${data.name}">
  <div class="flex gap-2 mt-2">
    <button id="gh-save" class="btn-neon text-xs uppercase">Uložiť zmenu</button>
    <button onclick="ghReadFile('\${filePath}')" class="btn-ghost text-xs uppercase">Zrušiť</button>
  </div>\`;
  document.getElementById('gh-save').onclick = async () => {
    const content = document.getElementById('gh-edit-area').value;
    const msg = document.getElementById('gh-edit-msg').value;
    const { ok: saved, data: sdata } = await api('/api/github/repo/' + ghState.owner + '/' + ghState.repo + '/contents?path=' + encodeURIComponent(filePath) + '&branch=' + ghState.branch, { method: 'PUT', body: JSON.stringify({ content, message: msg }) });
    if (saved) {
      window.ghReadFile(filePath);
    } else {
      alert('Chyba: ' + (sdata.error || 'unknown'));
    }
  };
};

// --- Shop View ---
async function renderShop(c) {
  const { data } = await api('/api/shop/products');
  const products = data?.products || [];
  c.innerHTML = \`
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">USW Streetwear</h1><div class="text-xs text-gray-600 tracking-widest mt-1">DROPOVANIE POUULIČNÉHO OBLEČENIA</div></div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    \${products.map(p => \`
    <div class="panel panel-hover p-5">
      <div class="flex justify-between mb-2"><span class="badge badge-online">STOCK: \${p.stock}</span><span class="text-[10px] text-gray-600">DROP: \${p.dropDate}</span></div>
      <h3 class="font-bold text-gray-200">\${p.name}</h3>
      <div class="text-xs text-gray-600 mt-1">\${p.category} · \${p.size.join('/')}</div>
      <div class="text-2xl font-black neon mt-3">€\${p.price}</div>
    </div>\`).join('')}
  </div>\`;
}

render();
</script>
</body>
</html>`;
