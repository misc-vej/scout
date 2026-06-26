# Phase 4: Collection Mechanics — Context

**Gathered:** 2026-06-25
**Phase:** 04 — Collection Mechanics
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver: (1) `sightings` + `collections` tables, (2) a "Log sighting" button on each species card in the Discover list that records the sighting and updates the collection, (3) a minimal /beastiary page showing all 115 species as locked (silhouette placeholder) or unlocked (name shown), and (4) a POST /api/sightings endpoint.

Phase 5 (Beastiary UI + Personality) builds the full illustrated card view on top of the `collections` data created here.

</domain>

<decisions>
## Implementation Decisions

### Data Model
- **D-01:** Two tables: `sightings` + `collections`.
  - `sightings`: one row per log event — (id, user_id FK → users, species_id FK → species, grid_square text, sighted_at timestamp). Append-only; never update. One row per tap of "Log sighting".
  - `collections`: one row per (user, species) — (id, user_id FK → users, species_id FK → species, sighting_count integer, first_sighted_at timestamp, last_sighted_at timestamp). Unique constraint on (user_id, species_id). Card is "unlocked" when this row exists (sighting_count ≥ 1).
  - When a user logs a sighting: INSERT into `sightings` AND upsert into `collections` (insert on first sighting, increment sighting_count + update last_sighted_at on subsequent sightings).

- **D-02:** Grid square is passed from the client (from the current Discovery session). The client already knows the grid square (it's displayed on the SpeciesList). The sighting API accepts `{ speciesId, gridSquare }`. No new GPS request — the grid square is the one from the active Discovery session.

- **D-03:** Raw GPS is never sent to the server. The sighting endpoint only receives `speciesId` and `gridSquare`. The client passes the grid square it already has from the Discovery session.

- **D-04:** Proximity to the species location NEVER increases collection value or speed. Every sighting is equal regardless of where in the UK the user is (design pillar from ROADMAP.md).

### "Log Sighting" UI
- **D-05:** The "Log sighting" button lives on `SpeciesCard` in the Discover list — update `src/components/discover/SpeciesCard.tsx` to accept a `gridSquare` prop (passed down from `SpeciesList` → `SpeciesCard`).
- **D-06:** On successful log: show a brief "Logged! ✓" confirmation replacing the button for ~1.5s, then revert. If the species was already collected, show the updated sighting count (e.g. "Logged again! (3× spotted)"). Use local optimistic UI — don't re-fetch the full discovery list.
- **D-07:** SpeciesCard and SpeciesList need to be updated to "use client" since they'll have interactive state (the log button triggers a mutation). Alternatively, a wrapper `SpeciesCardClient` can hold the mutation — either approach is fine.

### Minimal Beastiary
- **D-08:** The /beastiary page (replacing the Phase 1 stub) shows a simple list of all 115 species. Each species is either:
  - **Locked:** gray placeholder — shows common name in gray, "Not yet sighted" subtext
  - **Unlocked:** full name in white, sighting count badge (e.g. "3×"), rarity badge from Phase 3's RarityBadge
- **D-09:** The beastiary page server component fetches the user's `collections` rows and the full `species` list, then merges them for rendering. No client-side fetching needed (server component).
- **D-10:** Basic grouping by `taxonomyGroup` (Birds / Mammals / Reptiles & Amphibians). Simple `<section>` headings.

### API
- **D-11:** `POST /api/sightings` — accepts `{ speciesId: string; gridSquare: string }`. Auth required. Validates inputs. Inserts sighting + upserts collection. Returns `{ sightingCount: number; firstSighting: boolean }`.
- **D-12:** Collection count on SpeciesCard comes from the POST response (optimistic — no re-query of the list). The card shows the count returned from the API.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/REQUIREMENTS.md` — DISC-02 (log sighting, unlock card), DISC-03 (multiple sightings increment count)
- `.planning/ROADMAP.md` §Phase 4 — success criteria, proximity constraint
- `.planning/phases/03-occurrence-pipeline-discovery/03-CONTEXT.md` — D-01 (raw GPS never stored) applies here too
- `src/lib/db/schema.ts` — existing tables: users, accounts, profiles, species, occurrences
- `src/types/discovery.ts` — SpeciesResult type (used by Discover page, extended here)
- `src/components/discover/SpeciesCard.tsx` — to be updated with Log button
- `src/components/discover/SpeciesList.tsx` — to be updated to pass gridSquare to SpeciesCard
- `src/app/(app)/beastiary/page.tsx` — Phase 1 stub to replace

</canonical_refs>

<code_context>
## Existing Code Insights

### Integration Points
- `SpeciesCard` needs a `gridSquare` prop added — currently it only receives `{ species: SpeciesResult }`. The gridSquare is available in `SpeciesList` and `DiscoverClient`.
- The `DiscoverClient` state has `result.gridSquare` available — this should flow down through `SpeciesList` to each `SpeciesCard`.
- Phase 5 will read `collections` to show illustrated cards; the schema established here is the Phase 5 data contract.

### Established Patterns
- Server actions for mutations — but API routes (`/api/sightings/route.ts`) are also acceptable given Phase 3 used API routes consistently.
- TanStack Query `useMutation` — already installed in Phase 3. Use `useMutation` for the Log Sighting button.
- `auth()` session validation on all API routes
- Drizzle `onConflictDoUpdate` for the upsert pattern (already used in seed.ts and occurrences route)

</code_context>

<deferred>
## Deferred to Phase 5

- Illustrated species card images/artwork
- Personality trait assignment
- Proper beastiary grid layout / card flip animations
- Progress counter ("X of 115 collected")

## Deferred to Phase 6

- Shiny variant roll at moment of collection
- Rarity visual treatment on cards

</deferred>

---

*Phase: 4 — Collection Mechanics*
*Context gathered: 2026-06-25*
