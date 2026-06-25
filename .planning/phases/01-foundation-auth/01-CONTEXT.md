# Phase 1: Foundation + Auth — Context

**Gathered:** 2026-06-24
**Updated:** 2026-06-25 — stack changed from Supabase to Neon + NextAuth.js v5 + Drizzle
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working Next.js + Neon skeleton with email/password auth via NextAuth.js v5, Drizzle ORM schema with a users/profiles table, and a minimal authenticated stub home screen with a full nav shell. Every subsequent phase builds on this foundation. The beastiary, collection mechanics, and any feature content are out of scope — this phase is purely about getting a signed-in user into a working app shell.

</domain>

<decisions>
## Implementation Decisions

### Auth UI & Tone
- **D-01:** Single combined sign-in/sign-up page — one screen handles both flows. User enters email; app detects whether they're new (sign-up) or returning (sign-in).
- **D-02:** Minimal Scout branding on the auth screen — Scout name and accent colour present, but no heavy design work. Establishes the identity without requiring a finished design system. Style polish happens in later phases.

### Passkey Setup Timing
- **D-03:** Passkey setup is prompted immediately after a successful email/password signup — the user completes their account, then is offered passkey registration in the same flow.
- **D-04:** The passkey prompt is non-blocking — the user can dismiss it and access Scout immediately. Passkey registration is also available later in account settings. No re-prompting after dismissal.

### Post-Auth Landing
- **D-05:** After auth, the user lands on a minimal stub home screen — Scout name/logo visible, placeholder content (e.g., "your beastiary is coming — go find something"), no real data.
- **D-06:** Scaffold the full navigation shell now (bottom nav for mobile, sidebar for desktop) with stubs for Home, Beastiary, Discover, and Profile. Routes exist but render placeholder screens. Later phases activate each section. This avoids nav refactors in every subsequent phase.

### Email Verification
- **D-07:** Email verification is a soft prompt, not a blocking gate. The user can access Scout immediately after signup. An unverified-account banner is shown until they verify. This avoids drop-off at signup while still surfacing the verification step.

### Claude's Discretion
- Navigation design (tab bar vs side rail, icon choices, specific breakpoints) — open to standard mobile-first patterns.
- Supabase RLS policy structure — implement per-user collection isolation as standard from the start; specific policy syntax is an implementation detail.
- Error messaging copy — functional placeholder copy is fine for Phase 1; tone polish is a later-phase concern.
- Exact accent colour — use a natural green as Scout's accent for Phase 1 (the design system is not locked yet); revisit in the Beastiary UI phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — core value, constraints (UK-only, ethics pillar, location privacy, anti-features), stack decisions
- `.planning/REQUIREMENTS.md` — AUTH-01, AUTH-02, AUTH-03 (the three requirements this phase covers)
- `.planning/ROADMAP.md` §Phase 1 — success criteria: verified account, passkey sign-in on supported device, cross-device sync, unauthenticated users cannot access collection features

### Stack & Architecture
- `.planning/research/SUMMARY.md` — authoritative stack recommendation (Next.js 16, Tailwind 4, shadcn/ui v4, TanStack Query v5, Zustand v5) — **NOTE: auth and DB sections are outdated (Supabase); new research supersedes them**
- `.planning/research/STACK.md` — library versions and rationale — **NOTE: auth/DB sections outdated; see new research**
- **Stack change (2026-06-25):** Supabase replaced with: Neon (Postgres + PostGIS), NextAuth.js v5 (Auth.js), Drizzle ORM + drizzle-kit migrations

### No external specs
No ADRs or external specification documents yet — this is the first phase. All decisions are captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project. CLAUDE.md exists only.

### Established Patterns
- None yet — this phase establishes the foundational patterns all other phases will follow.

### Integration Points
- **Neon** is the database (Postgres + PostGIS). **NextAuth.js v5** is the auth provider using the Credentials provider (email + password, bcrypt-hashed). **Drizzle ORM** is the query layer; `drizzle-kit push` or `migrate` applies schema to Neon.
- NextAuth v5 requires an `AUTH_SECRET` env var and a `DATABASE_URL` (Neon connection string). The Drizzle adapter for NextAuth handles session + user tables automatically.
- Row-level data isolation: all user-scoped queries filter by `session.user.id` in server actions / route handlers — no Postgres RLS needed for v1.
- The nav shell scaffolded here defines the route structure that Phases 3–7 will fill in. Route names established now (e.g., `/beastiary`, `/discover`, `/profile`) should be stable.
- PostGIS extension must be enabled on the Neon database (Phase 3 dependency — do it now so the extension is available when needed).

</code_context>

<specifics>
## Specific Ideas

- The stub home screen should convey Scout's vibe even without real content — something playful that signals "this is going to be good." A short tagline or illustrated placeholder rather than a generic "coming soon."
- The navigation tabs: Home, Beastiary, Discover, Profile — these four cover the full app. Discover is the GPS discovery screen (Phase 3); Beastiary is the collection (Phase 5); Profile/Settings holds passkey management and account details.
- Passkey prompt copy should be friendly and explain what a passkey is in plain language — many users won't know. "Sign in with your face or fingerprint next time" beats "Register a WebAuthn credential."

</specifics>

<deferred>
## Deferred Ideas

- Onboarding / Spotter's Pledge — this is Phase 7. Phase 1 auth is separate from the pledge gate.
- Profile editing (display name, avatar) — account settings beyond passkey management are a later phase concern.
- PWA install prompt / offline support — deferred to a later polish phase (Phase 8 per roadmap).
- Social sign-in (Google, Apple) — not in scope; email/password + passkeys cover v1 auth.

</deferred>

---

*Phase: 1-Foundation + Auth*
*Context gathered: 2026-06-24*
