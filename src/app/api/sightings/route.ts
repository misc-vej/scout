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
  const userId = (session.user as { id: string }).id;

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

  // Insert sighting event (append-only)
  await db.insert(sightings).values({ userId, speciesId, gridSquare });

  // Upsert collection (first sighting = insert, repeat = increment)
  const existing = await db
    .select({ sightingCount: collections.sightingCount })
    .from(collections)
    .where(and(eq(collections.userId, userId), eq(collections.speciesId, speciesId)))
    .limit(1);

  let sightingCount: number;
  let firstSighting: boolean;

  if (existing.length === 0) {
    await db.insert(collections).values({ userId, speciesId, sightingCount: 1 });
    sightingCount = 1;
    firstSighting = true;
  } else {
    sightingCount = existing[0].sightingCount + 1;
    await db
      .update(collections)
      .set({ sightingCount, lastSightedAt: new Date() })
      .where(and(eq(collections.userId, userId), eq(collections.speciesId, speciesId)));
    firstSighting = false;
  }

  return NextResponse.json({ sightingCount, firstSighting });
}
