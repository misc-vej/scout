# Architecture Research

**Domain:** Location-based UK wildlife collection app (GPS + manual-pick, Pokédex-style beastiary, social layer)
**Researched:** 2026-06-24
**Confidence:** HIGH (core patterns), MEDIUM (species pipeline specifics — NBN API docs are gated)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React Native / Expo)                    │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Location    │  │  Discovery   │  │  Beastiary   │  │   Social   │  │
│  │  Screen      │  │  & Collect   │  │  Collection  │  │  Friends   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                 │                  │                │          │
│  ┌──────┴─────────────────┴──────────────────┴────────────────┴──────┐  │
│  │                Local SQLite (Expo SQLite / WatermelonDB)           │  │
│  │          species_cache · pending_sightings · local_beastiary       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                         ↕ sync when online                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    ▼                                ▼
┌───────────────────────────────┐    ┌───────────────────────────────────┐
│     Supabase (Backend)        │    │     Species Data Pipeline         │
│                               │    │                                   │
│  ┌──────────────────────────┐ │    │  ┌──────────────────────────────┐ │
│  │  Auth (magic link / OAuth│ │    │  │  NBN Atlas API               │ │
│  └──────────────────────────┘ │    │  │  (occurrence queries)        │ │
│  ┌──────────────────────────┐ │    │  └──────────────┬───────────────┘ │
│  │  Postgres + PostGIS      │ │    │                 │                 │
│  │  · species (ref table)   │ │    │  ┌──────────────▼───────────────┐ │
│  │  · occurrences           │ │    │  │  Ingest Worker               │ │
│  │  · sightings             │ │    │  │  (nightly / on-demand)       │ │
│  │  · users / friendships   │ │    │  │  Normalise → rarity tier →   │ │
│  │  · beastiary_state       │ │    │  │  obfuscate → write to DB     │ │
│  └──────────────────────────┘ │    │  └──────────────────────────────┘ │
│  ┌──────────────────────────┐ │    └───────────────────────────────────┘
│  │  Edge Functions           │ │
│  │  · nearby_species()       │ │
│  │  · collect_sighting()     │ │
│  │  · obfuscation guard      │ │
│  └──────────────────────────┘ │
└───────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Location Screen | Acquire GPS fix, display "what's near me" candidate list | Discovery Service, Local Cache |
| Discovery & Collect UI | Present candidate species filtered by location; handle tap-to-collect | Supabase Edge Fn `nearby_species`, Local DB |
| Beastiary UI | Render the full species grid (unlocked vs locked cards), individual card detail | Local DB (read-first), Supabase sync |
| Social UI | Friends list, friend beastiary views, sharing | Supabase `friendships` + `beastiary_state` |
| Local SQLite | Offline-first store: species reference cache, pending sightings queue, beastiary state | All UI screens; syncs to Supabase |
| Supabase Postgres + PostGIS | Authoritative cloud store; spatial queries via `ST_DWithin`; sync target | Edge Functions, Ingest Worker |
| Edge Function: `nearby_species` | Geospatial query → returns candidate species for lat/lon; enforces obfuscation on read | Client, Postgres |
| Edge Function: `collect_sighting` | Validates sighting, writes to `sightings`, updates `beastiary_state`, applies personality | Client, Postgres |
| Obfuscation Guard (Edge Fn middleware) | Strips precise coordinates from any response involving a rare/sensitive species | All Edge Functions |
| Species Data Pipeline / Ingest Worker | Pulls occurrence data from NBN Atlas; derives rarity tiers; applies precision-floor to sensitive species; loads `species` and `occurrences` tables | NBN Atlas API, Supabase |


## Data Model

### Core Tables

```sql
-- Reference: all UK species Scout knows about
species (
  id             uuid PK,
  common_name    text NOT NULL,
  scientific_name text NOT NULL,
  taxon_group    text,            -- 'bird', 'mammal', 'reptile', etc.
  rarity_tier    text NOT NULL,   -- 'common' | 'uncommon' | 'rare' | 'legendary'
  is_shiny_eligible boolean,
  is_sensitive   boolean NOT NULL DEFAULT false,
  sensitive_blur_km int,          -- 1 | 2 | 10 | 50 — from NBN policy
  nbn_tvk        text UNIQUE,     -- NBN Atlas Taxon Version Key (join key)
  responsible_spotting_notes text,
  seasonal_restrictions jsonb,    -- { months: [3,4,5], reason: "nesting" }
  fun_facts      text[],
  card_art_url   text
)

-- Pre-computed occurrence grid: "species X is plausible in this area"
-- Populated by Ingest Worker; NOT real-time sightings
occurrences (
  id             uuid PK,
  species_id     uuid FK → species,
  location       geography(POINT, 4326),  -- centroid, already obfuscated
  grid_precision text,   -- '1km' | '10km' — precision floor from NBN
  last_seen_year int,    -- most recent NBN record year
  occurrence_count int,  -- used as input to rarity calculation
  INDEX: GIST(location)
)

-- User sightings: what a user has actually logged
sightings (
  id             uuid PK,
  user_id        uuid FK → auth.users,
  species_id     uuid FK → species,
  logged_at      timestamptz NOT NULL,
  is_shiny       boolean DEFAULT false,
  personality    text,   -- user-assigned trait
  -- NEVER store precise coords here for sensitive species
  -- For non-sensitive: fuzzy coords (1km grid centroid)
  approx_location geography(POINT, 4326)
)

-- Beastiary state per user: aggregated unlock status
beastiary_state (
  user_id        uuid FK → auth.users,
  species_id     uuid FK → species,
  first_sighting_id uuid FK → sightings,
  times_spotted  int DEFAULT 1,
  personality    text,
  PRIMARY KEY (user_id, species_id)
)

-- Social
friendships (
  user_id        uuid FK → auth.users,
  friend_id      uuid FK → auth.users,
  status         text,   -- 'pending' | 'accepted'
  created_at     timestamptz,
  PRIMARY KEY (user_id, friend_id)
)
```

### Key Design Decisions in the Schema

- `occurrences` stores pre-processed, obfuscated presence data — it is NOT a live feed. This decouples the "what's near me" query from real-time NBN API calls and makes the feature available offline.
- `sightings` never stores raw GPS. For sensitive species (`is_sensitive = true`), the `approx_location` is snapped to the species' `sensitive_blur_km` grid centroid before write. For non-sensitive species, it is snapped to the nearest 1km grid centroid. Precise user GPS is used only transiently in-memory on the client.
- `beastiary_state` is a denormalised read table. It is always derivable from `sightings` but maintained separately for fast read performance.


## Data Flows

### Flow 1: Location → Candidate Species ("What's Near Me")

```
User opens app / Location Screen
    ↓
[Client] acquire GPS (lat/lon) — transient, in-memory only
    ↓
[Client] check Local SQLite cache:
    HIT (TTL < 30 min, same ~1km cell) → return cached candidates
    MISS → call Supabase Edge Fn
    ↓
[Edge Fn: nearby_species(lat, lon, radius_km=10)]
    → PostGIS query on occurrences table:
       SELECT s.* FROM occurrences o
       JOIN species s ON s.id = o.species_id
       WHERE ST_DWithin(o.location, ST_Point(lon, lat)::geography, radius_m)
       ORDER BY o.location <-> ST_Point(lon, lat)::geography
    → Returns: species list with rarity_tier, is_sensitive, card info
    ↓
[Client] write to Local SQLite species_cache (keyed by grid cell + timestamp)
    ↓
[UI] render candidate list — rarity-weighted, seasonal filtering applied
```

### Flow 2: User Collects a Sighting

```
User taps species on candidate list → "I spotted this!"
    ↓
[Client] capture moment: species_id, timestamp, optional personality
    ↓
[Client] write to pending_sightings (Local SQLite) immediately
    → UI updates beastiary instantly (optimistic)
    ↓
[Client] (when online) call Edge Fn: collect_sighting()
    → Obfuscation Guard checks: is_sensitive?
        YES → snap approx_location to sensitive_blur_km grid centroid
        NO  → snap to 1km grid centroid
    → Write to sightings table
    → Upsert beastiary_state (increment times_spotted, set personality)
    → Delete from pending_sightings
    ↓
[Sync] beastiary_state propagates to client on next pull
```

### Flow 3: Species Data Pipeline (Ingest Worker)

```
Trigger: nightly cron OR manual admin trigger
    ↓
[Ingest Worker]
  1. Query NBN Atlas API for UK occurrence records:
       GET /occurrences/search?country=GB&fq=...
       (Paginated; max 1000/page; filter by year recency)
  2. For each species record:
       a. Match to species table by nbn_tvk (Taxon Version Key)
       b. Compute rarity_tier:
            occurrence_count thresholds (static bands, tuned to NBN data):
            > 50,000 records → common
            5,000–50,000    → uncommon
            500–5,000       → rare
            < 500           → legendary
       c. Apply obfuscation BEFORE writing:
            if species.is_sensitive:
              snap centroid to species.sensitive_blur_km grid
            else:
              snap to 1km grid
  3. Upsert into occurrences table
  4. Refresh materialized view (optional — for fast tile generation)
```

**Important:** The Ingest Worker is the single place where precise occurrence data from NBN enters the system. After this step, precise coordinates are discarded. No other part of the system ever holds them.

### Flow 4: Social — View Friend's Beastiary

```
User navigates to Friends tab
    ↓
[Client] call Supabase: fetch accepted friends
    ↓
[Client] for each friend: fetch their beastiary_state (species unlocked, personality)
    → RLS (Row Level Security) ensures user can only see friend's state
      if friendship.status = 'accepted' (both directions)
    ↓
[UI] render friend's beastiary as read-only card grid
    → No sighting locations shown (coordinates never exposed to social layer)
```


## Location Privacy / Obfuscation Architecture

Location privacy is enforced at **three independent layers**. All three must fail for a precise location to leak.

### Layer 1: Ingest Worker — Precision Floor at Ingest

The Ingest Worker applies obfuscation before any occurrence data enters the database. The NBN Atlas itself applies obfuscation tiers (1km, 2km, 10km, 50km, 100km) matching their Sensitive Species Policy v6 — Scout mirrors this. Sensitive species coordinates are snapped to the appropriate grid centroid. Precise coordinates from NBN never touch the Scout database.

### Layer 2: Edge Function Obfuscation Guard — Enforce at Write

When a user logs a sighting, the `collect_sighting` Edge Function intercepts the write and enforces the precision floor:
- Looks up `species.is_sensitive` and `species.sensitive_blur_km`
- Snaps `approx_location` to the correct grid centroid before INSERT
- Non-sensitive species are still snapped to 1km (not precise GPS)

This means **precise user GPS coordinates are never persisted to the database at all** — for any species, sensitive or not.

### Layer 3: RLS Read Policy — Never Expose via Queries

Supabase Row Level Security policies on `sightings` and `occurrences` ensure that even if Layers 1 and 2 somehow failed, no API response or social query exposes coordinates finer than the species' required blur level.

### What Is Never Stored or Exposed

- Raw device GPS coordinates (used in-memory only, never sent to server)
- Precise locations of sensitive/rare species sightings
- The NBN Atlas "full resolution" records (these are restricted to registered data partners — Scout does not request elevated access; it uses the blurred public API output)

### NBN Sensitive Species Tiers (mirrored in Scout)

| NBN Blur Level | Scout `sensitive_blur_km` | Example Species Category |
|----------------|---------------------------|--------------------------|
| 1km            | 1                         | Moderately sensitive     |
| 2km            | 2                         | Moderately sensitive     |
| 10km           | 10                        | Rare/vulnerable          |
| 50km           | 50                        | Highly sensitive         |
| 100km          | 100                       | Critical/poaching risk   |


## Species Data Pipeline — NBN Atlas vs Bundled Dataset Decision

**Recommendation: Hybrid — curated bundled species reference + NBN occurrence layer ingest.**

| Concern | Bundled Species Reference | Live NBN API |
|---------|--------------------------|--------------|
| Offline availability | Yes — species metadata always available | No — requires network |
| Stability | High — controlled by Scout | Fragile — API changes break app |
| Freshness of occurrence data | Stale until next app update | Fresh but rate-limited |
| Data licensing risk | Requires one-time licence review | Per-request, CC-BY-NC risk for commercial use |
| Rate limits | N/A | 1,000 records/page; NBN can be brought down by large queries |

**Chosen approach:**
1. **Species reference table** — curated once (500–2,000 UK terrestrial/freshwater species of interest), bundled in the database with facts, card content, rarity tiers, and responsible-spotting notes. This table does NOT change at runtime.
2. **Occurrences table** — populated by the Ingest Worker from NBN Atlas API on a nightly schedule. This provides "species X has been recorded near Y" presence data. The client never calls NBN directly.
3. **Fallback for offline** — the client caches the occurrence results for the user's current 10km grid cell in Local SQLite. If NBN is down or the user is offline, the cached layer answers "what's near me" queries.

**Licensing note (MEDIUM confidence):** NBN Atlas data includes CC-BY-NC licensed records. Commercial use requires either filtering those records out (NBN provides a commercial-use-safe filtered endpoint) or negotiating with individual data partners. This must be resolved with NBN before launch.


## Recommended Project Structure

```
src/
├── app/                        # Expo Router pages
│   ├── (auth)/                 # Sign-in, onboarding, pledge screen
│   ├── (tabs)/
│   │   ├── discover.tsx        # Location + candidate species
│   │   ├── beastiary.tsx       # Collection grid
│   │   ├── friends.tsx         # Social layer
│   │   └── profile.tsx
│   └── species/[id].tsx        # Individual card detail
├── features/
│   ├── discovery/              # "What's near me" logic
│   │   ├── useNearbySpecies.ts # Hook: GPS → candidate list
│   │   ├── candidateFilter.ts  # Seasonal + sensitivity filtering
│   │   └── locationCache.ts    # SQLite tile cache
│   ├── collection/             # Sighting + beastiary
│   │   ├── useSighting.ts      # Log sighting, optimistic update
│   │   ├── beastiaryStore.ts   # Local beastiary state
│   │   └── syncQueue.ts        # Pending sightings outbox
│   ├── species/                # Species data access
│   │   ├── speciesRepository.ts # Read from local + remote
│   │   └── rarityLogic.ts      # Tier display, shiny roll
│   └── social/
│       ├── useFriends.ts
│       └── friendBeastiary.ts
├── lib/
│   ├── supabase.ts             # Supabase client singleton
│   ├── db.ts                   # Expo SQLite setup + migrations
│   └── obfuscation.ts          # Grid-snap utility (shared client + worker)
├── components/                 # Shared UI primitives
└── constants/
    └── rarity.ts               # Tier thresholds, display config
```

```
supabase/
├── migrations/                 # SQL schema migrations
├── functions/
│   ├── nearby_species/         # Edge Function: geospatial query
│   ├── collect_sighting/       # Edge Function: log sighting + obfuscate
│   └── _shared/
│       └── obfuscation.ts      # Shared obfuscation guard
└── seed/
    └── species.sql             # Initial species reference data
```

```
scripts/
└── ingest/
    ├── nbn_ingest.ts           # Occurrence ingest worker
    └── rarity_compute.ts       # Rarity tier assignment from occurrence counts
```


## Architectural Patterns

### Pattern 1: Offline-First Optimistic Collection

**What:** All user actions (collect, assign personality) write to Local SQLite immediately, with the UI updating optimistically. A sync queue flushes to Supabase when online.

**When to use:** Always. Users are outdoors in fields, valleys, and woodlands — signal is unreliable. A failed network call must never block a user from logging a sighting they just saw.

**Trade-offs:** Requires conflict resolution strategy (last-write-wins on `beastiary_state` is safe; sightings are append-only so no conflicts).

### Pattern 2: Precision-Floor at Every Boundary

**What:** Coordinate precision is reduced to the required blur level at every data boundary crossing: ingest (pipeline → DB), write (client → Edge Fn → DB), read (DB → RLS policy). Each boundary independently enforces the floor rather than trusting upstream to have done it.

**When to use:** Any time a coordinate for a sensitive species is handled. Defence in depth; no single point of failure.

**Trade-offs:** Slight redundancy. The redundancy is intentional and correct.

### Pattern 3: Pre-computed Occurrence Grid, Not Live API

**What:** The "what's near me" query runs against the Scout database (`occurrences` table), not against the NBN Atlas API at request time. The Ingest Worker refreshes this nightly.

**When to use:** Always. Direct NBN API calls at user-request time would: (a) break offline use; (b) expose Scout to NBN rate limits; (c) require real-time obfuscation on the hot path; (d) make the app fragile to NBN downtime.

**Trade-offs:** Occurrence data is 24h stale at worst. Acceptable — wildlife presence near a given area changes on a seasonal, not hourly, basis.

### Pattern 4: Static Rarity Tiers, Not Per-Session Computation

**What:** Rarity tiers are computed once during Ingest, stored on the `species` table, and treated as static for the app session. They are not re-derived per user or per query.

**When to use:** Always. Rarity in the game reflects real UK scarcity — it should not fluctuate based on what happens to be in the occurrence cache at a given moment.

**Trade-offs:** Rarity tiers update on the next ingest cycle (nightly). This is correct behaviour — a species that became less common over winter should update its tier on the next ingest, not mid-session.


## Anti-Patterns

### Anti-Pattern 1: Calling NBN Atlas API Directly from the Client

**What people do:** Issue NBN occurrence API requests from the mobile client when the user taps "what's near me."

**Why it's wrong:** NBN is not a mobile-app CDN. Rate limits (page size ≤ 1,000, 500k record cap per download) will be exhausted quickly. The API does not distinguish obfuscation levels for your app's licensing situation. The app breaks offline. Sensitive species obfuscation logic must then run client-side, where it can be bypassed.

**Do this instead:** Pre-compute occurrences in the Ingest Worker. Query your own database. Cache locally.

### Anti-Pattern 2: Storing Raw GPS in Sightings

**What people do:** Store the precise device GPS (lat/lon from the phone) in the sightings table so the user can "see where they spotted it on a map later."

**Why it's wrong:** This directly violates the responsible-spotting pillar. If a sighting is for a Schedule 1 bird or a protected orchid site, that coordinate in the database is a data breach waiting to happen. It also creates social-engineering attack surface (friends' sightings reveal precise locations).

