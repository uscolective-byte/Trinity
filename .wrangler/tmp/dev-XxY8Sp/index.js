var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-MbVgeb/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/data/store.js
var ADMIN = {
  username: "sabo_ivan",
  password: "tenebris369",
  twofaCode: "369369",
  role: "super-admin"
};
var sessions = /* @__PURE__ */ new Map();
var auditLog = [];
function logAudit(action, actor = "super-admin", detail = "") {
  auditLog.unshift({
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    action,
    actor,
    detail,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    severity: action.toLowerCase().includes("fail") || action.toLowerCase().includes("denied") ? "warning" : "info"
  });
}
__name(logAudit, "logAudit");
var loginHistory = [];
var pillars = [
  {
    id: "trinity",
    name: "TRINITY Core",
    code: "TRN",
    color: "#3b82f6",
    icon: "\u{1F7E6}",
    status: "ONLINE",
    description: "Centr\xE1lne riadiace jadro \u2014 orchestr\xE1tor v\u0161etk\xFDch procesov.",
    stats: { modules: 6, uptime: "99.98%", sync: "SYNCED", activeTasks: 3 },
    functions: [
      "Centr\xE1lne riadiace jadro",
      "Synchroniz\xE1cia pilierov",
      "Bezpe\u010Dnostn\xE9 protokoly",
      "Spr\xE1va pou\u017E\xEDvate\u013Eov",
      "Monitorovanie ekosyst\xE9mu",
      "Integr\xE1cia modulov"
    ]
  },
  {
    id: "usw",
    name: "USW Underground Street View",
    code: "USW",
    color: "#f97316",
    icon: "\u{1F7E7}",
    status: "STANDBY",
    description: "Podzemn\xFD vizualiza\u010Dn\xFD a informa\u010Dn\xFD syst\xE9m.",
    stats: { maps: 12, routes: 48, nodes: 156, monitoredPoints: 23 },
    functions: [
      "Mapovanie podzemn\xFDch \u0161trukt\xFAr",
      "Vizualiz\xE1cie a panor\xE1my",
      "Monitoring pohybu",
      "Intern\xE9 oper\xE1cie",
      "Bezpe\u010Dnostn\xE9 vrstvy"
    ]
  },
  {
    id: "rentacar",
    name: "Rent-a-Car",
    code: "RAC",
    color: "#eab308",
    icon: "\u{1F7E8}",
    status: "ONLINE",
    description: "Spr\xE1va vozidiel, rezerv\xE1ci\xED, pren\xE1jmov a GPS monitoring.",
    stats: { vehicles: 18, active: 12, reserved: 4, inService: 2 },
    functions: [
      "Spr\xE1va vozidiel",
      "Rezerv\xE1cie a pren\xE1jmy",
      "GPS monitoring",
      "Logistick\xE9 prepojenie",
      "Automatizovan\xE9 \xFAlohy"
    ]
  },
  {
    id: "personnel",
    name: "Person\xE1lna agent\xFAra",
    code: "PRS",
    color: "#22c55e",
    icon: "\u{1F7E9}",
    status: "ONLINE",
    description: "Intern\xFD HR syst\xE9m \u2014 pracovn\xEDci, \xFAlohy, zmluvy.",
    stats: { workers: 34, active: 28, onAssignment: 19, contracts: 31 },
    functions: [
      "Registr\xE1cia pracovn\xEDkov",
      "Zmluvy a dokumenty",
      "Pracovn\xE9 poz\xEDcie",
      "Pridelenie \xFAloh",
      "Prepojenie na logistiku"
    ]
  },
  {
    id: "logistics",
    name: "Logistika",
    code: "LOG",
    color: "#3b82f6",
    icon: "\u{1F7E6}",
    status: "ONLINE",
    description: "Operat\xEDvny pilier pre pohyb materi\xE1lu, z\xE1sob a \u013Eud\xED.",
    stats: { shipments: 42, inTransit: 15, warehouses: 4, stockItems: 1280 },
    functions: [
      "Preprava",
      "Skladovanie",
      "Distrib\xFAcia",
      "Riadenie z\xE1sob",
      "Napojenie na Rent-a-Car a Person\xE1l"
    ]
  },
  {
    id: "solidarity",
    name: "Solidarita",
    code: "SOL",
    color: "#ef4444",
    icon: "\u{1F7E5}",
    status: "STANDBY",
    description: "Soci\xE1lny pilier \u2014 pomoc, podpora a humanit\xE1rne oper\xE1cie.",
    stats: { projects: 7, activeOps: 3, beneficiaries: 240, volunteers: 18 },
    functions: [
      "Soci\xE1lna pomoc",
      "Podpora komun\xEDt",
      "Humanit\xE1rne oper\xE1cie",
      "Prepojenie na logistiku a person\xE1l",
      "Intern\xE9 projekty solidarity"
    ]
  }
];
var vehicles = [
  { id: "RAC-001", model: "Mercedes Sprinter L3H2", plate: "BA-123-AB", status: "active", gps: { lat: 48.1486, lng: 17.1077 }, driver: "Marek H.", assignment: "LOG-042" },
  { id: "RAC-002", model: "VW Crafter", plate: "BA-456-CD", status: "active", gps: { lat: 48.3069, lng: 14.2864 }, driver: "Peter K.", assignment: "LOG-038" },
  { id: "RAC-003", model: "Renault Master", plate: "KE-789-EF", status: "reserved", gps: { lat: 49.2, lng: 16.6 }, driver: null, assignment: null },
  { id: "RAC-004", model: "Ford Transit", plate: "BA-012-GH", status: "service", gps: { lat: 48.15, lng: 17.1 }, driver: null, assignment: null },
  { id: "RAC-005", model: "Iveco Daily", plate: "TT-345-IJ", status: "active", gps: { lat: 48.7, lng: 18.6 }, driver: "Lukas M.", assignment: "LOG-051" }
];
var workers = [
  { id: "PRS-001", name: "Marek Hor\xE1k", role: "Vodi\u010D L3H2", status: "on-assignment", skills: ["Vodi\u010Dsk\xFD preukaz C", "Nem\u010Dina B1"], contract: "active" },
  { id: "PRS-002", name: "Peter Kov\xE1\u010D", role: "Vodi\u010D L3H2", status: "on-assignment", skills: ["Vodi\u010Dsk\xFD preukaz C", "Angli\u010Dtina B2"], contract: "active" },
  { id: "PRS-003", name: "Lucia Nov\xE1kov\xE1", role: "Dispe\u010Der", status: "active", skills: ["Logistika", "Sloven\u010Dina/\u010Ce\u0161tina"], contract: "active" },
  { id: "PRS-004", name: "Tom\xE1\u0161 Bielik", role: "Skladn\xEDk", status: "active", skills: ["Skladov\xE9 hospod\xE1rstvo", "Voz\xEDk"], contract: "active" },
  { id: "PRS-005", name: "Jakub Sabo", role: "Super-Admin", status: "active", skills: ["Riadenie syst\xE9mu", "AI Core"], contract: "permanent" }
];
var shipments = [
  { id: "LOG-042", from: "Bratislava SK", to: "Berlin DE", status: "in-transit", vehicle: "RAC-001", items: 120, eta: "2026-09-08" },
  { id: "LOG-038", from: "Bratislava SK", to: "Linz AT", status: "in-transit", vehicle: "RAC-002", items: 64, eta: "2026-09-07" },
  { id: "LOG-051", from: "Ko\u0161ice SK", to: "Praha CZ", status: "in-transit", vehicle: "RAC-005", items: 200, eta: "2026-09-09" },
  { id: "LOG-044", from: "Bratislava SK", to: "Viede\u0148 AT", status: "delivered", vehicle: "RAC-003", items: 48, eta: "2026-09-05" },
  { id: "LOG-055", from: "\u017Dilina SK", to: "Mn\xEDchov DE", status: "pending", vehicle: null, items: 320, eta: "2026-09-12" }
];
var solidarityProjects = [
  { id: "SOL-001", name: "Podpora rod\xEDn v n\xFAdzi", status: "active", beneficiaries: 45, coordinator: "Lucia N." },
  { id: "SOL-002", name: "Humanit\xE1rny konvoj \u2014 Ukrajina", status: "active", beneficiaries: 120, coordinator: "Peter K." },
  { id: "SOL-003", name: "Komunitn\xE9 obedy BA", status: "planning", beneficiaries: 75, coordinator: "Tom\xE1\u0161 B." }
];
var firewallRules = [
  { id: "FW-001", name: "Block non-whitelist IP", enabled: true, action: "deny", source: "0.0.0.0/0 (except whitelist)", port: "443" },
  { id: "FW-002", name: "Rate limit API", enabled: true, action: "limit", source: "all", port: "8787", limit: "100/min" },
  { id: "FW-003", name: "Block brute-force login", enabled: true, action: "deny", source: "auto-detected", port: "443" },
  { id: "FW-004", name: "AI Sandbox isolation", enabled: false, action: "isolate", source: "AI Core", port: "internal" }
];
var accessLevels = [
  { id: "L0", name: "Super-Admin", users: 1, permissions: "full", description: "Pln\xFD pr\xEDstup \u2014 Jakub Sabo" },
  { id: "L1", name: "Dispe\u010Der", users: 2, permissions: "read-write ops", description: "Operat\xEDvne riadenie" },
  { id: "L2", name: "Vodi\u010D/Skladn\xEDk", users: 31, permissions: "read assigned", description: "Vlastn\xE9 \xFAlohy a vozidl\xE1" },
  { id: "L3", name: "AI Core", users: 1, permissions: "sandbox", description: "Obmedzen\xE9 povolenia" }
];
var integrations = [
  { id: "cloudflare", name: "Cloudflare", icon: "\u2601\uFE0F", status: "connected", detail: "DNS + Workers + WAF", domain: "auru.space" },
  { id: "github", name: "GitHub", icon: "\u{1F419}", status: "connected", detail: "Repo management + CI/CD", repos: ["Trinity", "USC", "Tenebris", "Auru_trinity_butcher"] },
  { id: "firebase", name: "Firebase", icon: "\u{1F525}", status: "disconnected", detail: "Datab\xE1za + Auth", project: "\u2014" },
  { id: "gemini", name: "Google AI Studio", icon: "\u2728", status: "connected", detail: "Gemini \u2014 AI Core engine", model: "gemini-flash-latest" },
  { id: "dominatron", name: "Dominatron", icon: "\u{1F310}", status: "disconnected", detail: "Spr\xE1va dom\xE9n", domains: "\u2014" }
];
var aiPermissions = [
  { id: "ai-read", name: "\u010C\xEDta\u0165 d\xE1ta", enabled: true, scope: "all pillars" },
  { id: "ai-write", name: "Zapisova\u0165 d\xE1ta", enabled: false, scope: "sandbox only" },
  { id: "ai-codegen", name: "Generova\u0165 k\xF3d", enabled: true, scope: "TRINITY modules" },
  { id: "ai-web", name: "Tvorba webu", enabled: true, scope: "static sites" },
  { id: "ai-social", name: "Soci\xE1lne siete", enabled: false, scope: "requires approval" },
  { id: "ai-delete", name: "Maza\u0165 s\xFAbory", enabled: false, scope: "requires approval" }
];
var aiBehaviorLog = [];

