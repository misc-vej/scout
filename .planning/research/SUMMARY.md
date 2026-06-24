# Project Research Summary

**Project:** Scout
**Domain:** Location-based UK wildlife collection app (PWA + accounts + social + biodiversity dataset)
**Researched:** 2026-06-24
**Confidence:** HIGH (stack, features, legal/ethical pitfalls); MEDIUM (NBN Atlas API specifics — docs were behind DDoS protection during research; confirm endpoints empirically)

## Executive Summary

Scout is a real-world wildlife collection app for the UK: it uses the device's location to show what species could be found nearby, the user manually picks what they actually spotted, and that unlocks a Pokédex-style beastiary card. It sits at the intersection of nature-ID/logging apps (Merlin, iNaturalist, eBird) and collection games (Pokémon GO, Pokédex), but no existing product combines all-UK-wildlife + card collection + user-assigned personality + playful tone + responsible spotting as actual mechanics. Its closest direct competitor, BirdEx, does UK bird card collection but has none of the ethical backbone — so Scout's responsible-spotting pillar is a genuinely uncontested differentiator.

The recommended build is a **Next.js 16 web PWA** with a **Supabase (Postgres + PostGIS)** backend, sourcing UK species/occurrence data from the **NBN Atlas API** (the UK's authoritative biodiversity database, which conveniently blurs sensitive-species locations at the data layer). The species/occurrence dataset is the root dependency — almost every feature hangs off it — so the first technical work must be a data spike confirming species-by-location queries work, followed by a pre-computed occurrence pipeline rather than live client calls.

The dominant risk is the **Pokémon GO failure mode**: gamifying real animals can incentivise trespass, swarming, and disturbance. This is not theoretical — UK law (Wildlife and Countryside Act 1981, Schedule 1) makes disturbing nesting birds a criminal offence, and organised egg-collecting/raptor persecution is active. The mitigation must be **mechanical and present from Phase 1**: grid-square storage (never raw GPS sent to the server), a sensitivity field on every species, season-locking sensitive species, proximity never increasing collection value, and a hard ban on leaderboards/streaks/proximity-urgency notifications. A secondary risk is **NBN Atlas CC-BY-NC licensing** — ~19% of records are non-commercial, and the developer being paid to build the app may itself count as commercial use — so a licence audit is a pre-launch decision gate.

## Key Findings

### Recommended Stack

A single Next.js 16 web PWA over a Supabase backend keeps the whole app in one web codebase (fastest in Claude Code, and native apps are out of scope for v1). Browser Geolocation is sufficient for point-in-time "what's near me" queries. Supabase covers auth, Postgres+PostGIS geospatial queries, row-level security for per-user collections, and realtime for the friends feed — avoiding four stitched-together services. External species data is fetched and cached aggressively (it's a shared research API with no published rate limit).

**Core technologies:**
- **Next.js 16.x + React 19.2 + TypeScript 5.x**: full-stack web framework with built-in PWA manifest/service-worker support — no `next-pwa` needed (unmaintained, incompatible).
- **Supabase (Postgres 17 + PostGIS)**: auth + database + realtime + storage in one; `ST_DWithin` for radius queries on user sightings; RLS for per-user collection isolation.
- **Tailwind CSS 4.3 + shadcn/ui v4**: copy-owned components for precise control over the card-heavy beastiary UI and "shiny" rarity effects.
- **TanStack Query v5**: caches/dedupes external API responses (24h stale for species lists, 1h for occurrence results) — essential against a rate-limited data source.
- **Zustand v5**: ephemeral client state (last-known GPS, active species, UI) with persist for offline reload.
- **Zod**: validates third-party API responses at the boundary before they touch typed data.

**Resolved platform conflict:** Stack research recommended a Next.js PWA; Architecture research assumed Expo React Native. **Resolved in favour of the Next.js web PWA** — native apps are out of scope for v1, web is fastest in Claude Code, and browser Geolocation suffices. React Native is noted only as a future option if native distribution is later desired. All other architecture findings are platform-agnostic and stand.

### UK Species Data Source (project-critical)

- **Primary: NBN Atlas API** (`records-ws.nbnatlas.org/occurrences/search`, public/unauthenticated). >250M UK records; supports `lat`/`lon`/`radius` + `fq=country_code:GB`. **Automatically blurs sensitive-species coordinates** to 1/2/10/50/100 km tiers before they reach the API — Scout gets obfuscation out of the box (still apply own fuzzing for defence in depth).
- **Licensing:** ~81% CC0/CC-BY/OGL (open, commercial-OK with attribution — show "Data from NBN Atlas"); ~19% CC-BY-NC (non-commercial). **CC-BY-NC is a pre-launch legal gate.**
- **Fallback/validation only: GBIF** (`api.gbif.org/v1`, `country=GB`) — a subset of NBN, no auto-blurring; use for taxonomy/UKSI names and downtime resilience.
- **Do not use as primary:** iNaturalist (60–100 req/min limits, unverified citizen IDs).

### Expected Features

**Must have (table stakes):**
- Location-based "what could I see near me" species list — manual pick to collect.
- Pokédex-style beastiary (collected vs not-yet-found) with per-species cards.
- Accounts + cloud-synced collections (cross-device).
- Per-card species facts in a playful, less-serious tone.

**Should have (Scout's differentiators):**
- Responsible spotting as mechanics: signup pledge, per-card ethics guidance, contextual/seasonal reminders, distance-rewarding play, sensitive-species flagging, non-collectable sensitive periods.
- Rarity tiers grounded in real UK scarcity + "shiny" rare variants (grounded in real phenomena e.g. leucism).
- User-assigned personality per collected animal (personal, playful ownership).
- Observational friends feed (what friends collected) — **not** competitive leaderboards.

**Defer (v1.x / later):**
- Shiny variants and friends/social can follow once the core loop + dataset are solid (they depend only on the loop, not new data sources).
- Non-collectable sensitive-period mechanic is the most complex responsible-spotting feature (needs a seasonal calendar in the dataset) — design in from the start, can land slightly later.
- PWA install/offline polish (serwist), push notifications.

**Anti-features (deliberately never build):** precise location pins/maps of rare animals; competitive species-count leaderboards; streaks/FOMO/"a species is near you right now" urgency notifications; camera/ML species ID (out of scope); call playback.

### Architecture Approach

Pre-compute the species/occurrence data layer rather than calling NBN Atlas live from the client (avoids rate limits, offline breakage, and obfuscation complexity on the hot path). A server-side ingest writes to an `occurrences` table; an endpoint queries it with PostGIS `ST_DWithin`. Location obfuscation is enforced at three independent layers, and precise device GPS is only ever used transiently in-memory on the client — never persisted server-side.

**Major components (build order):**
1. **Species reference dataset** — curated UK species seed with `rarity_tier`, `sensitivity_level`, and season-lock fields (the root dependency).
2. **Occurrence pipeline** — server-side ingest from NBN Atlas → `occurrences` table, precision-floored at write time.
3. **Discovery** — location → candidate-species list (PostGIS radius query).
4. **Collection** — sighting log (grid-snapped before insert), beastiary unlock, personality assignment.
5. **Responsible-spotting enforcement overlay** — sensitivity flags, season-locks, RLS preventing raw-coordinate leaks.
6. **Social** — friends + observational collection-sharing (grid squares only, never lat/lng).

### Critical Pitfalls

1. **The rarity-chase loop (Pokémon GO failure mode)** — rarer = more rewarding is structurally identical to the mechanic that drove disturbance. Prevention: proximity must never increase collection value; distance-rewarding play and season-locks in Phase 1, not retrofitted.
2. **Sensitive-species location exposure** — a criminal-enablement risk (egg collecting, raptor persecution are active/organised). Prevention: `sensitivity_level` on the species model before any sighting is stored; rely on NBN blurring + own fuzzing; coarser resolution for sensitive species.
3. **UK wildlife disturbance law (WCA 1981 Schedule 1)** — disturbing nesting Schedule 1 birds is a criminal offence with a low "reckless" threshold. Prevention: season-lock collection (~March–August) for affected species.
4. **NBN Atlas CC-BY-NC licensing** — non-commercial subset + paid development = commercial-use risk. Prevention: licence audit before pipeline build; exclude or clear CC-BY-NC datasets; written confirmation from NBN.
5. **User location privacy (stalking vector)** — friends seeing where you spotted things creates a location trail. Prevention: store/serve grid squares only; friend APIs never return lat/lng; deletion cascades to sighting history.
6. **Dark-pattern gamification** — streaks/FOMO/urgency override considered behaviour. Prevention: banned in all phases without explicit ethics review.

## Implications for Roadmap

### Phase 1: Foundation + Species Data Spike
**Rationale:** Everything depends on (a) a working Next.js+Supabase+PostGIS skeleton and (b) proof that NBN Atlas returns sensible species-by-location results. De-risk the data source before building on it.
**Delivers:** Project skeleton, auth, DB with PostGIS, and a validated NBN Atlas `lat/lon/radius` spike.
**Avoids:** Building the beastiary around an unproven data source.

### Phase 2: Species Reference Dataset + Responsible-Spotting Data Model
**Rationale:** The curated species set with `rarity_tier`, `sensitivity_level`, and season-lock fields is the root dependency for discovery, rarity, and ethics. These fields cannot be retrofitted once user data exists.
**Delivers:** Seeded UK species reference, rarity tiers derived from real NBN occurrence counts (fixed at ingest, not app activity), sensitivity classification, season-lock table.
**Implements:** Species reference component; licence audit (CC-BY-NC exclusion) gate.

### Phase 3: Occurrence Pipeline + Discovery
**Rationale:** Pre-computed occurrence data + PostGIS radius query power "what's near me" without live external calls.
**Delivers:** Ingest worker → `occurrences` table; location → candidate-species list; three-layer location obfuscation.

### Phase 4: Collection Loop + Beastiary
**Rationale:** The core satisfying loop — spot → collect → unlock card → assign personality.
**Delivers:** Sighting log (grid-snapped), beastiary (collected vs missing), per-card content + playful tone, personality assignment.

### Phase 5: Responsible-Spotting UX Layer
**Rationale:** Surface the ethics pillar to users (the data model already enforces it).
**Delivers:** Onboarding pledge, per-card guidance, seasonal/contextual reminders, non-collectable sensitive periods, distance-rewarding mechanic.

### Phase 6: Rarity Polish + Shiny Variants
**Delivers:** Visual rarity treatment, shiny rare variants. Depends only on the core loop.

### Phase 7: Accounts Polish + Friends/Social
**Delivers:** Friends, observational collection-sharing feed (grid squares only, no leaderboards).

### Phase 8: PWA Install + Offline Polish
**Delivers:** serwist service worker, install-to-home-screen, offline fallback. Deferred — geolocation works before install matters.

### Phase Ordering Rationale
- The species dataset is the hard dependency for nearly everything → dataset and its ethics fields come before any UI feature.
- Responsible-spotting *enforcement* is architectural (in the data model, Phases 2–3); the responsible-spotting *UX* (Phase 5) layers on top.
- Social and shiny (Phases 6–7) depend only on the established core loop, so they're safe later additions.
- Granularity is set to "fine" — the roadmapper may split several of these into smaller phases.

### Research Flags
Phases likely needing deeper research during planning:
- **Phase 1 / 3 (NBN Atlas):** API rate limits and the CC-BY-NC filtered endpoint are unconfirmed — needs empirical testing and possibly a direct query to NBN.
- **Phase 2 (season-lock table):** which species to season-lock and exact dates need a UK ornithology reference (BTO guides) or expert input.

Phases with standard patterns (lighter research):
- **Phase 4 / 6 / 7 (collection UI, shiny, social):** well-trodden web app patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 16, Supabase+PostGIS, Tailwind/shadcn versions verified against official docs |
| Features | HIGH | Table stakes/differentiators/anti-features confirmed across 5+ comparable apps + academic literature |
| Architecture | HIGH (MEDIUM on NBN API mechanics) | Core patterns verified; NBN docs were gated during research |
| Pitfalls | HIGH | UK disturbance law, sensitive-species risk, licensing all verified against GOV.UK/RSPB/NBN |

**Overall confidence:** HIGH on direction; MEDIUM on NBN Atlas integration specifics.

### Gaps to Address
- **NBN Atlas rate limits:** no published limit — test empirically during the Phase 1 spike; tune TanStack Query stale times.
- **CC-BY-NC dataset identification + "non-commercial" definition:** enumerate affected datasets and get written confirmation from NBN before any monetisation (and given paid development).
- **Species scope (invertebrate boundary) + count:** decide the v1 species set (~500–2,000) before the dataset phase; it drives ingest volume and seed effort.
- **Shiny trigger logic:** randomised at collect time vs tied to rarity tier — a game-design decision to capture in the schema.
- **Postcodes.io fallback coverage:** confirm Scottish/Welsh postcode coverage before relying on it as the manual-location fallback.

## Sources

### Primary (HIGH confidence)
- Next.js 16 release + PWA docs (v16.2.9) — framework, built-in PWA, geolocation
- Supabase PostGIS docs — `ST_DWithin`, GiST indexes, one-click enable
- GBIF Occurrence API techdocs — geographic filters, `country=GB`
- GOV.UK / RSPB / legislation.gov.uk — Wildlife and Countryside Act 1981, Schedule 1, CRoW 2000
- Tailwind v4.3, shadcn/ui v4, TanStack Query v5, Zustand v5 — current versions

### Secondary (MEDIUM confidence)
- NBN Atlas API index + licensing/sensitive-species doc snippets — endpoints, blurring tiers, CC split (full docs DDoS-gated)
- BirdEx / Seek / Birda competitor analysis; Pokémon GO disturbance literature; ICO UK GDPR location-sharing guidance

### Tertiary (LOW confidence — validate)
- NBN Atlas CC-BY-NC filtered endpoint URL/registration; empirical rate limits; Postcodes.io regional coverage

---
*Research completed: 2026-06-24*
*Ready for roadmap: yes*
