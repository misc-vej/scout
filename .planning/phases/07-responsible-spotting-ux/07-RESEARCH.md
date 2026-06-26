# Phase 7 — Responsible Spotting UX: Research

**Written:** 2026-06-26 (manual)
**Phase:** 07 — Responsible Spotting UX

---

## §1 — Schema Changes

### pledgeAcceptedAt on profiles
```ts
pledgeAcceptedAt: timestamp("pledge_accepted_at", { mode: "date" }),
```
Nullable. Existing rows get null (no pledge accepted yet — they'll see the modal on next visit).

### spottingTips on species
```ts
spottingTips: text("spotting_tips"),
```
Nullable. 1-2 sentences per species.

**Migration:**
```bash
export $(grep -v '^#' .env.local | xargs)
npx drizzle-kit generate
DATABASE_URL=$DATABASE_URL_UNPOOLED npx drizzle-kit migrate
```

---

## §2 — Pledge Accept API Route

```ts
// src/app/api/pledge/accept/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  await db
    .update(profiles)
    .set({ pledgeAcceptedAt: new Date() })
    .where(eq(profiles.userId, userId));

  return NextResponse.json({ accepted: true });
}
```

---

## §3 — PledgeModal Component

```tsx
// src/components/auth/PledgeModal.tsx
'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function PledgeModal() {
  const [accepted, setAccepted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/pledge/accept', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to record pledge');
      return res.json();
    },
    onSuccess: () => setAccepted(true),
  });

  if (accepted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 shadow-2xl">
        <h2 className="mb-1 text-xl font-bold text-white">The Scout's Pledge</h2>
        <p className="mb-6 text-sm text-gray-400">Before you start collecting, please commit to responsible spotting.</p>
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300 leading-relaxed">
          I promise to observe wildlife without disturbing it. I will keep a safe distance,
          never touch nests or young, stay on paths, and follow the Wildlife &amp; Countryside
          Act 1981. If I see something rare, I&apos;ll keep the location to myself.
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Saving…' : 'I Accept the Pledge'}
        </button>
      </div>
    </div>
  );
}
```

---

## §4 — App Layout Gate

In `src/app/(app)/layout.tsx`, read the profile server-side and conditionally render PledgeModal:

```tsx
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PledgeModal } from '@/components/auth/PledgeModal';

// Inside the layout server component:
const session = await auth();
const userId = (session?.user as { id: string } | undefined)?.id;

let pledgeAccepted = true; // default to true to avoid flash on edge cases
if (userId) {
  const profile = await db
    .select({ pledgeAcceptedAt: profiles.pledgeAcceptedAt })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  pledgeAccepted = !!(profile[0]?.pledgeAcceptedAt);
}

// In the return JSX, render PledgeModal before main content if not accepted:
return (
  <>
    {!pledgeAccepted && <PledgeModal />}
    {/* existing layout content */}
  </>
);
```

**IMPORTANT:** Read the existing layout.tsx carefully before modifying — it likely already has NavShell and other content. Add the pledge check without breaking existing structure.

---

## §5 — SpeciesResult Type Update + Discover API Change

**Update `src/types/discovery.ts`:**
```ts
export type SpeciesResult = {
  id: string;
  commonName: string;
  scientificName: string;
  rarityTier: string;
  sensitivityLevel: string;
  canBeShiny: boolean;
  taxonomyGroup: string | null;
  recordCount: number;
  isSeasonLocked: boolean;      // NEW
  seasonUnlocksAt: string | null; // NEW — MM-DD format, e.g. "08-31"
};
```

**Update `src/app/api/discover/route.ts`:**
Change the filter+map block. Instead of filtering out restricted season-locked species, include them with a flag:

```ts
const filtered: SpeciesResult[] = results.map((row) => {
  const { seasonLockStart: _s, seasonLockEnd, ...rest } = row;
  
  let isSeasonLocked = false;
  if (row.sensitivityLevel === 'restricted' && row.seasonLockStart && seasonLockEnd) {
    isSeasonLocked = mmdd >= row.seasonLockStart && mmdd <= seasonLockEnd;
  }

  return {
    ...rest,
    isSeasonLocked,
    seasonUnlocksAt: isSeasonLocked ? seasonLockEnd : null,
  };
});

return NextResponse.json(filtered);
```

---

## §6 — SpeciesCard Season-Lock Disabled Button

In `src/components/discover/SpeciesCard.tsx`, update the button section:

```tsx
{species.isSeasonLocked ? (
  <div className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-500 cursor-not-allowed">
    {species.seasonUnlocksAt
      ? `Unavailable until ${formatMMDD(species.seasonUnlocksAt)}`
      : 'Unavailable this season'}
  </div>
) : confirmMsg ? (
  <span className="text-xs font-semibold text-green-400">{confirmMsg}</span>
) : (
  <button
    onClick={() => logMutation.mutate()}
    disabled={logMutation.isPending}
    className="rounded-md bg-green-600/20 px-3 py-1 text-xs font-semibold text-green-400 hover:bg-green-600/40 disabled:opacity-50 transition-colors"
  >
    {logMutation.isPending ? 'Logging…' : 'Log sighting'}
  </button>
)}
```

Helper function (add inside the component file or as a small util):
```ts
function formatMMDD(mmdd: string): string {
  const [month, day] = mmdd.split('-').map(Number);
  return new Date(2000, month - 1, day).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}
// e.g. "08-31" → "31 Aug"
```

---

## §7 — EthicsSection Component

```tsx
// src/components/beastiary/EthicsSection.tsx
'use client';
import { useState } from 'react';

export function EthicsSection({ tips }: { tips: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 border-t border-white/10 pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-xs text-gray-500 hover:text-gray-400 transition-colors"
      >
        <span>Responsible spotting</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">{tips}</p>
      )}
    </div>
  );
}
```

Add to BeastiaryCard unlocked state — below PersonalityPicker, only if `species.spottingTips`:
```tsx
{species.spottingTips && <EthicsSection tips={species.spottingTips} />}
```

---

## §8 — SensitivityBadge Component

```tsx
// src/components/beastiary/SensitivityBadge.tsx (server component)
const SENSITIVITY_STYLES = {
  caution:    'bg-amber-900/80 text-amber-300',
  sensitive:  'bg-orange-900/80 text-orange-300',
  restricted: 'bg-red-900/80 text-red-300',
} as const;

const SENSITIVITY_LABELS = {
  caution:    'Handle with care',
  sensitive:  'Sensitive species',
  restricted: 'Location restricted',
} as const;

export function SensitivityBadge({ level }: { level: string }) {
  if (level === 'none' || !(level in SENSITIVITY_STYLES)) return null;
  const key = level as keyof typeof SENSITIVITY_STYLES;
  return (
    <span className={`${SENSITIVITY_STYLES[key]} text-[10px] font-semibold px-1.5 py-0.5 rounded`}>
      {SENSITIVITY_LABELS[key]}
    </span>
  );
}
```

Position in BeastiaryCard: inside the card info section (below scientific name, above fun fact). The `sensitivityLevel` is already in the species data returned by the beastiary page query (it selects all species columns).

---

## §9 — Spotting Tips Sample Content

Tone: practical, brief, specific to UK field conditions. One or two sentences.

Sample values for executor to follow:

| Species | Spotting Tips |
|---------|--------------|
| Hedgehog | Best spotted at dusk near garden edges. Never disturb hibernating animals — if a hedgehog is out in daylight in winter, it needs help. |
| Red Fox | Observe from a distance — urban foxes may seem tame but stay 10m+. Never feed them as it can disrupt natural behaviour. |
| Otter | Watch quietly from riverbanks. Otters are legally protected — never approach a holt or disturb bankside vegetation. |
| Badger | Watch badger setts from at least 20m, downwind, at dusk. Disturbing setts is illegal under the Protection of Badgers Act 1992. |
| Robin | Robins often approach gardeners for disturbed worms — enjoy it, but resist the urge to encourage by hand-feeding. |
| Barn Owl | Never use torches near nesting sites. Barn owls are Schedule 1 — disturbance at the nest is a criminal offence. |
| Adder | Observe from at least 2m. If an adder feels cornered it may strike — give it space to move away on its own. |
| Great Crested Newt | Never handle or disturb pond edges during breeding season (Feb–May). They are strictly protected under the WCA 1981. |
| Red Kite | Enjoy from below — binoculars are all you need. Never approach nest sites during breeding season (March–July). |
| Puffin | Maintain 10m distance on clifftops. Burrow disturbance causes colony abandonment — stay on marked paths. |
| Kingfisher | Watch quietly from riverbanks without sudden movements. Kingfishers are very sensitive to disturbance at nest burrows. |
| Peregrine Falcon | Use binoculars from 100m+. Schedule 1 protected — nest disturbance, even accidental, carries criminal penalties. |

**For executor:** Write a distinct `spottingTips` for each of the ~115 species. For species with higher sensitivity levels, make the tip specifically reference the legal protection or key disturbance risk. For common, lower-sensitivity species, a practical distance/habitat tip is sufficient.

---

## §10 — Plan Structure

**Wave 1 — 07-01:** Schema + pledge API + layout gate + PledgeModal
- `pledgeAcceptedAt` on profiles + `spottingTips` on species — BOTH in one schema edit + one migration
- `POST /api/pledge/accept`
- `src/components/auth/PledgeModal.tsx` — client component
- `src/app/(app)/layout.tsx` — add pledge gate

**Wave 2 — 07-02:** Ethics/sensitivity UI + season-lock UX + seed
- Update `data/species-seed.ts` — add `spottingTips` per species
- Re-run `npm run db:seed`
- Create `src/components/beastiary/EthicsSection.tsx` + `SensitivityBadge.tsx`
- Update `src/components/beastiary/BeastiaryCard.tsx` — add EthicsSection + SensitivityBadge
- Update `src/types/discovery.ts` — add `isSeasonLocked`, `seasonUnlocksAt`
- Update `src/app/api/discover/route.ts` — season-lock flag instead of filter
- Update `src/components/discover/SpeciesCard.tsx` — disabled button for locked species

No file overlap between 07-01 and 07-02. Schema edits both happen in 07-01 (one migration covers both columns). 07-02 reads the migrated schema.

---

*Phase 7 research complete — 2026-06-26*
