# Stack Research

**Domain:** Location-based UK wildlife collection app (PWA, accounts, social, species dataset)
**Researched:** 2026-06-24
**Confidence:** HIGH (core stack verified against official docs and current releases; data-source section MEDIUM — NBN Atlas API docs behind DDoS protection during research, but behaviour confirmed via multiple secondary sources)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (current: 16.2.9) | Full-stack React framework + PWA host | Ships with built-in PWA manifest support via App Router, Server Actions, Turbopack-default bundler. No extra library needed for manifest/service-worker scaffolding. Runs on Vercel or any Node host. Claude Code works best in Next.js projects. |
| React | 19.2 (ships with Next 16) | UI layer | Required by Next 16; ships View Transitions and Activity primitives that suit card-reveal animations. |
| TypeScript | 5.x | Type safety | Required by Next 16 (minimum 5.1). Eliminates a whole class of bugs in species/rarity data modelling. |
| Supabase | Managed (latest: auth v2.190.0, Postgres 17.x) | Auth + database + realtime + storage | Single backend service that covers: email/OAuth auth, Postgres (with PostGIS extension for geo queries), row-level security for per-user collections, realtime subscriptions for friends' collection updates, and file storage for card assets. Avoids stitching four separate services together for an MVP. |
| PostGIS | Enabled via Supabase extension | Geospatial queries | ST_DWithin for "species sightings near me" queries; spatial GiST indexes stay fast at millions of rows. Enable with one click in the Supabase dashboard. |
| Tailwind CSS | 4.3 (current stable) | Styling | Ships without config file (CSS-first config), zero dead code, native cascade layers. All major component libraries (shadcn/ui, Radix) support v4. |
| shadcn/ui | v4 (CLI-based, no version lock) | Component primitives | Copy-owned components built on Radix UI/Base UI; accessible by default. Correct choice for a card-heavy beastiary UI where you need precise visual control without wrestling a fully-managed library. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.x (current: ~5.0.11) | Client state (GPS coords, active species, UI state) | Lightweight; no boilerplate; persist middleware handles offline-cache of last-known location. Use for ephemeral UI state that doesn't need Supabase persistence. |
| TanStack Query | 5.x (current: ~5.101.x) | Server-state caching (NBN/GBIF API responses) | Species-by-location responses from external APIs are expensive; TanStack Query caches, deduplicates, and stale-while-revalidates them. Essential when your data source has rate limits. |
| serwist | latest | Service worker / offline caching | Official Workbox successor; integrates with Next.js for cache-first asset serving and offline fallback screens. Currently requires webpack config flag in Next 16 (Turbopack support pending). |
| web-push | latest | Push notifications (future) | VAPID-based push via Next.js Server Actions; covered in official Next PWA guide. Defer until post-MVP. |
| Zod | 3.x | Schema validation | Validate NBN Atlas / GBIF API responses at the boundary before they touch your Supabase types. Prevents silent data corruption from schema drift in third-party APIs. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vercel | Deployment + Edge CDN | Zero-config deploy of Next.js; handles HTTPS automatically (required for geolocation API in browsers). Free tier covers MVP scale. |
| Supabase CLI | Local dev + migrations | `supabase start` spins up local Postgres + PostGIS. Run `supabase db push` to deploy migrations. |
| ESLint + Biome | Linting / formatting | Next 16 removed `next lint` as a build step; use Biome for fast formatting, ESLint flat config for rules. |

---

## UK Species / Occurrence Data Source

This is the most project-critical decision. Research findings:

### Primary Recommendation: NBN Atlas API (records-ws.nbnatlas.org)

**What it is:** The National Biodiversity Network Atlas is the UK's authoritative biodiversity database. It holds >250 million UK species occurrence records from wildlife trusts, recording schemes, and statutory bodies. The NBN is also the UK node for GBIF — so NBN Atlas data is a superset of what GBIF holds for GB.

