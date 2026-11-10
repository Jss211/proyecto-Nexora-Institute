import { Check, FileText, Mail, Power } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import type { AdminUserItem } from '../../types/admin.types';
import {
  getStudentAverageScore,
  getStudentInitials,
} from './studentMetrics';

interface StudentProfileModalProps {
  readonly student: AdminUserItem | null;
  readonly onClose: () => void;
  readonly onToggleStatus: (student: AdminUserItem) => Promise<void>;
}

/**
 * Detailed student profile modal matching the dark-blue/black enterprise modal layout.
 */
export function StudentProfileModal({
  student,
  onClose,
  onToggleStatus,
}: StudentProfileModalProps) {
  const [showRecord, setShowRecord] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  if (!student || !student.studentProfile) {
    return null;
  }

  const profile = student.studentProfile;
  const initials = getStudentInitials(student);
  const averageScore = getStudentAverageScore(student);
  const enrollments = profile.enrollments ?? [];

  async function handleCopyEmail(): Promise<void> {
    if (!student) return;
    try {
      await navigator.clipboard.writeText(student.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      window.location.href = `mailto:${student.email}`;
    }
  }

  async function handleToggleAccount(): Promise<void> {
    if (!student) return;
    setIsToggling(true);
    try {
      await onToggleStatus(student);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <Modal
      isOpen={Boolean(student)}
      title="Perfil del Estudiante"
      onClose={() => {
        setShowRecord(false);
        onClose();
      }}
    >
      <div className="space-y-5">
        {/* Identity Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-950 text-lg font-bold text-white shadow-[0_8px_24px_-6px_rgba(37,99,235,0.55)]">
              {initials}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-xs text-slate-400">
                {profile.studentCode} &middot; {student.email}
              </p>
              <div className="mt-1.5">
                <StatusBadge
                  label={student.isActive ? 'Activo' : 'Suspendido'}
                  tone={student.isActive ? 'emerald' : 'red'}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isToggling}
            onClick={() => void handleToggleAccount()}
            title={student.isActive ? 'Suspender acceso' : 'Reactivar acceso'}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              student.isActive
                ? 'border-red-900/60 bg-red-950/30 text-red-300 hover:border-red-500/60'
                : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300 hover:border-emerald-500/60'
            }`}
          >
            <Power className="h-3.5 w-3.5" aria-hidden="true" />
            {student.isActive ? 'Suspender' : 'Activar'}
          </button>
        </div>

        {/* 2x2 Academic Metadata Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-950/80 bg-[#040812] p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Carrera
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {profile.program.name}
            </p>
          </div>

          <div className="rounded-xl border border-blue-950/80 bg-[#040812] p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Código / Documento
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {profile.program.code}
              {student.documentNumber ? ` · DNI ${student.documentNumber}` : ''}
            </p>
          </div>

          <div className="rounded-xl border border-blue-950/80 bg-[#040812] p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Ciclo Actual
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              Ciclo {profile.currentCycle}
            </p>
          </div>

          <div className="rounded-xl border border-blue-950/80 bg-[#040812] p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Promedio Académico
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {averageScore !== null ? `${averageScore} / 20.0` : 'Sin notas registradas'}
            </p>
          </div>
        </div>

        {/* Expandable Academic Record inside modal */}
        {showRecord && (
          <div className="rounded-xl border border-blue-900/60 bg-[#040812] p-4 animate-fade-in">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
              Expediente de Cursos ({enrollments.length})
            </p>
            {enrollments.length === 0 ? (
              <p className="text-xs text-slate-500">
                Este estudiante aún no tiene matrículas registradas.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-[#060c18] px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {enrollment.section.course.code} -{' '}
                        {enrollment.section.course.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Sección {enrollment.section.code} &middot;{' '}
                        {enrollment.section.schedule}
                      </p>
                    </div>
                    <StatusBadge
                      label={
                        enrollment.status === 'ACTIVE'
                          ? 'Cursando'
                          : enrollment.status === 'COMPLETED'
                            ? 'Aprobado'
                            : 'Retirado'
                      }
                      tone={
                        enrollment.status === 'ACTIVE'
                          ? 'emerald'
                          : enrollment.status === 'COMPLETED'
                            ? 'blue'
                            : 'red'
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions matching reference without emojis */}
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void handleCopyEmail()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-950 bg-[#040812] py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-600 hover:text-white"
          >
            {copiedEmail ? (
              <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            ) : (
              <Mail className="h-4 w-4 text-blue-400" aria-hidden="true" />
            )}
            {copiedEmail ? 'Correo copiado' : 'Copiar correo'}
          </button>

          <button
            type="button"
            onClick={() => setShowRecord((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 py-2.5 text-xs font-semibold text-white shadow-[0_8px_24px_-6px_rgba(37,99,235,0.6)] transition-all hover:from-blue-500 hover:to-blue-700"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {showRecord ? 'Ocultar expediente' : 'Ver expediente'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
