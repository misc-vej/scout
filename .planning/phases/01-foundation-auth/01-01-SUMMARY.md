---
phase: "01"
plan: "01"
subsystem: "auth"
tags: ["next.js", "nextauth", "drizzle", "neon", "tailwind", "playwright"]
dependency_graph:
  requires: []
  provides: ["auth-session", "db-schema", "db-connection", "route-protection", "e2e-infra"]
  affects: ["all-subsequent-plans"]
tech_stack:
  added:
    - "next@16.2.9"
    - "react@19"
    - "next-auth@beta (v5)"
    - "@auth/drizzle-adapter"
    - "drizzle-orm"
    - "drizzle-kit"
    - "bcryptjs"
    - "@neondatabase/serverless"
    - "tailwindcss (v4)"
    - "@playwright/test"
  patterns:
    - "JWT session strategy with Credentials provider"
    - "Route groups: (auth) and (app)"
    - "Server actions for registerUser"
    - "Drizzle HTTP adapter for Neon serverless"
key_files:
  created:
    - "package.json"
    - "tsconfig.json"
    - "next.config.ts"
    - "drizzle.config.ts"
    - "postcss.config.mjs"
    - "eslint.config.mjs"
    - "playwright.config.ts"
    - "src/lib/db/index.ts"
    - "src/lib/db/schema.ts"
    - "src/auth.config.ts"
    - "src/auth.ts"
    - "src/proxy.ts"
    - "src/app/layout.tsx"
    - "src/app/page.tsx"
    - "src/app/(auth)/layout.tsx"
    - "src/app/(auth)/auth/page.tsx"
    - "src/app/(auth)/auth/actions.ts"
    - "src/app/(app)/layout.tsx"
    - "src/app/(app)/home/page.tsx"
    - "src/app/api/auth/[...nextauth]/route.ts"
    - "drizzle/0000_youthful_gargoyle.sql"
    - "e2e/auth.spec.ts"
    - "e2e/middleware.spec.ts"
    - ".env.example"
  modified: []
decisions:
  - "JWT session strategy required with Credentials provider (stateless, no sessions table)"
  - "bcryptjs (pure JS) over native bcrypt for Edge compatibility"
  - "proxy.ts instead of middleware.ts — Next.js 16 renamed the file convention"
  - "drizzle-kit generate + migrate instead of push — avoids TTY requirement in non-interactive shells"
  - "Neon HTTP adapter (neon-http) for serverless/edge compatibility"
metrics:
  duration: "~20 minutes"
  completed: "2026-06-25T13:10:00Z"
  tasks_completed: 4
  files_created: 23
---

# Phase 01 Plan 01: Foundation Auth Scaffold Summary

JWT-authenticated Next.js 16 app scaffold with Drizzle ORM + Neon schema, NextAuth.js v5 Credentials provider, combined sign-in/sign-up page, route protection via proxy middleware, and Playwright E2E infrastructure.

## Tasks Completed

### Task 1: Scaffold Next.js 16 + Install All Dependencies
- Bootstrapped package.json manually (create-next-app blocked by capital-letter directory name "Scout")
- Installed next@16.2.9, react@19, typescript, tailwindcss v4, eslint-config-next
- Installed next-auth@beta, @auth/drizzle-adapter, bcryptjs, drizzle-orm, @neondatabase/serverless
- Installed dev: drizzle-kit, @playwright/test, @types/bcryptjs
- Created drizzle.config.ts, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs
- Created src/lib/db/index.ts (Neon HTTP drizzle client)
- Created src/lib/db/schema.ts (users, accounts, profiles tables)
- Created src/app/layout.tsx + globals.css with Tailwind v4 import

### Task 2: Wire NextAuth v5 + Route Groups + Auth Page
- Created src/auth.config.ts — authorized callback protecting /home, /beastiary, /discover, /profile
- Created src/auth.ts — Credentials provider with JWT strategy, bcrypt password verification
- Created src/app/api/auth/[...nextauth]/route.ts — GET/POST handlers
- Created src/proxy.ts — Next.js 16 proxy/middleware for route protection
- Created src/app/(auth)/auth/page.tsx — combined sign-in/sign-up form (D-01)
- Created src/app/(auth)/auth/actions.ts — registerUser server action
- Created src/app/(auth)/layout.tsx + src/app/(app)/layout.tsx
- Created src/app/(app)/home/page.tsx — stub home with sign-out form
- Created src/app/page.tsx — session-based root redirect

### Task 3: Run Database Migration
- Ran drizzle-kit generate — produced drizzle/0000_youthful_gargoyle.sql
- Ran drizzle-kit migrate using DATABASE_URL_UNPOOLED (direct connection)
- Created 3 tables in Neon: users, accounts, profiles
- Migration applied successfully

