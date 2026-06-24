# Phase 1: Foundation + Auth — Research

**Written:** 2026-06-24
**Phase:** 01 — Foundation + Auth
**Requirements addressed:** AUTH-01, AUTH-02, AUTH-03
**Mode:** MVP Walking Skeleton

---

## 1. Next.js 16 App Router — Greenfield Scaffolding

### Scaffold command
```bash
npx create-next-app@latest scout \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Next.js 16 ships with React 19 and the App Router by default. The `--tailwind` flag installs Tailwind CSS 4 in new projects (as of create-next-app 16.x). No separate Tailwind init step needed.

### Route group structure

Use route groups to split authenticated vs. unauthenticated surfaces with separate layouts:

```
src/app/
  (auth)/              # Unauthenticated — login/signup
    layout.tsx         # Minimal layout, no nav shell
    auth/
      page.tsx         # Single combined sign-in/sign-up page (D-01)
  (app)/               # Authenticated — protected routes
    layout.tsx         # Full layout with nav shell (D-06)
    home/
      page.tsx
    beastiary/
      page.tsx         # Stub
    discover/
      page.tsx         # Stub
    profile/
      page.tsx         # Stub
  layout.tsx           # Root layout (fonts, global CSS, providers)
  page.tsx             # Root redirect → /auth or /home based on session
```

Route groups `(auth)` and `(app)` do not affect URL paths — `/auth`, `/home`, `/beastiary` remain clean.

### middleware.ts — session-based route protection

```typescript
// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

The `updateSession` helper (from `@/lib/supabase/middleware`) refreshes the Supabase session on every request. Protected route enforcement lives here: if no session and path starts with `/home|/beastiary|/discover|/profile` → redirect to `/auth`. If session exists and path is `/auth` → redirect to `/home`.

---

## 2. Supabase + Next.js 16 SSR

### Package versions (2025)

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Current versions as of mid-2025:
- `@supabase/supabase-js`: ^2.45.x
- `@supabase/ssr`: ^0.5.x

### Three client patterns

`@supabase/ssr` provides the correct cookie-based session handling for Next.js App Router. Three distinct clients are needed:

**Browser client** — for client components (`'use client'`):
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server client** — for Server Components, Server Actions, Route Handlers:
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

**Middleware client** — for `middleware.ts`:
```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = ['/home', '/beastiary', '/discover', '/profile'].some(p =>
    request.nextUrl.pathname.startsWith(p)
  )
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return supabaseResponse
}
```

**Critical:** Always use `supabase.auth.getUser()` in middleware (not `getSession()`) — `getUser()` validates the JWT server-side; `getSession()` only reads cookies and can be spoofed.

### Environment variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both are NEXT_PUBLIC because they're needed client-side. The anon key is safe to expose — RLS enforces access control.

---

## 3. Supabase Auth: Email/Password + Passkeys

### Email/password sign-up and sign-in

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Sign out
const { error } = await supabase.auth.signOut()
```

### Email verification detection (D-07)

After signup, `data.user.email_confirmed_at` is `null` until confirmed. Check in Server Components:
```typescript
const { data: { user } } = await supabase.auth.getUser()
const isUnverified = user && !user.email_confirmed_at
```

Show a non-blocking banner when `isUnverified` is true. The user is still logged in and functional.

### Email confirmation callback route

```typescript
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/home`)
}
```

The Supabase dashboard "Redirect URLs" setting must include `http://localhost:3000/auth/callback` for local dev and the production URL before deploying.

### Passkeys (WebAuthn) in 2025

Supabase has native passkey support as of late 2024 via the Web Authentication API — **no separate `@simplewebauthn` package needed**. It is built into `@supabase/supabase-js` v2.39+.

```typescript
// Passkey registration (D-03: prompted after signup)
const { data, error } = await supabase.auth.signInWithPasskey({
  action: 'register',
  email,
})

// Passkey sign-in
const { data, error } = await supabase.auth.signInWithPasskey({
  action: 'authenticate',
})
```

> **Note:** Supabase passkey support requires HTTPS. For local dev, `localhost` is treated as a secure context by browsers — `npm run dev` works. For testing on a device, use a tunnel (e.g., `ngrok`) or Vercel preview deployment.

**Browser support (2025):** Chrome 108+, Safari 16+, Firefox 122+, Edge 108+, iOS 16+, Android 9+. Covers the vast majority of users. Graceful fallback: if `PublicKeyCredential` is not in `window`, hide the passkey option entirely.

```typescript
const supportsPasskeys = typeof window !== 'undefined' &&
  window.PublicKeyCredential !== undefined
```

### Passkey preference storage (D-04)

