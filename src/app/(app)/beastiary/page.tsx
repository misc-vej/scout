import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { species, collections } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { BeastiaryCard } from '@/components/beastiary/BeastiaryCard';

function groupLabel(taxonomyGroup: string): string {
  const lower = taxonomyGroup.toLowerCase();
  if (lower === 'bird') return 'Birds';
  if (lower === 'mammal') return 'Mammals';
  if (lower === 'reptile' || lower === 'amphibian') return 'Reptiles & Amphibians';
  return taxonomyGroup.charAt(0).toUpperCase() + taxonomyGroup.slice(1);
}

export default async function BeastiaryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth');
  }
  const userId = (session.user as { id: string }).id;

  const allSpecies = await db
    .select()
    .from(species)
    .orderBy(asc(species.taxonomyGroup), asc(species.commonName));

  const userCollections = await db
    .select({
      speciesId: collections.speciesId,
      sightingCount: collections.sightingCount,
      personalityTrait: collections.personalityTrait,
    })
    .from(collections)
    .where(eq(collections.userId, userId));

  const collectedMap = new Map<string, { sightingCount: number; personalityTrait: string | null }>(
    userCollections.map((c) => [c.speciesId, { sightingCount: c.sightingCount, personalityTrait: c.personalityTrait }])
  );

  const totalCollected = collectedMap.size;
  const totalSpecies = allSpecies.length;

  // Group by taxonomyGroup
  const grouped = allSpecies.reduce<Record<string, typeof allSpecies>>((acc, s) => {
    const group = s.taxonomyGroup ?? 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(s);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).sort();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header + progress bar */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Beastiary</h1>
        <p className="mt-1 text-sm text-gray-400">
          {totalCollected} of {totalSpecies} species spotted
        </p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all"
            style={{ width: `${totalSpecies > 0 ? Math.round((totalCollected / totalSpecies) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Taxonomy filter tab row (static visual chrome) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-600 text-white whitespace-nowrap">
          All
        </span>
        {groupKeys.map((group) => (
          <span
            key={group}
            className="px-3 py-1 rounded-full text-sm bg-white/10 text-gray-400 whitespace-nowrap"
          >
            {groupLabel(group)}
          </span>
        ))}
      </div>

      {/* Card grid grouped by taxonomy */}
      {groupKeys.map((group) => (
        <section key={group} className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {groupLabel(group)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {grouped[group].map((s) => {
              const entry = collectedMap.get(s.id);
              return (
                <BeastiaryCard
                  key={s.id}
                  species={{
                    id: s.id,
                    commonName: s.commonName,
                    scientificName: s.scientificName,
                    rarityTier: s.rarityTier,
                    funFact: s.funFact ?? null,
                  }}
                  sightingCount={entry?.sightingCount}
                  personalityTrait={entry?.personalityTrait ?? null}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
