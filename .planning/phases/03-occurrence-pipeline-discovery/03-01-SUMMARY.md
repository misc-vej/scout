---
phase: 03
plan: 01
title: occurrences table schema + Drizzle migration + SpeciesResult type
subsystem: database/schema
tags: [drizzle, schema, migration, types]
key-decisions:
  - Used drizzle-kit migrate (not push) for non-interactive migration apply
  - drizzle/meta/ is gitignored per project convention; only SQL file committed
key-files:
  created:
    - src/types/discovery.ts
    - drizzle/0002_absurd_orphan.sql
  modified:
    - src/lib/db/schema.ts
metrics:
  completed: 2026-06-25
---

# Phase 3 Plan 1: occurrences table schema + Drizzle migration + SpeciesResult type — Summary

## One-liner

Added `occurrences` Drizzle table with (species_id, grid_square) unique index, applied migration to Neon, and defined the `SpeciesResult` shared type for Wave 2 plans.

## What was done

### Task 1 — Schema update (`src/lib/db/schema.ts`)
- Extended the `drizzle-orm/pg-core` import with `index`, `integer`, and `uniqueIndex`.
- Appended the `occurrences` table:
  - Columns: `id` (uuid PK), `species_id` (FK → species.id, cascade delete), `grid_square` (text), `record_count` (integer, default 0), `last_fetched_at` (timestamp, defaultNow), `source` (text, default "nbn_atlas").
  - Unique index `occurrences_species_grid_idx` on (species_id, grid_square).
  - Plain index `occurrences_grid_square_idx` on grid_square.

### Task 2 — New type file (`src/types/discovery.ts`)
- Created with a single `SpeciesResult` export (id, commonName, scientificName, rarityTier, sensitivityLevel, canBeShiny, taxonomyGroup, recordCount).
- This is the API contract shared by 03-02 (route) and 03-03 (UI components).

### Task 3 — Migration
- `npx drizzle-kit generate` produced `drizzle/0002_absurd_orphan.sql`.
- `DATABASE_URL=$DATABASE_URL_UNPOOLED npx drizzle-kit migrate` applied the migration to Neon successfully.

## Verification

- `npx tsc --noEmit` — exit 0, no TypeScript errors.
- Migration SQL contains `CREATE TABLE "occurrences"`, `CREATE UNIQUE INDEX "occurrences_species_grid_idx"`, and `CREATE INDEX "occurrences_grid_square_idx"`.
- `npm run build` — clean build, all 8 routes generated.

## Deviations from Plan

None — plan executed exactly as written.

## Commit

`0021bee` — feat(03-01): occurrences table schema + Drizzle migration + SpeciesResult type
