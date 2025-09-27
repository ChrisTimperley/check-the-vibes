# Implementation Plan (Agent‑Readable, Verifiable Steps)

Target repo: **check-the-vibes** — Fastify backend MVP with PR/Issue/Hygiene modules, per the design and schemas in the canvas.

> This plan assumes Node 22+, NPM, and a GitHub read-only token. Each step includes **Inputs**, **Procedure**, and **Checks** (verifiable commands/outputs). Work in small PRs per step.

---

## 0) Prerequisites & Baseline (DONE ✅)

**Inputs**

- `.env` with `GITHUB_TOKEN` (read-only), `PORT=8000`.
- Files from canvas: _Fastify Server (MVP)_, _OpenAPI (MVP)_, _Implementation Modules_.

**Procedure**

1. Create a fresh branch: `git checkout -b feat/fastify-mvp`.
2. Add scaffold files and `package.json` deps as listed.
3. Install deps: `npm i`.
4. Copy `.env.example` → `.env` and set `GITHUB_TOKEN`.

**Checks**

- Run: `npm run dev`. Visit `http://localhost:8000/healthz` → `ok`.
- Visit `http://localhost:8000/docs` → Swagger UI loads.

**DoD**: Server boots, health & docs endpoints respond.

---

## 1) Register Schemas & Route (DONE ✅)

**Inputs**

- `src/schemas/analyze-response.ts`, `src/schemas/query-analyze.ts`, `src/routes/analyze.ts`.

**Procedure**

1. Ensure `AnalyzeResponse` and `Error` schemas are `app.addSchema(...)`-registered in `src/index.ts`.
2. Ensure `/analyze` route uses `querystring` schema and `response` schema refs.

**Checks**

- `curl "http://localhost:8000/analyze?repo=foo/bar&from=2025-09-01T00:00:00Z&to=2025-09-02T00:00:00Z"` → HTTP 500 with JSON `{code:500,...}` (until implementation).
- `curl "http://localhost:8000/analyze"` → HTTP 400 with JSON `{code:400,...}` (validation error).

**DoD**: Validation errors are consistent; route wired.

---

## 2) GitHub Clients (REST + GraphQL) & Rate Limit

**Inputs**

- `src/github/octo.ts`, `src/github/gql.ts`.

**Procedure**

1. Implement Octokit REST client with Bottleneck wrapper.
2. Implement GraphQL client with default auth header.
3. Add graceful degradation for when GitHub API is unavailable.
4. Include retry logic with exponential backoff.

**Checks**

- Temporarily add a route `/whoami` that calls `GET /user` and returns login. `curl /whoami` prints the authenticated user.
- Test rate limiting: make multiple rapid requests and verify Bottleneck queuing.
- Remove `/whoami` before merging.

**DoD**: Auth works; rate limiter wraps requests; handles API failures gracefully.

---

## 3) PR Section (GraphQL)

**Inputs**

- `src/sections/prs.ts` from canvas.

**Procedure**

1. Add `fetchPRSection(owner, repo, from, to)` implementation.
2. Use GraphQL query from doc; keep page size 50; stop when `createdAt < from`.
3. Compute per-PR fields (reviewed/approvals/reviewers/time-to-first-review/size/ci_status, etc.).

**Checks**

- Temp hook in `/analyze` to return `{ pull_requests: rows }` only.
- Example: `curl "http://localhost:8000/analyze?repo=octocat/Hello-World&from=2025-01-01T00:00:00Z&to=2025-12-31T23:59:59Z" | jq '.pull_requests[0]'` shows PR shape.
- Sanity: `jq '.pull_requests | length'` is an integer; `jq '[.pull_requests[].reviewed] | all'` returns `true/false`.

**DoD**: PR rows compile with expected fields; no schema violations when plugged into response schema.

---

## 4) Issue Section (GraphQL)

**Inputs**

- `src/sections/issues.ts` from canvas.

**Procedure**

1. Implement `fetchIssueSection(owner, repo, from, to)`.
2. Compute first response time and time to close using non-author first comment.

**Checks**

- Temp hook `/analyze` to include `{ issues: rows }`.
- `jq '.issues | length'` returns integer; closed/open flags match GitHub.
- Spot-check an issue’s URL for parity.