Track dismissal in the `profiles` table: `passkey_prompted_at timestamptz`. If null → show the prompt. If set → don't show again (can re-add from settings).

---

## 4. Database: Profiles Table + RLS

### Migration file

`supabase/migrations/20260624000001_create_profiles.sql`

```sql
-- Enable UUID extension (may already be enabled)
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  passkey_prompted_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Supabase migration workflow

```bash
# Initialize Supabase (links to remote project)
npx supabase init
npx supabase login
npx supabase link --project-ref <project-ref>

# Apply migration to remote
npx supabase db push

# Or for local dev with Supabase local stack:
npx supabase start
npx supabase db reset  # applies all migrations fresh
```

Migration file naming: `YYYYMMDDHHMMSS_description.sql` — timestamp prefix ensures correct ordering.

---

## 5. shadcn/ui v4 + Tailwind CSS 4

### Init shadcn/ui v4

```bash
npx shadcn@latest init
```

The interactive init will ask for:
- Style: Default
- Base colour: choose Slate or Neutral (to be overridden by Scout green)
- CSS variables: Yes (required for theme customisation)

This creates `components.json`, updates `src/app/globals.css` with CSS variable definitions, and adds `src/components/ui/` folder.

### Tailwind CSS 4 — CSS-only config

Tailwind 4 drops `tailwind.config.js` in favour of CSS-based configuration in `globals.css`. The `@tailwind` directives are replaced with:

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* Scout accent — natural green */
  --primary: oklch(0.45 0.15 145);      /* deep forest green */
  --primary-foreground: oklch(0.98 0 0);
  /* ... shadcn/ui standard variables ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.6 0.15 145);       /* lighter green for dark mode */
  --primary-foreground: oklch(0.1 0 0);
}
```

The Scout accent green using OKLCH: `oklch(0.45 0.15 145)` (hue 145° = nature green, chroma 0.15, lightness 0.45).

### Phase 1 components to add

```bash
npx shadcn@latest add button input label form card badge
```

- `Button` — auth form submit, nav items
- `Input` — email, password fields
- `Label` — form field labels
- `Form` — React Hook Form integration (shadcn/ui Form wraps RHF)
- `Card` — auth page container
- `Badge` — email verification banner

---

## 6. Navigation Shell

### Layout structure for (app) routes

```typescript
// src/app/(app)/layout.tsx
import { NavShell } from '@/components/nav-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 md:pl-64">
        {children}
      </main>
      <NavShell />
    </div>
  )
}
```

