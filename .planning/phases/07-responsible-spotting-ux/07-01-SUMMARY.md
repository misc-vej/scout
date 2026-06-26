---
phase: 07-responsible-spotting-ux
plan: "01"
subsystem: responsible-spotting
tags: [pledge, schema, auth-gate, modal]
dependency_graph:
  requires: []
  provides: [pledge-gate, pledge-schema, pledge-api]
  affects: [app-layout, profiles-table, species-table]
tech_stack:
  added: []
  patterns: [server-side-pledge-gate, tanstack-mutation-on-accept]
key_files:
  created:
    - src/app/api/pledge/accept/route.ts
    - src/components/auth/PledgeModal.tsx
    - drizzle/0007_brief_tattoo.sql
  modified:
    - src/lib/db/schema.ts
    - src/app/(app)/layout.tsx
decisions:
  - "pledgeAcceptedAt is nullable (no .notNull()) so existing users get null and are gated on next visit"
  - "Modal gate is server-side in layout.tsx — cosmetic client dismissal via useState, not a security boundary"
  - "Single migration covers both pledgeAcceptedAt (profiles) and spottingTips (species) per plan requirement"
  - "Session cast (session.user as { id: string }).id used in API route per plan constraint"
metrics:
  duration: "~12 minutes"
  completed: "2026-06-26"
  tasks_completed: 3
  tasks_total: 3
---

# Phase 7 Plan 01: Spotter's Pledge Gate Summary

Nullable `pledgeAcceptedAt` column on profiles + nullable `spottingTips` column on species, migrated in one step; POST `/api/pledge/accept` endpoint that stamps the timestamp; full-screen non-dismissible `PledgeModal` client component; server-side layout gate that conditionally renders the modal.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Schema columns + migration | f35d280 | src/lib/db/schema.ts, drizzle/0007_brief_tattoo.sql |
| 2 | POST /api/pledge/accept | f35d280 | src/app/api/pledge/accept/route.ts |
| 3 | PledgeModal + layout gate | f35d280 | src/components/auth/PledgeModal.tsx, src/app/(app)/layout.tsx |

## Deviations from Plan

**1. [Rule 1 - Bug] Stale .next/types cache caused false TSC errors**
- **Found during:** Task 3 verification
- **Issue:** `.next/types/cache-life.d 2.ts` and `.next/types/routes.d 2.ts` had duplicate identifier errors from a stale build cache, unrelated to any changes in this plan.
- **Fix:** Deleted `.next/types/` directory. Re-running `npx tsc --noEmit` produced zero errors.
- **Files modified:** None (directory deletion, no tracked files affected)
- **Commit:** f35d280 (no separate commit needed — pre-existing stale cache)

## Verification Results

- `npx tsc --noEmit` — PASSED (zero errors after clearing stale .next/types cache)
- `npm run build` — PASSED; `/api/pledge/accept` listed as ƒ (dynamic) route
- Migration `0007_brief_tattoo.sql` — applied successfully; contains both `ALTER TABLE "profiles" ADD COLUMN "pledge_accepted_at"` and `ALTER TABLE "species" ADD COLUMN "spotting_tips"`
- Schema check: both `pledge_accepted_at` and `spotting_tips` present in schema.ts

## Known Stubs

None — no placeholder or hardcoded values. The pledge gate is fully wired: layout queries the DB server-side, PledgeModal POSTs to the real API, and the API updates the real profiles row.

## Threat Flags

No new threat surface beyond what is documented in the plan's threat model. The `/api/pledge/accept` endpoint is covered by T-07-01 (auth check, server-side userId). No new network endpoints, file access patterns, or schema changes at unexpected trust boundaries.

## Self-Check: PASSED

- `src/lib/db/schema.ts` — EXISTS, contains `pledge_accepted_at` and `spotting_tips`
- `drizzle/0007_brief_tattoo.sql` — EXISTS, contains both ALTER TABLE statements
- `src/app/api/pledge/accept/route.ts` — EXISTS, exports POST, updates pledgeAcceptedAt
- `src/components/auth/PledgeModal.tsx` — EXISTS, 'use client', uses useMutation, no dismiss button
- `src/app/(app)/layout.tsx` — EXISTS, imports PledgeModal, queries profile server-side, conditionally renders modal
- Commit `f35d280` — EXISTS in git log
