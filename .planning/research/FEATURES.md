# Feature Research

**Domain:** Real-world wildlife collection game + nature logging app (UK)
**Researched:** 2026-06-24
**Confidence:** HIGH (core mechanics), MEDIUM (responsible-spotting design patterns), HIGH (competitor analysis)

---

## Competitor Landscape Overview

Before the category breakdown, a brief orientation to the analogues that inform these findings:

| App | Core loop | What it does well | What it fails at |
|-----|-----------|-------------------|-----------------|
| **Merlin Bird ID** | Hear/see → identify | Real-time Sound ID, species depth, offline | No collection/gamification, no social |
| **eBird** | Go birding → submit checklist → life list grows | Life lists, alerts, science integration, sensitive-species location hiding | Dry UX, no fun, steep learning curve |
| **iNaturalist** | Photograph → AI ID → community confirms | Citizen science, 80k+ species, sensitive-location obscuring | No gamification, camera-only, complex |
| **Seek** | Camera → instant ID → earn badges | No account needed, child-safe, monthly challenges | Gamification undermines learning, badge-chasing over contemplation |
| **Birda** | Log sighting → life list + social feed | Social community, leaderboards, challenges, field guide | Birds-only, global (not UK-specific) |
| **BirdEx (UK)** | Spot bird → unlock card → XP + leaderboard | Pokémon-style card collection, UK-focused, visual cards, quests | Birds-only, leaderboard-heavy, shallow ethics |
| **Pokémon GO** | Wander → encounter → catch → collect | Collection compulsion, rarity/shiny mechanics, social, events | Drives disturbance/trespass, precise rare-spawn locations, no real animal content |
| **Pikmin Bloom** | Walk → grow creatures | Walking-first, gentle, no combat, non-competitive | Not wildlife, no education |

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| GPS-based "what's near me" species list | Core premise of the app; Pokémon GO established this expectation for location-based apps | MEDIUM | Depends on NBN Atlas or equivalent UK species dataset; location queried with grid reference, not precise pin |
| Beastiary / collection screen | All comparable apps (BirdEx, Seek, Pokémon GO) show a visual grid of found vs. unfound species | LOW–MEDIUM | Grid with colour-fill for collected, greyed-out silhouette for not-yet-found; Pokédex pattern is fully established |
| Individual animal card with facts | Merlin, BirdEx, Birda, eBird all provide species detail; users expect depth once they log a sighting | MEDIUM | Facts, habitat, behaviour, rarity tier, conservation status; Scout's playful tone differentiates the writing |
| Rarity tier visible on card | Pokémon GO, BirdEx, gacha games all use rarity tiers; users expect them in any collection game | LOW | Common / Uncommon / Rare / Legendary mapped to real UK scarcity data; visual treatment (border colour/badge) |
| Account creation + cloud sync | Any app with a persistent collection must sync across devices; eBird, iNaturalist, Birda all do | MEDIUM | Auth (email/social sign-in), Supabase or equivalent; guest mode should be considered for onboarding friction |
| Manual log / pick from list to collect | Scout's chosen model; analogous to eBird checklist entry and Birda log-a-sighting flow | LOW | After GPS shows nearby candidates, user scrolls list and taps the species they spotted |
| Basic friends system (see what friends collected) | Birda, BirdEx, Pokémon GO all have social layers; absence feels like a feature gap for a collection game | MEDIUM | At minimum: friends list + view their beastiary/recent finds; no real-time feed required for v1 |
| Species search / browse | All naturalist apps (Merlin, iNaturalist, eBird) allow browsing by name or category | LOW | Filter/search by name, rarity tier, taxonomic group |
| Push notifications (opt-in) | Location-aware apps use notifications for nearby species or event triggers; users expect it | MEDIUM | Needs careful scoping — seasonal reminders yes, spammy location pings no |

---

### Differentiators (Competitive Advantage)

