# Phase 5 — Beastiary UI + Personality: Research

**Written:** 2026-06-25 (manual)
**Phase:** 05 — Beastiary UI + Personality

---

## §1 — Schema Changes

### 5a: Add funFact to species table

```ts
// In src/lib/db/schema.ts, add to species table columns:
funFact: text("fun_fact"),
```

No index needed. Nullable. Migration: `drizzle-kit generate` + `drizzle-kit migrate`.

### 5b: Add personalityTrait to collections table

```ts
// In src/lib/db/schema.ts, add to collections table columns:
personalityTrait: text("personality_trait"),
```

Nullable (unset until user picks). No enum — stored as plain text, validated at API layer against the 8 allowed values.

Both changes can be in a single migration SQL file (both are simple `ALTER TABLE ADD COLUMN` operations). They can be done in a single edit to schema.ts and one `drizzle-kit generate` + `migrate` run, or split across two plans running in parallel (each plan modifies a different table, generates/applies its own migration).

**Preferred: split across two Wave 1 plans** — 05-01 touches `species`, 05-02 touches `collections`. No overlap, no conflict. Each plan runs its own migration separately. This is safe because `ALTER TABLE ADD COLUMN` with a new nullable column on different tables can run in any order.

---

## §2 — Fun Facts (sample set for seed data)

The executor must add a `funFact` field to every entry in `data/species-seed.ts`. Sample facts for key species — the executor should write playful, irreverent, UK-specific facts for ALL 115 species in a similar tone:

| Species | Fun Fact |
|---------|----------|
| Hedgehog | Britain's most huggable road casualty. Hibernates Oct–Apr and genuinely does not care about your plans. |
| Red Fox | Urban foxes can open bins but still can't figure out doors. Scientists are baffled. |
| Otter | Holds hands with its partner while sleeping so they don't drift apart. Relationships goals. |
| Badger | Has lived in the same sett as its ancestors for hundreds of years. Your flat-share is temporary. |
| Red Squirrel | Forgets where it buried most of its nuts. Scotland's most relatable resident. |
| Kingfisher | Flies so fast it's basically a flying blue jewel. Blinks with a special transparent eyelid before diving. |
| Puffin | Spends most of its life on the open ocean. Only comes ashore to breed. Extremely introverted. |
| Robin | The one who sings loudest in December isn't spreading Christmas cheer — it's threatening rival robins. |
| Otter | See above — ranks twice because scientists genuinely get emotional writing about them. |
| Red Kite | Was extinct in England for 200 years. Now thrives in the Chilterns. A genuine conservation success story. |
| Barn Owl | Can locate prey by sound alone in total darkness. Also looks perpetually surprised. |
| Water Vole | Ratty from Wind in the Willows. Declining fast due to mink. One of the UK's most at-risk mammals. |
| Peregrine Falcon | The fastest animal on Earth — 240mph in a dive. Has a second eyelid to protect against wind. |
| Hazel Dormouse | Sleeps for 7 months of the year. A career goal for most humans. |
| White-tailed Eagle | Has a 2.4m wingspan. Scotland's largest bird of prey and the UK's largest bird full stop. |
| Natterjack Toad | Britain's loudest amphibian — its call can be heard 2km away. Tiny, loud, no regrets. |
| Great Crested Newt | Has more legal protection than most buildings. A planning department's nightmare. |
| Bittern | Makes a booming foghorn sound to attract mates. Sounds exactly like someone blowing across a bottle. |
| Common Frog | One of the most widespread vertebrates in Britain. Spawns in the same pond it was born in. |
| Grey Seal | Pups triple their weight in 3 weeks then get abandoned on a beach. Classic British parenting. |
| Minke Whale | The most commonly sighted whale off British coasts. Often spotted solo, always looked busy. |
| Corncrake | A bird so secretive even birdwatchers mostly just hear it. Makes a sound like raking gravel. |
| Wild Boar | Recolonised the Forest of Dean through escaped farm animals. The British countryside said yes. |
| Pine Marten | Makes a "sweet marten seat" — a pile of droppings left in prominent spots as a calling card. Classy. |
| Adder | Britain's only venomous snake. Bites are rarely fatal and almost always caused by picking one up. |

**Tone guidelines for executor:**
- One to two sentences max
- Irreverent but affectionate — never mean
- UK-specific references where possible
- Avoid generic biology facts — go for the surprising, funny, or emotionally resonant angle
- "Scientists are baffled" / "classic British X" / "one of the UK's..." are good patterns

---

## §3 — Personality Trait API

**PATCH /api/collections/[speciesId]/personality**

```ts
// src/app/api/collections/[speciesId]/personality/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { collections } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const ALLOWED_TRAITS = ['Brave', 'Sneaky', 'Chill', 'Grumpy', 'Curious', 'Dramatic', 'Wise', 'Chaotic'] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ speciesId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { speciesId } = await params;

  let body: { trait?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.trait || !ALLOWED_TRAITS.includes(body.trait as typeof ALLOWED_TRAITS[number])) {
    return NextResponse.json({ error: `trait must be one of: ${ALLOWED_TRAITS.join(', ')}` }, { status: 400 });
  }

  const result = await db
    .update(collections)
    .set({ personalityTrait: body.trait })
    .where(and(eq(collections.userId, userId), eq(collections.speciesId, speciesId)))
    .returning({ personalityTrait: collections.personalityTrait });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Species not in collection' }, { status: 404 });
  }

  return NextResponse.json({ personalityTrait: result[0].personalityTrait });
}
```

**Note on Next.js 16 dynamic params:** In Next.js 16, route params are `Promise<{ speciesId: string }>` — must be awaited. Pattern: `const { speciesId } = await params;`

