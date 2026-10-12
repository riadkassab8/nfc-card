/* ==========================================================================
   USERS API (src/services/api/usersApi.ts)
   Full management for Super Admins, Staff members, and Merchants.
   ========================================================================== */

import { apiClient } from './client';
import {
  ApiAdmin,
  CreateUserPayload,
  UpdateUserPayload,
  UsersListResponse,
  UserStatsSummary,
  UserStatus,
} from '../../types';

export const usersApi = {
  /**
   * جلب قائمة المستخدمين مع الفلاتر والترقيم
   */
  getUsers: async (params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<UsersListResponse> => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.role && params.role !== 'all') sp.append('role', params.role);
    if (params?.status && params.status !== 'all') sp.append('status', params.status);
    if (params?.page) sp.append('page', String(params.page));
    if (params?.limit) sp.append('limit', String(params.limit));

    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return apiClient<UsersListResponse>(`/users${qs}`, { requiresAuth: true });
  },

  /**
   * جلب ملخص إحصائيات المستخدمين
   */
  getUserStats: async (): Promise<UserStatsSummary> => {
    return apiClient<UserStatsSummary>('/users/stats/summary', { requiresAuth: true });
  },

  /**
   * جلب تفاصيل مستخدم محدد
   */
  getUser: async (id: string): Promise<ApiAdmin> => {
    return apiClient<ApiAdmin>(`/users/${id}`, { requiresAuth: true });
  },

  /**
   * إنشاء مستخدم جديد (موظف أو صاحب محل أو مدير)
   */
  createUser: async (payload: CreateUserPayload): Promise<ApiAdmin> => {
    return apiClient<ApiAdmin>('/users', {
      method: 'POST',
      body: payload,
      requiresAuth: true,
    });
  },

  /**
   * تحديث بيانات وصلاحيات مستخدم
   */
  updateUser: async (id: string, payload: UpdateUserPayload): Promise<ApiAdmin> => {
    return apiClient<ApiAdmin>(`/users/${id}`, {
      method: 'PUT',
      body: payload,
      requiresAuth: true,
    });
  },

  /**
   * تفعيل أو تجميد حساب مستخدم
   */
  toggleUserStatus: async (
    id: string,
    status: UserStatus,
  ): Promise<{ message: string; user: ApiAdmin }> => {
    return apiClient<{ message: string; user: ApiAdmin }>(`/users/${id}/status`, {
      method: 'PATCH',
      body: { status },
      requiresAuth: true,
    });
  },

  /**
   * حذف مستخدم
   */
  deleteUser: async (id: string): Promise<{ message: string; deletedId: string }> => {
    return apiClient<{ message: string; deletedId: string }>(`/users/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },
};
