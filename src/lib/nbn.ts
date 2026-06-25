import { gridSquareToLatLng } from './geo/grid';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Fetch occurrence records from NBN Atlas for a given 10 km OSGB grid square.
 *
 * Uses a 7 km radius spatial query centred on the grid square.
 * Returns species names and record counts.  Returns an empty array on any error.
 *
 * Rate-limiting: sleeps 1 s after each request as a defensive throttle.
 * The persistent occurrence cache means a given grid square only calls NBN Atlas once.
 */
export async function fetchOccurrencesForGridSquare(
  gridSquare: string
): Promise<Array<{ scientificName: string; recordCount: number }>> {
  const { lat, lng } = gridSquareToLatLng(gridSquare);

  const url = new URL('https://records-ws.nbnatlas.org/occurrences/search');
  url.searchParams.set('q', '*');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('radius', '7');
  url.searchParams.append('fq', 'occurrence_status_s:PRESENT');
  url.searchParams.append('fq', 'year:[2005 TO 2025]');
  url.searchParams.set('pageSize', '0');
  url.searchParams.set('facets', 'taxon_name');
  url.searchParams.set('flimit', '200');

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Scout/1.0 (https://github.com/scout-app; contact: wildlife-app@example.com)',
      },
    });
  } catch (err) {
    console.warn('NBN Atlas fetch failed for grid square', gridSquare, err);
    await sleep(1000);
    return [];
  }

  // Defensive throttle — one request per invocation but guard against burst calls
  await sleep(1000);

  if (!res.ok) {
    console.warn(`NBN Atlas returned ${res.status} for grid square ${gridSquare}`);
    return [];
  }

  type NbnResponse = {
    facetResults?: Array<{
      fieldName: string;
      fieldResult?: Array<{ label: string; count: number }>;
    }>;
  };

  let data: NbnResponse;
  try {
    data = (await res.json()) as NbnResponse;
  } catch {
    console.warn('NBN Atlas response was not valid JSON for grid square', gridSquare);
    return [];
  }

  const facet = data.facetResults?.find((f) => f.fieldName === 'taxon_name');
  if (!facet?.fieldResult) return [];

  return facet.fieldResult.map((r) => ({
    scientificName: r.label,
    recordCount: r.count,
  }));
}