Features that set Scout apart. Not standard across the space; Scout's edge.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Responsible-spotting pledge at onboarding | No existing comparable app does this; establishes Scout's identity and filters user intent from sign-up | LOW | Single screen, illustrated, brief commitments users tap to agree; tone is warm not lecturing. National Marine Sanctuaries Wildlife Pledge is a real-world analogue |
| Per-card ethics guidance (do's & don'ts, safe distance) | Every animal card carries specific responsible-spotting notes — nesting sensitivities, approach distance, legal status. No competitor does this. | MEDIUM | Content per species; must cover UK Wildlife and Countryside Act Schedule 1 species (intentional disturbance is a criminal offence). Seed content from RSPB/NatureScot guidance |
| Contextual seasonal reminders | Time-aware nudges surfaced during sensitive windows (e.g. "UK bird nesting season runs April–August — extra care around hedgerows") — no competitor does this | MEDIUM | Rule engine based on UK seasonal calendar + species sensitivity flags; trigger on sighting-log or push notification. Calendar state stored per-species |
| Sensitive-species protection mechanics | Certain species are flagged non-collectable during sensitive periods or entirely; the app never shows precise locations of rare/vulnerable animals | MEDIUM | Requires sensitive-species flag in dataset; location never stored or displayed more precisely than ~1km grid (mirrors NBN Atlas standard). Prevents the "Snowy Owl stress" failure mode documented in research |
| Gameplay that rewards respectful distance | The game does not require or reward finding exact locations; collection is triggered by area presence, not precise pin. No crowding mechanics. | LOW–MEDIUM | GPS accuracy is intentionally coarse; no "X is HERE" signposting; design language rewards patience not pursuit |
| User-assigned personality trait per animal | Every collected card gets the user's personal read on that animal's personality (e.g. "Grumpy", "Dramatic", "Chaotic"). No competitor has this — gacha games assign personalities top-down; iNaturalist is pure science. | MEDIUM | Personality is stored per-user per-species; shown on the card; contributes to the playful tone. Trait list curated to be fun, not clinical |
| Shiny rare variants with real-world grounding | Shiny mechanic from Pokémon GO, but grounded in real UK wildlife phenomena (leucism, melanistic variants, unusually coloured individuals) | MEDIUM | Shiny unlocks are probabilistic on sighting log; tied to species that genuinely have real-world colour variants; card art differs for shiny |
| Playful tone throughout (facts, UI copy, empty states) | Merlin and eBird are serious; Seek is earnest; Scout is irreverent. Users who find nature apps dry are underserved. | LOW (ongoing) | Writing guide / tone-of-voice document needed; facts framed as surprising stories not field-guide entries |
| UK-specific species accuracy and rarity | UK-only app means rarity tiers reflect actual UK conservation status and occurrence frequency, not global averages. Merlin/iNaturalist are global. BirdEx is UK birds only; Scout covers all UK wildlife. | HIGH | Requires maintaining UK species dataset (NBN Atlas + IUCN UK assessments); rarity tier assignment is a content/data problem |
| All UK wildlife (not birds-only) | Every bird-centric competitor (Merlin, eBird, BirdEx, Birda) ignores mammals, reptiles, amphibians, insects. Seek covers all taxa. Scout covering all UK wildlife is differentiated vs. bird apps. | HIGH (data) | Scope: UK terrestrial + freshwater vertebrates + selected invertebrates; boundaries defined clearly to avoid data sprawl |
| Friends' beastiary (observational, not competitive) | Birda and BirdEx use leaderboards; Scout shows what friends have found with no ranking. Removes comparison pressure while keeping social discovery. Research on Seek shows obsessive competition is an anti-pattern. | LOW–MEDIUM | View friend's beastiary + recent sightings; no score/rank; "they found a Water Vole!" feed item |

---

### Anti-Features (Deliberately NOT Building)

Features to explicitly exclude. Some are tempting; all are harmful or misdirected for Scout.

