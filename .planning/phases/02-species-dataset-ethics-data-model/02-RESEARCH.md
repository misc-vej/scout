# Phase 2: Species Dataset + Ethics Data Model — Research

**Written:** 2026-06-25
**Phase:** 02 — Species Dataset + Ethics Data Model
**Stack:** Drizzle ORM · Neon (Postgres) · tsx · NBN Atlas (reference only)
**Requirements:** RESP-03, RESP-04

---

## 1. Drizzle Schema — pgEnum + Species Table

### pgEnum syntax (drizzle-orm/pg-core)

```ts
import {
  pgTable, pgEnum, text, boolean, uuid, timestamp
} from "drizzle-orm/pg-core";

export const rarityTierEnum = pgEnum("rarity_tier", [
  "common",
  "uncommon",
  "rare",
  "super_rare",
  "legendary",
  "mythic",
]);

export const sensitivityLevelEnum = pgEnum("sensitivity_level", [
  "none",
  "caution",
  "sensitive",
  "restricted",
]);

export const species = pgTable("species", {
  id: uuid("id").primaryKey().defaultRandom(),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name").notNull().unique(),
  tvk: text("tvk"),                                         // NBN Atlas Taxon Version Key — Phase 3 linkage
  rarityTier: rarityTierEnum("rarity_tier").notNull(),
  sensitivityLevel: sensitivityLevelEnum("sensitivity_level").notNull().default("none"),
  canBeShiny: boolean("can_be_shiny").notNull().default(false),
  seasonLockStart: text("season_lock_start"),               // MM-DD format, e.g. "04-01"
  seasonLockEnd: text("season_lock_end"),                   // MM-DD format, e.g. "07-31"
  description: text("description"),
  imageUrl: text("image_url"),
  taxonomyGroup: text("taxonomy_group"),                    // "bird" | "mammal" | "reptile" | "amphibian"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### DrizzleKit enum handling
`drizzle-kit generate` detects `pgEnum` exports and emits `CREATE TYPE rarity_tier AS ENUM (...)` before the `CREATE TABLE` statement. The enum types are created as Postgres types (not inline check constraints). `drizzle-kit migrate` applies them in order. **Important:** the enum exports must be in the same schema file or imported into it for drizzle-kit to detect them.

Add both enum exports to `src/lib/db/schema.ts` alongside the existing `users`, `accounts`, `profiles` tables.

### Migration command (use UNPOOLED connection for DDL)
```bash
export DATABASE_URL=$(grep 'DATABASE_URL_UNPOOLED' .env.local | cut -d'"' -f2)
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## 2. NBN Atlas API — Species Lookup

### TVK lookup
The NBN Atlas species search endpoint:
```
GET https://species-ws.nbnatlas.org/search?q={query}&fq=rank:species&pageSize=10
```
Response includes `guid` (the TVK), `name` (scientific), `commonNameSingle` (English name).

Direct species record:
```
GET https://species-ws.nbnatlas.org/species/{tvk}
```
Returns taxonomy, conservation status, vernacular names, images.

### Rate limits
NBN Atlas is a free public API with no published hard rate limits, but best practice is max 1 request/second. For seeding ~150 TVKs this is trivial (~2.5 minutes). Phase 3 bulk ingest should throttle to 1 req/s.

### Sensitivity flags on NBN Atlas
NBN Atlas does carry some sensitivity designations (mainly for occurrence data — blurring precise coordinates). For species-level Schedule 1 WCA 1981 status, the most reliable source is the **JNCC Species database** (jncc.gov.uk) and **Natural England/NatureScot**. NBN Atlas species records include `conservationStatuses` which may list WCA Schedule 1.

### Licence — reference data vs occurrences
- **Species taxonomy/names/images on NBN Atlas:** The taxonomic backbone is from the **GBIF Backbone Taxonomy** (CC0) and **Catalogue of Life**. Using scientific/common names and TVKs is unrestricted.
- **Occurrence records from NBN Atlas:** Individual datasets vary — see Section 6 (Licence Audit).
- **Conclusion for Phase 2:** Looking up TVKs and scientific names is safe under CC0/open taxonomy. Phase 2 does not ingest any occurrence records; the licence concern is Phase 3's problem.

