import { Loader2, Plus, Search } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { UserRole } from '../../../types/auth.types';
import { adminService } from '../services/adminService';
import {
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
  ADMIN_PRIMARY_BUTTON_CLASS,
  ROLE_BADGE_MAP,
} from '../styles/formClasses';
import type { AdminUserItem, ProgramItem } from '../types/admin.types';

interface AdminUsersTabProps {
  readonly programs: readonly ProgramItem[];
  readonly currentUserId: string;
  readonly fixedRole?: UserRole;
  readonly onDataChanged: () => void;
}

const ROLE_FILTERS: ReadonlyArray<{
  readonly key: UserRole | 'ALL';
  readonly label: string;
}> = [
  { key: 'ALL', label: 'Todos' },
  { key: 'STUDENT', label: 'Estudiantes' },
  { key: 'TEACHER', label: 'Docentes' },
  { key: 'ADMIN', label: 'Administradores' },
];

/**
 * User directory and creation workflow for Admins, Teachers, and Students.
 */
export function AdminUsersTab({
  programs,
  currentUserId,
  fixedRole,
  onDataChanged,
}: AdminUsersTabProps) {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>(
    fixedRole ?? 'ALL',
  );
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formRole, setFormRole] = useState<UserRole>(fixedRole ?? 'STUDENT');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [specialty, setSpecialty] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setRoleFilter(fixedRole ?? 'ALL');
    setFormRole(fixedRole ?? 'STUDENT');
  }, [fixedRole]);

  const activeFilter = fixedRole ?? roleFilter;

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await adminService.listUsers(
        activeFilter === 'ALL' ? undefined : activeFilter,
        search,
      );
      setUsers(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al cargar usuarios',
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, search]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!programId && programs.length > 0) {
      setProgramId(programs[0].id);
    }
  }, [programs, programId]);

  function resetForm(): void {
    setFormRole(fixedRole ?? 'STUDENT');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setDocumentNumber('');
    setPhone('');
    setCurrentCycle(1);
    setSpecialty('');
    setFormError(null);
  }

  async function handleCreateUser(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      await adminService.createUser({
        role: formRole,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        documentNumber: documentNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        programId: formRole === 'STUDENT' ? programId : undefined,
        currentCycle: formRole === 'STUDENT' ? currentCycle : undefined,
        specialty: formRole === 'TEACHER' ? specialty.trim() : undefined,
      });

      resetForm();
      setIsModalOpen(false);
      await loadUsers();
      onDataChanged();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo registrar el usuario',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(user: AdminUserItem): Promise<void> {
    try {
      await adminService.toggleUserStatus(user.id, !user.isActive);
      await loadUsers();
      onDataChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el estado',
      );
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {fixedRole ? (
          <div className="relative w-full max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Buscar ${ROLE_BADGE_MAP[fixedRole].label.toLowerCase()}...`}
              className={`${ADMIN_INPUT_CLASS} pl-10`}
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map((filter) => {
              const active = roleFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setRoleFilter(filter.key)}
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'border-blue-500 bg-blue-950/80 text-white'
                      : 'border-blue-950/90 bg-[#060c18] text-slate-400 hover:border-blue-800 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className={ADMIN_PRIMARY_BUTTON_CLASS}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {fixedRole
            ? `Nuevo ${ROLE_BADGE_MAP[fixedRole].label.toLowerCase()}`
            : 'Nuevo usuario'}
        </button>
      </div>

      {!fixedRole && (
        <div className="relative max-w-sm">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, correo o DNI..."
            className={`${ADMIN_INPUT_CLASS} pl-10`}
          />
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-xs text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-blue-950/90 bg-[#060c18]/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#040812] text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5 font-medium">Usuario</th>
                <th className="px-5 py-3.5 font-medium">Rol</th>
                <th className="px-5 py-3.5 font-medium">Perfil académico</th>
                <th className="px-5 py-3.5 font-medium">Estado</th>
                <th className="px-5 py-3.5 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No se encontraron usuarios con ese criterio.
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const roleMeta = ROLE_BADGE_MAP[item.role];
                  const isSelf = item.id === currentUserId;
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-blue-950/20"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-white">
                          {item.firstName} {item.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{item.email}</p>
                        {item.documentNumber && (
                          <p className="text-[11px] text-slate-500">
                            Doc: {item.documentNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          label={roleMeta.label}
                          tone={roleMeta.tone}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-300">
                        {item.studentProfile ? (
                          <div>
                            <p className="font-medium text-white">
                              {item.studentProfile.studentCode}
                            </p>
                            <p className="text-slate-400">
                              {item.studentProfile.program.name} &middot; Ciclo{' '}
                              {item.studentProfile.currentCycle}
                            </p>
                          </div>
                        ) : item.teacherProfile ? (
                          <div>
                            <p className="font-medium text-white">
                              {item.teacherProfile.teacherCode}
                            </p>
                            <p className="text-slate-400">
                              {item.teacherProfile.specialty}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-500">Gestión del sistema</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          label={item.isActive ? 'Activo' : 'Inactivo'}
                          tone={item.isActive ? 'emerald' : 'red'}
                        />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => void handleToggleStatus(item)}
                          className="rounded-lg border border-blue-900/70 px-3 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {item.isActive ? 'Desactivar' : 'Activar'}
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

      <Modal
        isOpen={isModalOpen}
        title={
          fixedRole
            ? `Registrar nuevo ${ROLE_BADGE_MAP[fixedRole].label.toLowerCase()}`
            : 'Registrar nuevo usuario'
        }
        subtitle="Completa los datos para habilitar su acceso al sistema."
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={(e) => void handleCreateUser(e)} className="space-y-4">
          {!fixedRole && (
            <div className="grid grid-cols-3 gap-2">
              {(['STUDENT', 'TEACHER', 'ADMIN'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormRole(role)}
                  className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                    formRole === role
                      ? 'border-blue-500 bg-blue-950/80 text-white'
                      : 'border-blue-950 bg-[#03060f] text-slate-400 hover:text-white'
                  }`}
                >
                  {ROLE_BADGE_MAP[role].label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="u-first" className={ADMIN_LABEL_CLASS}>
                Nombres
              </label>
              <input
                id="u-first"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="u-last" className={ADMIN_LABEL_CLASS}>
                Apellidos
              </label>
              <input
                id="u-last"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="u-email" className={ADMIN_LABEL_CLASS}>
                Correo institucional
              </label>
              <input
                id="u-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@nexorainstitute.edu"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="u-pass" className={ADMIN_LABEL_CLASS}>
                Contraseña inicial
              </label>
              <input
                id="u-pass"
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
              <label htmlFor="u-doc" className={ADMIN_LABEL_CLASS}>
                DNI / Documento
              </label>
              <input
                id="u-doc"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="u-phone" className={ADMIN_LABEL_CLASS}>
                Teléfono
              </label>
              <input
                id="u-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          </div>

          {formRole === 'STUDENT' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="u-program" className={ADMIN_LABEL_CLASS}>
                  Carrera / Programa
                </label>
                <select
                  id="u-program"
                  required
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className={ADMIN_INPUT_CLASS}
                >
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.code} - {program.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="u-cycle" className={ADMIN_LABEL_CLASS}>
                  Ciclo
                </label>
                <input
                  id="u-cycle"
                  type="number"
                  min={1}
                  max={12}
                  value={currentCycle}
                  onChange={(e) => setCurrentCycle(Number(e.target.value))}
                  className={ADMIN_INPUT_CLASS}
                />
              </div>
            </div>
          )}

          {formRole === 'TEACHER' && (
            <div>
              <label htmlFor="u-specialty" className={ADMIN_LABEL_CLASS}>
                Especialidad académica
              </label>
              <input
                id="u-specialty"
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ej. Desarrollo Web y Bases de Datos"
                className={ADMIN_INPUT_CLASS}
              />
            </div>
          )}

          {formError && (
            <div className="rounded-xl border border-red-900/70 bg-red-950/40 px-3.5 py-2 text-xs text-red-200">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              Guardar usuario
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
