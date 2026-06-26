# Phase 4 — Collection Mechanics: Research

**Written:** 2026-06-25 (manual — researcher agent pattern consistently times out)
**Phase:** 04 — Collection Mechanics

---

## §1 — sightings + collections Schema (Drizzle)

```ts
export const sightings = pgTable("sightings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  speciesId: uuid("species_id")
    .notNull()
    .references(() => species.id, { onDelete: "cascade" }),
  gridSquare: text("grid_square").notNull(),
  sightedAt: timestamp("sighted_at").defaultNow().notNull(),
});

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: uuid("species_id")
      .notNull()
      .references(() => species.id, { onDelete: "cascade" }),
    sightingCount: integer("sighting_count").notNull().default(1),
    firstSightedAt: timestamp("first_sighted_at").defaultNow().notNull(),
    lastSightedAt: timestamp("last_sighted_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserSpecies: uniqueIndex("collections_user_species_idx").on(
      table.userId,
      table.speciesId
    ),
    userIdIdx: index("collections_user_id_idx").on(table.userId),
  })
);
```

**Notes:**
- `sightings` has no unique constraint — append-only log.
- `collections` has a unique index on `(user_id, species_id)` enabling the upsert pattern.
- `users` table uses uuid PK — check `src/lib/db/schema.ts` for exact table/column names.
- `integer` import already added in Phase 3 (for `occurrences.recordCount`).

---

## §2 — Log Sighting API Route

**POST /api/sightings**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { sightings, collections } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { speciesId?: string; gridSquare?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { speciesId, gridSquare } = body;
  if (!speciesId || typeof speciesId !== 'string') {
    return NextResponse.json({ error: 'speciesId is required' }, { status: 400 });
  }
  if (!gridSquare || !/^[A-Z]{2}[0-9]{2}$/.test(gridSquare)) {
    return NextResponse.json({ error: 'Invalid grid square' }, { status: 400 });
  }

  // Insert sighting event
  await db.insert(sightings).values({ userId, speciesId, gridSquare });

  // Upsert collection (first sighting = insert, subsequent = increment)
  const existing = await db
    .select({ sightingCount: collections.sightingCount })
    .from(collections)
    .where(and(eq(collections.userId, userId), eq(collections.speciesId, speciesId)))
    .limit(1);

  let sightingCount: number;
  let firstSighting: boolean;

  if (existing.length === 0) {
    // First sighting — insert collection row
    await db.insert(collections).values({ userId, speciesId, sightingCount: 1 });
    sightingCount = 1;
    firstSighting = true;
  } else {
    // Subsequent sighting — increment count
    sightingCount = existing[0].sightingCount + 1;
    await db
      .update(collections)
      .set({ sightingCount, lastSightedAt: new Date() })
      .where(and(eq(collections.userId, userId), eq(collections.speciesId, speciesId)));
    firstSighting = false;
  }

  return NextResponse.json({ sightingCount, firstSighting });
}
```

**Alternative using onConflictDoUpdate** (more concise but requires returning the new count):
```ts
// Less readable for this case — use the explicit select+insert/update above
```

---

## §3 — SpeciesCard + SpeciesList Update

`SpeciesCard` currently accepts `{ species: SpeciesResult }`. It needs:
1. A `gridSquare` prop (to pass to the sighting API)
2. A "Log sighting" button powered by TanStack Query `useMutation`
3. Local state for confirmation message

Since `SpeciesCard` needs interactive state, it must become `"use client"`. The existing file has no `"use client"` directive — add it.

**Updated SpeciesCard props:**
```ts
type SpeciesCardProps = {
  species: SpeciesResult;
  gridSquare: string;
};
```

**Log sighting mutation in SpeciesCard:**
```ts
const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

