/**
 * TRINITY CORE — In-memory data store
 * Holds seed data for all 6 pillars, security, integrations, and AI Core.
 * State persists across requests within the wrangler dev process.
 */

// --- Auth ---
const ADMIN = {
  username: 'sabo_ivan',
  password: 'tenebris369',
  twofaCode: '369369',
  role: 'super-admin',
};

const sessions = new Map(); // token -> { user, createdAt }

// --- Audit log ---
const auditLog = [];
function logAudit(action, actor = 'super-admin', detail = '') {
  auditLog.unshift({
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    actor,
    detail,
    timestamp: new Date().toISOString(),
    severity: action.toLowerCase().includes('fail') || action.toLowerCase().includes('denied') ? 'warning' : 'info',
  });
}

// --- Login history ---
const loginHistory = [];

// --- Pillars ---
const pillars = [
  {
    id: 'trinity',
    name: 'TRINITY Core',
    code: 'TRN',
    color: '#3b82f6',
    icon: '🟦',
    status: 'ONLINE',
    description: 'Centrálne riadiace jadro — orchestrátor všetkých procesov.',
    stats: { modules: 6, uptime: '99.98%', sync: 'SYNCED', activeTasks: 3 },
    functions: [
      'Centrálne riadiace jadro',
      'Synchronizácia pilierov',
      'Bezpečnostné protokoly',
      'Správa používateľov',
      'Monitorovanie ekosystému',
      'Integrácia modulov',
    ],
  },
  {
    id: 'usw',
    name: 'USW Underground Street View',
    code: 'USW',
    color: '#f97316',
    icon: '🟧',
    status: 'STANDBY',
    description: 'Podzemný vizualizačný a informačný systém.',
    stats: { maps: 12, routes: 48, nodes: 156, monitoredPoints: 23 },
    functions: [
      'Mapovanie podzemných štruktúr',
      'Vizualizácie a panorámy',
      'Monitoring pohybu',
      'Interné operácie',
      'Bezpečnostné vrstvy',
    ],
  },
  {
    id: 'rentacar',
    name: 'Rent-a-Car',
    code: 'RAC',
    color: '#eab308',
    icon: '🟨',
    status: 'ONLINE',
    description: 'Správa vozidiel, rezervácií, prenájmov a GPS monitoring.',
    stats: { vehicles: 18, active: 12, reserved: 4, inService: 2 },
    functions: [
      'Správa vozidiel',
      'Rezervácie a prenájmy',
      'GPS monitoring',
      'Logistické prepojenie',
      'Automatizované úlohy',
    ],
  },
  {
    id: 'personnel',
    name: 'Personálna agentúra',
    code: 'PRS',
    color: '#22c55e',
    icon: '🟩',
    status: 'ONLINE',
    description: 'Interný HR systém — pracovníci, úlohy, zmluvy.',
    stats: { workers: 34, active: 28, onAssignment: 19, contracts: 31 },
    functions: [
      'Registrácia pracovníkov',
      'Zmluvy a dokumenty',
      'Pracovné pozície',
      'Pridelenie úloh',
      'Prepojenie na logistiku',
    ],
  },
  {
    id: 'logistics',
    name: 'Logistika',
    code: 'LOG',
    color: '#3b82f6',
    icon: '🟦',
    status: 'ONLINE',
    description: 'Operatívny pilier pre pohyb materiálu, zásob a ľudí.',
    stats: { shipments: 42, inTransit: 15, warehouses: 4, stockItems: 1280 },
    functions: [
      'Preprava',
      'Skladovanie',
      'Distribúcia',
      'Riadenie zásob',
      'Napojenie na Rent-a-Car a Personál',
    ],
  },
  {
    id: 'solidarity',
    name: 'Solidarita',
    code: 'SOL',
    color: '#ef4444',
    icon: '🟥',
    status: 'STANDBY',
    description: 'Sociálny pilier — pomoc, podpora a humanitárne operácie.',
    stats: { projects: 7, activeOps: 3, beneficiaries: 240, volunteers: 18 },
    functions: [
      'Sociálna pomoc',
      'Podpora komunít',
      'Humanitárne operácie',
      'Prepojenie na logistiku a personál',
      'Interné projekty solidarity',
    ],
  },
];

