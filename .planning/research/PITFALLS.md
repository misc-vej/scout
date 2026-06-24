# Pitfalls Research

**Domain:** UK real-world wildlife gamification app (Scout)
**Researched:** 2026-06-24
**Confidence:** HIGH (legal/ethical pitfalls verified against official sources; technical pitfalls MEDIUM where pattern-based)

---

## Critical Pitfalls

### Pitfall 1: Rarity Chase Drives Disturbance — The Pokemon GO Failure Mode

**What goes wrong:**
The core gameplay loop (rare species are harder to find, rarer finds are more rewarding) creates direct economic incentive for players to push closer to animals, linger longer, and return repeatedly. Even users who intellectually accept the pledge will rationalise behaviour when a "Legendary" card is within reach. At scale, a single rare species sighting shared between friends causes swarming — the exact pattern that drove Pokémon GO players into protected dune systems in the Netherlands and caused Snowy Owl stress from crowds in North America. The app does not have to instruct bad behaviour; the reward structure does it silently.

**Why it happens:**
Rarity tiers are compelling precisely because they create scarcity pressure. The app's core mechanic (rarer = more rewarding) is structurally identical to the mechanic that caused harm in location-based games. Responsible-spotting copy does not override reward-loop psychology when the two pull in opposite directions.

**How to avoid:**
- Reward the act of observing, not proximity. Distance-based bonuses (e.g., "observed from >30m — Respectful Spotter bonus") must be a core mechanic from Phase 1, not retrofitted later.
- Never display a live "X players nearby have spotted this species today" counter — this is the swarming trigger.
- Rarity tiers must map to genuine encounter probability, not difficulty of approach. A Kingfisher is rare because sightings are uncommon, not because you have to get close.
- Do not surface exact timestamps of recent sightings for rare species — this implies freshness and pulls people toward the location.
- Sensitive/Schedule 1 species should have a hard mechanic: they become non-collectable during nesting season (March–August), with a clear in-app explanation tied to the WCA 1981.

**Warning signs:**
- Users asking in feedback "how do I get closer to get the card"
- Any feature request that displays other players' proximity to a rare species
- Game-balance discussions that treat "rarer = must be harder to trigger" as a design axiom

**Phase to address:**
Phase 1 (core gameplay loop). The reward structure must be designed disturbance-safe before any rarity tier is built. Retrofitting ethics onto an existing reward loop is much harder than building ethics in.

---

### Pitfall 2: Sensitive Species Location Exposure — Enabling Poachers and Egg Collectors

**What goes wrong:**
The UK has an active, organised egg-collecting and raptor-persecution community. Operation EASTER (29 years running) and Operation PULKA (2024, ~20,000 eggs seized across UK/Australia) demonstrate this is not a theoretical risk. If Scout shows even approximate locations for Peregrine nests, Goshawk territories, Hen Harrier breeding sites, or similar Schedule 1 species, it becomes a tool for criminals. Even "fuzzy" 1km grid squares can narrow a search enough to be actionable in upland areas with few candidate sites.

The risk extends beyond birds: Great Crested Newt ponds, Water Vole burrow locations, White-tailed Eagle nesting islands, and bat roost sites are all targets for disturbance or deliberate persecution.

**Why it happens:**
Developers treat location fuzziness as a UX privacy feature rather than a security control. The NBN Atlas blurs sensitive species to agreed resolutions (1km, 2km, 5km, 10km depending on species), but an app built on top of occurrence data can accidentally re-expose this if it stores or displays user-submitted sightings at full GPS precision. User-generated sightings of sensitive species are the highest risk: a user spots a Red Kite nest, logs it, and the app stores lat/lng to 6 decimal places internally.

