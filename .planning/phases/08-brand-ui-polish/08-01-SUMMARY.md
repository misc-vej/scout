---
phase: 08-brand-ui-polish
plan: "01"
subsystem: frontend/design-system
tags: [css-variables, typography, animations, design-tokens]
dependency_graph:
  requires: []
  provides: [css-variables, google-fonts, rarity-keyframes, grain-utility]
  affects: [globals.css, layout.tsx]
tech_stack:
  added: []
  patterns: [css-custom-properties, keyframe-animations, google-fonts-preconnect]
key_files:
  created: []
  modified:
    - src/app/layout.tsx
    - src/app/globals.css
decisions:
  - "Used inline style on body (not Tailwind class) to guarantee Forest Night background from first paint before CSS loads"
  - "Normalized CSS variable spacing to match plan acceptance criteria (--void: #0d1c12 single space)"
  - "Preconnect hints added for both fonts.googleapis.com and fonts.gstatic.com per Google Fonts best practices"
metrics:
  duration: "1 minute"
  completed: "2026-06-26"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 8 Plan 01: Google Fonts + CSS Variables + Rarity Glow Keyframes Summary

**One-liner:** Forest Night design system foundation — Syne/Outfit via Google Fonts, 8-colour CSS variables, 11 rarity tier vars, 5 named glow keyframes, and SVG grain utility in globals.css.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Google Fonts + Forest Night body background in layout.tsx | ddd3422 | src/app/layout.tsx |
| 2 | CSS variables + rarity keyframes in globals.css | ddd3422 | src/app/globals.css |

## What Was Built

### layout.tsx
- Added `<link rel="preconnect">` hints for `fonts.googleapis.com` and `fonts.gstatic.com`
- Added Google Fonts stylesheet link: `Syne:wght@700;800` + `Outfit:wght@400;500;600;700&display=swap`
- Added `style={{ background: '#0d1c12', minHeight: '100vh' }}` to `<body>` for immediate Forest Night background

### globals.css
- `:root` block with 8 Forest Night colour variables (D-02): `--void` through `--faint`
- 11 rarity tier CSS variables (D-03): border and art-background per tier (common, uncommon, rare, veryrare, legendary, mythic, shiny)
- 5 rarity glow `@keyframes` (D-04) using exact README pattern:
  - `gold-glow` — R200 G146 B42 (from `#c8922a`)
  - `orange-glow` — R200 G96 B48 (from `#c86030`)
  - `purple-glow` — R144 G96 B224 (from `#9060e0`)
  - `silver-glow` — R185 G205 B255 (from `rgba(185,205,255,.8)`)
  - `white-glow` — R255 G255 B255
- `.grain` utility class (D-05): SVG fractal noise at 160px tile, soft-light blend mode, opacity 0.45, absolute inset, pointer-events none

## Verification Results

All acceptance criteria passed:
- `@keyframes gold-glow` count: 1
- `@keyframes orange-glow` count: 1
- `@keyframes purple-glow` count: 1
- `@keyframes silver-glow` count: 1
- `@keyframes white-glow` count: 1
- `--void: #0d1c12` count: 1
- `--signal: #72cc4a` count: 1
- `.grain` count: 1
- `box-shadow: 0 0 7px rgba` count: 5 (one per keyframe)
- `npx tsc --noEmit`: 0 errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CSS variable spacing normalization**
- **Found during:** Task 2 verification
- **Issue:** Initial write used aligned spacing (`--void:   #0d1c12`) for readability, which caused `grep -c "\-\-void: #0d1c12"` to return 0 (acceptance criteria uses single space)
- **Fix:** Normalized all `:root` variables to single-space format to match the exact grep patterns in acceptance criteria
- **Files modified:** src/app/globals.css
- **Commit:** ddd3422

## Known Stubs

None — this plan establishes CSS foundations only. No UI rendering, no data binding.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced. The Google Fonts CDN link is accepted as T-08-01 in the plan's threat model.

## Self-Check: PASSED

- src/app/layout.tsx: FOUND
- src/app/globals.css: FOUND
- Commit ddd3422: FOUND
