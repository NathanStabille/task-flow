import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type LoginCredentials } from '../services/auth';
import { UNAUTHORIZED_EVENT } from '../services/api';
import type { AuthUser } from '../types';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const handleUnauthorized = () => setUser(null);

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    authService
      .me(controller.signal)
      .then((response) => setUser(response.user))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => {
      controller.abort();
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
