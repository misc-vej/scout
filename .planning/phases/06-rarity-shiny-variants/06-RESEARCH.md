# Phase 6 — Rarity Tiers + Shiny Variants: Research

**Written:** 2026-06-26 (manual)
**Phase:** 06 — Rarity Tiers + Shiny Variants

---

## §1 — Schema Changes

### conservationStatus on species
```ts
conservationStatus: text("conservation_status"),  // nullable
```

### isShiny on collections
```ts
isShiny: boolean("is_shiny").notNull().default(false),
```

Both are nullable-compatible (`boolean` with `.default(false)` means existing rows auto-get false via Postgres default — no data migration needed).

**Migration command:**
```bash
export $(grep -v '^#' .env.local | xargs)
npx drizzle-kit generate
DATABASE_URL=$DATABASE_URL_UNPOOLED npx drizzle-kit migrate
```

---

## §2 — Shiny Roll in POST /api/sightings

Modify `src/app/api/sightings/route.ts`. When `firstSighting === true`, roll shiny:

```ts
// After checking existing.length === 0:
if (existing.length === 0) {
  const isShiny = Math.random() < 0.02;  // 1-in-50
  await db.insert(collections).values({ userId, speciesId, sightingCount: 1, isShiny });
  sightingCount = 1;
  firstSighting = true;
  return NextResponse.json({ sightingCount, firstSighting, isShiny });
} else {
  // subsequent sighting — isShiny unchanged, read from DB if needed
  const existingFull = await db
    .select({ sightingCount: collections.sightingCount, isShiny: collections.isShiny })
    .from(collections)
    .where(and(eq(collections.userId, userId), eq(collections.speciesId, speciesId)))
    .limit(1);
  sightingCount = existingFull[0].sightingCount + 1;
  await db.update(collections)
    .set({ sightingCount, lastSightedAt: new Date() })
    .where(and(eq(collections.userId, userId), eq(collections.speciesId, speciesId)));
  return NextResponse.json({ sightingCount, firstSighting: false, isShiny: existingFull[0].isShiny });
}
```

**Note:** The existing route already does a `select` for `existing` — extend it to also select `isShiny` in the else branch to return the existing isShiny value.

---

## §3 — Conservation Status Seed Values

BTO lists (2021) — birds only. Mammals, reptiles, amphibians get `null`.

Key Red list birds (highest conservation concern):
- House Sparrow, Starling, Lapwing, Curlew, Cuckoo, Swift, Turtle Dove, Grey Partridge, Corn Bunting, Tree Sparrow, Spotted Flycatcher, Willow Tit, Lesser Spotted Woodpecker, Yellow Wagtail, Bullfinch (amber/red borderline — use red), Skylark, Linnet, Song Thrush, Mistle Thrush, Fieldfare, Redwing

Key Amber list birds (moderate conservation concern):
- Robin, Puffin, Kingfisher, Blue Tit (green actually), Great Tit (green), Swallow, Swift (red), Barn Owl (amber), Little Owl (amber), Tawny Owl (green), Buzzard (green), Red Kite (green), Peregrine Falcon (green), Kestrel (amber), Sparrowhawk (green), Golden Eagle (amber), White-tailed Eagle (amber), Bittern (amber), Corncrake (amber), Water Rail (amber), Dunlin, Oystercatcher, Redshank, Snipe

Key Green list birds (least concern):
- Magpie, Jay, Jackdaw, Rook, Carrion Crow, Wren, Dunnock, Blue Tit, Great Tit, Coal Tit, Long-tailed Tit, Goldcrest, Treecreeper, Nuthatch, Great Spotted Woodpecker, Green Woodpecker, Tawny Owl, Buzzard, Sparrowhawk, Red Kite, Peregrine Falcon, Goldfinch, Greenfinch (amber due to trichomonosis), Chaffinch

**Approach for executor:** Read all species entries in `data/species-seed.ts`. For each bird species (taxonomyGroup === 'bird' or similar), assign `conservationStatus` based on current BTO list knowledge. For all non-bird species, set `conservationStatus: null`.

---

## §4 — Rarity Tier → Tailwind CSS Mapping

The rarityTier values in DB are: `'common'`, `'uncommon'`, `'rare'`, `'super_rare'`, `'legendary'`, `'mythic'`.

