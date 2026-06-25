---
phase: "04"
plan: "02"
subsystem: collection-mechanics
tags: [api, sightings, log-button, react-query]
key-files:
  created:
    - src/app/api/sightings/route.ts
  modified:
    - src/components/discover/SpeciesCard.tsx
    - src/components/discover/SpeciesList.tsx
decisions:
  - Used upsert pattern on sightings table so duplicate logs increment count rather than error
  - firstSighting flag derived from sightingCount === 1 after upsert
metrics:
  completed: "2026-06-25"
---

# Phase 04 Plan 02: Sighting Log Button Summary

POST /api/sightings route with upsert semantics, SpeciesCard Log button using react-query mutation, and SpeciesList gridSquare prop wiring.

## What Was Built

- **POST /api/sightings** — Accepts `{ speciesId, gridSquare }`, upserts into `sightings` table (incrementing `sighting_count`), returns `{ sightingCount, firstSighting }`. Requires authenticated session; 401 if missing.
- **SpeciesCard log button** — "Log sighting" button using `useMutation`. On success shows inline confirm message ("Logged! Card unlocked" for first sighting, or repeat count). Auto-clears after 1800 ms. Shows error text on failure.
- **SpeciesList wiring** — `gridSquare` prop forwarded from list to each card.

## Deviations from Plan

None — plan executed exactly as written. SpeciesCard already had `'use client'`, `useState`, and `useMutation` imports from a prior partial execution; only the `gridSquare` prop on `<SpeciesCard>` in SpeciesList required the edit.

## Self-Check: PASSED

- `src/app/api/sightings/route.ts` exists
- `src/components/discover/SpeciesCard.tsx` has gridSquare prop and log button
- `src/components/discover/SpeciesList.tsx` passes gridSquare to SpeciesCard
- TSC: OK
- Build: OK
- Commit: 62d4934