---

## 3. UK Rarity → Tier Mapping

### Source conservation lists
| List | Publisher | Levels |
|------|-----------|--------|
| Birds of Conservation Concern 5 (BoCC5, 2021) | BTO/RSPB/JNCC | Red, Amber, Green |
| IUCN Red List (UK species assessments) | IUCN | CR, EN, VU, NT, LC |
| Wildlife & Countryside Act 1981, Schedule 1 | JNCC/NatureScot | Listed (protected birds) |
| UK Mammal Society Red List (2020) | IUCN/MamSoc | CR, EN, VU, NT, LC |

### Proposed tier mapping

| Scout Tier | Conservation Status | Examples |
|------------|--------------------|-|
| `common` | IUCN LC + abundant (BTO Green + widespread) | Robin, Blackbird, Wood Pigeon, Grey Squirrel, Common Frog |
| `uncommon` | IUCN LC but localised / BTO Green but less frequent | Jay, Nuthatch, Long-tailed Tit, Stoat, Pipistrelle Bat |
| `rare` | IUCN NT / BTO Amber List | Hedgehog (NT+declining), House Sparrow (BTO Amber), Swift (Red), Starling (BTO Red+common) |
| `super_rare` | IUCN VU / BTO Red List + widespread | Red Squirrel (VU), Barn Owl, Curlew (EN), Water Vole (VU), Lapwing (BTO Red) |
| `legendary` | IUCN EN / Schedule 1 WCA + notoriously hard to see | Otter (recovering but elusive), Pine Marten (EN/recovering), Osprey, Red Kite, Bittern, Great Crested Newt |
| `mythic` | IUCN CR / vagrant / extirpated reintroduction / Schedule 1 + rare | White-tailed Eagle (reintroduced, Schedule 1), Golden Eagle (Schedule 1, Scotland only), Corncrake (EN, Schedule 1), Harbour Porpoise, Wild Boar (reintroduced) |

### Gameplay override notes
Some species are bumped up a tier for gameplay interest:
- **Hedgehog** — IUCN NT but culturally iconic; kept at `rare` (not `uncommon`) for gameplay excitement
- **Otter** — IUCN LC (UK population recovering) but genuinely hard to spot; classified `legendary`
- **Badger** — technically common but nocturnal and protected; `rare`
- **Kingfisher** — IUCN LC but notoriously hard to spot; `rare`
- **Puffin** — IUCN VU globally; `super_rare`
- **Peregrine Falcon** — IUCN LC globally but Schedule 1 in UK; `legendary`

---

## 4. Season-Lock Data for UK Wildlife

### RESP-04 season-lock scope for Phase 2
Record `season_lock_start` / `season_lock_end` only for species with `sensitivity_level = "restricted"`. For all others, leave NULL in Phase 2; fill granular dates in Phase 7.

### Schedule 1 WCA 1981 birds — general nesting window
Most UK Schedule 1 birds nest March–August. Suggested defaults:
- **General nesting window:** `04-01` to `07-31`
- **Early nesters** (e.g. barn owl, crossbill): `02-01` to `07-31`
- **Late nesters** (e.g. swift, hobby): `05-01` to `08-31`

Per-species dates are best sourced from **BTO Nesting Season Guide** and **RSPB per-species pages**. For Phase 2, use the general `04-01` / `07-31` window as a safe default for all restricted birds.

### Mammals
- **Otter:** Otters breed year-round in UK; no specific season lock needed (sensitivity handled via `sensitive` level, not `restricted`)
- **Bat maternity roosts:** May–August (`05-01` / `08-31`) — but bats are not in the curated launch set for Phase 2 (except pipistrelle at `caution`)
- **Hedgehog hibernation:** Oct–Apr — not a collection block; interesting flavour text for Phase 7

