# Base44 Dev Environment

## What this is
A Cloudflare Workers app ("TENEBRIS CORE" / Underground Street Collective). Single worker entry point at `src/index.js` serves an HTML dashboard at `/` and a JSON status endpoint at `/api/status`. A streetwear shop module (`src/modules/shop.js`) and shop routes (`src/routes/api-shop.js`) exist but are NOT yet wired into `src/index.js` — they return mock data and are unreachable until routed.

## How it runs here
- `docker-compose.base44.yml` runs `npx wrangler dev` (local mode, no Cloudflare login needed) on a `node:22` image with the repo bind-mounted.
- Wrangler dev listens on `0.0.0.0:8787`, mapped to host port **3000**.
- No external secrets required — all data is hardcoded mock data. The README mentions Firebase/Gemini but nothing is wired into the running code.

## Verify it works
- `curl -sf http://localhost:3000/` → HTML dashboard
- `curl -sf http://localhost:3000/api/status` → `{"status":"ONLINE",...}`
- External-host check: `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` must return the dashboard (wrangler binds 0.0.0.0, no host blocking).

## Notes
- `compatibility_date` in `wrangler.toml` is set to the future (2026-08-31); the local runtime falls back to 2025-07-18 with a warning. Harmless.
- `wrangler` is pinned to v3 in package.json; v4 is available but not required for local dev.
