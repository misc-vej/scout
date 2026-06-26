'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { SpeciesResult } from '@/types/discovery';
import RarityBadge from './RarityBadge';

function formatMMDD(mmdd: string): string {
  const [month, day] = mmdd.split('-').map(Number);
  return new Date(2000, month - 1, day).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

const SpeciesCard: FC<{ species: SpeciesResult; gridSquare: string }> = ({ species, gridSquare }) => {
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

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
    onSuccess: (data) => {
      const msg = data.firstSighting
        ? 'Logged! Card unlocked'
        : `Logged again! (${data.sightingCount}x spotted)`;
      setConfirmMsg(msg);
      setTimeout(() => setConfirmMsg(null), 1800);
    },
  });

  return (
    <div className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
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
      <div className="mt-3 flex justify-end">
        {species.isSeasonLocked ? (
          <div className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-500 cursor-not-allowed">
            {species.seasonUnlocksAt ? `Unavailable until ${formatMMDD(species.seasonUnlocksAt)}` : 'Unavailable this season'}
          </div>
        ) : confirmMsg ? (
          <span className="text-xs font-semibold text-green-400">{confirmMsg}</span>
        ) : (
          <button
            onClick={() => logMutation.mutate()}
            disabled={logMutation.isPending}
            className="rounded-md bg-green-600/20 px-3 py-1 text-xs font-semibold text-green-400 hover:bg-green-600/40 disabled:opacity-50 transition-colors"
          >
            {logMutation.isPending ? 'Logging…' : 'Log sighting'}
          </button>
        )}
      </div>
      {logMutation.isError && (
        <p className="mt-1 text-xs text-red-400">Failed to log — try again</p>
      )}
    </div>
  );
};

export default SpeciesCard;
