/* ==========================================================================
   AUTH CONTEXT & STATE MANAGEMENT (src/context/AuthContext.tsx)
   ========================================================================== */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api/authApi';
import { ApiAdmin } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: ApiAdmin | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authApi.isAuthenticated());
  const [admin, setAdmin] = useState<ApiAdmin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    if (!authApi.isAuthenticated()) {
      setIsAuthenticated(false);
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profile = await authApi.getMe();
      setAdmin(profile);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to verify session via /api/auth/me:', err);
      authApi.logout();
      setIsAuthenticated(false);
      setAdmin(null);
      setError(err?.message || 'Session expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen to global 401 Unauthorized API events
    const handleUnauthorized = () => {
      authApi.logout();
      setIsAuthenticated(false);
      setAdmin(null);
      setError('انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.');
    };

    window.addEventListener('api:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('api:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(username, password);
      setIsAuthenticated(true);
      if (res.admin) {
        setAdmin(res.admin);
      } else {
        await checkAuthStatus();
      }
    } catch (err: any) {
      setIsAuthenticated(false);
      setAdmin(null);
      const msg = err?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setAdmin(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        admin,
        loading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
