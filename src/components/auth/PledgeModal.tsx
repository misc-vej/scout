'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function PledgeModal() {
  const [accepted, setAccepted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/pledge/accept', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to record pledge');
      return res.json();
    },
    onSuccess: () => setAccepted(true),
  });

  if (accepted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 shadow-2xl">
        <h2 className="mb-1 text-xl font-bold text-white">The Scout&apos;s Pledge</h2>
        <p className="mb-6 text-sm text-gray-400">Before you start collecting, please commit to responsible spotting.</p>
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300 leading-relaxed">
          I promise to observe wildlife without disturbing it. I will keep a safe distance,
          never touch nests or young, stay on paths, and follow the Wildlife &amp; Countryside
          Act 1981. If I see something rare, I&apos;ll keep the location to myself.
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Saving…' : 'I Accept the Pledge'}
        </button>
      </div>
    </div>
  );
}
