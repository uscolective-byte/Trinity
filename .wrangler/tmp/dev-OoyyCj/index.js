var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-j8dHz9/strip-cf-connecting-ip-header.js
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

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/status")) {
      return new Response(JSON.stringify({
        status: "ONLINE",
        system: "TENEBRIS CORE",
        frequency: "369",
        message: "Ulica nikdy nesp\xED."
      }), {
        headers: { "content-type": "application/json" }
      });
    }
    const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TENEBRIS // USC</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <style>
            body { background-color: #050505; color: #d4d4d4; font-family: monospace; }
            .neon-border { border: 1px solid #ccff00; box-shadow: 0 0 12px rgba(204, 255, 0, 0.15); }
            .neon-text { color: #ccff00; text-shadow: 0 0 8px rgba(204,255,0,0.4); }
            .hustle-bg { background-color: #0a0a0a; }
        </style>
    </head>
    <body class="p-4 md:p-8">
        <div class="max-w-5xl mx-auto mt-4">
            <!-- HLAVI\u010CKA -->
            <div class="border-b border-gray-800 pb-4 mb-8">
                <h1 class="text-4xl md:text-5xl font-black neon-text uppercase tracking-tighter">Tenebris Core</h1>
                <p class="mt-2 text-gray-500 tracking-widest text-sm">UNDERGROUND STREET COLLECTIVE // \u017DIADNE RE\u010CI. \u010CIST\xDD HUSTLE.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- PANEL: DIV\xCDZIE -->
                <div class="neon-border p-6 hustle-bg relative">
                    <div class="absolute top-0 right-0 bg-[#ccff00] text-black text-xs font-bold px-2 py-1">LIVE</div>
                    <h2 class="text-xl font-bold neon-text mb-6 uppercase border-b border-gray-800 pb-2">\u2699\uFE0F Akt\xEDvne Div\xEDzie</h2>
                    <ul class="space-y-4 text-sm font-bold tracking-wide text-gray-300">
                        <li class="flex justify-between items-center hover:text-white cursor-pointer transition-colors">
                            <span>> AURA TRINITY [AI DISPE\u010CING]</span> <span class="text-[#ccff00] text-xs">OFFLINE</span>
                        </li>
                        <li class="flex justify-between items-center hover:text-white cursor-pointer transition-colors">
                            <span>> USW STREETWEAR [MERCH]</span> <span class="text-[#ccff00] text-xs">STANDBY</span>
                        </li>
                        <li class="flex justify-between items-center hover:text-white cursor-pointer transition-colors">
                            <span>> RENT A WHEEL [LOGISTIKA]</span> <span class="text-[#ccff00] text-xs">STANDBY</span>
                        </li>
                        <li class="flex justify-between items-center hover:text-white cursor-pointer transition-colors">
                            <span>> USC WORK [MONT\xC1\u017DE DE]</span> <span class="text-[#ccff00] text-xs">STANDBY</span>
                        </li>
                    </ul>
                </div>
                
                <!-- PANEL: TERMIN\xC1L -->
                <div class="neon-border p-6 hustle-bg flex flex-col">
                    <h2 class="text-xl font-bold neon-text mb-4 uppercase">\u{1F4DF} Matrix Termin\xE1l</h2>
                    <div id="log" class="flex-1 bg-black border border-gray-800 p-3 text-xs text-gray-400 overflow-y-auto h-48 mb-4 font-mono">
                        <span class="text-gray-600">--------------------------------</span><br>
                        > Inicializ\xE1cia syst\xE9mu Tenebris...<br>
                        > Prep\xE1jam s auru.space...<br>
                        > \u010Cak\xE1m na pr\xEDkazy od admina Sabo Ivan...<br>
                        <span class="text-gray-600">--------------------------------</span>
                    </div>
                    <button onclick="pingApi()" class="w-full bg-[#ccff00] text-black font-black py-3 uppercase hover:bg-white transition-colors duration-300">
                        Ping Tenebris API [Sk\xFA\u0161ka]
                    </button>
                </div>
            </div>
        </div>

        <script>
            async function pingApi() {
                const log = document.getElementById('log');
                const time = new Date().toLocaleTimeString();
                log.innerHTML += '<br><span class="text-gray-500">['+time+']</span> > Vol\xE1m /api/status...';
                log.scrollTop = log.scrollHeight;
                
                try {
                    const res = await fetch('/api/status');
                    const data = await res.json();
                    log.innerHTML += '<br><span class="text-[#ccff00]">> ODOZVA: ' + JSON.stringify(data) + '</span>';
                } catch(e) {
                    log.innerHTML += '<br><span class="text-red-500">> CHYBA: Syst\xE9m neodpoved\xE1.</span>';
                }
                log.scrollTop = log.scrollHeight;
            }
        <\/script>
    </body>
    </html>
    `;
    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
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

// .wrangler/tmp/bundle-j8dHz9/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-j8dHz9/middleware-loader.entry.ts
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
