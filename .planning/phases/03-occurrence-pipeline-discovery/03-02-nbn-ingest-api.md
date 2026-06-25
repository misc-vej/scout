---
plan: 03-02
title: geodesy install + grid conversion + NBN Atlas client + Discovery API routes
phase: 3
wave: 2
depends_on: [03-01]
req_ids: [DISC-01, DISC-04]
branching_strategy: none
autonomous: true
files_modified:
  - package.json
  - src/lib/geo/grid.ts
  - src/lib/nbn.ts
  - src/app/api/discover/route.ts
  - src/app/api/discover/grid/route.ts
  - src/app/api/discover/postcode/route.ts
---

## Goal

Wire up the complete server-side occurrence pipeline: lat/lng → OSGB grid square conversion, on-demand NBN Atlas fetch with persistent cache, and three API route handlers that the Discover UI (03-03) calls.

## Context

Depends on 03-01: imports `occurrences` from `src/lib/db/schema.ts` and `SpeciesResult` from `src/types/discovery.ts`.

The client never calls NBN Atlas. The client never sends coordinates beyond the in-flight HTTPS request. All coordinate-to-grid conversion and NBN Atlas calls happen in server-side code only. The `geodesy` package must only be imported in server-side files — never in `"use client"` components.

## Tasks

### Task 1: Install `geodesy` and create `src/lib/geo/grid.ts`

**Install the package:**
```bash
npm install geodesy
```

`geodesy` is a well-maintained pure-JS library for geodetic calculations including OSGB36 datum transforms. No types package needed — it ships its own types.

**Create `src/lib/geo/grid.ts`** with two exports:

1. `latLngToGridSquare(lat: number, lng: number): string`  
   Converts WGS84 lat/lng to a 10km OSGB grid square string (e.g. `"TQ38"`).

2. `gridSquareToLatLng(gridSquare: string): { lat: number; lng: number }`  
   Converts a 10km grid square back to the centre-point lat/lng in WGS84. Used internally by the NBN Atlas client to construct the spatial search radius.

**Implementation for `latLngToGridSquare`** (from RESEARCH.md §1):
```ts
import LatLon from 'geodesy/latlon-ellipsoidal-datum.js';
import OsGridRef from 'geodesy/osgridref.js';

export function latLngToGridSquare(lat: number, lng: number): string {
  const point = new LatLon(lat, lng, LatLon.datums.WGS84);
  const osgb = point.convertDatum(LatLon.datums.OSGB36);
  const gridRef = OsGridRef.latLonToOsGrid(osgb);
  // Get 6-figure grid reference string (e.g. "TQ380880")
  const full = gridRef.toString(6);
  // Extract letters (2-char 100km square prefix)
  const letters = full.replace(/[^A-Z]/g, '');
  // Extract digits: 6-figure = 3 easting + 3 northing digits
  const digits = full.replace(/[^0-9]/g, '');
  // First digit of easting = 10km easting; first digit of northing = 10km northing
  const e1 = digits[0];
  const n1 = digits[3];
  return `${letters}${e1}${n1}`;
}
```

**Implementation for `gridSquareToLatLng`:**

Parse the 10km grid square (e.g. `"TQ38"`) back to an OSGB easting/northing (100m units), add 5000m to get the centre of the square, then convert back to WGS84:

```ts
export function gridSquareToLatLng(gridSquare: string): { lat: number; lng: number } {
  // Parse the grid square into an OsGridRef and convert to lat/lng centre
  const gridRef = OsGridRef.parse(gridSquare + '55'); // append '55' to get centre of 10km square
  const latLon = OsGridRef.osGridToLatLon(gridRef, LatLon.datums.WGS84);
  return { lat: latLon.lat, lng: latLon.lon };
}
```

Note on the centre-point calculation: appending `'55'` to a 2-digit (10km) grid square gives a 4-digit reference with easting offset 5 (5km) and northing offset 5 (5km), which is the centre of the 10km square. This is a reliable trick when building on top of the geodesy OsGridRef parser.

If the geodesy `OsGridRef.parse` API does not accept the `TQ3855` shorthand, construct the easting/northing numerically instead:
- Parse letters to get the 100km easting/northing offset (standard OSGB letter-grid algorithm)
- Easting = (letter-offset-E * 100000) + (e-digit * 10000) + 5000
- Northing = (letter-offset-N * 100000) + (n-digit * 10000) + 5000
- Use `new OsGridRef(easting, northing)` then `.toLatLon(LatLon.datums.WGS84)`

The executor should test both approaches and use whichever compiles and returns sensible coordinates (central London for `TQ38` should be approximately 51.5°N, -0.12°W).