```ts
const RARITY_RING: Record<string, string> = {
  common:     'ring-1 ring-gray-500/30 shadow-sm',
  uncommon:   'ring-1 ring-green-500/40 shadow-md shadow-green-500/20',
  rare:       'ring-2 ring-blue-500/50 shadow-md shadow-blue-500/25',
  super_rare: 'ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/30',
  legendary:  'ring-2 ring-amber-500/70 shadow-lg shadow-amber-500/35',
  mythic:     'ring-2 ring-red-500/80 shadow-xl shadow-red-500/40',
};

const SHINY_RING = 'ring-2 ring-yellow-400/80 shadow-xl shadow-yellow-400/40';
```

Apply to BeastiaryCard container div: replace the current `border border-white/15 bg-white/5` with `${isShiny ? SHINY_RING : RARITY_RING[species.rarityTier] ?? RARITY_RING.common} bg-white/5`.

Note: locked cards keep their existing `border border-white/5 bg-white/3 opacity-40` — no rarity ring on locked cards.

---

## §5 — Shiny Image Overlay + Badge

Inside the unlocked card's image `<div className="aspect-[3/4] ... relative">`, add:

```tsx
{isShiny && (
  <>
    {/* Gold shimmer overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-amber-500/20 pointer-events-none" />
    {/* Shiny badge */}
    <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-yellow-400/15 rounded px-1.5 py-0.5">
      <span className="text-yellow-400 text-xs font-bold">✦</span>
      <span className="text-yellow-400 text-[10px] font-semibold">Shiny</span>
    </div>
  </>
)}
```

---

## §6 — ConservationBadge Component

```tsx
// src/components/beastiary/ConservationBadge.tsx
const STATUS_STYLES = {
  red:   'bg-red-900/80 text-red-300',
  amber: 'bg-amber-900/80 text-amber-300',
  green: 'bg-green-900/80 text-green-300',
} as const;

const STATUS_LABELS = {
  red:   'BTO Red',
  amber: 'BTO Amber',
  green: 'BTO Green',
} as const;

export function ConservationBadge({ status }: { status: string | null }) {
  if (!status || !(status in STATUS_STYLES)) return null;
  const key = status as keyof typeof STATUS_STYLES;
  return (
    <span className={`${STATUS_STYLES[key]} text-[10px] font-semibold px-1.5 py-0.5 rounded`}>
      {STATUS_LABELS[key]}
    </span>
  );
}
```

Positioned `absolute bottom-2 left-2` inside the image area div.

---

## §7 — BeastiaryCard Updates

BeastiaryCard needs two new props: `isShiny: boolean` and the species needs `conservationStatus: string | null`.

Updated props type:
```ts
type BeastiaryCardProps = {
  species: {
    id: string;
    commonName: string;
    scientificName: string;
    rarityTier: string;
    funFact: string | null;
    conservationStatus: string | null;  // NEW
  };
  sightingCount?: number;
  personalityTrait?: string | null;
  isShiny?: boolean;                    // NEW
  unlocked: boolean;
};
```

---

## §8 — Beastiary Page Query Update

The beastiary page already fetches `collections` for sightingCount + personalityTrait. Add `isShiny` to that select:

```ts
const userCollections = await db
  .select({
    speciesId: collections.speciesId,
    sightingCount: collections.sightingCount,
    personalityTrait: collections.personalityTrait,
    isShiny: collections.isShiny,         // NEW
  })
  .from(collections)
  .where(eq(collections.userId, userId));

const collectedMap = new Map(
  userCollections.map((c) => [c.speciesId, {
    sightingCount: c.sightingCount,
    personalityTrait: c.personalityTrait,
    isShiny: c.isShiny,
  }])
);
```

Pass `isShiny={entry?.isShiny ?? false}` to BeastiaryCard.

Also add `conservationStatus: species.conservationStatus` to the species select (or use `db.select().from(species)` which selects all columns including conservationStatus after migration).

---

## §9 — Plan Structure

**Wave 1:**
- 06-01: Schema (conservationStatus + isShiny) + migrate + seed update + POST /api/sightings shiny roll

**Wave 2:**
- 06-02: UI — ConservationBadge + BeastiaryCard rarity glow + shiny treatment + beastiary page query update

---

*Phase 6 research complete — 2026-06-26*
