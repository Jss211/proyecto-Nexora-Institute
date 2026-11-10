import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  readonly label: string;
  readonly value: number | string;
  readonly icon: LucideIcon;
  readonly hint?: string;
  readonly delayMs?: number;
}

/**
 * Reusable KPI metric card for dark-blue/black dashboard views.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delayMs = 0,
}: StatCardProps) {
  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className="group relative overflow-hidden rounded-2xl border border-blue-950/90 bg-[#060c18]/90 p-5 transition-all duration-300 animate-fade-up hover:-translate-y-0.5 hover:border-blue-600/50 hover:shadow-[0_14px_32px_-14px_rgba(37,99,235,0.35)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-blue-300/75">{hint}</p>}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-950/70 text-blue-400 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