### Task 2: Create `src/lib/nbn.ts` — NBN Atlas API client

Create `src/lib/nbn.ts` with one exported function: `fetchOccurrencesForGridSquare`.

**Signature:**
```ts
export async function fetchOccurrencesForGridSquare(
  gridSquare: string
): Promise<Array<{ scientificName: string; recordCount: number }>>
```

**Implementation details:**

1. Convert `gridSquare` to a centre-point lat/lng using `gridSquareToLatLng` from `src/lib/geo/grid.ts`.

2. Call the NBN Atlas occurrence search endpoint with a 7km radius spatial query:
   ```
   GET https://records-ws.nbnatlas.org/occurrences/search
     ?q=*
     &lat={lat}&lon={lng}&radius=7
     &fq=occurrence_status_s:PRESENT
     &fq=year:[2005 TO 2025]
     &fq=licence:"CC-BY" OR licence:"OGL"
     &pageSize=0
     &facets=taxon_name
   ```

   Use native `fetch` (available in Node 18+). Set a `User-Agent` header: `"Scout/1.0 (https://github.com/scout-app; contact: wildlife-app@example.com)"` — this is good practice for charity-operated APIs.

3. Parse the response. NBN Atlas facet responses look like:
   ```json
   {
     "facetResults": [
       {
         "fieldName": "taxon_name",
         "fieldResult": [
           { "label": "Vulpes vulpes", "count": 42 },
           ...
         ]
       }
     ]
   }
   ```
   Map `fieldResult` to `{ scientificName: label, recordCount: count }`.

4. Rate-limit: add a helper `const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))`. Although this function makes only one NBN Atlas call per invocation (one call per grid square), add a `sleep(1000)` after the fetch to prevent rapid successive calls if the Discovery API is hit multiple times in quick succession. (The persistent cache means a given grid square only calls NBN Atlas once, but defensive throttling is still correct.)

5. Return an empty array (not an error) if NBN Atlas returns a non-200 status or the response contains no facet results.

6. Do NOT import `geodesy` directly in this file — import `gridSquareToLatLng` from `src/lib/geo/grid.ts` only.

### Task 3: Create the three Discovery API routes

**3a. `src/app/api/discover/route.ts` — POST: `{ gridSquare }` → `SpeciesResult[]`**

```
POST /api/discover
Body: { gridSquare: string }
Response: SpeciesResult[]
Auth: required — returns 401 if no session
```

Logic:
1. Check session via `auth()` from `@/auth`; return `NextResponse.json({ error: "Unauthorized" }, { status: 401 })` if null.
2. Validate body: parse JSON, check `gridSquare` matches `/^[A-Z]{2}[0-9]{2}$/`; return 400 with `{ error: "Invalid grid square format" }` if not.
3. Query `occurrences` table for rows with `grid_square = gridSquare`:
   ```ts
   const cached = await db
     .select()
     .from(occurrences)
     .where(eq(occurrences.gridSquare, gridSquare))
     .limit(1);
   ```
4. **Cache MISS** (no rows): call `fetchOccurrencesForGridSquare(gridSquare)` from `src/lib/nbn.ts`. For each result, find the matching species by `scientific_name` (case-insensitive match against `species.scientificName`). Insert an `occurrences` row for each matched species using an upsert (Drizzle `onConflictDoUpdate` targeting the unique index). Skip NBN results with no species match in the database.
5. **Cache HIT**: skip the NBN fetch entirely.
6. Join `occurrences` with `species` and apply season-lock filter:

   ```ts
   const today = new Date();
   const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
     .where(eq(occurrences.gridSquare, gridSquare))
     .orderBy(desc(occurrences.recordCount));
   ```

   After fetching, filter in TypeScript (not SQL) to exclude season-locked restricted species:
   ```ts
   const filtered = results.filter((row) => {
     if (row.sensitivityLevel !== 'restricted') return true;
     if (!row.seasonLockStart || !row.seasonLockEnd) return true;
     // Exclude if today falls within [seasonLockStart, seasonLockEnd]
     return !(mmdd >= row.seasonLockStart && mmdd <= row.seasonLockEnd);
   });
   ```

   Note: the `species` table is not in the select type for `filtered` — you will need to query seasonLockStart/seasonLockEnd in the select then remove them before returning the `SpeciesResult[]`. Add them to the select as `seasonLockStart: species.seasonLockStart` and `seasonLockEnd: species.seasonLockEnd`, apply the filter, then map to the `SpeciesResult` shape (omitting the lock fields).

7. Return `NextResponse.json(filtered)` with status 200.

**3b. `src/app/api/discover/grid/route.ts` — POST: `{ lat, lng }` → `{ gridSquare }`**

