import { Loader2, Plus, UserPlus } from 'lucide-react';
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
  AdminUserItem,
  CourseItem,
  EnrollmentItem,
  EnrollmentStatus,
  SectionItem,
} from '../types/admin.types';

interface AdminSectionsTabProps {
  readonly sections: readonly SectionItem[];
  readonly enrollments: readonly EnrollmentItem[];
  readonly courses: readonly CourseItem[];
  readonly periods: readonly AcademicPeriodItem[];
  readonly teachers: readonly AdminUserItem[];
  readonly students: readonly AdminUserItem[];
  readonly focusSection?: 'sections' | 'enrollments';
  readonly onDataChanged: () => void;
}

const ENROLLMENT_STATUS_META: Record<
  EnrollmentStatus,
  { readonly label: string; readonly tone: 'emerald' | 'blue' | 'red' }
> = {
  ACTIVE: { label: 'Activa', tone: 'emerald' },
  COMPLETED: { label: 'Completada', tone: 'blue' },
  DROPPED: { label: 'Retirada', tone: 'red' },
};

/**
 * Manages class sections (teacher + schedule + classroom) and student enrollments.
 */
export function AdminSectionsTab({
  sections,
  enrollments,
  courses,
  periods,
  teachers,
  students,
  focusSection,
  onDataChanged,
}: AdminSectionsTabProps) {
  const [modalMode, setModalMode] = useState<'section' | 'enrollment' | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sectionCode, setSectionCode] = useState('A');
  const [courseId, setCourseId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [schedule, setSchedule] = useState('');
  const [classroom, setClassroom] = useState('');
  const [capacity, setCapacity] = useState(30);

  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollSectionId, setEnrollSectionId] = useState('');

  function openSectionModal(): void {
    setErrorMessage(null);
    setCourseId(courses[0]?.id ?? '');
    setPeriodId(periods.find((p) => p.isCurrent)?.id ?? periods[0]?.id ?? '');
    setTeacherId(teachers[0]?.teacherProfile?.id ?? '');
    setModalMode('section');
  }

  function openEnrollmentModal(): void {
    setErrorMessage(null);
    setEnrollStudentId(students[0]?.studentProfile?.id ?? '');
    setEnrollSectionId(sections[0]?.id ?? '');
    setModalMode('enrollment');
  }

  async function handleCreateSection(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      await adminService.createSection({
        code: sectionCode.trim(),
        courseId,
        periodId,
        teacherId,
        schedule: schedule.trim(),
        classroom: classroom.trim(),
        capacity,
      });
      setSchedule('');
      setClassroom('');
      setModalMode(null);
      onDataChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo crear la sección',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateEnrollment(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      await adminService.createEnrollment({
        studentId: enrollStudentId,
        sectionId: enrollSectionId,
      });
      setModalMode(null);
      onDataChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la matrícula',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleEnrollment(item: EnrollmentItem): Promise<void> {
    const nextStatus: EnrollmentStatus =
      item.status === 'ACTIVE' ? 'DROPPED' : 'ACTIVE';
    try {
      await adminService.updateEnrollmentStatus(item.id, nextStatus);
      onDataChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Error al cambiar estado de matrícula',
      );
    }
  }

  const showSections = !focusSection || focusSection === 'sections';
  const showEnrollments = !focusSection || focusSection === 'enrollments';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Secciones */}
      {showSections && (
        <div className="rounded-2xl border border-blue-950/90 bg-[#060c18]/90 p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Secciones y Horarios
              </h3>
              <p className="text-xs text-slate-400">
                Asigna docentes, aulas y horarios por curso y periodo
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={courses.length === 0 || teachers.length === 0}
                onClick={openSectionModal}
                className={ADMIN_PRIMARY_BUTTON_CLASS}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nueva sección
              </button>
              <button
                type="button"
                disabled={sections.length === 0 || students.length === 0}
                onClick={openEnrollmentModal}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-500/50 bg-blue-950/60 px-4 py-2 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-900/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Matricular alumno
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className="rounded-xl border border-white/5 bg-[#040812] p-4 transition-colors hover:border-blue-800/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-blue-400">
                      {section.course.code} &middot; Sección {section.code}{' '}
                      &middot; {section.period.code}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold text-white">
                      {section.course.name}
                    </h4>
                  </div>
                  <StatusBadge
                    label={`${section._count.enrollments}/${section.capacity} cupos`}
                    tone="blue"
                  />
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <p>
                    Docente:{' '}
                    <span className="text-slate-200">
                      {section.teacher.user.firstName}{' '}
                      {section.teacher.user.lastName}
                    </span>
                  </p>
                  <p>
                    Horario:{' '}
                    <span className="text-slate-200">{section.schedule}</span>{' '}
                    &middot; Aula:{' '}
                    <span className="text-slate-200">{section.classroom}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matrículas */}
      {showEnrollments && (
        <div className="rounded-2xl border border-blue-950/90 bg-[#060c18]/90 p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Registro de Matrículas
              </h3>
              <p className="text-xs text-slate-400">
                Estudiantes inscritos en las secciones académicas
              </p>
            </div>
            {focusSection === 'enrollments' && (
              <button
                type="button"
                disabled={sections.length === 0 || students.length === 0}
                onClick={openEnrollmentModal}
                className={ADMIN_PRIMARY_BUTTON_CLASS}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Matricular alumno
              </button>
            )}
          </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2.5 font-medium">Estudiante</th>
                <th className="pb-2.5 font-medium">Curso / Sección</th>
                <th className="pb-2.5 font-medium">Periodo</th>
                <th className="pb-2.5 font-medium">Estado</th>
                <th className="pb-2.5 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {enrollments.map((item) => {
                const statusMeta = ENROLLMENT_STATUS_META[item.status];
                return (
                  <tr key={item.id} className="text-slate-300">
                    <td className="py-3">
                      <p className="font-medium text-white">
                        {item.student.user.firstName}{' '}
                        {item.student.user.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.student.studentCode} &middot;{' '}
                        {item.student.program.code}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-white">
                        {item.section.course.code} - {item.section.course.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Sección {item.section.code} &middot;{' '}
                        {item.section.schedule}
                      </p>
                    </td>
                    <td className="py-3 text-xs">{item.section.period.code}</td>
                    <td className="py-3">
                      <StatusBadge
                        label={statusMeta.label}
                        tone={statusMeta.tone}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void handleToggleEnrollment(item)}
                        className="rounded-lg border border-blue-900/70 px-3 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-blue-500 hover:text-white"
                      >
                        {item.status === 'ACTIVE' ? 'Retirar' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal: Nueva Sección */}
      <Modal
        isOpen={modalMode === 'section'}
        title="Abrir nueva sección"
        onClose={() => setModalMode(null)}
      >
        <form onSubmit={(e) => void handleCreateSection(e)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="s-course" className={ADMIN_LABEL_CLASS}>
                Curso
              </label>
              <select
                id="s-course"
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="s-period" className={ADMIN_LABEL_CLASS}>
                Periodo
              </label>
              <select
                id="s-period"
                required
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              >
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.code} - {period.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="s-teacher" className={ADMIN_LABEL_CLASS}>
              Docente asignado
            </label>
            <select
              id="s-teacher"
              required
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className={ADMIN_INPUT_CLASS}
            >
              {teachers.map(
                (teacher) =>
                  teacher.teacherProfile && (
                    <option
                      key={teacher.teacherProfile.id}
                      value={teacher.teacherProfile.id}
                    >
                      {teacher.firstName} {teacher.lastName} (
                      {teacher.teacherProfile.specialty})
                    </option>
                  ),
              )}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="s-code" className={ADMIN_LABEL_CLASS}>
                Sección
              </label>
              <input
                id="s-code"
                required
                value={sectionCode}
                onChange={(e) => setSectionCode(e.target.value)}
                placeholder="B"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="s-room" className={ADMIN_LABEL_CLASS}>
                Aula
              </label>
              <input
                id="s-room"
                required
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="Lab 301"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="s-cap" className={ADMIN_LABEL_CLASS}>
                Capacidad
              </label>
              <input
                id="s-cap"
                type="number"
                min={1}
                max={200}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label htmlFor="s-sched" className={ADMIN_LABEL_CLASS}>
              Horario
            </label>
            <input
              id="s-sched"
              required
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Vie 18:30 - 21:30"
              className={ADMIN_INPUT_CLASS}
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-300">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalMode(null)}
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
              Crear sección
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Matricular Estudiante */}
      <Modal
        isOpen={modalMode === 'enrollment'}
        title="Matricular estudiante"
        onClose={() => setModalMode(null)}
      >
        <form
          onSubmit={(e) => void handleCreateEnrollment(e)}
          className="space-y-4"
        >
          <div>
            <label htmlFor="e-student" className={ADMIN_LABEL_CLASS}>
              Estudiante
            </label>
            <select
              id="e-student"
              required
              value={enrollStudentId}
              onChange={(e) => setEnrollStudentId(e.target.value)}
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
            <label htmlFor="e-section" className={ADMIN_LABEL_CLASS}>
              Sección académica
            </label>
            <select
              id="e-section"
              required
              value={enrollSectionId}
              onChange={(e) => setEnrollSectionId(e.target.value)}
              className={ADMIN_INPUT_CLASS}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.course.code} ({section.code}) - {section.course.name}{' '}
                  [{section._count.enrollments}/{section.capacity}]
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-300">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalMode(null)}
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
              Confirmar matrícula
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