---

## §4 — Beastiary Card Grid Components

### BeastiaryCard.tsx (server component — no interactions, just display)

Locked card:
```tsx
<div className="flex flex-col rounded-xl border border-white/5 bg-white/3 overflow-hidden opacity-30">
  {/* Placeholder image area */}
  <div className="aspect-[3/4] bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
    <span className="text-6xl font-black text-white/10">?</span>
  </div>
  {/* Card footer */}
  <div className="p-3">
    <p className="font-bold text-gray-600">???</p>
    <p className="text-xs text-gray-700 mt-0.5">Not yet sighted</p>
  </div>
</div>
```

Unlocked card (without personality picker — static display):
```tsx
<div className="flex flex-col rounded-xl border border-white/15 bg-white/5 overflow-hidden">
  {/* Placeholder image area — spans full width */}
  <div className="aspect-[3/4] bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center relative">
    <span className="text-8xl font-black text-white/10 select-none">
      {species.commonName.charAt(0)}
    </span>
    {/* Rarity badge positioned bottom-right */}
    <div className="absolute bottom-2 right-2">
      <RarityBadge tier={species.rarityTier} />
    </div>
  </div>
  {/* Card info */}
  <div className="p-3 flex flex-col gap-1">
    <p className="font-bold text-white">{species.commonName}</p>
    <p className="text-xs italic text-gray-500">{species.scientificName}</p>
    {species.funFact && (
      <p className="text-xs text-gray-400 mt-1 italic">{species.funFact}</p>
    )}
    {sightingCount && sightingCount > 1 && (
      <p className="text-xs text-green-400 font-semibold">{sightingCount}× spotted</p>
    )}
  </div>
</div>
```

### PersonalityPicker.tsx ("use client" — handles PATCH mutation)

```tsx
'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

const TRAITS = ['Brave', 'Sneaky', 'Chill', 'Grumpy', 'Curious', 'Dramatic', 'Wise', 'Chaotic'] as const;

type Trait = typeof TRAITS[number];

export function PersonalityPicker({
  speciesId,
  currentTrait,
}: {
  speciesId: string;
  currentTrait: string | null;
}) {
  const [selected, setSelected] = useState<Trait | null>(currentTrait as Trait | null);

  const mutation = useMutation({
    mutationFn: async (trait: Trait) => {
      const res = await fetch(`/api/collections/${speciesId}/personality`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trait }),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json() as Promise<{ personalityTrait: string }>;
    },
    onSuccess: (data) => setSelected(data.personalityTrait as Trait),
  });

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500 mb-1">Personality</p>
      <div className="flex flex-wrap gap-1">
        {TRAITS.map((trait) => (
          <button
            key={trait}
            onClick={() => mutation.mutate(trait)}
            disabled={mutation.isPending}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
              selected === trait
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
            }`}
          >
            {trait}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Updated /beastiary page structure

The beastiary page is a server component that fetches all data and passes it to a grid. It replaces the Phase 4 list entirely.

```tsx
// Groups: ['bird', 'mammal', 'reptile', 'amphibian']
// Tab/filter row at top (optional for MVP — can just show all in one grid with group headings)
// 2-col grid mobile, 3-col md+
```

---

## §5 — Seed Update Strategy

The `data/species-seed.ts` file uses `InferInsertModel<typeof species>`. After adding `funFact` to the schema, the type will include `funFact?: string | null`. The seed data entries need a `funFact` field added.

**Migration order:** The `drizzle-kit migrate` for 05-01 (adding funFact to species) must run BEFORE `npm run db:seed`. The seed script will fail if the column doesn't exist yet.

**Re-running seed:** The seed uses `onConflictDoUpdate` on `scientificName` — re-running will update all existing species rows with their funFact values. This is safe and idempotent.

---

## §6 — Plan Structure

### Wave 1 (parallel — different tables)

**Plan 05-01:** Add `funFact` to species + migrate + update seed with fun facts + re-run db:seed  
Files: `src/lib/db/schema.ts`, `data/species-seed.ts`, `drizzle/migration`

**Plan 05-02:** Add `personalityTrait` to collections + migrate + PATCH /api/collections/[speciesId]/personality  
Files: `src/lib/db/schema.ts`, `src/app/api/collections/[speciesId]/personality/route.ts`, `drizzle/migration`

**Parallel safety:** Both plans edit `schema.ts`, but they edit DIFFERENT tables (species vs collections). The risk is a merge conflict on schema.ts. Mitigation: run 05-01 and 05-02 sequentially (Wave 1a and 1b), not truly in parallel — OR have each plan only edit the one table it owns and commit, letting the second plan pull the latest before editing.

**Revised wave structure to avoid conflict:**
- Wave 1: 05-01 (species funFact)  
- Wave 2: 05-02 (collections personalityTrait) + wait for 05-01 to commit first

Actually simpler: just do Wave 1 = 05-01, Wave 2 = 05-02 + 05-03 where 05-02 and 05-03 have no file overlap after 05-01 commits. 05-02 (collections schema + API) and 05-03 (beastiary UI) touch different files.

**Final wave structure:**
- Wave 1: 05-01 (funFact column + seed update)
- Wave 2: 05-02 (personalityTrait column + PATCH API) + 05-03 (beastiary card grid UI) — truly parallel, different files

05-02 touches: `schema.ts` (collections table only), `api/collections/[speciesId]/personality/route.ts`
05-03 touches: `beastiary/page.tsx`, `components/beastiary/BeastiaryCard.tsx`, `components/beastiary/PersonalityPicker.tsx`

Zero file overlap between 05-02 and 05-03 ✓

---

*Phase 5 research complete — 2026-06-25*
