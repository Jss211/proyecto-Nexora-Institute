import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { AcademicPeriodItem } from '../../types/admin.types';

interface AcademicCalendarWidgetProps {
  readonly currentPeriod: AcademicPeriodItem | null;
}

const WEEKDAY_LABELS = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'] as const;
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

interface MilestoneEvent {
  readonly day: number;
  readonly month: number;
  readonly year: number;
  readonly label: string;
  readonly dateLabel: string;
  readonly dotColor: string;
}

function buildPeriodMilestones(
  period: AcademicPeriodItem | null,
): readonly MilestoneEvent[] {
  if (!period) return [];

  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const mid = new Date((start.getTime() + end.getTime()) / 2);

  const fmt = (d: Date) =>
    `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;

  return [
    {
      day: start.getDate(),
      month: start.getMonth(),
      year: start.getFullYear(),
      label: `Inicio de ${period.code}`,
      dateLabel: fmt(start),
      dotColor: 'bg-blue-400',
    },
    {
      day: mid.getDate(),
      month: mid.getMonth(),
      year: mid.getFullYear(),
      label: 'Evaluaciones Parciales',
      dateLabel: fmt(mid),
      dotColor: 'bg-sky-400',
    },
    {
      day: end.getDate(),
      month: end.getMonth(),
      year: end.getFullYear(),
      label: `Cierre de ${period.code}`,
      dateLabel: fmt(end),
      dotColor: 'bg-blue-500',
    },
  ];
}

/**
 * Interactive monthly calendar widget highlighting today and academic period milestones.
 */
export function AcademicCalendarWidget({
  currentPeriod,
}: AcademicCalendarWidgetProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());

  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const milestones = buildPeriodMilestones(currentPeriod);

  function goPreviousMonth(): void {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
      return;
    }
    setViewMonth((m) => m - 1);
  }

  function goNextMonth(): void {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
      return;
    }
    setViewMonth((m) => m + 1);
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-blue-950/90 bg-[#060c18]/95 p-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goPreviousMonth}
              aria-label="Mes anterior"
              className="rounded-lg border border-blue-950 bg-[#040812] p-1 text-slate-400 transition-colors hover:border-blue-600 hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Mes siguiente"
              className="rounded-lg border border-blue-950 bg-[#040812] p-1 text-slate-400 transition-colors hover:border-blue-600 hover:text-white"
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-500">
          {WEEKDAY_LABELS.map((day) => (
            <span key={day} className="py-1">
              {day}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
          {cells.map((day, idx) => {
            if (day === null) {
              return <span key={`empty-${idx}`} className="h-8" />;
            }

            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();

            const hasMilestone = milestones.some(
              (m) =>
                m.day === day && m.month === viewMonth && m.year === viewYear,
            );

            return (
              <div
                key={day}
                className={`relative flex h-8 items-center justify-center rounded-lg font-medium transition-colors ${
                  isToday
                    ? 'bg-blue-600 font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.6)]'
                    : 'text-slate-300 hover:bg-blue-950/50'
                }`}
              >
                {day}
                {hasMilestone && !isToday && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-sky-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-white/5 pt-4">
        {milestones.length === 0 ? (
          <p className="text-xs text-slate-500">
            Activa un periodo académico para visualizar hitos del ciclo.
          </p>
        ) : (
          milestones.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 text-xs text-slate-300"
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dotColor}`} />
              <span className="w-12 shrink-0 text-[11px] font-medium text-slate-400">
                {item.dateLabel}
              </span>
              <span className="truncate text-slate-200">{item.label}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
