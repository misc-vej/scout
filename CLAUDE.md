@AGENTS.md

## Project

**Scout**

Scout is a UK real-world wildlife collection web app. Users see what wildlife could be near them, log genuine sightings via GPS + manual pick, and unlock Pokédex-style beastiary cards. Responsible spotting is a core mechanical pillar — not just copy. Built as a Next.js 16 PWA with Supabase (Postgres + PostGIS).

**Core Value:** The thrill of "I found that, for real" — without ever disturbing the animal.

### Constraints

- **Region**: UK-only for v1 — bounds the species dataset.
- **Ethics**: The app must never incentivise or enable disturbing wildlife; responsible spotting governs feature design, not just copy.
- **Location privacy**: Precise coordinates of rare/vulnerable species must never be exposed. Server stores grid-square resolution only — raw GPS is transient in-memory client-side only.
- **Data licensing**: NBN Atlas CC-BY-NC licence audit is a pre-launch gate (Phase 2). Do not build monetisation assumptions until cleared.
- **Anti-features (never build)**: competitive leaderboards, streaks/FOMO mechanics, urgency notifications, proximity-increases-reward mechanics, precise location pins for rare species.

### Stack

- Next.js 16 + React 19 + TypeScript 5 — App Router, PWA
- Supabase — Postgres 17 + PostGIS (auth, DB, storage, realtime)
- Tailwind CSS 4 + shadcn/ui v4
- TanStack Query v5 — caching/deduping of species API responses
- Zustand v5 — ephemeral client state (GPS, active species, UI)
- NBN Atlas API — UK species occurrence data (primary data source)

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