**Species-by-location query:** Confirmed available via:
```
GET https://records-ws.nbnatlas.org/occurrences/search
  ?lat={lat}&lon={lon}&radius={km}
  &fq=country_code:GB
  &pageSize=1000
```
The `lat`/`lon`/`radius` parameters filter to a circular area. The `fq` (filter query) accepts any indexed Darwin Core field including taxon group, class, and vernacular name. Response is JSON.

**Sensitive species handling (critical for Scout):** Automatically built in at the data layer. Sensitive species records are blurred to agreed resolutions (1 km, 2 km, 10 km, 50 km, or 100 km) before they ever reach the public API. Scout receives pre-blurred coordinates for sensitive species — you do not need to implement this yourself, though you should still apply your own application-level fuzzing on top for defence in depth.

**Licensing:**
- 81 % of records: CC0, CC-BY, or Open Government Licence — fully open, including commercial use with attribution.
- 19 % of records: CC-BY-NC — open but non-commercial restriction applies to that subset.
- For Scout (non-commercial MVP → possible commercial future): treat CC-BY-NC records carefully. Either exclude CC-BY-NC datasets or obtain a licence from NBN if you intend to monetise.
- Attribution is required for CC-BY/OGL records. Display "Data from NBN Atlas" in the app.

**Rate limits:** No published hard limits. The docs warn: do not set page size above 1,000 per request; the download endpoint caps at 500,000 records per call. In practice, treat it as a shared research API — cache all responses aggressively with TanStack Query (stale time: 24 h for species lists, 1 h for occurrence search results).

**Authentication:** API key required only for geometry uploads and some data-submission endpoints. Public occurrence search (`records-ws.nbnatlas.org/occurrences/search`) is unauthenticated. Register at `auth.nbnatlas.org/apikey` if you later need write access.

**Confidence:** MEDIUM-HIGH. Core endpoints confirmed via `api.nbnatlas.org` index page and multiple secondary sources. The NBN docs site itself sits behind a DDoS-protection layer that blocked WebFetch during research; test endpoints directly before building.

### Secondary / Fallback: GBIF Occurrence API (api.gbif.org/v1)

| | GBIF | NBN Atlas |
|---|---|---|
| UK coverage | Good (~47 M GB records, subset of NBN) | Better (250 M+ records including datasets not yet in GBIF) |
| Species-by-location | `decimalLatitude`, `decimalLongitude`, `distance` params; `country=GB` filter | `lat`, `lon`, `radius` params |
| Sensitive species obfuscation | Not applied automatically at GBIF level | Applied automatically by NBN |
| Licensing | CC BY 4.0 or CC0 per dataset | CC0/CC-BY/OGL (81 %) + CC-BY-NC (19 %) |
| Rate limits | Soft — HTTP 429 if too aggressive; 100 k record cap per paginated search | Soft — page size ≤ 1,000 recommended |
| Auth | None for read | None for public occurrence search |

**Use GBIF as a fallback** if NBN Atlas has downtime, or for cross-validation of species taxonomy. GBIF is particularly useful for the UKSI (UK Species Inventory) checklist which gives canonical UK taxon names.

### What NOT to use

- **iNaturalist API alone:** Rate limit is ~100 req/min with real-world 429s at 60 req/min reported. Coverage of UK records is good but citizen-science quality (unverified IDs). Fine for inspiration and supplemental social data, but not suitable as a primary authoritative species-by-location source.
- **Ordnance Survey APIs for species data:** OS provides geographic layers (boundaries, grid references) but not species occurrence. Use OS grid references to cross-reference species records if needed, but it is not a species data source.

---

## Geolocation Strategy

**Platform decision: PWA (Next.js) over native (Expo/React Native)**