// src/routes/auth.js
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });
}
__name(json, "json");
function genToken() {
  return "tok_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
__name(genToken, "genToken");
async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/auth", "");
  if (path === "/login" && request.method === "POST") {
    const body = await request.json();
    const { password, twofa } = body;
    if (password !== ADMIN.password) {
      loginHistory.unshift({
        time: (/* @__PURE__ */ new Date()).toISOString(),
        ip: request.headers.get("cf-connecting-ip") || "unknown",
        success: false,
        reason: "wrong password"
      });
      logAudit("LOGIN_FAILED", "unknown", "Nespr\xE1vne heslo");
      return json({ error: "Nespr\xE1vne heslo" }, 401);
    }
    if (twofa !== ADMIN.twofaCode) {
      loginHistory.unshift({
        time: (/* @__PURE__ */ new Date()).toISOString(),
        ip: request.headers.get("cf-connecting-ip") || "unknown",
        success: false,
        reason: "wrong 2FA"
      });
      logAudit("LOGIN_FAILED", ADMIN.username, "Nespr\xE1vny 2FA k\xF3d");
      return json({ error: "Nespr\xE1vny 2FA k\xF3d" }, 401);
    }
    const token = genToken();
    sessions.set(token, { user: ADMIN.username, role: ADMIN.role, createdAt: Date.now() });
    loginHistory.unshift({
      time: (/* @__PURE__ */ new Date()).toISOString(),
      ip: request.headers.get("cf-connecting-ip") || "unknown",
      success: true,
      reason: "OK"
    });
    logAudit("LOGIN_SUCCESS", ADMIN.username, "Super-admin prihl\xE1sen\xFD");
    return json({ token, user: ADMIN.username, role: ADMIN.role });
  }
  if (path === "/session" && request.method === "GET") {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const session = sessions.get(token);
    if (!session)
      return json({ valid: false }, 401);
    return json({ valid: true, user: session.user, role: session.role });
  }
  if (path === "/logout" && request.method === "POST") {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    sessions.delete(token);
    logAudit("LOGOUT", ADMIN.username);
    return json({ ok: true });
  }
  return json({ error: "Endpoint not found" }, 404);
}
__name(handleAuth, "handleAuth");
function requireAuth(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const session = sessions.get(token);
  return session || null;
}
__name(requireAuth, "requireAuth");

