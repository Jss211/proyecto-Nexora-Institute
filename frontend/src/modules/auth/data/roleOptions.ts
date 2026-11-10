import type { RoleOption } from '../../../types/auth.types';

/**
 * Role card configuration displayed on the Nexora Institute portal entrance.
 */
export const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    role: 'ADMIN',
    title: 'Administrador',
    description: 'Acceso completo al sistema administrativo y académico del instituto',
    badgeLabel: 'Gestión Integral',
    accentClass: 'border-blue-500/30 bg-blue-950/70',
    iconColorClass: 'text-blue-400',
    animationDelayMs: 120,
  },
  {
    role: 'TEACHER',
    title: 'Docente',
    description: 'Gestión de cursos asignados, calificaciones y control de asistencia',
    badgeLabel: 'Portal Académico',
    accentClass: 'border-sky-500/30 bg-sky-950/60',
    iconColorClass: 'text-sky-400',
    animationDelayMs: 220,
  },
  {
    role: 'STUDENT',
    title: 'Estudiante',
    description: 'Consulta de calificaciones, horarios de clase y estado de matrículas',
    badgeLabel: 'Portal Estudiantil',
    accentClass: 'border-blue-400/25 bg-slate-900/80',
    iconColorClass: 'text-blue-300',
    animationDelayMs: 320,
  },
];
