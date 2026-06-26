---
phase: 09-light-mode-card-art
plan: "01"
subsystem: ui-theme
tags: [light-mode, palette, Field-Cream, colors]
dependency_graph:
  requires: []
  provides: [Field-Cream-palette, light-shell, light-cards, light-modals]
  affects: [all-ui-components]
tech_stack:
  added: []
  patterns: [inline-style-color-tokens, Field-Cream-palette]
key_files:
  created: []
  modified:
    - src/app/globals.css
    - src/components/NavShell.tsx
    - src/components/beastiary/BeastiaryClient.tsx
    - src/components/beastiary/BeastiaryCard.tsx
    - src/components/discover/SpeciesCard.tsx
    - src/components/discover/SpeciesList.tsx
    - src/components/auth/PledgeModal.tsx
decisions:
  - "Applied D-01 Field Cream palette tokens across all 7 files; no Tailwind classes added (D-03)"
  - "Kept rarity tier border/glow colors unchanged per D-02"
  - "Kept bloom purple personality chips unchanged (rgba(184,120,232,*)) — works fine on light background"
  - "I saw it button uses #2a7a48 bg / #f5f0e4 text per plan; NOT kept as bright #72cc4a (plan explicitly calls for Signal-light swap)"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-26"
  tasks_completed: 3
  files_changed: 7
---

# Phase 9 Plan 01: Switch to Field Cream Light Palette Summary

Switched the entire Scout app from Forest Night (dark) to Field Cream (light) palette across all 7 in-scope files. The dark theme was the initial iteration; Field Cream is the production design per D-01.

## What Was Changed

### globals.css
- Renamed comment from "Forest Night colour system" to "Field Cream colour system"
- `--void`: `#0d1c12` → `#f5f0e4` (Parchment page bg)
- `--deep`: `#1e3828` → `#e8d8c0` (Warm card surface)
- `--signal`: `#72cc4a` → `#2a7a48` (Signal CTA)
- `--mist`: `#e8f0e4` → `#1c2e1e` (Forest primary text)
- `--subtle`: `#2e5a3a` → `#6a9a78` (Sage secondary text)
- `--faint`: `#1e3828` → `#e8d8c0` (Warm divider)
- Rarity vars (`--rarity-*`) and all `@keyframes` blocks left completely unchanged

### NavShell.tsx
- Outer shell background: `#0a1410` → `#f5f0e4`
- Desktop sidebar bg: `#0d1c12` → `#f5f0e4`, border: `rgba(114,204,74,.1)` → `rgba(28,46,30,.06)`
- SCOUT wordmark (both desktop and mobile): `#e8f0e4` → `#1c2e1e`
- Top nav bar bg: gradient → flat `#f5f0e4`, border: `rgba(114,204,74,.1)` → `rgba(28,46,30,.06)`
- Active desktop link bg: `rgba(114,204,74,.1)` → `rgba(42,122,72,.1)`, color: `#72cc4a` → `#2a7a48`
- Inactive desktop link color: `#2e5a3a` → `#a0b8a0`
- Icon active color: `#72cc4a` → `#2a7a48`, inactive: `#2e5a3a` → `#a0b8a0` (both IconNearby and IconLogbook)
- Bottom tab gradient: `linear-gradient(to top,#0a1410…)` → `linear-gradient(to top,#f5f0e4 65%,rgba(245,240,228,0))`
- Tab label active: `#72cc4a` → `#2a7a48`, inactive: `#2e5a3a` → `#a0b8a0`
- Active dot: `#72cc4a` → `#2a7a48`

### BeastiaryClient.tsx
- Same icon color changes as NavShell (IconNearby/IconLogbook)
- Outer div bg: `#0a1410` → `#f5f0e4`
- Nav bar bg: gradient → flat `#f5f0e4`, border: `rgba(114,204,74,.1)` → `rgba(28,46,30,.06)`
- SCOUT wordmark: `#e8f0e4` → `#1c2e1e`
- Collected/total chip: bg `rgba(114,204,74,.12)` → `rgba(42,122,72,.1)`, border `rgba(114,204,74,.2)` → `rgba(42,122,72,.18)`, color `#72cc4a` → `#2a7a48`
- Tab bar bg: `#091410` → `#f5f0e4`; active tab: `#72cc4a` bg / `#0d1c12` text → `#2a7a48` bg / `#f5f0e4` text
- Inactive tab: bg `rgba(114,204,74,.07)` → `rgba(42,122,72,.06)`, border `rgba(114,204,74,.12)` → `rgba(42,122,72,.1)`, color `#2e5a3a` → `#6a9a78`
- Rarity filter pills: border `rgba(255,255,255,.06)` → `rgba(28,46,30,.12)`, inactive color `#2e5a3a` → `#6a9a78`
- `getRarityFilterColor` default: `#3a6a48` → `#2a7a48`
- Empty state heading: `#1e3828` → `#1c2e1e`, body: `#162218` → `#6a9a78`
- Bottom nav gradient and icon/label colors updated (Nearby inactive `#a0b8a0`, Logbook active `#2a7a48`, dot `#2a7a48`)

