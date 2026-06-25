---
plan: 03-01
title: occurrences table schema + Drizzle migration + SpeciesResult type
phase: 3
wave: 1
depends_on: []
req_ids: [DISC-01, DISC-04]
branching_strategy: none
autonomous: true
files_modified:
  - src/lib/db/schema.ts
  - src/types/discovery.ts
---

## Goal

Add the `occurrences` Drizzle table to the schema, run the migration against Neon, and define the shared `SpeciesResult` type that Wave 2 plans depend on.

## Context

Phase 2 completed the `species` table (see `src/lib/db/schema.ts`). This plan adds the `occurrences` table that maps `(species_id, grid_square)` pairs to record counts pulled from NBN Atlas. It also defines `SpeciesResult` in `src/types/discovery.ts` — the shared response shape used by both the API routes (03-02) and the UI components (03-03).

No new npm packages are installed here. All Drizzle imports already exist in the project.

## Tasks

### Task 1: Add `occurrences` table to `src/lib/db/schema.ts`

Edit `src/lib/db/schema.ts`:

1. Add `uniqueIndex` and `index` to the existing import from `drizzle-orm/pg-core`. The current import is:
   ```
   import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
   ```
   Change it to:
   ```
   import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
   ```

2. Append the following table definition after the `species` table export (at the end of the file):
   ```ts
   export const occurrences = pgTable(
     "occurrences",
     {
       id: uuid("id").primaryKey().defaultRandom(),
       speciesId: uuid("species_id")
         .notNull()
         .references(() => species.id, { onDelete: "cascade" }),
       gridSquare: text("grid_square").notNull(),
       recordCount: integer("record_count").notNull().default(0),
       lastFetchedAt: timestamp("last_fetched_at").defaultNow().notNull(),
       source: text("source").notNull().default("nbn_atlas"),
     },
     (table) => ({
       uniqueSpeciesGrid: uniqueIndex("occurrences_species_grid_idx").on(
         table.speciesId,
         table.gridSquare
       ),
       gridSquareIdx: index("occurrences_grid_square_idx").on(table.gridSquare),
     })
   );
   ```

### Task 2: Create `src/types/discovery.ts`

Create a new file `src/types/discovery.ts` with exactly this content:

```ts
export type SpeciesResult = {
  id: string;
  commonName: string;
  scientificName: string;
  rarityTier: string;
  sensitivityLevel: string;
  canBeShiny: boolean;
  taxonomyGroup: string | null;
  recordCount: number;
};
```

This type is the API contract shared by the Discovery API route (03-02) and the Discovery UI components (03-03). Do not add any other exports to this file in this plan.

### Task 3: Generate and apply the Drizzle migration

Run these two commands in sequence. Use `DATABASE_URL_UNPOOLED` (not `DATABASE_URL`) — this is required because `drizzle-kit migrate` needs a direct TCP connection, not a pooled one. Never use `drizzle-kit push` (has a TTY requirement that breaks in non-interactive environments).

```bash
npx drizzle-kit generate
DATABASE_URL=$(grep DATABASE_URL_UNPOOLED .env.local | cut -d '=' -f2-) npx drizzle-kit migrate
```

If `.env.local` stores the variable differently, the executor should check `.env.local` for the `DATABASE_URL_UNPOOLED` key and pass it explicitly:
```bash
DATABASE_URL=<value-of-DATABASE_URL_UNPOOLED> npx drizzle-kit migrate
```

After migration completes, verify the table exists by running:
```bash
npx drizzle-kit studio
```
Or query directly if psql is available:
```bash
psql "$DATABASE_URL_UNPOOLED" -c "\d occurrences"
```

## Verification

- `npx tsc --noEmit` exits with code 0 (no TypeScript errors)
- A new migration file exists in `drizzle/` directory (named something like `0003_occurrences.sql`)
- The migration SQL contains `CREATE TABLE "occurrences"`, `CREATE UNIQUE INDEX "occurrences_species_grid_idx"`, and `CREATE INDEX "occurrences_grid_square_idx"`
- `src/types/discovery.ts` exists with the `SpeciesResult` export
- `npm run build` passes (no compile errors)

## Threat Model

No new trust boundaries introduced — this plan only modifies schema and creates a type file.

The `onDelete: "cascade"` on `species_id` FK is correct: if a species is ever deleted, its occurrence records are automatically cleaned up. This prevents orphaned occurrence rows.

The `occurrences` table stores no PII — grid squares are location-obfuscated identifiers with no user linkage.
