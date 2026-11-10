import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly prefix?: string;
  readonly count?: number;
}

interface CustomSelectProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
  readonly icon?: LucideIcon;
  readonly ariaLabel?: string;
  readonly className?: string;
}

/**
 * Custom animated dark-blue/black dropdown replacing native OS select menus.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  icon: Icon,
  ariaLabel,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2 text-left text-sm transition-all duration-200 ${
          isOpen
            ? 'border-blue-500 bg-[#040916] text-white ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
            : 'border-blue-950 bg-[#03060f] text-slate-200 hover:border-blue-700/80 hover:text-white'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <Icon
              className="h-4 w-4 shrink-0 text-blue-400"
              aria-hidden="true"
            />
          )}
          {selectedOption?.prefix && (
            <span className="shrink-0 rounded-md border border-blue-800/70 bg-blue-950/70 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
              {selectedOption.prefix}
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-2 min-w-[240px] overflow-hidden rounded-xl border border-blue-800/75 bg-[#070e1d]/95 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-scale-in origin-top"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
          />

          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors duration-150 ${
                    isSelected
                      ? 'border border-blue-500/40 bg-blue-600/20 font-semibold text-white'
                      : 'border border-transparent text-slate-300 hover:bg-blue-950/75 hover:text-white'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {option.prefix && (
                      <span className="shrink-0 rounded border border-blue-900/70 bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                        {option.prefix}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </span>

                  <span className="flex shrink-0 items-center gap-2">
                    {typeof option.count === 'number' && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        {option.count}
                      </span>
                    )}
                    {isSelected && (
                      <Check
                        className="h-3.5 w-3.5 text-blue-400"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
