---
phase: 06-rarity-shiny-variants
plan: "01"
subsystem: database-schema
tags: [schema, migration, seed, api, shiny, conservation-status]
dependency_graph:
  requires: []
  provides: [conservationStatus-on-species, isShiny-on-collections, shiny-roll-in-sightings-api]
  affects: [src/lib/db/schema.ts, data/species-seed.ts, src/app/api/sightings/route.ts]
tech_stack:
  added: []
  patterns: [drizzle-orm nullable column, drizzle-orm boolean default, server-side random roll]
key_files:
  created: [drizzle/0006_soft_centennial.sql]
  modified: [src/lib/db/schema.ts, data/species-seed.ts, src/app/api/sightings/route.ts]
decisions:
  - conservationStatus nullable text column; no default; BTO red/amber/green for birds only
  - isShiny boolean with notNull+default(false); existing rows auto-receive false via Postgres default
  - Shiny roll is Math.random() < 0.02 (1-in-50) computed server-side on first collection only
  - isShiny returned in JSON response for both first and subsequent sightings
metrics:
  duration: ~35min
  completed: "2026-06-26"
  tasks_completed: 2
  files_modified: 4
---

# Phase 06 Plan 01: Schema + Seed + Shiny Roll Summary

Schema columns added, migration applied, seed backfilled with BTO conservation statuses for all 115 species, and POST /api/sightings wired to roll and return isShiny on first collection.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Schema columns + migration | bdde80d | src/lib/db/schema.ts, drizzle/0006_soft_centennial.sql |
| 2 | Seed conservation status + shiny roll | 3fbf93d | data/species-seed.ts, src/app/api/sightings/route.ts |

## What Was Built

**Schema changes (`src/lib/db/schema.ts`):**
- `species` table: added `conservationStatus: text("conservation_status")` — nullable, no default
- `collections` table: added `isShiny: boolean("is_shiny").notNull().default(false)`

**Migration (`drizzle/0006_soft_centennial.sql`):**
- Generated via `npx drizzle-kit generate`, applied via `DATABASE_URL=$DATABASE_URL_UNPOOLED npx drizzle-kit migrate`
- Existing species rows receive null; existing collections rows auto-receive false via Postgres column default — no UPDATE migration needed

**Seed (`data/species-seed.ts`):**
- All 115 species updated with `conservationStatus` field
- Birds: assigned BTO 2021 Red/Amber/Green status per plan lists; unlisted birds default to `'green'`
- Mammals, reptiles, amphibians: `conservationStatus: null`
- Key red list birds: House Sparrow, Starling, Lapwing, Curlew, Swift, Song Thrush, Mistle Thrush, Fieldfare, Redwing, Bullfinch, Grey Partridge, Yellowhammer, Nightingale, Marsh Tit
- Key amber list birds: Robin, Puffin, Barn Owl, Swallow, Kingfisher, Kestrel, Little Owl, Golden Eagle, White-tailed Eagle, Bittern, Corncrake, Oystercatcher
- Seed re-run: `npm run db:seed` → 115 species upserted cleanly

**Route (`src/app/api/sightings/route.ts`):**
- First sighting branch: `const isShiny = Math.random() < 0.02;` — rolled server-side, client cannot influence it (T-06-01 mitigated)
- Insert includes `isShiny` value
- Returns `{ sightingCount: 1, firstSighting: true, isShiny }`
- Subsequent sighting branch: fetches `isShiny` from existing collection row; returns `{ sightingCount, firstSighting: false, isShiny: existing[0].isShiny }` — never re-rolled

## Verification Results

- `npx tsc --noEmit` — passes clean (TSC OK)
- `npm run db:seed` — 115 species upserted without error
- `npx drizzle-kit check` — "Everything's fine"
- Migration applied successfully to remote Neon database

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Conservation status values are real BTO data. Shiny roll is wired and returns real boolean. No placeholder data flows to any UI rendering path.

## Threat Flags

None. T-06-01 (client tampering of isShiny) is mitigated — isShiny is computed server-side via Math.random() and the client never sends it; any isShiny in the request body is ignored.

## Self-Check: PASSED

- src/lib/db/schema.ts — modified, contains `conservation_status` and `is_shiny`
- drizzle/0006_soft_centennial.sql — created
- data/species-seed.ts — modified, contains `conservationStatus` on all 115 entries
- src/app/api/sightings/route.ts — modified, contains `isShiny`
- Commits bdde80d and 3fbf93d exist in git log