// src/routes/pillars.js
function json2(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}
__name(json2, "json");
async function handlePillars(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const id = parts[3];
  if (!id && request.method === "GET") {
    return json2({ pillars });
  }
  if (id && request.method === "GET") {
    const pillar = pillars.find((p) => p.id === id);
    if (!pillar)
      return json2({ error: "Pillar not found" }, 404);
    let detail = { ...pillar };
    if (id === "rentacar")
      detail.vehicles = vehicles;
    if (id === "personnel")
      detail.workers = workers;
    if (id === "logistics")
      detail.shipments = shipments;
    if (id === "solidarity")
      detail.projects = solidarityProjects;
    if (id === "trinity")
      detail.subPillars = pillars.filter((p) => p.id !== "trinity").map((p) => ({ id: p.id, name: p.name, status: p.status }));
    return json2({ pillar: detail });
  }
  if (id && request.method === "PATCH") {
    const pillar = pillars.find((p) => p.id === id);
    if (!pillar)
      return json2({ error: "Pillar not found" }, 404);
    const body = await request.json();
    if (body.status) {
      pillar.status = body.status;
      logAudit(`PILLAR_UPDATE`, "super-admin", `${pillar.name} \u2192 ${body.status}`);
    }
    return json2({ pillar });
  }
  return json2({ error: "Endpoint not found" }, 404);
}
__name(handlePillars, "handlePillars");

// src/routes/security.js
function json3(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}
__name(json3, "json");
async function handleSecurity(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const section = parts[3];
  const id = parts[4];
  if (section === "audit" && request.method === "GET") {
    return json3({ logs: auditLog.slice(0, 50) });
  }
  if (section === "firewall" && !id && request.method === "GET") {
    return json3({ rules: firewallRules });
  }
  if (section === "firewall" && id && request.method === "PATCH") {
    const rule = firewallRules.find((r) => r.id === id);
    if (!rule)
      return json3({ error: "Rule not found" }, 404);
    const body = await request.json();
    if (typeof body.enabled === "boolean") {
      rule.enabled = body.enabled;
      logAudit("FIREWALL_TOGGLE", "super-admin", `${rule.name} \u2192 ${body.enabled ? "ON" : "OFF"}`);
    }
    return json3({ rule });
  }
  if (section === "access" && request.method === "GET") {
    return json3({ levels: accessLevels });
  }
  if (section === "logins" && request.method === "GET") {
    return json3({ history: loginHistory.slice(0, 50) });
  }
  return json3({ error: "Endpoint not found" }, 404);
}
__name(handleSecurity, "handleSecurity");

