# Phase 6: Rarity Tiers + Shiny Variants — Context

**Gathered:** 2026-06-26
**Phase:** 06 — Rarity Tiers + Shiny Variants
**Status:** Ready for planning

<domain>
## Phase Boundary

Three deliverables: (1) `conservationStatus` column on species seeded with BTO Red/Amber/Green for birds (null for non-birds), (2) `isShiny` boolean on collections, rolled at 1-in-50 probability the moment a species is first collected, (3) BeastiaryCard updated with per-tier rarity border glow, ConservationBadge component, and shiny golden treatment on the image area.

Phase 7 (Responsible Spotting UX) layered on top — reads the same species + collections tables.

</domain>

<decisions>
## Implementation Decisions

### Conservation Status
- **D-01:** Add `conservationStatus: text("conservation_status")` to the species table. Nullable. Values: `'red' | 'amber' | 'green'`. Populated only for birds (BTO lists apply to birds only); null for mammals, reptiles, amphibians.
- **D-02:** Seed data in `data/species-seed.ts` gets a `conservationStatus` field per species. Re-run `npm run db:seed` (idempotent).
- **D-03:** BTO conservation status is distinct from `rarityTier` (game rarity). Both appear on the card.

### Shiny Variant
- **D-04:** Add `isShiny: boolean("is_shiny").notNull().default(false)` to the collections table.
- **D-05:** Shiny is rolled **once, at first collection** (when `firstSighting === true` in POST /api/sightings). `Math.random() < 0.02` (1-in-50). Not re-rolled on subsequent sightings. This matches Pokémon GO's mechanic.
- **D-06:** Shiny is a property of the **collection card**, not the sighting event. The `sightings` table is unchanged.
- **D-07:** The POST /api/sightings route response gains `isShiny: boolean`.

### Visual Design — Rarity Glow
- **D-08:** BeastiaryCard gets a `ring` + `shadow` on the card container div, colour-matched to rarity tier:
  - common: `ring-1 ring-gray-500/30 shadow-sm shadow-gray-500/10`
  - uncommon: `ring-1 ring-green-500/40 shadow-md shadow-green-500/20`
  - rare: `ring-2 ring-blue-500/50 shadow-md shadow-blue-500/25`
  - super_rare: `ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/30`
  - legendary: `ring-2 ring-amber-500/70 shadow-lg shadow-amber-500/35`
  - mythic: `ring-2 ring-red-500/80 shadow-xl shadow-red-500/40`
- **D-09:** Shiny cards override the rarity ring with gold: `ring-2 ring-yellow-400/80 shadow-xl shadow-yellow-400/40`.

### Visual Design — Shiny Image Treatment
- **D-10:** Shiny image area gets a `absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-amber-500/20 pointer-events-none` overlay div inside the relative image container.
- **D-11:** A `✦` badge appears `absolute top-2 left-2 text-yellow-400 font-bold text-sm leading-none bg-yellow-400/10 rounded px-1 py-0.5` — e.g. `✦ Shiny`.

### Visual Design — ConservationBadge
- **D-12:** New `src/components/beastiary/ConservationBadge.tsx` (server component). Props: `{ status: string | null }`. Returns null if status is null. Small pill badge positioned `absolute bottom-2 left-2` inside the image area.
  - red: `bg-red-900/80 text-red-300 text-[10px] font-semibold px-1.5 py-0.5 rounded`
  - amber: `bg-amber-900/80 text-amber-300 ...`
  - green: `bg-green-900/80 text-green-300 ...`
  - Label: "BTO Red", "BTO Amber", "BTO Green"

### Plan Structure
- **Wave 1:**
  - 06-01: Schema (conservationStatus on species + isShiny on collections) + migrate + seed update + modify POST /api/sightings to roll shiny
- **Wave 2:**
  - 06-02: UI — ConservationBadge component + rarity glow on BeastiaryCard + shiny image treatment + pass isShiny from beastiary page query

</decisions>

<canonical_refs>
- `.planning/REQUIREMENTS.md` — BEAST-04, BEAST-05, BEAST-06
- `src/lib/db/schema.ts` — species, collections tables
- `data/species-seed.ts` — 115 species (add conservationStatus)
- `src/app/api/sightings/route.ts` — POST handler (add shiny roll)
- `src/app/(app)/beastiary/page.tsx` — server component (add isShiny to collections query)
- `src/components/beastiary/BeastiaryCard.tsx` — add rarity glow + shiny treatment + ConservationBadge
</canonical_refs>

---
*Phase 6 — Rarity Tiers + Shiny Variants*
*Context gathered: 2026-06-26*
