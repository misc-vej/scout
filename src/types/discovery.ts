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
