---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: "Plan 01-01 complete; ready to execute 01-02"
last_updated: "2026-06-25T13:10:00Z"
last_activity: 2026-06-25 -- Plan 01-01 executed (scaffold + auth + schema + E2E)
progress:
  total_phases: 7
  completed_phases: 0
  total_plans: 3
  completed_plans: 1
  percent: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-24)

**Core value:** The thrill of "I found that, for real" — without ever disturbing the animal.
**Current focus:** Phase 1 — Foundation + Auth

## Current Position

Phase: 1 of 7 (Foundation + Auth)
Plan: 1 of 3 in current phase (01-01 complete)
Status: Executing — ready for 01-02
Last activity: 2026-06-25 -- Plan 01-01 executed (scaffold + auth + schema + E2E)

Progress: [#░░░░░░░░░] 5%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Foundation+Auth | 1/3 | ~20 min | ~20 min |

**Recent Trend:**

- Last 5 plans: 01-01 (~20 min)
- Trend: On track

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Species dataset (Phase 2) is the root dependency — must be seeded with `rarity_tier`, `sensitivity_level`, and `season_lock` before any discovery or collection UI exists
- Roadmap: NBN Atlas CC-BY-NC licence audit is a hard gate in Phase 2 before the occurrence pipeline is built
- Roadmap: Proximity must never increase collection value — enforced as a design constraint in Phase 4
- Roadmap: Device GPS is only ever used transiently in-memory on the client; server stores grid-square resolution only
- Plan 01-01: JWT session strategy required with Credentials provider (stateless, no sessions table needed)
- Plan 01-01: bcryptjs (pure JS) over native bcrypt for Edge/serverless compatibility
- Plan 01-01: proxy.ts instead of middleware.ts — Next.js 16 renamed the file convention
- Plan 01-01: drizzle-kit generate + migrate instead of push — avoids TTY requirement in non-interactive shells

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3 (NBN Atlas): API rate limits are unconfirmed — test empirically during planning; tune TanStack Query stale times accordingly
- Phase 2 (season-lock table): exact species and date windows need a UK ornithology reference (BTO guides) before the seed can be finalised

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| v2 | ANIM-01: Card unlock animations vary by rarity tier | Deferred | Roadmap creation |
| v2 | RESP-05: Contextual reminders (nesting season alerts) | Deferred | Roadmap creation |
| v2 | RESP-06: Patient-spotter distance bonus | Deferred | Roadmap creation |
| v2 | SOC-01: Friends beastiary viewing | Deferred | Roadmap creation |
| v2 | SOC-02: Friends collection feed (grid-square only) | Deferred | Roadmap creation |

## Session Continuity

Last session: 2026-06-25
Stopped at: Plan 01-01 complete — Next.js 16 scaffold, NextAuth v5, Drizzle + Neon schema live, E2E infra ready
Resume file: .planning/phases/01-foundation-auth/01-02-PLAN.md