| Feature | Why Requested | Why Problematic | What to Do Instead |
|---------|---------------|-----------------|-------------------|
| Precise location pins / map of where rare animals were seen | Users want to find rare species; Pokémon GO normalises "go to the pin" | Directly causes wildlife disturbance; enables swarming of sensitive sites; mirrors documented harm (eBird Snowy Owl case, rare bird trespass incidents) | Fuzzy location (grid square / general area only); NBN Atlas standard; "Spotted in this area" not "spotted at this coordinate" |
| Camera-based AI identification | Seems natural for a wildlife app; Merlin and iNaturalist do it | Adds significant technical complexity; encourages phone-pointing at animals (stress); misses the "I chose to claim this" satisfaction that makes manual-pick personal; out of scope for v1 | GPS + manual species pick; user is the identifier, not the camera |
| Competitive leaderboards / species-count rankings | Common in Birda, BirdEx; drives engagement | Research (Seek, BirdEx) shows competitive leaderboards cause obsessive checklist behaviour, disturbance to rack up numbers, and extrinsic motivation that crowds out genuine connection | Friends' observational feed only; personal progress stats; achievements that reward behaviour (e.g. "Spotted in 4 seasons") not volume-only count |
| Real-money purchasable shiny unlocks / gacha pulls | Monetisation norm in mobile collection games | Drives predatory engagement; encourages paying to circumvent the real-world discovery requirement; undermines Scout's "real sighting = real reward" ethos | No monetisation for v1; if future monetisation, cosmetics only (card frames, profile decoration) |
| Trading collectibles between users | Natural extension of collection games; Pokémon GO does it | Transforms sightings into tradeable commodities; breaks the "I found that" authenticity; creates secondary economy with distortion incentives | Collection is strictly personal; sharing is observational only |
| Animals outside the UK | Users will request it | Explodes dataset scope; undermines UK-rarity accuracy; makes the product unfocused | Clear UK-only boundary; international expansion as a future milestone |
| Push notifications for real-time rare species nearby | eBird rare bird alerts; what users might expect | Directly incentivises racing to a location; drives disturbance; exactly the behaviour Scout exists to prevent | Opt-in seasonal context nudges only; what-might-be-around-you general info; no "RIGHT NOW a [Rare Species] is 200m away" |
| Auto-collection on GPS proximity | Removes friction; might seem "fun" | Allows passive collection without genuine sighting; degrades the "I found that for real" core value; encourages users to drive through habitats | Manual pick required; user must consciously claim the sighting |
| Social posts / photo sharing feed | iNaturalist, Birda, Latest Sightings do this | Photo sharing of specific animal locations = de-facto location sharing of sensitive animals; moderation complexity; not Scout's differentiator | Friends beastiary view (what they've found, not where); no location attached to social data |
| Sound-based ID (background listening) | Merlin Sound ID is compelling; users may request it | Adds significant ML complexity; encourages users to walk with phone held out recording — passive engagement not active discovery | Manual pick is intentional and simpler; revisit in v2+ if appropriate |

---

## Feature Dependencies

```
Account / Auth
    └──required by──> Cloud sync
    └──required by──> Friends system
    └──required by──> Responsible-spotting pledge (tracked per account)

UK Species Dataset
    └──required by──> GPS "what's near me" list
    └──required by──> Rarity tiers
    └──required by──> Sensitive-species flags
    └──required by──> Shiny variant eligibility
    └──required by──> Per-card ethics guidance

GPS "what's near me" list
    └──required by──> Manual log / species pick
                          └──required by──> Beastiary card unlock
                                                └──enables──> User personality assignment
                                                └──enables──> Shiny variant (probabilistic)

Sensitive-species flags (in dataset)
    └──required by──> Contextual seasonal reminders
    └──required by──> Non-collectable-during-sensitive-period mechanic
    └──required by──> Location fuzziness rules

Beastiary card unlock
    └──required by──> Collection screen (need something to show)

Friends system
    └──required by──> Friends beastiary view
    └──enhanced by──> Recent-find activity feed

Responsible-spotting pledge (onboarding)
    └──enhances──> Per-card ethics guidance (thematic continuity)
    └──enhances──> Contextual seasonal reminders (user already primed)

Personality assignment
    ──conflicts with──> Top-down AI-assigned personality (never build this)

Precise location storage
    ──conflicts with──> Sensitive-species protection (never store/display)
```

### Dependency Notes

- **Species dataset is the foundation:** Almost every feature depends on having a validated UK species dataset with rarity tiers and sensitivity flags. This is the highest-risk dependency and must be resolved in the earliest research/foundation phase.
- **Responsible-spotting pledge depends on Auth:** The pledge is taken per account at first login; a guest mode would need a local-only version that resets.
- **Friends system is independent of core loop:** The GPS → log → collect → beastiary loop works without friends; social is an enhancement layer, not a prerequisite.
- **Shiny variants require rarity data:** Shiny eligibility is species-specific and depends on knowing which species have real UK colour variants; this is content work, not just an RNG flag.
- **Seasonal reminders conflict with always-on notifications:** Must be a pull model (surfaced on relevant action) or low-cadence opt-in push, not a persistent location monitor.

