---
phase: 06-rarity-shiny-variants
plan: 02
subsystem: beastiary-ui
tags: [rarity, shiny, conservation, beastiary-card, server-component]
dependency_graph:
  requires: [06-01]
  provides: [ConservationBadge, rarity-ring-visual, shiny-visual]
  affects: [src/components/beastiary, src/app/(app)/beastiary]
tech_stack:
  added: []
  patterns: [server-component, tailwind-ring-shadow, conditional-styling]
key_files:
  created:
    - src/components/beastiary/ConservationBadge.tsx
  modified:
    - src/components/beastiary/BeastiaryCard.tsx
    - src/app/(app)/beastiary/page.tsx
decisions:
  - Shiny ring overrides rarity ring rather than composing on top — keeps the card visually clean with one dominant ring treatment
  - ConservationBadge returns null for unrecognised status values — defensive; no crash if DB has unexpected values
  - isShiny defaults to false in BeastiaryCard props — safe fallback when entry is absent (locked cards never pass it)
metrics:
  duration: 8m
  completed: 2026-06-26
  tasks_completed: 2
  files_changed: 3
---

# Phase 6 Plan 02: Rarity Glow + Shiny Treatment + ConservationBadge Summary

Rarity-tier glow rings, gold shiny treatment, and BTO conservation badges wired from DB through server page query to BeastiaryCard — all server-side, no client state.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create ConservationBadge + update BeastiaryCard | a2293db | ConservationBadge.tsx (created), BeastiaryCard.tsx |
| 2 | Beastiary page — wire isShiny and conservationStatus | a2293db | page.tsx |

## What Was Built

**ConservationBadge.tsx** — New server component. Accepts `status: string | null`. Maps `red | amber | green` to BTO-coloured pill (bg-red-900/80, bg-amber-900/80, bg-green-900/80). Returns null for null or unrecognised values. No runtime dependencies beyond React/Tailwind.

**BeastiaryCard.tsx** — Extended with:
- `RARITY_RING` constant mapping all 6 rarity tiers to ring+shadow Tailwind classes
- `SHINY_RING` constant for gold override
- `conservationStatus: string | null` added to species sub-type
- `isShiny?: boolean` added as top-level prop (default false)
- Unlocked card container: `border border-white/15` replaced with `RARITY_RING[rarityTier]` lookup (or `SHINY_RING` when isShiny)
- Shiny overlay (gradient + ✦ badge) rendered conditionally inside image area
- ConservationBadge rendered `absolute bottom-2 left-2` inside image area
- Locked card: unchanged — no ring, no badge, no shiny

**page.tsx (beastiary)** — `isShiny: collections.isShiny` added to db.select on collections. `collectedMap` type extended to include `isShiny: boolean | null`. `isShiny={entry?.isShiny ?? false}` and `conservationStatus: s.conservationStatus ?? null` passed to each BeastiaryCard. Species query uses `db.select()` with no column restriction — `conservationStatus` flows through automatically.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc --noEmit`: passed with no output (no errors)
- `npm run build`: all 12 routes compiled successfully
- Human checkpoint (visual verify at /beastiary): skipped per session instructions — build passing is sufficient

## Self-Check: PASSED

- ConservationBadge.tsx: exists at `src/components/beastiary/ConservationBadge.tsx`
- BeastiaryCard.tsx: updated with RARITY_RING, SHINY_RING, isShiny prop, conservationStatus prop, ConservationBadge import
- page.tsx: isShiny in select + collectedMap + BeastiaryCard JSX prop
- Commit a2293db: verified in git log
