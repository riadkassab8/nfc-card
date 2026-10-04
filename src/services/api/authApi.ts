/* ==========================================================================
   AUTH API (src/services/api/authApi.ts)
   POST /api/auth/login   — no token required
   GET  /api/auth/me      — token required
   ========================================================================== */

import { apiClient, setToken, clearToken, isAuthenticated as _isAuth } from './client';
import { ApiAuthResponse, ApiAdmin } from '../../types';

export const authApi = {
  /**
   * POST /api/auth/login
   * Returns access_token + admin object. Stores token locally.
   */
  login: async (username: string, password: string): Promise<ApiAuthResponse> => {
    const data = await apiClient<ApiAuthResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
      requiresAuth: false,
    });
    if (data?.access_token) setToken(data.access_token);
    return data;
  },

  /**
   * GET /api/auth/me
   * Returns current admin profile.
   */
  getMe: async (): Promise<ApiAdmin> =>
    apiClient<ApiAdmin>('/auth/me', { requiresAuth: true }),

  /** Clear stored token */
  logout: (): void => clearToken(),

  /** True if a token exists in storage */
  isAuthenticated: (): boolean => _isAuth(),
};
