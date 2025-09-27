# check-the-vibes: TA Dashboard — Design Spec (MVP)

_Last updated: 2025-09-26_

## 1) Purpose and Scope

**Goal.** Provide TAs in 17-313 with a single-page web dashboard that summarizes teamwork signals and SWE/VCS best practices for a given GitHub repository over a chosen time window.

**Non-goals.** Replace grading judgment; perform static analysis; enforce policy via write actions; connect to non-GitHub trackers.

**Primary users.** Course TAs and instructors. Secondary users: student teams (self-checks).

**Guiding principles.**

- Be explainable and auditable: every number links back to the source artifact.
- Be time-bounded: all metrics respect a selected window (e.g., last 7/14/30 days or custom).
- Be lightweight and read-only: no repo mutations; minimize required scopes.
- Prefer green/yellow/red cues over opaque scores; show raw evidence alongside any roll-ups.

---

## 2) Inputs and Configuration

- **Repository selector:** `owner/repo` (multi-select in future).
- **Time window:** presets (7/14/30 days) or absolute start–end (UTC; render in viewer local time).
- **Auth:** GitHub App (preferred) or PAT; read-only scopes (see §11).
- **Course presets (optional):** YAML with thresholds (e.g., “≥2 reviewers per PR” for green).
- **Feature flags:** enable/disable sections; choose Projects v1/v2 path.

---

## 3) High-level UX (Single Page)

**Top summary bar** with key cards (clickable to drill down):

- **Contributors active** (count) • **PRs opened** • **Issues opened/closed** • **Median PR cycle time** • **% PRs reviewed** • **% PRs linked to issues** • **Stale items** (issues or PRs with no activity > N days).

**Section layout (collapsible):**

1. Contributors
2. Pull Requests
3. Project Board
4. Issues
5. Best Practices & Hygiene

**Global controls:** repo, time window, refresh, export (PDF/CSV), dark mode, legend for color states.

**Design notes:**

- Tables with sticky headers, column filters, and CSV export.
- Inline chips for statuses (Merged, Open, Draft, WIP), and labels.
- Context links to GitHub open in new tabs.
- Tooltips show exact rule logic for any metric.

---

## 4) Data Sources and Permissions

- **GitHub GraphQL API v4** (preferred for batching) and **REST v3** fallbacks.
- **Projects (v2) API** for project boards; fallback: classic projects (read-only) if still used.
- **Webhook/push** not required; analyses execute on demand.

**Rate limiting & caching.** ETag-based REST caching; in-memory + SQLite cache keyed by `repo + window + version` with TTL (e.g., 10 minutes) to avoid duplicate loads.

---

## 5) Metrics and Rules (by Section)

All metrics are computed **only** from artifacts whose latest activity falls within the selected window, unless explicitly noted.

### 5.1 Contributors

- **Active contributors (count):** distinct users with ≥1 of commit, authored PR, review, or issue activity in window.
- **Commit distribution:** histogram by weekday and hour (signals bus-factor and crunching).
- **Bus factor proxy:** % of commits by top 1 contributor; flags red if >70%.
- **Review participation:** number of unique reviewers; reviewer-to-author ratio.
- **Direct pushes to default branch:** count (and offenders) within window.

**Table (Contributors)**

- User • Commits • PRs authored • Reviews given • Issues authored • Lines added/removed (approx) • Direct pushes to default branch (count)

### 5.2 Pull Requests

**Definitions.**

- **Reviewed?** `true` if the PR has ≥1 review of state `APPROVED` or `COMMENTED`, or ≥1 review-thread comment; bot reviews excluded (configurable allowlist).
- **Cycle time:** `merged_at | closed_at` minus `created_at` (median and p75).
- **Size:** `files_changed`, `additions`, `deletions`; bucket XS/S/M/L/XL with default thresholds: XS≤10, S≤50, M≤200, L≤500, XL>500 lines changed.
- **Linked to issue?** true if: (a) GitHub “Linked issues” connection; or (b) body references `fixes|closes|resolves #\d+` (cross-repo supported); or (c) project item links to an issue (Projects v2).
- **Status:** Open/Closed/Merged/Draft; **WIP** if title matches `/^\s*(WIP|\[WIP\]|Draft)/i`.

**KPIs.** % PRs reviewed; % PRs linked to issues; median time to first review; median cycle time; reopened PR rate; CI pass rate on latest run.

**Table (PRs)**

- PR # • Title • Author • Created • **Reviewed?** • **Size** (files, +/− lines, bucket) • **Linked to Issue?** • **Status** • **Time to First Review** • **Cycle Time** • **Approvals** • **Reviewers** • **CI** (pass/fail/none)

### 5.3 Project Board

Support **Projects v2** primarily.

- **Throughput:** items moved to “Done” (or configured terminal columns) during window.
- **WIP by column:** current count; flag if > configured WIP limits.
- **Stale items:** items without updates for > N days (default 7/14).
- **Linkage:** % items linked to PRs or issues; list unlinked items.
- **Blocked:** items labeled “blocked” or with `blocked:` field true (if used).

**Table (Project items)**

