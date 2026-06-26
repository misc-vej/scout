# Phase 6: Rarity Tiers + Shiny Variants — Validation

**Phase:** 06-rarity-shiny-variants
**Requirements covered:** BEAST-04, BEAST-05, BEAST-06

---

## BEAST-04: Rarity tier visual treatment on each card

**Requirement:** Each card shows the species' rarity tier (Common → Mythic) with distinct visual treatment.

**How it is met:**
- `src/components/beastiary/BeastiaryCard.tsx` defines a `RARITY_RING` map covering all six tiers (common, uncommon, rare, super_rare, legendary, mythic), each with a distinct Tailwind ring colour and shadow depth.
- The unlocked card container applies the mapped ring+shadow class to its outer div.
- Shiny cards override the ring to gold (`SHINY_RING`) — this is additive, not replacing the tier information (the tier badge from `RarityBadge` remains bottom-right of the image).
- Locked cards are explicitly excluded from the rarity ring (D-08 constraint) — their class is unchanged.

**Verification:**
- [ ] Visit /beastiary; unlocked common cards show a faint grey ring; rare cards show a blue ring; legendary cards show amber; mythic cards show a red ring.
- [ ] `npx tsc --noEmit` passes clean.

**Implemented in:** 06-02-PLAN.md, Task 1 (BeastiaryCard.tsx update).

---

## BEAST-05: Conservation status badge (BTO Red/Amber/Green) separate from rarity

**Requirement:** Each card shows the species' conservation status (BTO Red/Amber/Green) as a separate badge from rarity.

**How it is met:**
- `src/lib/db/schema.ts` adds `conservationStatus: text("conservation_status")` (nullable) to the species table (D-01).
- `data/species-seed.ts` is updated with `conservationStatus` per species: BTO Red/Amber/Green for birds based on the 2021 BTO assessment; null for mammals, reptiles, amphibians (D-02).
- `src/components/beastiary/ConservationBadge.tsx` renders a small coloured pill (`BTO Red`, `BTO Amber`, `BTO Green`) positioned `absolute bottom-2 left-2` inside the image area — separate from the `RarityBadge` at bottom-right (D-03, D-12).
- The beastiary page passes `conservationStatus` from the species DB row to BeastiaryCard (§8).

**Verification:**
- [ ] Bird cards at /beastiary show a small BTO badge bottom-left of the image.
- [ ] Non-bird cards (mammals, reptiles, amphibians) show no BTO badge (ConservationBadge returns null for null status).
- [ ] `SELECT common_name, conservation_status FROM species WHERE taxonomy_group = 'bird' LIMIT 10` returns non-null statuses after re-seeding.

**Implemented in:** 06-01-PLAN.md Task 2 (seed), 06-02-PLAN.md Tasks 1 and 2 (component + page wire-up).

---

## BEAST-06: Shiny variant — 1-in-50 chance on first collection

**Requirement:** Collected animals have a random chance to come in a shiny rare visual variant.

**How it is met:**
- `src/lib/db/schema.ts` adds `isShiny: boolean("is_shiny").notNull().default(false)` to the collections table (D-04). Existing rows automatically receive false.
- `src/app/api/sightings/route.ts` POST handler rolls `Math.random() < 0.02` (1-in-50) on the first-sighting branch and inserts the result into collections.isShiny (D-05). Subsequent sightings read the stored value — the roll is never repeated (D-06). The response JSON includes `isShiny` (D-07).
- `src/components/beastiary/BeastiaryCard.tsx` applies the gold `SHINY_RING` to shiny unlocked cards, adds a `bg-gradient-to-br from-yellow-400/20 via-transparent to-amber-500/20` shimmer overlay inside the image div, and renders a `✦ Shiny` badge `absolute top-2 left-2` (D-09, D-10, D-11).
- The beastiary page includes `isShiny` in the collections select and passes `entry?.isShiny ?? false` to BeastiaryCard (§8).

**Verification:**
- [ ] Temporarily set `Math.random() < 1.0` in route.ts, log a new sighting for an uncollected species, reload /beastiary — confirm: gold ring, shimmer overlay, ✦ Shiny badge.
- [ ] Revert threshold to `0.02`.
- [ ] POST /api/sightings response body includes `{ sightingCount, firstSighting, isShiny }`.
- [ ] Re-sighting a shiny species does not re-roll (isShiny value stays true).

**Implemented in:** 06-01-PLAN.md Task 2 (route + schema), 06-02-PLAN.md Task 1 (BeastiaryCard), 06-02-PLAN.md Task 2 (page).

---

## Source Audit

| Source | Item | Covered By |
|--------|------|------------|
| BEAST-04 | Rarity tier visual treatment | 06-02 Task 1 (RARITY_RING on BeastiaryCard) |
| BEAST-05 | Conservation status badge | 06-01 Task 2 (seed) + 06-02 Tasks 1-2 |
| BEAST-06 | Shiny variant 1-in-50 | 06-01 Tasks 1-2 + 06-02 Tasks 1-2 |
| D-01 | conservationStatus column on species | 06-01 Task 1 |
| D-02 | Seed conservationStatus per species | 06-01 Task 2 |
| D-03 | BTO status distinct from rarityTier | 06-02 Task 1 (both badges present) |
| D-04 | isShiny column on collections | 06-01 Task 1 |
| D-05 | Shiny rolled once on first collection | 06-01 Task 2 |
| D-06 | isShiny on collection, not sighting | 06-01 Task 2 |
| D-07 | POST response includes isShiny | 06-01 Task 2 |
| D-08 | Rarity ring on unlocked cards only | 06-02 Task 1 |
| D-09 | Shiny overrides ring to gold | 06-02 Task 1 |
| D-10 | Shiny shimmer overlay | 06-02 Task 1 |
| D-11 | ✦ Shiny badge | 06-02 Task 1 |
| D-12 | ConservationBadge component | 06-02 Task 1 |

All source items covered. No deferred decisions included. No items missing.

---

*Phase 6 validation — 2026-06-26*
