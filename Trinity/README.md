# Trinity 8.0.1

Validated Cloudflare Worker core: Agents SDK 0.28.0 and Wrangler 4.149.0. Adds bounded web_fetch with D1 provenance.

`npm ci && npm test` builds the Worker and runs 72 tests.

This repository uses a sanitized staging configuration. Supply account IDs, database/KV IDs, bucket names, service bindings and admin allowlists privately before deployment. Do not deploy this template over production. Production configuration remains outside this public repository. No credentials are included.
