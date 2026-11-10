import { ArrowRight } from 'lucide-react';
import type { RoleOption, UserRole } from '../../../types/auth.types';
import { RoleIcon } from './RoleIcon';

interface RoleCardProps {
  readonly option: RoleOption;
  readonly onSelect: (role: UserRole) => void;
}

/**
 * Interactive dark-blue/black card representing one of the three institute roles.
 */
export function RoleCard({ option, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.role)}
      style={{ animationDelay: `${option.animationDelayMs}ms` }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-blue-950/90 bg-[#060b16]/90 p-6 text-left backdrop-blur-md transition-all duration-300 ease-out animate-fade-up hover:-translate-y-1.5 hover:border-blue-500/60 hover:bg-[#081226] hover:shadow-[0_20px_45px_-15px_rgba(37,99,235,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02040a]"
    >
      {/* Top subtle blue shimmer line on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div>
        <div
          className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 group-hover:border-blue-400/50 ${option.accentClass}`}
        >
          <RoleIcon role={option.role} className={`h-5 w-5 ${option.iconColorClass}`} />
        </div>

        <h2 className="text-base font-semibold tracking-tight text-white transition-colors duration-200 group-hover:text-blue-100">
          {option.title}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {option.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 transition-colors duration-200 group-hover:text-blue-300/80">
          {option.badgeLabel}
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 opacity-0 -translate-x-1.5 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          Ingresar
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