**Do this instead:** Snap to grid at write time. The obfuscation utility (`lib/obfuscation.ts`) converts device GPS to the appropriate grid centroid before any coordinate ever leaves the client. The server enforces the same snap as a guard.

### Anti-Pattern 3: Deriving Rarity from the User's Local Sightings

**What people do:** "Species seen rarely by users in the app → mark as rare." This creates a rarity tier that inflates with app usage and is gameable.

**Why it's wrong:** A species is rare because it is genuinely scarce in the UK, not because few Scout users have logged it yet. Deriving rarity from app usage data makes v1 all species appear equally rare (nobody has logged anything), then continuously adjusts as the user base grows — which breaks the game mechanic and has no conservation grounding.

**Do this instead:** Rarity is derived from NBN occurrence counts during Ingest — external, real-world data. It is fixed per ingest cycle.

### Anti-Pattern 4: Exposing Sighting Coordinates in the Social Layer

**What people do:** Show friends' sightings on a map so you can "go find the same animal."

**Why it's wrong:** This is exactly what the PROJECT.md explicitly excludes ("precise location pins / maps of where rare animals were seen"). It incentivises location-chasing and mob behaviour. Even for non-sensitive species, publishing friend sightings on a map creates competitive disturbance pressure.

**Do this instead:** Social layer shows only "what" was collected (species, personality, unlock status) — never "where."


