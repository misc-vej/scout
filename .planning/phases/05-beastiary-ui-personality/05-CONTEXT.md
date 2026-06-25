# Phase 5: Beastiary UI + Personality — Context

**Gathered:** 2026-06-25
**Phase:** 05 — Beastiary UI + Personality
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the Phase 4 minimal beastiary list with a proper card grid. Deliver: (1) a `funFact` column on the species table populated with playful irreverent facts, (2) a `personalityTrait` column on the collections table + PATCH endpoint to set it, (3) a redesigned /beastiary page with a full card grid — locked species show a silhouette-style placeholder card, collected species show a full card with the placeholder image spanning the top, facts, and a personality picker.

Phase 6 (Rarity Tiers + Shiny Variants) adds visual rarity treatment and the shiny roll — it reads from the same `collections` and `species` tables established here.

</domain>

<decisions>
## Implementation Decisions

### Species Facts
- **D-01:** Add a `funFact` text column to the `species` table (nullable). This is a second text field alongside the existing `description` field. `description` is the straightforward species intro written in Phase 2; `funFact` is the playful, irreverent, surprising one-liner shown on the full card.
- **D-02:** Fun facts are hardcoded in `data/species-seed.ts` (one per species). Re-run `npm run db:seed` to populate all 115 `funFact` values in Neon. The seed uses `onConflictDoUpdate` so this is idempotent.
- **D-03:** Tone for fun facts: playful and irreverent. Examples: Hedgehog — "Britain's most huggable road casualty. Hibernates October–April and doesn't care at all about your plans." / Red Fox — "Urban foxes have worked out how to open bins but still can't figure out how doors work. Respect."

### Personality Traits
- **D-04:** Fixed list of 8 traits: `"Brave"`, `"Sneaky"`, `"Chill"`, `"Grumpy"`, `"Curious"`, `"Dramatic"`, `"Wise"`, `"Chaotic"`. Stored as a text column `personalityTrait` on `collections` (nullable — unset until user picks one).
- **D-05:** Trait assignment: `PATCH /api/collections/:speciesId/personality` — body `{ trait: string }`, validates against the 8 allowed values, updates `collections.personalityTrait` for the authenticated user's row.
- **D-06:** Trait is displayed on the full card and can be changed at any time (re-PATCH to change).

### Card Visual Design
- **D-07:** Card layout (unlocked): tall rectangular card. Top 55%: styled placeholder image area — gray gradient background (`bg-gradient-to-b from-gray-700 to-gray-800`) with a large centered initial letter of the species common name as the "silhouette" (`text-6xl font-black text-white/10`). This fills the visual space without requiring real artwork. Bottom 45%: species name (bold white), scientific name (italic gray), rarity badge, fun fact (small italic text), personality trait display/picker.
- **D-08:** Card layout (locked): same dimensions, but top area uses a darker gradient with lower opacity (`opacity-30`), species name replaced with "???", no facts, no personality picker. Clicking a locked card does nothing (no navigation).
- **D-09:** The beastiary page shows a 2-column grid on mobile (all breakpoints), 3-column on md+. All 115 species displayed at once (no pagination for MVP). Group header tabs or a simple filter by `taxonomyGroup` at the top (Birds / Mammals / Reptiles & Amphibians).
- **D-10:** Progress bar from Phase 4 is retained at the top of the page.
- **D-11:** The personality picker on a card is a row of 8 small clickable trait buttons. The currently selected trait is highlighted (green background). Selecting a trait calls the PATCH endpoint inline without a page reload (TanStack Query `useMutation`). The personality picker is a client component.

### Plan Structure
- **Wave 1 (parallel):**
  - 05-01: Add `funFact` to `species` table → migrate → update species-seed.ts with fun facts → re-run db:seed
  - 05-02: Add `personalityTrait` to `collections` table → migrate → create PATCH /api/collections/[speciesId]/personality
- **Wave 2:**
  - 05-03: Redesign /beastiary page — card grid, BeastiaryCard component, PersonalityPicker client component

</decisions>

<canonical_refs>
## Canonical References

- `.planning/REQUIREMENTS.md` — BEAST-01, BEAST-02, BEAST-03
- `.planning/ROADMAP.md` §Phase 5 — success criteria
- `src/lib/db/schema.ts` — species, collections tables
- `data/species-seed.ts` — 115 species seed data (to add funFact values)
- `src/app/(app)/beastiary/page.tsx` — Phase 4 minimal list to replace
- `src/components/discover/RarityBadge.tsx` — reused in card

</canonical_refs>

<deferred>
## Deferred to Phase 6
- Real artwork / species illustrations
- Shiny variant visual treatment
- Rarity-tier visual treatment beyond the badge

## Deferred to Phase 7
- Responsible spotting guidance on card
- Season-lock UI on card

</deferred>

---

*Phase: 5 — Beastiary UI + Personality*
*Context gathered: 2026-06-25*
