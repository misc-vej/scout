import proj4 from 'proj4';

const WGS84 = 'EPSG:4326';
const OSGB36 =
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 ' +
  '+ellps=airy +towgs84=446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894 ' +
  '+units=m +no_defs';

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Convert WGS84 lat/lng to a 10 km OSGB National Grid square string (e.g. "TQ38").
 * Raw coordinates are used only for the in-memory conversion and are not stored or logged.
 */
export function latLngToGridSquare(lat: number, lng: number): string {
  // proj4 takes [lng, lat] order for geographic projections
  const [easting, northing] = proj4(WGS84, OSGB36, [lng, lat]) as [number, number];
  return eastingNorthingToGridSquare(easting, northing);
}

/**
 * Convert a 10 km OSGB National Grid square (e.g. "TQ38") to the WGS84 lat/lng
 * of its centre point.  Used by the NBN Atlas client to build a spatial radius query.
 */
export function gridSquareToLatLng(gridSquare: string): { lat: number; lng: number } {
  const { easting, northing } = parseGridSquare(gridSquare);
  // Centre of the 10 km square is 5 km into each axis
  const centre: [number, number] = [easting + 5000, northing + 5000];
  const [lng, lat] = proj4(OSGB36, WGS84, centre) as [number, number];
  return { lat, lng };
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Standard OSGB 5×5 minor-square letter grid.
 * Indexed by [northing band (0=0-100km, 4=400-500km)][easting band (0=0-100km, 4=400-500km)].
 *
 * Layout (within any 500 km major square):
 *   V W X Y Z   (northing 0–100 km,   row 0)
 *   Q R S T U   (northing 100–200 km, row 1)
 *   L M N O P   (northing 200–300 km, row 2)
 *   F G H J K   (northing 300–400 km, row 3)
 *   A B C D E   (northing 400–500 km, row 4)
 */
const GRID_LETTERS: ReadonlyArray<ReadonlyArray<string>> = [
  ['V', 'W', 'X', 'Y', 'Z'], // northing band 0 (0–100 km)
  ['Q', 'R', 'S', 'T', 'U'], // northing band 1 (100–200 km)
  ['L', 'M', 'N', 'O', 'P'], // northing band 2 (200–300 km)
  ['F', 'G', 'H', 'J', 'K'], // northing band 3 (300–400 km)
  ['A', 'B', 'C', 'D', 'E'], // northing band 4 (400–500 km)
];

/**
 * Major 500 km square letters for UK mainland.
 * Indexed as MAJOR[easting-band (0 or 1)][northing-band (0, 1, or 2)].
 *   easting-band 0 = 0–499 999 m  (western half)
 *   easting-band 1 = 500 000–999 999 m  (eastern half, rarely used in UK)
 *   northing-band 0 = 0–499 999 m  (southern, covers England/Wales)
 *   northing-band 1 = 500 000–999 999 m  (covers Scotland)
 *   northing-band 2 = 1 000 000–1 499 999 m  (far north Scotland/islands)
 */
const MAJOR: ReadonlyArray<ReadonlyArray<string>> = [
  ['S', 'N', 'H'], // easting-band 0
  ['T', 'O', 'J'], // easting-band 1
];

function eastingNorthingToGridSquare(easting: number, northing: number): string {
  const majorE = Math.floor(easting / 500_000);  // 0 or 1
  const majorN = Math.floor(northing / 500_000); // 0, 1, or 2
  const majorLetter = MAJOR[majorE]?.[majorN] ?? 'S';

  const minorE = Math.floor((easting % 500_000) / 100_000);  // 0–4
  const minorN = Math.floor((northing % 500_000) / 100_000); // 0–4

  // GRID_LETTERS[minorN][minorE]: northing band 0 = row 0 (V-Z), band 4 = row 4 (A-E)
  const minorLetter = GRID_LETTERS[minorN]?.[minorE] ?? 'A';

  // 10 km digit within the 100 km minor square
  const e10 = Math.floor((easting % 100_000) / 10_000);
  const n10 = Math.floor((northing % 100_000) / 10_000);

  return `${majorLetter}${minorLetter}${e10}${n10}`;
}

// Reverse lookup maps built once at module load.
// GRID_LETTERS[row] = northing band row (0 = 0-100km, 4 = 400-500km), so row IS the northing band.
const MINOR_COL: Record<string, number> = {};
const MINOR_ROW: Record<string, number> = {};
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 5; col++) {
    const letter = GRID_LETTERS[row]?.[col];
    if (letter) {
      MINOR_COL[letter] = col;
      MINOR_ROW[letter] = row; // row index IS the northing band
    }
  }
}

function parseGridSquare(gs: string): { easting: number; northing: number } {
  if (gs.length < 4) throw new Error(`Invalid grid square: ${gs}`);
  const maj = gs[0].toUpperCase();
  const min = gs[1].toUpperCase();
  const e10 = parseInt(gs[2], 10);
  const n10 = parseInt(gs[3], 10);

  // Find major square origin
  let majE = -1;
  let majN = -1;
  outer: for (let ei = 0; ei < MAJOR.length; ei++) {
    for (let ni = 0; ni < (MAJOR[ei]?.length ?? 0); ni++) {
      if (MAJOR[ei]?.[ni] === maj) {
        majE = ei;
        majN = ni;
        break outer;
      }
    }
  }
  if (majE === -1) throw new Error(`Unknown major grid letter: ${maj}`);

  const minCol = MINOR_COL[min] ?? 0;
  const minRow = MINOR_ROW[min] ?? 0;

  const easting = majE * 500_000 + minCol * 100_000 + e10 * 10_000;
  const northing = majN * 500_000 + minRow * 100_000 + n10 * 10_000;
  return { easting, northing };
}