**How to avoid:**
- Adopt the NBN Atlas / BTO BirdTrack / eBird sensitive-species framework: maintain a curated list of species whose sightings must be blurred server-side before storage. Use the NBN Atlas sensitive species lists (agreed by UK statutory bodies) as the baseline.
- For Schedule 1 birds and other high-sensitivity species: blur all sightings to a minimum 10km grid square in the database. Never store precise coordinates for these species even temporarily.
- Do not show friend sighting locations for sensitive species at any precision.
- Do not surface "recent sightings near you" for sensitive species.
- Build the sensitive-species classification into the species data model in Phase 1. Retrofitting it after user data exists means you already have a database of locations you cannot fully scrub.
- The "out of scope" decision to never show precise location pins must be enforced architecturally (server never returns lat/lng for sensitive species), not just in the UI.

**Warning signs:**
- Species data model has no `sensitivity_level` field
- User sightings stored at full GPS precision regardless of species
- "Friends' collections" feature shows where a friend spotted a Peregrine
- Any map feature that shows sighting dots rather than grid squares

**Phase to address:**
Phase 1 (data model and species classification). The sensitivity tier must be an attribute of every species record before any sighting is ever stored. This cannot be a Phase 2 or Phase 3 addition.

---

### Pitfall 3: Wildlife and Countryside Act Liability — The App Inducing Illegal Disturbance

**What goes wrong:**
Under the Wildlife and Countryside Act 1981 (as amended by CRoW Act 2000), it is an offence to intentionally **or recklessly** disturb a Schedule 1 bird at or near its nest. Penalties are unlimited fines and up to 6 months' imprisonment per offence. A 2024 case resulted in a £1,600+ fine for disturbing a nesting Honey Buzzard. The "recklessly" threshold is low — knowing a nest is nearby and approaching anyway is sufficient.

If Scout's gameplay visibly draws users toward a known Schedule 1 nest site (even via the general species-presence layer showing "Kingfisher possible here"), the app could be argued to have induced reckless disturbance. The same applies to Schedule 5 animals (all bat species, otters, dormice) and the Protection of Badgers Act 1992 (badger setts).

The app must also never encourage or normalise call/song playback to attract birds — this is a recognised disturbance mechanism under the WCA, and the RSPB explicitly advises against it.

**Why it happens:**
App developers think about legal liability in terms of Terms of Service clauses, not in terms of mechanics that predictably cause illegal behaviour. A "what's near me" feature that shows Schedule 1 species nearby, combined with rarity rewards, predictably causes users to search for nests. The ToS clause saying "don't disturb animals" does not discharge moral or potential legal responsibility if the feature design makes disturbance the rational user action.

**How to avoid:**
- Build and maintain a legal reference list mapping UK species to their specific legal protections (WCA Schedule 1, Schedule 5, Habitats Regulations, Badgers Act). Surface the relevant law on each animal's card.
- For Schedule 1 species: the species presence indicator must explicitly state the legal position ("This bird is on Schedule 1 — approaching its nest is a criminal offence").
- Never include audio playback features for birds. If species audio is used for identification guidance, include a clear prohibition on field playback in the in-app ethics guidance and pledge.
- Season-lock collection of Schedule 1 species during nesting season (March–August, though species-specific end dates vary). This removes the gameplay incentive to search for nests.
- Contextual reminders must fire in the app when a Schedule 1 species is surfaced in the "near you" layer during March–August.

**Warning signs:**
- Species cards with no legal protection information
- A "find this species near me" feature that works identically for Schedule 1 and common species during nesting season
- Audio examples included without playback warnings
- Onboarding pledge that mentions "be kind to animals" but doesn't name the law

**Phase to address:**
Phase 1 (species data model and responsible-spotting pillar). Legal protection data must be part of species records. Season-locking mechanics built before the collection loop launches.

---

### Pitfall 4: NBN Atlas / GBIF / iNaturalist Licensing Trap — Building on Non-Commercial Data

**What goes wrong:**
NBN Atlas data is available under a mix of licences: CC0, CC-BY, CC-BY-NC, and OGL. The CC-BY-NC licence explicitly prohibits commercial use, including producing reports or products for which any payment is received. Many NBN Atlas datasets are CC-BY-NC. If Scout ever charges users, runs ads, or receives investment for a monetised product, using CC-BY-NC data is a licence breach. NBN Atlas has a breach-of-licence process and charges a fixed penalty.

