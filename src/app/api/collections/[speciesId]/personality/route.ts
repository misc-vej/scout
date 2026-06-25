import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { collections } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const ALLOWED_TRAITS = ['Brave', 'Sneaky', 'Chill', 'Grumpy', 'Curious', 'Dramatic', 'Wise', 'Chaotic'] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ speciesId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { speciesId } = await params;

  let body: { trait?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.trait || !ALLOWED_TRAITS.includes(body.trait as typeof ALLOWED_TRAITS[number])) {
    return NextResponse.json({ error: `trait must be one of: ${ALLOWED_TRAITS.join(', ')}` }, { status: 400 });
  }

  const result = await db
    .update(collections)
    .set({ personalityTrait: body.trait })
    .where(and(eq(collections.userId, userId), eq(collections.speciesId, speciesId)))
    .returning({ personalityTrait: collections.personalityTrait });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Species not in collection' }, { status: 404 });
  }

  return NextResponse.json({ personalityTrait: result[0].personalityTrait });
}
