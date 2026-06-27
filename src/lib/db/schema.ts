import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  passkeyPromptedAt: timestamp("passkey_prompted_at", { mode: "date" }),
  pledgeAcceptedAt: timestamp("pledge_accepted_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rarityTierEnum = pgEnum("rarity_tier", [
  "common",
  "uncommon",
  "rare",
  "super_rare",
  "legendary",
  "mythic",
]);

export const sensitivityLevelEnum = pgEnum("sensitivity_level", [
  "none",
  "caution",
  "sensitive",
  "restricted",
]);

export const species = pgTable("species", {
  id: uuid("id").primaryKey().defaultRandom(),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name").notNull().unique(),
  tvk: text("tvk"),
  rarityTier: rarityTierEnum("rarity_tier").notNull(),
  sensitivityLevel: sensitivityLevelEnum("sensitivity_level").notNull().default("none"),
  canBeShiny: boolean("can_be_shiny").notNull().default(false),
  seasonLockStart: text("season_lock_start"),
  seasonLockEnd: text("season_lock_end"),
  description: text("description"),
  funFact: text("fun_fact"),
  spottingTips: text("spotting_tips"),
  conservationStatus: text("conservation_status"),
  imageUrl: text("image_url"),
  speciesType: text("species_type"),
  taxonomyGroup: text("taxonomy_group"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const sightings = pgTable("sightings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  speciesId: uuid("species_id")
    .notNull()
    .references(() => species.id, { onDelete: "cascade" }),
  gridSquare: text("grid_square").notNull(),
  sightedAt: timestamp("sighted_at").defaultNow().notNull(),
});

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: uuid("species_id")
      .notNull()
      .references(() => species.id, { onDelete: "cascade" }),
    sightingCount: integer("sighting_count").notNull().default(1),
    firstSightedAt: timestamp("first_sighted_at").defaultNow().notNull(),
    lastSightedAt: timestamp("last_sighted_at").defaultNow().notNull(),
    personalityTrait: text("personality_trait"),
    isShiny: boolean("is_shiny").notNull().default(false),
    verificationStatus: text("verification_status").notNull().default("unverified"),
    // 'unverified' | 'pending' | 'verified' | 'rejected'
  },
  (table) => ({
    uniqueUserSpecies: uniqueIndex("collections_user_species_idx").on(
      table.userId,
      table.speciesId
    ),
    userIdIdx: index("collections_user_id_idx").on(table.userId),
  })
);

export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    earnedAt: timestamp("earned_at").defaultNow().notNull(),
  },
  (table) => ({
    userSlugUniq: uniqueIndex("user_badges_user_slug_idx").on(table.userId, table.slug),
    userIdIdx: index("user_badges_user_id_idx").on(table.userId),
  })
);

export const verificationRequests = pgTable(
  "verification_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    submittedBy: uuid("submitted_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
    evidenceType: text("evidence_type").notNull(), // 'photo' | 'description'
    evidenceData: text("evidence_data"),           // base64 data URL or text
    status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
    reviewNote: text("review_note"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => ({
    collectionIdx: index("verification_requests_collection_idx").on(table.collectionId),
    submittedByIdx: index("verification_requests_submitted_by_idx").on(table.submittedBy),
    statusIdx: index("verification_requests_status_idx").on(table.status),
  })
);