**DoD**: Issue rows populated and valid.

---

## 5) Hygiene Section (REST)

**Inputs**

- `src/sections/hygiene.ts` from canvas.

**Procedure**

1. Implement existence checks for CODEOWNERS, workflows, templates, CONTRIBUTING, etc.
2. Get default branch and protection; map booleans/integers per schema.
3. README heuristics: detect setup/test headings.

**Checks**

- `curl` analyze on a repo known to have protections/templates; confirm fields true.
- Test negative: a minimal repo should show many false.

**DoD**: Hygiene object fully populated; no unhandled 404s crash the server.

---

## 6) Aggregator & Linking

**Inputs**

- `src/usecases/analyze.ts` (aggregator variant from canvas).

**Procedure**

1. Call PR + Issue + Hygiene in parallel (`Promise.all`).
2. Build issue↔PR links from `closingIssuesReferences` mapped back to issues.
3. Derive contributors from authors/reviewers with counters.
4. Build summary KPIs (counts, percentages, median cycle time).

**Checks**

- `curl /analyze?... | jq '.summary, .contributors | length, (.pull_requests|length), (.issues|length)'` shows expected values.
- Validate output against schema: add a dev route or script using AJV to validate `AnalyzeResponse`.

**DoD**: Response conforms to schema; minimal KPIs correct.

---

## 7) Caching & Idempotence

**Inputs**

- `src/util/cache.ts` (LRU TTL cache).

**Procedure**

1. Cache response keyed by `repo:from:to:version` for 10 minutes.
2. Log cache hits/misses at debug level.
3. Add request timeout (30s) to prevent hanging on large repos.
4. Implement partial caching for individual sections (PRs, Issues, Hygiene).

**Checks**

- First call logs `cache=miss`; immediate second call logs `cache=hit` and is faster.
- Invalidate by bumping version suffix.
- Test timeout with a very large repo or simulate slow GitHub API response.

**DoD**: Basic caching works; no stale cross-window bleed; requests don't hang indefinitely.

---

## 8) Response Validation in CI

**Inputs**

- OpenAPI 3.1 spec from canvas; AJV dev script.

**Procedure**

1. Add a small script `scripts/validate-response.ts` that fetches `/analyze` for a known public repo and validates against the `AnalyzeResponse` schema (skip in CI if `GITHUB_TOKEN` absent).
2. Wire into `npm test`.

**Checks**

- `npm test` passes locally with token; skips gracefully in CI without secret.

**DoD**: Contract enforced by test; regressions caught.

---

## 9) Unit & Integration Tests

**Inputs**

- Vitest + Supertest.

**Procedure**

1. Add unit tests for `sections/utils.ts` (sizeBucket, time diffs, ciFromRollup).
2. Add route test: query validation returns 400 on bad input.
3. (Optional) Add live integration test behind `IT=1` env flag to hit GitHub for a tiny public repo.

**Checks**

- `npm test` shows all green locally; CI runs unit tests only.

**DoD**: Core helpers and route validation covered.

---

## 10) Observability & Errors

**Procedure**

1. Standardize error payloads `{code, message}` using `Error` schema.
2. Add request logging (method, url, status, duration) via Fastify logger.
3. Add top-level error handler to map Octokit errors (404/403/429) to friendly messages.
4. Implement input sanitization to prevent injection attacks.
5. Add rate limiting per client IP to prevent abuse.
6. Log security events (e.g., invalid tokens, suspicious requests).

**Checks**

- Force a 404 by analyzing a non-existent repo: get `{code:404, message:'Repository not found or inaccessible'}`.
- Logs contain response time and status.
- Test with malformed input to ensure proper sanitization.
- Verify rate limiting kicks in after X requests per minute.

**DoD**: Errors tidy; logs useful; basic security measures in place.

---

## 11) Docker & Runbook

**Inputs**

- `Dockerfile`, `README.md` updates.

**Procedure**

1. Create multi-stage Dockerfile (build → runtime). Expose `8000`.
2. Document env vars, run commands, and `/docs` URL.

**Checks**

