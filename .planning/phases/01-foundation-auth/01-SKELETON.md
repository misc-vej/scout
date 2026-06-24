# Walking Skeleton — Scout

**Phase:** 1
**Generated:** 2026-06-24

## Capability Proven End-to-End

A user can sign up with email and password on a single combined /auth page, a profiles row is auto-created in Supabase with RLS isolation, and they land on a stub home screen with a working nav shell — signing out and back in confirms the stack holds.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router + React 19 + TypeScript 5 | SSR-first PWA; App Router route groups cleanly separate auth vs. app surfaces; strong ecosystem for Supabase SSR |
| Data layer | Supabase Postgres 17 + PostGIS (cloud) + RLS | Single provider for auth + DB; RLS enforces per-user isolation at the database layer; PostGIS for Phase 3 geo queries; no ORM needed for Phase 1 |
| Auth | Supabase Auth (email/password + WebAuthn passkeys) via `@supabase/ssr` | Native passkey support built in (v2.39+); cookie-based session with `updateSession()` middleware refresh; no separate auth library needed |
| Styling | Tailwind CSS 4.3 + shadcn/ui v4 + CSS variables | Tailwind 4 CSS-only config; shadcn/ui v4 provides accessible components built on Radix; Scout accent green via CSS custom properties (oklch) |
| Deployment target | Local dev (npm run dev) | Phase 1 uses cloud Supabase project + local Next.js; Vercel/production deployment deferred to Phase 8 |
| Directory layout | `src/app/(auth)/` + `src/app/(app)/` route groups | Route groups avoid URL pollution; (auth) = unauthenticated, (app) = RLS-protected; `src/lib/supabase/` for three client patterns; `src/components/` for shared UI |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js 16, TypeScript, Tailwind 4, shadcn/ui v4, ESLint)
- [x] Routing — (auth)/auth + (app)/home,beastiary,discover,profile + middleware protection
- [x] Database — profiles table write (signup trigger) + RLS-isolated SELECT (auth token validation)
- [x] UI — combined sign-in/sign-up form, stub home screen, full nav shell (mobile + desktop)
- [x] Deployment — local full-stack run: `npm run dev` (Next.js) + Supabase cloud project

## Out of Scope (Deferred to Later Slices)

- Species data, NBN Atlas API, occurrence pipeline — Phase 3
- Collection mechanics (sighting log, card unlock) — Phase 4
- Beastiary UI (real cards, species facts, personality) — Phase 5
- Rarity tiers, shiny variants, conservation badges — Phase 6
- Spotter's Pledge onboarding, per-card ethics guidance — Phase 7
- PWA install prompt, service worker, offline support — Phase 8
- Vercel / production deployment — Phase 8
- Profile editing (display name, avatar) — later phase
- Social sign-in (Google, Apple) — not in v1 scope
- PostGIS spatial queries — Phase 3

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton:

- Phase 2: Species reference data + ethics data model (rarity, sensitivity, season-lock, NBN Atlas licence audit)
- Phase 3: Occurrence pipeline + Discovery (NBN Atlas ingest, PostGIS radius queries, postcode lookup, location obfuscation)
- Phase 4: Collection mechanics (sighting log, card unlock, multi-sighting counter, grid-snap GPS)
- Phase 5: Beastiary UI + personality (Pokédex-style grid, species facts, user-assigned personality)
- Phase 6: Rarity tiers + shiny variants (visual rarity treatment, BTO conservation badge, shiny overlay)
- Phase 7: Responsible spotting UX (Spotter's Pledge gate, per-card ethics guidance, season-lock enforcement)
