/* ==========================================================================
   USER LOGS API (src/services/api/userLogsApi.ts)
   Activity tracking & audit trail for Super Admin.
   ========================================================================== */

import { apiClient } from './client';
import {
  ApiUserLogsResponse,
  ApiUserLogsStats,
  TrackActivityPayload,
} from '../../types';

export interface QueryUserLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  username?: string;
  role?: string;
  action_type?: string;
  from_date?: string;
  to_date?: string;
}

export const userLogsApi = {
  /**
   * POST /api/user-logs/track
   * تسجيل نشاط أو مدة البقاء في الصفحة
   */
  trackActivity: (payload: TrackActivityPayload): Promise<{ log_id: string; success: boolean }> =>
    apiClient<{ log_id: string; success: boolean }>('/user-logs/track', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /**
   * GET /api/user-logs
   * استعلام سجلات النشاط (حصرياً للـ Super Admin)
   */
  getLogs: (params: QueryUserLogsParams = {}): Promise<ApiUserLogsResponse> =>
    apiClient<ApiUserLogsResponse>('/user-logs', {
      params: params as Record<string, any>,
    }),

  /**
   * GET /api/user-logs/stats
   * جلب إحصائيات النشاط اليومي (حصرياً للـ Super Admin)
   */
  getStats: (): Promise<ApiUserLogsStats> =>
    apiClient<ApiUserLogsStats>('/user-logs/stats'),

  /**
   * DELETE /api/user-logs/clear
   * حذف السجلات القديمة (حصرياً للـ Super Admin)
   */
  clearLogs: (days = 90): Promise<{ deleted_count: number }> =>
    apiClient<{ deleted_count: number }>('/user-logs/clear', {
      method: 'DELETE',
      params: { days },
    }),
};
