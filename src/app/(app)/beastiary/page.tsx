import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { species, collections } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { BeastiaryClient } from "@/components/beastiary/BeastiaryClient";

export default async function BeastiaryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }
  const userId = (session.user as { id: string }).id;

  const allSpecies = await db
    .select({
      id: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      rarityTier: species.rarityTier,
      speciesType: species.speciesType,
      funFact: species.funFact,
      spottingTips: species.spottingTips,
      sensitivityLevel: species.sensitivityLevel,
      taxonomyGroup: species.taxonomyGroup,
      imageUrl: species.imageUrl,
      description: species.description,
      conservationStatus: species.conservationStatus,
    })
    .from(species)
    .orderBy(asc(species.id));

  const userCollections = await db
    .select({
      id: collections.id,
      speciesId: collections.speciesId,
      sightingCount: collections.sightingCount,
      personalityTrait: collections.personalityTrait,
      isShiny: collections.isShiny,
      firstSightedAt: collections.firstSightedAt,
      verificationStatus: collections.verificationStatus,
    })
    .from(collections)
    .where(eq(collections.userId, userId));

  const collectedMap: Record<
    string,
    {
      collectionId: string;
      sightingCount: number;
      personalityTrait: string | null;
      isShiny: boolean;
      firstSightedAt: string | null;
      verificationStatus: string;
    }
  > = {};
  for (const c of userCollections) {
    collectedMap[c.speciesId] = {
      collectionId: c.id,
      sightingCount: c.sightingCount,
      personalityTrait: c.personalityTrait,
      isShiny: c.isShiny,
      firstSightedAt: c.firstSightedAt
        ? c.firstSightedAt.toISOString()
        : null,
      verificationStatus: c.verificationStatus,
    };
  }

  const totalCollected = Object.keys(collectedMap).length;
  const totalSpecies = allSpecies.length;

  // Build the flat species array with no, habitat, and collection info merged
  const speciesRows = allSpecies.map((s, index) => ({
    id: s.id,
    commonName: s.commonName,
    scientificName: s.scientificName,
    rarityTier: s.rarityTier,
    speciesType: s.speciesType ?? null,
    funFact: s.funFact ?? null,
    spottingTips: s.spottingTips ?? null,
    sensitivityLevel: s.sensitivityLevel,
    no: "#" + String(index + 1).padStart(3, "0"),
    habitat: s.taxonomyGroup ?? null,
    imageUrl: s.imageUrl ?? null,
    description: s.description ?? null,
    conservationStatus: s.conservationStatus ?? null,
    // collection fields (null when not collected)
    collectionId: collectedMap[s.id]?.collectionId ?? null,
    sightingCount: collectedMap[s.id]?.sightingCount ?? undefined,
    personalityTrait: collectedMap[s.id]?.personalityTrait ?? null,
    isShiny: collectedMap[s.id]?.isShiny ?? false,
    firstSightedAt: collectedMap[s.id]?.firstSightedAt ?? null,
    verificationStatus: collectedMap[s.id]?.verificationStatus ?? null,
  }));

  return (
    <BeastiaryClient
      speciesRows={speciesRows}
      totalCollected={totalCollected}
      totalSpecies={totalSpecies}
    />
  );
}
