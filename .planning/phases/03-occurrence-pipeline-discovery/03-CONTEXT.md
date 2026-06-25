# Phase 3: Occurrence Pipeline + Discovery — Context

**Gathered:** 2026-06-25
**Phase:** 03 — Occurrence Pipeline + Discovery
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver: (1) an `occurrences` table that maps grid squares to species, (2) a one-time admin ingest script that pulls occurrence records from NBN Atlas and populates the table, (3) a server-side Discovery API route that takes a grid square (derived from GPS or postcode) and returns the species list, and (4) a working Discover screen (/discover) where a user can grant GPS or enter a postcode and see what wildlife lives near them.

**The client never calls NBN Atlas.** All data flows through Scout's server. Raw GPS coordinates are never stored — only 10km OS grid square identifiers.

Phase 4 (Collection Mechanics) depends on the species list produced here — users pick from the nearby list to log a sighting.

</domain>

<decisions>
## Implementation Decisions

### Location & Privacy
- **D-01:** 10km OS grid squares (e.g. TQ38) as the unit of location. Matches NBN Atlas's sensitive-species obfuscation level. Impossible to identify a specific park or street. Client sends raw GPS to the server *in-flight* (HTTPS, never logged); server converts to grid square and discards the coordinates. Only the grid square identifier is stored in the `occurrences` table.
- **D-02:** Grid square conversion happens server-side in a Next.js Server Action or Route Handler — never in client code. The conversion library (e.g. `geodesy` or `osgridref` npm packages) runs on Node only.

### NBN Atlas Ingest
- **D-03:** One-time admin script (`scripts/ingest-occurrences.ts`) — run manually via `npm run ingest:occurrences`. Re-runnable with upsert semantics. No scheduled cron for v1; can be added later.
- **D-04:** Ingest filters to CC-BY and OGL datasets only (per NBN-LICENCE-AUDIT.md). CC-BY-NC datasets excluded. The excluded dataset UIDs are documented in `.planning/phases/03-occurrence-pipeline-discovery/NBN-EXCLUDED-DATASETS.md`.
- **D-05:** Ingest runs per-grid-square for each of the ~120 species in the `species` table. For each species, query NBN Atlas for occurrence records in each 10km grid square. Aggregate to a count per (species, grid_square) pair. This keeps the `occurrences` table manageable (one row per species × grid square).
- **D-06:** Ingest scope: UK coverage via the 10km OSGB grid. The full UK mainland spans ~3,000 10km grid squares. Ingesting all 120 species × 3,000 squares = ~360,000 queries — too many for a one-time script. **MVP approach:** ingest by-species, requesting all occurrences for each species (NBN Atlas returns grid square data per species), then aggregate. Alternatively, ingest on-demand: the first time a user visits a grid square, trigger a background fetch for that square and cache it. **Decision: on-demand with persistent cache** — when a user requests a grid square that has no cached data, the server fetches from NBN Atlas for that square, stores results, and returns them. Cached forever (or until manual refresh). This avoids the bulk ingest scalability problem while keeping client→server→NBN Atlas architecture.

  **Rationale for switching from one-time script to on-demand cache:** The per-species-per-square approach produces 360k API calls which would take hours. On-demand with persistent cache is equivalent UX (first user in a grid square waits ~2s; subsequent users are instant) and far more practical.

- **D-07:** Rate limiting: NBN Atlas free API — throttle to 1 request/second on the server side. Use a simple sleep(1000) between calls.

### Postcode Lookup
- **D-08:** postcodes.io — `GET https://api.postcodes.io/postcodes/{postcode}` returns `{ latitude, longitude, codes: { admin_district, ... } }`. No API key required. The server converts the returned lat/lng to a 10km OS grid square.

### occurrences Table Schema
- **D-09:** One row per (species_id, grid_square) pair. Columns: id, species_id (FK → species), grid_square (text, e.g. "TQ38"), record_count (integer, from NBN Atlas), last_fetched_at (timestamp), source (text, "nbn_atlas"). Unique constraint on (species_id, grid_square) for upsert.

### Discovery UI
- **D-10:** The Discover screen (/discover) — already scaffolded as a stub in Phase 1 — is replaced with a functional page. Two modes: GPS (browser geolocation API, client-side) and postcode (text input, server-side). The page shows a list of species known in the user's grid square, with rarity tier badge. No map for Phase 1/MVP.
- **D-11:** The species list is fetched via a Next.js Server Action or API route (`/api/discover`) — never directly from NBN Atlas. The discovery route accepts `{ gridSquare: string }` and returns `SpeciesResult[]`.

### Claude's Discretion
- OS grid reference conversion library: prefer `geodesy` (well-maintained, TypeScript, works server-side). Alternative: `osgridref` npm package.
- NBN Atlas endpoint selection: use the records-ws occurrence search API with grid reference filter.
- Error handling for postcodes.io: if postcode is invalid or not found, return a user-friendly error ("Postcode not found — try a different one").
- NBN Atlas data freshness: records can be decades old. Filter to last 20 years (`year_range:2005-2025`) for more relevant results.
- Empty state: if a grid square has zero cached occurrences and NBN Atlas returns nothing, show "Nothing recorded here yet — check back after an explore!"

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — location privacy constraint (never store raw GPS), ethics pillar
- `.planning/REQUIREMENTS.md` — DISC-01 (GPS-based nearby species), DISC-04 (postcode-based nearby species)
- `.planning/ROADMAP.md` §Phase 3 — success criteria
- `.planning/phases/02-species-dataset-ethics-data-model/NBN-LICENCE-AUDIT.md` — CC-BY/OGL only decision

### From Phase 1 (completed)
- `src/lib/db/index.ts` — Drizzle client
- `src/auth.ts` — auth() for server components
- `src/app/(app)/discover/page.tsx` — stub to replace with functional page

### From Phase 2 (completed)
- `src/lib/db/schema.ts` — species table with rarityTier, sensitivityLevel, seasonLockStart/End
- `data/species-seed.ts` — 115 seeded species (scientificName, tvk fields)

</canonical_refs>

<code_context>
## Existing Code Insights

### Integration Points
- Phase 4 (Collection Mechanics) will call the same Discovery API and let users tap a species to log a sighting. The API response shape established here becomes a Phase 4 contract.
- Phase 7 (Responsible Spotting) will read `sensitivityLevel` + `seasonLockStart/End` from the species table; Phase 3 should filter out `restricted` species during their season-lock window from the discovery results.
- `occurrences` table `grid_square` is the join key between user location (grid square) and species presence.

### Established Patterns
- Drizzle ORM: `pgTable`, `uuid`, `text`, `integer`, `timestamp`, `references` from `drizzle-orm/pg-core`
- Migration: `drizzle-kit generate` + `drizzle-kit migrate` with `DATABASE_URL_UNPOOLED`
- Server Actions: `"use server"` files; validated against session via `auth()`
- API Routes: `src/app/api/*/route.ts` pattern

</code_context>

<deferred>
## Deferred Items

- Scheduled/automatic NBN Atlas refresh — deferred to a post-MVP iteration
- Map view of species in the area — deferred to Phase 5 or a later UI polish phase
- Adjacent grid square lookups (showing species in neighboring squares) — deferred; single-square MVP first
- NBN Atlas occurrence media (photos) — deferred to Phase 5 (beastiary card images)
- Real-time occurrence notifications — out of scope for v1

</deferred>

---

*Phase: 3 — Occurrence Pipeline + Discovery*
*Context gathered: 2026-06-25*
