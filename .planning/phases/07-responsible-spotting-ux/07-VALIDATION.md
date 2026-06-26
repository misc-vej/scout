# Phase 7 — Responsible Spotting UX: Validation Checklist

**Phase:** 07-responsible-spotting-ux
**Requirements covered:** RESP-01, RESP-02, RESP-03, RESP-04
**Written:** 2026-06-26

---

## RESP-01 — Spotter's Pledge Gate

**Requirement:** Every user must accept the Spotter's Pledge before any collection action is available.

### Automated checks

```bash
# Schema: pledgeAcceptedAt column exists on profiles table
grep -q "pledge_accepted_at" src/lib/db/schema.ts && echo "PASS" || echo "FAIL"

# API route exists and exports POST
test -f src/app/api/pledge/accept/route.ts && \
  grep -q "export async function POST" src/app/api/pledge/accept/route.ts && \
  echo "PASS" || echo "FAIL"

# PledgeModal is a client component
grep -q "'use client'" src/components/auth/PledgeModal.tsx && echo "PASS" || echo "FAIL"

# Layout imports and conditionally renders PledgeModal
grep -q "PledgeModal" src/app/(app)/layout.tsx && \
  grep -q "pledgeAcceptedAt" src/app/(app)/layout.tsx && \
  echo "PASS" || echo "FAIL"

# TypeScript compiles cleanly
npx tsc --noEmit
```

### Manual verification

1. Sign in as a user who has never accepted the pledge (or clear pledgeAcceptedAt in the DB: `UPDATE profiles SET pledge_accepted_at = NULL WHERE user_id = '<your-id>';`).
2. Navigate to any `/app/*` route. Expected: full-screen dark overlay with "The Scout's Pledge" heading, pledge text, and "I Accept the Pledge" button. No other content visible. Background is blurred.
3. Attempt to close by pressing Escape or clicking outside the modal. Expected: nothing happens — modal is not dismissible.
4. Click "I Accept the Pledge". Expected: button shows "Saving…" briefly, then modal disappears. App content (NavShell, page) renders without a page reload.
5. Refresh the page. Expected: no modal — content renders immediately.
6. Check DB: `SELECT pledge_accepted_at FROM profiles WHERE user_id = '<your-id>';` — value must be a non-null timestamp.

---

## RESP-02 — Ethics Guidance on BeastiaryCards

**Requirement:** Each species has practical spotting tips visible on its BeastiaryCard in a collapsible section.

### Automated checks

```bash
# spottingTips column in species table
grep -q "spotting_tips" src/lib/db/schema.ts && echo "PASS" || echo "FAIL"

# Seed file has spottingTips on 100+ species entries
COUNT=$(grep -c "spottingTips:" data/species-seed.ts)
echo "spottingTips entries: $COUNT"
test "$COUNT" -ge 100 && echo "PASS" || echo "FAIL: expected >=100, got $COUNT"

# EthicsSection is a client component with useState
grep -q "'use client'" src/components/beastiary/EthicsSection.tsx && \
  grep -q "useState" src/components/beastiary/EthicsSection.tsx && \
  echo "PASS" || echo "FAIL"

# BeastiaryCard renders EthicsSection conditionally
grep -q "EthicsSection" src/components/beastiary/BeastiaryCard.tsx && \
  grep -q "spottingTips" src/components/beastiary/BeastiaryCard.tsx && \
  echo "PASS" || echo "FAIL"
```

### Manual verification

1. Open the Beastiary page and find any species you have collected.
2. Expected: a "▸ Responsible spotting" section appears at the bottom of the card, below the personality picker. It is collapsed by default.
3. Click "▸ Responsible spotting". Expected: section expands, showing 1-2 sentences of practical spotting guidance. Toggle arrow changes to "▾".
4. Click "▾ Responsible spotting". Expected: section collapses again.
5. Spot-check a restricted species (e.g., Barn Owl, Peregrine Falcon). Expected: the tip references Schedule 1 or a specific UK law.

---

## RESP-03 — Sensitive Species Badge

**Requirement:** Species with sensitivityLevel caution/sensitive/restricted display a visible badge on their BeastiaryCard.

