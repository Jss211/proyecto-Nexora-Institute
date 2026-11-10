import { useState } from 'react';
import { BrandLogo } from '../../../components/ui/BrandLogo';
import type { UserRole } from '../../../types/auth.types';
import { RoleCard } from '../components/RoleCard';
import { RoleLoginForm } from '../components/RoleLoginForm';
import { ROLE_OPTIONS } from '../data/roleOptions';

/**
 * Nexora Institute entry portal featuring role selection and animated role login.
 */
export function PortalSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const activeRoleOption =
    ROLE_OPTIONS.find((option) => option.role === selectedRole) ?? null;

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#02040a] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Ambient dark-blue & black atmospheric glows (no violet) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-blue-900/25 blur-[130px] animate-float-slow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -right-32 h-[30rem] w-[30rem] rounded-full bg-blue-950/50 blur-[140px] animate-float-slow [animation-delay:2s]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(29,78,216,0.12),transparent_60%)]"
      />

      {/* Top spacer for vertical balance */}
      <div className="hidden sm:block" aria-hidden="true" />

      {/* Center hero section */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <BrandLogo />

        <div className="mt-8 animate-fade-up [animation-delay:60ms]">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2.5 text-sm text-slate-400 sm:text-base">
            {activeRoleOption
              ? `Ingresa tus credenciales para acceder como ${activeRoleOption.title}`
              : 'Selecciona tu rol para continuar al sistema'}
          </p>
        </div>

        <section
          aria-label="Selector de rol del instituto"
          className="mt-10 w-full"
        >
          {activeRoleOption ? (
            <RoleLoginForm
              roleOption={activeRoleOption}
              onBack={() => setSelectedRole(null)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {ROLE_OPTIONS.map((option) => (
                <RoleCard
                  key={option.role}
                  option={option}
                  onSelect={(role) => setSelectedRole(role)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Subtle institutional footer */}
      <footer className="relative z-10 mt-10 text-center text-xs text-slate-500 animate-fade-in [animation-delay:420ms]">
        Nexora Institute v1.0.0 &middot; Año Académico 2026 &middot; &copy; 2026
        Nexora Institute
      </footer>
    </div>
  );
}
