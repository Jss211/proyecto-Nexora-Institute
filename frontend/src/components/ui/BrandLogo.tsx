interface BrandLogoProps {
  readonly compact?: boolean;
}

/**
 * Brand lockup for Nexora Institute using dark-blue, black, and white tones.
 */
export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-3.5 animate-fade-in">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-950 shadow-[0_0_28px_rgba(37,99,235,0.45)] transition-transform duration-300 hover:scale-105">
        <span className="text-xl font-bold tracking-tight text-white">N</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl bg-blue-400/20 blur-md animate-glow-pulse"
        />
      </div>

      <div className="text-left">
        <span
          className={`block font-bold tracking-tight text-white ${
            compact ? 'text-lg' : 'text-xl sm:text-2xl'
          }`}
        >
          Nexora Institute
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300/80">
          Sistema de Gestión Académica
        </span>
      </div>
    </div>
  );
}
