/* ==========================================================================
   CATEGORIES API SERVICE (src/services/api/categoriesApi.ts)
   Full CRUD for /api/categories — all endpoints require auth.
   ========================================================================== */

import { apiClient } from './client';
import {
  ApiCategory,
  ApiCategoriesPaginatedResponse,
  ApiCreateCategoryDto,
  ApiUpdateCategoryDto,
} from '../../types';

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export const categoriesApi = {
  /**
   * GET /api/categories
   * List categories with pagination and optional filtering.
   * AUTH REQUIRED.
   */
  getCategories: async (params?: CategoryQueryParams): Promise<ApiCategoriesPaginatedResponse> => {
    return apiClient<ApiCategoriesPaginatedResponse>('/categories', {
      method: 'GET',
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 100,
        search: params?.search,
        is_active: params?.is_active !== undefined ? String(params.is_active) : undefined,
      },
      requiresAuth: true,
    });
  },

  /**
   * GET /api/categories/:id
   * Get a single category by MongoDB _id.
   * AUTH REQUIRED.
   */
  getCategoryById: async (id: string): Promise<ApiCategory> => {
    return apiClient<ApiCategory>(`/categories/${id}`, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * POST /api/categories
   * Create a new category.
   * AUTH REQUIRED.
   */
  createCategory: async (dto: ApiCreateCategoryDto): Promise<ApiCategory> => {
    return apiClient<ApiCategory>('/categories', {
      method: 'POST',
      body: dto,
      requiresAuth: true,
    });
  },

  /**
   * PUT /api/categories/:id
   * Update a category. All fields optional.
   * AUTH REQUIRED.
   */
  updateCategory: async (id: string, dto: ApiUpdateCategoryDto): Promise<ApiCategory> => {
    return apiClient<ApiCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: dto,
      requiresAuth: true,
    });
  },

  /**
   * DELETE /api/categories/:id
   * Permanently delete a category.
   * AUTH REQUIRED.
   */
  deleteCategory: async (id: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },
};
