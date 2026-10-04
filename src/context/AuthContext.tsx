/* ==========================================================================
   AUTH CONTEXT (src/context/AuthContext.tsx)
   Manages admin session state. Verifies token on mount via GET /api/auth/me.
   Listens to global api:unauthorized events to force logout.
   ========================================================================== */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { ApiAdmin } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  admin: ApiAdmin | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: authApi.isAuthenticated(),
    admin: null,
    loading: true,
    error: null,
  });

  const setPartial = (partial: Partial<AuthState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  // Verify token is still valid by calling GET /api/auth/me
  const verifySession = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setPartial({ isAuthenticated: false, admin: null, loading: false });
      return;
    }
    try {
      const admin = await authApi.getMe();
      setPartial({ isAuthenticated: true, admin, loading: false, error: null });
    } catch {
      authApi.logout();
      setPartial({ isAuthenticated: false, admin: null, loading: false });
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Global 401 listener — any API call that returns 401 fires this event
    const handle401 = () => {
      authApi.logout();
      setPartial({
        isAuthenticated: false,
        admin: null,
        error: 'انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.',
      });
    };

    window.addEventListener('api:unauthorized', handle401);
    return () => window.removeEventListener('api:unauthorized', handle401);
  }, [verifySession]);

  const login = async (username: string, password: string) => {
    setPartial({ loading: true, error: null });
    try {
      const res = await authApi.login(username, password);
      // Token is stored by authApi.login; fetch full profile
      const admin = res.admin ?? (await authApi.getMe());
      setPartial({ isAuthenticated: true, admin, loading: false, error: null });
    } catch (err: any) {
      const msg = err?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
      setPartial({ isAuthenticated: false, admin: null, loading: false, error: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    authApi.logout();
    setPartial({ isAuthenticated: false, admin: null, error: null });
  };

  const clearError = () => setPartial({ error: null });

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