---

## MVP Definition

### Launch With (v1)

Minimum viable product to validate the core loop: GPS → see nearby species → log one → unlock card → assigned personality → beastiary fills.

- [ ] Account creation and sign-in — required for cloud sync and pledge
- [ ] Responsible-spotting pledge at onboarding — defines Scout's identity from first interaction
- [ ] GPS "what's near me" species list (UK dataset, area-level, no precise pins) — the discovery layer
- [ ] Manual species pick to log a sighting — the collection trigger
- [ ] Beastiary card unlock on first log — the reward
- [ ] User personality assignment per collected animal — the personalisation hook
- [ ] Rarity tier on each card (Common → Legendary, real UK scarcity) — the "something to chase"
- [ ] Per-card responsible-spotting guidance — ethics embedded in product, not bolted on
- [ ] Sensitive-species location fuzziness (never below ~1km grid) — non-negotiable from day one
- [ ] Collection screen: full beastiary (collected in colour, uncollected greyed) — "fill the book" satisfaction
- [ ] Cloud sync (collections persist across devices) — table stakes for any account-based app
- [ ] Playful tone in facts, UI copy, and empty states — this IS the product personality

### Add After Validation (v1.x)

Add once core loop is validated and retained.

- [ ] Friends system + friends beastiary view — adds social dimension once collection exists to share
- [ ] Shiny variants — adds rarity chase once users understand the base loop; needs colour-variant content per species
- [ ] Contextual seasonal reminders — adds depth; requires seasonal calendar rule engine
- [ ] Species search and filter — adds utility once beastiary has enough cards to need navigation
- [ ] Non-collectable-during-sensitive-periods mechanic — adds ethical depth; requires seasonal state in dataset

### Future Consideration (v2+)

Defer until product-market fit established.

- [ ] Push notifications (opt-in seasonal nudges) — adds engagement; requires notification infrastructure and careful design to avoid incentivising disturbance
- [ ] Achievements and milestone badges (not leaderboard) — "spotted in all four seasons", "night-time sighting" — behaviour-rewarding, not volume-rewarding
- [ ] Expanded taxonomy (invertebrates, plants) — grow the beastiary scope once core species set is proven
- [ ] Offline mode — quality-of-life for fieldwork in areas with poor signal

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| GPS nearby species list | HIGH | MEDIUM | P1 |
| Manual log / species pick | HIGH | LOW | P1 |
| Beastiary card unlock | HIGH | MEDIUM | P1 |
| Rarity tiers on cards | HIGH | LOW (if dataset has it) | P1 |
| Responsible-spotting pledge | HIGH (for Scout identity) | LOW | P1 |
| Per-card ethics guidance | HIGH (for Scout identity) | MEDIUM (content) | P1 |
| User personality assignment | HIGH (differentiator) | LOW | P1 |
| Account + cloud sync | HIGH | MEDIUM | P1 |
| Sensitive-species location fuzziness | HIGH (non-negotiable) | LOW–MEDIUM | P1 |
| Playful tone / copy | HIGH | LOW (ongoing) | P1 |
| Friends beastiary view | MEDIUM | MEDIUM | P2 |
| Shiny variants | MEDIUM | MEDIUM | P2 |
| Seasonal contextual reminders | MEDIUM | MEDIUM | P2 |
| Non-collectable sensitive periods | MEDIUM | MEDIUM | P2 |
| Species search / browse | MEDIUM | LOW | P2 |
| Push notifications | LOW–MEDIUM | MEDIUM | P3 |
| Behaviour-rewarding achievements | MEDIUM | MEDIUM | P3 |
| Offline mode | LOW | HIGH | P3 |
| Expanded taxonomy (invertebrates) | MEDIUM | HIGH (content) | P3 |

**Priority key:** P1 = must have for launch | P2 = add after validation | P3 = future

---

## Responsible Spotting — Explicit Analysis

This is Scout's most distinctive design dimension and the area where no existing app does adequate work.

### What Existing Apps Do (or Don't Do)