iNaturalist data exported to GBIF defaults to CC-BY-NC. GBIF occurrence data similarly carries mixed licences from contributing datasets.

The trap is that "non-commercial" applies to the use, not the organisation. A free-to-download app that eventually wants to monetise, or a developer who is being paid to build the app, may already be in commercial territory depending on interpretation.

**Why it happens:**
Developers read "free to access" as "free to use" and don't distinguish the licences attached to individual datasets within aggregators like NBN Atlas. The NBN Atlas UI makes it easy to query data without surfacing the per-dataset licence for each record returned.

**How to avoid:**
- Before integrating any data source, audit every dataset used: query the NBN Atlas API and record the licence for each dataset that contributes records to your queries.
- Prefer CC0 and CC-BY datasets. Filter out or flag CC-BY-NC datasets during ingestion.
- Consult NBN Atlas's "Guidance on the definition of non-commercial use" document explicitly before v1 launch.
- If any monetisation is planned (even post-v1), seek a data agreement with NBN before building on CC-BY-NC data — NBN Atlas does grant broader licences to specific organisations.
- For iNaturalist: do not bulk-ingest observation data. Use GBIF occurrence downloads and check licences per dataset. iNaturalist's own terms prohibit using their data to train AI for commercial purposes — relevant if any ML-based species identification is ever added.
- Attribution: CC-BY and OGL both require attribution. Build attribution infrastructure (data source credits accessible in the app) in Phase 1, not as a post-launch retrofit.

**Warning signs:**
- Species occurrence queries that return records without per-record licence metadata
- No licence audit logged in project documentation
- "We'll sort attribution later" decisions in early phases
- A monetisation discussion that doesn't trigger a data licence review

**Phase to address:**
Phase 1 (data pipeline). Licence filtering and attribution infrastructure must be built before any species data is stored in the Scout database.

---

### Pitfall 5: Cheating and False Sightings Corrupting the "Real Wildlife" Core Promise

**What goes wrong:**
Scout's core value proposition is "I found that, for real." The GPS + manual-pick model has no photo verification. A user sitting at home can open the app, see that a Red Squirrel is theoretically possible in their area (it is not — they live in London), and log a sighting. At the individual level this is harmless ego. At the social layer it corrupts the experience for honest players who see a friend's collection full of implausible species. At the competitive layer (rarity chasing, comparing collections) it makes the game feel unfair and meaningless.

There is also a subtler form: honest misidentification. A user logs a "Barn Owl" having seen a silhouette that was almost certainly a Stock Dove. With no photo, there is no way to retrospectively verify or correct this.

**Why it happens:**
The photo-AI approach was explicitly excluded (correct for v1 complexity reasons). But excluding photo verification without building any plausibility guardrails leaves the honour system entirely unguarded. Citizen science research consistently shows that unverified honour systems degrade data quality and perceived fairness at scale.

**How to avoid:**
- Build plausibility filtering into the collection mechanic from day one: if a species is not on the "possible near you" list for the user's location and season, they cannot log it. The GPS-derived species list is the first guardrail.
- Season-lock species that are never present in the UK at a given time of year (e.g., migratory species that have not yet arrived).
- Add a soft "are you sure?" confirmation step for any species that is marked Rare or Legendary: "This is an unusual sighting for your area — are you confident you saw this?" This catches honest mistakes without accusing users of cheating.
- For the social layer: display each collection card with its location grid square (blurred, but shown) so friends can sanity-check implausible combinations. "My friend in central London collected a Red Squirrel 50 miles from any known population" is visible without exposing precise locations.
- Accept that some cheating is unavoidable and design around it: the collection is personal and non-tradeable (already in scope), which limits the incentive to cheat beyond self-satisfaction.
- Do not build leaderboards in v1. Leaderboards maximise cheating incentive and reward the worst-faith users.

**Warning signs:**
- Species logging form that has no location-plausibility check
- Social features that display raw species counts as a ranking
- "Legendary" species that can be logged anywhere in the UK regardless of their actual range
- Any feature that lets users log a species and immediately share it to friends without a plausibility gate