```typescript
// src/components/nav-shell.tsx — bottom nav (mobile) + sidebar (desktop)
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Compass, User } from 'lucide-react'

const navItems = [
  { href: '/home',      label: 'Home',      icon: Home },
  { href: '/beastiary', label: 'Beastiary', icon: BookOpen },
  { href: '/discover',  label: 'Discover',  icon: Compass },
  { href: '/profile',   label: 'Profile',   icon: User },
]

export function NavShell() {
  const pathname = usePathname()
  return (
    <>
      {/* Mobile: fixed bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t bg-background md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs
              ${pathname === href ? 'text-primary' : 'text-muted-foreground'}`}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
      {/* Desktop: fixed left sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-background p-4 md:flex">
        <div className="mb-8 px-2 text-xl font-bold text-primary">Scout</div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm
              ${pathname === href
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted'}`}>
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </aside>
    </>
  )
}
```

---

## 7. Walking Skeleton Definition

The Walking Skeleton for Phase 1 is the thinnest end-to-end thread proving the stack works:

**Thread:** User signs up → profile row created in Supabase → redirected to stub home screen → signs out → signs back in → still works

**Minimum file set:**
```
src/
  app/
    layout.tsx                    # Root layout, providers
    page.tsx                      # Redirect to /auth or /home
    (auth)/
      layout.tsx                  # Plain layout
      auth/
        page.tsx                  # Combined sign-in/sign-up form
      callback/
        route.ts                  # Email confirmation handler
    (app)/
      layout.tsx                  # Nav shell layout
      home/
        page.tsx                  # Stub home screen
      beastiary/page.tsx          # Stub
      discover/page.tsx           # Stub
      profile/page.tsx            # Stub
  middleware.ts                   # Session protection
  lib/
    supabase/
      client.ts                   # Browser client
      server.ts                   # Server client
      middleware.ts               # updateSession helper
  components/
    nav-shell.tsx
    email-verify-banner.tsx
supabase/
  migrations/
    20260624000001_create_profiles.sql
.env.local
```

**Deployment target for Phase 1:** Local development only (`npm run dev`). Vercel deployment is a Phase 8 concern. The Supabase cloud project is used (not local Supabase stack) to avoid additional setup complexity.

---

## 8. Passkey Registration Flow (D-03)

After successful email/password signup, show the passkey prompt in the same flow:

1. `signUp()` completes → user object returned
2. Modal/step appears: "Sign in faster next time — use your face or fingerprint"
3. User clicks "Set up passkey" → `supabase.auth.signInWithPasskey({ action: 'register', email })`
4. Browser WebAuthn dialog appears → user authenticates with biometric
5. On success → `profiles.passkey_prompted_at` is set → redirect to `/home`
6. User clicks "Skip for now" → `profiles.passkey_prompted_at` is set to `null` is NOT set (leave null so it could be re-prompted from settings) → redirect to `/home`
   - Actually: set `passkey_prompted_at = now()` on skip too — this prevents re-prompting. Settings page offers "Add passkey" at any time.

---

## Pitfalls and Gotchas

1. **Hydration mismatch:** Never call `supabase.auth.getSession()` in Server Components — always `getUser()`. Use the server client from `@/lib/supabase/server.ts` (not the browser client) in Server Components and Route Handlers.

2. **Cookie handling in Next.js 15+:** `cookies()` from `next/headers` is now async (`await cookies()`). The server client factory must be async.

3. **Passkeys require HTTPS or localhost:** Works on `localhost:3000` in dev. Cannot test on LAN IP without a proper TLS cert.

4. **Supabase email confirmation redirect:** Must configure allowed redirect URLs in Supabase dashboard → Auth → URL Configuration → Redirect URLs. Add `http://localhost:3000/**`.

5. **RLS must be enabled before data is written:** The migration enables RLS immediately — never add the `enable row level security` line after the table has data.

6. **Trigger security:** The `handle_new_user` function must be `SECURITY DEFINER` — it inserts into `public.profiles` from the `auth.users` trigger, which runs in the Supabase auth schema context.

7. **`@supabase/ssr` vs deprecated auth-helpers:** `@supabase/auth-helpers-nextjs` is deprecated. Use `@supabase/ssr` only.

8. **Tailwind 4 peer dependency:** shadcn/ui v4 requires `tailwindcss@^4.0.0`. Do not install `tailwindcss@3.x` — `create-next-app` with `--tailwind` on Next.js 16 installs v4 automatically.

9. **Route group layout must not add URL segment:** `(auth)` and `(app)` folder names must stay in parentheses — without them the folder name becomes a URL segment.

---

## Validation Architecture

### What MUST work end-to-end (happy path)
- User enters email + password on `/auth` → account created → profile row appears in Supabase → redirected to `/home`
- User on `/home` clicks sign-out → redirected to `/auth` → `/home` now returns 302 to `/auth`
- Returning user enters email + password on `/auth` → signed in → `/home` renders
- New user sees passkey prompt post-signup → sets up passkey → next sign-in uses biometric
- New user dismisses passkey prompt → lands on `/home` directly
- User has unverified email → banner appears on `/home` → clicking verify sends email → banner hides after confirmation

### Integration Points to Test
- Supabase Auth ↔ Next.js middleware: `updateSession()` refreshes cookies on every request; if broken, session expires mid-session
- `auth.users` insert trigger ↔ `public.profiles`: if trigger fails (missing `SECURITY DEFINER`), profile row is missing and profile-dependent features break
- Passkey registration ↔ Supabase: if WebAuthn credential not stored, passkey sign-in fails silently
- RLS ↔ profiles table: if policy is wrong, users see null data or get 403 from Supabase client
- Email confirmation callback route ↔ Supabase `exchangeCodeForSession`: if missing, email links return 404

### Edge Cases / Pitfalls
- **Hydration mismatch:** Using browser client in Server Components → fix: always import from `@/lib/supabase/server.ts` in server context
- **Passkey not supported:** `PublicKeyCredential` undefined in non-HTTPS context or old browser → show "Set up later in settings" instead of prompt
- **Email confirmation URL not whitelisted:** Supabase rejects redirect → configure in dashboard before testing email confirmation
- **RLS enabled after data inserted:** Existing rows become inaccessible → always enable RLS in the same migration that creates the table
- **Async cookies() in Next.js 15+:** Missing `await` on `cookies()` → runtime error in server client factory

### Tools and Commands
- `npx supabase db push` — apply migrations to remote Supabase project
- `npm run dev` — start local development server
- **Manual smoke test:** Sign up → check Supabase Dashboard → Authentication → Users (user exists) + Table Editor → profiles (row exists)
- **RLS test:** Sign in as user A, query `profiles` table via Supabase client → should return only own row
- **Middleware test:** Open incognito → navigate to `/home` → should redirect to `/auth`
- **Passkey test:** Chrome 108+ required; use DevTools → Application → WebAuthn to simulate authenticators

## RESEARCH COMPLETE
