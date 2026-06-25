---
phase: "01"
plan: "02"
subsystem: auth
tags: [passkey, modal, profile, ui, server-action]
dependency_graph:
  requires: [01-01]
  provides: [passkey-prompt-modal, passkey-profile-section, dismiss-server-action]
  affects: [home-page, profile-page]
tech_stack:
  added: []
  patterns: [server-action-auth-validation, client-server-component-split, server-component-to-client-handoff]
key_files:
  created:
    - src/components/PasskeyPrompt.tsx
    - src/app/(app)/home/actions.ts
    - src/app/(app)/home/HomeClient.tsx
    - src/app/(app)/profile/page.tsx
    - src/app/(app)/profile/ProfilePasskeyButton.tsx
  modified:
    - src/app/(app)/home/page.tsx
decisions:
  - dismissPasskeyPrompt validates session.user.id against client-supplied userId to prevent IDOR
  - ProfilePasskeyButton extracted as client component to isolate onClick handler from Server Component
  - passkeyPromptedAt used as boolean proxy for "passkey set up" since real WebAuthn registration deferred to later phase
metrics:
  duration: "~8 minutes"
  completed: "2026-06-25"
  tasks_completed: 2
  files_changed: 6
---

# Phase 01 Plan 02: PasskeyPrompt Modal + Profile Passkey Section Summary

PasskeyPrompt modal shown after signup (D-03) and passkey management section on profile page (D-04) — non-blocking scaffolding with session-validated dismissal server action.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | PasskeyPrompt component + dismissal server action | a92a304 | PasskeyPrompt.tsx, actions.ts, HomeClient.tsx, home/page.tsx |
| 2 | Profile page stub with passkey section | a92a304 | profile/page.tsx, ProfilePasskeyButton.tsx |

## What Was Built

**PasskeyPrompt modal (D-03):**
- `src/components/PasskeyPrompt.tsx` — client component, renders fixed overlay with "Set up passkey" and "Maybe later" buttons
- `src/app/(app)/home/actions.ts` — `dismissPasskeyPrompt` server action that validates session before writing `passkeyPromptedAt`
- `src/app/(app)/home/HomeClient.tsx` — thin client wrapper managing `promptVisible` state, uses `next-auth/react` signOut
- `src/app/(app)/home/page.tsx` — updated Server Component: queries profiles, passes `showPasskeyPrompt` boolean + userId to HomeClient

**Profile passkey section (D-04):**
- `src/app/(app)/profile/page.tsx` — Server Component with Account and Security sections; reads `passkeyPromptedAt` to show registered/not-registered state
- `src/app/(app)/profile/ProfilePasskeyButton.tsx` — isolated client component for the "Set up passkey" onClick (Server Components cannot have onClick handlers)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] ProfilePasskeyButton extracted as separate client component**
- **Found during:** Task 2
- **Issue:** Plan noted `onClick={undefined}` on the Set up passkey button would cause a TypeScript error on a Server Component
- **Fix:** Extracted the button into `ProfilePasskeyButton.tsx` as a `"use client"` component rather than using `onClick={undefined}`
- **Files modified:** `src/app/(app)/profile/ProfilePasskeyButton.tsx` (created), `src/app/(app)/profile/page.tsx`
- **Commit:** a92a304

## Known Stubs

| File | What | Reason |
|------|------|--------|
| src/components/PasskeyPrompt.tsx | handleSetup calls alert() instead of WebAuthn | Real WebAuthn registration deferred to later phase per plan |
| src/app/(app)/profile/ProfilePasskeyButton.tsx | onClick calls alert() instead of WebAuthn | Real WebAuthn registration deferred to later phase per plan |

Both stubs are intentional per plan spec — the goal of this plan is UI scaffolding only. WebAuthn wiring is a future phase deliverable.

## Threat Flags

No new threat surface introduced beyond plan scope. The `dismissPasskeyPrompt` server action validates `session.user.id === userId` before any DB write, preventing IDOR on the profiles table.

## Self-Check: PASSED

Files exist:
- FOUND: src/components/PasskeyPrompt.tsx
- FOUND: src/app/(app)/home/actions.ts
- FOUND: src/app/(app)/home/HomeClient.tsx
- FOUND: src/app/(app)/home/page.tsx
- FOUND: src/app/(app)/profile/page.tsx
- FOUND: src/app/(app)/profile/ProfilePasskeyButton.tsx

Commit a92a304 exists in git log.