**Phase to address:**
Phase 1 (collection mechanic) for plausibility filtering. Phase 2 (social layer) for the display guardrails. Avoid leaderboards in all phases until data quality mechanisms are proven.

---

### Pitfall 6: User Location Privacy and the Stalking Vector

**What goes wrong:**
Scout tracks users' GPS locations to show nearby species and, in the social layer, shows what friends have collected. If "friends can see where you spotted this" is implemented naively, it creates a real-time or near-real-time location trail: a friend can see that Alice spotted a Kingfisher at 14:32 on Tuesday and infer her location with enough precision to track her routine. Research shows location-sharing apps are routinely misused in domestic abuse and stalking contexts; the relevant UK guidance (ICO, UK GDPR) requires explicit consideration of this risk.

A secondary vector: the app stores a history of user GPS points at every session. A database breach or overly permissive friend-data API exposes a detailed movement history of every user.

**Why it happens:**
Wildlife apps focus on the species data as the sensitive layer and treat user location data as incidental. The mindset is "we're not building a social network so GDPR-social risks don't apply." But any app that shows "your friend spotted something near [location]" is sharing location data about a natural person.

**How to avoid:**
- Never expose the exact GPS coordinates of a user sighting to other users, even friends. Show only the same blurred grid square used for species sensitivity (minimum 1km, larger for rarer species).
- Design the "friends' collections" feature as collection-only (what species, when — not where). "Where" is opt-in and only ever shown at coarse resolution.
- Do not store raw GPS logs beyond the session. Store only the grid square used for the species presence lookup.
- Implement a "ghost mode" or collection-privacy toggle from the start — not as a later safety retrofit.
- UK GDPR compliance: location data is personal data. Document lawful basis (likely legitimate interest or consent), provide a clear privacy notice, and allow users to delete their sighting history (right to erasure). Build data deletion into the account model in the accounts phase.
- Do not include any live "friends near you" or "X friends are spotting nearby" feature. This is the stalking vector in its most direct form.

**Warning signs:**
- Social feature mockups showing a friend's sighting on a precise map
- "Friends near you" feature in any backlog
- User sightings stored as lat/lng without a grid-square reduction step
- Privacy notice that describes location data as "used only for species lookup" without addressing retention, sharing, or deletion

**Phase to address:**
Phase 1 (data model: store grid squares, not raw GPS). Phase 2 (accounts and social: collection-level sharing with opt-in location coarseness, data deletion support).

---

### Pitfall 7: Engagement Mechanics That Reward Volume Over Ethics (The Streak/FOMO Trap)

**What goes wrong:**
Streak mechanics ("you've spotted something 7 days in a row — don't break it!"), daily challenge notifications ("A rare species is available in your area today only!"), and timed events create pressure to go out specifically to log a species, on a schedule, regardless of whether conditions are appropriate. This is the indirect disturbance mechanism: the user is not trying to disturb wildlife, they're trying to maintain a streak. But the streak sends them to a badger sett at dusk in March to tick a box.

This is a known dark pattern in gamification research: artificial urgency overrides considered behaviour. Conservation game research explicitly identifies this as a risk when wildlife and game mechanics intersect.

**Why it happens:**
Retention engineering borrows directly from mobile game design where artificial scarcity and streaks are effective engagement tools. Applied to wildlife, the engagement signal and the ethical signal pull in opposite directions, and engagement wins because it is immediate.

**How to avoid:**
- No streak mechanics in v1. If streaks are ever added, they must reward patient observation ("spotted something this month") not daily pressure ("don't break your streak today").
- No "species available for X hours only" FOMO mechanics. Rarity is about genuine encounter probability, not artificial time windows.
- Push notifications, if used, must not include location-urgency framing ("A Red Deer is near you right now!"). Acceptable: "Great time of year to look for Barn Owls — here's what to look for."
- App store descriptions and onboarding must not use "collect them all" or "compete with friends" framing that implies volume-maximising behaviour.

