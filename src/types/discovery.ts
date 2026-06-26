export type SpeciesResult = {
  id: string;
  commonName: string;
  scientificName: string;
  rarityTier: string;
  sensitivityLevel: string;
  canBeShiny: boolean;
  taxonomyGroup: string | null;
  recordCount: number;
  isSeasonLocked: boolean;
  seasonUnlocksAt: string | null;  // MM-DD format e.g. "08-31"
};
