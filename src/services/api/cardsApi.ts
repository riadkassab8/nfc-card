/* ==========================================================================
   CARDS API (src/services/api/cardsApi.ts)
   All endpoints require Authorization: Bearer <token>
   ========================================================================== */

import { apiClient, getApiBaseUrl } from './client';
import {
  ApiCard,
  ApiCardsPaginatedResponse,
  ApiCardHistory,
  ApiCreateCardDto,
  ApiUpdateCardDto,
  CardQueryParams,
} from '../../types';

export const cardsApi = {
  // ── POST /api/cards ──────────────────────────────────────────────────────
  createCard: (dto: ApiCreateCardDto): Promise<ApiCard> =>
    apiClient<ApiCard>('/cards', { method: 'POST', body: dto }),

  // ── GET /api/cards ───────────────────────────────────────────────────────
  getCards: (params?: CardQueryParams): Promise<ApiCardsPaginatedResponse> =>
    apiClient<ApiCardsPaginatedResponse>('/cards', {
      params: {
        page:        params?.page        ?? 1,
        limit:       params?.limit       ?? 50,
        search:      params?.search,
        status:      params?.status,
        card_type:   params?.card_type,
        category_id: params?.category_id,
      },
    }),

  // ── GET /api/cards (Public) ──────────────────────────────────────────────
  getPublicCards: (params?: CardQueryParams): Promise<ApiCardsPaginatedResponse> =>
    apiClient<ApiCardsPaginatedResponse>('/cards', {
      requiresAuth: false,
      params: {
        page:        params?.page        ?? 1,
        limit:       params?.limit       ?? 50,
        search:      params?.search,
        status:      params?.status,
        card_type:   params?.card_type,
        category_id: params?.category_id,
      },
    }),

  // ── GET /api/cards/:id ───────────────────────────────────────────────────
  getCardById: (id: string): Promise<ApiCard> =>
    apiClient<ApiCard>(`/cards/${id}`),

  // ── GET /api/cards/:id/history ───────────────────────────────────────────
  getCardHistory: (id: string): Promise<ApiCardHistory[]> =>
    apiClient<ApiCardHistory[]>(`/cards/${id}/history`),

  // ── GET /api/cards/:id/qr  → PNG blob ────────────────────────────────────
  getCardQrBlob: (id: string): Promise<Blob> =>
    apiClient<Blob>(`/cards/${id}/qr`, { responseType: 'blob' }),

  /** Direct download URL — no token needed per API docs */
  getCardQrUrl: (id: string): string => `${getApiBaseUrl()}/cards/${id}/qr`,

  // ── PUT /api/cards/:id ───────────────────────────────────────────────────
  updateCard: (id: string, dto: ApiUpdateCardDto): Promise<ApiCard> =>
    apiClient<ApiCard>(`/cards/${id}`, { method: 'PUT', body: dto }),

  // ── PUT /api/cards/:id/toggle ────────────────────────────────────────────
  toggleCard: (id: string): Promise<ApiCard> =>
    apiClient<ApiCard>(`/cards/${id}/toggle`, { method: 'PUT' }),

  // ── PUT /api/cards/:id/redirect ──────────────────────────────────────────
  changeRedirect: (id: string, redirectUrl: string): Promise<ApiCard> =>
    apiClient<ApiCard>(`/cards/${id}/redirect`, {
      method: 'PUT',
      body: { redirect_url: redirectUrl },
    }),

  // ── POST /api/cards/:id/renew ────────────────────────────────────────────
  renewCard: (id: string): Promise<ApiCard> =>
    apiClient<ApiCard>(`/cards/${id}/renew`, { method: 'POST' }),

  // ── DELETE /api/cards/:id ────────────────────────────────────────────────
  deleteCard: (id: string): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/cards/${id}`, { method: 'DELETE' }),
};