```
POST /api/discover/grid
Body: { lat: number; lng: number }
Response: { gridSquare: string }
Auth: required
```

Logic:
1. Auth check as above.
2. Parse body; validate `lat` is number -90..90, `lng` is number -180..180. Return 400 if invalid.
3. Call `latLngToGridSquare(lat, lng)` from `src/lib/geo/grid.ts`.
4. Return `NextResponse.json({ gridSquare })`.

Do NOT log or store the raw `lat`/`lng` values. The coordinates are used only for the in-memory calculation and are discarded immediately after.

**3c. `src/app/api/discover/postcode/route.ts` — POST: `{ postcode }` → `{ gridSquare }`**

```
POST /api/discover/postcode
Body: { postcode: string }
Response: { gridSquare: string }
Auth: required
```

Logic:
1. Auth check as above.
2. Parse body; validate `postcode` is a non-empty string.
3. Sanitize: `const clean = postcode.trim().toUpperCase().replace(/\s+/g, '')`.
4. Fetch `https://api.postcodes.io/postcodes/${clean}` (server-side, using native fetch).
5. If response status is 404 or `result` is null: return `NextResponse.json({ error: "Postcode not found — try a different one" }, { status: 400 })`.
6. Extract `latitude` and `longitude` from `data.result`.
7. Call `latLngToGridSquare(latitude, longitude)`.
8. Return `NextResponse.json({ gridSquare })`.

## Verification

- `npx tsc --noEmit` exits with 0 errors.
- `npm run build` passes.
- Manual smoke test (run `npm run dev`, then):
  ```bash
  # Get grid square for central London coordinates
  curl -X POST http://localhost:3000/api/discover/grid \
    -H "Content-Type: application/json" \
    -d '{"lat":51.503,"lng":-0.1246}' \
    -b "<valid-session-cookie>"
  # Expected: { "gridSquare": "TQ38" }

  # Postcode lookup
  curl -X POST http://localhost:3000/api/discover/postcode \
    -H "Content-Type: application/json" \
    -d '{"postcode":"SW1A 2AA"}' \
    -b "<valid-session-cookie>"
  # Expected: { "gridSquare": "TQ37" } or similar central London square

  # Discovery (after grid square known)
  curl -X POST http://localhost:3000/api/discover \
    -H "Content-Type: application/json" \
    -d '{"gridSquare":"TQ38"}' \
    -b "<valid-session-cookie>"
  # Expected: JSON array of SpeciesResult objects
  ```
- After the `/api/discover` call, check the Neon `occurrences` table — it should contain rows for `grid_square = 'TQ38'` (first-time fetch from NBN Atlas).
- A second call to `/api/discover` with the same grid square should return faster (cache hit — no NBN Atlas call).
- Invalid grid square (`{"gridSquare":"NOTVALID"}`) returns 400.
- Unauthenticated request returns 401.

## Threat Model

| Boundary | Description |
|----------|-------------|
| Client → `/api/discover/grid` | Raw lat/lng enters server. Coordinates are never logged or stored — in-memory only for the grid conversion. |
| Client → `/api/discover/postcode` | Postcode string enters server. Server calls postcodes.io on user's behalf. |
| Server → NBN Atlas | Outbound HTTP. No credentials required. Rate-limited defensively. |
| Server → postcodes.io | Outbound HTTP. No credentials. Postcode is not PII in isolation but is proxied server-side to avoid exposing user location to a third-party API from the client. |

| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-03-01 | Information Disclosure | `/api/discover/grid` | mitigate | Raw coordinates logged nowhere; discarded after grid conversion. Server-side only. |
| T-03-02 | Spoofing | All three `/api/discover/*` routes | mitigate | `auth()` session check on every request; unauthenticated requests rejected with 401 before any processing. |
| T-03-03 | Denial of Service | `/api/discover` (NBN fetch on cache miss) | mitigate | Each unique grid square triggers at most one NBN Atlas call (persistent cache). Throttle helper limits burst. |
| T-03-04 | Injection | `gridSquare` param in DB query | mitigate | Drizzle ORM parameterises all queries; regex validation `/^[A-Z]{2}[0-9]{2}$/` rejects anything non-conforming before DB access. |
| T-03-05 | Injection | `postcode` passed to postcodes.io URL | mitigate | Sanitized to `[A-Z0-9]` by `toUpperCase().replace(/\s+/g,'')` before URL construction; URL-encoded in the fetch call. |
| T-03-SC | Tampering | `npm install geodesy` | mitigate | Verify package on npmjs.com/package/geodesy before install; confirm publisher, download count, and no obvious supply-chain anomalies. |
