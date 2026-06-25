---
phase: "02"
plan: "01"
subsystem: "data-model"
tags: [drizzle, schema, migration, neon, species, nbn-licence]
dependency_graph:
  requires: ["01-01", "01-02"]
  provides: ["species-table", "rarity-enum", "sensitivity-enum", "nbn-audit"]
  affects: ["02-02"]
tech_stack:
  added: []
  patterns: ["pgEnum for domain types", "boolean column with default", "enum default value via .default()"]
key_files:
  created:
    - "drizzle/0001_brief_silver_fox.sql"
    - ".planning/phases/02-species-dataset-ethics-data-model/NBN-LICENCE-AUDIT.md"
  modified:
    - "src/lib/db/schema.ts"
    - "package.json"
decisions:
  - "D-01: NBN Atlas CC-BY-NC datasets excluded from Phase 3 pipeline — future-proofs against monetisation and reduces licence complexity"
  - "D-02: sensitivityLevel defaults to 'none' at DB level — safe default means application code never needs to guard against null sensitivity"
  - "D-03: Season lock stored as text columns (not date) — allows partial dates like 'Apr-01' without year coupling"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-25"
  tasks_completed: 3
  files_modified: 4
---

# Phase 02 Plan 01: Species Schema + NBN Licence Audit Summary

**One-liner:** Drizzle pgEnum types (rarityTier 6-value, sensitivityLevel 4-value) + 14-column species table applied to Neon via migration 0001; NBN Atlas CC-BY-NC exclusion decision committed.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add rarityTierEnum, sensitivityLevelEnum, species table to schema.ts | 7fcc350 |
| 2 | Generate migration + apply to Neon; verify 14 columns | 08008d7 |
| 3 | Create NBN-LICENCE-AUDIT.md + add db:seed to package.json | 9d00231 |

## What Was Built

**schema.ts additions:**
- `rarityTierEnum`: 6 tiers — common, uncommon, rare, super_rare, legendary, mythic
- `sensitivityLevelEnum`: 4 levels — none, caution, sensitive, restricted
- `species` table: 14 columns covering identity (id, commonName, scientificName, tvk), game mechanics (rarityTier, sensitivityLevel, canBeShiny), seasonal gating (seasonLockStart, seasonLockEnd), content (description, imageUrl, taxonomyGroup), and audit timestamps

**Migration 0001_brief_silver_fox.sql:** Applied to Neon via `DATABASE_URL_UNPOOLED`. Verified 14 columns present via `information_schema.columns`.

**NBN-LICENCE-AUDIT.md:** Documents the Phase 3 licence decision — CC-BY and OGL-only datasets included; CC-BY-NC excluded. Lists 8 key datasets surveyed with include/exclude decisions. Rationale: future-proofing against monetisation is more valuable than the marginal coverage gain from BTO BirdTrack.

**package.json `db:seed`:** `tsx --env-file .env.local data/seed.ts` — wired ready for Plan 02-02 seed implementation.

## Decisions Made

1. **NBN CC-BY-NC exclusion** — Scout excludes CC-BY-NC datasets from the Phase 3 occurrence pipeline permanently, even though Scout v1 is non-commercial and would technically be permitted to use them. Rationale: a future monetisation path would require re-auditing and potentially re-architecting the pipeline. Excluding now costs little (iNaturalist CC-BY research-grade covers most gaps) but eliminates a significant future risk.

2. **sensitivityLevel DB default = 'none'** — The column carries `.notNull().default("none")` so rows seeded without explicit sensitivity data are never null. Application code can treat all species as having a defined sensitivity level.

3. **seasonLock as text** — Storing as `text` (e.g. `"04-01"`) rather than `date` avoids year-coupling in what is inherently a recurring annual constraint. Phase 3 or 4 will parse these into month/day logic.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan creates schema and documentation only; no UI or data-wiring concerns.

## Threat Flags

No new network endpoints, auth paths, or file access patterns introduced. Schema additions are internal DB only; no API surface created in this plan.

## Self-Check: PASSED

All files verified present. All 3 task commits confirmed in git log.
