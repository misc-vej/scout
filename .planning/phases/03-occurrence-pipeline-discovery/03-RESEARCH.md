# Phase 3 — Occurrence Pipeline + Discovery: Research

**Written:** 2026-06-25 (manual — researcher agent pattern consistently times out)
**Phase:** 03 — Occurrence Pipeline + Discovery

---

## §1 — Grid Reference Conversion: lat/lng → 10km OSGB

### Chosen library: `geodesy` (npm: `geodesy`)

- **Package:** `geodesy` — well-maintained, TypeScript-compatible, pure JS, works server-side
- **GitHub:** nicholasstephan/geodesy (also bryc/geodesy — use the original Movable Type one: `npm install geodesy`)
- **Key module:** `OsGridRef` + `LatLonEllipsoidal_Datum` (for datum transforms WGS84 → OSGB36)

**Convert lat/lng (WGS84) to OSGB 10km grid square:**
```ts
import LatLon from 'geodesy/latlon-ellipsoidal-datum.js';
import OsGridRef from 'geodesy/osgridref.js';

function latLngToGridSquare(lat: number, lng: number): string {
  const point = new LatLon(lat, lng, LatLon.datums.WGS84);
  const osgb = point.convertDatum(LatLon.datums.OSGB36);
  const gridRef = OsGridRef.latLonToOsGrid(osgb);
  // gridRef.toString(0) = "TQ 380 880" style — we want the 10km form
  // 10km precision: first letter pair + 2 digits (one per axis)
  const full = gridRef.toString(6); // e.g. "TQ380880"
  // Extract 10km: letters + first digit of easting + first digit of northing
  const letters = full.replace(/[^A-Z]/g, '');
  const digits = full.replace(/[^0-9]/g, '');
  // digits are interleaved: 3 easting digits then 3 northing digits for 6-figure
  const e1 = digits[0]; // first easting digit = 10km easting
  const n1 = digits[3]; // first northing digit = 10km northing  
  return `${letters}${e1}${n1}`; // e.g. "TQ38"
}
```

**Alternative: `@georust/proj`-style** — more complex, avoid.

**Alternative: `osgridref` npm package** — simpler API but fewer stars, less maintained.

### 10km Grid Square Format
- UK OSGB grid: 2-letter prefix (100km square) + 2 digits = 10km resolution
- Examples: `TQ38` (central London), `NT27` (Edinburgh centre), `SJ89` (Manchester centre)
- Full UK mainland: ~3,000 10km squares
- Format validation regex: `/^[A-Z]{2}[0-9]{2}$/`

---

## §2 — postcodes.io API

**Base URL:** `https://api.postcodes.io`  
**Endpoint:** `GET /postcodes/{postcode}`  
**No API key required.** Free, open source, no rate limit for reasonable use.

**Request:**
```
GET https://api.postcodes.io/postcodes/SW1A2AA
```

**Response (key fields):**
```json
{
  "status": 200,
  "result": {
    "postcode": "SW1A 2AA",
    "latitude": 51.503071,
    "longitude": -0.124647,
    "eastings": 530047,
    "northings": 179951,
    "country": "England",
    "region": "London",
    "codes": {
      "admin_district": "E09000033"
    }
  }
}
```

**Error (invalid postcode):**
```json
{ "status": 404, "error": "Postcode not found" }
```

**Server Action for postcode→grid:**
```ts
async function postcodeToGridSquare(postcode: string): Promise<string | null> {
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');
  const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`);
  if (!res.ok) return null;
  const data = await res.json();
  const { latitude, longitude } = data.result;
  return latLngToGridSquare(latitude, longitude);
}
```

---

## §3 — NBN Atlas Occurrences API

**Base URL:** `https://records-ws.nbnatlas.org`  
**Main occurrence search endpoint:** `GET /occurrences/search`

**Query parameters relevant to Phase 3:**
| Parameter | Purpose |
|-----------|---------|
| `q` | Main query string (taxon name, `*` for all) |
| `fq` | Filter query (repeatable) |
| `pageSize` | Max records returned (0 = facets only) |
| `start` | Pagination offset |
| `facets` | Faceted summary fields |
| `lat` + `lon` + `radius` | Spatial search (radius in km) |

**Spatial search by location (radius from lat/lng):**
```
GET https://records-ws.nbnatlas.org/occurrences/search?
  q=*&
  lat=51.503&lon=-0.1246&radius=7&
  fq=occurrence_status_s:PRESENT&
  fq=year:[2005 TO 2025]&
  pageSize=50&
  facets=taxon_name,vernacular_name
```

**Species occurrence search (by TVK/scientific name + grid square):**

