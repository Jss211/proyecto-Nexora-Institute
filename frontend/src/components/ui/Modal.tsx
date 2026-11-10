import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly subtitle?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

/**
 * Accessible dark-obsidian modal dialog with Escape-to-close support.
 */
export function Modal({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-blue-900/70 bg-[#060c19] p-6 shadow-[0_24px_60px_-15px_rgba(15,42,92,0.7)] animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent"
        />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition-colors hover:border-blue-500/40 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
