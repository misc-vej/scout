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
