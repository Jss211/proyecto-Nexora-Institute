import { ArrowRight } from 'lucide-react';
import type {
  EnrollmentStatus,
  RecentEnrollmentSummary,
} from '../../types/admin.types';

interface RecentEnrollmentsTableProps {
  readonly enrollments: readonly RecentEnrollmentSummary[];
  readonly totalActiveCount: number;
  readonly onViewAll: () => void;
}

const STATUS_STYLE_MAP: Record<
  EnrollmentStatus,
  { readonly label: string; readonly className: string }
> = {
  ACTIVE: { label: 'Activa', className: 'text-emerald-400' },
  COMPLETED: { label: 'Completada', className: 'text-blue-400' },
  DROPPED: { label: 'Retirada', className: 'text-red-400' },
};

const AVATAR_TONES = [
  'bg-blue-600 text-white',
  'bg-sky-600 text-white',
  'bg-blue-800 text-blue-100',
  'bg-slate-700 text-white',
] as const;

/**
 * Displays the latest student course enrollments with initials avatars and status.
 */
export function RecentEnrollmentsTable({
  enrollments,
  totalActiveCount,
  onViewAll,
}: RecentEnrollmentsTableProps) {
  return (
    <div className="rounded-2xl border border-blue-950/90 bg-[#060c18]/95 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Matrículas Recientes
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Últimos registros &middot; {totalActiveCount} activas en curso
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-900/70 bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:border-blue-500 hover:text-white"
        >
          Ver todas
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="pb-2.5 font-medium">Código</th>
              <th className="pb-2.5 font-medium">Estudiante</th>
              <th className="pb-2.5 font-medium">Curso</th>
              <th className="pb-2.5 font-medium">Carrera</th>
              <th className="pb-2.5 font-medium">Fecha</th>
              <th className="pb-2.5 text-right font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {enrollments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-xs text-slate-500"
                >
                  Aún no hay matrículas registradas.
                </td>
              </tr>
            ) : (
              enrollments.map((item, idx) => {
                const statusMeta = STATUS_STYLE_MAP[item.status];
                const avatarClass = AVATAR_TONES[idx % AVATAR_TONES.length];
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-blue-950/20"
                  >
                    <td className="py-3 text-xs font-mono text-slate-400">
                      {item.studentCode}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${avatarClass}`}
                        >
                          {item.studentInitials}
                        </span>
                        <span className="font-medium text-white">
                          {item.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-slate-300">
                      {item.courseName}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex rounded-md border border-blue-950 bg-[#0b1324] px-2 py-0.5 text-[11px] text-slate-300">
                        {item.programName}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-400">
                      {new Date(item.enrolledAt).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td
                      className={`py-3 text-right text-xs font-semibold ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