const logMutation = useMutation({
  mutationFn: async () => {
    const res = await fetch('/api/sightings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speciesId: species.id, gridSquare }),
    });
    if (!res.ok) throw new Error('Failed to log sighting');
    return res.json() as Promise<{ sightingCount: number; firstSighting: boolean }>;
  },
  onSuccess: (data) => {
    const msg = data.firstSighting
      ? '✓ Logged! Card unlocked'
      : `✓ Logged again! (${data.sightingCount}× spotted)`;
    setConfirmMsg(msg);
    setTimeout(() => setConfirmMsg(null), 1800);
  },
});
```

**SpeciesList** update — add `gridSquare` prop and pass it to each `SpeciesCard`:
```ts
const SpeciesList: FC<{ species: SpeciesResult[]; gridSquare: string }> = ({ species, gridSquare }) => (
  // ...
  {species.map((s) => <SpeciesCard key={s.id} species={s} gridSquare={gridSquare} />)}
);
```

`SpeciesList` can remain a server component if it just passes props — but since `SpeciesCard` is now `"use client"`, `SpeciesList` can stay as-is (server components can render client components).

---

## §4 — Minimal Beastiary Page

**Route:** `/beastiary` — already stubbed in Phase 1 at `src/app/(app)/beastiary/page.tsx`

**Server component** — queries Neon server-side, no client state needed.

```ts
import { db } from '@/lib/db';
import { species, collections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function BeastiaryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth');

  const userId = session.user.id;

  // Fetch all species + user's collections in one join
  const allSpecies = await db.select().from(species).orderBy(species.taxonomyGroup, species.commonName);

  const userCollections = await db
    .select({ speciesId: collections.speciesId, sightingCount: collections.sightingCount })
    .from(collections)
    .where(eq(collections.userId, userId));

  const collectedMap = new Map(userCollections.map((c) => [c.speciesId, c.sightingCount]));

  // Group by taxonomyGroup
  const grouped = allSpecies.reduce<Record<string, typeof allSpecies>>((acc, s) => {
    const group = s.taxonomyGroup ?? 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-white">Beastiary</h1>
      <p className="mb-6 text-sm text-gray-400">{collectedMap.size} of {allSpecies.length} species spotted</p>
      {Object.entries(grouped).map(([group, groupSpecies]) => (
        <section key={group} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 capitalize">{group}s</h2>
          <div className="flex flex-col gap-2">
            {groupSpecies.map((s) => {
              const count = collectedMap.get(s.id);
              const unlocked = count !== undefined;
              return (
                <div key={s.id} className={`flex items-center justify-between rounded-lg border p-3 ${unlocked ? 'border-white/15 bg-white/5' : 'border-white/5 bg-transparent opacity-50'}`}>
                  <div>
                    <p className={`font-medium ${unlocked ? 'text-white' : 'text-gray-600'}`}>{unlocked ? s.commonName : '???'}</p>
                    {unlocked && <p className="text-xs text-gray-500 italic">{s.scientificName}</p>}
                    {!unlocked && <p className="text-xs text-gray-600">Not yet sighted</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {unlocked && count && count > 0 && (
                      <span className="text-xs text-green-500 font-semibold">{count}×</span>
                    )}
                    {/* RarityBadge for unlocked species only */}
                    {unlocked && <RarityBadge tier={s.rarityTier} />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
```

---

## §5 — Session User ID

`auth()` returns a session where `session.user.id` is set in the Phase 1 jwt/session callbacks. Verified: `src/auth.ts` has `session.user.id = token.id as string` in the session callback.

Check if the users table in Drizzle uses `id` as the uuid column name — from Phase 1 schema. Should be `users.id`.

---

## §6 — Plan Structure (3 plans, 2 waves)

### Wave 1
**Plan 04-01:** sightings + collections tables schema + Drizzle migration  
- Add both tables to `src/lib/db/schema.ts`
- Run `drizzle-kit generate` + `drizzle-kit migrate`
- Verify: `npx tsc --noEmit` passes, tables exist in Neon

### Wave 2 (parallel)
**Plan 04-02:** Log Sighting API + SpeciesCard update  
- Create `src/app/api/sightings/route.ts`
- Update `src/components/discover/SpeciesCard.tsx` — add `"use client"`, `gridSquare` prop, `useMutation` for log, confirmation message
- Update `src/components/discover/SpeciesList.tsx` — add `gridSquare` prop, pass to SpeciesCard
- Update `src/components/discover/DiscoverClient.tsx` — already passes `result.gridSquare` to SpeciesList (check if already wired)

**Plan 04-03:** Minimal Beastiary page  
- Replace `src/app/(app)/beastiary/page.tsx` stub with functional server component
- Shows all 115 species grouped by taxonomyGroup, locked/unlocked state
- Imports `RarityBadge` from Phase 3

04-02 and 04-03 are parallel — zero file overlap:
- 04-02: api/sightings, components/discover/*
- 04-03: app/(app)/beastiary/page.tsx only

---

## §7 — TypeScript Notes

- `session.user.id` type — NextAuth session.user extends built-in type. If TypeScript complains about `id` not being on `session.user`, cast: `(session.user as { id: string }).id` or use the augmented type from Phase 1's auth.ts.
- `collections.lastSightedAt` in the update — use Drizzle's `new Date()` not `sql\`NOW()\`` for consistency.
- The `RarityBadge` import in the beastiary page — import from `@/components/discover/RarityBadge`. It's a server component (no `"use client"`).

---

*Phase 4 research complete — 2026-06-25*
