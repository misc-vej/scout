---
plan: 03-03
title: Discovery UI page — GPS + postcode species list
phase: 3
wave: 2
depends_on: [03-01]
req_ids: [DISC-01, DISC-04]
branching_strategy: none
autonomous: true
files_modified:
  - src/components/discover/RarityBadge.tsx
  - src/components/discover/SpeciesCard.tsx
  - src/components/discover/SpeciesList.tsx
  - src/components/discover/DiscoverClient.tsx
  - src/app/(app)/discover/page.tsx
---

## Goal

Replace the Phase 1 `/discover` stub with a fully functional Discovery screen: GPS button, postcode form, species list with rarity badges, loading skeleton, empty state, and error state.

## Context

Depends on 03-01 for the `SpeciesResult` type from `src/types/discovery.ts`. Runs in parallel with 03-02 (no file overlap). The UI calls the API routes created in 03-02, but those routes do not need to be complete for this plan to be written — the executor only needs the `SpeciesResult` type and the three endpoint contracts (`/api/discover`, `/api/discover/grid`, `/api/discover/postcode`).

All `geodesy` and server-side imports are in 03-02 files only. This plan creates only `"use client"` components and a server component page — no server-only imports here.

## Interface Contracts (from 03-01 and 03-02)

From `src/types/discovery.ts` (created in 03-01):
```ts
export type SpeciesResult = {
  id: string;
  commonName: string;
  scientificName: string;
  rarityTier: string;
  sensitivityLevel: string;
  canBeShiny: boolean;
  taxonomyGroup: string | null;
  recordCount: number;
};
```

API endpoints (created in 03-02):
- `POST /api/discover/grid` — body `{ lat: number; lng: number }` → `{ gridSquare: string }`
- `POST /api/discover/postcode` — body `{ postcode: string }` → `{ gridSquare: string }`
- `POST /api/discover` — body `{ gridSquare: string }` → `SpeciesResult[]`

## Tasks

### Task 1: Create display components

Create three component files. These are `"use client"` only where state is needed — `RarityBadge` and `SpeciesCard` and `SpeciesList` are pure display and do NOT need `"use client"`.

**`src/components/discover/RarityBadge.tsx`**

Props: `{ tier: string }`

Color map:
| tier value | Tailwind text class |
|------------|---------------------|
| `common` | `text-gray-400` |
| `uncommon` | `text-green-500` |
| `rare` | `text-blue-500` |
| `super_rare` | `text-purple-500` |
| `legendary` | `text-orange-500` |
| `mythic` | `text-red-500` |

Display the tier as a pill/badge. Display text: capitalize and replace underscores with spaces (e.g. `super_rare` → `"Super Rare"`). Use a helper:
```ts
function formatTier(tier: string): string {
  return tier
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
```

Render as a `<span>` with a small rounded background that uses the matching color class. Example structure:
```tsx
<span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
  {formatTier(tier)}
</span>
```

Unknown tiers fall back to `text-gray-400`.

**`src/components/discover/SpeciesCard.tsx`**

Props: `{ species: SpeciesResult }`

Renders one row in the species list. Layout:
- Main line: `species.commonName` (bold)
- Sub-line: `species.scientificName` (italic, text-sm text-gray-400)
- Right side: `<RarityBadge tier={species.rarityTier} />`
- Below names: if `species.taxonomyGroup` is non-null, show it in a small gray label
- Footer line: `"{species.recordCount} records nearby"` in text-xs text-gray-500

Wrap in a `<div>` with `className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-4"`.

Import `SpeciesResult` from `@/types/discovery` and `RarityBadge` from `./RarityBadge`.

**`src/components/discover/SpeciesList.tsx`**

Props: `{ species: SpeciesResult[]; gridSquare: string }`

Renders:
- Heading: `"{species.length} species recorded near {gridSquare}"` in text-sm text-gray-400 mb-4
- If `species.length === 0`: show `<p className="text-center text-gray-500 py-8">Nothing recorded in this area yet — get out and explore!</p>`
- Otherwise: map over `species` → `<SpeciesCard key={s.id} species={s} />`

Wrap the list in `<div className="flex flex-col gap-3">`.

Import `SpeciesResult` from `@/types/discovery` and `SpeciesCard` from `./SpeciesCard`.

### Task 2: Create `src/components/discover/DiscoverClient.tsx`

Mark `"use client"` at the top of the file.

**State type:**
```ts
type DiscoverState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; gridSquare: string; species: SpeciesResult[] }
  | { status: 'error'; message: string };
```

**State management:**
```ts
const [state, setState] = useState<DiscoverState>({ status: 'idle' });
const [postcode, setPostcode] = useState('');
```

**GPS flow (triggered by "Use my location" button click):**
```ts
async function handleGPS() {
  setState({ status: 'loading' });
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const gridRes = await fetch('/api/discover/grid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        });
        if (!gridRes.ok) throw new Error('Could not determine your grid square');
        const { gridSquare } = await gridRes.json();

        const speciesRes = await fetch('/api/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gridSquare }),
        });
        if (!speciesRes.ok) throw new Error('Could not load nearby species');
        const species: SpeciesResult[] = await speciesRes.json();

        setState({ status: 'ready', gridSquare, species });
      } catch (e) {
        setState({ status: 'error', message: e instanceof Error ? e.message : 'Something went wrong' });
      }
    },
    () => {
      setState({ status: 'error', message: 'Location access denied — try entering a postcode instead.' });
    }
  );
}
```

