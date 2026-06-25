# Walking Skeleton — Scout

**Phase:** 1 — Foundation + Auth
**Generated:** 2026-06-25 (updated from Supabase draft to reflect Neon + NextAuth.js v5 + Drizzle stack)

## Capability Proven End-to-End

A user visits Scout, signs up with email and password on a single combined /auth page, is offered a passkey prompt (dismissible), lands on a stub home screen with a working nav shell (Home, Beastiary, Discover, Profile), and can sign out and back in — confirming the full Next.js 16 → Neon → NextAuth.js v5 stack holds end-to-end. Unauthenticated access to any app route is blocked by middleware and redirected to /auth.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router + React 19 + TypeScript 5 | SSR-first PWA; App Router route groups cleanly separate auth vs. app surfaces; strong ecosystem |
| Database | Neon (Postgres 16 + PostGIS) + Drizzle ORM + drizzle-kit | Serverless Postgres — no connection pool management; PostGIS ready for Phase 3 geo queries; Drizzle provides type-safe query layer without heavy ORM overhead |
| Auth | NextAuth.js v5 (`next-auth@beta`) + Credentials provider + `@auth/drizzle-adapter` | JWT strategy (required for Credentials); bcryptjs for Edge-safe password hashing; config split into auth.config.ts (Edge/middleware) + auth.ts (Node) |
| Password hashing | bcryptjs (NOT native bcrypt) | Pure JS — works in both Edge middleware and Node runtime; cost factor 12 |
| Styling | Tailwind CSS 4 + shadcn/ui v4 | Tailwind 4 CSS-only config; shadcn/ui v4 provides accessible components; Scout accent green via CSS custom properties |
| Deployment target | Local dev (npm run dev) + Neon cloud | Phase 1 runs locally against cloud Neon project; Vercel deployment deferred to a later phase |
| Directory layout | `src/app/(auth)/` + `src/app/(app)/` route groups | Route groups avoid URL pollution; (auth) = unauthenticated layouts; (app) = session-required layouts; NavShell lives inside (app) layout |
| Session strategy | JWT (not database sessions) | Credentials provider requires JWT strategy — NextAuth v5 hard constraint; sessions table unused |

## The Thin Thread

```
Browser → GET /home → middleware (Edge, reads JWT) → not logged in → redirect /auth
Browser → POST /auth/form → registerUser server action → bcrypt.hash(password,12)
         → Neon: INSERT users + profiles → signIn("credentials") → JWT issued
         → redirect /home → PasskeyPrompt shown once → dismiss → write passkeyPromptedAt
Browser → GET /home (second visit) → middleware → JWT valid → layout renders NavShell → home stub
Browser → click Sign Out → signOut() → JWT cleared → redirect /auth
Browser (device 2) → POST /auth/form → Credentials authorize → bcrypt.compare → JWT issued → /home
```

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js 16, TypeScript, Tailwind 4, ESLint)
- [x] Routing — `(auth)/auth` + `(app)/home,beastiary,discover,profile` + middleware protection
- [x] Database — Neon Postgres: users + accounts + profiles tables via Drizzle push; PostGIS extension enabled
- [x] Auth — NextAuth.js v5: Credentials provider, JWT strategy, DrizzleAdapter, bcryptjs hashing
- [x] UI — combined sign-in/sign-up form (D-01), stub home (D-05), full nav shell (D-06), passkey prompt (D-03/D-04), email verification banner (D-07), beastiary/discover/profile stubs
- [x] E2E — Playwright: auth flow, middleware redirect, authenticated home, cross-device (two browser contexts)

## Out of Scope (Deferred to Later Slices)

- Species data, NBN Atlas API, occurrence pipeline — Phase 3
- Collection mechanics (sighting log, card unlock, grid-snap GPS) — Phase 4
- Beastiary UI (real cards, species facts, personality) — Phase 5
- Rarity tiers, shiny variants, conservation badges — Phase 6
- Spotter's Pledge onboarding gate, per-card ethics guidance, season-lock enforcement — Phase 7
- PWA install prompt, service worker, offline support — Phase 8
- Vercel / production deployment — Phase 8
- Real WebAuthn credential registration (biometric hardware enrollment) — Phase 1 scaffolds the UI and marks passkeyPromptedAt; full registration wired in a later pass
- Profile editing (display name, avatar) — later phase
- Social sign-in (Google, Apple) — not in v1 scope
- PostGIS spatial queries — Phase 3 (extension is enabled in Phase 1)
- Rate limiting on registerUser — Phase 1 accepts this; natural bcrypt latency provides soft protection

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton:

- Phase 2: Species reference data + ethics data model (rarity, sensitivity, season-lock, NBN Atlas licence audit)
- Phase 3: Occurrence pipeline + Discovery (NBN Atlas ingest, PostGIS radius queries, postcode lookup, location obfuscation)
- Phase 4: Collection mechanics (sighting log, card unlock, multi-sighting counter, grid-snap GPS)
- Phase 5: Beastiary UI + personality (Pokédex-style grid, species facts, user-assigned personality)
- Phase 6: Rarity tiers + shiny variants (visual rarity treatment, BTO conservation badge, shiny overlay)
- Phase 7: Responsible spotting UX (Spotter's Pledge gate, per-card ethics guidance, season-lock enforcement)
