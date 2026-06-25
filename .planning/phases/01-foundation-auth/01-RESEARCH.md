# Phase 1: Foundation + Auth — Research

**Written:** 2026-06-25 (replaces Supabase-based research)
**Phase:** 01 — Foundation + Auth
**Stack:** Next.js 16 · NextAuth.js v5 · Neon (Postgres + PostGIS) · Drizzle ORM · bcryptjs
**Requirements:** AUTH-01, AUTH-02, AUTH-03

---

## 1. Next.js 16 App Router — Scaffold

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Run inside the Scout repo root (`.` targets current directory). Tailwind 4 is installed automatically by create-next-app 16.x — no separate init needed.

### Route group structure

```
src/app/
  (auth)/
    layout.tsx          # Unauthenticated layout (no nav shell)
    auth/
      page.tsx          # Combined sign-in/sign-up page (D-01)
      actions.ts        # registerUser server action
  (app)/
    layout.tsx          # Authenticated layout (nav shell added Plan 03)
    home/
      page.tsx          # Stub home (D-05)
    beastiary/
      page.tsx          # Stub — activated Phase 5
    discover/
      page.tsx          # Stub — activated Phase 3
    profile/
      page.tsx          # Stub — account settings
  api/
    auth/
      [...nextauth]/
        route.ts        # NextAuth v5 handler
  layout.tsx            # Root layout
  page.tsx              # Root redirect → /auth or /home
middleware.ts           # Auth-gated route protection
```

---

## 2. NextAuth.js v5 (Auth.js) — Credentials Provider

### Install

```bash
npm install next-auth@beta @auth/drizzle-adapter bcryptjs
npm install -D @types/bcryptjs
```

NextAuth v5 (`next-auth@beta`) is the current stable beta — widely production-used as of mid-2025. The `@auth/drizzle-adapter` connects to Drizzle ORM for persisting users.

### Config split — Edge vs Node

NextAuth v5 requires splitting config into two files because middleware runs on the Edge runtime (no Node.js APIs like `bcrypt`):

**`src/auth.config.ts`** — Edge-compatible (no database, no bcrypt):
```ts
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/auth" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/home", "/beastiary", "/discover", "/profile"];
      const isProtected = protectedPaths.some(p =>
        nextUrl.pathname.startsWith(p)
      );
      if (isProtected && !isLoggedIn)
        return Response.redirect(new URL("/auth", nextUrl));
      if (isLoggedIn && nextUrl.pathname === "/auth")
        return Response.redirect(new URL("/home", nextUrl));
      return true;
    },
  },
  providers: [], // Credentials added in auth.ts only
};
```

**`src/auth.ts`** — Full config (Node runtime only — never imported in middleware):
```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" }, // REQUIRED for Credentials provider
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, String(credentials.email)))
          .limit(1);
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );
        return valid ? user : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
```

### Route handler

**`src/app/api/auth/[...nextauth]/route.ts`:**
```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### Using auth in Server Components

```ts
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/auth");
  // session.user.id is available
}
```

### Triggering sign-in/out from Client Components

```ts
import { signIn, signOut } from "next-auth/react";

// Sign in
await signIn("credentials", { email, password, redirectTo: "/home" });

