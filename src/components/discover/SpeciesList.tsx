import type { FC } from 'react';
import type { SpeciesResult } from '@/types/discovery';
import SpeciesCard from './SpeciesCard';

const SpeciesList: FC<{ species: SpeciesResult[]; gridSquare: string }> = ({ species, gridSquare }) => (
  <div>
    <p className="mb-4 text-sm text-gray-400">
      {species.length} species recorded near {gridSquare}
    </p>
    {species.length === 0 ? (
      <p className="py-8 text-center text-gray-500">
        Nothing recorded in this area yet — get out and explore!
      </p>
    ) : (
      <div className="flex flex-col gap-3">
        {species.map((s) => (
          <SpeciesCard key={s.id} species={s} />
        ))}
      </div>
    )}
  </div>
);

export default SpeciesList;
