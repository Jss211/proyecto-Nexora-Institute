import { ArrowRight, Users } from 'lucide-react';
import type { ActiveSectionSummary } from '../../types/admin.types';

interface ActiveClassesCardProps {
  readonly sections: readonly ActiveSectionSummary[];
  readonly onViewSchedule: () => void;
}

/**
 * Displays active institute sections with schedule, teacher, classroom, and occupancy.
 */
export function ActiveClassesCard({
  sections,
  onViewSchedule,
}: ActiveClassesCardProps) {
  return (
    <div className="rounded-2xl border border-blue-950/90 bg-[#060c18]/95 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Secciones y Clases Programadas
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {sections.length} sección(es) activas en horario
          </p>
        </div>

        <button
          type="button"
          onClick={onViewSchedule}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Ver horario
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-2.5">
        {sections.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            Aún no hay secciones programadas.
          </p>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="flex flex-col gap-3 rounded-xl border border-white/5 bg-[#040812] px-4 py-3 transition-colors hover:border-blue-800/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="w-36 shrink-0 text-xs font-semibold text-blue-400">
                  {section.schedule}
                </span>

                <span
                  aria-hidden="true"
                  className="hidden h-8 w-0.5 rounded-full bg-blue-600/80 sm:block"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    {section.courseName}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      (Sec. {section.code})
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {section.teacherName} &middot; {section.classroom}
                  </p>
                </div>
              </div>

              <div className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-blue-900/70 bg-blue-950/50 px-2.5 py-1 text-xs font-medium text-blue-200 sm:self-auto">
                <Users className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                {section.enrolledCount}/{section.capacity}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