**eBird:** Has a sensitive species list (325 taxa globally); automatically hides exact locations for at-risk birds. No user-facing ethics guidance; no seasonal reminders; no pledge. Location protection is purely reactive (species already listed = auto-hidden). MEDIUM maturity.

**iNaturalist:** Has geoprivacy system — threatened species auto-obscured to ~22km x 22km cell. User can also manually set geoprivacy. No user-facing ethics pledge or per-observation guidance. MEDIUM maturity on location; LOW on user behaviour.

**NBN Atlas (UK):** Publicly funded UK biodiversity database; has formal sensitive species policy with 1km/2km/10km/50km/100km generalisation levels by species. Scout should mirror or reference this standard for location fuzziness. HIGH institutional maturity; no consumer UX.

**Merlin / BirdEx / Birda / Seek:** No responsible-spotting pledge, no per-species ethics guidance, no seasonal reminders, no location protection beyond general privacy. Essentially zero maturity.

**Pokémon GO:** Opposite of responsible — designed to create crowding at spawn points; rare spawns broadcast locations to thousands of players simultaneously; documented trespass lawsuits and wildlife disturbance at real locations.

### Scout's Responsible-Spotting Feature Set (Recommended)

1. **Onboarding pledge** — warm, illustrated, positively framed ("Here's how Scouts do it") not legalistic. Commitments: observe from a distance, don't share precise animal locations, don't disturb nesting animals, leave the habitat as you found it. Modelled on National Marine Sanctuaries Wildlife Pledge but with Scout's playful tone.

2. **Per-card ethics panel** — each beastiary card has a dedicated "Responsible Spotting" section: safe approach distance, seasonal sensitivities, legal status (Schedule 1 species get a clear flag), what NOT to do. Written in Scout's tone ("No flash photography — they absolutely hate it").

3. **Seasonal contextual reminders** — surfaced on the sighting-log screen during sensitive windows. UK nesting season: April–August (all birds protected; Schedule 1 species extra protection for intentional disturbance, criminal offence). Mammal breeding seasons vary. Triggered contextually, not as persistent push.

4. **Location fuzziness** — GPS used at grid-square level (~1km) for nearby-species suggestions; user's actual log location stored at generalised resolution; no user-facing map pins for where animals were seen; sensitive species get additional generalisation matching NBN Atlas tier for that species.

5. **Sensitive-species non-collectability windows** — during nesting/breeding periods for the most vulnerable species (Schedule 1 birds, SAP mammals), the collect action is temporarily disabled with an explanation. This makes the ethical constraint part of the game loop, not just guidance text users scroll past.

6. **Distance-respecting mechanics** — the game never asks "how close did you get?"; no collection bonus for proximity; no "rare spawn HERE" mechanics that incentivise rushing. The entire design language reinforces that the sighting happened in an area, not at a point.

### Responsible Spotting: Anti-Patterns to Avoid

- Ethics guidance buried in a help section (invisible) — must be on the card itself
- "We remind you to be responsible" disclaimer footer — performative; embed it in mechanics
- Leaderboards based on species count — incentivises volume over quality, driving disturbance
- Any notification that says "a [species] was seen near you" — incentivises rushing to that location
- Photo sharing features that inadvertently reveal precise locations via EXIF or visible landmarks

---

## Competitor Feature Analysis

| Feature | Merlin | eBird | iNaturalist/Seek | BirdEx (UK) | Birda | Pokémon GO | Scout (planned) |
|---------|--------|-------|------------------|-------------|-------|------------|-----------------|
| Species ID method | Sound / Photo / Q&A | Checklist entry | Camera AI | Manual pick | Manual pick | Encounter spawn | GPS + Manual pick |
| Collection/beastiary | No | Life list only | Species gallery | Card collection | Life list | Pokédex | Card beastiary |
| Rarity tiers | No | Rarity alerts | Conservation status | No | No | YES (full system) | YES (UK scarcity) |
| Shiny/rare variants | No | No | No | No | No | YES | YES (UK real variants) |
| User personality per animal | No | No | No | No | No | No | YES (differentiator) |
| Playful / fun tone | No | No | Somewhat (Seek) | Somewhat | No | YES | YES |
| Responsible-spotting pledge | No | No | No | No | No | No | YES (core) |
| Per-card ethics guidance | No | No | No | No | No | No | YES (core) |
| Seasonal reminders | No | No | No | No | No | No | YES |
| Location fuzziness (sensitive spp.) | No | YES (325 taxa) | YES (auto-obscure) | No | No | No (opposite) | YES (all sensitive spp.) |
| Sensitive-period protections | No | No | No | No | No | No | YES |
| Accounts + cloud sync | YES | YES | YES | YES | YES | YES | YES |
| Friends / social | No | Limited | Limited | Leaderboard | Community | Full (trading etc.) | Friends beastiary (observational) |
| UK-specific | No | No | No | Birds only | No | No | YES (all wildlife) |
| All UK wildlife taxa | No | No | YES | No | No | No | YES (goal) |

