# Base44 Dev Environment

## What this is
A Cloudflare Workers app ("TENEBRIS CORE" / Underground Street Collective). Now built out as the **TRINITY Admin Dashboard** — a full SPA with super-admin login, 6-pillar management, security, integrations, and AI Core.

## Architecture
- `src/index.js` — main router: serves frontend HTML + routes all `/api/*` endpoints
- `src/frontend/app.js` — exports the SPA HTML (vanilla JS, hash-based routing, Tailwind via CDN)
- `src/data/store.js` — in-memory data store with seed data for all pillars, security, integrations, AI (ES module exports)
- `src/routes/auth.js` — login/session/logout, `requireAuth` middleware
- `src/routes/pillars.js` — list/detail/toggle 6 pillars (with vehicles, workers, shipments, projects)
- `src/routes/security.js` — firewall rules, access levels, audit log, login history
- `src/routes/integrations.js` — connect/disconnect integrations
- `src/routes/ai.js` — AI Core: Gemini-powered command panel + permissions + behavior log
- `src/routes/api-shop.js` — existing USW streetwear shop (unchanged)

## How it runs here
- `docker-compose.base44.yml` runs `npx wrangler dev` (local mode, no Cloudflare login needed) on `node:22` with repo bind-mounted.
- Wrangler dev listens on `0.0.0.0:8787`, mapped to host port **3000**.
- The `gemini` secret (from `/run/base44/app.env`) is written to `.dev.vars` at container startup so wrangler passes it to the worker as `env.gemini`.

## Secrets
- `gemini` — Google AI Studio API key for the AI Core command panel. The AI handler uses model `gemini-flash-latest` and gracefully falls back to simulated responses when Gemini is unavailable/overloaded.

## Demo login
- Password: `tenebris369` · 2FA: `369369`

## Verify it works
- `curl -sf http://localhost:3000/` → HTML dashboard (login screen)
- `curl -sf -X POST http://localhost:3000/api/auth/login -H 'content-type: application/json' -d '{"password":"tenebris369","twofa":"369369"}'` → session token
- Protected routes return 401 without a valid Bearer token
- External-host check: `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/`

## Notes
- `compatibility_date` in `wrangler.toml` is set to the future (2026-08-31); local runtime falls back to 2025-07-18 with a warning. Harmless.
- In-memory store persists across requests within the wrangler dev process (not across restarts). Seed data resets on restart.
- `src/modules/shop.js` has a duplicate `status` key warning — pre-existing, harmless.
