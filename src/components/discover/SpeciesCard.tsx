import type { FC } from 'react';
import type { SpeciesResult } from '@/types/discovery';
import RarityBadge from './RarityBadge';

const SpeciesCard: FC<{ species: SpeciesResult }> = ({ species }) => (
  <div className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-4">
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-white">{species.commonName}</span>
      <span className="text-sm italic text-gray-400">{species.scientificName}</span>
      {species.taxonomyGroup && (
        <span className="text-xs text-gray-500 capitalize">{species.taxonomyGroup}</span>
      )}
      <span className="text-xs text-gray-500">{species.recordCount} records nearby</span>
    </div>
    <div className="ml-3 shrink-0">
      <RarityBadge tier={species.rarityTier} />
    </div>
  </div>
);

export default SpeciesCard;
