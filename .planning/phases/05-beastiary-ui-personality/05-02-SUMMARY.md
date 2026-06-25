---
phase: 5
plan: "05-02"
subsystem: collections-schema
tags: [schema, migration, api, drizzle, neon]
dependency_graph:
  requires: [05-01]
  provides: [personality_trait column, PATCH /api/collections/[speciesId]/personality]
  affects: [collections table, 05-03-PersonalityPicker]
tech_stack:
  added: []
  patterns: [drizzle-orm update+returning, Next.js 16 Promise params, ALLOWED_TRAITS allowlist]
key_files:
  created:
    - src/app/api/collections/[speciesId]/personality/route.ts
    - drizzle/0005_shiny_tigra.sql
  modified:
    - src/lib/db/schema.ts
decisions:
  - "Trait validation done at API layer (ALLOWED_TRAITS const array), not DB layer — no enum column"
  - "WHERE clause uses userId AND speciesId to prevent IDOR across users"
  - "404 returned when speciesId not in requesting user's collection (T-05-02-03 mitigation)"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-25"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 5 Plan 02: personalityTrait on collections + PATCH API Summary

**One-liner:** Nullable `personality_trait` text column added to collections table via Drizzle migration, with authenticated PATCH endpoint validating against 8 fixed traits and using userId+speciesId WHERE clause to prevent IDOR.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add personalityTrait to collections schema + migrate | f58e37b | schema.ts, drizzle/0005_shiny_tigra.sql |
| 2 | Create PATCH /api/collections/[speciesId]/personality | 461fd12 | src/app/api/collections/[speciesId]/personality/route.ts |

## Decisions Made

1. **Trait validation at API layer** — ALLOWED_TRAITS is a const array in the route; no DB enum. This keeps the DB schema simple and allows trait values to evolve without schema changes.
2. **IDOR prevention** — WHERE clause requires both `userId` AND `speciesId`, so a user can only update their own collection rows even if they know another user's speciesId.
3. **404 on missing collection row** — returns `{ error: 'Species not in collection' }` rather than silently creating a row; collection rows are created by the sighting flow (04-xx plans).

## Verification Results

- `personality_trait` column confirmed live in Neon: `PASS: personality_trait column exists`
- Migration SQL: `ALTER TABLE "collections" ADD COLUMN "personality_trait" text;` (0005_shiny_tigra.sql)
- TypeScript: `npx tsc --noEmit` → `TSC OK` (no errors)
- Auth guard: 401 on unauthenticated (T-05-02-01 mitigated)
- Trait allowlist: 400 with trait list on invalid value (T-05-02-02 mitigated)
- IDOR guard: userId+speciesId WHERE clause (T-05-02-03 mitigated)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — the column is live in Neon and the endpoint is fully wired.

## Threat Flags

No new security surface beyond what is documented in the plan's threat model.

## Self-Check: PASSED

- `src/app/api/collections/[speciesId]/personality/route.ts` — FOUND
- `drizzle/0005_shiny_tigra.sql` — FOUND
- `src/lib/db/schema.ts` (contains personalityTrait) — FOUND
- Commit f58e37b — FOUND
- Commit 461fd12 — FOUND