**Warning signs:**
- Any backlog item that includes the word "streak"
- Notification copy that references species proximity with time pressure
- Gamification research cited as justification for adding FOMO mechanics
- Daily active user (DAU) as a primary product metric without a corresponding "responsible spotter actions taken" metric

**Phase to address:**
Phase 1 (gamification design constraints). Establish in writing which engagement mechanics are prohibited before any notification or streak system is designed. Retrofitting these constraints after a retention system is built is politically and technically expensive.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store raw GPS lat/lng for all sightings | Simpler data model, no grid conversion logic | Privacy risk, can never be fully scrubbed if sensitive species locations leaked; GDPR deletion complexity | Never — grid square conversion is a one-time engineering task |
| Use all NBN Atlas data regardless of licence | Faster data pipeline build | Licence breach when any monetisation added; potential injunction | Never — licence audit takes days, not weeks |
| No sensitivity tier on species records | Simpler species data model | Cannot filter sensitive species from social/map features; requires schema migration after sightings exist | Never — add sensitivity field before first species is loaded |
| Single static "responsible spotting" page | Fast to build | No contextual relevance; users skip it; no legal protection context at point of need | Never for legal protections; acceptable for generic guidance if contextual triggers are built in Phase 2 |
| No plausibility gate on species logging | Simpler MVP | Cheating undermines core value proposition from day one; hard to retrofit trust | Never for the core gate; "are you sure?" soft-confirm can wait until Phase 2 |
| Leaderboards for early engagement | Strong DAU driver | Creates maximum cheating incentive; rewards bad-faith players; misaligns engagement metric with ethics | Never in this domain |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| NBN Atlas API | Treating all returned records as equivalently licensed; ignoring per-dataset CC-BY-NC records | Query `dataResourceUid` for each record; maintain an allowlist of CC0/CC-BY/OGL datasets; reject CC-BY-NC records or flag for manual review |
| NBN Atlas sensitive species | Assuming the API applies blurring automatically for app use | Blurring is applied to NBN Atlas *display* — your app must apply its own blurring rules based on the NBN sensitive species list, which must be fetched and maintained separately |
| iNaturalist / GBIF | Ingesting observation data without checking individual observation licences | Use GBIF occurrence download with licence filter; individual observations within a GBIF dataset can have different licences set by the contributing user |
| OS Grid References | Converting OS grid references to lat/lng and back with precision loss | Use a well-tested UK grid reference library (e.g., `gridref-js`); be explicit about which end of the precision spectrum you are storing at each stage |
| Device GPS | Trusting device GPS precision for "near you" species lookup | GPS in urban/indoor settings is unreliable; build a "GPS accuracy too low" state; species list should update only when accuracy is within an acceptable threshold (e.g., <50m) |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| API endpoint returns species sighting lat/lng for sensitive species | Poacher/egg-collector tool; species persecution | Server-side rule: sensitive species sightings returned as grid square only, regardless of request parameters; audit API responses in tests |
| Friend-data API returns precise sighting locations | Stalking vector, domestic abuse enablement | Friend data API returns only species and grid square; no lat/lng in any user-facing endpoint |
| No rate limiting on species-presence queries | Systematic scraping to build a map of rare species locations | Rate-limit the "what's near me" API; the endpoint's species list should be the same for all users at a given grid square, so caching at grid-square level is safe |
| User-submitted sightings stored and displayed to all users in real time | Community map becomes a live poaching intelligence tool | Sightings for sensitive species are not surfaced in any aggregated view; user's own collection is private by default |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Pledge buried in onboarding flow users skip | No ethical framing before first collection action; ToS-click behaviour | Make the pledge a moment, not a checkbox: one screen, written simply, with a named species and a clear reason. First collection action only unlocks after pledge |
| Responsible-spotting guidance in a separate "Help" section | Users never read it; no connection to the species they're about to find | Guidance lives on the species card itself, surfaced at the moment of collection; contextual reminder triggers during March–August for Schedule 1 species |
| Rarity tiers displayed without explaining what "Legendary" means in real terms | Users interpret Legendary as "try hard to find this" rather than "you were lucky to see this" | Rarity label copy should explain scarcity, not difficulty: "Legendary — fewer than 1 in 10 spotters will ever see one" not "Legendary — extremely hard to find" |
| Empty beastiary feels punishing rather than aspirational | Users feel they have failed rather than that they have potential | Unpopulated cards should show silhouettes with copy like "Not yet spotted — most people never see one"; celebrate what they have, not what they lack |
| "What's near me" shows a species a user cannot realistically spot (e.g., nocturnal, in private land) | Frustration leading to reckless attempts | Flag access and time-of-day context on each species card; "typically active at dusk on farmland — best spotted from public footpaths" |

