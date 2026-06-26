# Phase 8: Brand + UI Polish — Context

**Gathered:** 2026-06-26
**Status:** Ready for planning
**Source:** Design handoff package at /tmp/scout_design/design_handoff_scout/

<domain>
## Phase Boundary

Bring the running Scout app visually in line with the official design handoff package (TOKENS.json, ScoutBeastiary.jsx, ScoutNearby.jsx, README.md). All backend mechanics, API routes, schema, and auth are complete and must not be touched. This phase is pure frontend / UI — replacing generic Tailwind with the design system, adding typography, correcting rarity colours, adding glow animations, redesigning the Beastiary (Logbook) screen, and redesigning the Nearby/Discover screen.

No schema migrations. No API changes. No auth changes. Scope is: globals.css, layout.tsx, beastiary page + components, discover/nearby page + components, shared AnimalIcon component.

Exception: one new nullable column `species_type text` is added to the species table to allow per-species SVG silhouette type override. This replaces the current letter-initial art zone placeholder with a proper silhouette.

</domain>

<decisions>
## Implementation Decisions

### D-01 — Typography
- Add Google Fonts: `Syne:wght@700;800` + `Outfit:wght@400;500;600;700` via `<link>` in `src/app/layout.tsx`
- Apply `font-family: 'Syne', sans-serif` to headings, card names, nav wordmark (font-weight 700–800, uppercase)
- Apply `font-family: 'Outfit', sans-serif` to body text, labels, captions, scientific names
- Letter-spacing: 0.05–0.07em on headings; 0.12–0.18em on captions (uppercase)

### D-02 — Colour system (Forest Night — dark mode primary)
Dark mode (primary) CSS variables:
- `--void: #0d1c12` — app background
- `--deep: #1e3828` — card surfaces
- `--signal: #72cc4a` — active nav, CTAs (use sparingly)
- `--bloom: #b878e8` — personality chips
- `--pollen: #f0c040` — warning badges
- `--mist: #e8f0e4` — primary text
- `--subtle: #2e5a3a` — secondary text
- `--faint: #1e3828` — placeholders, disabled

### D-03 — Rarity tier colours (both modes)
CSS variables per tier:
- `--rarity-common-border: #6a9070` (no glow)
- `--rarity-uncommon-border: #5a90d0` (no glow)
- `--rarity-rare-border: #c8922a` + `--rarity-rare-bg: #1c1402` + gold-glow 2.8s
- `--rarity-veryrare-border: #c86030` + `--rarity-veryrare-bg: #1c0c04` + orange-glow 2.4s
- `--rarity-legendary-border: #9060e0` + `--rarity-legendary-bg: #140a24` + purple-glow 2.2s
- `--rarity-mythic-border: rgba(185,205,255,.8)` + `--rarity-mythic-bg: #0e1222` + silver-glow 2.2s
- `--rarity-shiny-border: #ffffff` + white-glow 2.0s

### D-04 — Rarity glow keyframe animations
Add to globals.css (using the README pattern `0%,100% { box-shadow: 0 0 7px rgba(R,G,B,.65), 0 0 20px rgba(R,G,B,.22); } 50% { box-shadow: 0 0 15px rgba(R,G,B,.98), 0 0 34px rgba(R,G,B,.48); }`):
- `@keyframes gold-glow` — R200 G146 B42
- `@keyframes orange-glow` — R200 G96 B48
- `@keyframes purple-glow` — R144 G96 B224
- `@keyframes silver-glow` — R185 G205 B255
- `@keyframes white-glow` — R255 G255 B255

### D-05 — Grain texture
Add a CSS background-image with a repeating SVG fractal noise grain at 160px tile, blend mode soft-light, opacity 0.45, applied to card art zones via a `<Grain>` component or CSS class.

