'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { SpeciesResult } from '@/types/discovery';
import { getRarityConfig } from '@/lib/rarity';
import { AnimalIcon } from '@/components/shared/AnimalIcon';

// ---------------------------------------------------------------------------
// SpeciesRow
// ---------------------------------------------------------------------------

function SpeciesRow({
  sp,
  gridSquare,
  onLog,
}: {
  sp: SpeciesResult;
  gridSquare: string;
  onLog: (sp: SpeciesResult) => void;
}) {
  const rarityConfig = getRarityConfig(sp.rarityTier);
  const [hovered, setHovered] = useState(false);
  const iconColor = 'rgba(255,255,255,0.7)';

  const isSensitive =
    sp.sensitivityLevel === 'sensitive' || sp.sensitivityLevel === 'restricted';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 16px',
        borderBottom: '1px solid rgba(28,46,30,.06)',
        background: hovered ? 'rgba(42,122,72,.04)' : 'transparent',
        transition: 'background .1s',
        cursor: 'default',
        animation: 'row-in 0.3s ease both',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Mini card thumbnail */}
      <div
        style={{
          width: 44,
          height: 62,
          flexShrink: 0,
          borderRadius: 8,
          border: `2px solid ${rarityConfig.borderColor}`,
          background: rarityConfig.artBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: rarityConfig.glowAnimation !== 'none' ? rarityConfig.glowAnimation : undefined,
          position: 'relative',
          overflow: 'hidden',
          ...(sp.imageUrl ? {
            backgroundImage: `url(${sp.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}),
        }}
      >
        {!sp.imageUrl && (
          <div style={{ width: '80%', height: '80%', opacity: 0.8 }}>
            <AnimalIcon type={sp.speciesType ?? 'bird'} color={iconColor} />
          </div>
        )}
      </div>

      {/* Info block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#1c2e1e',
            textTransform: 'uppercase',
            letterSpacing: '.03em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: 2,
          }}
        >
          {sp.commonName}
        </div>
        <div
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 9,
            color: '#6a9a78',
            fontStyle: 'italic',
            marginBottom: 5,
          }}
        >
          {sp.scientificName}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 5,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Tier chip */}
          <span
            style={{
              background: `${rarityConfig.borderColor}18`,
              border: `1px solid ${rarityConfig.borderColor}30`,
              fontFamily: 'Outfit, sans-serif',
              fontSize: 8,
              color: rarityConfig.borderColor,
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 20,
            }}
          >
            {rarityConfig.label}
          </span>
          {/* Habitat chip */}
          <span
            style={{
              background: 'rgba(42,122,72,.08)',
              border: '1px solid rgba(42,122,72,.15)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 8,
              color: '#2a7a48',
              padding: '2px 7px',
              borderRadius: 20,
            }}
          >
            {sp.taxonomyGroup ?? 'Wildlife'}
          </span>
          {/* Sensitive chip */}
          {isSensitive && (
            <span
              style={{
                background: 'rgba(240,192,64,.1)',
                border: '1px solid rgba(240,192,64,.18)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 8,
                color: '#c8a020',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 20,
              }}
            >
              ⚠ Sensitive
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div
        style={{
          flexShrink: 0,
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6,
        }}
      >
        {/* Likelihood bar */}
        <div
          style={{
            width: 40,
            height: 3,
            background: 'rgba(28,46,30,.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${sp.likelihood * 100}%`,
              background: rarityConfig.borderColor,
              opacity: 0.7,
              borderRadius: 2,
            }}
          />
        </div>

        {sp.isSeasonLocked ? (
          <div
            style={{
              background: 'rgba(28,46,30,.06)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 8,
              color: '#a0b8a0',
              padding: '4px 8px',
              borderRadius: 12,
            }}
          >
            Unavailable
          </div>
        ) : (
          <button
            onClick={() => onLog(sp)}
            style={{
              background: '#2a7a48',
              color: '#f5f0e4',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 9,
              fontWeight: 700,
              padding: '5px 11px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '.04em',
            }}
          >
            I saw it
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LogModal
// ---------------------------------------------------------------------------

const PERSONALITIES = ['Brave', 'Sneaky', 'Chill', 'Grumpy', 'Curious', 'Dramatic', 'Wise', 'Chaotic'] as const;

function LogModal({
  species,
  gridSquare,
  onClose,
  onSuccess,
}: {
  species: SpeciesResult;
  gridSquare: string;
  onClose: () => void;
  onSuccess: (personality: string) => void;
}) {
  const rarityConfig = getRarityConfig(species.rarityTier);
  const [chosen, setChosen] = useState<string | null>(null);

  const logMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speciesId: species.id, gridSquare }),
      });
      if (!res.ok) throw new Error('Failed to log sighting');
      return res.json() as Promise<{ sightingCount: number; firstSighting: boolean }>;
    },
    onSuccess: async (data) => {
      // If first sighting, also set personality via PATCH
      if (data.firstSighting && chosen) {
        try {
          await fetch(`/api/collections/${species.id}/personality`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trait: chosen }),
          });
        } catch {
          // Non-fatal — personality PATCH failure does not block success banner
        }
      }
      onSuccess(chosen ?? '');
    },
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.85)',
        zIndex: 200,
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
          border: `3px solid ${rarityConfig.borderColor}`,
          borderBottom: 'none',
          paddingBottom: 'env(safe-area-inset-bottom, 20px)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div
            style={{
              width: 36,
              height: 4,
              background: 'rgba(28,46,30,.08)',
              borderRadius: 2,
            }}
          />
        </div>

        <div style={{ padding: '16px 20px 20px' }}>
          {/* "You spotted" label */}
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 9,
              color: '#6a9a78',
              textTransform: 'uppercase',
              letterSpacing: '.14em',
              marginBottom: 4,
            }}
          >
            You spotted
          </div>

          {/* Species name */}
          <div
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 26,
              fontWeight: 800,
              color: '#1c2e1e',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              lineHeight: 1,
            }}
          >
            {species.commonName}
          </div>

          {/* Latin name */}
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 10,
              color: '#6a9a78',
              fontStyle: 'italic',
              marginTop: 3,
              marginBottom: 16,
            }}
          >
            {species.scientificName}
          </div>

          {/* Prompt box */}
          <div
            style={{
              background: 'rgba(42,122,72,.05)',
              border: '1px solid rgba(42,122,72,.1)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 10,
                color: '#2a7a48',
                lineHeight: 1.65,
              }}
            >
              How did it seem to you? Give it a personality — your read, not the app&apos;s.
            </div>
          </div>

          {/* Personality chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 20,
            }}
          >
            {PERSONALITIES.map((p) => (
              <button
                key={p}
                onClick={() => setChosen(p)}
                style={{
                  background: chosen === p ? 'rgba(184,120,232,.22)' : 'rgba(184,120,232,.08)',
                  border:
                    chosen === p
                      ? '1px solid rgba(184,120,232,.5)'
                      : '1px solid rgba(184,120,232,.15)',
                  borderRadius: 20,
                  padding: '6px 13px',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 10,
                  fontWeight: 600,
                  color: chosen === p ? '#b878e8' : '#5a3a7a',
                  transition: 'all .12s',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Confirm CTA */}
          <button
            onClick={() => {
              if (chosen && !logMutation.isPending) {
                logMutation.mutate();
              }
            }}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 14,
              border: 'none',
              cursor: chosen ? 'pointer' : 'default',
              background: chosen ? '#2a7a48' : 'rgba(42,122,72,.08)',
              fontFamily: 'Syne, sans-serif',
              fontSize: 15,
              fontWeight: 800,
              color: chosen ? '#f5f0e4' : '#6a9a78',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              transition: 'all .15s',
              marginBottom: 4,
              opacity: logMutation.isPending ? 0.6 : 1,
            }}
          >
            {logMutation.isPending
              ? 'Logging…'
              : chosen
              ? `Log ${species.commonName}`
              : 'Pick a personality first'}
          </button>

          {logMutation.isError && (
            <div
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 10,
                color: '#c84040',
                marginTop: 6,
                textAlign: 'center',
              }}
            >
              Failed to log — try again
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConfirmBanner
// ---------------------------------------------------------------------------

