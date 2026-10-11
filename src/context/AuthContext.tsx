/* ==========================================================================
   AUTH CONTEXT (src/context/AuthContext.tsx)
   Manages admin session state. Verifies token on mount via GET /api/auth/me.
   Listens to global api:unauthorized events to force logout.
   ========================================================================== */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, TOKEN_KEY as TOKEN_STORAGE_KEY } from '../services/api';
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
  updateAdmin: (admin: ApiAdmin | Partial<ApiAdmin>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'nfc_admin_profile';

const getStoredAdmin = (): ApiAdmin | null => {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredAdmin = (admin: ApiAdmin | null) => {
  try {
    if (admin) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  } catch { /* ignore */ }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => ({
    isAuthenticated: authApi.isAuthenticated(),
    admin: getStoredAdmin(),
    loading: true,
    error: null,
  }));

  const setPartial = (partial: Partial<AuthState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  // Verify token is still valid by calling GET /api/auth/profile or /api/auth/me
  const verifySession = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setStoredAdmin(null);
      setPartial({ isAuthenticated: false, admin: null, loading: false });
      return;
    }
    try {
      let admin: ApiAdmin;
      try {
        admin = await authApi.getProfile();
      } catch (err: any) {
        if (err?.statusCode === 401) throw err;
        admin = await authApi.getMe();
      }
      setStoredAdmin(admin);
      setPartial({ isAuthenticated: true, admin, loading: false, error: null });
    } catch (err: any) {
      // ONLY log out if strictly 401 Unauthorized
      if (err?.statusCode === 401) {
        authApi.logout();
        setStoredAdmin(null);
        setPartial({ isAuthenticated: false, admin: null, loading: false });
      } else {
        // Network drop or Koyeb cold start: keep session intact with cached profile!
        console.warn('Session verification encountered transient error, keeping session:', err);
        setPartial({ isAuthenticated: true, loading: false });
      }
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Global 401 listener — any API call that returns 401 fires this event
    const handle401 = () => {
      authApi.logout();
      setStoredAdmin(null);
      setPartial({
        isAuthenticated: false,
        admin: null,
        error: 'انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.',
      });
    };

    // Cross-tab sync — login/logout in another tab is reflected here
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== TOKEN_STORAGE_KEY) return;
      if (!e.newValue) {
        setStoredAdmin(null);
        setPartial({ isAuthenticated: false, admin: null, loading: false });
      } else {
        setPartial({ isAuthenticated: true, admin: getStoredAdmin() });
        verifySession();
      }
    };

    // Token expiry check — the JWT exp is enforced client-side too
    const expiryTimer = window.setInterval(() => {
      setState((prev) => {
        if (prev.isAuthenticated && !authApi.isAuthenticated()) {
          setStoredAdmin(null);
          return {
            ...prev,
            isAuthenticated: false,
            admin: null,
            loading: false,
            error: 'انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.',
          };
        }
        return prev;
      });
    }, 30_000);

    window.addEventListener('api:unauthorized', handle401);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('api:unauthorized', handle401);
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(expiryTimer);
    };
  }, [verifySession]);

  const login = async (username: string, password: string) => {
    setPartial({ loading: true, error: null });
    try {
      const res = await authApi.login(username, password);
      if (!authApi.isAuthenticated()) {
        throw new Error('لم يتم استلام رمز الدخول من السيرفر. حاول مجدداً.');
      }
      // Token is stored by authApi.login; fetch full profile
      let admin = res.admin;
      if (!admin) {
        try {
          admin = await authApi.getProfile();
        } catch {
          admin = await authApi.getMe();
        }
      }
      setStoredAdmin(admin);
      setPartial({ isAuthenticated: true, admin, loading: false, error: null });
    } catch (err: any) {
      const msg = err?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
      authApi.logout();
      setStoredAdmin(null);
      setPartial({ isAuthenticated: false, admin: null, loading: false, error: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    authApi.logout();
    setStoredAdmin(null);
    setPartial({ isAuthenticated: false, admin: null, error: null });
  };

  const clearError = () => setPartial({ error: null });

  const updateAdmin = (admin: ApiAdmin | Partial<ApiAdmin>) => {
    setState((prev) => {
      const updated = prev.admin ? { ...prev.admin, ...admin } : (admin as ApiAdmin);
      setStoredAdmin(updated);
      return {
        ...prev,
        admin: updated,
      };
    });
  };

  const refreshProfile = async () => {
    try {
      let admin: ApiAdmin;
      try {
        admin = await authApi.getProfile();
      } catch {
        admin = await authApi.getMe();
      }
      setStoredAdmin(admin);
      setPartial({ admin });
    } catch {
      // Ignore or let caller handle
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError, updateAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
