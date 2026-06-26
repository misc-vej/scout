'use client';
import { useState } from 'react';

export function EthicsSection({ tips }: { tips: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 border-t border-white/10 pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-xs text-gray-500 hover:text-gray-400 transition-colors"
      >
        <span>Responsible spotting</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">{tips}</p>
      )}
    </div>
  );
}
