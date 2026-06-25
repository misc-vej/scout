---
phase: "01"
plan: "03"
subsystem: "nav-shell"
tags: [nav, layout, e2e, responsive, email-verification]
dependency_graph:
  requires: ["01-01", "01-02"]
  provides: ["nav-shell", "beastiary-stub", "discover-stub", "cross-device-e2e"]
  affects: ["src/app/(app)/layout.tsx", "src/components/NavShell.tsx"]
tech_stack:
  added: ["lucide-react"]
  patterns: ["sticky email banner", "responsive sidebar + mobile tab bar", "Playwright multi-context testing"]
key_files:
  created:
    - src/components/NavShell.tsx
    - src/components/EmailVerificationBanner.tsx
    - src/app/(app)/beastiary/page.tsx
    - src/app/(app)/discover/page.tsx
    - e2e/helpers.ts
    - e2e/home.spec.ts
    - e2e/cross-device.spec.ts
  modified:
    - src/app/(app)/layout.tsx
    - package.json
    - package-lock.json
decisions:
  - "NavShell uses md: breakpoint for sidebar/tab-bar toggle — no JS, pure Tailwind responsive"
  - "EmailVerificationBanner is sticky top-0 so it remains visible on scroll without overlay issues"
  - "cross-device.spec.ts uses `import type { Browser }` to avoid runtime import of Playwright internals"
  - "layout.tsx queries emailVerified directly from DB rather than embedding it in session token to keep token size small"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-25"
  tasks_completed: 3
  files_created: 7
  files_modified: 3
---

# Phase 01 Plan 03: NavShell + Email Banner + Stubs + E2E Summary

Responsive nav shell (desktop sidebar + mobile tab bar) wired into the app layout, email verification banner for unverified accounts, Beastiary and Discover page stubs scaffolded, and home + cross-device E2E specs covering AUTH-03.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Install lucide-react | 53de831 |
| 2 | NavShell + EmailVerificationBanner + layout update + page stubs | 02c136a |
| 3 | E2E helpers + home.spec.ts + cross-device.spec.ts | fc4c04f |

## What Was Built

**NavShell (`src/components/NavShell.tsx`)** — client component wrapping all app pages with a fixed desktop sidebar (md+) and a fixed mobile bottom tab bar. Active state uses `usePathname()` to highlight current route. Four nav items: Home, Beastiary, Discover, Profile using lucide-react icons.

**EmailVerificationBanner (`src/components/EmailVerificationBanner.tsx`)** — client component sticky at top of content area. Reads `emailVerified: Date | null` from parent (server component). Renders amber warning banner if null, supports dismiss via local state. Satisfies D-07.

**App layout update (`src/app/(app)/layout.tsx`)** — Server component now queries `users.emailVerified` from the DB for the current session user and passes it to EmailVerificationBanner. Wraps all children with NavShell. Auth guard tightened to check `session.user.id` (not just session existence).

**Beastiary stub (`src/app/(app)/beastiary/page.tsx`)** — placeholder grid of 6 locked species card slots. Satisfies D-05.

**Discover stub (`src/app/(app)/discover/page.tsx`)** — placeholder with compass motif and "coming soon" label. Satisfies D-05.

**E2E helpers (`e2e/helpers.ts`)** — shared `signIn(page, email, password)` utility used by home and cross-device specs.

**Home E2E (`e2e/home.spec.ts`)** — 4 tests: nav shell renders all tabs, Beastiary tab navigates to /beastiary, Discover to /discover, Profile to /profile.

**Cross-device E2E (`e2e/cross-device.spec.ts`)** — 2 tests: same account accessible from two independent browser contexts; sign-out on context A does not revoke context B session. Satisfies AUTH-03.

## Build Verification

- `npx tsc --noEmit` — exit 0, no errors
- `npm run build` — compiled successfully, all 4 app routes show as dynamic (ƒ)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| File | Description | Resolving Plan |
|------|-------------|----------------|
| src/app/(app)/beastiary/page.tsx | Empty grid cards — no real species data | Phase 2 (species data + sightings) |
| src/app/(app)/discover/page.tsx | Static compass placeholder — no location logic | Phase 2 (GPS/NBN Atlas integration) |

These stubs are intentional scaffolding. They render correctly and are auth-gated; the plan's goal (D-05 scaffold) is fully achieved.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes introduced in this plan.

## Self-Check: PASSED

- src/components/NavShell.tsx: FOUND
- src/components/EmailVerificationBanner.tsx: FOUND
- src/app/(app)/beastiary/page.tsx: FOUND
- src/app/(app)/discover/page.tsx: FOUND
- e2e/helpers.ts: FOUND
- e2e/home.spec.ts: FOUND
- e2e/cross-device.spec.ts: FOUND
- Commit 53de831 (lucide-react): FOUND
- Commit 02c136a (components + stubs): FOUND
- Commit fc4c04f (E2E specs): FOUND