// Sign out
await signOut({ redirectTo: "/auth" });
```

### Environment variables

```env
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=http://localhost:3000   # Optional in dev; required in production
DATABASE_URL=postgresql://...    # Neon connection string
```

### Critical gotcha — Credentials + JWT

**Credentials provider only works with `session: { strategy: "jwt" }`** — not database sessions. This is a hard NextAuth v5 constraint. With JWT strategy the `sessions` table is unused; only the `users` table (and optionally `accounts`) is needed.

---

## 3. Neon + Drizzle ORM

### Install

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

### Database connection — `src/lib/db/index.ts`

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

Use the **pooled connection string** from Neon dashboard for serverless functions. Use the **direct (unpooled) connection string** for `drizzle-kit push/migrate` only.

### Schema — `src/lib/db/schema.ts`

The NextAuth Drizzle adapter requires specific table shapes. With JWT + Credentials, only `users` is strictly required, but include `accounts` for future OAuth providers:

```ts
import {
  pgTable, text, timestamp, uuid
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"), // NOT in adapter default — added for Credentials
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Required by DrizzleAdapter for future OAuth providers
export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

// App-specific user profile
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  passkeyPromptedAt: timestamp("passkey_prompted_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Drizzle config — `drizzle.config.ts` (repo root)

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Schema management

**Development:** `npx drizzle-kit push` — pushes schema directly to database, no migration files. Fast for iteration. Destructive changes require confirmation.

**Production:** `npx drizzle-kit generate` → creates SQL files in `./drizzle/` → `npx drizzle-kit migrate` applies them. Tracked and reversible.

For Phase 1 (greenfield dev), use `drizzle-kit push`.

### Enabling PostGIS

Run once in Neon SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

Do this in Phase 1 even though PostGIS is not used until Phase 3 — extension activation is a one-time setup.

### Getting credentials from Neon dashboard

1. `console.neon.tech` → your project → Connection Details
2. Select **"Pooled connection"** → copy as `DATABASE_URL` for app code
3. Select **"Direct connection"** → use only for `drizzle-kit push/migrate`
4. SQL Editor → run PostGIS extension commands

### `package.json` scripts to add

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 4. Password Hashing — bcryptjs

`bcryptjs` is pure JavaScript — works in both Edge (middleware) and Node runtimes. Use instead of the native `bcrypt` package which is Node-only.

```ts
import bcrypt from "bcryptjs";

// During registration (server action):
const passwordHash = await bcrypt.hash(password, 12);

// During sign-in (Credentials authorize):
const isValid = await bcrypt.compare(password, user.passwordHash);
```

Cost factor 12 balances security and latency (~250ms on modern hardware).

---

## 5. Route Protection — Middleware

**`src/middleware.ts`:**
```ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
```

The `authorized` callback in `auth.config.ts` handles all redirect logic. The matcher excludes static assets and Next.js internals.

---

## 6. User Registration — Server Action

NextAuth Credentials only handles sign-in; registration is a separate server action:

**`src/app/(auth)/auth/actions.ts`:**
```ts
"use server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { eq } from "drizzle-orm";

export async function registerUser(email: string, password: string) {
  // Check for existing user
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({ email, passwordHash }).returning();
  await db.insert(profiles).values({ userId: user.id });
  await signIn("credentials", { email, password, redirectTo: "/home" });
}
```

The auth page attempts `signIn("credentials")` first. If the user is not found (AuthError), it calls `registerUser` instead. One combined form handles both flows (D-01).

---

## 7. Playwright E2E Setup

```bash
npm install -D @playwright/test
npx playwright install chromium
```

**`playwright.config.ts`:**
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

E2E tests use unique randomised emails per run to avoid state pollution between test runs.

---

## 8. Environment Variables — Full List

```env
# Neon
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# NextAuth
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000

# E2E test account (local only — do not commit)
E2E_EMAIL=test@scout.dev
E2E_PASSWORD=testpassword123
```

`.env.local` is gitignored. Commit `.env.example` with placeholder values.

---

## 9. Common Gotchas

| Gotcha | Fix |
|--------|-----|
| Credentials + database session strategy | Always use `session: { strategy: "jwt" }` with Credentials |
| `bcrypt` (native) in middleware | Use `bcryptjs` — native bcrypt is Node-only, breaks Edge middleware |
| Drizzle push with pooled URL | Use **direct** connection URL for `drizzle-kit push`; pooled for app queries |
| `auth()` in Server Components | Always `await auth()` — it returns a Promise |
| `signIn()` throws on bad credentials | Wrap in try/catch — throws `AuthError` (not just returns null) |
| Neon cold start latency | First query after idle ~500ms on free tier — expected |
| `passwordHash` column missing | Manually extend the `users` table — the DrizzleAdapter doesn't add it by default |
| PostGIS not installed | Run `CREATE EXTENSION IF NOT EXISTS postgis` in Neon SQL Editor before Phase 3 |
| `AUTH_URL` in production | Must be set to the production origin in Vercel env vars |

---

## 10. Integration Threads (End-to-End)

1. User visits `/` → middleware `authorized` → not logged in → redirect `/auth`
2. User submits sign-up form → `registerUser` server action → bcrypt hash → insert `users` + `profiles` → `signIn("credentials")` → JWT issued → redirect `/home`
3. User submits sign-in form → Credentials `authorize` → bcrypt compare → JWT issued → redirect `/home`
4. User clicks sign out → `signOut()` → JWT cleared → redirect `/auth`
5. User revisits `/home` with valid JWT → middleware allows → page renders with `session.user.id`
6. Cross-device sync: sign in on second browser → same user row, same profiles data (AUTH-03)

---

*Research written: 2026-06-25 | Stack: Neon + NextAuth.js v5 + Drizzle ORM*
