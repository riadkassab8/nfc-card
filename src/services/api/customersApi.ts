/* ==========================================================================
   CUSTOMERS API (src/services/api/customersApi.ts)
   All endpoints require Authorization: Bearer <token>.
   ========================================================================== */

import { apiClient } from './client';
import {
  ApiCustomer,
  ApiCustomersPaginatedResponse,
  ApiCustomerDetailResponse,
  ApiCreateCustomerDto,
  ApiUpdateCustomerDto,
  ApiAssignCardsDto,
  CustomerQueryParams,
} from '../../types';

export const customersApi = {
  // ── GET /api/customers ───────────────────────────────────────────────────
  getCustomers: (params?: CustomerQueryParams): Promise<ApiCustomersPaginatedResponse> =>
    apiClient<ApiCustomersPaginatedResponse>('/customers', {
      params: {
        page:   params?.page  ?? 1,
        limit:  params?.limit ?? 10,
        search: params?.search,
      },
    }),

  // ── GET /api/customers/:id ───────────────────────────────────────────────
  getCustomerById: (id: string): Promise<ApiCustomerDetailResponse> =>
    apiClient<ApiCustomerDetailResponse>(`/customers/${id}`),

  // ── POST /api/customers ──────────────────────────────────────────────────
  createCustomer: (dto: ApiCreateCustomerDto): Promise<ApiCustomer> =>
    apiClient<ApiCustomer>('/customers', {
      method: 'POST',
      body: dto,
    }),

  // ── PUT /api/customers/:id ───────────────────────────────────────────────
  updateCustomer: (id: string, dto: ApiUpdateCustomerDto): Promise<ApiCustomer> =>
    apiClient<ApiCustomer>(`/customers/${id}`, {
      method: 'PUT',
      body: dto,
    }),

  // ── DELETE /api/customers/:id ────────────────────────────────────────────
  deleteCustomer: (id: string): Promise<{ message?: string }> =>
    apiClient<{ message?: string }>(`/customers/${id}`, {
      method: 'DELETE',
    }),

  // ── POST /api/customers/:id/assign-cards ─────────────────────────────────
  assignCards: (id: string, dto: ApiAssignCardsDto): Promise<{ message?: string; assigned_count?: number }> =>
    apiClient<{ message?: string; assigned_count?: number }>(`/customers/${id}/assign-cards`, {
      method: 'POST',
      body: dto,
    }),

  // ── DELETE /api/customers/:id/cards/:cardId ──────────────────────────────
  unassignCard: (id: string, cardId: string): Promise<{ message?: string }> =>
    apiClient<{ message?: string }>(`/customers/${id}/cards/${cardId}`, {
      method: 'DELETE',
    }),
};