For on-demand fetching by TVK (taxon version key):
```
GET https://records-ws.nbnatlas.org/occurrences/search?
  q=lsid:NBNSYS0000002673&
  fq=grid_ref_10000:TQ38&
  pageSize=0&
  facets=grid_ref_10000
```

**Simpler approach — spatial radius search returning species list:**
Use lat/lng (from postcode or GPS) with a ~5km radius, returning species names:
```
GET https://records-ws.nbnatlas.org/occurrences/search?
  q=*&
  lat={lat}&lon={lng}&radius=5&
  fq=occurrence_status_s:PRESENT&
  fq=year:[2005 TO 2025]&
  pageSize=0&
  facets=species_guid,vernacular_name_and_lsid
```

**Licence filter — CC-BY only (per NBN-LICENCE-AUDIT.md):**
```
fq=licence:"CC-BY"
```
Note: NBN Atlas licence values in the index vary — may need `fq=licence:CC-BY OR licence:OGL`. Verify against live API.

**TVK lookup — join to species table:**
- NBN Atlas LSID/TVK is stored in `species.tvk` column (seeded from Phase 2)
- Example TVKs: Hedgehog = `NHMSYS0001501866`, Red Fox = `NHMSYS0000455595`, Otter = `NHMSYS0000455656`
- NOTE: TVK values were not populated in the Phase 2 seed. The ingest script can match by `scientific_name` OR look up TVKs from NBN Atlas by species name at ingest time.

**Rate limiting:** NBN Atlas does not document explicit rate limits, but as a charity-run service: throttle to **1 req/s** with `await sleep(1000)` between requests.

**Recommended approach for Phase 3 ingest (on-demand):**
1. User hits Discover page
2. Client-side: browser requests GPS permission → sends `{ lat, lng }` to server action
3. Server action: converts lat/lng to 10km grid square (`TQ38`)
4. Server checks `occurrences` table for `grid_square = 'TQ38'`
5. **If rows exist** (cached): return species list immediately
6. **If no rows** (cache miss): fetch from NBN Atlas for this grid square, insert rows, return results
7. Cache is permanent (no TTL for MVP); re-run ingest script to refresh

---

## §4 — occurrences Table Schema (Drizzle)

```ts
export const occurrences = pgTable("occurrences", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  gridSquare: text("grid_square").notNull(),
  recordCount: integer("record_count").notNull().default(0),
  lastFetchedAt: timestamp("last_fetched_at").defaultNow().notNull(),
  source: text("source").notNull().default("nbn_atlas"),
}, (table) => ({
  uniqueSpeciesGrid: uniqueIndex("occurrences_species_grid_idx").on(table.speciesId, table.gridSquare),
  gridSquareIdx: index("occurrences_grid_square_idx").on(table.gridSquare),
}));
```

**Imports needed:** `pgTable`, `uuid`, `text`, `integer`, `timestamp`, `uniqueIndex`, `index`, `references` from `drizzle-orm/pg-core`.

The unique index on `(species_id, grid_square)` enables efficient upsert and prevents duplicates.
The index on `grid_square` alone makes the Discovery query fast (all species in a grid square).

---

## §5 — Discovery API Route

**Route:** `src/app/api/discover/route.ts`  
**Method:** POST  
**Body:** `{ gridSquare: string }`  
**Response:** `SpeciesResult[]`

```ts
export type SpeciesResult = {
  id: string;
  commonName: string;
  scientificName: string;
  rarityTier: string;
  sensitivityLevel: string;
  canBeShiny: boolean;
  taxonomyGroup: string | null;
  recordCount: number;
};
```

**Query logic (Drizzle):**
```ts
const results = await db
  .select({
    id: species.id,
    commonName: species.commonName,
    scientificName: species.scientificName,
    rarityTier: species.rarityTier,
    sensitivityLevel: species.sensitivityLevel,
    canBeShiny: species.canBeShiny,
    taxonomyGroup: species.taxonomyGroup,
    recordCount: occurrences.recordCount,
  })
  .from(occurrences)
  .innerJoin(species, eq(occurrences.speciesId, species.id))
  .where(
    and(
      eq(occurrences.gridSquare, gridSquare),
      // Filter out season-locked restricted species
      or(
        ne(species.sensitivityLevel, "restricted"),
        isNull(species.seasonLockStart),
        // If today falls outside the lock window, include it
        // ... season lock logic here
      )
    )
  )
  .orderBy(desc(occurrences.recordCount));
```

**Season lock filtering (server-side):**
```ts
const today = new Date();
const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// Exclude restricted species if today is within their season lock window
// SQL: NOT (sensitivity_level = 'restricted' AND season_lock_start <= mmdd AND mmdd <= season_lock_end)
```