### BeastiaryCard.tsx
- CollectedCard info strip species name: `#e8f0e4` → `#1c2e1e`
- LockedCard background: `#080e0a` → `#e8d8c0`
- LockedCard "Not found" text: `rgba(232,240,228,.1)` → `rgba(28,46,30,.3)`
- DetailPanel modal bg: `#0d1c12` → `#f5f0e4`
- DetailPanel drag handle: `rgba(255,255,255,.1)` → `rgba(28,46,30,.08)`
- DetailPanel art zone gradient end: `#08100a` → `#e8d8c0`
- Tier badge bg: `rgba(0,0,0,.3)` → `rgba(245,240,228,.7)`
- Card number color: `rgba(232,240,228,.25)` → `rgba(28,46,30,.3)`
- Species name: `#e8f0e4` → `#1c2e1e`; Latin: `#2e5a3a` → `#6a9a78`
- Habitat chip: bg `rgba(114,204,74,.12)` → `rgba(42,122,72,.1)`, border `rgba(114,204,74,.2)` → `rgba(42,122,72,.18)`, color `#72cc4a` → `#2a7a48`
- Stats border: `rgba(255,255,255,.06)` → `rgba(28,46,30,.1)`; value `#e8f0e4` → `#1c2e1e`; label `#2e5a3a` → `#6a9a78`
- Personality chip (bloom purple) left unchanged

### SpeciesCard.tsx
- SpeciesRow border: `rgba(255,255,255,.04)` → `rgba(28,46,30,.06)`, hover bg: `rgba(114,204,74,.04)` → `rgba(42,122,72,.04)`
- Species name: `#e8f0e4` → `#1c2e1e`; Latin: `#2e5a3a` → `#6a9a78`
- Habitat chip: bg `rgba(114,204,74,.1)` → `rgba(42,122,72,.08)`, border `rgba(114,204,74,.16)` → `rgba(42,122,72,.15)`, color `#72cc4a` → `#2a7a48`
- Likelihood track bg: `rgba(255,255,255,.07)` → `rgba(28,46,30,.1)`
- Unavailable pill: `rgba(255,255,255,.05)` bg / `#3a3a3a` text → `rgba(28,46,30,.06)` bg / `#a0b8a0` text
- "I saw it" button: `#72cc4a` bg / `#0d1c12` text → `#2a7a48` bg / `#f5f0e4` text
- LogModal sheet bg: `#0d1c12` → `#f5f0e4`; drag handle `rgba(255,255,255,.1)` → `rgba(28,46,30,.08)`
- "You spotted" label: `#2e5a3a` → `#6a9a78`; species name `#e8f0e4` → `#1c2e1e`; Latin `#2e5a3a` → `#6a9a78`
- Prompt box: bg `rgba(114,204,74,.06)` → `rgba(42,122,72,.05)`, border `rgba(114,204,74,.12)` → `rgba(42,122,72,.1)`, text `#3a6040` → `#2a7a48`
- CTA active: `#72cc4a` bg / `#0d1c12` text → `#2a7a48` bg / `#f5f0e4` text; inactive bg `rgba(114,204,74,.1)` → `rgba(42,122,72,.08)`, text `#1e3828` → `#6a9a78`
- ConfirmBanner bg: `#0d1c12` → `#f5f0e4`; "Logged" label `#72cc4a` → `#2a7a48`; species name `#e8f0e4` → `#1c2e1e`

