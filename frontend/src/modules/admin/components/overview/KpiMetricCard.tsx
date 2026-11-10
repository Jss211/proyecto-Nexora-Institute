import type { LucideIcon } from 'lucide-react';

interface KpiMetricCardProps {
  readonly label: string;
  readonly value: number | string;
  readonly subtext: string;
  readonly badgeText: string;
  readonly badgeTone?: 'positive' | 'neutral' | 'alert';
  readonly icon: LucideIcon;
  readonly delayMs?: number;
}

const BADGE_CLASSES = {
  positive: 'border-emerald-500/25 bg-emerald-950/60 text-emerald-300',
  neutral: 'border-blue-500/30 bg-blue-950/70 text-blue-300',
  alert: 'border-red-500/25 bg-red-950/60 text-red-300',
} as const;

/**
 * Enterprise KPI metric card with crisp SVG iconography and dark-blue styling.
 */
export function KpiMetricCard({
  label,
  value,
  subtext,
  badgeText,
  badgeTone = 'positive',
  icon: Icon,
  delayMs = 0,
}: KpiMetricCardProps) {
  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className="group relative overflow-hidden rounded-2xl border border-blue-950/90 bg-[#060c18]/95 p-5 transition-all duration-300 animate-fade-up hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-[0_16px_36px_-14px_rgba(37,99,235,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-800/70 bg-blue-950/80 text-blue-400 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_CLASSES[badgeTone]}`}
        >
          {badgeText}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-[11px] text-slate-500">{subtext}</p>
    </div>
  );
}