---

## "Looks Done But Isn't" Checklist

- [ ] **Species sensitivity tiers:** Every species record has a `sensitivity_level` field and the correct NBN/eBird tier assigned — verify by checking that a Peregrine sighting is stored at 10km grid resolution, not GPS precision
- [ ] **Season-locking:** Schedule 1 species cannot be collected between 1 March and 31 August — verify by attempting to log a Kingfisher sighting in the app during a test date set to April
- [ ] **Responsible-spotting pledge:** Pledge screen must block first collection action, not just be skippable onboarding — verify by skipping past all optional onboarding screens and confirming collection is blocked
- [ ] **Data licence audit:** Every NBN Atlas dataset used has its licence documented and CC-BY-NC datasets are either excluded or have a legal basis for use — verify with a written licence register
- [ ] **Friend sighting privacy:** Friends' collection shows species and coarse grid square only — verify by checking the API response for a friend sighting contains no lat/lng field
- [ ] **Plausibility gate:** Logging a species not on the location-derived possible-species list returns an error or strong deterrent — verify with a test account attempting to log an out-of-range species
- [ ] **Attribution:** A data source credits screen is accessible in the app and correctly attributes NBN Atlas, GBIF, and other sources — verify by navigating to it in a production build
- [ ] **Data deletion:** Account deletion removes all stored sightings including their grid square references — verify with a test delete and a database audit

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Sensitive species location exposed in production | HIGH | Immediate: remove the affected API endpoint or add server-side blurring; notify NBN Atlas / RSPB if data was publicly accessible; audit logs for scraping evidence; schema migration to reduce stored precision |
| CC-BY-NC data used in a commercial context | HIGH | Cease use of affected datasets immediately; contact NBN Atlas to discuss retrospective licensing; rebuild species data pipeline from CC-BY/CC0 datasets only; legal review of exposure period |
| Swarming incident linked to Scout | HIGH | Public statement via responsible-spotting channels; disable species-presence display for affected location; convene ethics review; contact local wildlife recorder or Wildlife Trust proactively |
| Cheating widespread in leaderboard/social features | MEDIUM | Remove or freeze the ranking feature; communicate transparently to community; introduce plausibility gates retroactively (flags existing suspect sightings for review rather than deletion) |
| User privacy breach via friend location API | HIGH | Standard breach response (ICO notification within 72 hours under UK GDPR); patch API; notify affected users; audit for downstream exposure |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Rarity chase drives disturbance | Phase 1 — core gameplay loop | Reward structure review: no mechanic can increase reward for proximity; distance bonus exists and is measurable |
| Sensitive species location exposure | Phase 1 — species data model | Automated test: API response for Schedule 1 species contains no lat/lng; stored precision ≤10km grid |
| WCA 1981 liability — inducing illegal disturbance | Phase 1 — species data + responsible-spotting pillar | Schedule 1 species collection locked March–August; per-card legal text present and correct |
| Data licence breach | Phase 1 — data pipeline | Written licence register exists; every ingested dataset has a documented licence; CC-BY-NC datasets excluded or legally cleared |
| Cheating corrupting the "real wildlife" promise | Phase 1 (gate) + Phase 2 (social display) | Test: out-of-range species cannot be logged; friends' view shows grid square not pin; no leaderboards in any phase |
| User location privacy / stalking vector | Phase 1 (data model) + Phase 2 (accounts/social) | API audit: no lat/lng in any friend-facing endpoint; account deletion cascade tested; privacy notice reviewed against ICO guidance |
| Engagement mechanics rewarding volume over ethics | Phase 1 — gamification design | Written prohibition list exists; no streak, FOMO, or proximity-urgency mechanics in any phase's backlog |

