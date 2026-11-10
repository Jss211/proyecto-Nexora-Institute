import { useState } from 'react';
import type { ProgramDistributionItem } from '../../types/admin.types';

interface ProgramsDistributionChartProps {
  readonly programs: readonly ProgramDistributionItem[];
}

const BLUE_SEGMENT_PALETTE = [
  '#2563eb',
  '#38bdf8',
  '#1d4ed8',
  '#60a5fa',
  '#0284c7',
  '#93c5fd',
] as const;

const DONUT_RADIUS = 52;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

/**
 * Interactive SVG donut chart showing active student distribution across institute programs.
 */
export function ProgramsDistributionChart({
  programs,
}: ProgramsDistributionChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalStudents = programs.reduce(
    (sum, item) => sum + item.studentCount,
    0,
  );
  const safeDenominator = Math.max(1, totalStudents);
  const hoveredProgram =
    hoveredIndex !== null ? programs[hoveredIndex] ?? null : null;

  let accumulatedOffset = 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-blue-950/90 bg-[#060c18]/95 p-6">
      <div>
        <h3 className="text-base font-semibold text-white">
          Distribución por Carrera
        </h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Estudiantes inscritos por programa
        </p>
      </div>

      <div className="relative my-5 flex items-center justify-center">
        <div className="relative h-36 w-36">
          <svg
            viewBox="0 0 140 140"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label="Gráfico circular de estudiantes por carrera"
          >
            <circle
              cx="70"
              cy="70"
              r={DONUT_RADIUS}
              fill="none"
              stroke="#0f172a"
              strokeWidth="18"
            />
            {totalStudents > 0 &&
              programs.map((program, index) => {
                const portion = program.studentCount / safeDenominator;
                const strokeLength = portion * DONUT_CIRCUMFERENCE;
                const gap = programs.length > 1 ? 3 : 0;
                const isHovered = hoveredIndex === index;
                const isDimmed = hoveredIndex !== null && !isHovered;

                const segment = (
                  <circle
                    key={program.id}
                    cx="70"
                    cy="70"
                    r={DONUT_RADIUS}
                    fill="none"
                    stroke={
                      BLUE_SEGMENT_PALETTE[index % BLUE_SEGMENT_PALETTE.length]
                    }
                    strokeWidth={isHovered ? '22' : '18'}
                    opacity={isDimmed ? 0.4 : 1}
                    strokeDasharray={`${Math.max(0, strokeLength - gap)} ${DONUT_CIRCUMFERENCE}`}
                    strokeDashoffset={-accumulatedOffset}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer transition-all duration-200"
                  />
                );
                accumulatedOffset += strokeLength;
                return segment;
              })}
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-white">
              {hoveredProgram ? hoveredProgram.studentCount : totalStudents}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              {hoveredProgram ? hoveredProgram.code : 'Alumnos'}
            </span>
          </div>
        </div>

        {/* Floating tooltip matching Image 4 */}
        {hoveredProgram && (
          <div className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-xl border border-blue-800/70 bg-[#070d1c]/95 px-3.5 py-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.7)] backdrop-blur-md animate-fade-in">
            <p className="text-xs font-semibold text-blue-400">
              {hoveredProgram.name}
            </p>
            <p className="mt-1 text-xs font-semibold text-white">
              {hoveredProgram.studentCount} estudiante
              {hoveredProgram.studentCount === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {programs.length === 0 ? (
          <p className="text-center text-xs text-slate-500">
            Sin carreras registradas todavía.
          </p>
        ) : (
          programs.map((program, index) => {
            const color =
              BLUE_SEGMENT_PALETTE[index % BLUE_SEGMENT_PALETTE.length];
            const widthPercent =
              totalStudents > 0
                ? Math.round((program.studentCount / totalStudents) * 100)
                : 0;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={program.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`cursor-pointer space-y-1 rounded-lg px-1.5 py-0.5 transition-colors ${
                  isHovered ? 'bg-blue-950/40' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 truncate text-slate-300">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate">{program.name}</span>
                  </span>
                  <span className="ml-2 shrink-0 font-semibold text-white">
                    {program.studentCount}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0c1426]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, widthPercent)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
