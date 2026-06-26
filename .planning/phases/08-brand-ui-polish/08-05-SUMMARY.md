---
phase: 08-brand-ui-polish
plan: "05"
subsystem: nav-chrome
tags: [navshell, pledge-modal, forest-night, tsc-clean]
dependency_graph:
  requires: [08-03, 08-04]
  provides: [forest-night-nav, forest-night-pledge-modal]
  affects: [src/components/NavShell.tsx, src/components/auth/PledgeModal.tsx]
tech_stack:
  added: []
  patterns: [inline-styles-forest-night, svg-icon-components]
key_files:
  modified:
    - src/components/NavShell.tsx
    - src/components/auth/PledgeModal.tsx
decisions:
  - "Removed lucide-react icon imports from NavShell; replaced with inline SVG components copied from ScoutBeastiary.jsx prototype"
  - "NavShell uses max-width 390 mobile-first container matching the design prototype"
  - "Desktop sidebar retained with Forest Night styling; top nav bar added for mobile only (md:hidden)"
  - "PledgeModal mutation logic and POST /api/pledge/accept route unchanged — visual only"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-26"
  tasks_completed: 2
  files_modified: 2
---

# Phase 08 Plan 05: NavShell + PledgeModal Forest Night Polish Summary

NavShell redesigned with Forest Night dark theme: SCOUT wordmark in Syne 800, SVG Nearby/Logbook icons (exact copies from ScoutBeastiary.jsx prototype), active dot indicator, Signal green (#72cc4a) active state. PledgeModal updated with #0d1c12 background, Signal green CTA, Syne 800 uppercase title. Full project tsc and Next.js build both exit 0.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | NavShell Forest Night + SVG icons | 93dcf85 | src/components/NavShell.tsx |
| 2 | PledgeModal Forest Night + full tsc check | 93dcf85 | src/components/auth/PledgeModal.tsx |

## What Was Built

### NavShell.tsx
- Replaced Tailwind light theme with Forest Night dark styling throughout
- Removed `lucide-react` imports (Home, BookOpen, Compass, User icons)
- Defined two inline SVG icon components:
  - `IconNearby({ active })` — location pin SVG (22×22, viewBox 0 0 24 24), stroke `#72cc4a` active / `#2e5a3a` inactive
  - `IconLogbook({ active })` — 4-square grid SVG (22×22, viewBox 0 0 24 24), same colour logic
- Reduced nav items from 4 (Home, Beastiary, Discover, Profile) to 2 (Nearby `/discover`, Logbook `/beastiary`)
- Mobile top bar: sticky h-56, `linear-gradient(180deg,#0d1c12,#091410)` bg, SCOUT wordmark Syne 800 #e8f0e4
- Mobile bottom tab bar: fixed bottom, max-width 390, gradient bg, active dot indicator
- Desktop sidebar: Forest Night bg `#0d1c12`, `border-right: 1px solid rgba(114,204,74,.1)`, SCOUT wordmark 20px

### PledgeModal.tsx
- Modal overlay: `rgba(0,0,0,.85)` + `backdrop-filter: blur(4px)`
- Modal box: `background: #0d1c12`, `border: 1px solid rgba(114,204,74,.15)`, `border-radius: 18px`
- Title: Syne 800 20px `#e8f0e4` uppercase
- Subtitle: Outfit 13px `#2e5a3a`
- Pledge text box: `rgba(114,204,74,.06)` bg, `rgba(114,204,74,.1)` border, Outfit 13px `#3a6040`
- CTA button: `#72cc4a` bg, `#0d1c12` text, Syne 800 uppercase, border-radius 14px
- All mutation logic and `/api/pledge/accept` POST call unchanged

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

```
npx tsc --noEmit → EXIT:0 (zero type errors across entire project)
npm run build → ✓ Compiled successfully (all 13 routes)
```

### Acceptance Criteria Checks (NavShell)
- `grep -c "SCOUT"` → 2 (wordmark in top bar and desktop sidebar)
- `grep -c "IconNearby\|IconLogbook"` → 4 (two definitions + two usages in navItems)
- `grep -c "#72cc4a"` → 5 (active states throughout)
- `grep -c "#2e5a3a"` → 4 (inactive states throughout)
- `grep -c "lucide-react"` → 0 (old icon library removed)
- `grep -c "Home\|Profile"` → 0 (removed nav items)

### Acceptance Criteria Checks (PledgeModal)
- `grep -c "#0d1c12"` → 2 (modal background + CTA text color)
- `grep -c "rgba(114,204,74,.15)"` → 1 (modal border)
- `grep -c "Syne"` → 2 (title + button font)
- `grep -c "#72cc4a"` → 1 (CTA background)
- `grep -c "bg-gray-900"` → 0 (old Tailwind class removed)

## Known Stubs

None — all components render real data.

## Threat Flags

No new threat surfaces introduced. PledgeModal mutation and `/api/pledge/accept` route unchanged.

## Self-Check: PASSED

- src/components/NavShell.tsx: EXISTS
- src/components/auth/PledgeModal.tsx: EXISTS
- Commit 93dcf85: EXISTS (verified via git log)
- tsc --noEmit: EXIT 0
- npm run build: Compiled successfully (13/13 routes)
