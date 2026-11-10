import { Loader2, LogOut } from 'lucide-react';
import { BrandLogo } from './components/ui/BrandLogo';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminDashboardPage } from './modules/admin';
import { PortalSelectionPage } from './modules/auth/pages/PortalSelectionPage';

function AppContent() {
  const { user, isBootstrapping, logout } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#02040a] text-white">
        <BrandLogo compact />
        <div className="inline-flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          Verificando sesión...
        </div>
      </div>
    );
  }

  if (!user) {
    return <PortalSelectionPage />;
  }

  if (user.role === 'ADMIN') {
    return <AdminDashboardPage />;
  }

  const roleTitle = user.role === 'TEACHER' ? 'Docente' : 'Estudiante';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02040a] px-4 text-center text-white">
      <BrandLogo compact />
      <div className="mt-8 max-w-md rounded-2xl border border-blue-900/70 bg-[#060c18] p-7 animate-scale-in">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Portal {roleTitle}
        </p>
        <h1 className="mt-2 text-xl font-bold">
          Hola, {user.firstName} {user.lastName}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Tu inicio de sesión está funcionando correctamente. En el próximo
          módulo construiremos las vistas exclusivas para {roleTitle}.
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-800/80 bg-blue-950/60 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-blue-500"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Volver al selector de rol
        </button>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