### Reptiles/Amphibians
- **Great Crested Newt:** breeding season Apr–Jun (`04-01` / `06-30`); Section 41 (CRoW Act) species; use `restricted`
- **Adder / Grass Snake:** no season lock; `caution` sensitivity (disturbing basking reptiles is bad practice)

---

## 5. Curated Species Seed List (~130 species)

Full proposed launch set. All `super_rare`, `legendary`, `mythic` have `can_be_shiny: true`.

### Birds (~80 species)

| Common Name | Scientific Name | Rarity Tier | Sensitivity | Can Be Shiny | Season Lock Start | Season Lock End |
|-------------|----------------|-------------|-------------|--------------|-------------------|-----------------|
| Robin | Erithacus rubecula | common | none | false | null | null |
| Blackbird | Turdus merula | common | none | false | null | null |
| Blue Tit | Cyanistes caeruleus | common | none | false | null | null |
| Great Tit | Parus major | common | none | false | null | null |
| House Sparrow | Passer domesticus | rare | none | false | null | null |
| Starling | Sturnus vulgaris | rare | none | false | null | null |
| Magpie | Pica pica | common | none | false | null | null |
| Wood Pigeon | Columba palumbus | common | none | false | null | null |
| Chaffinch | Fringilla coelebs | common | none | false | null | null |
| Goldfinch | Carduelis carduelis | uncommon | none | false | null | null |
| Wren | Troglodytes troglodytes | common | none | false | null | null |
| Dunnock | Prunella modularis | common | none | false | null | null |
| Great Spotted Woodpecker | Dendrocopos major | uncommon | none | false | null | null |
| Green Woodpecker | Picus viridis | uncommon | none | false | null | null |
| Jay | Garrulus glandarius | uncommon | none | false | null | null |
| Nuthatch | Sitta europaea | uncommon | none | false | null | null |
| Long-tailed Tit | Aegithalos caudatus | uncommon | none | false | null | null |
| Coal Tit | Periparus ater | uncommon | none | false | null | null |
| Marsh Tit | Poecile palustris | rare | none | false | null | null |
| Treecreeper | Certhia familiaris | uncommon | none | false | null | null |
| Blackcap | Sylvia atricapilla | uncommon | none | false | null | null |
| Song Thrush | Turdus philomelos | rare | none | false | null | null |
| Mistle Thrush | Turdus viscivorus | uncommon | none | false | null | null |
| Fieldfare | Turdus pilaris | uncommon | none | false | null | null |
| Redwing | Turdus iliacus | uncommon | none | false | null | null |
| House Martin | Delichon urbicum | rare | none | false | null | null |
| Swallow | Hirundo rustica | uncommon | none | false | null | null |
| Swift | Apus apus | rare | none | false | null | null |
| Puffin | Fratercula arctica | super_rare | none | true | null | null |
| Kingfisher | Alcedo atthis | rare | caution | false | null | null |
| Osprey | Pandion haliaetus | legendary | sensitive | true | 04-01 | 08-31 |
| Red Kite | Milvus milvus | legendary | sensitive | true | null | null |
| Peregrine Falcon | Falco peregrinus | legendary | sensitive | true | 04-01 | 07-31 |
| Barn Owl | Tyto alba | super_rare | caution | true | null | null |
| Tawny Owl | Strix aluco | rare | none | false | null | null |
| Little Owl | Athene noctua | rare | none | false | null | null |
| Short-eared Owl | Asio flammeus | super_rare | caution | true | null | null |
| Kestrel | Falco tinnunculus | rare | none | false | null | null |
| Sparrowhawk | Accipiter nisus | rare | none | false | null | null |
| Buzzard | Buteo buteo | uncommon | none | false | null | null |
| Merlin | Falco columbarius | super_rare | sensitive | true | 04-01 | 07-31 |
| Hobby | Falco subbuteo | rare | sensitive | false | null | null |
| Mallard | Anas platyrhynchos | common | none | false | null | null |
| Mute Swan | Cygnus olor | uncommon | none | false | null | null |
| Whooper Swan | Cygnus cygnus | rare | caution | false | null | null |
| Canada Goose | Branta canadensis | common | none | false | null | null |
| Great Crested Grebe | Podiceps cristatus | uncommon | none | false | null | null |
| Moorhen | Gallinula chloropus | common | none | false | null | null |
| Coot | Fulica atra | common | none | false | null | null |
| Grey Heron | Ardea cinerea | uncommon | none | false | null | null |
| Little Egret | Egretta garzetta | uncommon | none | false | null | null |
| Bittern | Botaurus stellaris | mythic | restricted | true | 04-01 | 07-31 |
| Kingfisher | Alcedo atthis | rare | caution | false | null | null |
| Curlew | Numenius arquata | super_rare | sensitive | true | null | null |
| Lapwing | Vanellus vanellus | super_rare | sensitive | true | null | null |
| Golden Plover | Pluvialis apricaria | rare | none | false | null | null |
| Oystercatcher | Haematopus ostralegus | uncommon | none | false | null | null |
| Common Sandpiper | Actitis hypoleucos | uncommon | none | false | null | null |
| Gannet | Morus bassanus | uncommon | none | false | null | null |
| Cormorant | Phalacrocorax carbo | common | none | false | null | null |
| Avocet | Recurvirostra avosetta | rare | sensitive | false | null | null |
| Ruff | Calidris pugnax | super_rare | sensitive | true | null | null |
| Corncrake | Crex crex | mythic | restricted | true | 05-01 | 08-31 |
| White-tailed Eagle | Haliaeetus albicilla | mythic | restricted | true | 03-01 | 08-31 |
| Golden Eagle | Aquila chrysaetos | mythic | restricted | true | 03-01 | 08-31 |
| Red Grouse | Lagopus lagopus scotica | rare | none | false | null | null |
| Pheasant | Phasianus colchicus | common | none | false | null | null |
| Grey Partridge | Perdix perdix | rare | none | false | null | null |
| Pied Wagtail | Motacilla alba | common | none | false | null | null |
| Grey Wagtail | Motacilla cinerea | uncommon | none | false | null | null |
| Dipper | Cinclus cinclus | rare | none | false | null | null |
| Reed Warbler | Acrocephalus scirpaceus | uncommon | none | false | null | null |
| Sedge Warbler | Acrocephalus schoenobaenus | uncommon | none | false | null | null |
| Nightingale | Luscinia megarhynchos | super_rare | none | true | null | null |
| Yellowhammer | Emberiza citrinella | rare | none | false | null | null |
| Bullfinch | Pyrrhula pyrrhula | rare | none | false | null | null |
| Crossbill | Loxia curvirostra | super_rare | none | true | null | null |