- `docker build -t ctv-api . && docker run --rm -p 8000:8000 --env-file .env ctv-api` → works.

**DoD**: Container runs locally; parity with dev.

---

## 12.5) Monitoring & Health Checks

**Procedure**

1. Add comprehensive health check endpoint that tests GitHub API connectivity.
2. Add metrics endpoint `/metrics` for Prometheus/monitoring (request counts, response times, cache hit rates).
3. Implement structured logging with correlation IDs.
4. Add alerting for high error rates or GitHub API quota exhaustion.

**Checks**

- `curl /healthz` shows detailed health status including GitHub API accessibility.
- `curl /metrics` returns Prometheus-compatible metrics.
- Logs include correlation IDs for request tracing.

**DoD**: Production-ready monitoring in place.

---

## 12) Deployment (Optional for MVP)

**Procedure**

1. Pick Host (Render/Fly/Vercel functions with Hono alternative). For Fastify: Render/Fly.
2. Add GitHub secret `GITHUB_TOKEN` to host.
3. Health check path `/healthz`.

**Checks**

- `curl https://<host>/healthz` → `ok`.
- `curl https://<host>/docs` renders.

**DoD**: Public endpoint live.

---

## 13) (Optional) GitHub Actions Reporter

**Procedure**

1. Add workflow `.github/workflows/weekly-report.yml` that runs on a schedule and job-matrix over a list of team repos.
2. For each repo, `curl https://api.../analyze?...` and post a markdown summary comment to a central tracking issue.

**Checks**

- Workflow logs show artifact JSON uploaded or comment posted.

**DoD**: Weekly digest generated.

---

## 14) Integration with Existing CLI

**Procedure**

1. Modify existing CLI tool in `src/cli.ts` to optionally use the API instead of direct GitHub calls.
2. Add `--use-api` flag to leverage the new backend service.
3. Maintain backward compatibility with existing YAML output format.
4. Add performance comparison between direct GitHub calls vs API backend.

**Checks**

- `npm run dev -- scan --owner microsoft --repo vscode --since 2025-09-01 --use-api` works.
- Output format matches existing CLI tool.
- Performance metrics show API backend is faster for repeated requests (due to caching).

**DoD**: Existing CLI can leverage new backend; maintains compatibility.

---

## 15) (Optional) CLI Wrapper

**Procedure**

1. Create `bin/ctv` Node script that calls the API and exports CSVs for PRs/issues.
2. Add `npm run ctv --repo owner/repo --from ... --to ... --out out/`.

**Checks**

- Files `out/prs.csv`, `out/issues.csv` created and match schemas.

**DoD**: Usable local tool for TAs.

---

## 15) Acceptance Checklist (MVP)

- [ ] `/healthz` returns `ok`.
- [ ] `/docs` serves OpenAPI UI.
- [ ] `/analyze` responds with schema‑valid JSON for a public repo and arbitrary window.
- [ ] PRs include `reviewed`, `size_bucket`, `time_to_first_review_minutes`, `cycle_time_hours`, `ci_status`.
- [ ] Issues include `time_to_first_response_minutes`, `time_to_close_hours`.
- [ ] Hygiene includes branch protection, CODEOWNERS, CI/templates, README heuristics, Dependabot, license.
- [ ] Summary KPIs populated (`pct_prs_reviewed`, `pct_prs_linked_to_issues`, `median_pr_cycle_time_hours`).
- [ ] Basic caching working.
- [ ] Tests passing locally; CI green for unit tests.

---

## 16) Stretch Goals (Post‑MVP)

- Projects v2 board metrics and stale item detection.
- Conventional commits rate calculation from commit messages in window.
- SQLite/Redis cache; cache bust on GitHub webhook (optional).
- GitHub App auth flow (installation token) for private org repos.
- PDF/CSV export endpoint.

---

## Troubleshooting Notes

- **GraphQL pagination**: Stop early once `createdAt < from` to save quota.
- **403/abuse detection**: Bottleneck `minTime` → 350ms; add jitter if needed.
- **404 on branch protection**: Treat as `present=false` rather than error.
- **Time zones**: Keep computations in UTC; only display `tz` on frontend.
