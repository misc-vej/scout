# Roadmap: Scout

## Overview

Scout delivers a UK real-world wildlife collection web app in seven phases. The species dataset and its ethics data model are built first, because every user-facing feature — discovery, collection, rarity, responsible spotting — hangs off that root dependency. Auth ships alongside the foundation so the collection is always cloud-synced and the spotter's pledge is always enforced. Discovery and collection follow once the data layer is proven. The beastiary UI, rarity system, and responsible-spotting UX layer surface last, each building on the verified loop below it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation + Auth** - Next.js 16 + NextAuth.js v5 + Drizzle + Neon; email/password auth; passkey prompt; nav shell (3/3 plans verified ✓)
- [x] **Phase 2: Species Dataset + Ethics Data Model** - 115 UK species seeded; 6-tier rarity enum; sensitivity + season-lock schema; NBN licence audit complete (2/2 plans ✓)
- [x] **Phase 3: Occurrence Pipeline + Discovery** - occurrences table; proj4 OSGB grid conversion; NBN Atlas on-demand cache; /api/discover routes; Discovery UI with TanStack Query; DISC-01 + DISC-04 (3/3 plans ✓)
- [x] **Phase 4: Collection Mechanics** - Sighting log (grid-snapped), card unlock, multi-sighting counter (completed 2026-06-25)
- [x] **Phase 5: Beastiary UI + Personality** - funFact on species; personalityTrait on collections; BeastiaryCard grid; PersonalityPicker; BEAST-01 + BEAST-02 + BEAST-03 (3/3 plans ✓)
- [ ] **Phase 6: Rarity Tiers + Shiny Variants** - Visual rarity treatment, conservation status badge, shiny rare variants
- [ ] **Phase 7: Responsible Spotting UX** - Spotter's Pledge onboarding gate, per-card ethics guidance, sensitive-species flagging

## Phase Details

### Phase 1: Foundation + Auth
**Goal**: Users can create an account and sign in; their collection is always cloud-synced across devices from day one
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can register with an email address and password and receive a verified account
  2. User can sign in using a passkey or biometric on a supported device
  3. User's collection data is stored in Supabase and accessible after signing in on a different device
  4. Unauthenticated users cannot access any collection features (auth-gated from the start)
**Plans**: TBD

### Phase 2: Species Dataset + Ethics Data Model
**Goal**: A curated UK species reference is seeded in the database with rarity tiers, sensitivity classifications, and season-lock fields; the NBN Atlas CC-BY-NC licence audit is complete and any non-commercial records are excluded
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: RESP-03, RESP-04
**Success Criteria** (what must be TRUE):
  1. Every species record in the database carries a `rarity_tier` (Common → Mythic), `sensitivity_level`, and `season_lock` date range
  2. Sensitive species (Schedule 1 WCA 1981, IUCN Vulnerable+) are flagged in the data model before any sighting record is written
  3. Season-locked species have a calendar window recorded in the schema that downstream phases can query to block collection
  4. NBN Atlas CC-BY-NC licence audit is complete: affected datasets are identified, excluded or cleared, and a written record of the decision exists
**Plans:** 2 plans
Plans:
- [ ] 02-01-PLAN.md — Species schema (rarityTierEnum + sensitivityLevelEnum + species table) + Drizzle migration + NBN licence audit document + db:seed script entry
- [ ] 02-02-PLAN.md — tsx install + ~120-species seed data file + idempotent seed script + db:seed execution against Neon

### Phase 3: Occurrence Pipeline + Discovery
**Goal**: Users can see a list of UK wildlife species plausible for their current location, whether via live GPS or a postcode; the occurrence data is pre-computed server-side and location obfuscation is enforced at every layer
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: DISC-01, DISC-04
**Success Criteria** (what must be TRUE):
  1. User can grant GPS permission and see a list of species that have been recorded near their current location
  2. User can enter a postcode instead of sharing live GPS and receive an equivalent nearby-species list
  3. The server never stores raw device coordinates — only grid-square resolution is persisted
  4. The NBN Atlas occurrence pipeline runs server-side, pre-computes data into the `occurrences` table, and the client never calls NBN Atlas directly