// src/routes/integrations.js
function json4(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}
__name(json4, "json");
async function handleIntegrations(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const id = parts[3];
  if (!id && request.method === "GET") {
    return json4({ integrations });
  }
  if (id && request.method === "PATCH") {
    const integ = integrations.find((i) => i.id === id);
    if (!integ)
      return json4({ error: "Integration not found" }, 404);
    const body = await request.json();
    if (body.status) {
      integ.status = body.status;
      logAudit("INTEGRATION_TOGGLE", "super-admin", `${integ.name} \u2192 ${body.status}`);
    }
    return json4({ integration: integ });
  }
  return json4({ error: "Endpoint not found" }, 404);
}
__name(handleIntegrations, "handleIntegrations");

// src/routes/ai.js
function json5(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}
__name(json5, "json");
async function handleAI(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const section = parts[3];
  const id = parts[4];
  if (section === "permissions" && !id && request.method === "GET") {
    return json5({ permissions: aiPermissions });
  }
  if (section === "permissions" && id && request.method === "PATCH") {
    const perm = aiPermissions.find((p) => p.id === id);
    if (!perm)
      return json5({ error: "Permission not found" }, 404);
    const body = await request.json();
    if (typeof body.enabled === "boolean") {
      perm.enabled = body.enabled;
      logAudit("AI_PERMISSION_TOGGLE", "super-admin", `${perm.name} \u2192 ${body.enabled ? "ON" : "OFF"}`);
    }
    return json5({ permission: perm });
  }
  if (section === "behavior" && request.method === "GET") {
    return json5({ logs: aiBehaviorLog.slice(0, 50) });
  }
  if (section === "command" && request.method === "POST") {
    const body = await request.json();
    const command = body.command || "";
    aiBehaviorLog.unshift({
      time: (/* @__PURE__ */ new Date()).toISOString(),
      command,
      response: "processing"
    });
    let response;
    let engine = "simulated";
    const apiKey = env?.gemini || env?.GEMINI || env?.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Si TRINITY AI Core \u2014 centr\xE1lna auton\xF3mna inteligencia pre Underground Street Collective. Si super-admin asistent. Odpovedaj stru\u010Dne, profesion\xE1lne, v sloven\u010Dine. Pr\xEDkaz od super-admina: ${command}` }] }]
            })
          }
        );
        const geminiData = await geminiRes.json();
        if (geminiData.error) {
          response = simulateResponse(command) + "\n\n[Note: Gemini je moment\xE1lne nedostupn\xFD (" + geminiData.error.message + "). Sp\xFA\u0161\u0165am simulovan\xFD re\u017Eim.]";
          engine = "gemini-fallback";
        } else {
          response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Bez odpovede.";
          engine = "gemini";
        }
      } catch (e) {
        response = simulateResponse(command) + "\n\n[Gemini nedostupn\xFD: " + e.message + "]";
        engine = "gemini-fallback";
      }
    } else {
      response = simulateResponse(command);
    }
    aiBehaviorLog[0].response = response;
    logAudit("AI_COMMAND", "super-admin", command.slice(0, 80));
    return json5({ command, response, engine });
  }
  return json5({ error: "Endpoint not found" }, 404);
}
__name(handleAI, "handleAI");
function simulateResponse(command) {
  const c = command.toLowerCase();
  if (c.includes("web") || c.includes("str\xE1nk"))
    return "Web pripraven\xFD \u2014 \u0161abl\xF3na vygenerovan\xE1 v AI Studiu. M\xF4\u017Ee\u0161 upravi\u0165 obsah a \u0161t\xFDl.";
  if (c.includes("stav") || c.includes("status"))
    return "Syst\xE9m TRINITY: 4 piliere ONLINE, 2 STANDBY. \u017Diadne kritick\xE9 incidenty. CI: 2 zlyhania v repozit\xE1roch (Trinity, USC).";
  if (c.includes("voz") || c.includes("car"))
    return "Flotila Rent-a-Car: 18 vozidiel, 12 akt\xEDvnych, 4 rezervovan\xE9, 2 v servise.";
  if (c.includes("logist"))
    return "Logistika: 42 z\xE1sielok, 15 v preprave, 4 sklady akt\xEDvne, 1280 polo\u017Eiek na sklade.";
  return `Pr\xEDkaz prijat\xFD: "${command}". TRINITY AI Core analyzuje a pripravuje ak\u010Dn\xFD pl\xE1n. (Simulovan\xFD re\u017Eim \u2014 pre re\xE1lne AI odpovede pripoj Gemini k\u013E\xFA\u010D.)`;
}
__name(simulateResponse, "simulateResponse");

// src/modules/shop.js
var StreetWearShop = class {
  constructor(env) {
    this.env = env;
    this.collections = {
      products: "usw_products",
      inventory: "usw_inventory",
      drops: "usw_drops",
      orders: "usw_orders"
    };
  }
  /**
   * List all products
   */
  async getProducts(filters = {}) {
    return {
      products: [
        {
          id: "USW-TEE-001",
          name: "369 TENEBRIS TEE",
          size: ["XS", "S", "M", "L", "XL", "XXL"],
          price: 29.99,
          stock: 150,
          category: "T-Shirts",
          image: "https://auru.space/img/tee-001.jpg",
          dropDate: "2026-09-10"
        },
        {
          id: "USW-HOODIE-001",
          name: "UNDERGROUND HOODIE",
          size: ["S", "M", "L", "XL", "XXL"],
          price: 69.99,
          stock: 45,
          category: "Hoodies",
          image: "https://auru.space/img/hoodie-001.jpg",
          dropDate: "2026-09-10"
        },
        {
          id: "USW-CAP-001",
          name: "USC FITTED CAP",
          size: ["One Size", "Adjustable"],
          price: 19.99,
          stock: 200,
          category: "Hats",
          image: "https://auru.space/img/cap-001.jpg",
          dropDate: "2026-09-07"
        }
      ],
      total: 3,
      filters
    };
  }
  /**
   * Get single product details
   */
  async getProduct(productId) {
    const products = await this.getProducts();
    const product = products.products.find((p) => p.id === productId);
    if (!product) {
      return { error: "Product not found" };
    }
    return {
      ...product,
      description: "Limited edition streetwear for USC Community",
      material: "100% organic cotton",
      colors: ["Black", "White", "Olive"],
      reviews: [
        { rating: 5, comment: "Dope quality, fast shipping" },
        { rating: 5, comment: "Perfect fit" }
      ]
    };
  }
  /**
   * Create new product drop
   */
  async createDrop(dropData) {
    const dropId = `DROP-${Date.now()}`;
    return {
      status: "created",
      dropId,
      name: dropData.name,
      items: dropData.items || [],
      releaseTime: dropData.releaseTime || (/* @__PURE__ */ new Date()).toISOString(),
      quantity: dropData.quantity || "Limited",
      status: "SCHEDULED"
    };
  }
  /**
   * Update inventory
   */
  async updateInventory(productId, quantity, action = "add") {
    const result = action === "add" ? quantity : -quantity;
    return {
      status: "updated",
      productId,
      change: result,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Place order
   */
  async createOrder(orderData) {
    const orderId = `ORD-${Date.now()}`;
    return {
      status: "created",
      orderId,
      items: orderData.items,
      customer: orderData.customer,
      total: this.calculateTotal(orderData.items),
      paymentStatus: "PENDING",
      shippingStatus: "PROCESSING",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
};
__name(StreetWearShop, "StreetWearShop");
var shop_default = StreetWearShop;

// src/routes/api-shop.js
async function handleShop(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const action = parts[3];
  const id = parts[4];
  const shop = new shop_default(env);
  try {
    if (action === "products" && !id && request.method === "GET") {
      const products = await shop.getProducts();
      return new Response(JSON.stringify(products), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (action === "products" && id && request.method === "GET") {
      const product = await shop.getProduct(id);
      return new Response(JSON.stringify(product), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (action === "orders" && request.method === "POST") {
      const orderData = await request.json();
      const order = await shop.createOrder(orderData);
      return new Response(JSON.stringify(order), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(handleShop, "handleShop");

// src/frontend/app.js
var HTML = `<!DOCTYPE html>
<html lang="sk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TRINITY // USC Admin Dashboard</title>
<script src="https://cdn.tailwindcss.com"><\/script>
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
        <div class="text-xs text-gray-500 mb-1 tracking-widest">PRIHL\xC1SENIE SUPER-ADMINA</div>
        <div class="space-y-4 mt-4">
          <div>
            <label class="text-xs text-gray-600 block mb-1">HESLO</label>
            <input id="login-pass" type="password" class="input" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autofocus>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">2FA K\xD3D</label>
            <input id="login-2fa" type="text" class="input" placeholder="6-miestny k\xF3d" maxlength="6">
          </div>
          <div id="login-error" class="text-xs text-red-500 hidden"></div>
          <button id="login-btn" class="btn-neon w-full py-3 uppercase">Vst\xFApi\u0165 do TRINITY</button>
        </div>
        <div class="mt-6 pt-6 border-t border-gray-800 text-xs text-gray-600">
          <div>Demo pr\xEDstup:</div>
          <div class="text-gray-500 mt-1">Heslo: <span class="neon">tenebris369</span> \xB7 2FA: <span class="neon">369369</span></div>
        </div>
      </div>
      <div class="text-center mt-6 text-xs text-gray-700 tracking-widest">\u017DIADNE RE\u010CI. \u010CIST\xDD HUSTLE.</div>
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
      btn.textContent = 'Vst\xFApi\u0165 do TRINITY'; btn.disabled = false;
    }
  };
  btn.onclick = doLogin;
  document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-2fa').focus(); });
  document.getElementById('login-2fa').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
}

