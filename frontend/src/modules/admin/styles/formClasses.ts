import type { UserRole } from '../../../types/auth.types';

export const ADMIN_INPUT_CLASS =
  'w-full rounded-xl border border-blue-950 bg-[#03060f] px-3.5 py-2 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export const ADMIN_LABEL_CLASS =
  'mb-1.5 block text-xs font-medium text-slate-300';

export const ADMIN_PRIMARY_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-200 hover:from-blue-500 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60';

export const ROLE_BADGE_MAP: Record<
  UserRole,
  { readonly label: string; readonly tone: 'blue' | 'sky' | 'slate' }
> = {
  ADMIN: { label: 'Administrador', tone: 'blue' },
  TEACHER: { label: 'Docente', tone: 'sky' },
  STUDENT: { label: 'Estudiante', tone: 'slate' },
};
