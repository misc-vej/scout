const SENSITIVITY_STYLES = {
  caution:    'bg-amber-900/80 text-amber-300',
  sensitive:  'bg-orange-900/80 text-orange-300',
  restricted: 'bg-red-900/80 text-red-300',
} as const;

const SENSITIVITY_LABELS = {
  caution:    'Handle with care',
  sensitive:  'Sensitive species',
  restricted: 'Location restricted',
} as const;

export function SensitivityBadge({ level }: { level: string }) {
  if (level === 'none' || !(level in SENSITIVITY_STYLES)) return null;
  const key = level as keyof typeof SENSITIVITY_STYLES;
  return (
    <span className={`${SENSITIVITY_STYLES[key]} text-[10px] font-semibold px-1.5 py-0.5 rounded`}>
      {SENSITIVITY_LABELS[key]}
    </span>
  );
}