Rationale:
- Scout needs GPS (`navigator.geolocation` Web API) — works in all modern browsers on HTTPS, including Safari iOS 16.4+ when installed to the home screen.
- The PROJECT.md explicitly lists "Native iOS/Android apps" as out of scope for v1.
- Claude Code iterates fastest in a single Next.js codebase; no Xcode/Android Studio setup needed.
- The user's build environment (Claude Code) handles web deployments natively via Vercel.
- Geolocation accuracy on a PWA is equivalent to native for this use case (point-in-time location for "what's near me", not continuous background tracking).

**GPS in the browser:**
- `navigator.geolocation.getCurrentPosition()` — one-shot fix; suitable for "show me species near here" on button press.
- Requires HTTPS (Vercel handles this; use `next dev --experimental-https` locally).
- Store last-known coords in Zustand + localStorage for instant reload without re-requesting permission.
- Fallback: manual postcode entry → geocode via the free Postcodes.io API (`api.postcodes.io`) to lat/lng.

**Geospatial queries (your own data):**
- Supabase + PostGIS `ST_DWithin(location, ST_Point(lon, lat)::geography, radius_metres)` for querying user sighting records near a point.
- GiST index on the location column.
- Species occurrence lookups go to NBN Atlas API, not your database — your database stores user collections and sightings, not the occurrence dataset.

---

## Installation

