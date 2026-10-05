/* ==========================================================================
   AUTH API (src/services/api/authApi.ts)
   POST /api/auth/login   — no token required
   GET  /api/auth/me      — token required
   ========================================================================== */

import { apiClient, setToken, clearToken, isAuthenticated as _isAuth } from './client';
import {
  ApiAuthResponse,
  ApiAdmin,
  AdminSettings,
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateSettingsDto,
} from '../../types';

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

  /**
   * GET /api/auth/profile
   * Returns current admin profile with settings and details.
   */
  getProfile: async (): Promise<ApiAdmin> =>
    apiClient<ApiAdmin>('/auth/profile', { requiresAuth: true }),

  /**
   * PUT /api/auth/profile
   * Updates admin name, email, username, or avatar.
   */
  updateProfile: async (dto: UpdateProfileDto): Promise<ApiAdmin> =>
    apiClient<ApiAdmin>('/auth/profile', {
      method: 'PUT',
      body: dto,
      requiresAuth: true,
    }),

  /**
   * PUT /api/auth/change-password
   * Changes current admin password.
   */
  changePassword: async (dto: ChangePasswordDto): Promise<{ message: string }> =>
    apiClient<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: dto,
      requiresAuth: true,
    }),

  /**
   * GET /api/auth/settings
   * Returns platform settings.
   */
  getSettings: async (): Promise<AdminSettings> =>
    apiClient<AdminSettings>('/auth/settings', { requiresAuth: true }),

  /**
   * PUT /api/auth/settings
   * Updates platform settings.
   */
  updateSettings: async (dto: UpdateSettingsDto): Promise<AdminSettings> =>
    apiClient<AdminSettings>('/auth/settings', {
      method: 'PUT',
      body: dto,
      requiresAuth: true,
    }),

  /** Clear stored token */
  logout: (): void => clearToken(),

  /** True if a token exists in storage */
  isAuthenticated: (): boolean => _isAuth(),
};
