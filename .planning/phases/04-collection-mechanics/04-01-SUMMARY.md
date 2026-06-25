---
plan: 04-01
phase: 4
title: sightings + collections schema + Drizzle migration
subsystem: database
tags: [drizzle, schema, migration, neon]
requires: [03-02]
provides: [sightings-table, collections-table]
affects: [src/lib/db/schema.ts]
tech_stack:
  patterns: [drizzle-orm, pgTable, uniqueIndex, cascade-delete]
key_files:
  modified:
    - src/lib/db/schema.ts
  created:
    - drizzle/0003_goofy_jocasta.sql
decisions:
  - sightings is append-only (no unique constraint) to support multiple logs per user/species
  - collections enforces uniqueIndex on (userId, speciesId) to enable upsert in 04-02
  - DATABASE_URL_UNPOOLED used for migration (not pooled connection) per project rule
metrics:
  duration: ~5 min
  completed: 2026-06-25
---

# Phase 4 Plan 01: sightings + collections Drizzle tables + migration Summary

Added `sightings` (append-only event log) and `collections` (per-user card unlock state with unique user/species constraint) tables to schema.ts and applied migration `0003_goofy_jocasta.sql` to Neon.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add sightings and collections tables to schema.ts | 063230f | src/lib/db/schema.ts |
| 2 | Generate and run Drizzle migration | 063230f | drizzle/0003_goofy_jocasta.sql |

## Verification Results

- `npx tsc --noEmit` — PASSED (0 errors)
- `npm run build` — PASSED (all 11 routes built cleanly)
- Migration SQL contains `CREATE TABLE "sightings"`, `CREATE TABLE "collections"`, and `CREATE UNIQUE INDEX "collections_user_species_idx"`
- Migration applied to Neon successfully

## Deviations from Plan

None — plan executed exactly as written. All imports (`integer`, `uniqueIndex`, `index`, `uuid`, `text`, `timestamp`) were already present in schema.ts from Phase 3 as specified.

## Known Stubs

None.

## Threat Flags

None. DATABASE_URL_UNPOOLED loaded from .env.local only; not committed to git.

## Self-Check: PASSED

- src/lib/db/schema.ts — FOUND (exports sightings and collections)
- drizzle/0003_goofy_jocasta.sql — FOUND
- Commit 063230f — FOUND
