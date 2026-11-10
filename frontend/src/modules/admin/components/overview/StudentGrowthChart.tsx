import { useState } from 'react';
import type { MonthlyGrowthPoint } from '../../types/admin.types';

interface StudentGrowthChartProps {
  readonly data: readonly MonthlyGrowthPoint[];
  readonly periodLabel: string;
}

type ChartViewMode = 'area' | 'bars';

const SVG_WIDTH = 640;
const SVG_HEIGHT = 240;
const PADDING_LEFT = 42;
const PADDING_RIGHT = 20;
const PADDING_TOP = 18;
const PADDING_BOTTOM = 30;

function buildSmoothPath(
  points: ReadonlyArray<{ readonly x: number; readonly y: number }>,
): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

function buildTopRoundedBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string {
  if (height <= 0) return '';
  const r = Math.min(radius, width / 2, height);
  const bottom = y + height;
  return [
    `M ${x} ${bottom}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${bottom}`,
    'Z',
  ].join(' ');
}

/**
 * Interactive SVG growth chart supporting smooth Area curves with crosshair tooltip and grouped Bars.
 */
export function StudentGrowthChart({
  data,
  periodLabel,
}: StudentGrowthChartProps) {
  const [mode, setMode] = useState<ChartViewMode>('area');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const safeData =
    data.length > 0
      ? data
      : [{ label: 'Hoy', students: 0, enrollments: 0 }];

  const maxRaw = Math.max(
    4,
    ...safeData.map((d) => Math.max(d.students, d.enrollments)),
  );
  const maxTick = Math.ceil(maxRaw / 4) * 4;
  const chartWidth = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const baselineY = PADDING_TOP + chartHeight;

  // Area mode spreads points edge-to-edge; Bar mode centers each group inside equal bands
  const bandWidth = chartWidth / safeData.length;
  const lineStep =
    safeData.length > 1 ? chartWidth / (safeData.length - 1) : chartWidth / 2;

  const getCenterX = (idx: number): number => {
    if (mode === 'bars') {
      return PADDING_LEFT + bandWidth * (idx + 0.5);
    }
    return safeData.length > 1
      ? PADDING_LEFT + idx * lineStep
      : PADDING_LEFT + chartWidth / 2;
  };

  const studentCoords = safeData.map((item, idx) => ({
    x: getCenterX(idx),
    y: baselineY - (item.students / maxTick) * chartHeight,
  }));

  const enrollmentCoords = safeData.map((item, idx) => ({
    x: getCenterX(idx),
    y: baselineY - (item.enrollments / maxTick) * chartHeight,
  }));

  const studentLinePath = buildSmoothPath(studentCoords);
  const enrollmentLinePath = buildSmoothPath(enrollmentCoords);
  const studentAreaPath =
    studentCoords.length > 0
      ? `${studentLinePath} L ${studentCoords[studentCoords.length - 1].x} ${baselineY} L ${studentCoords[0].x} ${baselineY} Z`
      : '';
  const enrollmentAreaPath =
    enrollmentCoords.length > 0
      ? `${enrollmentLinePath} L ${enrollmentCoords[enrollmentCoords.length - 1].x} ${baselineY} L ${enrollmentCoords[0].x} ${baselineY} Z`
      : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(maxTick * ratio),
    y: baselineY - chartHeight * ratio,
  }));

  const activePoint = hoveredIndex !== null ? safeData[hoveredIndex] : null;
  const activeCoord =
    hoveredIndex !== null ? studentCoords[hoveredIndex] : null;
  const tooltipAlignLeft =
    hoveredIndex !== null && hoveredIndex >= Math.max(1, safeData.length - 2);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-blue-950/90 bg-[#060c18]/95 p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Crecimiento Estudiantil
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Estudiantes acumulados vs Matrículas mensuales &middot; {periodLabel}
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-blue-950 bg-[#03060f] p-1">
          {(['area', 'bars'] as const).map((view) => {
            const active = mode === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => {
                  setMode(view);
                  setHoveredIndex(null);
                }}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border border-blue-500/60 bg-blue-950/90 text-white'
                    : 'border border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {view === 'area' ? 'Área' : 'Barras'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="h-60 w-full overflow-visible"
          role="img"
          aria-label="Gráfico de crecimiento estudiantil y matrículas"
        >
          <defs>
            <linearGradient id="nexoraStudentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#02040a" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="nexoraEnrollmentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#02040a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal and vertical dashed grid */}
          {yTicks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={PADDING_LEFT}
                y1={tick.y}
                x2={SVG_WIDTH - PADDING_RIGHT}
                y2={tick.y}
                stroke="#1e293b"
                strokeOpacity="0.55"
                strokeDasharray="3 4"
              />
              <text
                x={PADDING_LEFT - 10}
                y={tick.y + 4}
                textAnchor="end"
                fill="#64748b"
                fontSize="10"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {safeData.map((item, idx) => (
            <line
              key={`vgrid-${item.label}`}
              x1={getCenterX(idx)}
              y1={PADDING_TOP}
              x2={getCenterX(idx)}
              y2={baselineY}
              stroke="#1e293b"
              strokeOpacity="0.35"
              strokeDasharray="3 4"
            />
          ))}

          {mode === 'area' ? (
            <>
              <path d={studentAreaPath} fill="url(#nexoraStudentFill)" />
              <path d={enrollmentAreaPath} fill="url(#nexoraEnrollmentFill)" />
              <path
                d={studentLinePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={enrollmentLinePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Vertical crosshair guide on hover */}
              {hoveredIndex !== null && activeCoord && (
                <line
                  x1={activeCoord.x}
                  y1={PADDING_TOP}
                  x2={activeCoord.x}
                  y2={baselineY}
                  stroke="#e2e8f0"
                  strokeOpacity="0.5"
                  strokeWidth="1.2"
                />
              )}
            </>
          ) : (
            safeData.map((item, idx) => {
              const centerX = getCenterX(idx);
              const isHovered = hoveredIndex === idx;
              const barW = Math.max(10, Math.min(20, bandWidth * 0.28));
              const gap = 4;
              const studentBarH = (item.students / maxTick) * chartHeight;
              const enrollBarH = (item.enrollments / maxTick) * chartHeight;

              return (
                <g key={item.label}>
                  {isHovered && (
                    <rect
                      x={centerX - bandWidth * 0.42}
                      y={PADDING_TOP}
                      width={bandWidth * 0.84}
                      height={chartHeight}
                      rx="8"
                      fill="#1d4ed8"
                      fillOpacity="0.14"
                    />
                  )}

                  {studentBarH > 0 ? (
                    <path
                      d={buildTopRoundedBarPath(
                        centerX - barW - gap / 2,
                        baselineY - studentBarH,
                        barW,
                        studentBarH,
                        5,
                      )}
                      fill={isHovered ? '#60a5fa' : '#2563eb'}
                      className="transition-colors duration-150"
                    />
                  ) : (
                    <rect
                      x={centerX - barW - gap / 2}
                      y={baselineY - 2}
                      width={barW}
                      height={2}
                      rx="1"
                      fill="#1e3a8a"
                      opacity="0.5"
                    />
                  )}

                  {enrollBarH > 0 ? (
                    <path
                      d={buildTopRoundedBarPath(
                        centerX + gap / 2,
                        baselineY - enrollBarH,
                        barW,
                        enrollBarH,
                        5,
                      )}
                      fill={isHovered ? '#7dd3fc' : '#0ea5e9'}
                      className="transition-colors duration-150"
                    />
                  ) : (
                    <rect
                      x={centerX + gap / 2}
                      y={baselineY - 2}
                      width={barW}
                      height={2}
                      rx="1"
                      fill="#0c4a6e"
                      opacity="0.5"
                    />
                  )}
                </g>
              );
            })
          )}

          {/* Hover hit zones + active points + X labels */}
          {safeData.map((item, idx) => {
            const coord = studentCoords[idx];
            const enrollCoord = enrollmentCoords[idx];
            const isHovered = hoveredIndex === idx;
            const hitWidth =
              mode === 'bars'
                ? bandWidth
                : Math.max(36, chartWidth / safeData.length);

            return (
              <g
                key={item.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <rect
                  x={coord.x - hitWidth / 2}
                  y={PADDING_TOP}
                  width={hitWidth}
                  height={chartHeight + 26}
                  fill="transparent"
                />

                {mode === 'area' && isHovered && (
                  <>
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={5.5}
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={enrollCoord.x}
                      cy={enrollCoord.y}
                      r={5}
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                )}

                <text
                  x={coord.x}
                  y={SVG_HEIGHT - 6}
                  textAnchor="middle"
                  fill={isHovered ? '#ffffff' : '#64748b'}
                  fontSize="11"
                  fontWeight={isHovered ? 600 : 400}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip card inside chart matching reference */}
        {activePoint && activeCoord && (
          <div
            style={{
              left: `${(activeCoord.x / SVG_WIDTH) * 100}%`,
              top: '28%',
              transform: tooltipAlignLeft
                ? 'translateX(calc(-100% - 14px))'
                : 'translateX(14px)',
            }}
            className="pointer-events-none absolute z-10 min-w-[165px] rounded-xl border border-blue-800/70 bg-[#070d1c]/95 px-3.5 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-md animate-fade-in"
          >
            <p className="text-xs font-medium text-slate-400">
              {activePoint.label}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-300">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              Estudiantes:
              <span className="font-bold text-white">
                {activePoint.students}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-300">
              <span className="h-2 w-2 shrink-0 rounded-full bg-sky-400" />
              Matrículas:
              <span className="font-bold text-white">
                {activePoint.enrollments}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-5 border-t border-white/5 pt-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Estudiantes activos
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          Matrículas del mes
        </span>
      </div>
    </div>
  );
}
