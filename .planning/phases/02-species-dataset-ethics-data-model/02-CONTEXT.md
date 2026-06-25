# Phase 2: Species Dataset + Ethics Data Model — Context

**Gathered:** 2026-06-25
**Phase:** 02 — Species Dataset + Ethics Data Model
**Status:** Ready for research and planning

<domain>
## Phase Boundary

Deliver the `species` table schema (Drizzle), a curated launch seed of ~100–150 hand-picked UK species, and the full rarity + sensitivity + season-lock data model. Phase 3 will populate occurrence data via NBN Atlas; this phase defines the schema and seeds the reference data. The UI rendering of rarity, shiny variants, and per-card content is Phases 5–6 — Phase 2 only cares that the flags and data exist correctly in the database.

**Blocked by nothing — depends on Phase 1 (db connection + Drizzle setup already wired).**

</domain>

<decisions>
## Implementation Decisions

### Species Scope
- **D-01:** Curated launch set of ~100–150 hand-picked UK species — not an exhaustive import of all UK records. Must include: hedgehog, deer/stag, fox, otter. Covers the most recognisable and collectable UK wildlife across groups (birds, mammals, reptiles, amphibians as appropriate). Can be expanded in later updates.

### Rarity Tier System
- **D-02:** Six rarity tiers: Common → Uncommon → Rare → Super Rare → Legendary → Mythic. Stored as a `rarity_tier` enum column on the species table.
- **D-03:** Shiny variants are possible for any species at Super Rare, Legendary, or Mythic tier. The `can_be_shiny` boolean flag must exist on the species table in Phase 2 — the actual shiny rendering and probability mechanics are Phase 6. The schema must support it from the start.
- **D-04:** Rarity tiers map to real UK conservation status (BTO/IUCN/WCA): Common = LC abundant, Uncommon = LC widespread, Rare = NT or BTO Amber, Super Rare = VU or BTO Amber, Legendary = EN, Mythic = CR / vagrant / extirpated reintroduction. Final mapping confirmed during research.

### Data Source Strategy
- **D-05:** NBN Atlas API is the authoritative occurrence data source — but that ingest happens in Phase 3. Phase 2 only creates the schema and hand-curates a seed CSV with rarity, sensitivity, and season-lock values. The seed gives Phase 3 a validated list of species to pull occurrences for.
- **D-06:** Sensitivity and season-lock data is manually curated using UK sources: Schedule 1 WCA 1981 (sensitive species), BTO Breeding Bird Atlas (nesting season windows), JNCC guidelines. No external API for this — it's a one-time curation task.

### Ethics Data Model
- **D-07:** `sensitivity_level` enum on the species table: `none` | `caution` | `sensitive` | `restricted`. "Restricted" species are not collectable during their season-lock window and their card shows a protection notice. "Sensitive" species show ethics guidance but can be collected. "None" = no special handling.
- **D-08:** `season_lock_start` and `season_lock_end` are month-day strings (MM-DD) stored on the species table. NULL = no season lock. Downstream phases use these to block collection if today falls in the window.
- **D-09:** NBN Atlas CC-BY-NC licence audit must produce a written record: which datasets are CC-BY-NC only (non-commercial), which are CC-BY (commercial OK), and a decision on each. Stored as `.planning/phases/02-species-dataset-ethics-data-model/NBN-LICENCE-AUDIT.md`.

### Claude's Discretion
- Species taxonomy naming: use common English name as primary, scientific name as secondary — both stored in schema.
- Seed coverage across taxonomic groups: prioritise charismatic megafauna (hedgehog, fox, otter, deer, badger, red squirrel) + common garden birds + a handful of reptiles/amphibians. No invertebrates or fish in the curated launch set.
- Exact mapping of BTO conservation list bands to rarity tiers — use research phase to confirm.

</decisions>

<canonical_refs>
## Canonical References

