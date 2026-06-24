---
phase: 1
slug: foundation-auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E) + TypeScript type checking |
| **Config file** | `playwright.config.ts` — Wave 0 installs |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30 seconds (type check) / ~60 seconds (Playwright) |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full Playwright suite must be green
- **Max feedback latency:** 30 seconds (type check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-setup | 01 | 1 | — | — | N/A | type | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 01-supabase | 01 | 1 | AUTH-01 | — | Anon key only in client; service key never exposed | type | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 01-migrations | 01 | 1 | AUTH-01, AUTH-03 | T-01 | RLS enabled before any data written | manual | Supabase dashboard verify | ❌ W0 | ⬜ pending |
| 01-auth-ui | 01 | 2 | AUTH-01 | — | N/A | e2e | `npx playwright test auth` | ❌ W0 | ⬜ pending |
| 01-passkey | 01 | 2 | AUTH-02 | — | Passkey dismiss non-blocking | manual | Browser WebAuthn flow | ❌ W0 | ⬜ pending |
| 01-middleware | 01 | 2 | AUTH-03 | T-02 | Unauthenticated access blocked | e2e | `npx playwright test middleware` | ❌ W0 | ⬜ pending |
| 01-nav | 01 | 3 | — | — | N/A | type | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 01-home | 01 | 3 | AUTH-03 | — | N/A | e2e | `npx playwright test home` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — configure base URL `http://localhost:3000`, test dir `e2e/`
- [ ] `e2e/auth.spec.ts` — signup flow, sign-in flow, sign-out redirect
- [ ] `e2e/middleware.spec.ts` — unauthenticated redirect to /auth
- [ ] `e2e/home.spec.ts` — authenticated home screen renders
- [ ] `package.json` — add `@playwright/test` devDependency and `test:e2e` script

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Passkey registration via WebAuthn | AUTH-02 | Browser biometric dialog cannot be automated in CI | Chrome 108+: sign up → click "Set up passkey" → complete biometric → sign out → sign in with passkey |
| Supabase profile trigger creates row | AUTH-03 | Requires Supabase dashboard inspection | Sign up → Supabase Dashboard → Table Editor → profiles → verify row exists with correct id |
| Email confirmation banner hides after verify | AUTH-01 | Requires real email inbox | Sign up → check inbox → click confirm link → banner should disappear |
| RLS: user cannot read another user's profile | AUTH-03 | Requires two Supabase sessions | Sign in as user A → query `profiles` → only one row returned (own) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (type check path)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
