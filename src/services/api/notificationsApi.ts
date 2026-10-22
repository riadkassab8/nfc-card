/* ==========================================================================
   NOTIFICATIONS API (src/services/api/notificationsApi.ts)
   All endpoints require Authorization: Bearer <token>
   ========================================================================== */

import { apiClient } from './client';
import { ApiNotification, ApiNotificationsResponse } from '../../types';

export const notificationsApi = {
  /**
   * GET /api/notifications
   * جلب قائمة الإشعارات وعدد غير المقروء
   */
  getNotifications: (limit = 40): Promise<ApiNotificationsResponse> =>
    apiClient<ApiNotificationsResponse>('/notifications', {
      params: { limit },
    }),

  /**
   * PATCH / PUT / POST /api/notifications/read-all
   * تحديد جميع الإشعارات كمقروءة (مع محاولة احتياطية بـ POST لضمان التوافق المطلق)
   */
  markAllAsRead: async (): Promise<{ modifiedCount: number }> => {
    try {
      return await apiClient<{ modifiedCount: number }>('/notifications/read-all', {
        method: 'PATCH',
      });
    } catch (err) {
      return await apiClient<{ modifiedCount: number }>('/notifications/read-all', {
        method: 'POST',
      });
    }
  },

  /**
   * PATCH / PUT / POST /api/notifications/:id/read
   * تحديد إشعار محدد كمقروء (مع محاولة احتياطية بـ POST لضمان التوافق المطلق)
   */
  markAsRead: async (id: string): Promise<ApiNotification> => {
    try {
      return await apiClient<ApiNotification>(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch (err) {
      return await apiClient<ApiNotification>(`/notifications/${id}/read`, {
        method: 'POST',
      });
    }
  },

  /**
   * DELETE /api/notifications/:id
   * حذف إشعار
   */
  deleteNotification: (id: string): Promise<{ success: boolean }> =>
    apiClient<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};