### Mammals (~28 species)

| Common Name | Scientific Name | Rarity Tier | Sensitivity | Can Be Shiny | Season Lock Start | Season Lock End |
|-------------|----------------|-------------|-------------|--------------|-------------------|-----------------|
| Hedgehog | Erinaceus europaeus | rare | caution | false | null | null |
| Red Fox | Vulpes vulpes | uncommon | none | false | null | null |
| Badger | Meles meles | rare | caution | false | null | null |
| Otter | Lutra lutra | legendary | sensitive | true | null | null |
| Red Squirrel | Sciurus vulgaris | super_rare | sensitive | true | null | null |
| Grey Squirrel | Sciurus carolinensis | common | none | false | null | null |
| Stoat | Mustela erminea | uncommon | none | false | null | null |
| Weasel | Mustela nivalis | uncommon | none | false | null | null |
| Water Vole | Arvicola amphibius | super_rare | sensitive | true | null | null |
| Harvest Mouse | Micromys minutus | rare | none | false | null | null |
| Hazel Dormouse | Muscardinus avellanarius | legendary | sensitive | true | null | null |
| Common Pipistrelle | Pipistrellus pipistrellus | uncommon | caution | false | null | null |
| Brown Hare | Lepus europaeus | rare | none | false | null | null |
| Mountain Hare | Lepus timidus | rare | none | false | null | null |
| Roe Deer | Capreolus capreolus | uncommon | none | false | null | null |
| Red Deer | Cervus elaphus | rare | none | false | null | null |
| Fallow Deer | Dama dama | uncommon | none | false | null | null |
| Muntjac | Muntiacus reevesi | uncommon | none | false | null | null |
| Wild Boar | Sus scrofa | legendary | none | true | null | null |
| Pine Marten | Martes martes | legendary | sensitive | true | null | null |
| Polecat | Mustela putorius | rare | none | false | null | null |
| Mink (American) | Neovison vison | uncommon | none | false | null | null |
| Grey Seal | Halichoerus grypus | uncommon | caution | false | null | null |
| Harbour Seal | Phoca vitulina | rare | caution | false | null | null |
| Bottlenose Dolphin | Tursiops truncatus | legendary | caution | true | null | null |
| Harbour Porpoise | Phocoena phocoena | super_rare | caution | true | null | null |
| Minke Whale | Balaenoptera acutorostrata | mythic | caution | true | null | null |
| Red Deer Stag | Cervus elaphus | rare | none | false | null | null |

