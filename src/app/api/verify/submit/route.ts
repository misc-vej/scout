import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { collections, verificationRequests } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  let body: { collectionId?: string; evidenceType?: string; evidenceData?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { collectionId, evidenceType, evidenceData } = body;
  if (!collectionId || typeof collectionId !== 'string') {
    return NextResponse.json({ error: 'collectionId required' }, { status: 400 });
  }
  if (!evidenceType || !['photo', 'description'].includes(evidenceType)) {
    return NextResponse.json({ error: 'evidenceType must be photo or description' }, { status: 400 });
  }
  if (!evidenceData || typeof evidenceData !== 'string' || evidenceData.length < 3) {
    return NextResponse.json({ error: 'evidenceData required' }, { status: 400 });
  }

  // Verify the collection belongs to this user and is eligible
  const [col] = await db
    .select({ id: collections.id, verificationStatus: collections.verificationStatus })
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)))
    .limit(1);

  if (!col) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  if (col.verificationStatus === 'verified') {
    return NextResponse.json({ error: 'Already verified' }, { status: 409 });
  }
  if (col.verificationStatus === 'pending') {
    return NextResponse.json({ error: 'Verification already pending' }, { status: 409 });
  }

  // Create the verification request and set collection to pending
  await db.insert(verificationRequests).values({
    collectionId,
    submittedBy: userId,
    evidenceType,
    evidenceData,
    status: 'pending',
  });

  await db
    .update(collections)
    .set({ verificationStatus: 'pending' })
    .where(eq(collections.id, collectionId));

  return NextResponse.json({ ok: true });
}
