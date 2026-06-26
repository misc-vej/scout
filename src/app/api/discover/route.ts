import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { occurrences, species } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fetchOccurrencesForGridSquare } from '@/lib/nbn';
import type { SpeciesResult } from '@/types/discovery';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { gridSquare?: string };
  try {
    body = (await req.json()) as { gridSquare?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { gridSquare } = body;
  if (!gridSquare || !/^[A-Z]{2}[0-9]{2}$/.test(gridSquare)) {
    return NextResponse.json({ error: 'Invalid grid square format' }, { status: 400 });
  }

  // Check cache — any existing occurrence row for this grid square means we already fetched
  const cached = await db
    .select({ id: occurrences.id })
    .from(occurrences)
    .where(eq(occurrences.gridSquare, gridSquare))
    .limit(1);

  if (cached.length === 0) {
    // Cache miss — fetch from NBN Atlas and populate the occurrences table
    const nbnResults = await fetchOccurrencesForGridSquare(gridSquare);

    // Load all species once and build a case-insensitive lookup map
    const allSpecies = await db
      .select({ id: species.id, scientificName: species.scientificName })
      .from(species);
    const speciesMap = new Map(
      allSpecies.map((s) => [s.scientificName.toLowerCase(), s.id])
    );

    for (const result of nbnResults) {
      const speciesId = speciesMap.get(result.scientificName.toLowerCase());
      if (!speciesId) continue; // Skip species not in our database

      await db
        .insert(occurrences)
        .values({
          speciesId,
          gridSquare,
          recordCount: result.recordCount,
          source: 'nbn_atlas',
        })
        .onConflictDoUpdate({
          target: [occurrences.speciesId, occurrences.gridSquare],
          set: {
            recordCount: result.recordCount,
            lastFetchedAt: new Date(),
          },
        });
    }
  }
  // Cache hit: skip NBN Atlas call entirely — occurrences already in DB

  // Get today's MM-DD for season-lock filtering
  const today = new Date();
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Join occurrences with species; include lock fields for in-memory filtering only
  const results = await db
    .select({
      id: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      rarityTier: species.rarityTier,
      sensitivityLevel: species.sensitivityLevel,
      canBeShiny: species.canBeShiny,
      taxonomyGroup: species.taxonomyGroup,
      speciesType: species.speciesType,
      recordCount: occurrences.recordCount,
      seasonLockStart: species.seasonLockStart,
      seasonLockEnd: species.seasonLockEnd,
    })
    .from(occurrences)
    .innerJoin(species, eq(occurrences.speciesId, species.id))
    .where(eq(occurrences.gridSquare, gridSquare))
    .orderBy(desc(occurrences.recordCount));

  // Compute likelihood normalised from recordCount
  const maxCount = results.length > 0 ? Math.max(...results.map(r => r.recordCount)) : 0;

  // Include all species but flag season-locked restricted ones instead of filtering them out
  const filtered: SpeciesResult[] = results.map((row) => {
    const { seasonLockStart: _s, seasonLockEnd, ...rest } = row;

    let isSeasonLocked = false;
    if (row.sensitivityLevel === 'restricted' && row.seasonLockStart && seasonLockEnd) {
      isSeasonLocked = mmdd >= row.seasonLockStart && mmdd <= seasonLockEnd;
    }

    return {
      ...rest,
      speciesType: row.speciesType ?? null,
      likelihood: maxCount > 0 ? row.recordCount / maxCount : 0,
      isSeasonLocked,
      seasonUnlocksAt: isSeasonLocked ? seasonLockEnd : null,
    };
  });

  // Sort by likelihood descending (most likely first)
  const sorted = filtered.sort((a, b) => b.likelihood - a.likelihood);

  return NextResponse.json(sorted);
}