## Build Order / Phase Dependencies

The components have the following dependency graph:

```
Phase 1: Foundation
  Supabase project setup
  → Auth (sign-in)
  → species reference table + seed data
  → Local SQLite setup

Phase 2: Species Data Pipeline
  → NBN Atlas integration (Ingest Worker)
  → occurrences table + PostGIS spatial index
  → rarity tier computation
  → obfuscation in pipeline
  [Depends on: Phase 1 species table]

Phase 3: Discovery ("What's Near Me")
  → nearby_species Edge Function
  → Client location permission + GPS
  → Local occurrence cache (SQLite)
  → Candidate species UI
  [Depends on: Phase 2 occurrences table]

Phase 4: Collection
  → collect_sighting Edge Function + obfuscation guard
  → sightings table
  → beastiary_state table
  → Optimistic update + sync queue
  → Beastiary UI (card grid, individual card)
  → Personality assignment
  → Shiny mechanic
  [Depends on: Phase 3 discovery]

Phase 5: Responsible Spotting Layer
  → Seasonal restriction enforcement (client-side filter on candidate list)
  → Sensitive species UI flags
  → Onboarding pledge screen
  → Per-card responsible spotting notes
  [Depends on: Phase 3 + 4; responsible_spotting_notes already in species seed]

Phase 6: Social
  → friendships table + RLS
  → Friend beastiary read API
  → Friends UI
  [Depends on: Phase 4 beastiary_state]
```