### Task 4: Playwright Config + Baseline E2E Specs
- Created playwright.config.ts with chromium project and webServer (auto-starts dev server)
- Created e2e/auth.spec.ts — signup flow and signout flow tests
- Created e2e/middleware.spec.ts — unauthenticated redirect tests for 4 protected paths

## Key Files Created

| File | Purpose |
|------|---------|
| src/lib/db/schema.ts | Drizzle schema: users, accounts, profiles |
| src/lib/db/index.ts | Neon serverless drizzle client |
| src/auth.ts | NextAuth v5 with Credentials + JWT |
| src/auth.config.ts | Auth config with route protection callbacks |
| src/proxy.ts | Next.js 16 proxy (route protection) |
| src/app/(auth)/auth/page.tsx | Combined sign-in/sign-up UI |
| src/app/(auth)/auth/actions.ts | registerUser server action |
| drizzle/0000_youthful_gargoyle.sql | Applied migration (tables created in Neon) |

## db:push Result

Used `drizzle-kit generate` + `drizzle-kit migrate` (via DATABASE_URL_UNPOOLED):

```
3 tables
accounts  11 columns  0 indexes  1 fk
profiles   6 columns  0 indexes  1 fk
users      8 columns  0 indexes  0 fk
[✓] migrations applied successfully!
```

## TypeScript Check Result

`npx tsc --noEmit` exits 0 — no errors.

## Build Result

`npm run build` exits 0 with clean output:
```
Route (app)
├ ƒ /
├ ○ /_not-found
├ ƒ /api/auth/[...nextauth]
├ ○ /auth
└ ƒ /home
ƒ Proxy (Middleware)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-next-app blocked by capital-letter directory name**
- **Found during:** Task 1
- **Issue:** `npx create-next-app@latest .` failed because npm rejects capital letters in package names ("Scout")
- **Fix:** Manually created package.json with `"name": "scout"` (lowercase), then ran individual `npm install` commands for all required packages
- **Files modified:** package.json
- **Impact:** Equivalent result — same dependencies, same scripts

**2. [Rule 1 - Bug] middleware.ts export pattern rejected by Next.js 16 build**
- **Found during:** Task 2 verification (build step)
- **Issue:** `export const { auth: middleware } = NextAuth(authConfig)` — Next.js 16 build checker couldn't recognize this as a function export
- **Fix:** Changed to `const { auth } = NextAuth(authConfig); export default auth;`
- **Files modified:** src/middleware.ts
- **Commit:** 92df761 (original), a01847f (fix)

**3. [Rule 1 - Bug] middleware.ts renamed to proxy.ts in Next.js 16**
- **Found during:** Task 2 verification (build step)
- **Issue:** Next.js 16 deprecated `middleware` file convention in favor of `proxy`; build showed deprecation warning
- **Fix:** Renamed src/middleware.ts → src/proxy.ts using `git mv`
- **Files modified:** src/proxy.ts (renamed from src/middleware.ts)
- **Commit:** a01847f

**4. [Rule 3 - Blocking] drizzle-kit push requires TTY for interactive prompts**
- **Found during:** Task 3
- **Issue:** `drizzle-kit push` requires an interactive terminal; non-TTY execution fails
- **Fix:** Used `drizzle-kit generate` + `drizzle-kit migrate` pipeline instead — equivalent result, no interactivity required
- **Files modified:** drizzle/0000_youthful_gargoyle.sql (new)
- **Impact:** Same tables created in Neon; migration file is tracked in git for reproducibility

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| Home page content | src/app/(app)/home/page.tsx | Placeholder — beastiary/discover features are Phase 2+ |

The home page shows "Your beastiary is coming — go find something." This is intentional; Plan 01-02 will add navigation and Phase 2 builds the actual features.

## Threat Flags

None — no new security surface introduced beyond what the plan specified. Auth endpoints follow NextAuth v5 conventions with JWT strategy.

## Self-Check: PASSED

- src/lib/db/schema.ts — FOUND
- src/auth.ts — FOUND
- src/proxy.ts — FOUND
- src/app/(auth)/auth/page.tsx — FOUND
- src/app/(auth)/auth/actions.ts — FOUND
- e2e/auth.spec.ts — FOUND
- e2e/middleware.spec.ts — FOUND
- playwright.config.ts — FOUND
- drizzle/0000_youthful_gargoyle.sql — FOUND
- Commits: bde0146, 92df761, 6378d25, c193275, a01847f — all present in git log
