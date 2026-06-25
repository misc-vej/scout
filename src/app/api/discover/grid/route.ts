import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { latLngToGridSquare } from '@/lib/geo/grid';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { lat?: number; lng?: number };
  try {
    body = (await req.json()) as { lat?: number; lng?: number };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { lat, lng } = body;
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  // IMPORTANT: raw lat/lng is never logged or stored — used only for in-memory conversion
  const gridSquare = latLngToGridSquare(lat, lng);
  return NextResponse.json({ gridSquare });
}
