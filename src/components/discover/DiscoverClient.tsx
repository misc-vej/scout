'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { SpeciesResult } from '@/types/discovery';
import SpeciesList from './SpeciesList';

async function fetchSpeciesForGrid(gridSquare: string): Promise<SpeciesResult[]> {
  const res = await fetch('/api/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gridSquare }),
  });
  if (!res.ok) throw new Error('Could not load nearby species');
  return res.json() as Promise<SpeciesResult[]>;
}

export default function DiscoverClient() {
  const [postcode, setPostcode] = useState('');

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
  }

  if (isLoading) {
    return (
      <div>
        <p className="mb-4 text-center text-sm text-gray-500">Finding wildlife near you…</p>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <SpeciesList species={result.species} gridSquare={result.gridSquare} />
        <button
          onClick={reset}
          className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Search again
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => gpsMutation.mutate()}
        className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500 transition-colors"
      >
        Use my location
      </button>

      <div className="my-4 flex items-center gap-4">
        <hr className="flex-1 border-white/10" />
        <span className="text-sm text-gray-500">or</span>
        <hr className="flex-1 border-white/10" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (postcode.trim()) postcodeMutation.mutate(postcode);
        }}
        className="flex"
      >
        <input
          type="text"
          placeholder="Enter postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          className="flex-1 rounded-l-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
        />
        <button
          type="submit"
          className="rounded-r-lg bg-white/20 px-4 py-2 font-semibold text-white hover:bg-white/30 transition-colors"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
