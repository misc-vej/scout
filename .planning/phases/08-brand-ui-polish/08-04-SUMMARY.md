---
phase: 08-brand-ui-polish
plan: "04"
subsystem: discover
tags: [ui, redesign, species-rows, log-modal, likelihood]
dependency_graph:
  requires: [08-01, 08-02]
  provides: [nearby-redesign, species-rows, log-modal, likelihood-api]
  affects: [src/types/discovery.ts, src/app/api/discover/route.ts, src/components/discover/SpeciesCard.tsx, src/components/discover/SpeciesList.tsx, src/app/(app)/discover/page.tsx]
tech_stack:
  added: []
  patterns: [useMutation, inline-styles, bottom-sheet, auto-dismiss-banner]
key_files:
  created: []
  modified:
    - src/types/discovery.ts
    - src/app/api/discover/route.ts
    - src/components/discover/SpeciesCard.tsx
    - src/components/discover/SpeciesList.tsx
    - src/app/(app)/discover/page.tsx
decisions:
  - "SpeciesCard default export retained for backwards-compatibility; internally delegates to SpeciesRow + LogModal + ConfirmBanner"
  - "PATCH /api/collections/[id]/personality called via plain fetch inside logMutation.onSuccess (not a second useMutation) per plan instructions"
  - "personality PATCH non-fatal — failure does not block success banner; silently caught"
  - "likelihood bar uses tierColor at 0.7 opacity rather than green/amber threshold logic (cleaner, matches CONTEXT.md D-10 spec)"
metrics:
  duration: ~20min
  completed: "2026-06-26"
  tasks: 3
  files_changed: 5
---

# Phase 8 Plan 04: Nearby Redesign — Species Rows, Likelihood Bar, Log Modal

## One-liner

Nearby/Discover redesigned to species rows with 44×62 mini card thumbnails, normalised likelihood bars, and a bottom-sheet log modal with 8-trait personality picker + auto-dismiss success banner.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | SpeciesResult type + discover API likelihood + speciesType | b4a4d9c | discovery.ts, route.ts |
| 2 | SpeciesCard — SpeciesRow + LogModal + ConfirmBanner | a0fe59c | SpeciesCard.tsx |
| 3 | SpeciesList Forest Night header + discover page container | 3540855 | SpeciesList.tsx, page.tsx |

## What Was Built

**SpeciesResult type (discovery.ts):** Added `speciesType: string | null` and `likelihood: number` fields.

**Discover API (route.ts):** Added `speciesType: species.speciesType` to SELECT; computes `likelihood = recordCount / maxCount` (0.0–1.0 normalised); sorts response by likelihood descending.

**SpeciesCard.tsx (full replacement):**
- `SpeciesRow`: flex row with 44×62 mini card thumbnail (AnimalIcon + tier border + glow), info block (Syne name, Outfit latin, tier/habitat/sensitive chips, likelihood bar 40×3px), right side ("I saw it" button or "Unavailable" pill for season-locked)
- `LogModal`: fixed bottom sheet, drag handle, species name/latin, prompt box, 8 personality chips (Brave/Sneaky/Chill/Grumpy/Curious/Dramatic/Wise/Chaotic) in Bloom colours, Confirm CTA disabled until selection, POST /api/sightings + PATCH /api/collections/[id]/personality on confirm
- `ConfirmBanner`: fixed top-70 banner with mini AnimalIcon thumbnail, auto-dismisses after 3500ms via useEffect timer
- Default export `SpeciesCard` wraps all three, manages `logTarget` and `confirmed` state

**SpeciesList.tsx:** Forest Night list header (#091410 bg) with "Nearby Species" title, species count, "by likelihood" label; sorts species by likelihood descending before rendering; empty state message.

**discover/page.tsx:** Replaced generic Tailwind container with full-viewport Forest Night (#0a1410) flex column, removed hardcoded `<h1>` heading.

## Deviations from Plan

None — plan executed exactly as written. All inline styles used per specification. No new packages installed.

## Known Stubs

None — all data flows from the discover API; likelihood and speciesType are real server-computed values.

## Threat Flags

None — no new API endpoints introduced. Existing auth gates on /api/sightings and /api/collections/[id]/personality are unchanged.

## Self-Check: PASSED

- src/types/discovery.ts — exists, contains speciesType and likelihood
- src/app/api/discover/route.ts — exists, contains speciesType select and maxCount/likelihood computation
- src/components/discover/SpeciesCard.tsx — exists, contains AnimalIcon (×3), getRarityConfig, LogModal, ConfirmBanner, all 8 personality traits, /api/sightings
- src/components/discover/SpeciesList.tsx — exists, contains "Nearby Species", likelihood sort, #091410
- src/app/(app)/discover/page.tsx — exists, contains #0a1410, no px-4 py-8
- Commits b4a4d9c, a0fe59c, 3540855 — all present in git log
- npx tsc --noEmit exits 0
