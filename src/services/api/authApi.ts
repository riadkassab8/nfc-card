/* ==========================================================================
   AUTHENTICATION API SERVICE (src/services/api/authApi.ts)
   ========================================================================== */

import { apiClient, setStoredToken, clearStoredToken, getStoredToken } from './client';
import { ApiAuthResponse, ApiAdmin } from '../../types';

export const authApi = {
  /**
   * POST /api/auth/login
   * Login as admin and receive a JWT token.
   * NO TOKEN REQUIRED.
   */
  login: async (username: string, password: string): Promise<ApiAuthResponse> => {
    const data = await apiClient<ApiAuthResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
      requiresAuth: false, // Explicitly NO TOKEN
    });

    if (data && data.access_token) {
      setStoredToken(data.access_token);
    }
    return data;
  },

  /**
   * GET /api/auth/me
   * Get current admin profile.
   * TOKEN REQUIRED (Authorization: Bearer <access_token>).
   */
  getMe: async (): Promise<ApiAdmin> => {
    return apiClient<ApiAdmin>('/auth/me', {
      method: 'GET',
      requiresAuth: true, // TOKEN REQUIRED
    });
  },

  /**
   * Logout Admin locally by clearing token
   */
  logout: (): void => {
    clearStoredToken();
  },

  /**
   * Check if token exists in storage
   */
  isAuthenticated: (): boolean => {
    return !!getStoredToken();
  },
};
