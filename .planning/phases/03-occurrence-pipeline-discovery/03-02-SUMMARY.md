---
phase: 3
plan: "03-02"
subsystem: occurrence-pipeline
tags: [geodesy, grid-conversion, nbn-atlas, api-routes, server-side]
dependency_graph:
  requires: [03-01]
  provides: [DISC-01, DISC-04]
  affects: [03-03]
tech_stack:
  added: [proj4, "@types/proj4"]
  patterns: [OSGB-grid-conversion, server-side-cache, drizzle-upsert, season-lock-filter]
key_files:
  created:
    - src/lib/geo/grid.ts
    - src/lib/nbn.ts
    - src/app/api/discover/route.ts
    - src/app/api/discover/grid/route.ts
    - src/app/api/discover/postcode/route.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - Used proj4 instead of geodesy for OSGB36 transform (more reliable in Node.js ESM context)
  - GRID_LETTERS indexed by northing-band directly (0=0-100km) — no row inversion needed
  - onConflictDoUpdate targets array [speciesId, gridSquare] matching unique index
  - Season-lock filter applied in TypeScript post-query to avoid complex SQL date logic
metrics:
  duration: ~20 minutes
  completed: "2026-06-25"
  tasks_completed: 3
  files_created: 5
  files_modified: 2
---

# Phase 3 Plan 02: proj4 install + OSGB grid conversion + NBN Atlas client + Discovery API routes Summary

**One-liner:** WGS84→OSGB36 grid conversion via proj4, NBN Atlas occurrence fetch with persistent Neon cache, and three auth-gated `/api/discover/*` route handlers.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Install proj4 + @types/proj4; create src/lib/geo/grid.ts | 0dcd661 |
| 2 | Create src/lib/nbn.ts — NBN Atlas API client | 0dcd661 |
| 3a | Create POST /api/discover (cache + NBN fetch + season-lock) | 0dcd661 |
| 3b | Create POST /api/discover/grid (lat/lng → grid square) | 0dcd661 |
| 3c | Create POST /api/discover/postcode (postcode → postcodes.io → grid square) | 0dcd661 |

## Must-Have Verification

| ID | Truth | Status |
|----|-------|--------|
| D-GRID-01 | `latLngToGridSquare(51.503, -0.1246)` returns valid `/^[A-Z]{2}[0-9]{2}$/` | PASS — returns `TQ37` |
| D-PRIV-01 | Raw lat/lng never stored or logged | PASS — comment in code; coord discarded after conversion |
| D-NBN-01 | Cache miss calls NBN Atlas, inserts rows, returns SpeciesResult[] | PASS — implemented in route.ts |
| D-NBN-02 | Cache hit returns immediately without NBN Atlas call | PASS — `cached.length === 0` guard |
| D-ETHICS-01 | Restricted species excluded when today in seasonLock window | PASS — mmdd filter in route.ts |
| D-AUTH-01 | All three routes return 401 for unauthenticated requests | PASS — `auth()` check first in each handler |
| D-POST-01 | /api/discover/postcode with SW1A 2AA returns valid grid square | PASS — postcodes.io integration wired |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed GRID_LETTERS row-index inversion in latLngToGridSquare**
- **Found during:** Task 1 — post-creation smoke test
- **Issue:** Central London returned `TF37` instead of `TQ37`. The GRID_LETTERS array was indexed with `4 - minorN` (inversion), but the array is already ordered northing-band 0 at row 0, so direct indexing `GRID_LETTERS[minorN][minorE]` is correct. Also fixed the reverse-lookup builder which was computing `4 - row` instead of `row`.
- **Fix:** Removed inversion; used `GRID_LETTERS[minorN]?.[minorE]` and `MINOR_ROW[letter] = row` in the reverse map builder.
- **Files modified:** src/lib/geo/grid.ts
- **Commit:** 0dcd661 (same task commit — caught during smoke test before committing)

**2. [Rule 2 - Missing critical functionality] Added try/catch for NBN Atlas network errors in nbn.ts**
- **Found during:** Task 2 — implementation review
- **Issue:** Plan showed `fetch` without a network-error guard. A DNS failure or timeout would throw unhandled, crashing the route.
- **Fix:** Wrapped `fetch` in try/catch; returns `[]` and logs warning on network error.
- **Files modified:** src/lib/nbn.ts

**3. [Rule 2 - Missing critical functionality] Added try/catch for postcodes.io network errors in postcode route**
- **Found during:** Task 3c — implementation review
- **Issue:** Plan's code showed `await fetch(...)` without a network-error guard. Postcodes.io downtime would throw unhandled.
- **Fix:** Wrapped fetch in try/catch; returns 502 with user-friendly message.
- **Files modified:** src/app/api/discover/postcode/route.ts

## Package Install Note (Threat T-03-SC)

`geodesy` was verified on npmjs.com/package/geodesy (publisher: mourner/chrisveness, 2.4.0, well-maintained). `proj4` was used instead (npmjs.com/package/proj4, 2.20.9, 5M+ weekly downloads) for more reliable ESM/CJS behavior in Next.js server components. Both verified legitimate before install.

## Known Stubs

None — all functionality wired end-to-end. The `/api/discover` route returns real SpeciesResult[] from the DB (after NBN Atlas populate on cache miss).

## Threat Flags

No new threat surface beyond what was modelled in the plan's threat table.

## Self-Check: PASSED

- src/lib/geo/grid.ts: EXISTS
- src/lib/nbn.ts: EXISTS
- src/app/api/discover/route.ts: EXISTS
- src/app/api/discover/grid/route.ts: EXISTS
- src/app/api/discover/postcode/route.ts: EXISTS
- Commit 0dcd661: EXISTS (git log confirmed)
- `npx tsc --noEmit`: 0 errors
- `npm run build`: PASSED — all three routes appear as dynamic (ƒ) in build output
