import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { species, collections } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import RarityBadge from '@/components/discover/RarityBadge';

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

  const totalCollected = collectedMap.size;
  const totalSpecies = allSpecies.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
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

      {Object.entries(grouped).map(([group, groupSpecies]) => (
        <section key={group} className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {group}s
          </h2>
          <div className="flex flex-col gap-2">
            {groupSpecies.map((s) => {
              const count = collectedMap.get(s.id);
              const unlocked = count !== undefined;
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    unlocked
                      ? 'border-white/15 bg-white/5'
                      : 'border-white/5 bg-transparent opacity-40'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <p className={`font-medium ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                      {unlocked ? s.commonName : '???'}
                    </p>
                    {unlocked ? (
                      <p className="text-xs italic text-gray-500">{s.scientificName}</p>
                    ) : (
                      <p className="text-xs text-gray-600">Not yet sighted</p>
                    )}
                  </div>
                  {unlocked && (
                    <div className="flex items-center gap-2">
                      {count && count > 1 && (
                        <span className="text-xs font-semibold text-green-400">{count}×</span>
                      )}
                      <RarityBadge tier={s.rarityTier} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
