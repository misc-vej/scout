'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

const TRAITS = ['Brave', 'Sneaky', 'Chill', 'Grumpy', 'Curious', 'Dramatic', 'Wise', 'Chaotic'] as const;
type Trait = typeof TRAITS[number];

export function PersonalityPicker({
  speciesId,
  currentTrait,
}: {
  speciesId: string;
  currentTrait: string | null;
}) {
  const [selected, setSelected] = useState<Trait | null>(currentTrait as Trait | null);

  const mutation = useMutation({
    mutationFn: async (trait: Trait) => {
      const res = await fetch(`/api/collections/${speciesId}/personality`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trait }),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json() as Promise<{ personalityTrait: string }>;
    },
    onSuccess: (data) => setSelected(data.personalityTrait as Trait),
  });

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500 mb-1">Personality</p>
      <div className="flex flex-wrap gap-1">
        {TRAITS.map((trait) => (
          <button
            key={trait}
            onClick={() => mutation.mutate(trait)}
            disabled={mutation.isPending}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
              selected === trait
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
            }`}
          >
            {trait}
          </button>
        ))}
      </div>
    </div>
  );
}
