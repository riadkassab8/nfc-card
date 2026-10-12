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
   * PATCH /api/notifications/read-all
   * تحديد جميع الإشعارات كمقروءة
   */
  markAllAsRead: (): Promise<{ modifiedCount: number }> =>
    apiClient<{ modifiedCount: number }>('/notifications/read-all', {
      method: 'PATCH',
    }),

  /**
   * PATCH /api/notifications/:id/read
   * تحديد إشعار محدد كمقروء
   */
  markAsRead: (id: string): Promise<ApiNotification> =>
    apiClient<ApiNotification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  /**
   * DELETE /api/notifications/:id
   * حذف إشعار
   */
  deleteNotification: (id: string): Promise<{ success: boolean }> =>
    apiClient<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};