**Postcode flow (triggered by form submit):**
```ts
async function handlePostcode(e: React.FormEvent) {
  e.preventDefault();
  if (!postcode.trim()) return;
  setState({ status: 'loading' });
  try {
    const pcRes = await fetch('/api/discover/postcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcode }),
    });
    if (!pcRes.ok) {
      const err = await pcRes.json();
      throw new Error(err.error ?? 'Postcode not found');
    }
    const { gridSquare } = await pcRes.json();

    const speciesRes = await fetch('/api/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gridSquare }),
    });
    if (!speciesRes.ok) throw new Error('Could not load nearby species');
    const species: SpeciesResult[] = await speciesRes.json();

    setState({ status: 'ready', gridSquare, species });
  } catch (e) {
    setState({ status: 'error', message: e instanceof Error ? e.message : 'Something went wrong' });
  }
}
```

**Render:**

- `status === 'idle'` or `status === 'error'`: Show the location prompt UI:
  - A centered `<button onClick={handleGPS}>Use my location</button>` with appropriate styling (e.g. `className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500"`)
  - A divider: `<div className="flex items-center gap-4 my-4"><hr className="flex-1 border-white/10" /><span className="text-sm text-gray-500">or</span><hr className="flex-1 border-white/10" /></div>`
  - A postcode form: `<form onSubmit={handlePostcode}>` containing an `<input>` (type text, placeholder "Enter postcode", value bound to `postcode` state) and a submit `<button>`. Input styling: `className="rounded-l-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none"`. Submit button: `className="rounded-r-lg bg-white/20 px-4 py-2 font-semibold text-white hover:bg-white/30"`.
  - If `status === 'error'`: show `<p className="mt-4 text-center text-sm text-red-400">{state.message}</p>` below the form.

- `status === 'loading'`: Show a skeleton — three placeholder cards with animate-pulse:
  ```tsx
  <div className="flex flex-col gap-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
    ))}
  </div>
  ```
  Add a `<p className="text-center text-sm text-gray-500 mb-4">Finding wildlife near you…</p>` above the skeleton.

- `status === 'ready'`: Render `<SpeciesList species={state.species} gridSquare={state.gridSquare} />` and a `<button onClick={() => setState({ status: 'idle' })}>Search again</button>` below it.

Import `SpeciesResult` from `@/types/discovery` and `SpeciesList` from `./SpeciesList`.

### Task 3: Replace `src/app/(app)/discover/page.tsx`

Replace the current stub with a server component that auth-guards and renders the client:

```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import DiscoverClient from '@/components/discover/DiscoverClient';

export default async function DiscoverPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Discover</h1>
      <DiscoverClient />
    </div>
  );
}
```

The `redirect('/auth')` path should match whatever the Phase 1 auth route is. Check `src/app/auth/` or `src/app/(auth)/` to confirm the exact path, and adjust if needed.

## Verification

- `npx tsc --noEmit` exits with 0 errors.
- `npm run build` passes.
- Manual smoke test (run `npm run dev`):
  1. Navigate to `http://localhost:3000/discover` while signed in.
  2. The page shows the "Discover" heading, a "Use my location" button, and a postcode form with an "or" divider.
  3. Enter postcode `SW1A 2AA` and submit — loading skeleton appears, then a species list.
  4. The species list shows at least several species with rarity badges displayed in the correct colors (common = gray, rare = blue, etc.).
  5. Each card shows a scientific name in italics and a record count.
  6. The "Search again" button resets to idle state.
  7. Click "Use my location" — browser asks for permission. If denied, error message appears below the postcode form.
  8. Unauthenticated visit to `/discover` redirects to the auth page.
- TypeScript: `RarityBadge`, `SpeciesCard`, `SpeciesList` have no `"use client"` directive (pure display components).
- `DiscoverClient.tsx` has `"use client"` as its first line.
- `geodesy` is not imported in any of the files created by this plan.

## Threat Model

No new trust boundaries — this plan creates only client-rendered UI components and a server component page. All data flows through the API routes validated in 03-02.

| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-03-UI-01 | Information Disclosure | `DiscoverClient` GPS flow | mitigate | Raw coordinates sent only to `/api/discover/grid` over HTTPS; never logged, never stored; browser Geolocation API used only on explicit user button press. |
| T-03-UI-02 | Spoofing | `DiscoverPage` server component | mitigate | `auth()` session check before rendering; unauthenticated users redirected to `/auth` before any component renders. |
| T-03-UI-03 | XSS | Species display fields | accept | `commonName`, `scientificName`, `taxonomyGroup` data originates from the server-controlled species table (seeded by Phase 2), not from arbitrary user input. React's JSX auto-escaping provides defence-in-depth. |
