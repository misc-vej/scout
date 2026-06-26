# Phase 9: Light Mode + Card Art — Context

**Gathered:** 2026-06-26
**Status:** Ready for planning
**Source:** User decisions (Session discussion)

<domain>
## Phase Boundary

Switch the app from the Forest Night dark theme to the Field Cream light palette as the permanent primary design. The dark theme was the initial iteration — light is the intended production look. Additionally, wire up the painterly PNG card illustrations (already copied to `public/cards/`) as actual art zone background images on species cards in both the Logbook (BeastiaryCard) and the Nearby list (SpeciesRow mini thumbnail).

**In scope:**
- All inline `style={{}}` color values across every component that currently uses Forest Night / Deep / dark backgrounds
- `globals.css` `:root` CSS variable declarations and body background
- `NavShell.tsx` outer shell background, borders, icon colors, active states
- `BeastiaryCard` — art zone, card background, text, chips
- `BeastiaryClient`, `SpeciesCard` (SpeciesRow, LogModal, ConfirmBanner) — all backgrounds, text, border colors
- `DiscoverClient`, `SpeciesList` — section headers, empty states, backgrounds
- `PledgeModal` — background, text, CTA
- DB seed update: `imageUrl` for Red Deer and Otter pointing at `/cards/red-deer.png` and `/cards/otter.png`
- API route update: `imageUrl` included in species response objects that feed BeastiaryCard and SpeciesRow
- BeastiaryCard art zone: render `<img>` / `background-image` using `imageUrl` when present, SVG silhouette fallback when null
- SpeciesRow mini card (44×62px): same image/fallback logic

**Out of scope:**
- Adding new species illustrations (fox image not yet provided — fox stays SVG silhouette for now)
- Database migration (imageUrl column already exists)
- Rarity tier glow colors, border colors, animation keyframes — these remain the same hex values; only background/surface/text/CTA colors change

</domain>

<decisions>
## Implementation Decisions

### D-01: Field Cream palette tokens (LOCKED)
| Token | Hex | Usage |
|-------|-----|-------|
| Parchment bg | `#f5f0e4` | Page/shell background |
| Warm divider | `#e8d8c0` | Card surfaces, borders, dividers |
| Forest text | `#1c2e1e` | Primary text |
| Signal CTA | `#2a7a48` | Buttons, active states, CTA background |
| Bloom-light | `#9060c8` | Personality chips |
| Pollen-light | `#c89020` | Warning/sensitive chips |
| Sage | `#6a9a78` | Secondary/muted text |

### D-02: Rarity tier colors stay unchanged (LOCKED)
Rarity border colors, glow animations, chip colors in `getRarityConfig` are unchanged — they were designed to work across themes. Only backgrounds/surfaces/text/CTA shift.

### D-03: Inline styles (LOCKED)
All color values remain as inline JSX `style={{}}` props — no Tailwind color classes. This matches the Phase 8 implementation convention.

### D-04: Card illustration display (LOCKED)
- BeastiaryCard art zone: when `imageUrl` is non-null, render as CSS `background-image: url(imageUrl)` with `background-size: cover`, `background-position: center`. Overlay the SVG silhouette at reduced opacity OR hide it. When `imageUrl` is null, show SVG silhouette as before.
- SpeciesRow mini card thumbnail (44×62px): same image/fallback logic. When `imageUrl` is non-null, show it as `background-image`. When null, show SVG.

### D-05: Image paths and seed data (LOCKED)
- Red Deer `imageUrl`: `/cards/red-deer.png`
- Otter `imageUrl`: `/cards/otter.png`
- Red Fox: no image yet — `imageUrl` remains null; SVG silhouette fallback
- Seed file that needs updating: `src/lib/db/species-seed.ts` — find Red Deer and Otter entries by `commonName` and add `imageUrl`
- The `imageUrl` column exists in `src/lib/db/schema.ts` (line 68: `imageUrl: text("image_url")`) — no migration needed

### D-06: API response shape (LOCKED)
`SpeciesResult` type in `src/types/discovery.ts` needs `imageUrl?: string | null` field. The `/api/discover` route (and `/api/beastiary` if it exists) must include `imageUrl` in the select/response. BeastiaryCard and SpeciesRow receive `imageUrl` via their `species` prop.

### D-07: NavShell active + inactive icon colors (LOCKED)
- Active icon: `#2a7a48` (Signal-light, was `#72cc4a`)
- Inactive icon: `#a0b8a0` (muted sage, was `#2e5a3a`)
- SCOUT wordmark: `#1c2e1e` (Forest, was `#e8f0e4`)
- Shell outer background: `#f5f0e4` (Parchment, was `#0a1410`)
- Top nav bar bg: `#f5f0e4` with `rgba(28,46,30,.06)` border bottom
- Bottom tab bar bg gradient: `from #f5f0e4 to transparent`

### Claude's Discretion
- Exact shadow/box-shadow values on cards in the light context (light themes typically need subtle drop shadows)
- Whether to add a thin `1px solid #e8d8c0` border to cards that previously had no visible border in dark mode
- Text contrast ratios — ensure Forest (#1c2e1e) on Parchment (#f5f0e4) meets AA; adjust secondary text (Sage #6a9a78) if contrast is low

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Color system & components
- `src/components/NavShell.tsx` — shell layout, all navigation colors
- `src/app/globals.css` — CSS variables, :root, body bg, keyframes
- `src/lib/rarity.ts` — getRarityConfig (DO NOT change rarity colors)
- `src/components/beastiary/BeastiaryCard.tsx` — art zone, card colors
- `src/components/beastiary/BeastiaryClient.tsx` — logbook backgrounds
- `src/components/discover/SpeciesCard.tsx` — SpeciesRow, LogModal, ConfirmBanner
- `src/components/discover/SpeciesList.tsx` — list header, backgrounds
- `src/components/discover/DiscoverClient.tsx` — discover page backgrounds

### Data layer
- `src/lib/db/schema.ts` — species table (imageUrl column at line 68)
- `src/lib/db/species-seed.ts` — seed data with commonName entries for Red Deer and Otter
- `src/types/discovery.ts` — SpeciesResult type (add imageUrl field)

### Illustrations
- `public/cards/red-deer.png` — Red Deer painterly art
- `public/cards/otter.png` — Otter painterly art

</canonical_refs>

<specifics>
## Specific Ideas

- The user described the dark theme as "the first run" — the light mode is the intended production design
- Painterly illustrations were created in a warm, cream-background style that matches the Field Cream palette
- The app is a 390px-wide mobile-first layout; the illustrations should fill the art zone completely (cover + center)
- Where the dark theme used `rgba(255,255,255,.04)` for dividers, the light theme should use `#e8d8c0` or similar warm-cream divider
- Where the dark theme used `rgba(255,255,255,.07)` for subtle backgrounds, use `rgba(28,46,30,.04)` in light mode

</specifics>

<deferred>
## Deferred Ideas

- Red Fox painterly illustration — user hasn't saved it to disk yet; fox uses SVG silhouette fallback until Phase 10 or a future micro-update
- Dark mode toggle / user preference for switching back to Forest Night — not in this phase

</deferred>

---

*Phase: 09-light-mode-card-art*
*Context gathered: 2026-06-26*
