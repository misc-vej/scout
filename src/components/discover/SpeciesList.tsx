'use client';

import type { FC } from 'react';
import { useState } from 'react';
import type { SpeciesResult } from '@/types/discovery';
import SpeciesCard from './SpeciesCard';

const SpeciesList: FC<{ species: SpeciesResult[]; gridSquare: string; locationLabel?: string }> = ({
  species,
  gridSquare,
  locationLabel,
}) => {
  const [query, setQuery] = useState('');

  const sorted = [...species].sort((a, b) => b.likelihood - a.likelihood);
  const filtered = query.trim() === '' ? sorted : sorted.filter(s => s.commonName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* List header */}
      <div
        style={{
          background: '#f5f0e4',
          padding: '12px 16px 10px',
          borderBottom: '1px solid rgba(28,46,30,.06)',
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
              color: '#1c2e1e',
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
              color: '#6a9a78',
              marginTop: 2,
            }}
          >
            {species.length} plausible for this area
            {locationLabel && (
              <span style={{ marginLeft: 6, color: '#1c2e1e', fontWeight: 600 }}>
                · {locationLabel}
              </span>
            )}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 9,
            color: '#a0b8a0',
            textTransform: 'uppercase',
            letterSpacing: '.1em',
          }}
        >
          by likelihood
        </div>
      </div>

      {/* Search filter input */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(28,46,30,.06)', background: '#f5f0e4', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Filter by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box' as const,
            background: '#e8d8c0',
            border: '1px solid rgba(28,46,30,.1)',
            borderRadius: 8,
            padding: '7px 12px',
            fontFamily: 'Outfit,sans-serif',
            fontSize: 13,
            color: '#1c2e1e',
            outline: 'none',
          }}
        />
      </div>

      {/* Scrollable species list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 12,
              color: '#6a9a78',
            }}
          >
            {query.trim() !== '' ? `No matches for '${query}'` : 'No species recorded nearby'}
          </div>
        ) : (
          filtered.map((s) => (
            <SpeciesCard key={s.id} species={s} gridSquare={gridSquare} />
          ))
        )}
      </div>
    </div>
  );
};

export default SpeciesList;
