import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { verificationRequests, collections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { checkAndAwardBadges } from '@/lib/badges';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const reviewerId = (session.user as { id: string }).id;

  const { id } = await params;

  let body: { decision?: string; reviewNote?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { decision, reviewNote } = body;
  if (!decision || !['approved', 'rejected'].includes(decision)) {
    return NextResponse.json({ error: 'decision must be approved or rejected' }, { status: 400 });
  }

  // Fetch the request
  const [vr] = await db
    .select({ id: verificationRequests.id, collectionId: verificationRequests.collectionId, submittedBy: verificationRequests.submittedBy, status: verificationRequests.status })
    .from(verificationRequests)
    .where(eq(verificationRequests.id, id))
    .limit(1);

  if (!vr) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (vr.status !== 'pending') return NextResponse.json({ error: 'Already resolved' }, { status: 409 });
  if (vr.submittedBy === reviewerId) return NextResponse.json({ error: 'Cannot review own submission' }, { status: 403 });

  const newCollectionStatus = decision === 'approved' ? 'verified' : 'rejected';

  await db
    .update(verificationRequests)
    .set({ status: decision, reviewerId, reviewNote: reviewNote ?? null, resolvedAt: new Date() })
    .where(eq(verificationRequests.id, id));

  await db
    .update(collections)
    .set({ verificationStatus: newCollectionStatus })
    .where(eq(collections.id, vr.collectionId));

  // If approved, check for newly earned badges for the submitting user
  let newBadges: { slug: string; name: string; icon: string }[] = [];
  if (decision === 'approved') {
    const earned = await checkAndAwardBadges(vr.submittedBy);
    newBadges = earned.map(b => ({ slug: b.slug, name: b.name, icon: b.icon }));
  }

  return NextResponse.json({ ok: true, newBadges });
}
