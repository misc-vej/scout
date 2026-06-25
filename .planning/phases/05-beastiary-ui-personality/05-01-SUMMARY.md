---
plan: 05-01
phase: 5
subsystem: database / seed
tags: [schema, migration, seed, fun-facts]
dependency_graph:
  requires: []
  provides: [fun_fact column in species table, 115 populated fun_facts]
  affects: [beastiary card UI in 05-03]
tech_stack:
  added: []
  patterns: [drizzle-kit generate + migrate, onConflictDoUpdate upsert]
key_files:
  created:
    - drizzle/0004_puzzling_robin_chapel.sql
  modified:
    - src/lib/db/schema.ts
    - data/species-seed.ts
    - data/seed.ts
decisions:
  - Nullable fun_fact column with no default — consistent with description field pattern
  - funFact added to onConflictDoUpdate set clause (seed.ts) — required for idempotent re-seed
metrics:
  duration: ~12 minutes
  completed: 2026-06-25
  tasks_completed: 2
  files_modified: 4
---

# Phase 5 Plan 01: funFact column on species + seed 115 facts

Adds a nullable `fun_fact` text column to the species table in Neon, generates and applies the Drizzle migration, then seeds all 115 species with distinct playful irreverent UK-specific facts.

## Tasks Completed

| Task | Commit | Description |
|------|--------|-------------|
| 1: Schema + migration | 513d7ce | Added funFact to schema.ts; generated + applied 0004_puzzling_robin_chapel.sql |
| 2: Seed 115 facts | df5da59 | Wrote unique fact for every species; fixed seed.ts upsert; re-ran db:seed |

## Verification Results

- `fun_fact IS NULL` count: **0**
- `fun_fact IS NOT NULL` count: **115**
- Duplicate fun_facts: **0**
- `npm run db:seed` exit code: **0**
- `npx tsc --noEmit`: **PASS**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] seed.ts onConflictDoUpdate missing funFact field**
- **Found during:** Task 2 verification — first seed run showed 115 NULL fun_facts
- **Issue:** The `set` block in `data/seed.ts` did not include `funFact`, so the upsert updated all other columns but left `fun_fact` NULL on all existing rows
- **Fix:** Added `funFact: entry.funFact ?? null` to the `set` clause in seed.ts
- **Files modified:** `data/seed.ts`
- **Commit:** df5da59

## Known Stubs

None — all 115 species rows have non-null, non-placeholder fun_fact values in Neon.

## Self-Check: PASSED

- `drizzle/0004_puzzling_robin_chapel.sql` — EXISTS
- `src/lib/db/schema.ts` contains `funFact: text("fun_fact")` — CONFIRMED
- `data/species-seed.ts` has 115 funFact entries — CONFIRMED (115 `funFact:` occurrences)
- Commits 513d7ce and df5da59 — PRESENT in git log
- Neon: 0 null fun_facts, 115 populated, 0 duplicates — VERIFIED