---

## Sources

- [Wildlife and Countryside Act 1981 — RSPB overview](https://www.rspb.org.uk/birds-and-wildlife/wildlife-and-countryside-act) — HIGH confidence, official RSPB legal guidance
- [WCA 1981 Schedule 1 — ukwildlife.com](https://www.ukwildlife.com/index.php/wildlife-countryside-act-1981/schedule-1/) — MEDIUM confidence, secondary legal reference
- [Wild Birds: Protection and Licences — GOV.UK](https://www.gov.uk/guidance/wild-birds-protection-surveys-and-licences) — HIGH confidence, official government guidance
- [Nesting Birds and the Law — Protect the Wild](https://protectthewild.org.uk/protectors-of-the-wild/nesting-birds-nests-and-the-law/) — MEDIUM confidence, conservation advocacy summary
- [BirdTrack Rare Species Policy — BTO](https://www.bto.org/get-involved/volunteer/projects/birdtrack/taking-part/recording-your-sightings/birdtrack-rare-species-policy) — HIGH confidence, direct precedent for Scout's sensitivity approach
- [Sensitive Species in eBird — eBird](https://ebird.org/news/sensitive-species-in-ebird/) — HIGH confidence, direct precedent for blurring approach
- [NBN Atlas Data Licences — NBN Documentation](https://docs.nbnatlas.org/data-licenses/) — HIGH confidence, official NBN Atlas documentation
- [NBN Atlas Guidance for Using Data](https://docs.nbnatlas.org/guidance-for-using-data/) — HIGH confidence, official NBN Atlas documentation
- [NBN Sensitive Species — NBN Documentation](https://docs.nbnatlas.org/sensitive-species/) — HIGH confidence (page returned verification challenge during fetch; content verified via search)
- [Publish and don't perish — The Conversation](https://theconversation.com/publish-and-dont-perish-how-to-keep-rare-species-data-away-from-poachers-80239) — MEDIUM confidence, peer-reviewed context on poaching risk from location data
- [Unnatural Surveillance — Yale E360](https://e360.yale.edu/features/unnatural-surveillance-how-online-data-is-putting-species-at-risk) — MEDIUM confidence, expert commentary on location data misuse
- [Operation EASTER 2026 — Raptor Persecution UK](https://raptorpersecutionuk.org/2026/04/05/operation-easter-29-years-of-protecting-the-uks-rarest-birds/) — HIGH confidence, current (2026) enforcement context
- [RSPB Crimes Against Birds](https://www.rspb.org.uk/birds-and-wildlife/bird-crime-and-investigation/crimes-against-birds) — HIGH confidence, official RSPB
- [Pokemon GO Conservation Analysis — Wiley/Conservation Biology](https://conbio.onlinelibrary.wiley.com/doi/full/10.1111/conl.12326) — HIGH confidence, peer-reviewed
- [iNaturalist Licensing — iNaturalist Help](https://help.inaturalist.org/en/support/solutions/articles/151000173511-how-do-licenses-work-on-inaturalist-should-i-change-my-licenses-) — HIGH confidence, official iNaturalist documentation
- [Location Sharing and Domestic Violence — The Conversation](https://theconversation.com/location-sharing-apps-are-enabling-domestic-violence-but-young-people-arent-aware-of-the-danger-253932) — MEDIUM confidence, academic commentary
- [ICO Data Sharing Code — Lawful Basis](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/data-sharing-a-code-of-practice/lawful-basis-for-sharing-personal-data/) — HIGH confidence, official ICO guidance
- [Digital Platforms, Privacy and Wildlife Information Ethics — Springer/Philosophy & Technology](https://link.springer.com/article/10.1007/s13347-025-00841-4) — MEDIUM confidence, peer-reviewed (2025)

---

*Pitfalls research for: UK real-world wildlife gamification app (Scout)*
*Researched: 2026-06-24*
