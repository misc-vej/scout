---
phase: 09-light-mode-card-art
verified: 2026-06-26T00:00:00Z
status: passed
score: 4/4 must-haves verified
overrides_applied: 0
gaps: []
---

# Phase 9: Light Mode + Card Art Verification Report

**Phase Goal:** Switch primary palette to Field Cream (light); add painterly card illustrations as art-zone backgrounds for Red Deer and Otter.
**Verified:** 2026-06-26
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | App background is Field Cream (#f5f0e4); surfaces use Warm (#e8d8c0); text uses Forest (#1c2e1e); CTA uses Signal-light (#2a7a48); rarity tiers, glow animations, and personality chips remain correct | VERIFIED | globals.css `:root` has `--void: #f5f0e4`, `--deep: #e8d8c0`, `--signal: #2a7a48`, `--mist: #1c2e1e`. NavShell outer bg `#f5f0e4`. Rarity vars (`--rarity-*`) and all `@keyframes` blocks unchanged. Bloom purple chips left as `rgba(184,120,232,*)` in BeastiaryCard and SpeciesCard LogModal. Grep for all Forest Night hex values across all 7 in-scope files returned zero matches. |
| 2 | Red Deer and Otter species cards display their painterly PNG illustration as the art zone background in both BeastiaryCard and SpeciesRow mini thumbnail | VERIFIED | `data/species-seed.ts` line 1588: `imageUrl: '/cards/red-deer.png'`; line 1694: `imageUrl: '/cards/otter.png'`. `BeastiaryCard.tsx` CollectedCard art zone (line 147-151) and DetailPanel art zone (line 411-415) both have conditional `backgroundImage: url(${species.imageUrl})` with `backgroundSize: 'cover'` and `backgroundPosition: 'center'`. `SpeciesCard.tsx` SpeciesRow mini thumbnail (lines 59-63) and ConfirmBanner thumbnail (lines 521-525) apply the same pattern. `public/cards/red-deer.png` and `public/cards/otter.png` confirmed present. |
| 3 | Species cards without an assigned illustration continue to show the SVG silhouette fallback | VERIFIED | BeastiaryCard CollectedCard: `{!hasImage && <AnimalIcon ... />}` (line 154). DetailPanel: `{!hasImage && <div>...<AnimalIcon /></div>}` (line 418). SpeciesRow: `{!sp.imageUrl && <div>...<AnimalIcon /></div>}` (line 66). ConfirmBanner: `{!species.imageUrl && <AnimalIcon ... />}` (line 528). All species other than Red Deer and Otter have `imageUrl: null` in seed data. |
| 4 | tsc build passes with zero type errors | VERIFIED | `npx tsc --noEmit` exited 0 with no output. `SpeciesResult` in `src/types/discovery.ts` includes `imageUrl?: string | null`. `SpeciesCardData` in `BeastiaryCard.tsx` includes `imageUrl?: string | null`. Beastiary page SELECT and speciesRows map both include `imageUrl: s.imageUrl ?? null`. Discover route SELECT includes `imageUrl: species.imageUrl`. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/globals.css` | Field Cream CSS custom properties (`--void: #f5f0e4`) | VERIFIED | `:root` has `--void: #f5f0e4`, `--deep: #e8d8c0`, `--signal: #2a7a48`, `--mist: #1c2e1e`, `--subtle: #6a9a78`, `--faint: #e8d8c0`. Rarity vars and keyframes untouched. |
| `src/components/NavShell.tsx` | Light shell with `#f5f0e4` background and `#2a7a48` active icons | VERIFIED | Outer div `background: "#f5f0e4"` (line 40). Active icon `s = "#2a7a48"`, inactive `s = "#a0b8a0"` (lines 6, 16). Bottom tab gradient uses `#f5f0e4` (line 122). SCOUT wordmark `color: "#1c2e1e"` (lines 48, 101). |
| `src/components/beastiary/BeastiaryCard.tsx` | Light card info strip; conditional PNG/SVG art zone; `imageUrl` in type | VERIFIED | CollectedCard species name `color: "#1c2e1e"` (line 196). LockedCard `background: "#e8d8c0"` (line 249). DetailPanel `background: "#f5f0e4"` (line 371). `imageUrl?: string | null` in `SpeciesCardData` type (line 21). Conditional `backgroundImage` in both CollectedCard and DetailPanel art zones. |
| `src/components/discover/SpeciesCard.tsx` | Light SpeciesRow, LogModal, ConfirmBanner; conditional PNG/SVG thumbnail | VERIFIED | LogModal `background: '#f5f0e4'` (line 292). "I saw it" button `background: '#2a7a48'`, `color: '#f5f0e4'` (lines 208-209). ConfirmBanner `background: '#f5f0e4'` (line 498). SpeciesRow thumbnail and ConfirmBanner thumbnail both have conditional `backgroundImage` pattern. |
| `src/types/discovery.ts` | `SpeciesResult` with `imageUrl?: string | null` | VERIFIED | Line 14: `imageUrl?: string | null;` |
| `src/app/api/discover/route.ts` | SELECT includes `imageUrl: species.imageUrl` | VERIFIED | Line 87: `imageUrl: species.imageUrl` in SELECT block. |
| `src/app/(app)/beastiary/page.tsx` | SELECT and speciesRows map include `imageUrl` | VERIFIED | Line 26: `imageUrl: species.imageUrl` in SELECT. Line 77: `imageUrl: s.imageUrl ?? null` in speciesRows map. |
| `data/species-seed.ts` | Red Deer `imageUrl: '/cards/red-deer.png'`; Otter `imageUrl: '/cards/otter.png'` | VERIFIED | Line 1588: `imageUrl: '/cards/red-deer.png'`. Line 1694: `imageUrl: '/cards/otter.png'`. |
| `public/cards/red-deer.png` | Painterly PNG present | VERIFIED | File confirmed present via `ls public/cards/`. |
| `public/cards/otter.png` | Painterly PNG present | VERIFIED | File confirmed present via `ls public/cards/`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `globals.css :root` | All components | CSS custom properties | VERIFIED | `--void: #f5f0e4` set; body inherits via custom property. |
| `NavShell.tsx` | Shell background | Inline `background: "#f5f0e4"` | VERIFIED | Line 40 confirmed. |
| `data/species-seed.ts` Red Deer/Otter entries | Species DB rows | `imageUrl` field in upsert set in `data/seed.ts` | VERIFIED | `data/seed.ts` `onConflictDoUpdate` set includes `imageUrl: entry.imageUrl ?? null`. |
| `src/app/api/discover/route.ts` | `SpeciesResult` | `imageUrl: species.imageUrl` in SELECT | VERIFIED | Line 87 confirmed. |
| `src/app/(app)/beastiary/page.tsx` | `BeastiaryCard` via `BeastiaryClient` | `imageUrl: s.imageUrl ?? null` in speciesRows map | VERIFIED | Lines 26 and 77 confirmed. |
| `BeastiaryCard.tsx` art zone | `public/cards/red-deer.png` | `backgroundImage: \`url(${species.imageUrl})\`` | VERIFIED | Lines 148 and 412 confirmed with `backgroundSize: 'cover'` and `backgroundPosition: 'center'`. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| tsc --noEmit exits 0 | `npx tsc --noEmit` | No output, exit 0 | PASS |
| Field Cream hex in NavShell | `grep -n "f5f0e4" NavShell.tsx` | 4 matches (lines 40, 44, 92, 122) | PASS |
| imageUrl in BeastiaryCard | `grep -n "imageUrl" BeastiaryCard.tsx` | 5 matches (type, hasImage bool, two backgroundImage uses) | PASS |
| imageUrl Red Deer & Otter in seed | `grep -n "imageUrl" species-seed.ts \| grep "deer\|otter"` | `/cards/red-deer.png` line 1588, `/cards/otter.png` line 1694 | PASS |
| No Forest Night hex values remaining | grep for `#0a1410`, `#0d1c12`, `#091410`, `#72cc4a`, `#e8f0e4`, `#2e5a3a` across all 7 in-scope files | 0 matches | PASS |
| Rarity vars and keyframes untouched | `grep "rarity-common-border\|gold-glow\|orange-glow\|purple-glow" globals.css` | 4 lines present and unchanged | PASS |
| Card PNG images exist | `ls public/cards/` | `otter.png`, `red-deer.png` | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| POLISH-01 | 09-01, 09-03 | Field Cream light palette switch across all UI components | SATISFIED | All 7 in-scope files updated; zero Forest Night hex values remain. |
| POLISH-02 | 09-02, 09-03 | Painterly card illustrations as art-zone backgrounds for Red Deer and Otter | SATISFIED | End-to-end imageUrl flow: seed → DB → API → component. BeastiaryCard and SpeciesRow both display PNG when imageUrl present, SVG fallback when null. |

### Anti-Patterns Found

None. No TBD, FIXME, XXX, or placeholder markers found in phase-modified files. No stub patterns detected. No Forest Night hex values remain outside rarity block.

### Human Verification Required

None required for automated checks. The following visual behaviors are inherently human-verifiable but are not blockers for phase sign-off:

1. **Visual appearance of Field Cream palette** — Confirm the app renders with cream-parchment backgrounds, Forest dark text, and sage secondary text on an actual device or browser. All hex values are verified correct in code.

2. **Painterly PNG rendering quality** — Confirm Red Deer and Otter illustrations fill their art zones correctly (cover + center) and grain overlay renders over the images as intended.

3. **SVG silhouette fallback appearance** — Confirm species without imageUrl continue to show SVG silhouettes against the new Warm (#e8d8c0) LockedCard background.

---

_Verified: 2026-06-26_
_Verifier: Claude (gsd-verifier)_