**Why this order:**
- Species reference data must exist before any other feature can work.
- The occurrence pipeline must run before "what's near me" can return results.
- Discovery must exist before collection (can't collect what you can't find).
- Responsible spotting notes live in the species seed data from Phase 1 but the enforcement layer (seasonal flags, pledge gate) is a Phase 5 overlay on top of working collection.
- Social is last because it depends on users having a beastiary state to share.


## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| NBN Atlas API | Server-side only (Ingest Worker) — never called from client | Page size ≤ 1,000; check CC-BY-NC licensing filter for commercial use; use `records.nbnatlas.org/ws/occurrences/search` |
| Supabase Auth | Magic link / Apple / Google OAuth via Supabase Auth SDK | Handles JWT, refresh tokens, cross-device session |
| Supabase PostGIS | `ST_DWithin` + `<->` operator for radius queries; GIST index on `geography(POINT)` | Enable PostGIS extension in Supabase project settings |
| Device GPS | Expo Location (`expo-location`) — `requestForegroundPermissionsAsync`, `getCurrentPositionAsync` | Transient use; do not persist raw coords |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client ↔ Edge Functions | HTTPS via Supabase JS client (`.rpc()` for geospatial functions) | All obfuscation enforced inside Edge Fn — client cannot bypass |
| Client ↔ Local SQLite | Synchronous (WatermelonDB) or async (Expo SQLite) — all reads go local-first | Species cache TTL: 30 min per grid cell; beastiary: optimistic, synced |
| Ingest Worker ↔ Postgres | Direct Postgres connection (service-role key) — NOT via Edge Fn | Worker runs in Node/Deno environment; service-role bypasses RLS intentionally for bulk writes |
| Edge Fn ↔ Postgres | Supabase Postgres connection within Edge Fn runtime | Edge Fns run RLS-aware via user JWT |
| Social read ↔ Beastiary | Friend queries use RLS to restrict visibility to accepted-friendship pairs | No coordinate data exposed in social queries; beastiary_state has no location fields |


## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1k users | Monolith is fine; single Supabase project; Ingest Worker as a manual/cron script; no CDN needed |
| 1k–50k users | Add PostGIS query result caching (Redis or Supabase Cache); pre-tile the occurrence grid into 10km cells; schedule Ingest Worker as a robust cron (Supabase Scheduled Functions or external) |
| 50k+ users | Consider pre-materialising the `nearby_species` result per 10km grid cell as a cached tile; push beastiary sync to a queue (not inline on collect); species card art on CDN |

**First bottleneck:** The `nearby_species` PostGIS query scales well with a GIST index up to millions of occurrence rows. The first real bottleneck will be concurrent sync queue flushing (many users coming back online after a day out). Solve with a batch upsert endpoint.

**Second bottleneck:** NBN ingest volume if the species scope grows significantly (e.g. invertebrates added). Solve with incremental ingest (only changed/new records since last run, using `lastModifiedDate` filter on NBN API).


## Sources

- NBN Atlas Sensitive Species Policy: https://docs.nbnatlas.org/sensitive-species-list/ and https://nbn.org.uk/news/nbn-sensitive-species-policy-review/
- NBN Atlas Web Service API: https://docs.nbnatlas.org/web-service-api/ and https://nbn.org.uk/news/using-the-nbn-atlas-api-the-rivers-trust-case-study/
- NBN Atlas Terms of Use (CC-BY-NC licensing): https://docs.nbnatlas.org/nbn-atlas-terms-of-use/
- Supabase PostGIS geo queries: https://supabase.com/docs/guides/database/extensions/postgis
- iNaturalist location obfuscation practice: https://www.inaturalist.org/projects/hdms-point-observation-database/journal/9042-obscuring-sensitive-species-data
- Wildlife Insights sensitive species obfuscation (0.1 degree / ~11km): https://www.wildlifeinsights.org/sensitive-species
- Guide to Best Practices for Generalizing Sensitive Species-Occurrence Data: https://www.researchgate.net/publication/237566721_Guide_to_Best_Practices_for_Generalizing_Sensitive_Species-Occurrence_Data
- Expo local-first / offline architecture: https://docs.expo.dev/guides/local-first/
- Wildcard Dex — comparable app architecture reference: https://www.wildcarddex.com/
- GBIF occurrence API (geospatial queries, rate limits): https://techdocs.gbif.org/en/openapi/v1/occurrence

---
*Architecture research for: Scout — UK wildlife collection app*
*Researched: 2026-06-24*
