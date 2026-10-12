# Trinity Dialogue v3 — Cloudflare staging deployment

## Scope

The GitHub workflow `.github/workflows/cloudflare-staging.yml` is **manual for deployment**. It validates pull requests but can only deploy after selecting `deploy-private` on the default branch. It uses a new Cloudflare Worker named `trinity-dialogue-staging`; **does not deploy to `tenebris-core` or `aura-trinity`**.

The staging config `wrangler.staging.toml` explicitly disables `workers_dev` and `preview_urls`. No public routes are configured, so a successful private deployment does not provide a public website. This is deliberate while access control is incomplete.

## One-time connection (do not paste secrets into issues, PRs or chat)

1. Create a **scoped Cloudflare API token** for the intended account with Cloudflare Workers Scripts **Edit** and D1 **Edit** permissions. Prefer the narrowest account/resources possible. Store it in the GitHub repository under **Settings → Secrets and variables → Actions → New repository secret** as `CLOUDFLARE_API_TOKEN`.
2. Store the Cloudflare account identifier there as `CLOUDFLARE_ACCOUNT_ID`.
3. Optionally store Gemini's secret under `GEMINI_API_KEY`; it will be set as a Worker secret after the staging deployment. Without it, conversational AI will report that the model is unavailable.
4. Configure a GitHub **trinity-staging** environment with restricted access and required reviewers if available. Workflow deployment requires that environment.
5. Ensure GitHub-hosted Actions runners can start. A run failing before assigning a runner cannot deploy anything.

## How to use

Merge the reviewed development branch after code security checks and successful CI. Under **Actions → Cloudflare Trinity Staging → Run workflow** select:
- `validate`: runs tests and compiles the Worker; does not access Cloudflare credentials.
- `deploy-private`: after approval checks, automatically finds or creates an EU-jurisdiction **trinity-dialogue-staging-db** D1 database, applies the dialogue schema, and deploys the isolated non-public Worker. No database ID needs to be manually copied.

Every required Cloudflare credential must be configured before running `deploy-private`. Never reuse a production database for this staging process.

## Requirements before enabling a public endpoint or production deployment

- Replace the sample admin password/static 2FA and in-memory sessions from the legacy project with **verified Cloudflare Access identity**. Only trusted allowed administrators should have control.
- Configure Cloudflare Access application and policy for the approved hostname; validate signed JWTs at the Worker or origin. Setting a header without verifying its signature is not authentication.
- Do not serve the admin UI on an unprotected `workers.dev` endpoint or expose a direct route that bypasses Access.
- Review all AI write/permissions endpoints and replace demo state with real authorized policy checks and audit logs.
- Verify deployment version, target, scope and rollback before opening any route; chat approvals only record a decision and cannot deploy by themselves.
- Prove live API/model connectivity and authenticated D1 persistence, then perform a staging smoke test before production.

## Notes

The workflow intentionally does **not** create a Cloudflare Access application or domain route automatically; doing so would require known account routing and security policy. Do not claim production is deployed just because GitHub tests passed.
