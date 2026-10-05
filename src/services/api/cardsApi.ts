/* ==========================================================================
   CARDS API (src/services/api/cardsApi.ts)
   All endpoints require Authorization: Bearer <token> unless noted.
   ========================================================================== */

import { apiClient, getApiBaseUrl } from './client';
import {
  ApiCard,
  ApiCardsPaginatedResponse,
  ApiCardHistory,
  ApiCreateCardDto,
  ApiUpdateCardDto,
  ApiUpdateRedirectRulesDto,
  ApiBulkCreateDto,
  ApiBulkCreateResult,
  ApiCardAnalytics,
  ApiGlobalAnalytics,
  ApiSocialPageResponse,
  ExportCardsParams,
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

  // Helper to bypass limit caps by paginating until all cards are fetched
  getAllCardsForStats: async (params?: CardQueryParams): Promise<ApiCard[]> => {
    const firstPage = await cardsApi.getCards({ ...params, limit: 100 });
    let all = [...(firstPage.data ?? [])];
    const totalPages = firstPage.totalPages ?? 1;
    if (totalPages > 1) {
      const promises = [];
      for (let i = 2; i <= totalPages; i++) {
        promises.push(cardsApi.getCards({ ...params, page: i, limit: 100 }));
      }
      const results = await Promise.all(promises);
      results.forEach(res => {
        all = all.concat(res.data ?? []);
      });
    }
    return all;
  },

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

  // ── PUT /api/cards/:id/rules ─────────────────────────────────────────────
  /** Update smart redirect rules. Pass empty array to clear all rules. */
  updateRedirectRules: (id: string, dto: ApiUpdateRedirectRulesDto): Promise<ApiCard> =>
    apiClient<ApiCard>(`/cards/${id}/rules`, { method: 'PUT', body: dto }),

  // ── POST /api/cards/bulk ─────────────────────────────────────────────────
  /** Bulk-create up to 100 cards in one request. Always returns 201. */
  bulkCreateCards: (dto: ApiBulkCreateDto): Promise<ApiBulkCreateResult> =>
    apiClient<ApiBulkCreateResult>('/cards/bulk', { method: 'POST', body: dto }),

  // ── GET /api/cards/:id/analytics?days=N ─────────────────────────────────
  getCardAnalytics: (id: string, days?: number): Promise<ApiCardAnalytics> =>
    apiClient<ApiCardAnalytics>(`/cards/${id}/analytics`, {
      params: days !== undefined ? { days } : undefined,
    }),

  // ── GET /api/cards/analytics/global?days=N ──────────────────────────────
  getGlobalAnalytics: (days?: number): Promise<ApiGlobalAnalytics> =>
    apiClient<ApiGlobalAnalytics>('/cards/analytics/global', {
      params: days !== undefined ? { days } : undefined,
    }),

  // ── GET /social/:card_code  (🔓 Public — no JWT) ─────────────────────────
  getSocialPage: (cardCode: string): Promise<ApiSocialPageResponse> =>
    apiClient<ApiSocialPageResponse>(`/social/${cardCode}`, { requiresAuth: false }),

  // ── GET /api/export/cards ────────────────────────────────────────────────
  /** Export all cards as an Excel file (.xlsx). Returns a Blob. */
  exportCardsExcel: (params?: ExportCardsParams): Promise<Blob> =>
    apiClient<Blob>('/export/cards', {
      responseType: 'blob',
      params: {
        status:    params?.status,
        card_type: params?.card_type,
      },
    }),

  // ── GET /api/export/cards/:id/report?days=N ─────────────────────────────
  /** Export a detailed 3-sheet Excel report for a single card. Returns a Blob. */
  exportCardReport: (id: string, days?: number): Promise<Blob> =>
    apiClient<Blob>(`/export/cards/${id}/report`, {
      responseType: 'blob',
      params: days !== undefined ? { days } : undefined,
    }),
};
