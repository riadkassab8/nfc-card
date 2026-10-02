/* ==========================================================================
   CARDS API SERVICE (src/services/api/cardsApi.ts)
   ========================================================================== */

import { apiClient, getApiBaseUrl } from './client';
import {
  ApiCard,
  ApiCardsPaginatedResponse,
  ApiCreateCardDto,
  ApiUpdateCardDto,
} from '../../types';

export interface CardQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  card_type?: string;
}

export const cardsApi = {
  /**
   * POST /api/cards
   * Create a new card.
   * TOKEN REQUIRED.
   */
  createCard: async (dto: ApiCreateCardDto): Promise<ApiCard> => {
    return apiClient<ApiCard>('/cards', {
      method: 'POST',
      body: dto,
      requiresAuth: true,
    });
  },

  /**
   * GET /api/cards
   * Get all cards with pagination, search, and filtering.
   * TOKEN REQUIRED.
   */
  getCards: async (params?: CardQueryParams): Promise<ApiCardsPaginatedResponse> => {
    return apiClient<ApiCardsPaginatedResponse>('/cards', {
      method: 'GET',
      params: {
        page: params?.page || 1,
        limit: params?.limit || 50,
        search: params?.search,
        status: params?.status,
        card_type: params?.card_type,
      },
      requiresAuth: true,
    });
  },

  /**
   * GET /api/cards/:id
   * Get a single card by its MongoDB _id.
   * TOKEN REQUIRED.
   */
  getCardById: async (id: string): Promise<ApiCard> => {
    return apiClient<ApiCard>(`/cards/${id}`, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * GET /api/cards/:id/qr
   * Download the QR code image for a card as a PNG file (400x400px, Level H).
   * TOKEN REQUIRED.
   */
  getCardQrBlob: async (id: string): Promise<Blob> => {
    return apiClient<Blob>(`/cards/${id}/qr`, {
      method: 'GET',
      responseType: 'blob',
      requiresAuth: true,
    });
  },

  /**
   * Helper to get direct URL for downloading QR PNG image directly
   * NO TOKEN REQUIRED.
   */
  getCardQrDownloadUrl: (id: string): string => {
    return `${getApiBaseUrl()}/cards/${id}/qr`;
  },

  /**
   * PUT /api/cards/:id
   * Update a card's fields.
   * TOKEN REQUIRED.
   */
  updateCard: async (id: string, dto: ApiUpdateCardDto): Promise<ApiCard> => {
    return apiClient<ApiCard>(`/cards/${id}`, {
      method: 'PUT',
      body: dto,
      requiresAuth: true,
    });
  },

  /**
   * PUT /api/cards/:id/toggle
   * Toggle card status active <-> inactive.
   * TOKEN REQUIRED.
   */
  toggleCardStatus: async (id: string): Promise<ApiCard> => {
    return apiClient<ApiCard>(`/cards/${id}/toggle`, {
      method: 'PUT',
      requiresAuth: true,
    });
  },

  /**
   * PUT /api/cards/:id/redirect
   * Change only the current_redirect_url of a card.
   * TOKEN REQUIRED.
   */
  updateRedirectUrl: async (id: string, redirectUrl: string): Promise<ApiCard> => {
    const dto = { redirect_url: redirectUrl };
    return apiClient<ApiCard>(`/cards/${id}/redirect`, {
      method: 'PUT',
      body: dto,
      requiresAuth: true,
    });
  },

  /**
   * POST /api/cards/:id/renew
   * Extend the card's subscription by 1 year.
   * TOKEN REQUIRED.
   */
  renewCardSubscription: async (id: string): Promise<ApiCard> => {
    return apiClient<ApiCard>(`/cards/${id}/renew`, {
      method: 'POST',
      requiresAuth: true,
    });
  },

  /**
   * DELETE /api/cards/:id
   * Permanently delete a card.
   * TOKEN REQUIRED.
   */
  deleteCard: async (id: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/cards/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },
};
