/* ==========================================================================
   BUSINESS FIELDS API (src/services/api/businessFieldsApi.ts)
   ========================================================================== */

import { apiClient } from './client';
import {
  ApiBusinessField,
  CreateBusinessFieldDto,
  UpdateBusinessFieldDto,
} from '../../types';

export interface BusinessFieldsQueryParams {
  section?: string;
  is_active?: boolean;
  search?: string;
}

export const businessFieldsApi = {
  // ── GET /api/business-fields ─────────────────────────────────────────────
  getFields: (params?: BusinessFieldsQueryParams): Promise<ApiBusinessField[]> =>
    apiClient<ApiBusinessField[]>('/business-fields', {
      params: {
        section: params?.section,
        is_active: params?.is_active,
        search: params?.search,
      },
    }),

  // ── GET /api/business-fields/public ──────────────────────────────────────
  getPublicFields: (): Promise<ApiBusinessField[]> =>
    apiClient<ApiBusinessField[]>('/business-fields/public'),

  // ── GET /api/business-fields/:id ─────────────────────────────────────────
  getFieldById: (id: string): Promise<ApiBusinessField> =>
    apiClient<ApiBusinessField>(`/business-fields/${id}`),

  // ── POST /api/business-fields ────────────────────────────────────────────
  createField: (dto: CreateBusinessFieldDto): Promise<ApiBusinessField> =>
    apiClient<ApiBusinessField>('/business-fields', {
      method: 'POST',
      body: dto,
    }),

  // ── PUT /api/business-fields/:id ─────────────────────────────────────────
  updateField: (id: string, dto: UpdateBusinessFieldDto): Promise<ApiBusinessField> =>
    apiClient<ApiBusinessField>(`/business-fields/${id}`, {
      method: 'PUT',
      body: dto,
    }),

  // ── DELETE /api/business-fields/:id ──────────────────────────────────────
  deleteField: (id: string): Promise<{ success: boolean; message: string }> =>
    apiClient<{ success: boolean; message: string }>(`/business-fields/${id}`, {
      method: 'DELETE',
    }),

  // ── PATCH /api/business-fields/:id/toggle ────────────────────────────────
  toggleField: (id: string): Promise<ApiBusinessField> =>
    apiClient<ApiBusinessField>(`/business-fields/${id}/toggle`, {
      method: 'PATCH',
    }),

  // ── PATCH /api/business-fields/reorder ────────────────────────────────────
  reorderFields: (items: { id: string; order: number }[]): Promise<{ success: boolean }> =>
    apiClient<{ success: boolean }>('/business-fields/reorder', {
      method: 'PATCH',
      body: { items },
    }),
};