---

## §6 — Discovery UI Page

**Route:** `/discover` (replaces Phase 1 stub at `src/app/(app)/discover/page.tsx`)

**Layout (server component wrapping client component):**
```
/discover
  DiscoverPage (server component — reads auth session)
    DiscoverClient ("use client" — manages GPS/postcode state)
      LocationPrompt — shows GPS button + postcode input
      SpeciesList — renders results when grid square is known
        SpeciesCard — individual species row with rarity badge
```

**DiscoverClient state machine:**
```ts
type DiscoverState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; gridSquare: string; species: SpeciesResult[] }
  | { status: "error"; message: string };
```

**GPS flow:**
1. User clicks "Use my location"
2. `navigator.geolocation.getCurrentPosition()` called client-side
3. On success: POST `/api/discover/grid` with `{ lat, lng }` → server returns `{ gridSquare: "TQ38" }`
4. POST `/api/discover` with `{ gridSquare }` → returns species list (may trigger NBN Atlas fetch if cache miss)
5. Render species list

**Postcode flow:**
1. User types postcode, submits form
2. POST `/api/discover/postcode` with `{ postcode }` → server calls postcodes.io → returns `{ gridSquare }`
3. Same species fetch as GPS flow

**Rarity tier badge colors:**
| Tier | Color |
|------|-------|
| common | gray-400 |
| uncommon | green-500 |
| rare | blue-500 |
| super_rare | purple-500 |
| legendary | orange-500 |
| mythic | red-500 |

**Loading state:** skeleton cards (3 placeholder rows) while fetching

**Empty state:** "Nothing recorded in this area yet — get out and explore!"

**Error state (GPS denied):** "Location access denied — try entering a postcode instead."

---

## §7 — Package Dependencies

New packages needed:
- `geodesy` — lat/lng to OSGB grid square conversion (server-side only)
- No other new packages needed — `@neondatabase/serverless` already present, native `fetch` available in Node 18+

---

## §8 — Sensitive Species Filtering

Phase 3 MUST filter restricted species during their season-lock window from the discovery results. This is a hard requirement (RESP-03/RESP-04 ethics pillar).

**Logic:**
- Get current month-day as `MM-DD` string (server-side — never trust client clock for this)
- For a species to appear: either `sensitivity_level != 'restricted'`, OR `season_lock_start` is NULL, OR today falls outside `[season_lock_start, season_lock_end]`
- Season lock is circular (e.g. could span Dec–Jan for some species) — for the seeded data all windows are April–August so no circular edge cases in MVP

---

## §9 — Plan Structure (3 plans, 2 waves)

### Wave 1
**Plan 03-01:** occurrences table schema + Drizzle migration  
- Add `occurrences` table to `src/lib/db/schema.ts`
- Generate + apply migration
- Verify: `npx tsc --noEmit` passes, table exists in Neon

### Wave 2 (parallel)
**Plan 03-02:** NBN Atlas on-demand ingest + cache logic  
- Install `geodesy` package
- Create `src/lib/geo/grid.ts` — lat/lng → OSGB 10km grid square
- Create `src/lib/nbn.ts` — NBN Atlas API client (fetchOccurrencesForGridSquare)
- Create `src/app/api/discover/route.ts` — POST handler with on-demand ingest
- Create `src/app/api/discover/grid/route.ts` — converts lat/lng to grid square
- Create `src/app/api/discover/postcode/route.ts` — converts postcode to grid square via postcodes.io

**Plan 03-03:** Discovery UI page  
- Replace stub `src/app/(app)/discover/page.tsx` with functional server component
- Create `src/components/discover/DiscoverClient.tsx` ("use client")
- Create `src/components/discover/SpeciesList.tsx`
- Create `src/components/discover/SpeciesCard.tsx`
- Create `src/components/discover/RarityBadge.tsx`
- Rarity badge with correct tier colors

03-02 and 03-03 can run in parallel since they work on different files (API routes vs UI components). They share only the `SpeciesResult` type which must be defined in 03-02 first as a shared type in `src/types/discovery.ts` — 03-03 imports it.

**Dependency:** 03-02 and 03-03 both depend on 03-01 (the occurrences table must exist before API routes can import it from schema).

---

## §10 — Test Verification Approach

Since this is an API-heavy phase, post-execution verification:
1. `npx tsc --noEmit` — 0 errors
2. `npm run build` — passes
3. Manual smoke test: run dev server, navigate to /discover, enter postcode "SW1A 2AA" (central London) → should return species with London records
4. Check Neon `occurrences` table after first postcode lookup — should have rows for the TQ38 grid square

---

*Phase 3 research complete — 2026-06-25*
