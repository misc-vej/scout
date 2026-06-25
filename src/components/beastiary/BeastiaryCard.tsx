import RarityBadge from '@/components/discover/RarityBadge';
import { PersonalityPicker } from './PersonalityPicker';

type BeastiaryCardProps = {
  species: {
    id: string;
    commonName: string;
    scientificName: string;
    rarityTier: string;
    funFact: string | null;
  };
  sightingCount?: number;
  personalityTrait?: string | null;
};

export function BeastiaryCard({ species, sightingCount, personalityTrait }: BeastiaryCardProps) {
  const unlocked = sightingCount !== undefined;

  if (!unlocked) {
    return (
      <div className="flex flex-col rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden opacity-30">
        <div className="aspect-[3/4] bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
          <span className="text-6xl font-black text-white/10">?</span>
        </div>
        <div className="p-3">
          <p className="font-bold text-gray-600">???</p>
          <p className="text-xs text-gray-700 mt-0.5">Not yet sighted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-white/15 bg-white/5 overflow-hidden">
      <div className="aspect-[3/4] bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center relative">
        <span className="text-8xl font-black text-white/10 select-none">
          {species.commonName.charAt(0)}
        </span>
        <div className="absolute bottom-2 right-2">
          <RarityBadge tier={species.rarityTier} />
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="font-bold text-white">{species.commonName}</p>
        <p className="text-xs italic text-gray-500">{species.scientificName}</p>
        {species.funFact && (
          <p className="text-xs text-gray-400 mt-1 italic">{species.funFact}</p>
        )}
        {sightingCount !== undefined && sightingCount > 1 && (
          <p className="text-xs text-green-400 font-semibold mt-1">{sightingCount}× spotted</p>
        )}
        <PersonalityPicker speciesId={species.id} currentTrait={personalityTrait ?? null} />
      </div>
    </div>
  );
}
