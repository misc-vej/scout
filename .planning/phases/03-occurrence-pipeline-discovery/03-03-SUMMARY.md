---
phase: 3
plan: "03-03"
title: "Discovery UI page — GPS + postcode species list"
subsystem: discovery-ui
tags: [tanstack-query, react, ui, discovery, gps, postcode]
dependency_graph:
  requires: [03-01]
  provides: [discovery-ui, QueryProvider]
  affects: [app-layout]
tech_stack:
  added:
    - "@tanstack/react-query@^5.101.1"
  patterns:
    - useMutation for two-step async flows (GPS and postcode)
    - QueryProvider client wrapper in server layout
    - Pure display components without "use client"
key_files:
  created:
    - src/components/providers/QueryProvider.tsx
    - src/components/discover/RarityBadge.tsx
    - src/components/discover/SpeciesCard.tsx
    - src/components/discover/SpeciesList.tsx
    - src/components/discover/DiscoverClient.tsx
  modified:
    - src/app/(app)/layout.tsx
    - src/app/(app)/discover/page.tsx
    - package.json
    - package-lock.json
decisions:
  - QueryProvider uses useState(() => new QueryClient()) pattern to avoid sharing client across requests in SSR
  - Display components (RarityBadge, SpeciesCard, SpeciesList) have no "use client" directive — pure server-renderable display
  - Active mutation derived from GPS/postcode state: GPS takes priority when it has been triggered
  - Redirect path /auth matches existing app convention (src/app/(auth)/auth/)
metrics:
  duration_seconds: 148
  completed_date: "2026-06-25"
  tasks_completed: 4
  files_changed: 8
---

# Phase 3 Plan 03-03: Discovery UI Page Summary

## One-liner

TanStack Query v5 wired via QueryProvider; /discover replaced with GPS/postcode species discovery UI using useMutation with loading skeleton, rarity badges, and error state.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 0 | Install TanStack Query v5, create QueryProvider, wrap AppLayout | 8306a11 |
| 1 | Create RarityBadge, SpeciesCard, SpeciesList display components | 65c7c65 |
| 2 | Create DiscoverClient with GPS + postcode useMutation flows | 0218161 |
| 3 | Replace /discover stub with functional DiscoverPage | 5fd70ad |

## Verification Results

- `npx tsc --noEmit`: PASSED (0 errors)
- `npm run build`: PASSED — /discover route listed as dynamic (ƒ)
- `geodesy` import check: NOT FOUND — GOOD
- No `"use client"` on RarityBadge, SpeciesCard, SpeciesList: confirmed
- `DiscoverClient.tsx` has `"use client"` as first line: confirmed
- Unauthenticated redirect to /auth: implemented in DiscoverPage via `auth()` session check

## Architecture

```
AppLayout (server)
  └── QueryProvider (client) — holds QueryClient, wraps all (app) routes
       └── NavShell
            └── DiscoverPage (server) — auth-guards, renders heading
                 └── DiscoverClient (client) — GPS + postcode mutations
                      └── SpeciesList → SpeciesCard → RarityBadge
```

## API Contracts Implemented (calls to 03-02 routes)

- `POST /api/discover/grid` — `{ lat, lng }` → `{ gridSquare }`
- `POST /api/discover/postcode` — `{ postcode }` → `{ gridSquare }`
- `POST /api/discover` — `{ gridSquare }` → `SpeciesResult[]`

## Rarity Badge Colors

| Tier | Color |
|------|-------|
| common | text-gray-400 |
| uncommon | text-green-500 |
| rare | text-blue-500 |
| super_rare | text-purple-500 |
| legendary | text-orange-500 |
| mythic | text-red-500 |

## Deviations from Plan

None — plan executed exactly as written. All component code matches plan specification. Layout wrapping used `<QueryProvider>` around both `EmailVerificationBanner` and `NavShell` (entire layout body), preserving all existing structure.

## Known Stubs

None — DiscoverClient makes live API calls to the routes being built in 03-02. The UI is fully wired; manual smoke tests require 03-02 completion.

## Threat Flags

No new trust boundaries introduced. Threat mitigations per plan:
- T-03-UI-01: Raw GPS coordinates sent only to /api/discover/grid over HTTPS, only on explicit user button press
- T-03-UI-02: auth() session check in DiscoverPage before any rendering; redirect to /auth if unauthenticated
- T-03-UI-03: React JSX auto-escaping provides XSS defence-in-depth for species display fields

## Self-Check: PASSED

- src/components/providers/QueryProvider.tsx: FOUND
- src/components/discover/RarityBadge.tsx: FOUND
- src/components/discover/SpeciesCard.tsx: FOUND
- src/components/discover/SpeciesList.tsx: FOUND
- src/components/discover/DiscoverClient.tsx: FOUND
- src/app/(app)/discover/page.tsx: FOUND (modified)
- Commits 8306a11, 65c7c65, 0218161, 5fd70ad: verified in git log
