# Phase 5 Validation — Beastiary UI + Personality

**Phase:** 05 — Beastiary UI + Personality
**Requirements:** BEAST-01, BEAST-02, BEAST-03

---

## BEAST-01: Fun facts per species

**Requirement:** Every species in the beastiary has a playful, irreverent fun fact displayed on its unlocked card.

| # | Assertion | Automated Check | Plan |
|---|-----------|-----------------|------|
| 1 | `fun_fact` column exists in Neon species table | `SELECT fun_fact FROM species LIMIT 1` — must not error | 05-01 |
| 2 | All ~115 species rows have a non-null fun_fact | `SELECT COUNT(*) FROM species WHERE fun_fact IS NULL` → 0 | 05-01 |
| 3 | No duplicate fun facts | `SELECT fun_fact, COUNT(*) FROM species GROUP BY fun_fact HAVING COUNT(*) > 1` → 0 rows | 05-01 |
| 4 | funFact rendered on unlocked card | `grep -c "funFact" src/components/beastiary/BeastiaryCard.tsx` → ≥ 1 | 05-03 |
| 5 | funFact NOT shown on locked cards | BeastiaryCard locked branch contains no funFact reference (visual inspection) | 05-03 |
| 6 | Fun facts are playful in tone | Spot-check 10 seed entries — none should be generic biology summaries (human review) | 05-01 |

---

## BEAST-02: Personality trait per collected species

**Requirement:** Users can assign one of 8 fixed personality traits to any species in their collection. Trait is saved and displayed.

| # | Assertion | Automated Check | Plan |
|---|-----------|-----------------|------|
| 1 | `personality_trait` column exists in Neon collections table | `SELECT personality_trait FROM collections LIMIT 1` — must not error | 05-02 |
| 2 | PATCH endpoint exists | `grep -rn "PATCH" src/app/api/collections/\[speciesId\]/personality/route.ts` → match | 05-02 |
| 3 | PATCH validates against 8 allowed traits | `curl -X PATCH .../personality -d '{"trait":"InvalidTrait"}'` → 400 | 05-02 |
| 4 | PATCH requires auth | `curl -X PATCH .../personality` (no session cookie) → 401 | 05-02 |
| 5 | PATCH updates correct user's row (no IDOR) | WHERE clause uses both userId AND speciesId: `grep -c "userId" src/app/api/collections/\[speciesId\]/personality/route.ts` → ≥ 1 | 05-02 |
| 6 | Trait displayed on unlocked card | `grep -c "personalityTrait" src/components/beastiary/BeastiaryCard.tsx` → ≥ 1 | 05-03 |
| 7 | Selected trait highlighted green | `grep -c "bg-green-600" src/components/beastiary/PersonalityPicker.tsx` → ≥ 1 | 05-03 |
| 8 | Trait persists on page reload | Human verification — reload after selecting a trait; same trait highlighted | 05-03 |
| 9 | Trait changeable — re-PATCH | Human verification — click different trait; new trait highlights, old clears | 05-03 |

---

## BEAST-03: Beastiary card grid with locked/unlocked states

**Requirement:** The beastiary shows a card grid where uncollected species are silhouetted and collected species show full cards with details.

| # | Assertion | Automated Check | Plan |
|---|-----------|-----------------|------|
| 1 | Card grid present on /beastiary | `grep -c "grid-cols-2" src/app/(app)/beastiary/page.tsx` → ≥ 1 | 05-03 |
| 2 | 3-col grid on md+ | `grep -c "md:grid-cols-3" src/app/(app)/beastiary/page.tsx` → ≥ 1 | 05-03 |
| 3 | All 115 species fetched | `db.select().from(species)` with no WHERE in page.tsx (human check) | 05-03 |
| 4 | Locked card shows ??? | `grep -c "???" src/components/beastiary/BeastiaryCard.tsx` → ≥ 1 | 05-03 |
| 5 | Locked card is opacity-30 | `grep -c "opacity-30" src/components/beastiary/BeastiaryCard.tsx` → ≥ 1 | 05-03 |
| 6 | Unlocked card shows initial letter placeholder | `grep -c "charAt(0)" src/components/beastiary/BeastiaryCard.tsx` → ≥ 1 | 05-03 |
| 7 | RarityBadge rendered on unlocked cards | `grep -c "RarityBadge" src/components/beastiary/BeastiaryCard.tsx` → ≥ 1 | 05-03 |
| 8 | Progress bar retained at top | `grep -c "bg-green-500" src/app/(app)/beastiary/page.tsx` → ≥ 1 | 05-03 |
| 9 | Taxonomy filter tab row present | `grep -c "Birds" src/app/(app)/beastiary/page.tsx` → ≥ 1 | 05-03 |
| 10 | PersonalityPicker is client component | `grep -c "'use client'" src/components/beastiary/PersonalityPicker.tsx` → 1 | 05-03 |
| 11 | BeastiaryCard is server component | `grep -c "'use client'" src/components/beastiary/BeastiaryCard.tsx` → 0 | 05-03 |
| 12 | TypeScript compiles cleanly | `npx tsc --noEmit` exits 0 | 05-01, 05-02, 05-03 |
| 13 | Visual/interaction pass | Human-verify checkpoint in 05-03 task 3 passed | 05-03 |

---

## Phase Complete When

- [ ] All BEAST-01 assertions pass (fun facts populated, rendered on cards)
- [ ] All BEAST-02 assertions pass (personality trait saved, displayed, changeable)
- [ ] All BEAST-03 assertions pass (card grid, locked/unlocked states, progress bar, tabs)
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run dev` starts without error
- [ ] Human-verify checkpoint in 05-03 passed ("approved")