function ConfirmBanner({
  species,
  personality,
  onClose,
}: {
  species: SpeciesResult;
  personality: string;
  onClose: () => void;
}) {
  const rarityConfig = getRarityConfig(species.rarityTier);

  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        width: 'calc(100% - 32px)',
        maxWidth: 358,
      }}
    >
      <div
        style={{
          background: '#f5f0e4',
          border: `2px solid ${rarityConfig.borderColor}`,
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: `0 8px 32px rgba(0,0,0,.6), 0 0 20px ${rarityConfig.borderColor}33`,
        }}
      >
        {/* Mini thumbnail */}
        <div
          style={{
            width: 40,
            height: 56,
            borderRadius: 8,
            border: `2px solid ${rarityConfig.borderColor}`,
            background: rarityConfig.artBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            ...(species.imageUrl ? {
              backgroundImage: `url(${species.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {}),
          }}
        >
          {!species.imageUrl && (
            <AnimalIcon
              type={species.speciesType ?? 'bird'}
              color={rarityConfig.borderColor + '66'}
            />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 9,
              color: '#2a7a48',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              marginBottom: 2,
            }}
          >
            Logged ✓
          </div>
          <div
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 14,
              fontWeight: 800,
              color: '#1c2e1e',
              textTransform: 'uppercase',
              letterSpacing: '.04em',
            }}
          >
            {species.commonName}
          </div>
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 9,
              color: '#b878e8',
              marginTop: 2,
            }}
          >
            &ldquo;{personality}&rdquo; added to your Logbook
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export: SpeciesCard (wrapper — keeps backwards-compatible name)
// ---------------------------------------------------------------------------

export default function SpeciesCard({
  species,
  gridSquare,
}: {
  species: SpeciesResult;
  gridSquare: string;
}) {
  const [logTarget, setLogTarget] = useState<SpeciesResult | null>(null);
  const [confirmed, setConfirmed] = useState<{ personality: string } | null>(null);

  return (
    <>
      <SpeciesRow sp={species} gridSquare={gridSquare} onLog={setLogTarget} />
      {logTarget && (
        <LogModal
          species={logTarget}
          gridSquare={gridSquare}
          onClose={() => setLogTarget(null)}
          onSuccess={(p) => {
            setConfirmed({ personality: p });
            setLogTarget(null);
          }}
        />
      )}
      {confirmed && (
        <ConfirmBanner
          species={species}
          personality={confirmed.personality}
          onClose={() => setConfirmed(null)}
        />
      )}
    </>
  );
}
