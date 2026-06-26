---
phase: 09-light-mode-card-art
plan: "02"
subsystem: card-art
tags: [imageUrl, card-art, beastiary, discover, seed]
dependency_graph:
  requires: []
  provides: [imageUrl-card-art-flow]
  affects: [beastiary-card, species-row, confirm-banner, discover-api, beastiary-page]
tech_stack:
  added: []
  patterns: [conditional-backgroundImage, css-cover-image, seed-upsert]
key_files:
  created: []
  modified:
    - src/types/discovery.ts
    - src/app/api/discover/route.ts
    - src/app/(app)/beastiary/page.tsx
    - src/components/beastiary/BeastiaryCard.tsx
    - src/components/discover/SpeciesCard.tsx
    - data/species-seed.ts
    - data/seed.ts
decisions:
  - "imageUrl passes via ...rest spread in discover route — no explicit mapping needed in filtered map"
  - "hasImage boolean derived from Boolean(species.imageUrl) for clean conditional rendering"
  - "grain div always rendered over art zone regardless of image presence"
  - "ConfirmBanner thumbnail also updated (overflow: hidden added) for correct cover clipping"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-26"
  tasks_completed: 2
  files_modified: 7
---

# Phase 9 Plan 02: Wire imageUrl as Card Art Zone Background Summary

End-to-end imageUrl flow from seed data through API to card rendering — Red Deer and Otter show painterly PNG illustrations as card art zone backgrounds; all other species show SVG silhouette fallback.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add imageUrl to types, API routes, and seed data | 27e866b | discovery.ts, route.ts, page.tsx, seed.ts, species-seed.ts |
| 2 | Wire imageUrl display in BeastiaryCard and SpeciesCard | 27e866b | BeastiaryCard.tsx, SpeciesCard.tsx |

## What Was Built

**Data layer (Task 1):**
- `src/types/discovery.ts` — Added `imageUrl?: string | null` as last field of `SpeciesResult`
- `src/app/api/discover/route.ts` — Added `imageUrl: species.imageUrl` to SELECT; flows through `...rest` spread automatically
- `src/app/(app)/beastiary/page.tsx` — Added `imageUrl: species.imageUrl` to SELECT and `imageUrl: s.imageUrl ?? null` to speciesRows map
- `data/species-seed.ts` — Red Deer: `imageUrl: '/cards/red-deer.png'`; Otter: `imageUrl: '/cards/otter.png'`; all others remain `imageUrl: null`
- `data/seed.ts` — Added `imageUrl: entry.imageUrl ?? null` to `onConflictDoUpdate` set block so re-seeding updates existing rows
- `npm run db:seed` ran successfully: "Seed complete. 115 species upserted."

**Component layer (Task 2):**
- `src/components/beastiary/BeastiaryCard.tsx` — `SpeciesCardData` type extended with `imageUrl?: string | null`. CollectedCard art zone: `hasImage` boolean, conditional `backgroundImage: url(...)` + `backgroundSize: cover` + `backgroundPosition: center`, `AnimalIcon` conditionally omitted when image present, `grain` div always rendered. DetailPanel art zone: same pattern on the 180px container div; inner AnimalIcon wrapper div conditionally rendered only when `!hasImage`.
- `src/components/discover/SpeciesCard.tsx` — SpeciesRow 44×62px mini thumbnail: conditional backgroundImage cover, AnimalIcon wrapper omitted when image present. ConfirmBanner 40×56px thumbnail: same pattern with `overflow: hidden` added for correct cover clipping.

## Verification Results

```
src/types/discovery.ts:14:  imageUrl?: string | null;
src/app/api/discover/route.ts:87:      imageUrl: species.imageUrl,
src/app/(app)/beastiary/page.tsx:26:      imageUrl: species.imageUrl,
src/app/(app)/beastiary/page.tsx:77:    imageUrl: s.imageUrl ?? null,
data/seed.ts:25:          imageUrl: entry.imageUrl ?? null,
data/species-seed.ts:1588:    imageUrl: '/cards/red-deer.png',
data/species-seed.ts:1694:    imageUrl: '/cards/otter.png',
```

Card images confirmed present: `public/cards/red-deer.png`, `public/cards/otter.png`

Seed output: "Seed complete. 115 species upserted."

## Deviations from Plan

None — plan executed exactly as written. The `...rest` spread in discover route carried `imageUrl` through without needing an explicit mapping in the filtered map, as anticipated by the plan comment.

## Known Stubs

None. Red Deer and Otter have real images wired end-to-end. Fox and all other species correctly fall back to SVG silhouette (imageUrl remains null).

## Threat Flags

None. `imageUrl` values are developer-seeded paths to `public/assets`; no user-controlled input reaches the `backgroundImage` CSS property (T-09-02-01 accepted per threat model).

## Self-Check: PASSED

- [x] `src/types/discovery.ts` contains `imageUrl?: string | null`
- [x] `src/app/api/discover/route.ts` SELECT contains `imageUrl: species.imageUrl`
- [x] `src/app/(app)/beastiary/page.tsx` SELECT and speciesRows map both contain imageUrl
- [x] `data/seed.ts` onConflictDoUpdate set contains `imageUrl: entry.imageUrl ?? null`
- [x] `data/species-seed.ts` Red Deer has `/cards/red-deer.png`, Otter has `/cards/otter.png`
- [x] `BeastiaryCard.tsx` CollectedCard and DetailPanel art zones have conditional backgroundImage
- [x] `SpeciesCard.tsx` SpeciesRow and ConfirmBanner thumbnails have conditional backgroundImage
- [x] `backgroundSize: 'cover'` and `backgroundPosition: 'center'` set alongside every `backgroundImage`
- [x] `grain` div always rendered in BeastiaryCard art zones
- [x] Commit 27e866b exists and includes all 7 modified files
- [x] `public/cards/red-deer.png` and `public/cards/otter.png` confirmed present
- [x] `npm run db:seed` exited 0 with "Seed complete. 115 species upserted."
