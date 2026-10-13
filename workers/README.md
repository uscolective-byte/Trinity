# Trinity worker-to-worker delegation (proposal)

This module gives each existing Trinity Worker the ability to request a bounded, **read-only** helper. It DOES NOT create a new Cloudflare Worker automatically, deploy code, connect to the Cloudflare API, or modify an active production environment.

## Components

- `shared/delegation.mjs` — reusable client; validate task and delegate through `env.TRINITY_DISPATCHER.fetch`
- `dispatcher/src/index.mjs` — named-capability router for pre-configured service bindings
- `shared/delegated-handler.mjs` — authentication and validation adapter to install inside each helper
- `../src/routes/workers.js` — authenticated dashboard API (`/api/workers/capabilities` and `POST /api/workers/help`)

Supported roles: `coding`, `browser`, `research`, `memory`, `model`, `tools`. Roles are allowlisted; unknown roles and arbitrary URLs are rejected.

## Integration sequence — do not skip steps

1. Identify actual Cloudflare deployed service names and each Worker's existing source. **This repo only contains the Tenebris/Trinity dashboard Worker.** No production fleet changes have been applied.
2. Add the dispatcher as an internal service (its config has `workers_dev = false`). Store the same strong `TRINITY_DELEGATION_SECRET` as an encrypted secret in the dispatcher, callers and participating helpers. Never place it in `[vars]`, Git, frontend code or client HTTP.
3. Configure a **service binding** in every calling Worker's own Wrangler config:
   ```toml
   [[services]]
   binding = "TRINITY_DISPATCHER"
   service = "trinity-dispatcher"
   ```
   Also configure real downstream helpers in `dispatcher/wrangler.toml` using the supported role binding names (e.g. `RESEARCH_HELPER`) after verifying those Workers exist.
4. In each participating helper, integrate the `createDelegatedTaskHandler(capability, runReadOnly)` adapter into its server-side `fetch` router. The callback must implement actual domain logic with its existing tools and permissions, not grant new permissions.
5. In a calling Worker, use:
   ```js
   import { requestWorkerHelp } from './path-to/shared/delegation.mjs';
   const result = await requestWorkerHelp(env, {
     capability: 'research',
     mode: 'read',
     task: { instruction: 'Summarize public data' },
     depth: 0,
   });
   ```
6. Test the binding and adapters in staging, then review before enabling in production.

## Safety constraints

- All mutations, code execution, social posting, deployments, creation/deletion of Cloudflare services and secret changes are **denied** by this delegation path and require a separate admin-approved execution workflow.
- No automatic child Worker provisioning. Missing role binding returns HTTP 202 with `helper_not_configured`, which is a **proposal/diagnostic**, not a job queued or a new service created.
- Two-hop ceiling; bounded payloads (8 KiB), 8–10 second timeouts, fixed allowlisted roles and no arbitrary destinations.
- The `requestId` is for tracing only. Durable idempotency, persistence, retries, rate limiting, workload metering, RBAC and queues must be integrated before high-volume or side-effecting workloads.
- Cloudflare service bindings are internal Worker-to-Worker `fetch()` calls; they do not provision Worker services on their own.
- The existing dashboard has a demo/in-memory authentication implementation and must be hardened separately before treating it as a secure production admin interface.

## Verify

Node 22+: `node --test tests/delegation.test.mjs`

No files on the primary `main` branch or on deployed Cloudflare services are modified by this feature branch.