### D-06 — speciesType database column
- Add `species_type text` (nullable) to the species table in schema.ts
- Drizzle migration: `npx drizzle-kit generate` then `DATABASE_URL=$DATABASE_URL_UNPOOLED npx drizzle-kit migrate`
- Seed all 115 species with the correct type string (values: "bird", "raptor", "owl", "heron", "duck", "fox", "squirrel", "rabbit", "hedgehog", "otter", "badger", "marten", "cat", "butterfly", "moth", "dragonfly", "bee", "beetle", "reptile", "amphibian")
- Species type mapping rules:
  - Herons / egrets → "heron"
  - Kestrel, Sparrowhawk, Buzzard, Peregrine, Red Kite, Osprey, Hobby, Merlin, Goshawk → "raptor"
  - Any owl species → "owl"
  - Mallard, Teal, Widgeon, Pintail, Shoveler, Pochard, Tufted Duck, Eider → "duck"
  - Red Fox → "fox"
  - Any squirrel → "squirrel"
  - Rabbit → "rabbit"
  - Hedgehog → "hedgehog"
  - Otter → "otter"
  - Badger → "badger"
  - Pine Marten → "marten"
  - Scottish Wildcat → "cat"
  - Butterflies → "butterfly"
  - Moths → "moth"
  - Dragonflies/damselflies → "dragonfly"
  - Bees/bumblebees/wasps → "bee"
  - Beetles → "beetle"
  - Adder, grass snake, slow-worm → "reptile"
  - Newts, frogs, toads → "amphibian"
  - All other birds → "bird"
  - All other mammals → "mammal" (fallback to "otter" body shape)

### D-07 — AnimalIcon component
Create `src/components/shared/AnimalIcon.tsx` — a server component that accepts `type: string` and `color: string` props and returns the appropriate SVG silhouette inline. Exact SVG paths are defined in the design prototype files (ScoutBeastiary.jsx, ScoutNearby.jsx) and must be replicated faithfully.

SVG types to implement (from the prototype):
- "fox", "owl", "raptor", "squirrel", "duck", "heron", "rabbit", "hedgehog", "otter", "badger", "cat", "marten"
- default: generic bird
- The `color` prop is the icon stroke/fill colour (typically `${tierBorderColor}77` for art zone icons, full opacity for mini thumbnails)

