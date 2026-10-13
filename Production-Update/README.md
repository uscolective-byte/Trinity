# Trinity production update 9.4.3 → 9.4.4

Apply a guarded, narrow web_fetch patch to the current production bundle, rather than replacing the newer deployed core with an old snapshot. The downloaded bundle and private Cloudflare configuration are not stored in this public repository.

Preserves PC tools, scoped MCP authorization, communication changes and UI modules. Adds the Agents SDK 0.28.0 web fetch API, limits each GET to 2 MB / 20 seconds / 3 redirects, returns 6000-character windows and records untrusted source provenance in D1. No database migration.

Run `node apply.mjs CURRENT_INDEX.js patched.js`, copy the current text modules beside it, then bundle patched.js as ESM with Cloudflare and text module imports external. The patch fails if any required anchor is absent or repeated.

Upload as an undeployed version first. Inherit all existing bindings with strict validation; preserve compatibility date/flags, limits and settings. Check the currently deployed version has not changed before deployment. No credentials or account configuration belong in this folder.

Validation: 72 tests on the earlier integration; dedicated web fetch boundary tests; smoke checks against the patched current production bundle; Cloudflare version validation before activation. The embedded existing SDK runtime remains intact; only the new fetch implementation uses Agents 0.28.0.
