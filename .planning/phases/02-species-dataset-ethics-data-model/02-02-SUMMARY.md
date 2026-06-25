---
phase: "02"
plan: "02"
subsystem: species-seed
tags: [seed, drizzle, neon, species-data, tsx]
dependency_graph:
  requires: [02-01]
  provides: [species-rows-in-neon]
  affects: [phase-03-occurrence-pipeline]
tech_stack:
  added: [tsx ^4.22.4]
  patterns: [drizzle-onConflictDoUpdate, idempotent-upsert, InferInsertModel]
key_files:
  created:
    - data/species-seed.ts
    - data/seed.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - "Used Omit<InferInsertModel<typeof species>, 'id' | 'createdAt' | 'updatedAt'> as seed type to exclude auto-generated fields"
  - "Deduplicated Kingfisher (appeared twice in RESEARCH.md) and Red Deer/Red Deer Stag into single entries per species"
  - "Used onConflictDoUpdate targeting scientificName unique constraint for idempotent upserts"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-25"
  tasks_completed: 3
  files_created: 2
  files_modified: 2
  species_seeded: 115
---

# Phase 02 Plan 02: Species Seed — Summary

**One-liner:** Seeded 115 UK wildlife species into Neon with rarity tiers, sensitivity levels, season-lock dates, and shiny flags via idempotent Drizzle upserts.

## What Was Built

### Task 1: Install tsx
tsx ^4.22.4 was already installed as a devDependency (added by plan 02-01). Verified `npx tsx --version` exits 0 on Node v24.16.0.

### Task 2: data/species-seed.ts
Created `data/species-seed.ts` with 115 UK species organised as:
- **Birds (~78 species):** Covers garden birds, raptors, waterfowl, seabirds, waders, and rare/restricted breeding birds
- **Mammals (~27 species):** Covers carnivores, deer, rodents, bats, marine mammals
- **Reptiles & Amphibians (~12 species):** Covers all 6 UK native reptile species and 6 amphibian species

All mandatory data rules enforced:
- Every `super_rare`, `legendary`, `mythic` entry has `canBeShiny: true`
- Every `restricted` sensitivity entry has non-null `seasonLockStart` and `seasonLockEnd`
- Kingfisher (`Alcedo atthis`) appears exactly once
- Red Deer (`Cervus elaphus`) appears exactly once
- `taxonomyGroup` set for every entry ("bird", "mammal", "reptile", or "amphibian")

**Validation output:**
```
Count: 115
Shiny violations: []
Lock violations: []
Duplicate scientific names: []
```

### Task 3: data/seed.ts + db:seed run
Created `data/seed.ts` with idempotent upsert pattern using `onConflictDoUpdate` targeting `species.scientificName`.

- First run: 115 species upserted — exit 0
- Second run (idempotency): 115 species upserted — exit 0
- Neon row count verified: 115 rows

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed spurious extra field on Adder entry**
- **Found during:** Task 2 post-write review
- **Issue:** Accidentally wrote `scientifiedName: "Vipera berus"` (typo field name) alongside the correct `scientificName` field
- **Fix:** Removed the spurious typo field immediately before validation
- **Files modified:** `data/species-seed.ts`
- **Commit:** 4872234

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1+2 | 4872234 | chore(02-02): install tsx dev dependency + species-seed.ts |
| 3 | 57e72ea | feat(species): seed ~115 UK species into Neon |

## Self-Check: PASSED

- `data/species-seed.ts` — FOUND
- `data/seed.ts` — FOUND
- Commit 4872234 — verified
- Commit 57e72ea — verified
- Species in Neon: 115 (>= 100 threshold)
- `npx tsc --noEmit` — exits 0
