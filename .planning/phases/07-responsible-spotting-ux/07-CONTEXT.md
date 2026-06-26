# Phase 7: Responsible Spotting UX — Context

**Gathered:** 2026-06-26
**Phase:** 07 — Responsible Spotting UX
**Status:** Ready for planning

<domain>
## Phase Boundary

Four deliverables: (1) Spotter's Pledge modal gate — users must accept before any collection action is available, (2) per-species `spottingTips` text seeded and shown as a collapsible section on BeastiaryCard, (3) sensitive species (sensitivityLevel !== 'none') get a visual indicator on their card, (4) season-locked species show a disabled Log button with "Unavailable until [date]" on the Discover page instead of being silently hidden.

This is the final milestone phase. After Phase 7, v1.0 is feature-complete.

</domain>

<decisions>
## Implementation Decisions

### Spotter's Pledge Gate
- **D-01:** Add `pledgeAcceptedAt: timestamp("pledge_accepted_at", { mode: "date" })` (nullable) to the `profiles` table. Migrate.
- **D-02:** Gate: in `src/app/(app)/layout.tsx`, read the user's profile server-side. If `pledgeAcceptedAt` is null, render a full-screen `<PledgeModal>` component. The modal is a client component that POSTs to `/api/pledge/accept` on confirmation.
- **D-03:** `POST /api/pledge/accept` — auth required, sets `pledgeAcceptedAt = new Date()` on the profile row, returns `{ accepted: true }`.
- **D-04:** The modal is NOT dismissible without accepting. It sits above all page content. Background is blurred/darkened.
- **D-05:** Once accepted, the page renders normally with no reload required — the client component removes the modal from the DOM.
- **D-06:** Pledge text: "The Scout's Pledge — I promise to observe wildlife without disturbing it. I will keep a safe distance, never touch nests or young, stay on paths, and follow the Wildlife & Countryside Act 1981. If I see something rare, I'll keep the location to myself." A single "I Accept the Pledge" button.

### Ethics Guidance on Cards
- **D-07:** Add `spottingTips: text("spotting_tips")` (nullable) to the `species` table. Migrate. Seed all 115 species with 1-2 sentences of practical spotting guidance (safe distance, habitat note, or key do/don't).
- **D-08:** BeastiaryCard gains a collapsible `<EthicsSection>` client component at the bottom, below PersonalityPicker. Shows the `spottingTips` text. Collapsed by default. Toggle button: "▸ Responsible spotting" → "▾ Responsible spotting". If `spottingTips` is null, the section is not rendered.
- **D-09:** EthicsSection is a `"use client"` component using `useState(false)` for the open/closed toggle.

### Sensitive Species Indicator
- **D-10:** Species with `sensitivityLevel !== 'none'` get a `SensitivityBadge` on their BeastiaryCard. Position: below the ConservationBadge in the card footer area (not inside the image area — it needs to be readable).
- **D-11:** Sensitivity levels in DB: `none`, `caution`, `sensitive`, `restricted`. Badge styles:
  - caution: amber — "Handle with care"
  - sensitive: orange — "Sensitive species"
  - restricted: red — "Location restricted"
- **D-12:** The `SensitivityBadge` is a server component. Props: `{ level: string }`. Returns null for 'none'.

### Season-Lock UX on Discover
- **D-13:** Modify `src/app/api/discover/route.ts` — instead of filtering out season-locked restricted species, include them in results but add two fields: `isSeasonLocked: boolean` and `seasonUnlocksAt: string | null` (the MM-DD end date or null). Update `SpeciesResult` type in `src/types/discovery.ts`.
- **D-14:** Update `src/components/discover/SpeciesCard.tsx` — if `species.isSeasonLocked`, replace the Log sighting button with a disabled pill: "Unavailable until [month day]". Parse the MM-DD seasonLockEnd from the species data to compute a readable date. If seasonUnlocksAt is available, format as e.g. "Unavailable until Aug 31".
- **D-15:** The season-lock check in the API mirrors the existing logic: `sensitivityLevel === 'restricted'` AND `mmdd >= seasonLockStart && mmdd <= seasonLockEnd`. Only restricted species have the season-lock enforced at the button level.

### Plan Structure
- **Wave 1:** 07-01 — pledgeAcceptedAt schema + PledgeModal + /api/pledge/accept + layout gate
- **Wave 2:** 07-02 — spottingTips schema + migrate + seed + EthicsSection + SensitivityBadge + season-lock disabled button on SpeciesCard

</decisions>

<canonical_refs>
- `src/lib/db/schema.ts` — profiles table (add pledgeAcceptedAt), species table (add spottingTips)
- `src/app/(app)/layout.tsx` — app shell layout (add pledge gate)
- `src/app/api/discover/route.ts` — discover API (modify season-lock behavior)
- `src/types/discovery.ts` — SpeciesResult type (add isSeasonLocked + seasonUnlocksAt)
- `src/components/discover/SpeciesCard.tsx` — log button (add season-lock disabled state)
- `src/components/beastiary/BeastiaryCard.tsx` — add EthicsSection + SensitivityBadge
- `data/species-seed.ts` — add spottingTips per species
</canonical_refs>

---
*Phase 7 — Responsible Spotting UX*
*Context gathered: 2026-06-26*