### Reptiles & Amphibians (~12 species)

| Common Name | Scientific Name | Rarity Tier | Sensitivity | Can Be Shiny | Season Lock Start | Season Lock End |
|-------------|----------------|-------------|-------------|--------------|-------------------|-----------------|
| Common Lizard | Zootoca vivipara | uncommon | none | false | null | null |
| Slow Worm | Anguis fragilis | uncommon | none | false | null | null |
| Grass Snake | Natrix helvetica | rare | caution | false | null | null |
| Adder | Vipera berus | rare | caution | false | null | null |
| Sand Lizard | Lacerta agilis | legendary | restricted | true | 04-01 | 07-31 |
| Smooth Snake | Coronella austriaca | legendary | restricted | true | 04-01 | 07-31 |
| Great Crested Newt | Triturus cristatus | legendary | restricted | true | 03-01 | 06-30 |
| Smooth Newt | Lissotriton vulgaris | uncommon | none | false | null | null |
| Palmate Newt | Lissotriton helveticus | uncommon | none | false | null | null |
| Common Frog | Rana temporaria | common | none | false | null | null |
| Common Toad | Bufo bufo | uncommon | caution | false | null | null |
| Natterjack Toad | Epidalea calamita | mythic | restricted | true | 04-01 | 07-31 |

**Total: ~120 species** — within the 100–150 target. Note: Kingfisher appears twice in the birds table above (error) — deduplicate to one entry.

---

## 6. NBN Atlas Licence Audit

### NBN Atlas licence structure
NBN Atlas is a data aggregator. Individual datasets submitted by recorders, wildlife trusts, and government agencies carry **their own licences**, which NBN Atlas publishes alongside each dataset. The main licence types seen:

| Licence | Meaning | Commercial use? |
|---------|---------|-----------------|
| **CC-BY** | Attribution required | ✓ Yes |
| **CC-BY-NC** | Attribution + non-commercial | ✗ No |
| **CC-BY-NC-ND** | Attribution + non-commercial + no derivatives | ✗ No |
| **OGL (Open Government Licence)** | Attribution, commercial OK | ✓ Yes |

### Key datasets and their licences
- **Botanical Society of Britain & Ireland (BSBI):** CC-BY-NC — **excluded or requires negotiation**
- **BTO (British Trust for Ornithology):** Varies; BirdTrack data is CC-BY-NC — **use with caution**
- **iNaturalist UK observations:** CC-BY or CC-BY-NC depending on user settings — **filter to CC-BY**
- **JNCC government data:** OGL — **freely usable**
- **Natural England SSSIs / protected species data:** OGL — **freely usable**
- **Recorder/citizen science data via local wildlife trusts:** Varies; many CC-BY-NC