### Automated checks

```bash
# SensitivityBadge is a server component (no 'use client')
grep -v "use client" src/components/beastiary/SensitivityBadge.tsx | \
  grep -q "SensitivityBadge" && echo "PASS" || echo "FAIL"

# Three badge levels defined
grep -q "caution" src/components/beastiary/SensitivityBadge.tsx && \
  grep -q "sensitive" src/components/beastiary/SensitivityBadge.tsx && \
  grep -q "restricted" src/components/beastiary/SensitivityBadge.tsx && \
  echo "PASS" || echo "FAIL"

# BeastiaryCard renders SensitivityBadge with sensitivityLevel
grep -q "SensitivityBadge" src/components/beastiary/BeastiaryCard.tsx && \
  grep -q "sensitivityLevel" src/components/beastiary/BeastiaryCard.tsx && \
  echo "PASS" || echo "FAIL"
```

### Manual verification

1. Open the Beastiary and find a species with sensitivityLevel 'caution' (e.g., Adder). Expected: amber "Handle with care" badge visible below the scientific name.
2. Find a species with sensitivityLevel 'sensitive' (e.g., Kingfisher). Expected: orange "Sensitive species" badge.
3. Find a species with sensitivityLevel 'restricted' (e.g., Peregrine Falcon). Expected: red "Location restricted" badge.
4. Find a common species (sensitivityLevel 'none'). Expected: no badge rendered.
5. Locked species cards (unauthenticated, `sightingCount === undefined`) should show no badge (the locked card renders the "???" placeholder — SensitivityBadge is only in the unlocked branch).

---

## RESP-04 — Season-Lock UX on Discover

**Requirement:** Season-locked restricted species appear in Discover results but show a disabled "Unavailable until [date]" indicator instead of the Log sighting button.

### Automated checks

```bash
# SpeciesResult type has the two new fields
grep -q "isSeasonLocked" src/types/discovery.ts && \
  grep -q "seasonUnlocksAt" src/types/discovery.ts && \
  echo "PASS" || echo "FAIL"

# discover/route.ts no longer has a .filter() before .map() in the result block
# (replaced by .map() only that sets isSeasonLocked)
grep -q "isSeasonLocked" src/app/api/discover/route.ts && echo "PASS" || echo "FAIL"

# SpeciesCard handles the locked state
grep -q "isSeasonLocked" src/components/discover/SpeciesCard.tsx && \
  grep -q "formatMMDD" src/components/discover/SpeciesCard.tsx && \
  echo "PASS" || echo "FAIL"

# TypeScript compiles cleanly across all changed files
npx tsc --noEmit
```

### Manual verification

1. Find a restricted species with a season lock (e.g., one with seasonLockStart/seasonLockEnd in the DB). Temporarily set today's date to fall within the lock window (or manually query the DB to confirm a species is in-season lock).
2. Navigate to Discover and search a grid square where that species has occurrences. Expected: the species card appears in results but the "Log sighting" button is replaced by a grey pill: "Unavailable until [month day]" (e.g., "Unavailable until 31 Aug"). Pill is not clickable.
3. On the same page, confirm a non-restricted species card still shows "Log sighting" and can be clicked normally.
4. For a restricted species outside its season-lock window: Expected — it appears with a normal "Log sighting" button.
5. Confirm `isSeasonLocked: false` and `seasonUnlocksAt: null` for non-locked species (check network tab in DevTools: POST /api/discover response).

---

## Phase 7 Complete Checklist

- [ ] RESP-01: Pledge modal gates all /app/* routes; non-dismissible; POSTs to /api/pledge/accept; dismisses on acceptance without reload
- [ ] RESP-02: All ~115 species seeded with distinct spottingTips; EthicsSection collapses/expands on BeastiaryCard
- [ ] RESP-03: SensitivityBadge renders on BeastiaryCard for caution/sensitive/restricted species; hidden for 'none'
- [ ] RESP-04: Season-locked species in Discover show "Unavailable until [date]" instead of Log sighting button; non-locked species unaffected
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run db:seed` runs without errors

---

*Phase 7 — Responsible Spotting UX*
*Validation written: 2026-06-26*