- Title • Type (Issue/PR/Draft) • Column/Status • Last activity • Assignees • Labels • Linked artifact • Age (days)

### 5.4 Issues

- **Counts:** opened/closed in window; net delta.
- **Assignment:** % issues with ≥1 assignee at open time; current unassigned.
- **Discussion depth:** comments count; flags “no discussion before close.”
- **Time to first response:** first non-author comment latency; median and p75.
- **Closure:** median time to close; % closed with linked PR.
- **Stale issues:** no activity > N days; list.
- **Reopened rate** within window.

**Table (Issues)**

- Issue # • Title • Author • Created • First Response (hh:mm) • Closed? • Time to Close • Assignees • Labels • Linked PR(s)

### 5.5 Best Practices & Hygiene

**Repository configuration checks (boolean + notes).**

- **Branch protection** on default branch: required reviews ≥1; dismiss stale reviews; require status checks; restrict force pushes.
- **CODEOWNERS** present and matches key paths.
- **CI present** (`.github/workflows/*.yml` or other CI); **Default status**: last runs green in window.
- **Issue/PR templates** present (`.github/ISSUE_TEMPLATE`, `PULL_REQUEST_TEMPLATE.md`).
- **Contributing guide** (`CONTRIBUTING.md`), **Code of Conduct** (`CODE_OF_CONDUCT.md`), **Security policy** (`SECURITY.md`), **License** present.
- **README quality**: sections for Setup, Run, Test; badge presence (build, coverage).
- **Pre-commit** config present; **.editorconfig** present.
- **Release hygiene**: tags or GitHub Releases in last N weeks.
- **Conventional commits** adherence ≥X% (regex heuristic on commit messages in window).
- **Dependabot** or updates workflow present.

**Signals and thresholds.** Each check maps to **Green** (pass), **Yellow** (partial), **Red** (missing or failing). Thresholds configurable via YAML.

---

## 6) “Vibe Score” (Optional, Transparent)

A weighted roll-up per section (0–100). Default weights:

- Contributors 20 • PRs 30 • Project Board 15 • Issues 20 • Hygiene 15.

Each metric contributes points with stepwise thresholds. Example (PRs reviewed):

- ≥90% → 10 pts; 70–89% → 7 pts; 40–69% → 4 pts; <40% → 0 pts.

**Display.** Show overall score with section sub-scores; always show raw counts and evidence links.

---

## 7) Architecture

**Frontend.** React + Vite + TypeScript; Tailwind + a small UI kit; Recharts for simple charts. Single route with collapsible sections.

**Backend.** FastAPI (Python) or Node/Express; service exposes `/analyze` that returns a structured JSON report for `repo` and `window`.

**Data flow.**

1. Frontend requests `/analyze?repo=owner/repo&from=ISO&to=ISO`.
2. Backend queries GitHub APIs (GraphQL preferred), aggregates and caches.
3. Backend returns JSON; frontend renders and links out to GitHub.

**Storage.** Ephemeral cache (SQLite/Redis). No student data at rest beyond cached GitHub metadata.

---

## 8) API Contract (MVP)

`GET /analyze`
**Query:** `repo`, `from`, `to` (ISO 8601), `tz` (optional, default viewer local).
**Response (excerpt):**

```json
{
  "repo": "cmu-sei/example",
  "window": { "from": "2025-09-01T00:00:00Z", "to": "2025-09-15T23:59:59Z" },
  "summary": {
    "contributors_active": 6,
    "prs_opened": 12,
    "issues_opened": 9,
    "issues_closed": 7,
    "pct_prs_reviewed": 0.75,
    "median_pr_cycle_time_hours": 28.5,
    "stale_items": 3
  },
  "contributors": [
    {
      "login": "alice",
      "commits": 14,
      "prs": 3,
      "reviews": 5,
      "issues": 1,
      "direct_pushes_default": 0
    }
  ],
  "pull_requests": [
    {
      "number": 123,
      "title": "Refactor auth module",
      "author": "alice",
      "created_at": "2025-09-04T12:05:00Z",
      "status": "Merged",
      "is_draft": false,
      "is_wip": false,
      "reviewed": true,
      "linked_issues": [456],
      "files_changed": 7,
      "additions": 180,
      "deletions": 60,
      "size_bucket": "M",
      "time_to_first_review_minutes": 95,
      "cycle_time_hours": 26,
      "approvals": 2,
      "reviewers": ["bob", "carol"],
      "ci_status": "pass",
      "url": "https://github.com/.../pull/123"
    }
  ],
  "project": { "items": [] },
  "issues": [
    {
      "number": 456,
      "title": "Login error on Safari",
      "author": "dave",
      "created_at": "...",
      "closed_at": "...",
      "time_to_first_response_minutes": 42,
      "assignees": ["alice"],
      "labels": ["bug"],
      "linked_prs": [123],
      "url": "https://github.com/.../issues/456"
    }
  ],
  "hygiene": {
    "branch_protection": {
      "present": true,
      "required_reviews": 1,
      "status_checks_required": true
    },
    "codeowners": true,
    "ci_present": true,
    "issue_templates": true,
    "pr_template": true,
    "contributing": true,
    "code_of_conduct": true,
    "security": false,
    "license": true,
    "readme_quality": {
      "has_setup": true,
      "has_test": true,
      "badges": ["build", "coverage"]
    },
    "precommit": true,
    "editorconfig": true,
    "releases_recent": false,
    "conventional_commits_rate": 0.62,
    "dependabot": true
  },
  "scores": {
    "overall": 78,
    "contributors": 70,
    "prs": 82,
    "project": 65,
    "issues": 75,
    "hygiene": 90
  }
}
```