---

## Sources

- Merlin Bird ID: [allaboutbirds.org/news](https://www.allaboutbirds.org/news/get-more-from-merlin-bird-id-with-these-powerful-features/) | [merlin.allaboutbirds.org](https://merlin.allaboutbirds.org/sound-id/)
- eBird sensitive species: [support.ebird.org](https://support.ebird.org/en/support/solutions/articles/48000803210-sensitive-species-in-ebird) | [ebird.org/news](https://ebird.org/news/sensitive-species-in-ebird/)
- iNaturalist geoprivacy: [inaturalist.org/pages/geoprivacy](https://www.inaturalist.org/pages/geoprivacy)
- Seek features + gamification critique: [medium.com — When Gamification Goes Awry](https://medium.com/@clairedlmk/when-gamification-goes-wrong-b19cca8842bd) | [inaturalist.org/pages/seek_app](https://www.inaturalist.org/pages/seek_app)
- NBN Atlas sensitive species: [docs.nbnatlas.org/sensitive-species/](https://docs.nbnatlas.org/sensitive-species/) | [nbn.org.uk/news/nbn-sensitive-species-policy/](https://nbn.org.uk/news/nbn-sensitive-species-policy/)
- Birda: [birda.org](https://birda.org/) | [birdwatchingdaily.com](https://www.birdwatchingdaily.com/birds/field-guides-and-apps/birda-founders-describe-their-expansive-birding-app/)
- BirdEx: [beyondtheedge.co.uk/birdex/](https://www.beyondtheedge.co.uk/birdex/) | [androidpolice.com](https://www.androidpolice.com/this-pokemon-birding-app-is-only-reason-im-going-outside/) | [the-yorkshireman.com](https://the-yorkshireman.com/new-birdex-app-lets-you-catch-uk-birds-like-pokemon-and-it-could-help-save-them/)
- Pokémon GO rarity/shiny: [pokemongo.fandom.com/wiki/Shiny_Pokémon](https://pokemongo.fandom.com/wiki/Shiny_Pok%C3%A9mon)
- Pokémon GO wildlife/conservation: [conbio.onlinelibrary.wiley.com](https://conbio.onlinelibrary.wiley.com/doi/10.1111/conl.12326)
- UK wildlife legal protection: [rspb.org.uk/birds-and-wildlife/wildlife-and-countryside-act](https://www.rspb.org.uk/birds-and-wildlife/wildlife-and-countryside-act) | [legislation.gov.uk](https://www.legislation.gov.uk/ukpga/1981/69)
- Pikmin Bloom: [en.wikipedia.org/wiki/Pikmin_Bloom](https://en.wikipedia.org/wiki/Pikmin_Bloom)
- Gacha/collection mechanics: [blog.udonis.co — Character Collection Meta](https://www.blog.udonis.co/mobile-marketing/mobile-games/character-collection)
- Wildlife ethics/viewing: [sanctuaries.noaa.gov/wildlife-viewing/pledge.html](https://sanctuaries.noaa.gov/wildlife-viewing/pledge.html) | [animalsaroundtheglobe.com](https://www.animalsaroundtheglobe.com/how-to-ethically-watch-wildlife-without-disturbing-it-6-336474/)
- Digital platforms and wildlife info sharing: [link.springer.com](https://link.springer.com/article/10.1007/s13347-025-00841-4)

---
*Feature research for: Real-world UK wildlife collection game (Scout)*
*Researched: 2026-06-24*
