/* ==========================================================================
   CUSTOMERS API (src/services/api/customersApi.ts)
   All endpoints require Authorization: Bearer <token>.
   ========================================================================== */

import { apiClient, getApiBaseUrl } from './client';
import {
  ApiCustomer,
  ApiTrashCustomer,
  ApiCustomersPaginatedResponse,
  ApiCustomerDetailResponse,
  ApiCreateCustomerDto,
  ApiUpdateCustomerDto,
  ApiAssignCardsDto,
  CustomerQueryParams,
  ApiCustomerHistory,
  SendCustomerEmailDto,
  SendCustomerEmailResponse,
  BroadcastEmailDto,
  BroadcastEmailResponse,
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
  deleteCustomer: (id: string, password?: string): Promise<{ message?: string; customer_id?: string }> =>
    apiClient<{ message?: string; customer_id?: string }>(`/customers/${id}`, {
      method: 'DELETE',
      body: password ? { password } : undefined,
      skipUnauthorizedRedirect: true,
    }),

  // ── GET /api/customers/trash ─────────────────────────────────────────────
  getTrash: (): Promise<{ data?: ApiTrashCustomer[] } | ApiTrashCustomer[]> =>
    apiClient<{ data?: ApiTrashCustomer[] } | ApiTrashCustomer[]>('/customers/trash'),

  // ── POST /api/customers/:id/restore ──────────────────────────────────────
  restoreCustomer: (id: string): Promise<{ message?: string }> =>
    apiClient<{ message?: string }>(`/customers/${id}/restore`, {
      method: 'POST',
    }),

  // ── GET /api/customers/backup (Download JSON) ────────────────────────────
  getBackupUrl: (): string => `${getApiBaseUrl()}/customers/backup`,

  downloadBackup: (): Promise<Blob> =>
    apiClient<Blob>('/customers/backup', { responseType: 'blob' }),

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

  // ── GET /api/customers/:id/history ───────────────────────────────────────
  getCustomerHistory: (id: string): Promise<ApiCustomerHistory[]> =>
    apiClient<ApiCustomerHistory[]>(`/customers/${id}/history`),

  // ── POST /api/customers/:id/send-email ───────────────────────────────────
  sendCustomerEmail: (id: string, dto: SendCustomerEmailDto): Promise<SendCustomerEmailResponse> =>
    apiClient<SendCustomerEmailResponse>(`/customers/${id}/send-email`, {
      method: 'POST',
      body: dto,
    }),

  // ── POST /api/customers/broadcast-email ──────────────────────────────────
  broadcastEmail: (dto: BroadcastEmailDto): Promise<BroadcastEmailResponse> =>
    apiClient<BroadcastEmailResponse>('/customers/broadcast-email', {
      method: 'POST',
      body: dto,
    }),
};

