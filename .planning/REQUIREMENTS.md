# Requirements: Scout

**Defined:** 2026-06-24
**Core Value:** The thrill of "I found that, for real" — without ever disturbing the animal.

## v1 Requirements

Requirements for initial release. Each maps to a roadmap phase.

### Discovery

- [ ] **DISC-01**: User can see a list of wildlife species plausible for their current GPS location
- [ ] **DISC-02**: User can pick a species from the nearby list to log a sighting and unlock its card
- [ ] **DISC-03**: User can log the same species multiple times (sighting count increments on the card)
- [ ] **DISC-04**: User can enter a postcode to browse nearby species without sharing live GPS

### Beastiary

- [ ] **BEAST-01**: Uncollected species appear as silhouettes; collected species show the full card
- [ ] **BEAST-02**: Each collected card shows playful, irreverent fun facts about the species
- [ ] **BEAST-03**: User can assign a personality trait to each animal they collect
- [ ] **BEAST-04**: Each card shows the species' rarity tier (Common → Mythic) with distinct visual treatment
- [ ] **BEAST-05**: Each card shows the species' conservation status (BTO Red/Amber/Green) as a separate badge from rarity
- [ ] **BEAST-06**: Collected animals have a random chance to come in a shiny rare visual variant

### Authentication

- [ ] **AUTH-01**: User can create an account with email and password
- [x] **AUTH-02**: User can sign in with passkeys / biometric (Supabase passkeys)
- [ ] **AUTH-03**: User's collection is cloud-synced and accessible across devices

### Responsible Spotting

- [ ] **RESP-01**: User must agree to a Spotter's Pledge during onboarding before collecting anything
- [ ] **RESP-02**: Every species card includes responsible-spotting guidance (dos/don'ts, safe distance, habitat notes)
- [ ] **RESP-03**: Sensitive species (Schedule 1 WCA 1981, IUCN Vulnerable+) are visually flagged on their cards
- [ ] **RESP-04**: Season-locked species cannot be collected during their sensitive period (e.g. nesting season)

## v2 Requirements

Deferred to a future release. Tracked but not in the current roadmap.

### Gamification Polish

- **ANIM-01**: Card unlock animations vary by rarity tier (Common = simple, Mythic = dramatic)

### Responsible Spotting (Extended)

- **RESP-05**: Contextual reminders surface at relevant moments (nesting season alerts, protected-area warnings)
- **RESP-06**: Gameplay rewards respectful distance — e.g. a "patient spotter" bonus for not re-logging the same location too frequently

### Social

- **SOC-01**: User can add friends and view their beastiary
- **SOC-02**: User can see a feed of what friends have recently collected (grid-square resolution only — no precise locations)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Camera / photo-based species ID | Out of scope for v1; GPS + manual-pick is the chosen mechanic |
| Non-UK animals | UK-only for v1; international expansion is a future milestone |
| Precise location pins for rare/sensitive animals | Conflicts with responsible-spotting pillar; criminal enablement risk (egg collecting, raptor persecution) |
| Native iOS / Android apps | Web PWA only for v1; native distribution is a later decision |
| Competitive leaderboards | Incentivises disturbance and over-reporting; banned by responsible-spotting pillar |
| Streaks / FOMO mechanics | Dark-pattern gamification that overrides considered behaviour |
| Urgency push notifications ("a species is near you now") | Proximity-urgency drives disturbance; explicitly excluded |
| Trading / marketplace between users | Collection is personal; transactional social layer is not in scope |
| Real-money purchases / monetisation | Not for the initial build; NBN Atlas CC-BY-NC licence audit needed first |
| Guest / try-before-signup mode | Auth-gated from the start to ensure cloud sync and pledge enforcement |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Pending |
| RESP-03 | Phase 2 | Pending |
| RESP-04 | Phase 2 | Pending |
| DISC-01 | Phase 3 | Pending |
| DISC-04 | Phase 3 | Pending |
| DISC-02 | Phase 4 | Pending |
| DISC-03 | Phase 4 | Pending |
| BEAST-01 | Phase 5 | Pending |
| BEAST-02 | Phase 5 | Pending |
| BEAST-03 | Phase 5 | Pending |
| BEAST-04 | Phase 6 | Pending |
| BEAST-05 | Phase 6 | Pending |
| BEAST-06 | Phase 6 | Pending |
| RESP-01 | Phase 7 | Pending |
| RESP-02 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-24*
*Last updated: 2026-06-24 after roadmap creation*
