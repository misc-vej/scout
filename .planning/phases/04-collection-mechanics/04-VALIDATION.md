# Phase 4: Collection Mechanics — Validation

**Written:** 2026-06-25
**Phase:** 04 — Collection Mechanics
**Requirements covered:** DISC-02, DISC-03

---

## DISC-02: Log a sighting → card unlocked

**Requirement:** A user can log a sighting by picking a species from the nearby list, and that species' card is immediately unlocked in their beastiary.

### Assertions

| ID | Assertion | How to verify |
|----|-----------|---------------|
| V-02-01 | POST /api/sightings with valid { speciesId, gridSquare } and an authenticated session returns HTTP 200 with { sightingCount: 1, firstSighting: true } | `curl -X POST /api/sightings -H "Content-Type: application/json" -d '{"speciesId":"<uuid>","gridSquare":"TQ27"}' --cookie "<session>"` |
| V-02-02 | After POST /api/sightings, a row exists in the `sightings` table with the correct userId, speciesId, and gridSquare | Drizzle Studio or SQL: `SELECT * FROM sightings WHERE species_id = '<uuid>' AND user_id = '<uuid>'` |
| V-02-03 | After POST /api/sightings, a row exists in the `collections` table with sighting_count = 1 and first_sighted_at set | SQL: `SELECT * FROM collections WHERE species_id = '<uuid>' AND user_id = '<uuid>'` |
| V-02-04 | The species card in the Discover list shows a "Log sighting" button | Manual: run dev server, search for a location, confirm button is visible on each SpeciesCard |
| V-02-05 | Tapping "Log sighting" shows "Logged! Card unlocked" for ~1.8s then reverts | Manual: tap button, observe confirmation message, wait for revert |
| V-02-06 | After logging, navigating to /beastiary shows the logged species as unlocked (name visible, sighting count badge, RarityBadge) | Manual: log a sighting, navigate to /beastiary, confirm species is no longer "???" |
| V-02-07 | Unauthenticated POST /api/sightings returns HTTP 401 | `curl -X POST /api/sightings -H "Content-Type: application/json" -d '{"speciesId":"<uuid>","gridSquare":"TQ27"}'` (no session cookie) |
| V-02-08 | Raw GPS coordinates are never present in the request body sent to POST /api/sightings | Code review: grep `lat\|lng\|latitude\|longitude` src/app/api/sightings/route.ts — must return 0 matches |

---

## DISC-03: Re-logging same species increments count, no duplicate card

**Requirement:** Logging the same species a second time increments the sighting counter on the existing card rather than creating a second card.

### Assertions

| ID | Assertion | How to verify |
|----|-----------|---------------|
| V-03-01 | Second POST /api/sightings for the same speciesId returns { sightingCount: 2, firstSighting: false } | Repeat the V-02-01 curl for the same species; confirm response has sightingCount: 2, firstSighting: false |
| V-03-02 | After the second POST, `collections` still has exactly one row for (userId, speciesId) — no duplicate | SQL: `SELECT COUNT(*) FROM collections WHERE species_id = '<uuid>' AND user_id = '<uuid>'` — must be 1 |
| V-03-03 | sighting_count in the collections row is incremented to 2 after second POST | SQL: `SELECT sighting_count FROM collections WHERE species_id = '<uuid>' AND user_id = '<uuid>'` — must be 2 |
| V-03-04 | `sightings` table has two rows for (userId, speciesId) after two logs — append-only | SQL: `SELECT COUNT(*) FROM sightings WHERE species_id = '<uuid>' AND user_id = '<uuid>'` — must be 2 |
| V-03-05 | Tapping "Log sighting" a second time shows "Logged again! (2x spotted)" confirmation | Manual: tap button twice on same species, second confirmation shows count |
| V-03-06 | /beastiary shows the updated sighting count badge (e.g. "2x") after a second log | Manual: log same species twice, navigate to /beastiary, confirm badge shows 2x |
| V-03-07 | Species appears only once in the beastiary regardless of how many times it has been logged | Manual: log same species 3+ times, navigate to /beastiary, confirm exactly one row for that species |

---

## Schema Checks (prerequisite for both DISC-02 and DISC-03)

| ID | Assertion | How to verify |
|----|-----------|---------------|
| V-SC-01 | `sightings` table exists in Neon | SQL: `SELECT to_regclass('public.sightings')` — must not be null |
| V-SC-02 | `collections` table exists in Neon | SQL: `SELECT to_regclass('public.collections')` — must not be null |
| V-SC-03 | Unique index `collections_user_species_idx` exists on (user_id, species_id) | SQL: `SELECT indexname FROM pg_indexes WHERE tablename = 'collections'` — must include collections_user_species_idx |
| V-SC-04 | `npx tsc --noEmit` exits 0 after all Phase 4 plans are executed | `cd /Users/ethanvenables/Documents/Claude/Projects/Scout && npx tsc --noEmit` |

---

*Phase 4 validation document — 2026-06-25*
