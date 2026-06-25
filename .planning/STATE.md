---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: phase_complete
stopped_at: Phase 02 complete — 115 UK species seeded in Neon with rarity tiers, sensitivity flags, season-lock dates; RESP-03 + RESP-04 satisfied; NBN licence audit committed
last_updated: "2026-06-25T16:00:00.000Z"
last_activity: 2026-06-25
progress:
  total_phases: 7
  completed_phases: 2
  total_plans: 5
  completed_plans: 5
  percent: 28
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-24)

**Core value:** The thrill of "I found that, for real" — without ever disturbing the animal.
**Current focus:** Phase 3 — Occurrence Pipeline + Discovery

## Current Position

Phase: 3 of 7 (Occurrence Pipeline + Discovery)
Plan: 0 of ? (planning not yet started)
Status: Phase 02 COMPLETE ✓ — Ready to plan and execute Phase 03
Last activity: 2026-06-25

Progress: [██░░░░░░░░] 14% (1 of 7 phases complete)

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 Foundation+Auth | 3/3 COMPLETE | ~36 min | ~12 min |

**Recent Trend:**

- Last 5 plans: 01-01 (~20 min), 01-02 (~8 min), 01-03 (~8 min)
- Trend: On track

*Updated after each plan completion*
| Phase 01 P02 | 8m | 2 tasks | 6 files |
| Phase 01 P03 | 8m | 3 tasks | 10 files |

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
- Plan 01-03: NavShell uses md: Tailwind breakpoint for sidebar/tab-bar toggle — no JS, pure CSS responsive
- Plan 01-03: EmailVerificationBanner queries emailVerified directly from DB in layout (not in JWT) to keep token size small
- Plan 01-03: cross-device.spec.ts uses import type { Browser } to avoid runtime import of Playwright internals

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

Last session: 2026-06-25T15:10:00.000Z
Stopped at: Plan 01-03 complete — Phase 01 Foundation+Auth fully done. NavShell, EmailVerificationBanner, Beastiary/Discover stubs, E2E specs (AUTH-03, D-05, D-06, D-07) all shipped.
Resume file: None
