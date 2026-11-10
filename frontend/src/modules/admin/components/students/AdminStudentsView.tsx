import {
  Building2,
  CheckCircle2,
  Download,
  GraduationCap,
  Loader2,
  PauseCircle,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import {
  CustomSelect,
  type SelectOption,
} from '../../../../components/ui/CustomSelect';
import { Modal } from '../../../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  ADMIN_PRIMARY_BUTTON_CLASS,
} from '../../styles/formClasses';
import type {
  AcademicPeriodItem,
  AdminUserItem,
  ProgramItem,
} from '../../types/admin.types';
import { KpiMetricCard } from '../overview/KpiMetricCard';
import {
  getStudentAverageScore,
  getStudentInitials,
} from './studentMetrics';
import { StudentProfileModal } from './StudentProfileModal';

interface AdminStudentsViewProps {
  readonly programs: readonly ProgramItem[];
  readonly currentPeriod: AcademicPeriodItem | null;
  readonly onDataChanged: () => void;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED';

const AVATAR_GRADIENTS = [
  'from-blue-600 to-blue-900',
  'from-sky-500 to-blue-800',
  'from-blue-500 to-sky-700',
  'from-slate-600 to-blue-900',
] as const;

function exportStudentsCsv(students: readonly AdminUserItem[]): void {
  const rows = [
    ['Codigo', 'Nombres', 'Apellidos', 'Correo', 'DNI', 'Carrera', 'Ciclo', 'Estado'],
    ...students.map((s) => [
      s.studentProfile?.studentCode ?? '',
      s.firstName,
      s.lastName,
      s.email,
      s.documentNumber ?? '',
      s.studentProfile?.program.name ?? '',
      String(s.studentProfile?.currentCycle ?? ''),
      s.isActive ? 'Activo' : 'Suspendido',
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
  link.download = `estudiantes-nexora-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getScoreBarColor(score: number): string {
  if (score >= 16) return 'bg-emerald-400';
  if (score >= 13) return 'bg-blue-500';
  return 'bg-amber-400';
}

/**
 * Dedicated Administrator view for managing students with a custom career selector, KPIs, and profile modal.
 */
export function AdminStudentsView({
  programs,
  currentPeriod,
  onDataChanged,
}: AdminStudentsViewProps) {
  const [allStudents, setAllStudents] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<AdminUserItem | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.listUsers('STUDENT');
      setAllStudents(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Error al cargar estudiantes',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (!programId && programs.length > 0) {
      setProgramId(programs[0].id);
    }
  }, [programs, programId]);

  const normalizedQuery = search.trim().toLowerCase();
  const filteredStudents = allStudents.filter((student) => {
    const profile = student.studentProfile;
    if (
      selectedProgramId !== 'ALL' &&
      profile?.program.id !== selectedProgramId
    ) {
      return false;
    }

    if (statusFilter === 'ACTIVE' && !student.isActive) return false;
    if (statusFilter === 'SUSPENDED' && student.isActive) return false;

    if (!normalizedQuery) return true;

    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return (
      fullName.includes(normalizedQuery) ||
      student.email.toLowerCase().includes(normalizedQuery) ||
      (student.documentNumber?.toLowerCase().includes(normalizedQuery) ?? false) ||
      (profile?.studentCode.toLowerCase().includes(normalizedQuery) ?? false) ||
      (profile?.program.name.toLowerCase().includes(normalizedQuery) ?? false)
    );
  });

  const activeCount = allStudents.filter((s) => s.isActive).length;
  const suspendedCount = allStudents.length - activeCount;
  const enrolledStudentsCount = allStudents.filter(
    (s) => (s.studentProfile?.enrollments?.length ?? 0) > 0,
  ).length;

  const programSelectOptions: SelectOption[] = programs.map((program) => ({
    value: program.id,
    prefix: program.code,
    label: program.name,
    count: allStudents.filter(
      (student) => student.studentProfile?.program.id === program.id,
    ).length,
  }));

  const filterCareerOptions: SelectOption[] = [
    {
      value: 'ALL',
      label: 'Todas las carreras',
      count: allStudents.length,
    },
    ...programSelectOptions,
  ];

  function resetCreateForm(): void {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setDocumentNumber('');
    setPhone('');
    setCurrentCycle(1);
    setProgramId(
      selectedProgramId !== 'ALL'
        ? selectedProgramId
        : (programs[0]?.id ?? ''),
    );
    setFormError(null);
  }

  async function handleCreateStudent(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      await adminService.createUser({
        role: 'STUDENT',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        documentNumber: documentNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        programId,
        currentCycle,
      });

      resetCreateForm();
      setIsCreateOpen(false);
      await loadStudents();
      onDataChanged();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar al estudiante',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(student: AdminUserItem): Promise<void> {
    const updated = await adminService.toggleUserStatus(
      student.id,
      !student.isActive,
    );
    setAllStudents((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelectedStudent((prev) => (prev?.id === updated.id ? updated : prev));
    onDataChanged();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-slate-400">
          {allStudents.length} estudiante(s) registrados &middot;{' '}
          <span className="text-blue-300">
            {currentPeriod ? currentPeriod.name : 'Ciclo Académico 2026'}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportStudentsCsv(filteredStudents)}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-950 bg-[#060c18] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-600 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
            Exportar
          </button>

          <button
            type="button"
            disabled={programs.length === 0}
            onClick={() => {
              resetCreateForm();
              setIsCreateOpen(true);
            }}
            className={ADMIN_PRIMARY_BUTTON_CLASS}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo Estudiante
          </button>
        </div>
      </div>

      {/* 4 Mini KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiMetricCard
          label="Total Estudiantes"
          value={allStudents.length}
          subtext={`En ${programs.length} carrera(s)`}
          badgeText="Directorio"
          badgeTone="neutral"
          icon={Users}
          delayMs={40}
        />
        <KpiMetricCard
          label="Activos"
          value={activeCount}
          subtext="Con acceso habilitado"
          badgeText="Vigentes"
          badgeTone="positive"
          icon={CheckCircle2}
          delayMs={90}
        />
        <KpiMetricCard
          label="Suspendidos"
          value={suspendedCount}
          subtext="Cuentas inactivas"
          badgeText={suspendedCount > 0 ? 'Revisar' : 'Al día'}
          badgeTone={suspendedCount > 0 ? 'alert' : 'positive'}
          icon={PauseCircle}
          delayMs={140}
        />
        <KpiMetricCard
          label="Con Matrícula"
          value={enrolledStudentsCount}
          subtext="Inscritos en secciones"
          badgeText="Cursando"
          badgeTone="neutral"
          icon={GraduationCap}
          delayMs={190}
        />
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-xs text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Search + Custom Career Selector + Table */}
      <div className="rounded-2xl border border-blue-950/90 bg-[#060c18]/95 animate-fade-up [animation-delay:220ms]">
        <div className="border-b border-white/10 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar estudiante, código o DNI..."
                  className={`${ADMIN_INPUT_CLASS} pl-10`}
                />
              </div>

              <CustomSelect
                ariaLabel="Filtrar por carrera"
                icon={Building2}
                value={selectedProgramId}
                onChange={setSelectedProgramId}
                options={filterCareerOptions}
                placeholder="Todas las carreras"
                className="sm:w-72"
              />

              <div className="inline-flex rounded-xl border border-blue-950 bg-[#03060f] p-1">
                {(
                  [
                    { key: 'ALL', label: 'Todos' },
                    { key: 'ACTIVE', label: 'Activos' },
                    { key: 'SUSPENDED', label: 'Suspendidos' },
                  ] as const
                ).map((tab) => {
                  const active = statusFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'border border-blue-500/60 bg-blue-950/90 text-white'
                          : 'border border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-xs font-medium text-slate-400">
              {filteredStudents.length} resultado
              {filteredStudents.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto rounded-b-2xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#040812] text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5 font-medium">Estudiante</th>
                <th className="px-5 py-3.5 font-medium">Carrera</th>
                <th className="px-5 py-3.5 font-medium">Código</th>
                <th className="px-5 py-3.5 font-medium">Ciclo</th>
                <th className="px-5 py-3.5 font-medium">Promedio</th>
                <th className="px-5 py-3.5 font-medium">Estado</th>
                <th className="px-5 py-3.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-xs text-slate-400"
                  >
                    Cargando estudiantes...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-xs text-slate-400"
                  >
                    No hay estudiantes que coincidan con la carrera o búsqueda seleccionada.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const profile = student.studentProfile;
                  const initials = getStudentInitials(student);
                  const averageScore = getStudentAverageScore(student);
                  const avatarGradient =
                    AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
                  const barPercent =
                    averageScore !== null
                      ? Math.min(100, Math.round((averageScore / 20) * 100))
                      : 0;

                  return (
                    <tr
                      key={student.id}
                      className="group transition-colors duration-150 hover:bg-blue-950/25"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${avatarGradient}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500">
                              {profile?.studentCode ?? 'Sin código'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-300">
                        {profile?.program.name ?? 'Sin carrera'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded-md border border-blue-950 bg-[#0a1326] px-2.5 py-0.5 text-[11px] font-medium text-blue-300">
                          {profile?.program.code ?? 'N/A'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-300">
                        Ciclo {profile?.currentCycle ?? 1}
                      </td>

                      <td className="px-5 py-3.5">
                        {averageScore !== null ? (
                          <div className="flex items-center gap-2.5">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#0d162b]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(averageScore)}`}
                                style={{ width: `${barPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-white">
                              {averageScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Sin notas
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold ${
                            student.isActive
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {student.isActive ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="rounded-xl border border-blue-900/70 bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-200 transition-all duration-200 hover:border-blue-500 hover:bg-blue-900/60 hover:text-white"
                        >
                          Ver perfil
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ver Perfil del Estudiante */}
      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Modal: Nuevo Estudiante */}
      <Modal
        isOpen={isCreateOpen}
        title="Registrar nuevo estudiante"
        subtitle="Asigna su carrera, ciclo inicial y credenciales de acceso."
        onClose={() => setIsCreateOpen(false)}
      >
        <form
          onSubmit={(e) => void handleCreateStudent(e)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="st-first" className={ADMIN_LABEL_CLASS}>
                Nombres
              </label>
              <input
                id="st-first"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="st-last" className={ADMIN_LABEL_CLASS}>
                Apellidos
              </label>
              <input
                id="st-last"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="st-email" className={ADMIN_LABEL_CLASS}>
                Correo institucional
              </label>
              <input
                id="st-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alumno@nexorainstitute.edu"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="st-pass" className={ADMIN_LABEL_CLASS}>
                Contraseña inicial
              </label>
              <input
                id="st-pass"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="st-dni" className={ADMIN_LABEL_CLASS}>
                DNI / Documento
              </label>
              <input
                id="st-dni"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="st-phone" className={ADMIN_LABEL_CLASS}>
                Teléfono
              </label>
              <input
                id="st-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <span className={ADMIN_LABEL_CLASS}>Carrera</span>
              <CustomSelect
                ariaLabel="Seleccionar carrera"
                icon={Building2}
                value={programId}
                onChange={setProgramId}
                options={programSelectOptions}
                placeholder="Selecciona una carrera"
              />
            </div>
            <div>
              <label htmlFor="st-cycle" className={ADMIN_LABEL_CLASS}>
                Ciclo
              </label>
              <input
                id="st-cycle"
                type="number"
                min={1}
                max={12}
                value={currentCycle}
                onChange={(e) => setCurrentCycle(Number(e.target.value))}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-900/70 bg-red-950/40 px-3.5 py-2 text-xs text-red-200">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={ADMIN_PRIMARY_BUTTON_CLASS}
            >
              {isSaving && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Registrar estudiante
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
