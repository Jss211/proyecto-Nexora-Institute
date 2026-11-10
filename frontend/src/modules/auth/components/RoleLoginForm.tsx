import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { RoleOption, UserRole } from '../../../types/auth.types';
import { RoleIcon } from './RoleIcon';

interface RoleLoginFormProps {
  readonly roleOption: RoleOption;
  readonly onBack: () => void;
}

const DEMO_CREDENTIALS: Record<
  UserRole,
  { readonly email: string; readonly password: string }
> = {
  ADMIN: { email: 'admin@nexorainstitute.edu', password: 'Admin123!' },
  TEACHER: { email: 'docente@nexorainstitute.edu', password: 'Docente123!' },
  STUDENT: { email: 'estudiante@nexorainstitute.edu', password: 'Alumno123!' },
};

/**
 * Contextual login form connected to /api/v1/auth/login for the selected role.
 */
export function RoleLoginForm({ roleOption, onBack }: RoleLoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
        expectedRole: roleOption.role,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo iniciar sesión',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFillDemo(): void {
    const demo = DEMO_CREDENTIALS[roleOption.role];
    setEmail(demo.email);
    setPassword(demo.password);
    setErrorMessage(null);
  }

  return (
    <div className="mx-auto w-full max-w-md animate-scale-in">
      <div className="relative overflow-hidden rounded-2xl border border-blue-900/70 bg-[#060c19]/95 p-7 shadow-[0_24px_60px_-15px_rgba(15,42,92,0.55)] backdrop-blur-md">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/75 to-transparent"
        />

        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors duration-200 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Cambiar rol
          </button>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={handleFillDemo}
              className="rounded-lg border border-blue-900/80 bg-blue-950/60 px-2.5 py-1 text-[11px] font-medium text-blue-300 transition-colors hover:border-blue-600 hover:text-white"
            >
              Usar cuenta demo
            </button>
          )}
        </div>

        <div className="mb-6 flex items-center gap-3.5">
          <div
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${roleOption.accentClass}`}
          >
            <RoleIcon
              role={roleOption.role}
              className={`h-5 w-5 ${roleOption.iconColorClass}`}
            />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
              Acceso {roleOption.title}
            </p>
            <h2 className="text-lg font-semibold text-white">Iniciar sesión</h2>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="portal-email"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Correo institucional
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="portal-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@nexorainstitute.edu"
                className="w-full rounded-xl border border-blue-950 bg-[#03060f] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="portal-password"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="portal-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-blue-950 bg-[#03060f] py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-600 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-blue-400"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {errorMessage !== null && (
            <div
              role="alert"
              className="rounded-xl border border-red-900/70 bg-red-950/40 px-3.5 py-2.5 text-xs leading-relaxed text-red-200 animate-fade-in"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(37,99,235,0.6)] transition-all duration-200 hover:from-blue-500 hover:to-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {isSubmitting
              ? 'Verificando acceso...'
              : `Ingresar como ${roleOption.title}`}
          </button>
        </form>
      </div>
    </div>
  );
}
