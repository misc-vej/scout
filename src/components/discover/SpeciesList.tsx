import type { FC } from 'react';
import type { SpeciesResult } from '@/types/discovery';
import SpeciesCard from './SpeciesCard';

const SpeciesList: FC<{ species: SpeciesResult[]; gridSquare: string }> = ({
  species,
  gridSquare,
}) => {
  const sorted = [...species].sort((a, b) => b.likelihood - a.likelihood);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* List header */}
      <div
        style={{
          background: '#091410',
          padding: '12px 16px 10px',
          borderBottom: '1px solid rgba(255,255,255,.04)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: '#e8f0e4',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
            }}
          >
            Nearby Species
          </div>
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 10,
              color: '#2e5a3a',
              marginTop: 2,
            }}
          >
            {species.length} plausible for this area
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 9,
            color: '#1e3828',
            textTransform: 'uppercase',
            letterSpacing: '.1em',
          }}
        >
          by likelihood
        </div>
      </div>

      {/* Scrollable species list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {sorted.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 12,
              color: '#2e5a3a',
            }}
          >
            No species recorded nearby
          </div>
        ) : (
          sorted.map((s) => (
            <SpeciesCard key={s.id} species={s} gridSquare={gridSquare} />
          ))
        )}
      </div>
    </div>
  );
};

export default SpeciesList;
