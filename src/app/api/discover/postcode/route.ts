import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { latLngToGridSquare } from '@/lib/geo/grid';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { postcode?: string };
  try {
    body = (await req.json()) as { postcode?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { postcode } = body;
  if (!postcode || typeof postcode !== 'string') {
    return NextResponse.json({ error: 'Postcode is required' }, { status: 400 });
  }

  // Sanitize: uppercase, strip whitespace
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');

  let res: Response;
  try {
    res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`
    );
  } catch {
    return NextResponse.json(
      { error: 'Postcode lookup failed — please try again' },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Postcode not found — try a different one' },
      { status: 400 }
    );
  }

  type PostcodesIoResponse = {
    result?: { latitude: number; longitude: number };
  };

  let data: PostcodesIoResponse;
  try {
    data = (await res.json()) as PostcodesIoResponse;
  } catch {
    return NextResponse.json(
      { error: 'Postcode lookup failed — please try again' },
      { status: 502 }
    );
  }

  if (!data.result) {
    return NextResponse.json(
      { error: 'Postcode not found — try a different one' },
      { status: 400 }
    );
  }

  // IMPORTANT: lat/lng is never stored or logged — converted to grid square immediately
  const gridSquare = latLngToGridSquare(data.result.latitude, data.result.longitude);
  return NextResponse.json({ gridSquare });
}