### D-08 — Logbook / Beastiary redesign
Replace the current Beastiary implementation with the Logbook design:
- Tab bar: "Collection" | "Not Found" — Signal green active tab, subtle inactive
- Rarity filter pills row (horizontal scroll, no wrap): All · Common · Uncommon · Rare · V.Rare · Legendary · Mythic
- 3-column grid, `gap: 8px`, `padding: 10px 14px`
- **Collected card**: `aspect-ratio: 5/7`; `border: 2.5px solid <tier-color>`; background is `<tier-artBg>`; glow animation on Rare+; art zone (top, flex-grow) shows AnimalIcon at 54% size centred + Grain overlay; info strip (bottom): tier label (Outfit 9px 600 uppercase tier-color), species name (Syne 10.5px 700 Mist uppercase), personality chip (Bloom #b878e8); shiny: white border + `✦ Shiny` label + shimmer overlay
- **Locked card**: same border colour as tier; `background: #080e0a`; art zone shows `?` in Syne 800 at ~46px, faded to `${tierColor}18`; "Not found" label, italic, very low opacity
- Card hover: `transform: scale(1.04)` with 0.15s ease transition
- Progress counter in nav: `collected/total` pill in Signal green (Outfit 11px 600)

### D-09 — Detail bottom sheet (Logbook)
When a collected card is tapped:
- Full-screen dim overlay `rgba(0,0,0,.8)`; clicking overlay closes sheet
- Sheet slides up from bottom: `background: #0d1c12`; `border-radius: 20px 20px 0 0`; tier-colored border (3px top and sides); glow animation on Rare+
- Drag handle (36×4px pill) at top center
- Art zone: 180px tall; `background: linear-gradient(160deg, ${tierArtBg}, #08100a)`; AnimalIcon centred; tier badge top-left; card number `#NNN` top-right; Grain overlay
- Name: Syne 800 24px Mist uppercase + letter-spacing 0.05em
- Latin: Outfit italic 11px Subtle
- Chips: personality (Bloom) + habitat (Signal)
- Stats row: spotted count / first-seen date
- The detail sheet is a client component (`'use client'`); manages `selectedSpecies` state in the Logbook page component

### D-10 — Nearby/Discover redesign
Replace current SpeciesCard grid with species rows:
- Each row: `padding: 12px 16px`; `border-bottom: 1px solid rgba(255,255,255,.05)`
- Left: mini card thumbnail 44×62px; `border: 2px solid <tier-color>`; `border-radius: 8px`; `background: <tier-artBg>`; AnimalIcon at 70% size centred; glow on Rare+
- Middle: species name (Syne 13px 700 Mist uppercase), latin (Outfit italic 9px Subtle); chips: tier label + habitat chip; likelihood bar (3px height, 40px wide, tier-color, `width: ${likelihood*100}%`)
- Right: "I saw it" button (Outfit 11px 600, Signal green bg `rgba(114,204,74,.15)`, border `rgba(114,204,74,.25)`, `border-radius: 20px`, `padding: 6px 14px`) OR disabled "Unavailable" pill for season-locked species
- Already-collected indicator: a small tick or "In collection" dim text below the button

### D-11 — Bottom-sheet log modal (Nearby)
When "I saw it" is tapped:
- Bottom sheet slides up; dim overlay
- Species name (Syne 800) + latin (Outfit italic)
- Personality picker: 8 trait chips in a 4×2 grid; Bloom color; selecting a chip highlights it (solid bg) and activates the Confirm button
- Confirm CTA (full width, Signal green): disabled until personality selected; `borderRadius: 14px`
- On confirm: call `POST /api/sightings` with `{ speciesId, gridSquare }`, then PATCH `/api/collections/${speciesId}/personality` with `{ trait }` if first sighting; close sheet
- Success banner: slides in from top, persists 3.5s, fades out; text: species name + "(first find!)" or "(logged again)"

### D-12 — Nav bar visual update
- Background: `linear-gradient(180deg, #0d1c12, #091410)` + `border-bottom: 1px solid rgba(114,204,74,.1)`
- Left: "SCOUT" wordmark in Syne 800 17px Mist uppercase, letter-spacing 0.07em
- Right: progress counter pill (D-08)
- Height: 56px; sticky; z-index 50

### D-13 — Bottom navigation
- Fixed bottom; `background: linear-gradient(to top, #0a1410 65%, transparent)` padding
- Nearby icon (SVG location pin) + Logbook icon (SVG 4-square grid)
- Active tab: Signal green icon + green dot indicator below label
- Labels: Outfit 9px 600 uppercase letter-spacing 0.06em
- Current page selection managed by Next.js `usePathname` hook

### D-14 — Pledge modal visual update
- Modal background: `#0d1c12`; border: `1px solid rgba(114,204,74,.15)`; border-radius 18px
- Title: Syne 800 20px Mist uppercase
- Body text: Outfit 400 13px Subtle
- Pledge text box: `background: rgba(114,204,74,.06)`; border `rgba(114,204,74,.1)`; border-radius 10px
- CTA: Signal green bg, Forest text, border-radius 14px

### D-15 — TypeScript types update
- Update `src/types/discovery.ts` SpeciesResult to include `speciesType: string | null` and `likelihood: number`
- Update discover API to return `speciesType` from the species table and compute `likelihood` (normalized 0-1 from recordCount across the result set: `recordCount / max(recordCount)`)

### Claude's Discretion
- Light mode (Field Cream) is specified in the design package but can be deferred to v2 — dark mode is the primary implementation
- Habitat zone map in Nearby (the animated SVG grid with coloured zone overlays) is deferred — too complex for Phase 8 scope; show a simple gradient header instead
- Dawn logo animation (splash screen) is deferred — not needed for the web app at this stage
- Friend count chips are deferred — the social feature is in v2 scope
- Exact "distance" label is omitted — GPS precision is not stored; likelihood bar is sufficient
- Species number `#NNN` in detail sheet: use zero-padded index from the database order (ORDER BY id); the species table has integer IDs 1–115

</decisions>

<canonical_refs>
**Downstream agents MUST read these before planning or implementing.**

### Design source of truth
- `/tmp/scout_design/design_handoff_scout/TOKENS.json` — colour, typography, spacing, radius, chip tokens
- `/tmp/scout_design/design_handoff_scout/ScoutBeastiary.jsx` — dark Logbook component (full implementation reference including all SVG paths for AnimalIcon)
- `/tmp/scout_design/design_handoff_scout/ScoutNearby.jsx` — dark Nearby component (species row layout, bottom sheet, mini thumbnail)
- `/tmp/scout_design/design_handoff_scout/README.md` — brand spec, glow keyframe patterns, typography table

### Current app — files being replaced/updated
- `src/app/layout.tsx` — add Google Fonts link + Forest Night body bg
- `src/app/globals.css` — add CSS variables + glow keyframes
- `src/lib/db/schema.ts` — add species_type column
- `src/app/(app)/beastiary/page.tsx` — full Logbook redesign
- `src/components/beastiary/BeastiaryCard.tsx` — replace with new CollectedCard / LockedCard
- `src/app/(app)/discover/page.tsx` — Nearby redesign
- `src/components/discover/SpeciesCard.tsx` — replace with SpeciesRow
- `src/components/discover/SpeciesList.tsx` — update for row layout
- `src/app/(app)/layout.tsx` — nav chrome update
- `src/components/auth/PledgeModal.tsx` — visual polish
- `data/species-seed.ts` — add speciesType per species

### Patterns (existing analogues)
- `src/components/beastiary/PersonalityPicker.tsx` — 'use client', useMutation pattern to follow
- `src/components/beastiary/ConservationBadge.tsx` — server component chip pattern
- `src/app/api/sightings/route.ts` — POST pattern for log modal
- `src/app/api/collections/[speciesId]/personality/route.ts` — PATCH pattern for personality in log modal

</canonical_refs>

<specifics>
## Key Implementation Notes

### SVG silhouette paths
Read ScoutBeastiary.jsx lines 37–163 for all AnimalIcon SVG paths. Each type is an inline SVG with stroke paths at 54% size for grid cards, full size for detail sheets, and ~70% for mini thumbnails. The `color` prop controls stroke colour.

### Grain texture
```
url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)' opacity='0.5'/%3E%3C/svg%3E")
```
Applied as `background-image` at `160px` tile, `background-repeat: repeat`, `mix-blend-mode: soft-light`, `opacity: 0.45`, `position: absolute`, `inset: 0`, `pointer-events: none`, `z-index: 1`.

### Rarity tier utility function
Create `src/lib/rarity.ts` with a `getRarityConfig(tier: string)` function returning `{ borderColor, artBg, glowAnimation, label }`. Used by both Logbook cards and Nearby mini-thumbnails.

### Likelihood computation
In `src/app/api/discover/route.ts`, after building the results array, compute `maxCount = Math.max(...results.map(r => r.recordCount))` then `likelihood = maxCount > 0 ? r.recordCount / maxCount : 0`. Add to the returned SpeciesResult.

### Personality picker in log modal
The 8 traits: `['Brave', 'Sneaky', 'Chill', 'Grumpy', 'Curious', 'Dramatic', 'Wise', 'Chaotic']`
For a species already in the user's collection (inCollection: true), the personality may already be set — the modal should pre-select the existing trait and allow changing it.

### Species row "In collection" state
Query the user's collections in the discover page server component (or pass as a prop). A species already in the collection shows a muted "✓ In collection" label below the "I saw it" button instead of or alongside the button.

### File that must NOT change
- `src/app/api/sightings/route.ts` — no behavior change needed
- `src/app/api/collections/[speciesId]/personality/route.ts` — no change
- `src/app/api/discover/route.ts` — small update only: add `speciesType` to SELECT and `likelihood` to response shape
- `src/lib/db/schema.ts` — one new column only

</specifics>

<deferred>
## Deferred Items

- Light mode (Field Cream / Parchment) — v2
- Dawn logo animation — v2
- Habitat zone map in Nearby — v2
- Friend count chips — v2
- Distance label in Nearby rows — v2 (requires precise GPS storage which is out of scope)
- Animated card unlock sequence per rarity tier — v2 (noted in STATE.md deferred items)

</deferred>

---
*Phase 8 — Brand + UI Polish*
*Context gathered: 2026-06-26*
