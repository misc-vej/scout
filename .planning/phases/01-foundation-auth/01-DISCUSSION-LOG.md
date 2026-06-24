# Phase 1: Foundation + Auth — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-24
**Phase:** 1-Foundation + Auth
**Areas discussed:** Auth UI & tone, Passkey setup timing, Post-auth landing, Email verification

---

## Auth UI & Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Single combined page | One screen handles both sign-in and sign-up — user enters email, app detects if they're new | ✓ |
| Separate pages | /sign-in and /sign-up as distinct routes | |
| Modal / overlay | Auth lives in a modal over a public landing page | |

**User's choice:** Single combined page
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Already Scout-branded | Nature imagery, Scout name/logo, playful copy | |
| Clean neutral | Simple, functional placeholder | |
| Minimal Scout branding | Scout name and accent colour, no heavy design work | ✓ |

**User's choice:** Minimal Scout branding
**Notes:** Design polish deferred to later phases; identity established from day one.

---

## Passkey Setup Timing

| Option | Description | Selected |
|--------|-------------|----------|
| During signup (prompted) | After email/password signup, user is immediately prompted to add a passkey | ✓ |
| Opt-in from settings | Passkeys live in account settings — added as a separate step | |
| At first sign-in after signup | Passkey offer shown on first login after verification | |

**User's choice:** During signup (prompted)
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Skip for now, can add later in settings | Non-blocking — dismissable, passkey available in settings | ✓ |
| Prompt again next sign-in (once) | One re-prompt after dismissal | |
| Never shown again | Single dismissal = permanently skipped | |

**User's choice:** Skip for now, can add later in settings
**Notes:** Non-blocking; avoids friction for users who don't know what a passkey is.

---

## Post-Auth Landing

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal stub home screen | Simple authenticated shell with Scout name/logo, nav skeleton, placeholder | ✓ |
| Redirect to /beastiary (empty state) | Land on beastiary route immediately | |
| Settings / profile page | Auth goes straight to account settings | |

**User's choice:** Minimal stub home screen
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — scaffold full nav now | Add nav items for Home, Beastiary, Discover, Profile as stubs | ✓ |
| No — just auth + home, nav comes later | Keep Phase 1 minimal | |

**User's choice:** Yes — scaffold the full nav now
**Notes:** Scaffolding nav now avoids refactoring it in every subsequent phase.

---

## Email Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Required / blocking | Must verify email before accessing the app | |
| Soft prompt, not blocking | App accessible immediately; verification banner shown | ✓ |
| Not required | No email verification | |

**User's choice:** Soft prompt, not blocking
**Notes:** Avoids sign-up drop-off while still surfacing verification.

---

## Claude's Discretion

- Navigation design details (tab bar vs side rail, icon choices, breakpoints)
- Supabase RLS policy structure
- Error messaging copy (functional placeholders for Phase 1)
- Exact accent colour (natural green as default; revisit in Beastiary UI phase)

## Deferred Ideas

- Onboarding / Spotter's Pledge → Phase 7
- Profile editing (display name, avatar) → later phase
- PWA install prompt / offline support → Phase 8
- Social sign-in (Google, Apple) → out of scope for v1
