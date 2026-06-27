import { db } from '@/lib/db';
import { collections, sightings, species, userBadges } from '@/lib/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';

export type BadgeCategory = 'collection' | 'rarity' | 'habitat' | 'dedication' | 'exploration' | 'special';

export type BadgeDef = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
};

export const BADGE_REGISTRY: BadgeDef[] = [
  { slug: 'first_sighting',      name: 'First Spotted',        description: 'Log your first wildlife sighting',                    icon: '🌿', category: 'collection' },
  { slug: 'collector_5',         name: 'Budding Naturalist',    description: 'Add 5 species to your collection',                    icon: '🌱', category: 'collection' },
  { slug: 'collector_10',        name: 'Field Observer',        description: 'Add 10 species to your collection',                   icon: '🌳', category: 'collection' },
  { slug: 'collector_25',        name: 'Wildlife Enthusiast',   description: 'Add 25 species to your collection',                   icon: '🦉', category: 'collection' },
  { slug: 'collector_50',        name: 'Field Guide',           description: 'Add 50 species to your collection',                   icon: '📖', category: 'collection' },
  { slug: 'collector_100',       name: 'Master Naturalist',     description: 'Add 100 species to your collection',                  icon: '🎖️', category: 'collection' },
  { slug: 'rare_find',           name: 'Rare Find',             description: 'Spot your first rare species',                        icon: '⭐', category: 'rarity' },
  { slug: 'legendary_eye',       name: 'Legendary Eye',         description: 'Spot a legendary species',                            icon: '💎', category: 'rarity' },
  { slug: 'mythic_witness',      name: 'Mythic Witness',        description: 'Spot a mythic species',                               icon: '🌌', category: 'rarity' },
  { slug: 'shiny_hunter',        name: 'Shiny Hunter',          description: 'Find a shiny variant — incredibly rare',              icon: '✨', category: 'rarity' },
  { slug: 'twitcher',            name: 'Twitcher',              description: 'Collect 5 bird species',                              icon: '🦅', category: 'habitat' },
  { slug: 'mammal_watcher',      name: 'Mammal Watcher',        description: 'Collect 5 mammal species',                            icon: '🦊', category: 'habitat' },
  { slug: 'frequent_spotter',    name: 'Frequent Spotter',      description: 'Log 10 total sightings',                              icon: '📝', category: 'dedication' },
  { slug: 'dedicated_observer',  name: 'Dedicated Observer',    description: 'Log 50 total sightings',                              icon: '🔭', category: 'dedication' },
  { slug: 'local_explorer',      name: 'Local Explorer',        description: 'Spot wildlife across 3 different grid squares',       icon: '🗺️', category: 'exploration' },
  { slug: 'roaming_naturalist',  name: 'Roaming Naturalist',    description: 'Spot wildlife across 10 different grid squares',      icon: '🧭', category: 'exploration' },
  { slug: 'otter_spotter',       name: 'Otter Spotter',         description: 'Add the elusive Eurasian Otter to your collection',  icon: '🦦', category: 'special' },
  { slug: 'responsible_watcher', name: 'Responsible Watcher',   description: 'Spot a sensitive or restricted species',              icon: '🛡️', category: 'special' },
];

export const BADGE_CATEGORY_COLOR: Record<BadgeCategory, string> = {
  collection:  '#2a7a48',
  rarity:      '#9060e0',
  habitat:     '#5a90d0',
  dedication:  '#c8922a',
  exploration: '#4a9a5a',
  special:     '#c86030',
};

type UserStats = {
  collectionCount: number;  // total (verified only — counts towards badges)
  sightingCount: number;
  gridSquareCount: number;
  earnedRarities: Set<string>;
  hasShiny: boolean;
  taxonomyCounts: Map<string, number>;
  collectedScientificNames: Set<string>;
  hasSensitive: boolean;
};