// --- Shell (sidebar + content) ---
function renderShell(app, view, param) {
  const nav = [
    { id: 'dashboard', icon: '\u25C8', label: 'Hlavn\xFD panel' },
    { id: 'pillars', icon: '\u229E', label: 'Piliere' },
    { id: 'security', icon: '\u26E8', label: 'Bezpe\u010Dnos\u0165' },
    { id: 'integrations', icon: '\u29C9', label: 'Integr\xE1cie' },
    { id: 'ai', icon: '\u2726', label: 'AI Core' },
    { id: 'shop', icon: '\u2317', label: 'USW Shop' },
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
        <div class="text-gray-500">Prihl\xE1sen\xFD:</div>
        <div class="neon font-bold mt-1">\${currentUser || 'admin'}</div>
        <button onclick="logout()" class="btn-ghost w-full mt-3 uppercase text-[10px]">Odhl\xE1si\u0165</button>
      </div>
    </aside>
    <!-- Content -->
    <main class="flex-1 overflow-y-auto" style="min-height:100vh">
      <div id="content" class="p-6 md:p-8 fade-in"></div>
    </main>
  </div>\`;

  const content = document.getElementById('content');
  const views = { dashboard: renderDashboard, pillars: renderPillars, security: renderSecurity, integrations: renderIntegrations, ai: renderAI, shop: renderShop };
  (views[view] || renderDashboard)(content, param);
}

// --- Dashboard View ---
async function renderDashboard(c) {
  c.innerHTML = \`<div class="flex items-center justify-between mb-8">
    <div><h1 class="text-3xl font-black neon uppercase">Hlavn\xFD panel</h1><div class="text-xs text-gray-600 tracking-widest mt-1">PREH\u013DAD EKOSYST\xC9MU TRINITY</div></div>
    <div class="text-xs text-gray-600">FREQ: <span class="neon">369</span> \xB7 \${new Date().toLocaleString('sk-SK')}</div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6" id="pillar-cards"></div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="panel p-5"><h2 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">\u26A0 Upozornenia</h2><div id="alerts" class="space-y-2"></div></div>
    <div class="panel p-5"><h2 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">\u{1F4DF} Syst\xE9mov\xE9 logy</h2><div id="syslogs" class="terminal"></div></div>
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
      <div class="text-[10px] text-gray-600 mt-1">\${Object.entries(p.stats).map(([k,v])=>k+': '+v).join(' \xB7 ')}</div>
    </div>\`).join('');

  const alerts = [
    { sev:'warning', msg:'CI zlyhanie: Trinity repo (Node.js 22.x)', time:'03.09' },
    { sev:'warning', msg:'CI zlyhanie: USC repo (ch\xFDba lock file)', time:'03.09' },
    { sev:'info', msg:'LOG-044 doru\u010Den\xE9: BA \u2192 Viede\u0148', time:'05.09' },
    { sev:'info', msg:'Synchroniz\xE1cia pilierov dokon\u010Den\xE1', time:'06.09' },
  ];
  document.getElementById('alerts').innerHTML = alerts.map(a => \`
    <div class="flex items-start gap-3 text-xs p-2 hover:bg-gray-900">
      <span class="\${a.sev==='warning'?'text-yellow-500':'text-gray-500'}">\${a.sev==='warning'?'\u25B2':'\u25CF'}</span>
      <span class="flex-1 text-gray-400">\${a.msg}</span><span class="text-gray-700">\${a.time}</span>
    </div>\`).join('');

  const logs = [
    {l:'info',m:'TRINITY Core inicializovan\xFD'},
    {l:'info',m:'Pripojen\xE9: Cloudflare, GitHub, Gemini'},
    {l:'warn',m:'Firebase: nepripojen\xE9'},
    {l:'info',m:'Synchroniz\xE1cia: 4 ONLINE, 2 STANDBY'},
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
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">Piliere</h1><div class="text-xs text-gray-600 tracking-widest mt-1">\u0160ES\u0164 FUNK\u010CN\xDDCH OBLAST\xCD TRINITY</div></div>
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
  if (!p) { c.innerHTML = '<div class="text-gray-600">Pilier nen\xE1jden\xFD</div>'; return; }
  let extra = '';
  if (p.vehicles) extra = renderTable(p.vehicles, ['id','model','plate','status','driver']);
  if (p.workers) extra = renderTable(p.workers, ['id','name','role','status','contract']);
  if (p.shipments) extra = renderTable(p.shipments, ['id','from','to','status','vehicle','eta']);
  if (p.projects) extra = renderTable(p.projects, ['id','name','status','beneficiaries','coordinator']);
  if (p.subPillars) extra = p.subPillars.map(s => \`<div class="flex justify-between text-xs p-2 border-b border-gray-800"><span>\${s.name}</span><span class="badge badge-\${s.status.toLowerCase()}">\${s.status}</span></div>\`).join('');

  c.innerHTML = \`
  <div class="mb-6 flex items-center gap-4">
    <button onclick="location.hash='#/pillars'" class="btn-ghost">\u2190 Sp\xE4\u0165</button>
    <div><h1 class="text-2xl font-black neon uppercase">\${p.icon} \${p.name}</h1><div class="text-xs text-gray-600 mt-1">\${p.description}</div></div>
  </div>
  <div class="flex items-center gap-3 mb-6">
    <span class="badge badge-\${p.status.toLowerCase()}">\${p.status}</span>
    <button id="toggle-status" class="btn-neon text-xs">\${p.status==='ONLINE'?'Deaktivova\u0165':'Aktivova\u0165'}</button>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
    \${Object.entries(p.stats).map(([k,v]) => \`<div class="panel p-4"><div class="text-[10px] text-gray-600 uppercase tracking-widest">\${k}</div><div class="text-2xl font-black neon mt-1">\${v}</div></div>\`).join('')}
  </div>
  <div class="panel p-5 mb-6"><h3 class="text-sm font-bold neon uppercase mb-3 border-b border-gray-800 pb-2">Funkcie</h3><ul class="space-y-2">\${p.functions.map(f => \`<li class="text-xs text-gray-400 flex items-center gap-2"><span class="neon">\u25B8</span> \${f}</li>\`).join('')}</ul></div>
  \${extra ? \`<div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-3 border-b border-gray-800 pb-2">D\xE1ta</h3>\${extra}</div>\` : ''}
  \`;

  document.getElementById('toggle-status').onclick = async (e) => {
    const newStatus = p.status === 'ONLINE' ? 'STANDBY' : 'ONLINE';
    await api('/api/pillars/' + id, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
    renderPillarDetail(c, id);
  };
}

function renderTable(items, cols) {
  if (!items || !items.length) return '<div class="text-xs text-gray-600">\u017Diadne d\xE1ta</div>';
  return \`<table><thead><tr>\${cols.map(c => \`<th>\${c}</th>\`).join('')}</tr></thead><tbody>
    \${items.map(item => \`<tr>\${cols.map(col => \`<td>\${typeof item[col]==='object'?JSON.stringify(item[col]):item[col]??'\u2014'}</td>\`).join('')}</tr>\`).join('')}
  </tbody></table>\`;
}

// --- Security View ---
async function renderSecurity(c) {
  const [{ data: fw }, { data: audit }, { data: access }, { data: logins }] = await Promise.all([
    api('/api/security/firewall'), api('/api/security/audit'), api('/api/security/access'), api('/api/security/logins')
  ]);
  c.innerHTML = \`
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">Bezpe\u010Dnos\u0165</h1><div class="text-xs text-gray-600 tracking-widest mt-1">FIREWALL \xB7 PR\xCDSTUP \xB7 AUDIT</div></div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Firewall pravidl\xE1</h3>
      <div class="space-y-3" id="fw-rules">\${(fw?.rules||[]).map(r => \`
      <div class="flex items-center justify-between p-2 hover:bg-gray-900">
        <div><div class="text-xs font-bold text-gray-300">\${r.name}</div><div class="text-[10px] text-gray-600">\${r.action} \xB7 \${r.source} \xB7 :\${r.port}</div></div>
        <div class="toggle \${r.enabled?'on':''}" onclick="toggleFW('\${r.id}')"></div>
      </div>\`).join('')}</div>
    </div>
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Pr\xEDstupov\xE9 \xFArovne</h3>
      <table><thead><tr><th>\xDArove\u0148</th><th>N\xE1zov</th><th>Pou\u017E\xEDvatelia</th><th>Povolenia</th></tr></thead><tbody>
      \${(access?.levels||[]).map(l => \`<tr><td class="neon font-bold">\${l.id}</td><td>\${l.name}</td><td>\${l.users}</td><td class="text-gray-500">\${l.permissions}</td></tr>\`).join('')}
      </tbody></table>
    </div>
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Audit logy</h3>
      <div class="terminal" style="max-height:260px">\${(audit?.logs||[]).map(l => \`<div><span class="text-gray-600">[\${l.timestamp.slice(11,19)}]</span> <span class="\${l.severity==='warning'?'text-yellow-500':'text-gray-500'}">\${l.action}</span> <span class="text-gray-400">\${l.detail}</span></div>\`).join('') || '<div class="text-gray-600">\u017Diadne z\xE1znamy</div>'}</div>
    </div>
    <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Hist\xF3ria prihl\xE1sen\xED</h3>
      <table><thead><tr><th>\u010Cas</th><th>IP</th><th>V\xFDsledok</th><th>D\xF4vod</th></tr></thead><tbody>
      \${(logins?.history||[]).map(l => \`<tr><td class="text-gray-500">\${l.time.slice(11,19)}</td><td>\${l.ip}</td><td class="\${l.success?'text-green-500':'text-red-500'}">\${l.success?'OK':'FAIL'}</td><td class="text-gray-500">\${l.reason}</td></tr>\`).join('') || '<tr><td colspan="4" class="text-gray-600 text-center py-4">\u017Diadne prihl\xE1senia</td></tr>'}
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
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">Integr\xE1cie</h1><div class="text-xs text-gray-600 tracking-widest mt-1">EXTERN\xC9 SYST\xC9MY A KONEKTORY</div></div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="int-cards">
    \${ints.map(i => \`
    <div class="panel panel-hover p-5">
      <div class="flex items-start justify-between mb-3"><div class="text-3xl">\${i.icon}</div><span class="badge badge-\${i.status}">\${i.status}</span></div>
      <h3 class="font-bold text-gray-200 text-sm">\${i.name}</h3>
      <p class="text-xs text-gray-600 mt-1">\${i.detail}</p>
      \${i.domain?\`<div class="text-[10px] text-gray-700 mt-2">Domena: \${i.domain}</div>\`:''}
      \${i.repos?\`<div class="text-[10px] text-gray-700 mt-2">Repos: \${i.repos.join(', ')}</div>\`:''}
      \${i.model?\`<div class="text-[10px] text-gray-700 mt-2">Model: \${i.model}</div>\`:''}
      <button onclick="toggleInt('\${i.id}')" class="\${i.status==='connected'?'btn-ghost':'btn-neon'} w-full mt-4 text-xs uppercase">\${i.status==='connected'?'Odpoji\u0165':'Pripoji\u0165'}</button>
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
  const [{ data: perms }, { data: behavior }] = await Promise.all([
    api('/api/ai/permissions'), api('/api/ai/behavior')
  ]);
  c.innerHTML = \`
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">\u2726 TRINITY AI Core</h1><div class="text-xs text-gray-600 tracking-widest mt-1">CENTR\xC1LNA AUTON\xD3MNA INTELIGENCIA</div></div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="panel p-5">
      <h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Pr\xEDkazov\xFD panel</h3>
      <textarea id="ai-cmd" class="input mb-3" rows="3" placeholder="Zadaj pr\xEDkaz pre AI Core..."></textarea>
      <button id="ai-send" class="btn-neon w-full uppercase">Vykonaj pr\xEDkaz</button>
      <div id="ai-response" class="terminal mt-4" style="min-height:120px"><div class="text-gray-600">\u010Cak\xE1m na pr\xEDkaz od super-admina...</div></div>
    </div>
    <div class="space-y-6">
      <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Povolenia a obmedzenia</h3>
        <div class="space-y-3" id="ai-perms">\${(perms?.permissions||[]).map(p => \`
        <div class="flex items-center justify-between p-2 hover:bg-gray-900">
          <div><div class="text-xs font-bold text-gray-300">\${p.name}</div><div class="text-[10px] text-gray-600">\${p.scope}</div></div>
          <div class="toggle \${p.enabled?'on':''}" onclick="togglePerm('\${p.id}')"></div>
        </div>\`).join('')}</div>
      </div>
      <div class="panel p-5"><h3 class="text-sm font-bold neon uppercase mb-4 border-b border-gray-800 pb-2">Monitoring spr\xE1vania</h3>
        <div class="terminal" style="max-height:200px">\${(behavior?.logs||[]).map(l => \`<div><span class="text-gray-600">[\${l.time.slice(11,19)}]</span> <span class="text-gray-400">\${l.command}</span> \u2192 <span class="neon">\${(l.response||'').slice(0,60)}</span></div>\`).join('') || '<div class="text-gray-600">\u017Diadna aktivita</div>'}</div>
      </div>
    </div>
  </div>\`;

  document.getElementById('ai-send').onclick = async () => {
    const cmd = document.getElementById('ai-cmd').value.trim();
    if (!cmd) return;
    const box = document.getElementById('ai-response');
    box.innerHTML = '<div class="text-yellow-500">Sprac\xFAvam pr\xEDkaz...<span class="blink">_</span></div>';
    const { ok, data } = await api('/api/ai/command', { method: 'POST', body: JSON.stringify({ command: cmd }) });
    if (ok) box.innerHTML = \`<div class="text-gray-600">> \${cmd}</div><div class="neon mt-2">\${data.response}</div><div class="text-[10px] text-gray-700 mt-2">Engine: \${data.engine}</div>\`;
    else box.innerHTML = \`<div class="text-red-500">Chyba: \${data.error}</div>\`;
  };
}

window.togglePerm = async (id) => {
  const { data } = await api('/api/ai/permissions');
  const perm = (data?.permissions||[]).find(p => p.id === id);
  await api('/api/ai/permissions/' + id, { method: 'PATCH', body: JSON.stringify({ enabled: !perm.enabled }) });
  renderAI(document.getElementById('content'));
};

// --- Shop View ---
async function renderShop(c) {
  const { data } = await api('/api/shop/products');
  const products = data?.products || [];
  c.innerHTML = \`
  <div class="mb-8"><h1 class="text-3xl font-black neon uppercase">USW Streetwear</h1><div class="text-xs text-gray-600 tracking-widest mt-1">DROPOVANIE POUULI\u010CN\xC9HO OBLE\u010CENIA</div></div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    \${products.map(p => \`
    <div class="panel panel-hover p-5">
      <div class="flex justify-between mb-2"><span class="badge badge-online">STOCK: \${p.stock}</span><span class="text-[10px] text-gray-600">DROP: \${p.dropDate}</span></div>
      <h3 class="font-bold text-gray-200">\${p.name}</h3>
      <div class="text-xs text-gray-600 mt-1">\${p.category} \xB7 \${p.size.join('/')}</div>
      <div class="text-2xl font-black neon mt-3">\u20AC\${p.price}</div>
    </div>\`).join('')}
  </div>\`;
}

render();
<\/script>
</body>
</html>`;

// src/index.js
function json6(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}
__name(json6, "json");
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/" || path === "/index.html") {
      return new Response(HTML, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }
    if (path === "/api/status") {
      return json6({ status: "ONLINE", system: "TENEBRIS CORE", frequency: "369", message: "Ulica nikdy nesp\xED." });
    }
    if (path.startsWith("/api/auth"))
      return handleAuth(request, env);
    if (path.startsWith("/api/pillars") || path.startsWith("/api/security") || path.startsWith("/api/integrations") || path.startsWith("/api/ai")) {
      const session = requireAuth(request);
      if (!session)
        return json6({ error: "Neautorizovan\xFD pr\xEDstup" }, 401);
    }
    if (path.startsWith("/api/pillars"))
      return handlePillars(request, env);
    if (path.startsWith("/api/security"))
      return handleSecurity(request, env);
    if (path.startsWith("/api/integrations"))
      return handleIntegrations(request, env);
    if (path.startsWith("/api/ai"))
      return handleAI(request, env);
    if (path.startsWith("/api/shop"))
      return handleShop(request, env);
    return json6({ error: "Endpoint not found" }, 404);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-MbVgeb/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-MbVgeb/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
