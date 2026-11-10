type BadgeTone = 'blue' | 'emerald' | 'slate' | 'red' | 'sky';

interface StatusBadgeProps {
  readonly label: string;
  readonly tone?: BadgeTone;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: 'border-blue-500/30 bg-blue-950/70 text-blue-300',
  sky: 'border-sky-500/30 bg-sky-950/70 text-sky-300',
  emerald: 'border-emerald-500/30 bg-emerald-950/60 text-emerald-300',
  slate: 'border-slate-700 bg-slate-900 text-slate-300',
  red: 'border-red-500/30 bg-red-950/60 text-red-300',
};

/**
 * Compact status pill using dark-theme-friendly semantic colors.
 */
export function StatusBadge({ label, tone = 'blue' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
