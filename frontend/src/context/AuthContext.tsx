import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiRequest, TOKEN_STORAGE_KEY } from '../services/apiClient';
import type {
  AuthSessionData,
  AuthenticatedUser,
  LoginCredentials,
} from '../types/auth.types';

interface AuthContextValue {
  readonly user: AuthenticatedUser | null;
  readonly isBootstrapping: boolean;
  readonly login: (credentials: LoginCredentials) => Promise<void>;
  readonly logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  readonly children: ReactNode;
}

/**
 * Manages persisted JWT authentication state across the Nexora Institute frontend.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);

  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!existingToken) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;
    apiRequest<{ user: AuthenticatedUser }>('/auth/me')
      .then((data) => {
        if (!cancelled) {
          setUser(data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (!cancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await apiRequest<AuthSessionData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isBootstrapping, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook for reading and mutating authenticated user state.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
