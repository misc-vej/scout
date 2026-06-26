const STATUS_STYLES = {
  red:   'bg-red-900/80 text-red-300',
  amber: 'bg-amber-900/80 text-amber-300',
  green: 'bg-green-900/80 text-green-300',
} as const;

const STATUS_LABELS = {
  red:   'BTO Red',
  amber: 'BTO Amber',
  green: 'BTO Green',
} as const;

export function ConservationBadge({ status }: { status: string | null }) {
  if (!status || !(status in STATUS_STYLES)) return null;
  const key = status as keyof typeof STATUS_STYLES;
  return (
    <span className={`${STATUS_STYLES[key]} text-[10px] font-semibold px-1.5 py-0.5 rounded`}>
      {STATUS_LABELS[key]}
    </span>
  );
}