**Plans**: TBD
**UI hint**: yes

### Phase 4: Collection Mechanics
**Goal**: Users can log a genuine sighting by picking a species from the nearby list, unlocking its card; logging the same species again increments the sighting count rather than creating a duplicate card
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: DISC-02, DISC-03
**Success Criteria** (what must be TRUE):
  1. User can tap a species in the nearby list to log a sighting; the card unlocks immediately in their beastiary
  2. Logging the same species a second time increments the sighting counter on the existing card rather than creating a second card
  3. Sighting records are written with grid-square coordinates only — raw GPS is never sent to the server
  4. Proximity to the species location never increases collection value or sighting count speed (design constraint enforced)
**Plans:** 3/3 plans complete
Plans:
- [x] 04-01-PLAN.md — sightings + collections tables schema + Drizzle migration
- [x] 04-02-PLAN.md — POST /api/sightings endpoint + SpeciesCard "Log sighting" button + SpeciesList gridSquare wiring
- [x] 04-03-PLAN.md — Minimal Beastiary page (server component, locked/unlocked species list, grouped by taxonomyGroup)

### Phase 5: Beastiary UI + Personality
**Goal**: Users can browse their beastiary — seeing silhouettes for uncollected species and full cards for collected ones — view playful per-card facts, and assign a personal personality trait to each animal they collect
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: BEAST-01, BEAST-02, BEAST-03
**Success Criteria** (what must be TRUE):
  1. Uncollected species appear as silhouettes in the beastiary; collected species display the full illustrated card
  2. Each collected card shows species facts written in a playful, less-serious tone
  3. User can assign a personality trait to a collected animal, and that trait is saved to their card and persists across devices
  4. The beastiary gives a clear visual sense of progress — how many species have been collected vs the total set
**Plans**: TBD
**UI hint**: yes

### Phase 6: Rarity Tiers + Shiny Variants
**Goal**: Each species card visually reflects its rarity tier and conservation status; rare species have a random chance of appearing as a shiny variant when collected
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: BEAST-04, BEAST-05, BEAST-06
**Success Criteria** (what must be TRUE):
  1. Every card shows a distinct visual rarity treatment corresponding to its tier (Common → Mythic)
  2. Every card shows the species' BTO conservation status (Red/Amber/Green) as a separate badge from the rarity tier
  3. A collected species has a random chance of being assigned a shiny visual variant at the moment of collection
  4. Shiny and non-shiny instances of the same species are both visible and distinguishable in the beastiary
**Plans**: TBD
**UI hint**: yes

### Phase 7: Responsible Spotting UX
**Goal**: Responsible spotting is visible and enforced for users — they must agree to the Spotter's Pledge before collecting anything, every card carries ethics guidance, sensitive species are visually flagged, and season-locked species cannot be collected during their sensitive window
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: RESP-01, RESP-02
**Success Criteria** (what must be TRUE):
  1. A new user must accept the Spotter's Pledge during onboarding before the collection mechanic becomes available; pledge acceptance is recorded per account
  2. Every species card displays responsible-spotting guidance (dos and don'ts, safe distance, habitat notes)
  3. Species flagged as sensitive (RESP-03 data) display a clear visual indicator on their card
  4. A species with an active season lock (RESP-04 data) cannot be logged as a sighting during its sensitive period; the UI explains why and when the window reopens
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Auth | 2/3 | In Progress|  |
| 2. Species Dataset + Ethics Data Model | 0/2 | Not started | - |
| 3. Occurrence Pipeline + Discovery | 2/3 | In Progress|  |
| 4. Collection Mechanics | 3/3 | Complete   | 2026-06-25 |
| 5. Beastiary UI + Personality | 0/TBD | Not started | - |
| 6. Rarity Tiers + Shiny Variants | 1/2 | In Progress|  |
| 7. Responsible Spotting UX | 0/TBD | Not started | - |
