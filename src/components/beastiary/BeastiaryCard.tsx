import RarityBadge from '@/components/discover/RarityBadge';
import { PersonalityPicker } from './PersonalityPicker';
import { ConservationBadge } from './ConservationBadge';
import { EthicsSection } from './EthicsSection';
import { SensitivityBadge } from './SensitivityBadge';

const RARITY_RING: Record<string, string> = {
  common:     'ring-1 ring-gray-500/30 shadow-sm',
  uncommon:   'ring-1 ring-green-500/40 shadow-md shadow-green-500/20',
  rare:       'ring-2 ring-blue-500/50 shadow-md shadow-blue-500/25',
  super_rare: 'ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/30',
  legendary:  'ring-2 ring-amber-500/70 shadow-lg shadow-amber-500/35',
  mythic:     'ring-2 ring-red-500/80 shadow-xl shadow-red-500/40',
};
const SHINY_RING = 'ring-2 ring-yellow-400/80 shadow-xl shadow-yellow-400/40';

type BeastiaryCardProps = {
  species: {
    id: string;
    commonName: string;
    scientificName: string;
    rarityTier: string;
    funFact: string | null;
    conservationStatus: string | null;
    spottingTips: string | null;
    sensitivityLevel: string;
  };
  sightingCount?: number;
  personalityTrait?: string | null;
  isShiny?: boolean;
};

export function BeastiaryCard({ species, sightingCount, personalityTrait, isShiny = false }: BeastiaryCardProps) {
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
    <div className={`${isShiny ? SHINY_RING : (RARITY_RING[species.rarityTier] ?? RARITY_RING.common)} bg-white/5 overflow-hidden flex flex-col rounded-xl`}>
      <div className="aspect-[3/4] bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center relative">
        <span className="text-8xl font-black text-white/10 select-none">
          {species.commonName.charAt(0)}
        </span>
        {isShiny && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-amber-500/20 pointer-events-none" />
            <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-yellow-400/15 rounded px-1.5 py-0.5">
              <span className="text-yellow-400 text-xs font-bold">✦</span>
              <span className="text-yellow-400 text-[10px] font-semibold">Shiny</span>
            </div>
          </>
        )}
        <div className="absolute bottom-2 right-2">
          <RarityBadge tier={species.rarityTier} />
        </div>
        <div className="absolute bottom-2 left-2">
          <ConservationBadge status={species.conservationStatus} />
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="font-bold text-white">{species.commonName}</p>
        <p className="text-xs italic text-gray-500">{species.scientificName}</p>
        <SensitivityBadge level={species.sensitivityLevel} />
        {species.funFact && (
          <p className="text-xs text-gray-400 mt-1 italic">{species.funFact}</p>
        )}
        {sightingCount !== undefined && sightingCount > 1 && (
          <p className="text-xs text-green-400 font-semibold mt-1">{sightingCount}× spotted</p>
        )}
        <PersonalityPicker speciesId={species.id} currentTrait={personalityTrait ?? null} />
        {species.spottingTips && <EthicsSection tips={species.spottingTips} />}
      </div>
    </div>
  );
}
