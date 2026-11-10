import { Loader2, Plus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { adminService } from '../services/adminService';
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  ADMIN_PRIMARY_BUTTON_CLASS,
} from '../styles/formClasses';
import type {
  AcademicPeriodItem,
  CourseItem,
  ProgramItem,
} from '../types/admin.types';

interface AdminAcademicTabProps {
  readonly programs: readonly ProgramItem[];
  readonly periods: readonly AcademicPeriodItem[];
  readonly courses: readonly CourseItem[];
  readonly focusSection?: 'programs' | 'periods' | 'courses';
  readonly onDataChanged: () => void;
}

type ActiveModal = 'program' | 'period' | 'course' | null;

/**
 * Manages academic programs, academic periods, and courses for Nexora Institute.
 */
export function AdminAcademicTab({
  programs,
  periods,
  courses,
  focusSection,
  onDataChanged,
}: AdminAcademicTabProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progCycles, setProgCycles] = useState(6);

  const [periodCode, setPeriodCode] = useState('');
  const [periodName, setPeriodName] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-08-10');
  const [periodEnd, setPeriodEnd] = useState('2026-12-18');
  const [periodCurrent, setPeriodCurrent] = useState(false);

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState(4);
  const [courseCycle, setCourseCycle] = useState(1);
  const [courseProgramId, setCourseProgramId] = useState('');

  async function handleCreateProgram(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);
    try {
      await adminService.createProgram({
        code: progCode.trim(),
        name: progName.trim(),
        durationCycles: progCycles,
      });
      setProgCode('');
      setProgName('');
      setActiveModal(null);
      onDataChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al crear carrera',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreatePeriod(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);
    try {
      await adminService.createPeriod({
        code: periodCode.trim(),
        name: periodName.trim(),
        startDate: periodStart,
        endDate: periodEnd,
        isCurrent: periodCurrent,
      });
      setPeriodCode('');
      setPeriodName('');
      setPeriodCurrent(false);
      setActiveModal(null);
      onDataChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al crear periodo',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateCourse(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const targetProgramId = courseProgramId || programs[0]?.id || '';
      await adminService.createCourse({
        code: courseCode.trim(),
        name: courseName.trim(),
        credits: courseCredits,
        cycleNumber: courseCycle,
        programId: targetProgramId,
      });
      setCourseCode('');
      setCourseName('');
      setActiveModal(null);
      onDataChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al crear curso',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleActivatePeriod(periodId: string): Promise<void> {
    try {
      await adminService.setCurrentPeriod(periodId);
      onDataChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo activar el periodo',
      );
    }
  }

  const showPrograms = !focusSection || focusSection === 'programs';
  const showPeriods = !focusSection || focusSection === 'periods';
  const showCourses = !focusSection || focusSection === 'courses';

  return (
    <div className="space-y-6 animate-fade-in">
      {(showPrograms || showPeriods) && (
        <div
          className={`grid grid-cols-1 gap-6 ${
            showPrograms && showPeriods ? 'xl:grid-cols-2' : ''
          }`}
        >
          {/* Carreras / Programas */}
          {showPrograms && (
            <div className="rounded-2xl border border-blue-950/90 bg-[#060c18]/90 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Carreras y Programas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Oferta académica registrada en el instituto
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveModal('program');
                  }}
                  className={ADMIN_PRIMARY_BUTTON_CLASS}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Nueva carrera
                </button>
              </div>

              <div className="space-y-2.5">
                {programs.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-[#040812] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        <span className="mr-2 text-blue-400">{program.code}</span>
                        {program.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {program.durationCycles} ciclos &middot;{' '}
                        {program._count.courses} cursos &middot;{' '}
                        {program._count.students} alumnos
                      </p>
                    </div>
                    <StatusBadge
                      label={program.isActive ? 'Activa' : 'Inactiva'}
                      tone={program.isActive ? 'emerald' : 'red'}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Periodos Académicos */}
          {showPeriods && (
            <div className="rounded-2xl border border-blue-950/90 bg-[#060c18]/90 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Periodos Académicos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define el ciclo activo para matrículas y secciones
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveModal('period');
                  }}
                  className={ADMIN_PRIMARY_BUTTON_CLASS}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Nuevo periodo
                </button>
              </div>

              <div className="space-y-2.5">
                {periods.map((period) => (
                  <div
                    key={period.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-[#040812] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        <span className="mr-2 text-blue-400">{period.code}</span>
                        {period.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(period.startDate).toLocaleDateString('es-PE')} -{' '}
                        {new Date(period.endDate).toLocaleDateString('es-PE')} &middot;{' '}
                        {period._count.sections} secciones
                      </p>
                    </div>

                    {period.isCurrent ? (
                      <StatusBadge label="Vigente" tone="emerald" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleActivatePeriod(period.id)}
                        className="rounded-lg border border-blue-900/70 px-3 py-1 text-xs font-medium text-blue-300 transition-colors hover:border-blue-500 hover:text-white"
                      >
                        Marcar vigente
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Catálogo de Cursos */}
      {showCourses && (
        <div className="rounded-2xl border border-blue-950/90 bg-[#060c18]/90 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Catálogo de Cursos
            </h3>
            <p className="text-xs text-slate-400">
              Asignaturas asociadas a cada carrera y ciclo
            </p>
          </div>
          <button
            type="button"
            disabled={programs.length === 0}
            onClick={() => {
              setErrorMessage(null);
              if (!courseProgramId && programs.length > 0) {
                setCourseProgramId(programs[0].id);
              }
              setActiveModal('course');
            }}
            className={ADMIN_PRIMARY_BUTTON_CLASS}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo curso
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2.5 font-medium">Código</th>
                <th className="pb-2.5 font-medium">Curso</th>
                <th className="pb-2.5 font-medium">Carrera</th>
                <th className="pb-2.5 font-medium">Ciclo</th>
                <th className="pb-2.5 font-medium">Créditos</th>
                <th className="pb-2.5 font-medium">Secciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {courses.map((course) => (
                <tr key={course.id} className="text-slate-300">
                  <td className="py-3 font-medium text-blue-400">
                    {course.code}
                  </td>
                  <td className="py-3 font-medium text-white">{course.name}</td>
                  <td className="py-3 text-xs text-slate-400">
                    {course.program.code} - {course.program.name}
                  </td>
                  <td className="py-3">Ciclo {course.cycleNumber}</td>
                  <td className="py-3">{course.credits}</td>
                  <td className="py-3">{course._count.sections}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal: Nueva Carrera */}
      <Modal
        isOpen={activeModal === 'program'}
        title="Nueva carrera"
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={(e) => void handleCreateProgram(e)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="p-code" className={ADMIN_LABEL_CLASS}>
                Código
              </label>
              <input
                id="p-code"
                required
                value={progCode}
                onChange={(e) => setProgCode(e.target.value)}
                placeholder="CIB"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="p-name" className={ADMIN_LABEL_CLASS}>
                Nombre de carrera
              </label>
              <input
                id="p-name"
                required
                value={progName}
                onChange={(e) => setProgName(e.target.value)}
                placeholder="Ciberseguridad y Redes"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-cycles" className={ADMIN_LABEL_CLASS}>
              Duración en ciclos
            </label>
            <input
              id="p-cycles"
              type="number"
              min={1}
              max={12}
              value={progCycles}
              onChange={(e) => setProgCycles(Number(e.target.value))}
              className={ADMIN_INPUT_CLASS}
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-300">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
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
              Crear carrera
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Nuevo Periodo */}
      <Modal
        isOpen={activeModal === 'period'}
        title="Nuevo periodo académico"
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={(e) => void handleCreatePeriod(e)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="per-code" className={ADMIN_LABEL_CLASS}>
                Código
              </label>
              <input
                id="per-code"
                required
                value={periodCode}
                onChange={(e) => setPeriodCode(e.target.value)}
                placeholder="2026-II"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="per-name" className={ADMIN_LABEL_CLASS}>
                Nombre
              </label>
              <input
                id="per-name"
                required
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                placeholder="Ciclo Académico 2026-II"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="per-start" className={ADMIN_LABEL_CLASS}>
                Inicio
              </label>
              <input
                id="per-start"
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="per-end" className={ADMIN_LABEL_CLASS}>
                Fin
              </label>
              <input
                id="per-end"
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={periodCurrent}
              onChange={(e) => setPeriodCurrent(e.target.checked)}
              className="rounded border-blue-800 bg-[#03060f]"
            />
            Establecer como periodo vigente actual
          </label>

          {errorMessage && (
            <p className="text-xs text-red-300">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
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
              Crear periodo
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Nuevo Curso */}
      <Modal
        isOpen={activeModal === 'course'}
        title="Nuevo curso"
        onClose={() => setActiveModal(null)}
      >
        <form onSubmit={(e) => void handleCreateCourse(e)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="c-code" className={ADMIN_LABEL_CLASS}>
                Código
              </label>
              <input
                id="c-code"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="SW-301"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="c-name" className={ADMIN_LABEL_CLASS}>
                Nombre del curso
              </label>
              <input
                id="c-name"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Arquitectura de Microservicios"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label htmlFor="c-program" className={ADMIN_LABEL_CLASS}>
              Carrera
            </label>
            <select
              id="c-program"
              required
              value={courseProgramId || programs[0]?.id || ''}
              onChange={(e) => setCourseProgramId(e.target.value)}
              className={ADMIN_INPUT_CLASS}
            >
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.code} - {program.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="c-cycle" className={ADMIN_LABEL_CLASS}>
                Ciclo
              </label>
              <input
                id="c-cycle"
                type="number"
                min={1}
                max={12}
                value={courseCycle}
                onChange={(e) => setCourseCycle(Number(e.target.value))}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="c-credits" className={ADMIN_LABEL_CLASS}>
                Créditos
              </label>
              <input
                id="c-credits"
                type="number"
                min={1}
                max={10}
                value={courseCredits}
                onChange={(e) => setCourseCredits(Number(e.target.value))}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-300">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
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
              Crear curso
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