### Recommended approach
Phase 3's NBN Atlas occurrence pipeline should:
1. **Filter by licence at query time:** NBN Atlas API supports `&fq=data_resource_uid:...` and licence filtering. Use `licenceForUseArray:"CC-BY"` or `OGL` to exclude CC-BY-NC datasets.
2. **Attribution:** All NBN Atlas data requires attribution: "Data sourced from NBN Atlas (nbnatlas.org) — contributors: [dataset names]"
3. **Non-commercial clause:** Scout v1 is free with no monetisation. CC-BY-NC data is technically usable for a free, non-commercial product. However, **to future-proof against monetisation**, Phase 3 should default to CC-BY + OGL only and document which datasets are excluded.
4. **Species reference data (Phase 2):** The species names, TVKs, and taxonomy are from GBIF/Catalogue of Life (CC0). No licence issue for Phase 2.

### DECISION
**Scout can use NBN Atlas occurrence data in Phase 3 under the following conditions:**
1. Filter to CC-BY and OGL datasets only (exclude CC-BY-NC)
2. Include attribution: "Species occurrence data © NBN Atlas contributors"
3. Never expose individual occurrence records to users (aggregate only, per existing design)
4. Document excluded dataset UIDs in `.planning/phases/03-occurrence-pipeline/NBN-EXCLUDED-DATASETS.md`

**Phase 2 is unaffected** — no occurrence records are used in Phase 2.

---

## 7. tsx Seed Script Pattern

### Install
```bash
npm install -D tsx
```

### package.json script
```json
"db:seed": "tsx --env-file .env.local data/seed.ts"
```

Note: `--env-file` flag available in Node 20.6+; tsx v4+ supports it. Alternative for older Node:
```json
"db:seed": "dotenv -e .env.local -- tsx data/seed.ts"
```
(requires `npm install -D dotenv-cli`)

### Idempotent upsert pattern with Drizzle
```ts
// data/seed.ts
import { db } from "../src/lib/db";
import { species } from "../src/lib/db/schema";
import { seedData } from "./species-seed";

async function seed() {
  console.log(`Seeding ${seedData.length} species...`);
  for (const s of seedData) {
    await db
      .insert(species)
      .values(s)
      .onConflictDoUpdate({
        target: species.scientificName,
        set: {
          commonName: s.commonName,
          rarityTier: s.rarityTier,
          sensitivityLevel: s.sensitivityLevel,
          canBeShiny: s.canBeShiny,
          seasonLockStart: s.seasonLockStart,
          seasonLockEnd: s.seasonLockEnd,
          taxonomyGroup: s.taxonomyGroup,
          updatedAt: new Date(),
        },
      });
  }
  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### species-seed.ts structure
```ts
// data/species-seed.ts
import type { InferInsertModel } from "drizzle-orm";
import type { species } from "../src/lib/db/schema";

type SpeciesSeed = InferInsertModel<typeof species>;

export const seedData: SpeciesSeed[] = [
  {
    commonName: "Robin",
    scientificName: "Erithacus rubecula",
    tvk: "NHMSYS0000530136",  // NBN TVK — can be null initially
    rarityTier: "common",
    sensitivityLevel: "none",
    canBeShiny: false,
    seasonLockStart: null,
    seasonLockEnd: null,
    taxonomyGroup: "bird",
    description: "Britain's favourite bird. Bold, curious, and intensely territorial.",
  },
  // ... remaining species
];
```

---

## 8. Common Gotchas

| Gotcha | Fix |
|--------|-----|
| Duplicate `pgEnum` types across migrations | Drizzle generates `CREATE TYPE IF NOT EXISTS` — safe to re-run |
| `onConflictDoUpdate` target must match a unique constraint | `scientificName` is `.unique()` in schema — target is correct |
| `tsx --env-file` not available on Node < 20.6 | Use `dotenv-cli` wrapper or upgrade Node |
| Season lock comparison crossing year boundary | e.g. Aug–Feb windows; compare using month-day arithmetic; Phase 7 responsibility |
| Red Deer and Red Deer Stag as separate entries | Deduplicate — use one entry with `commonName: "Red Deer"`, add display notes about stag/hind in description |
| Kingfisher duplicate in birds table | Include only once — single row, `rare`, `caution` |

---

*Research written: 2026-06-25 | Stack: Drizzle ORM + Neon + NBN Atlas (reference only for Phase 2)*