### Project Context
- `.planning/PROJECT.md` — core value, ethics pillar, UK-only constraint, responsible spotting design pillar
- `.planning/REQUIREMENTS.md` — RESP-03 (sensitive species flagged on cards), RESP-04 (season-locked species blocked during sensitive period)
- `.planning/ROADMAP.md` §Phase 2 — success criteria: every species record has rarity_tier + sensitivity_level + season_lock; NBN licence audit complete

### From Phase 1 (completed)
- `src/lib/db/schema.ts` — existing Drizzle schema; Phase 2 adds the `species` table to this file (or creates `src/lib/db/species-schema.ts` if preferred)
- `drizzle.config.ts` — already wired; Phase 2 runs `drizzle-kit generate` + `drizzle-kit migrate` via DATABASE_URL_UNPOOLED to apply the new table

### External Sources (to confirm in research)
- NBN Atlas: nbnatlas.org — UK occurrence data; API docs at api.nbnatlas.org
- BTO Conservation Status lists — Red, Amber, Green bird lists (Birds of Conservation Concern 5, 2021)
- Schedule 1 WCA 1981 — list of protected bird species
- IUCN UK species assessments
- JNCC sensitive species guidance

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/db/index.ts` — Drizzle client already exports `db`; Phase 2 adds species table to the schema
- `drizzle.config.ts` — already configured for Neon; just run `drizzle-kit generate` + `migrate` after adding new table
- `.env.local` — DATABASE_URL_UNPOOLED already present for migrations

### Established Patterns
- Drizzle schema uses `pgTable`, `text`, `timestamp`, `uuid` from `drizzle-orm/pg-core`
- Tables use snake_case column names with camelCase Drizzle fields
- UUIDs as primary keys via `.defaultRandom()`
- Migration approach: `drizzle-kit generate` → `drizzle-kit migrate` (NOT push — TTY issue in non-interactive shells)

### Integration Points
- Phase 3 will query the `species` table to match NBN Atlas occurrence records; the `tvk` (NBN taxon version key) or `scientific_name` field is the join key — include a `tvk` field (nullable text) on the species table so Phase 3 can link NBN records without a migration
- Phase 4 will reference `species.id` from the `sightings` table; ensure `species.id` is a stable UUID
- Phase 5/6 will read `rarity_tier`, `can_be_shiny`, `sensitivity_level` for card rendering
- Phase 7 will read `sensitivity_level` and `season_lock_*` for responsible-spotting UI

</code_context>

<specifics>
## Specific Ideas

- The seed CSV should be a checked-in file at `data/species-seed.ts` or `data/species-seed.json` — not hardcoded in a migration. This makes it easy to review, audit, and update before and after seeding.
- A `seed` npm script should be added: `"db:seed": "tsx data/seed.ts"` — runs against the DATABASE_URL_UNPOOLED to insert species rows. The seed script should be idempotent (upsert, not insert — so re-running doesn't create duplicates).
- The NBN licence audit document should clearly distinguish between NBN Atlas occurrence records (Phase 3) and the species reference data (Phase 2). The species names and taxonomy are not NBN-derived; only the occurrence records from Phase 3 are. The audit is mainly about Phase 3 scope, but it's correct to resolve it now before building against NBN data.
- Season-lock windows to include at minimum: nesting season for Schedule 1 birds (roughly April–July for most), and otter holts (variable — research needed). Exact dates per species can be NULL initially with a note to fill in during Phase 7 (Responsible Spotting UX).

</specifics>

<deferred>
## Deferred Items

- Shiny variant probability weights, visual treatment — Phase 6
- Per-card responsible-spotting guidance text — Phase 7
- Species personality traits list (for Phase 4's personality assignment mechanic) — Phase 4
- Species occurrence data ingest from NBN Atlas — Phase 3
- UI rendering of rarity tiers, shiny cards — Phases 5–6

</deferred>

---

*Phase: 2 — Species Dataset + Ethics Data Model*
*Context gathered: 2026-06-25*
