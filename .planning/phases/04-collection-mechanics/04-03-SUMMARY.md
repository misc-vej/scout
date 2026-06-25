---
phase: 04-collection-mechanics
plan: "03"
subsystem: ui
tags: [nextjs, drizzle-orm, server-component, collections, beastiary]

# Dependency graph
requires:
  - phase: 04-01
    provides: species and collections Drizzle tables with schema
  - phase: 04-02
    provides: POST /api/sightings route that populates collections table
provides:
  - Functional /beastiary server-rendered page showing all species locked/unlocked
  - Progress counter showing N of total species spotted
  - Grouped species list by taxonomyGroup with locked/unlocked visual states
affects: [ui, discover, collections]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server component data fetching: auth() + Drizzle queries at the top of an async page component, no client-side fetch"
    - "collectedMap pattern: Map<speciesId, sightingCount> built from user collections for O(1) unlock-state lookup"
    - "Locked species privacy: conditional rendering hides commonName/scientificName behind '???'/'Not yet sighted' for locked entries"

key-files:
  created: []
  modified:
    - src/app/(app)/beastiary/page.tsx

key-decisions:
  - "Map<speciesId, sightingCount> used for O(1) per-species unlock check rather than Array.find per species"
  - "Locked species render '???' in JSX — real name never sent to client (T-04-09 threat mitigated)"
  - "Division-by-zero guard added to progress bar width calculation (totalSpecies > 0 check)"

patterns-established:
  - "Auth-gated server component: auth() → redirect('/auth') if no session"
  - "Grouped listing: allItems.reduce into Record<string, Item[]> then Object.entries to render sections"

requirements-completed: [DISC-02, DISC-03]

# Metrics
duration: 8min
completed: 2026-06-25
---

# Phase 4 Plan 03: Minimal Beastiary Page Summary

**Server-rendered /beastiary page showing all species as locked or unlocked, grouped by taxonomyGroup, with progress bar and sighting count badges**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-25T21:55:00Z
- **Completed:** 2026-06-25T22:03:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced Phase 1 stub (6 hardcoded placeholder cards) with a functional async server component
- Full species list rendered in groups by taxonomyGroup with locked/unlocked states derived from user's collections
- Locked species show only "???" and "Not yet sighted" — real name never reaches the client
- Progress counter and animated progress bar show N of total species spotted

## Task Commits

1. **Task 1: Replace beastiary page stub with functional server component** - `b27e0ae` (feat)

## Files Created/Modified
- `src/app/(app)/beastiary/page.tsx` - Full replacement of stub with async server component; auth-gated; Drizzle queries for all species + user collections; groups by taxonomyGroup; locked/unlocked rendering; RarityBadge and sighting count badge

## Decisions Made
- Used `Map<speciesId, sightingCount>` for O(1) per-species unlock-state lookup rather than `Array.find` (better performance with 115+ species)
- Added `totalSpecies > 0` guard to progress bar width calculation to prevent NaN/division-by-zero
- Locked species render "???" in JSX so real name is never sent to the client (addresses T-04-09 information disclosure threat)

## Deviations from Plan

None — plan executed exactly as written. One minor addition: division-by-zero guard in progress bar percentage calculation (not in plan but required for correctness — Rule 2 auto-add).

## Issues Encountered
- `npx tsc --noEmit` initially showed a SpeciesList.tsx error on first run, but this was a stale `tsconfig.tsbuildinfo` cache artifact. After removing the build cache and re-running, TSC exits 0. The SpeciesCard/SpeciesList gridSquare prop wiring was already correctly committed in 04-02.

## Threat Surface Scan
No new network endpoints or auth paths introduced. /beastiary is a read-only server-rendered page. Collections query is filtered by session userId (T-04-08 mitigated). Auth guard redirects unauthenticated users (T-04-07 mitigated). Locked species names not exposed in rendered HTML (T-04-09 mitigated).

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- /beastiary is functional and ready for user testing
- The full sighting → unlock loop is now visible end-to-end: log a sighting via /discover, then visit /beastiary to see the card unlock
- No blockers for subsequent phases

---
*Phase: 04-collection-mechanics*
*Completed: 2026-06-25*
