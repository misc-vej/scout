import { db } from "../src/lib/db";
import { species } from "../src/lib/db/schema";
import { seedData } from "./species-seed";

async function seed() {
  console.log(`Seeding ${seedData.length} species...`);
  let count = 0;
  for (const entry of seedData) {
    await db
      .insert(species)
      .values(entry as typeof species.$inferInsert)
      .onConflictDoUpdate({
        target: species.scientificName,
        set: {
          commonName: entry.commonName,
          rarityTier: entry.rarityTier,
          sensitivityLevel: entry.sensitivityLevel,
          canBeShiny: entry.canBeShiny,
          seasonLockStart: entry.seasonLockStart ?? null,
          seasonLockEnd: entry.seasonLockEnd ?? null,
          taxonomyGroup: entry.taxonomyGroup ?? null,
          description: entry.description ?? null,
          funFact: entry.funFact ?? null,
          tvk: entry.tvk ?? null,
        },
      });
    count++;
  }
  console.log(`Seed complete. ${count} species upserted.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