---

## 9) Implementation Notes

**PR size calculation.** Use PR `additions` + `deletions` and `changedFiles`. Filter out vendored and lockfiles (`**/vendor/**`, `**/package-lock.json`, `**/pnpm-lock.yaml`, etc.) when computing size buckets (configurable ignore globs).

**Linked issue detection.** Combine GraphQL `closingIssuesReferences` with regex on PR body; include cross-repo references.

**Time to first review.** Compute first of: review with state `COMMENTED/APPROVED/CHANGES_REQUESTED`, or first review-thread comment. Exclude author’s own comments.

**Direct pushes to default.** From branch protection and commit events on default branch by non-bots; flag any with `pusher != GitHub` where not via merge.

**Conventional commits.** Regex: `^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\(.+\))?!?:\s`.

**CI presence and status.** Detect workflows and last run status within window; if multiple workflows, aggregate as pass if all latest runs on default branch are successful.

**Stale logic.** Default N = 7 days; configurable.

---

## 10) Performance and Rate Limits

- Prefer GraphQL to fetch nested connections (PRs with reviews, commits) in fewer round trips.
- Paginate with cursors; short-circuit once artifacts fall outside window.
- Cache per section to allow partial refreshes.
- Defer expensive analytics (e.g., commit message scan) until a user opens the section, using background request from frontend.

---

## 11) Security and Privacy

- **GitHub App** with minimum scopes: `metadata:read`, `contents:read`, `issues:read`, `pull_requests:read`, `projects:read`, `workflows:read`, `members:read` (org installs). No write scopes.
- Encrypt tokens at rest; do not log payloads with PII. Respect student privacy; do not persist results beyond cache TTL unless explicitly exported by a TA.
- Provide a “forget” control to purge cache for a repo.

---

## 12) Edge Cases and Limitations

- Teams using external boards (Trello/Jira): project metrics will show “Not configured.”
- Large monorepos with heavy CI may hit rate limits; show partial results with a banner and suggest narrowing the window.
- Private forks: require user to have access via the App install.
- Squash-merges obscure per-commit messages; rely on PR metadata.

---

## 13) Testing and Validation

- **Unit tests** for each metric rule using frozen fixtures.
- **Snapshot tests** for JSON report given a known fixture repo.
- **Golden repos**: curate 2–3 sample repositories (good/average/poor hygiene) and assert expected states.
- **Link integrity** checks for all generated URLs.

---

## 14) Deployment

- Containerized backend (Docker). One-click deploy to Fly.io/Render/Heroku; or run locally with `.env` for credentials.
- Frontend served as static assets behind a CDN.

**Observability.** Basic metrics: API latency, cache hit rate, GitHub quota remaining, error rates.

---

## 15) Roadmap (Post-MVP)

- Multi-repo rollups for a whole course.
- Slack/Discord digest for weekly summaries.
- Reviewer-load fairness index.
- Social loafing heuristics (e.g., bursty commits near deadlines, single-author dominance on PRs).
- Deeper CI quality: test flakiness detection, coverage trend via badges/APIs.
- Pluggable rules framework so instructors can add course-specific checks via YAML.
- Inline annotations on GitHub via check runs (read-only remains default; optional if enabled).

---

## 16) Acceptance Criteria (MVP)

- Given a repo and 14-day window, the dashboard renders all five sections with tables, KPI chips, and evidence links.
- % PRs reviewed, % PRs linked to issues, and median PR cycle time appear in the top summary and match table aggregates within ±1%/±1 minute.
- Hygiene section displays at least 10 checks with green/yellow/red states and explanatory tooltips.
- Export to CSV for PRs and Issues works; PDF export includes top summary and section headings.
- All external links open on GitHub to the referenced PR/issue/commit.

---

## 17) Wireframe (Textual)

**Header:** [Repo selector] [Window dropdown] [Refresh] [Export]

**Summary cards (grid):** Contributors • PRs opened • Issues opened/closed • % PRs reviewed • % linked to issues • Median PR cycle time • Stale items

**Section: Pull Requests**

- Filters: Status, Size bucket, Reviewed?, Linked?
- Table columns as defined; row click opens a side panel with timeline: created → first review → merges, with CI runs.

**Section: Issues**

- Filters: State, Assignee, Labels, Stale.

**Section: Best Practices**

- Checklist with colored indicators and a short note and “View evidence” links.

---

### Notes for 17-313

- Defaults tuned for teams of 3–5 students; thresholds editable via `courses/17313.yaml`.
- Date presets aligned to studio/iteration cadence (e.g., last 14 days).
- Include a banner reminding students that this tool is for formative feedback, not a grade by itself.