// --- Rent-a-Car vehicles ---
const vehicles = [
  { id: 'RAC-001', model: 'Mercedes Sprinter L3H2', plate: 'BA-123-AB', status: 'active', gps: { lat: 48.1486, lng: 17.1077 }, driver: 'Marek H.', assignment: 'LOG-042' },
  { id: 'RAC-002', model: 'VW Crafter', plate: 'BA-456-CD', status: 'active', gps: { lat: 48.3069, lng: 14.2864 }, driver: 'Peter K.', assignment: 'LOG-038' },
  { id: 'RAC-003', model: 'Renault Master', plate: 'KE-789-EF', status: 'reserved', gps: { lat: 49.2, lng: 16.6 }, driver: null, assignment: null },
  { id: 'RAC-004', model: 'Ford Transit', plate: 'BA-012-GH', status: 'service', gps: { lat: 48.15, lng: 17.10 }, driver: null, assignment: null },
  { id: 'RAC-005', model: 'Iveco Daily', plate: 'TT-345-IJ', status: 'active', gps: { lat: 48.7, lng: 18.6 }, driver: 'Lukas M.', assignment: 'LOG-051' },
];

// --- Personnel ---
const workers = [
  { id: 'PRS-001', name: 'Marek Horák', role: 'Vodič L3H2', status: 'on-assignment', skills: ['Vodičský preukaz C', 'Nemčina B1'], contract: 'active' },
  { id: 'PRS-002', name: 'Peter Kováč', role: 'Vodič L3H2', status: 'on-assignment', skills: ['Vodičský preukaz C', 'Angličtina B2'], contract: 'active' },
  { id: 'PRS-003', name: 'Lucia Nováková', role: 'Dispečer', status: 'active', skills: ['Logistika', 'Slovenčina/Čeština'], contract: 'active' },
  { id: 'PRS-004', name: 'Tomáš Bielik', role: 'Skladník', status: 'active', skills: ['Skladové hospodárstvo', 'Vozík'], contract: 'active' },
  { id: 'PRS-005', name: 'Jakub Sabo', role: 'Super-Admin', status: 'active', skills: ['Riadenie systému', 'AI Core'], contract: 'permanent' },
];

// --- Logistics shipments ---
const shipments = [
  { id: 'LOG-042', from: 'Bratislava SK', to: 'Berlin DE', status: 'in-transit', vehicle: 'RAC-001', items: 120, eta: '2026-09-08' },
  { id: 'LOG-038', from: 'Bratislava SK', to: 'Linz AT', status: 'in-transit', vehicle: 'RAC-002', items: 64, eta: '2026-09-07' },
  { id: 'LOG-051', from: 'Košice SK', to: 'Praha CZ', status: 'in-transit', vehicle: 'RAC-005', items: 200, eta: '2026-09-09' },
  { id: 'LOG-044', from: 'Bratislava SK', to: 'Viedeň AT', status: 'delivered', vehicle: 'RAC-003', items: 48, eta: '2026-09-05' },
  { id: 'LOG-055', from: 'Žilina SK', to: 'Mníchov DE', status: 'pending', vehicle: null, items: 320, eta: '2026-09-12' },
];

// --- Solidarity projects ---
const solidarityProjects = [
  { id: 'SOL-001', name: 'Podpora rodín v núdzi', status: 'active', beneficiaries: 45, coordinator: 'Lucia N.' },
  { id: 'SOL-002', name: 'Humanitárny konvoj — Ukrajina', status: 'active', beneficiaries: 120, coordinator: 'Peter K.' },
  { id: 'SOL-003', name: 'Komunitné obedy BA', status: 'planning', beneficiaries: 75, coordinator: 'Tomáš B.' },
];

// --- Security ---
const firewallRules = [
  { id: 'FW-001', name: 'Block non-whitelist IP', enabled: true, action: 'deny', source: '0.0.0.0/0 (except whitelist)', port: '443' },
  { id: 'FW-002', name: 'Rate limit API', enabled: true, action: 'limit', source: 'all', port: '8787', limit: '100/min' },
  { id: 'FW-003', name: 'Block brute-force login', enabled: true, action: 'deny', source: 'auto-detected', port: '443' },
  { id: 'FW-004', name: 'AI Sandbox isolation', enabled: false, action: 'isolate', source: 'AI Core', port: 'internal' },
];

const accessLevels = [
  { id: 'L0', name: 'Super-Admin', users: 1, permissions: 'full', description: 'Plný prístup — Jakub Sabo' },
  { id: 'L1', name: 'Dispečer', users: 2, permissions: 'read-write ops', description: 'Operatívne riadenie' },
  { id: 'L2', name: 'Vodič/Skladník', users: 31, permissions: 'read assigned', description: 'Vlastné úlohy a vozidlá' },
  { id: 'L3', name: 'AI Core', users: 1, permissions: 'sandbox', description: 'Obmedzené povolenia' },
];