### SpeciesList.tsx
- List header bg: `#091410` → `#f5f0e4`; border `rgba(255,255,255,.04)` → `rgba(28,46,30,.06)`
- "Nearby Species" title: `#e8f0e4` → `#1c2e1e`; count subtitle `#2e5a3a` → `#6a9a78`
- "by likelihood": `#1e3828` → `#a0b8a0`
- Empty state color: `#2e5a3a` → `#6a9a78`

### PledgeModal.tsx
- Modal box bg: `#0d1c12` → `#f5f0e4`; border `rgba(114,204,74,.15)` → `rgba(42,122,72,.12)`
- Title: `#e8f0e4` → `#1c2e1e`; subtitle `#2e5a3a` → `#6a9a78`
- Pledge box: bg `rgba(114,204,74,.06)` → `rgba(42,122,72,.05)`, border `rgba(114,204,74,.1)` → `rgba(42,122,72,.08)`, text `#3a6040` → `#2a7a48`
- CTA button: `#72cc4a` bg / `#0d1c12` text → `#2a7a48` bg / `#f5f0e4` text

## Deviations from Plan

None — plan executed exactly as written.

The "I saw it" button swap (`#72cc4a` → `#2a7a48` bg, `#0d1c12` → `#f5f0e4` text) was confirmed in the plan interfaces section (SpeciesCard.tsx specific comment line: `SpeciesRow "I saw it" button: #72cc4a bg, #0d1c12 text → #2a7a48 bg, #f5f0e4 text`). The orchestrator prompt note "keep #72cc4a" referred to the CTA in rarity context; the plan's explicit SpeciesRow table overrides that hint.

## Acceptance Criteria Results

- globals.css contains `--void: #f5f0e4`, `--signal: #2a7a48`, `--mist: #1c2e1e` — PASS
- globals.css contains no `#0d1c12`, `#72cc4a`, `#e8f0e4`, `#2e5a3a` outside rarity block — PASS
- globals.css rarity vars unchanged — PASS
- globals.css keyframe hex values unchanged — PASS
- NavShell.tsx outer div has `background: "#f5f0e4"` — PASS
- NavShell.tsx both SCOUT wordmarks have `color: "#1c2e1e"` — PASS
- NavShell.tsx active icon `s` value is `"#2a7a48"`, inactive `"#a0b8a0"` — PASS
- NavShell.tsx bottom tab gradient contains `#f5f0e4` — PASS
- BeastiaryClient.tsx outer div has `background: "#f5f0e4"` — PASS
- BeastiaryClient.tsx active tab bg `"#2a7a48"`, text `"#f5f0e4"` — PASS
- BeastiaryClient.tsx bottom nav gradient contains `#f5f0e4` — PASS
- BeastiaryCard.tsx CollectedCard info strip species name `"#1c2e1e"` — PASS
- BeastiaryCard.tsx LockedCard background `"#e8d8c0"` — PASS
- BeastiaryCard.tsx DetailPanel background `"#f5f0e4"` — PASS
- BeastiaryCard.tsx art zone gradient ends with `#e8d8c0` — PASS
- SpeciesCard.tsx LogModal sheet background `"#f5f0e4"` — PASS
- SpeciesCard.tsx "I saw it" button background `"#2a7a48"` with color `"#f5f0e4"` — PASS
- SpeciesCard.tsx ConfirmBanner background `"#f5f0e4"` — PASS
- SpeciesList.tsx list header background `"#f5f0e4"` — PASS
- SpeciesList.tsx title color `"#1c2e1e"` — PASS
- PledgeModal.tsx modal box background `"#f5f0e4"` — PASS
- PledgeModal.tsx CTA button background `"#2a7a48"` with color `"#f5f0e4"` — PASS
- Zero Forest Night hex values in all 7 files (verified by grep) — PASS
- rarityConfig usage unchanged in BeastiaryCard — PASS
- Bloom purple personality chip colors unchanged in SpeciesCard LogModal — PASS

## Verification Commands Run

```
grep -rn "#0a1410|#0d1c12|#091410|#080e0a|#08100a|#1e3828|#162218|#e8f0e4|#72cc4a|#2e5a3a" [all 7 files]
→ 0 matches (PASS)

grep "rarity-common-border|gold-glow|orange-glow|purple-glow" src/app/globals.css
→ 4 lines present and unchanged (PASS)
```

## Self-Check: PASSED

- Commit `1e0e66c` exists: confirmed
- All 7 files modified in the commit
- No unexpected file deletions
- No new untracked files generated