```bash
# Scaffold project
npx create-next-app@latest scout --typescript --tailwind --app --turbopack

# Supabase client
npm install @supabase/supabase-js @supabase/ssr

# Data fetching + caching
npm install @tanstack/react-query

# State management
npm install zustand

# Schema validation
npm install zod

# shadcn/ui CLI (interactive, not a package)
npx shadcn@latest init

# Service worker (offline support — add after MVP)
npm install serwist

# Dev tools
npm install -D supabase @biomejs/biome
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Next.js PWA | Expo (React Native Web) | Expo adds native build complexity (Xcode, Android Studio, EAS) for no GPS benefit at MVP stage; Claude Code's strength is web. |
| Next.js PWA | Remix | Remix has no built-in PWA manifest support; smaller ecosystem for the card-game UI pattern. |
| Supabase | Firebase | Firebase has no PostGIS; geospatial queries require Firestore GeoPoint workarounds that don't scale cleanly. Also, Supabase's RLS model is more transparent for a solo developer. |
| Supabase | PlanetScale + Auth0 | Two separate services, two billing relationships, more glue code for realtime. Supabase does it all. |
| NBN Atlas | iNaturalist API | Rate limits (60-100 req/min effective) would require aggressive queuing at species-browse scale; NBN has better UK coverage and automatic sensitive-species obfuscation. |
| TanStack Query | SWR | TanStack Query v5 has better devtools, more complete offline support, and is the ecosystem standard. |
| Zustand | Redux Toolkit | Redux Toolkit is overkill for local UI state; Scout has no complex shared state logic that needs Redux's action history. |
| Tailwind v4 | Tailwind v3 | v3 is on maintenance; v4 is stable since Jan 2025 with full ecosystem support (shadcn/ui v4, Next 16 default). |
| shadcn/ui | Chakra UI / MUI | shadcn/ui gives you copy-owned components; you control every pixel of the card UI without fighting a component library's opinion. Rarity shimmer effects and "shiny" variants are far easier with owned code. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `next-pwa` (npm package) | Unmaintained since 2023; not compatible with Next 16 App Router | Built-in Next.js PWA support (manifest.ts) + serwist for service worker |
| Mapbox / Google Maps | Scout deliberately excludes precise location pins for rare animals; adding a map SDK creates pressure to show maps; overkill for v1 | No map in v1; if a map is ever needed, use Leaflet.js (lightweight, OSM tiles, free) |
| Camera / ML species ID (e.g. iNaturalist Vision API) | Out of scope per PROJECT.md; chosen model is GPS + manual pick | Not applicable |
| Prisma ORM over Supabase | Adds a separate ORM layer; Supabase's auto-generated TypeScript types from `supabase gen types` are sufficient and stay in sync with migrations automatically | Supabase JS client + generated types |
| React Native CLI (bare) | No app store distribution in v1; bare workflow removes Expo's managed build safety net without providing v1 value | Next.js PWA |
| Background GPS tracking | Not needed for "tap to discover nearby species"; requires native permissions and increases battery drain; conflicts with responsible-spotting pillar | One-shot `getCurrentPosition()` on user action |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.x | React 19.2, TypeScript 5.1+, Node 20.9+ | Node 18 dropped in Next 16; use Node 20 LTS |
| Tailwind 4.x | Next.js 16, PostCSS 8+ | v4 uses CSS-first config; no `tailwind.config.js` needed (optional) |
| shadcn/ui v4 | Tailwind 4, React 19 | shadcn CLI detects Tailwind version automatically |
| Supabase JS v2 | React 19, Next.js 16 | Use `@supabase/ssr` package for App Router server-side auth |
| TanStack Query v5 | React 19 | v5 is fully compatible with React 19 concurrent features |
| Zustand v5 | React 19 | Uses `useSyncExternalStore` — fully concurrent-safe |
| serwist | Next.js 16 | Currently requires webpack flag (`next build --webpack`) for service worker generation; Turbopack support is pending upstream |

---

## Sources

- [Next.js 16 release post](https://nextjs.org/blog/next-16) — Next.js version, PWA built-in support confirmed (HIGH confidence)
- [Next.js PWA docs](https://nextjs.org/docs/app/guides/progressive-web-apps) — Manifest, service worker, geolocation, iOS install flow (HIGH confidence, docs version 16.2.9)
- [NBN Atlas API index](https://api.nbnatlas.org/) — Occurrence search endpoints, lat/lon/radius params, auth requirements (MEDIUM confidence — confirmed via API index page; full docs behind DDoS protection during research)
- [NBN Atlas licensing search results](https://docs.nbnatlas.org/data-licenses/) — CC0/CC-BY/OGL (81 %) + CC-BY-NC (19 %) confirmed via NBN search result snippets (HIGH confidence, text from official docs)
- [NBN Atlas sensitive species](https://docs.nbnatlas.org/sensitive-species/) — Automatic blurring to 1–100 km confirmed via search result snippets (HIGH confidence)
- [GBIF Occurrence API](https://techdocs.gbif.org/en/openapi/v1/occurrence) — decimalLatitude/Longitude/distance params, country=GB filter, no auth for read (HIGH confidence)
- [Supabase PostGIS docs](https://supabase.com/docs/guides/database/extensions/postgis) — ST_DWithin, GiST indexes, one-click extension enable (HIGH confidence)
- [Expo SDK 56 changelog](https://expo.dev/changelog/sdk-56) — Current Expo version confirmed SDK 56 / React Native 0.85 (HIGH confidence)
- [iNaturalist API rate limits](https://www.inaturalist.org/pages/api+recommended+practices) — 100 req/min limit, real-world 429s at 60 req/min confirmed (HIGH confidence)
- [Tailwind CSS v4.3 release](https://tailwindcss.com/blog/tailwindcss-v4) — Stable Jan 2025, current 4.3 (HIGH confidence)
- [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) — v4 CLI, Tailwind v4 + Radix/Base UI support (HIGH confidence)
- [TanStack Query GitHub](https://github.com/tanstack/query) — v5.101.x current (HIGH confidence)
- [Zustand GitHub](https://github.com/pmndrs/zustand) — v5.0.11 current (HIGH confidence)
- [NBN Atlas / GBIF relationship](https://nbn.org.uk/news/update-nbn-atlas-makes-uk-2nd-largest-data-publishing-country-gbif/) — NBN is UK GBIF node; NBN Atlas is superset (HIGH confidence)

---

*Stack research for: UK wildlife collection PWA (Scout)*
*Researched: 2026-06-24*
