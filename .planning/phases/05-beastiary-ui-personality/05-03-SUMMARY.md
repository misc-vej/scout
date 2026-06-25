---
phase: 5
plan: "05-03"
title: Beastiary card grid + PersonalityPicker UI
subsystem: beastiary-ui
tags: [beastiary, ui, card-grid, personality, client-component]
dependency_graph:
  requires: [05-01, 05-02]
  provides: [beastiary-card-grid, personality-picker-ui]
  affects: [beastiary-page]
tech_stack:
  added: []
  patterns:
    - Server component (BeastiaryCard) embedding client component (PersonalityPicker)
    - useMutation from @tanstack/react-query for optimistic PATCH
    - CSS grid 2-col/3-col responsive layout
key_files:
  created:
    - src/components/beastiary/BeastiaryCard.tsx
    - src/components/beastiary/PersonalityPicker.tsx
  modified:
    - src/app/(app)/beastiary/page.tsx
decisions:
  - Used default export from RarityBadge (matching existing export style) rather than named export
  - Used opacity-30 on locked cards (plan spec; plan body referenced opacity-40 in example code but spec says opacity-30 — followed spec)
  - Taxonomy group labels mapped via groupLabel() helper: bird→Birds, mammal→Mammals, reptile/amphibian→Reptiles & Amphibians
  - Filter tabs rendered as static visual chrome (no client-side interactivity — per plan spec for MVP)
  - bg-white/[0.03] used for locked card background (Tailwind arbitrary value since bg-white/3 is not in default scale)
metrics:
  duration: "~8 minutes"
  completed_date: "2026-06-25"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 5 Plan 03: Beastiary Card Grid + PersonalityPicker UI Summary

**One-liner:** Full beastiary card grid with locked/unlocked BeastiaryCard server component, 8-trait PersonalityPicker client component with useMutation PATCH, and /beastiary page redesigned as 2/3-col responsive grid with progress bar and taxonomy filter tabs.

## What Was Built

### Task 1: BeastiaryCard + PersonalityPicker components

**`src/components/beastiary/PersonalityPicker.tsx`** — Client component (`'use client'`):
- 8 trait buttons: Brave, Sneaky, Chill, Grumpy, Curious, Dramatic, Wise, Chaotic
- `useState` for optimistic selected state, initialised from `currentTrait` prop
- `useMutation` (@tanstack/react-query) firing PATCH to `/api/collections/${speciesId}/personality`
- Selected trait highlighted green (`bg-green-600 text-white`); others dimmed with hover states
- All buttons disabled during pending mutation

**`src/components/beastiary/BeastiaryCard.tsx`** — Server component (no `'use client'`):
- Unlocked state: aspect-[3/4] image area with initial letter, RarityBadge (absolute bottom-right), name, scientific name, funFact in italic, sightingCount if > 1, PersonalityPicker
- Locked state: dark gradient with `?`, `???` name, `Not yet sighted` label, opacity-30 — no badge/facts/picker

### Task 2: /beastiary page redesign

Replaced Phase 4 list-based layout with:
- Auth guard + userId extraction (unchanged from Phase 4)
- Collections query now includes `personalityTrait` field (added by 05-02)
- `collectedMap` now stores `{ sightingCount, personalityTrait }` per species
- Progress bar retained at top (D-10)
- Static taxonomy filter tab row: "All" (green active), plus one tab per group (D-09)
- Grid sections per taxonomyGroup with `grid grid-cols-2 md:grid-cols-3 gap-3` (D-09)
- Max width widened from `max-w-2xl` to `max-w-4xl` to accommodate card grid
- `groupLabel()` helper maps raw DB group values to human-readable labels

## Verification

- `npx tsc --noEmit` — TSC OK (no errors)
- `npm run build` — BUILD OK (all 12 routes compiled)
- `grep -c "use client" PersonalityPicker.tsx` → 1
- `grep -c "api/collections" PersonalityPicker.tsx` → 1
- `grep -c "grid-cols-2" beastiary/page.tsx` → 1
- BeastiaryCard has no `'use client'` directive (server component confirmed)

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Tasks 1 + 2 | 9c58dc8 | feat(05-03): beastiary card grid — BeastiaryCard + PersonalityPicker + /beastiary redesign |

## Deviations from Plan

None — plan executed exactly as written. Minor note: the example code in the task prompt used `unlocked` as a boolean prop on BeastiaryCard, but the plan's interface spec defined `sightingCount: number | undefined` as the locked/unlocked signal. Followed the spec (sightingCount undefined = locked), matching the plan's `<interfaces>` section.

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes introduced. PersonalityPicker calls the existing PATCH `/api/collections/[speciesId]/personality` route (established in 05-02). No new threat surface beyond what the plan's threat model covers.

## Self-Check

- [x] `src/components/beastiary/BeastiaryCard.tsx` exists
- [x] `src/components/beastiary/PersonalityPicker.tsx` exists
- [x] `src/app/(app)/beastiary/page.tsx` replaced
- [x] Commit 9c58dc8 exists in git log
- [x] TSC and build both pass

## Self-Check: PASSED