async function getUserStats(userId: string): Promise<UserStats> {
  const [collectionCountResult, sightingCountResult, gridSquareCountResult, collectionDetails] =
    await Promise.all([
      db.select({ c: count() }).from(collections).where(and(eq(collections.userId, userId), eq(collections.verificationStatus, 'verified'))),
      db.select({ c: count() }).from(sightings).where(eq(sightings.userId, userId)),
      db
        .select({ c: sql<number>`cast(count(distinct ${sightings.gridSquare}) as int)` })
        .from(sightings)
        .where(eq(sightings.userId, userId)),
      db
        .select({
          rarityTier: species.rarityTier,
          sensitivityLevel: species.sensitivityLevel,
          scientificName: species.scientificName,
          taxonomyGroup: species.taxonomyGroup,
          isShiny: collections.isShiny,
        })
        .from(collections)
        .innerJoin(species, eq(collections.speciesId, species.id))
        .where(and(eq(collections.userId, userId), eq(collections.verificationStatus, 'verified'))),
    ]);

  const earnedRarities = new Set<string>();
  const taxonomyCounts = new Map<string, number>();
  const collectedScientificNames = new Set<string>();
  let hasShiny = false;
  let hasSensitive = false;

  for (const row of collectionDetails) {
    earnedRarities.add(row.rarityTier);
    if (row.scientificName) collectedScientificNames.add(row.scientificName);
    if (row.isShiny) hasShiny = true;
    if (row.sensitivityLevel === 'sensitive' || row.sensitivityLevel === 'restricted') hasSensitive = true;
    if (row.taxonomyGroup) {
      taxonomyCounts.set(row.taxonomyGroup, (taxonomyCounts.get(row.taxonomyGroup) ?? 0) + 1);
    }
  }

  return {
    collectionCount: Number(collectionCountResult[0]?.c ?? 0),
    sightingCount: Number(sightingCountResult[0]?.c ?? 0),
    gridSquareCount: Number(gridSquareCountResult[0]?.c ?? 0),
    earnedRarities,
    hasShiny,
    taxonomyCounts,
    collectedScientificNames,
    hasSensitive,
  };
}

function badgeIsEarned(slug: string, stats: UserStats): boolean {
  switch (slug) {
    case 'first_sighting':      return stats.collectionCount >= 1;
    case 'collector_5':         return stats.collectionCount >= 5;
    case 'collector_10':        return stats.collectionCount >= 10;
    case 'collector_25':        return stats.collectionCount >= 25;
    case 'collector_50':        return stats.collectionCount >= 50;
    case 'collector_100':       return stats.collectionCount >= 100;
    case 'rare_find':           return ['rare', 'super_rare', 'legendary', 'mythic'].some(r => stats.earnedRarities.has(r));
    case 'legendary_eye':       return stats.earnedRarities.has('legendary') || stats.earnedRarities.has('mythic');
    case 'mythic_witness':      return stats.earnedRarities.has('mythic');
    case 'shiny_hunter':        return stats.hasShiny;
    case 'twitcher':            return (stats.taxonomyCounts.get('bird') ?? 0) >= 5;
    case 'mammal_watcher':      return (stats.taxonomyCounts.get('mammal') ?? 0) >= 5;
    case 'frequent_spotter':    return stats.sightingCount >= 10;
    case 'dedicated_observer':  return stats.sightingCount >= 50;
    case 'local_explorer':      return stats.gridSquareCount >= 3;
    case 'roaming_naturalist':  return stats.gridSquareCount >= 10;
    case 'otter_spotter':       return stats.collectedScientificNames.has('Lutra lutra');
    case 'responsible_watcher': return stats.hasSensitive;
    default:                    return false;
  }
}

export async function checkAndAwardBadges(userId: string): Promise<BadgeDef[]> {
  const [stats, alreadyEarned] = await Promise.all([
    getUserStats(userId),
    db.select({ slug: userBadges.slug }).from(userBadges).where(eq(userBadges.userId, userId)),
  ]);

  const earnedSlugs = new Set(alreadyEarned.map(r => r.slug));
  const newlyEarned: BadgeDef[] = [];

  for (const badge of BADGE_REGISTRY) {
    if (!earnedSlugs.has(badge.slug) && badgeIsEarned(badge.slug, stats)) {
      newlyEarned.push(badge);
    }
  }

  if (newlyEarned.length > 0) {
    await db
      .insert(userBadges)
      .values(newlyEarned.map(b => ({ userId, slug: b.slug })))
      .onConflictDoNothing();
  }

  return newlyEarned;
}