// --- Integrations ---
const integrations = [
  { id: 'cloudflare', name: 'Cloudflare', icon: '☁️', status: 'connected', detail: 'DNS + Workers + WAF', domain: 'auru.space' },
  { id: 'github', name: 'GitHub', icon: '🐙', status: 'connected', detail: 'Repo prepojenie + AI Code Access', repos: ['Trinity', 'USC', 'Tenebris', 'Auru_trinity_butcher'] },
  { id: 'firebase', name: 'Firebase', icon: '🔥', status: 'disconnected', detail: 'Databáza + Auth', project: '—' },
  { id: 'gemini', name: 'Google AI Studio', icon: '✨', status: 'connected', detail: 'Gemini — AI Core engine', model: 'gemini-flash-latest' },
  { id: 'dominatron', name: 'Dominatron', icon: '🌐', status: 'disconnected', detail: 'Správa domén', domains: '—' },
];

// --- AI Core ---
const aiPermissions = [
  { id: 'ai-read', name: 'Čítať dáta', enabled: true, scope: 'all pillars' },
  { id: 'ai-write', name: 'Zapisovať dáta', enabled: false, scope: 'sandbox only' },
  { id: 'ai-codegen', name: 'Generovať kód', enabled: true, scope: 'TRINITY modules' },
  { id: 'ai-web', name: 'Tvorba webu', enabled: true, scope: 'static sites' },
  { id: 'ai-social', name: 'Sociálne siete', enabled: false, scope: 'requires approval' },
  { id: 'ai-delete', name: 'Mazať súbory', enabled: false, scope: 'requires approval' },
];

const aiBehaviorLog = [];

// --- AI Core: Autonomous Engine state ---
const aiKnowledgeBase = [];     // ingested data records
const aiEvolutionScore = { value: 0 }; // grows with each learning cycle
const aiCapabilities = [       // unlocked capabilities
  { id: 'base-ops', name: 'Základná operácia', unlocked: true, unlockedAt: 'init' },
  { id: 'pattern-detect', name: 'Detekcia vzorcov', unlocked: true, unlockedAt: 'init' },
  { id: 'adaptive-routing', name: 'Adaptívne routovanie', unlocked: false, unlockedAt: null },
  { id: 'predictive-analysis', name: 'Prediktívna analýza', unlocked: false, unlockedAt: null },
  { id: 'auto-codegen', name: 'Autonómne generovanie kódu', unlocked: false, unlockedAt: null },
  { id: 'self-healing', name: 'Samoliečenie systému', unlocked: false, unlockedAt: null },
];
const aiAutonomousLog = [];    // autonomous cycle logs
const aiMetrics = { cycles: 0, decisions: 0, tasks: 0, patterns: 0, evolutions: 0 };
const aiActive = { value: false }; // engine running flag

// --- System alerts ---
const alerts = [
  { id: 'ALR-001', severity: 'warning', pillar: 'GitHub', message: 'CI zlyhanie: Trinity repo (Node.js 22.x)', time: '2026-09-03' },
  { id: 'ALR-002', severity: 'warning', pillar: 'GitHub', message: 'CI zlyhanie: USC repo (chýba package-lock.json)', time: '2026-09-03' },
  { id: 'ALR-003', severity: 'info', pillar: 'Logistika', message: 'LOG-044 doručené: Bratislava → Viedeň', time: '2026-09-05' },
  { id: 'ALR-004', severity: 'info', pillar: 'TRINITY', message: 'Synchronizácia pilierov dokončená', time: '2026-09-06' },
];

// --- System logs (terminal) ---
const systemLogs = [
  { time: '12:32:01', level: 'info', message: 'TRINITY Core inicializovaný' },
  { time: '12:32:02', level: 'info', message: 'Pripojené: Cloudflare, GitHub, Gemini' },
  { time: '12:32:03', level: 'warn', message: 'Firebase: nepripojené' },
  { time: '12:32:04', level: 'info', message: 'Synchronizácia pilierov: 4 ONLINE, 2 STANDBY' },
];

export {
  ADMIN,
  sessions,
  auditLog,
  logAudit,
  loginHistory,
  pillars,
  vehicles,
  workers,
  shipments,
  solidarityProjects,
  firewallRules,
  accessLevels,
  integrations,
  aiPermissions,
  aiBehaviorLog,
  aiKnowledgeBase,
  aiEvolutionScore,
  aiCapabilities,
  aiAutonomousLog,
  aiMetrics,
  aiActive,
  alerts,
  systemLogs,
};
