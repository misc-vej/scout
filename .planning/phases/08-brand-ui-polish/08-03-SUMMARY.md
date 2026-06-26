---
phase: 08-brand-ui-polish
plan: "03"
subsystem: beastiary-ui
tags: [logbook, beastiary, ui, design-system, cards, rarity, tabs]
dependency_graph:
  requires: [08-01, 08-02]
  provides: [logbook-ui, collected-card, locked-card, detail-panel, beastiary-client]
  affects: [src/app/(app)/beastiary, src/components/beastiary]
tech_stack:
  added: []
  patterns: [server-component-to-client-handoff, inline-styles-design-tokens, client-state-management]
key_files:
  created:
    - src/components/beastiary/BeastiaryClient.tsx
  modified:
    - src/components/beastiary/BeastiaryCard.tsx
    - src/app/(app)/beastiary/page.tsx
decisions:
  - "Extracted client interactivity into BeastiaryClient.tsx (sibling component) rather than embedding in page.tsx"
  - "SpeciesCardData type exported from BeastiaryCard.tsx for use in BeastiaryClient"
  - "Rarity filter uses super_rare (DB key) not veryrare (prototype key) to match DB enum values"
  - "PersonalityPicker import preserved but not rendered — personality now set via Nearby log modal"
  - "void PersonalityPicker used to satisfy linter while keeping import"
metrics:
  duration: "~20 minutes"
  completed: "2026-06-26"
  tasks_completed: 2
  files_modified: 3
---

# Phase 08 Plan 03: Logbook Redesign Summary

Replaced the taxonomy-grouped Beastiary list with the Forest Night Logbook design from ScoutBeastiary.jsx. The screen now has Collection/Not Found tabs, rarity filter pills, a 3-column SVG silhouette card grid, and a detail bottom sheet.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | BeastiaryCard.tsx — CollectedCard, LockedCard, DetailPanel | 3bc4e11 | src/components/beastiary/BeastiaryCard.tsx |
| 2 | beastiary/page.tsx — Logbook redesign with tabs and rarity filter | 3bc4e11 | src/app/(app)/beastiary/page.tsx, src/components/beastiary/BeastiaryClient.tsx |

## What Was Built

### BeastiaryCard.tsx (fully replaced)
- `BeastiaryCard` wrapper: renders `CollectedCard` or `LockedCard` based on `sightingCount` presence
- `CollectedCard`: `5/7` aspect ratio, tier `border + artBg + glowAnimation` from `getRarityConfig`, `AnimalIcon` at 54% + `.grain` overlay, shiny shimmer, tier label + species name (Syne 700) + personality chip (Bloom)
- `LockedCard`: dark `#080e0a` bg, `?` in Syne 800 at 46px faded to `tierColor18`, "Not found" italic, `.grain` overlay at 0.4 opacity
- `DetailPanel` (named export): fixed overlay dim + slide-up sheet, 180px art zone with gradient bg + `AnimalIcon` + tier badge + card number, Syne 800 name, Outfit italic latin, personality (Bloom) + habitat (Signal) chips, stats row (sightingCount + firstSeen formatted as "Jun 25")
- Hover: `scale(1.04)` with `0.15s ease` transition via React `useState` hovered flag
- All colors/typography via inline styles matching prototype exactly

### BeastiaryClient.tsx (new)
- `"use client"` component managing tab, rarityFilter, selected species state
- Tab bar: Collection | Not Found — Signal green active tab, muted inactive
- Rarity filter pills (horizontal scroll): All, Common, Uncommon, Rare, V.Rare, Legendary, Mythic — active pill uses `getRarityConfig().borderColor`
- 3-column grid: `display:grid; gridTemplateColumns:repeat(3,1fr); gap:8`
- Nav bar: sticky, SCOUT wordmark (Syne 800) + progress counter pill (Outfit 11px 600 Signal green)
- Bottom nav: Nearby (SVG pin, `/discover` link) + Logbook (SVG 4-square, active state with Signal green dot)
- Empty state: "Nothing here" + "Try a different filter." when filtered list is empty

### beastiary/page.tsx (server component rewrite)
- Auth gate preserved
- DB query uses explicit `.select()` including `speciesType`, `taxonomyGroup` (as habitat), ordered by `id ASC`
- Collections query includes `firstSightedAt` (ISO string serialized before passing to client)
- Zero-padded card number: `"#" + String(index + 1).padStart(3, "0")` from array index
- Passes flat `speciesRows` array + `totalCollected` + `totalSpecies` to `BeastiaryClient`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Rarity filter key mismatch**
- **Found during:** Task 2
- **Issue:** The prototype uses `"veryrare"` as the rarity filter value but the DB enum and `getRarityConfig` use `"super_rare"`. Used `"super_rare"` throughout the filter to match actual DB data.
- **Fix:** RARITY_FILTERS array uses `"super_rare"` with label "V.Rare"
- **Files modified:** src/components/beastiary/BeastiaryClient.tsx

**2. [Rule 3 - Blocking] Page.tsx prop mismatch with old BeastiaryCard**
- **Found during:** Post-Task-1 tsc check
- **Issue:** Old page.tsx passed `conservationStatus` which no longer exists in the new `SpeciesCardData` type
- **Fix:** Rewrote page.tsx as Task 2 (planned)

## Known Stubs

None — all data flows are wired to the DB. The `personalityTrait`, `isShiny`, `firstSightedAt`, and `sightingCount` fields are all populated from the live `collections` table.

## Threat Flags

None — no new network endpoints or auth paths introduced. Existing `auth()` gate maintained in server component.

## Self-Check: PASSED

- `src/components/beastiary/BeastiaryCard.tsx` — exists, exports BeastiaryCard + DetailPanel
- `src/components/beastiary/BeastiaryClient.tsx` — exists, exports BeastiaryClient
- `src/app/(app)/beastiary/page.tsx` — exists, server component with auth gate
- Commit `3bc4e11` — verified in git log
- `npx tsc --noEmit` — exits 0 (clean)
