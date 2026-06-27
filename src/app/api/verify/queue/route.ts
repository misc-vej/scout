import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { verificationRequests, collections, species, users } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  // Return pending verifications submitted by OTHER users (not this user's own)
  const queue = await db
    .select({
      id: verificationRequests.id,
      evidenceType: verificationRequests.evidenceType,
      evidenceData: verificationRequests.evidenceData,
      submittedAt: verificationRequests.submittedAt,
      submitterName: users.name,
      submitterEmail: users.email,
      speciesName: species.commonName,
      scientificName: species.scientificName,
      rarityTier: species.rarityTier,
      speciesType: species.speciesType,
    })
    .from(verificationRequests)
    .innerJoin(collections, eq(verificationRequests.collectionId, collections.id))
    .innerJoin(species, eq(collections.speciesId, species.id))
    .innerJoin(users, eq(verificationRequests.submittedBy, users.id))
    .where(
      and(
        eq(verificationRequests.status, 'pending'),
        ne(verificationRequests.submittedBy, userId)
      )
    )
    .limit(20);

  return NextResponse.json({ queue });
}
