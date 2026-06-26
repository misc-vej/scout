---
phase: 07-responsible-spotting-ux
plan: 02
subsystem: responsible-spotting-ui
tags: [ethics, sensitivity, season-lock, beastiary, discover, seed]
dependency_graph:
  requires: [07-01]
  provides: [spottingTips-seeded, EthicsSection, SensitivityBadge, season-lock-flag-ui]
  affects: [BeastiaryCard, SpeciesCard, discover-api, species-seed]
tech_stack:
  added: []
  patterns: [collapsible-toggle, conditional-badge, three-way-conditional-button, flag-not-filter]
key_files:
  created:
    - src/components/beastiary/EthicsSection.tsx
    - src/components/beastiary/SensitivityBadge.tsx
  modified:
    - data/species-seed.ts
    - src/components/beastiary/BeastiaryCard.tsx
    - src/app/(app)/beastiary/page.tsx
    - src/types/discovery.ts
    - src/app/api/discover/route.ts
    - src/components/discover/SpeciesCard.tsx
decisions:
  - "Beastiary page passes spottingTips and sensitivityLevel through from db.select() — no additional query needed as full select already fetches all columns"
  - "Season-lock implementation flips from hard-filter to flag-not-filter — all species appear in Discover results, restricted locked ones render a disabled pill instead of Log sighting button"
  - "formatMMDD helper placed in SpeciesCard file scope rather than a shared util — single use site, avoids premature abstraction"
metrics:
  duration: "~25 minutes"
  completed: "2026-06-26"
  tasks: 3
  files: 7
---

# Phase 07 Plan 02: Responsible Spotting UI Summary

## One-liner

Seeded all 115 species with UK-specific spottingTips, added collapsible EthicsSection and colour-coded SensitivityBadge to BeastiaryCard, and flipped season-lock from hard-filter to disabled-button with "Unavailable until [date]" on the Discover page.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Seed spottingTips for all 115 species | 8cf16ed | data/species-seed.ts |
| 2 | EthicsSection + SensitivityBadge + BeastiaryCard update | 8565812 | EthicsSection.tsx, SensitivityBadge.tsx, BeastiaryCard.tsx, beastiary/page.tsx |
| 3 | Season-lock flag in API + disabled button in SpeciesCard | 8202963 | discovery.ts, discover/route.ts, SpeciesCard.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical data] Beastiary page did not pass spottingTips/sensitivityLevel to BeastiaryCard**
- **Found during:** Task 2
- **Issue:** The beastiary page.tsx was building the species prop object explicitly and did not include the two new fields, causing TypeScript errors and empty rendering
- **Fix:** Added `spottingTips: s.spottingTips ?? null` and `sensitivityLevel: s.sensitivityLevel` to the BeastiaryCard species prop in page.tsx
- **Files modified:** src/app/(app)/beastiary/page.tsx
- **Commit:** 8565812

No other deviations — plan executed as written.

## Requirements Fulfilled

- RESP-01: Spotter's Pledge (completed in 07-01) — marked complete
- RESP-02: Responsible spotting guidance on every species card — EthicsSection collapsible tips
- RESP-03: Sensitive species visually flagged — SensitivityBadge amber/orange/red per level
- RESP-04: Season-locked species cannot be collected during sensitive period — disabled "Unavailable until" pill replaces Log sighting button

## Known Stubs

None. All data is wired from the seeded database through the API to the UI.

## Threat Flags

None. No new network endpoints, auth paths, or trust boundaries introduced. T-07-05 and T-07-06 from the plan threat model apply as documented (accepted).

## Self-Check

- [x] data/species-seed.ts exists with 115 spottingTips entries — FOUND
- [x] src/components/beastiary/EthicsSection.tsx — FOUND
- [x] src/components/beastiary/SensitivityBadge.tsx — FOUND
- [x] src/components/beastiary/BeastiaryCard.tsx includes spottingTips + sensitivityLevel + EthicsSection + SensitivityBadge — FOUND
- [x] src/types/discovery.ts has isSeasonLocked + seasonUnlocksAt — FOUND
- [x] src/app/api/discover/route.ts uses .map() not .filter().map() — FOUND
- [x] src/components/discover/SpeciesCard.tsx has formatMMDD and three-way conditional — FOUND
- [x] Commit 8cf16ed exists — FOUND
- [x] Commit 8565812 exists — FOUND
- [x] Commit 8202963 exists — FOUND
- [x] npm run build — PASSED (13/13 pages generated)
- [x] npx tsc --noEmit — PASSED (no output)
- [x] npm run db:seed — PASSED (115 species upserted)

## Self-Check: PASSED
