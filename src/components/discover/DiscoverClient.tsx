'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { SpeciesResult } from '@/types/discovery';
import SpeciesList from './SpeciesList';
import { AnimalIcon } from '@/components/shared/AnimalIcon';
import { getRarityConfig } from '@/lib/rarity';

async function fetchSpeciesForGrid(gridSquare: string): Promise<SpeciesResult[]> {
  const res = await fetch('/api/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gridSquare }),
  });
  if (!res.ok) throw new Error('Could not load nearby species');
  return res.json() as Promise<SpeciesResult[]>;
}

// ---------------------------------------------------------------------------
// QuickLogModal
// ---------------------------------------------------------------------------

const PERSONALITIES = ['Brave', 'Sneaky', 'Chill', 'Grumpy', 'Curious', 'Dramatic', 'Wise', 'Chaotic'] as const;

function QuickLogModal({
  species: sp,
  gridSquare,
  onClose,
  onSuccess,
}: {
  species: SpeciesResult;
  gridSquare: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cfg = getRarityConfig(sp.rarityTier);

  async function handleLog() {
    if (!chosen) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speciesId: sp.id, gridSquare }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json() as { firstSighting: boolean };
      if (data.firstSighting && chosen) {
        await fetch(`/api/collections/${sp.id}/personality`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trait: chosen }),
        }).catch(() => {});
      }
      onSuccess();
    } catch {
      setErr('Failed to log — try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          background: '#f5f0e4',
          borderRadius: '20px 20px 0 0',
          border: `3px solid ${cfg.borderColor}`,
          borderBottom: 'none',
          paddingBottom: 'env(safe-area-inset-bottom, 20px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, background: 'rgba(28,46,30,.08)', borderRadius: 2 }} />
        </div>
        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 9, color: '#6a9a78', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 4 }}>
            You spotted
          </div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#1c2e1e', textTransform: 'uppercase', letterSpacing: '.05em', lineHeight: 1, marginBottom: 4 }}>
            {sp.commonName}
          </div>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 10, color: '#6a9a78', fontStyle: 'italic', marginBottom: 16 }}>
            {sp.scientificName}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {PERSONALITIES.map((p) => (
              <button
                key={p}
                onClick={() => setChosen(p)}
                style={{
                  background: chosen === p ? 'rgba(184,120,232,.22)' : 'rgba(184,120,232,.08)',
                  border: chosen === p ? '1px solid rgba(184,120,232,.5)' : '1px solid rgba(184,120,232,.15)',
                  borderRadius: 20,
                  padding: '6px 13px',
                  cursor: 'pointer',
                  fontFamily: 'Outfit,sans-serif',
                  fontSize: 10,
                  fontWeight: 600,
                  color: chosen === p ? '#b878e8' : '#5a3a7a',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={handleLog}
            disabled={!chosen || loading}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 14,
              border: 'none',
              cursor: chosen && !loading ? 'pointer' : 'default',
              background: chosen ? '#2a7a48' : 'rgba(42,122,72,.08)',
              fontFamily: 'Syne,sans-serif',
              fontSize: 15,
              fontWeight: 800,
              color: chosen ? '#f5f0e4' : '#6a9a78',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            {loading ? 'Logging…' : chosen ? `Log ${sp.commonName}` : 'Pick a personality first'}
          </button>
          {err && <div style={{ fontSize: 10, color: '#c84040', textAlign: 'center', marginTop: 6 }}>{err}</div>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AllSpeciesModal
// ---------------------------------------------------------------------------

function AllSpeciesModal({
  gridSquare,
  onClose,
}: {
  gridSquare: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [allSpecies, setAllSpecies] = useState<SpeciesResult[]>([]);
  const [query, setQuery] = useState('');
  const [logTarget, setLogTarget] = useState<SpeciesResult | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/species')
      .then((r) => r.json())
      .then((data) => setAllSpecies(data as SpeciesResult[]))
      .catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const filtered =
    query.trim() === ''
      ? allSpecies
      : allSpecies.filter((s) =>
          s.commonName.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          height: '80vh',
          background: '#f5f0e4',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid rgba(28,46,30,.06)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 15,
              fontWeight: 800,
              color: '#1c2e1e',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              marginBottom: 10,
            }}
          >
            Spotted something else?
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all UK species…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#e8d8c0',
              border: '1px solid rgba(28,46,30,.12)',
              borderRadius: 10,
              padding: '9px 14px',
              fontFamily: 'Outfit,sans-serif',
              fontSize: 13,
              color: '#1c2e1e',
              outline: 'none',
            }}
          />
        </div>
        {/* Species list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontFamily: 'Outfit,sans-serif',
                fontSize: 12,
                color: '#6a9a78',
              }}
            >
              {query ? `No matches for '${query}'` : 'Loading species…'}
            </div>
          ) : (
            filtered.map((sp) => {
              const cfg = getRarityConfig(sp.rarityTier);
              return (
                <div
                  key={sp.id}
                  onClick={() => !sp.isSeasonLocked && setLogTarget(sp)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 20px',
                    borderBottom: '1px solid rgba(28,46,30,.05)',
                    cursor: sp.isSeasonLocked ? 'default' : 'pointer',
                    opacity: sp.isSeasonLocked ? 0.45 : 1,
                  }}
                >
                  {/* Mini thumbnail */}
                  <div
                    style={{
                      width: 36,
                      height: 50,
                      borderRadius: 6,
                      border: `1.5px solid ${cfg.borderColor}`,
                      background: cfg.artBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      ...(sp.imageUrl
                        ? { backgroundImage: `url(${sp.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : {}),
                    }}
                  >
                    {!sp.imageUrl && (
                      <div style={{ width: '80%', height: '80%', opacity: 0.7 }}>
                        <AnimalIcon type={sp.speciesType ?? 'bird'} color={cfg.borderColor + '88'} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'Syne,sans-serif',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#1c2e1e',
                        textTransform: 'uppercase',
                        letterSpacing: '.03em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sp.commonName}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Outfit,sans-serif',
                        fontSize: 9,
                        color: '#6a9a78',
                        fontStyle: 'italic',
                      }}
                    >
                      {sp.scientificName}
                    </div>
                  </div>
                  {!sp.isSeasonLocked && (
                    <button
                      style={{
                        background: '#2a7a48',
                        color: '#f5f0e4',
                        border: 'none',
                        borderRadius: 20,
                        padding: '5px 12px',
                        fontFamily: 'Outfit,sans-serif',
                        fontSize: 9,
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                        letterSpacing: '.04em',
                      }}
                    >
                      I saw it
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QuickLogModal rendered OUTSIDE the overflow:hidden inner div to avoid iOS Safari
          fixed-position clipping. stopPropagation wrapper prevents backdrop tap from
          also firing AllSpeciesModal's onClose. */}
      {logTarget && (
        <div onClick={(e) => e.stopPropagation()}>
          <QuickLogModal
            species={logTarget}
            gridSquare={gridSquare}
            onClose={() => setLogTarget(null)}
            onSuccess={() => {
              setConfirmed(logTarget.commonName);
              setLogTarget(null);
              router.refresh();
            }}
          />
        </div>
      )}
      {confirmed && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2a7a48',
            color: '#f5f0e4',
            borderRadius: 12,
            padding: '10px 20px',
            fontFamily: 'Outfit,sans-serif',
            fontSize: 13,
            fontWeight: 600,
            zIndex: 500,
          }}
        >
          ✓ {confirmed} logged
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DiscoverClient
// ---------------------------------------------------------------------------

export default function DiscoverClient() {
  const [postcode, setPostcode] = useState('');
  const [showAllSpecies, setShowAllSpecies] = useState(false);

  const gpsMutation = useMutation({
    mutationFn: async () => {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const gridRes = await fetch('/api/discover/grid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude }),
      });
      if (!gridRes.ok) throw new Error('Could not determine your grid square');
      const { gridSquare } = await gridRes.json() as { gridSquare: string };
      const speciesData = await fetchSpeciesForGrid(gridSquare);
      return { gridSquare, species: speciesData };
    },
  });

  const postcodeMutation = useMutation({
    mutationFn: async (pc: string) => {
      const pcRes = await fetch('/api/discover/postcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode: pc }),
      });
      if (!pcRes.ok) {
        const err = await pcRes.json() as { error?: string };
        throw new Error(err.error ?? 'Postcode not found');
      }
      const { gridSquare } = await pcRes.json() as { gridSquare: string };
      const speciesData = await fetchSpeciesForGrid(gridSquare);
      return { gridSquare, species: speciesData };
    },
  });

  const active = gpsMutation.isPending || gpsMutation.isSuccess || gpsMutation.isError
    ? gpsMutation
    : postcodeMutation;

  const isLoading = active.isPending;
  const result = active.isSuccess ? active.data : null;
  const error = active.isError ? (active.error as Error).message : null;

  function reset() {
    gpsMutation.reset();
    postcodeMutation.reset();
    setPostcode('');
    setShowAllSpecies(false);
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          height: 'calc(100vh - 60px)',
          background: '#f5f0e4',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: '2.5px solid rgba(42,122,72,.15)',
            borderTopColor: '#2a7a48',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
          }}
        />
        <div
          style={{
            fontFamily: 'Outfit,sans-serif',
            fontSize: 12,
            color: '#a0b8a0',
            letterSpacing: '.04em',
          }}
        >
          Finding wildlife nearby…
        </div>
      </div>
    );
  }

  const locationLabel = gpsMutation.isSuccess
    ? 'Near your location'
    : postcodeMutation.isSuccess
    ? postcode.trim().toUpperCase()
    : undefined;

  if (result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <SpeciesList species={result.species} gridSquare={result.gridSquare} locationLabel={locationLabel} />
        {/* "Log unlisted animal" entry point */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(28,46,30,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setShowAllSpecies(true)}
            style={{
              fontFamily: 'Outfit,sans-serif',
              fontSize: 13,
              color: '#2a7a48',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 600,
            }}
          >
            Spotted something else? →
          </button>
          <button
            onClick={reset}
            style={{ fontFamily: 'Outfit,sans-serif', fontSize: 12, color: '#a0b8a0', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Search again
          </button>
        </div>
        {showAllSpecies && (
          <AllSpeciesModal
            gridSquare={result.gridSquare}
            onClose={() => setShowAllSpecies(false)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <style>{'.discover-postcode-input::placeholder{color:#6a9a78}'}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 60px)',
          padding: '0 24px',
          paddingBottom: '18vh',
        }}
      >
      {/* Hero header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#1c2e1e', letterSpacing: '.02em', lineHeight: 1.1 }}>
          What&apos;s out there?
        </div>
        <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#6a9a78', marginTop: 8, lineHeight: 1.5 }}>
          Share your location or enter a postcode to discover wildlife around you.
        </div>
      </div>

      {/* Controls */}
      <div>
        <button
          onClick={() => gpsMutation.mutate()}
          style={{ width: '100%', borderRadius: 10, background: '#2a7a48', color: '#f5f0e4', padding: '12px 24px', fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Use my location
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(28,46,30,.08)' }} />
          <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: '#6a9a78' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(28,46,30,.08)' }} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (postcode.trim()) postcodeMutation.mutate(postcode);
          }}
          style={{ display: 'flex' }}
        >
          <input
            type="text"
            placeholder="Enter postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="discover-postcode-input"
            style={{ flex: 1, borderRadius: '10px 0 0 10px', border: '1px solid rgba(28,46,30,.15)', background: '#e8d8c0', padding: '10px 16px', fontFamily: 'Outfit,sans-serif', fontSize: 14, color: '#1c2e1e', outline: 'none' }}
          />
          <button
            type="submit"
            style={{ borderRadius: '0 10px 10px 0', background: '#1c2e1e', color: '#f5f0e4', padding: '10px 18px', fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Search
          </button>
        </form>

        {error && (
          <p style={{ fontSize: 13, color: '#c84040', textAlign: 'center', marginTop: 16 }}>{error}</p>
        )}
      </div>
      </div>
    </>
  );
}
