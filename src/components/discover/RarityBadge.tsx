import type { FC } from 'react';

const tierColors: Record<string, string> = {
  common: 'text-gray-400 bg-gray-400/10',
  uncommon: 'text-green-500 bg-green-500/10',
  rare: 'text-blue-500 bg-blue-500/10',
  super_rare: 'text-purple-500 bg-purple-500/10',
  legendary: 'text-orange-500 bg-orange-500/10',
  mythic: 'text-red-500 bg-red-500/10',
};

function formatTier(tier: string): string {
  return tier.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const RarityBadge: FC<{ tier: string }> = ({ tier }) => {
  const colorClass = tierColors[tier] ?? 'text-gray-400 bg-gray-400/10';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
      {formatTier(tier)}
    </span>
  );
};

export default RarityBadge;
