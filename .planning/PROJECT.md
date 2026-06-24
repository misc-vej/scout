# Scout

## What This Is

Scout is a UK-based real-world wildlife collection app. Using your location, it shows you what animals live in the area around you; you log the ones you actually spot, give each a personality, and unlock a card in a Pokédex-style beastiary. It's like Merlin crossed with Pokémon GO — but grounded in real animals, woven through with fun facts, and built around responsible, low-impact wildlife spotting. Users build a personal collection, chase rare and "shiny" finds, and see what their friends have discovered.

## Core Value

**The thrill of "I found that, for real" — without ever disturbing the animal.** A genuine wild sighting becomes a satisfying collectable, and the app champions responsible spotting so that pursuing the collection always respects the animal and its habitat.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. These are hypotheses until shipped and validated. -->

**Collecting**
- [ ] User can see their current location and what UK wildlife could be found nearby
- [ ] User can browse the list of species plausible for their area and pick the one they spotted to collect it
- [ ] Collecting a species unlocks/fills its card in the user's beastiary
- [ ] User assigns a personality trait to each animal they collect (their personal read on it)
- [ ] Species have rarity tiers (e.g. Common → Uncommon → Rare → Legendary) reflecting real UK scarcity
- [ ] Rarer species are correspondingly harder to encounter and collect
- [ ] Rarity is shown visually on cards, and rare finds can be "shiny" (special visual treatment)

**Beastiary / Collection**
- [ ] User has a Pokédex-style beastiary showing collected vs not-yet-found species
- [ ] User can view an individual animal card with its facts, personality, rarity, and collection details
- [ ] Animal content is written in a playful, less-serious tone (facts, achievements, empty states)

**Responsible Spotting (core pillar)**
- [ ] User agrees to a spotter's code / pledge during onboarding
- [ ] Each animal card carries responsible-spotting guidance (do's & don'ts, distance, sensitivities)
- [ ] Contextual reminders surface at relevant moments (e.g. nesting season, protected species)
- [ ] Gameplay rewards respectful behaviour (e.g. keeping distance) rather than pursuit/disturbance
- [ ] Sensitive species are flagged and may be non-collectable during sensitive periods (e.g. nesting)
- [ ] The app never displays precise locations for rare/vulnerable animals (locations stay fuzzy)

**Accounts & Social**
- [ ] User can create an account and sign in
- [ ] Collections are saved to the cloud and accessible across devices
- [ ] User can add friends and see what friends have collected

### Out of Scope

<!-- Explicit boundaries with reasoning to prevent re-adding. -->

- Photo-based / camera AI identification — chosen GPS + manual-pick model instead; keeps focus on the discovery moment and avoids ID-tech complexity for v1
- Animals outside the UK — UK-only first to keep the species dataset tractable; international expansion is a later milestone
- Precise location pins / maps of where rare animals were seen — deliberately excluded; conflicts with the responsible-spotting pillar
- Real-money purchases / monetisation — not for the initial build
- Native iOS/Android apps — platform TBD in roadmap, but app-store distribution is not a v1 concern
- Trading/marketplace between users — out of scope; collection is personal, social is observational (friends' lists), not transactional

## Context

- **Inspirations:** Merlin Bird ID (species knowledge, but "less serious"), Pokémon GO (collection thrill, rarity chase) — explicitly correcting Pokémon GO's failure mode of driving people to swarm/disturb real locations.
- **Build environment:** Being built in Claude Code by the user.
- **Likely data source:** UK species occurrence data exists (e.g. NBN Atlas provides UK records by location/grid) — a real candidate for the "what lives near me" layer. To be validated during research.
- **Ethics as differentiator:** Responsible spotting isn't a disclaimer bolted on — it's a design pillar that shapes mechanics (fuzzy locations, sensitive-species protection, distance-rewarding play). This is what makes a real-wildlife collector defensible where a naive Pokémon-GO clone would be harmful.
- **Personality mechanic:** The user — not the app — assigns each collected animal's personality. This makes every collection personal and is a key part of the "less serious" charm.

## Constraints

- **Region**: UK-only for the initial release — bounds the species database and location data.
- **Ethics**: The app must never incentivise or enable disturbing wildlife; responsible spotting governs feature design, not just copy.
- **Location privacy**: Precise locations of rare/vulnerable species must never be exposed.
- **Platform**: Built in Claude Code; specific stack to be decided during research/roadmap.
- **Data**: Reliant on a credible source of UK wildlife/species data — feasibility to be confirmed in research.

## Key Decisions

<!-- Decisions that constrain future work. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Collection mechanic = GPS + manual pick (not photo AI) | Focuses on the discovery moment; avoids camera-ID complexity; supports fuzzy-location ethics | — Pending |
| UK-only for v1 | Makes the species dataset and location data tractable | — Pending |
| Pokédex-style beastiary as the collection format | Familiar, satisfying "fill the book" loop that fits the collect-real-animals concept | — Pending |
| Rarity tiers based on real UK scarcity, with shiny rare finds | Grounds game rarity in reality; gives players something to chase | — Pending |
| User assigns each animal's personality | Personal, playful ownership of every collected card | — Pending |
| Responsible spotting is a core pillar (pledge + per-card guidance + protective mechanics) | Ethical backbone; differentiator vs Pokémon GO's disturb-the-world failure mode | — Pending |
| Accounts + friends (cloud-synced, social) | Cross-device collections and an observational social layer | — Pending |
| Name: Scout | Fits the spotting/discovery theme; clean separation from the unrelated Cadence project | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-24 after initialization*
