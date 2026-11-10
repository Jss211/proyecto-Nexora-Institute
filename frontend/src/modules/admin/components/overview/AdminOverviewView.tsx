import {
  ClipboardCheck,
  Download,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  Users,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  ADMIN_PRIMARY_BUTTON_CLASS,
} from '../../styles/formClasses';
import type {
  AdminSectionKey,
  AdminUserItem,
  DashboardSummary,
  SectionItem,
} from '../../types/admin.types';
import { AcademicCalendarWidget } from './AcademicCalendarWidget';
import { ActiveClassesCard } from './ActiveClassesCard';
import { KpiMetricCard } from './KpiMetricCard';
import { ProgramsDistributionChart } from './ProgramsDistributionChart';
import { RecentAlertsWidget } from './RecentAlertsWidget';
import { RecentEnrollmentsTable } from './RecentEnrollmentsTable';
import { StudentGrowthChart } from './StudentGrowthChart';

interface AdminOverviewViewProps {
  readonly adminFirstName: string;
  readonly summary: DashboardSummary | null;
  readonly students: readonly AdminUserItem[];
  readonly sections: readonly SectionItem[];
  readonly isLoading: boolean;
  readonly onNavigate: (section: AdminSectionKey) => void;
  readonly onDataChanged: () => void;
}

function getGreetingByHour(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatHeaderDate(): string {
  const formatted = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function exportDashboardCsv(summary: DashboardSummary): void {
  const rows = [
    ['Codigo', 'Estudiante', 'Curso', 'Seccion', 'Carrera', 'Fecha', 'Estado'],
    ...summary.recentEnrollments.map((item) => [
      item.studentCode,
      item.studentName,
      item.courseName,
      item.sectionCode,
      item.programName,
      new Date(item.enrolledAt).toISOString().slice(0, 10),
      item.status,
    ]),
  ];

  const csvContent = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','),
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nexora-reporte-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Executive Administrator overview combining live KPIs, SVG charts, calendar, and activity feeds.
 */
export function AdminOverviewView({
  adminFirstName,
  summary,
  students,
  sections,
  isLoading,
  onNavigate,
  onDataChanged,
}: AdminOverviewViewProps) {
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  function openQuickEnrollment(): void {
    setModalError(null);
    setSelectedStudentId(students[0]?.studentProfile?.id ?? '');
    setSelectedSectionId(sections[0]?.id ?? '');
    setEnrollModalOpen(true);
  }

  async function handleQuickEnroll(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setModalError(null);
    setIsSaving(true);
    try {
      await adminService.createEnrollment({
        studentId: selectedStudentId,
        sectionId: selectedSectionId,
      });
      setEnrollModalOpen(false);
      onDataChanged();
    } catch (error) {
      setModalError(
        error instanceof Error
          ? error.message
          : 'No se pudo completar la matrícula',
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-blue-950/70 bg-[#060c18]/80"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl border border-blue-950/70 bg-[#060c18]/80 lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-2xl border border-blue-950/70 bg-[#060c18]/80" />
        </div>
      </div>
    );
  }

  const {
    metrics,
    currentPeriod,
    programDistribution,
    monthlyGrowth,
    recentEnrollments,
    activeSections,
    alerts,
  } = summary;

  const periodSubtitle = currentPeriod
    ? `${currentPeriod.name} (${currentPeriod.code})`
    : 'Sin periodo activo';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header banner matching reference without emojis */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {getGreetingByHour()}, {adminFirstName}
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {formatHeaderDate()} &middot; {periodSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportDashboardCsv(summary)}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-950 bg-[#060c18] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-600 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
            Exportar
          </button>

          <button
            type="button"
            disabled={students.length === 0 || sections.length === 0}
            onClick={openQuickEnrollment}
            className={ADMIN_PRIMARY_BUTTON_CLASS}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva Matrícula
          </button>
        </div>
      </div>

      {/* Top 4 KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiMetricCard
          label="Total Estudiantes"
          value={metrics.activeStudents}
          subtext={`En ${metrics.programsCount} carrera(s) activas`}
          badgeText="Activos"
          badgeTone="positive"
          icon={Users}
          delayMs={40}
        />
        <KpiMetricCard
          label="Docentes Activos"
          value={metrics.activeTeachers}
          subtext={`${metrics.sectionsCount} sección(es) asignadas`}
          badgeText="Plana"
          badgeTone="neutral"
          icon={GraduationCap}
          delayMs={90}
        />
        <KpiMetricCard
          label="Matrículas Vigentes"
          value={metrics.activeEnrollments}
          subtext={currentPeriod ? `Ciclo ${currentPeriod.code}` : 'Ciclo actual'}
          badgeText="En curso"
          badgeTone="positive"
          icon={ClipboardCheck}
          delayMs={140}
        />
        <KpiMetricCard
          label="Cursos y Secciones"
          value={metrics.coursesCount}
          subtext={`${metrics.sectionsCount} horario(s) abiertos`}
          badgeText="Catálogo"
          badgeTone="neutral"
          icon={Layers}
          delayMs={190}
        />
      </div>

      {/* Row 2: Growth Chart + Donut Distribution */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <StudentGrowthChart
            data={monthlyGrowth}
            periodLabel={currentPeriod?.code ?? '2026'}
          />
        </div>
        <div>
          <ProgramsDistributionChart programs={programDistribution} />
        </div>
      </div>

      {/* Row 3: Recent Enrollments + Interactive Calendar */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentEnrollmentsTable
            enrollments={recentEnrollments}
            totalActiveCount={metrics.activeEnrollments}
            onViewAll={() => onNavigate('enrollments')}
          />
        </div>
        <div>
          <AcademicCalendarWidget currentPeriod={currentPeriod} />
        </div>
      </div>

      {/* Row 4: Scheduled Classes + Alerts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ActiveClassesCard
            sections={activeSections}
            onViewSchedule={() => onNavigate('sections')}
          />
        </div>
        <div>
          <RecentAlertsWidget
            alerts={alerts}
            onViewUsers={() => onNavigate('users')}
          />
        </div>
      </div>

      {/* Quick Enrollment Modal */}
      <Modal
        isOpen={enrollModalOpen}
        title="Nueva Matrícula Rápida"
        subtitle="Inscribe un estudiante en una sección académica disponible."
        onClose={() => setEnrollModalOpen(false)}
      >
        <form onSubmit={(e) => void handleQuickEnroll(e)} className="space-y-4">
          <div>
            <label htmlFor="quick-student" className={ADMIN_LABEL_CLASS}>
              Estudiante
            </label>
            <select
              id="quick-student"
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={ADMIN_INPUT_CLASS}
            >
              {students.map(
                (student) =>
                  student.studentProfile && (
                    <option
                      key={student.studentProfile.id}
                      value={student.studentProfile.id}
                    >
                      {student.studentProfile.studentCode} - {student.firstName}{' '}
                      {student.lastName}
                    </option>
                  ),
              )}
            </select>
          </div>

          <div>
            <label htmlFor="quick-section" className={ADMIN_LABEL_CLASS}>
              Sección disponible
            </label>
            <select
              id="quick-section"
              required
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className={ADMIN_INPUT_CLASS}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.course.code} (Sec. {section.code}) -{' '}
                  {section.course.name} [{section._count.enrollments}/
                  {section.capacity}]
                </option>
              ))}
            </select>
          </div>

          {modalError && (
            <p className="text-xs text-red-300">{modalError}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEnrollModalOpen(false)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={ADMIN_PRIMARY_BUTTON_CLASS}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrar matrícula
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
