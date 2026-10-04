/* ==========================================================================
   CATEGORIES API (src/services/api/categoriesApi.ts)
   All endpoints require Authorization: Bearer <token>
   ========================================================================== */

import { apiClient } from './client';
import {
  ApiCategory,
  ApiCategoriesPaginatedResponse,
  ApiCreateCategoryDto,
  ApiUpdateCategoryDto,
  CategoryQueryParams,
} from '../../types';

export const categoriesApi = {
  // ── GET /api/categories ──────────────────────────────────────────────────
  getCategories: (params?: CategoryQueryParams): Promise<ApiCategoriesPaginatedResponse> =>
    apiClient<ApiCategoriesPaginatedResponse>('/categories', {
      params: {
        page:      params?.page  ?? 1,
        limit:     params?.limit ?? 100,
        search:    params?.search,
        is_active: params?.is_active !== undefined ? String(params.is_active) : undefined,
      },
    }),

  // ── GET /api/categories/:id ──────────────────────────────────────────────
  getCategoryById: (id: string): Promise<ApiCategory> =>
    apiClient<ApiCategory>(`/categories/${id}`),

  // ── POST /api/categories ─────────────────────────────────────────────────
  createCategory: (dto: ApiCreateCategoryDto): Promise<ApiCategory> =>
    apiClient<ApiCategory>('/categories', { method: 'POST', body: dto }),

  // ── PUT /api/categories/:id ──────────────────────────────────────────────
  updateCategory: (id: string, dto: ApiUpdateCategoryDto): Promise<ApiCategory> =>
    apiClient<ApiCategory>(`/categories/${id}`, { method: 'PUT', body: dto }),

  // ── DELETE /api/categories/:id ───────────────────────────────────────────
  deleteCategory: (id: string): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/categories/${id}`, { method: 'DELETE' }),
};
