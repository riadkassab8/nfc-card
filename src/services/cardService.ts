/* ==========================================================================
   REAL CARD SERVICE (src/services/cardService.ts)
   Consumes the real backend Cards API endpoints:
   - POST /api/cards
   - GET /api/cards
   - GET /api/cards/:id
   - PUT /api/cards/:id
   - PUT /api/cards/:id/toggle
   - PUT /api/cards/:id/redirect
   - POST /api/cards/:id/renew
   - DELETE /api/cards/:id
   ========================================================================== */

import {
  CardItem,
  CardBatch,
  CardInventoryStats,
  BusinessData,
  Business,
  CardProductType,
  apiCardToCardItem,
  ApiCreateCardDto,
} from '../types';
import { cardsApi, CardQueryParams } from './api';
import { getCategoryConfig, resolveLandingUrl } from '../config/CategoryRegistry';

export interface ICardService {
  getAllCards(params?: CardQueryParams): Promise<CardItem[]>;
  getCardStats(): Promise<CardInventoryStats>;
  createCard(dto: ApiCreateCardDto): Promise<CardItem>;
  generateCardBatch(quantity: number, cardType?: CardProductType, categoryId?: string): Promise<{ batch: CardBatch; cards: CardItem[] }>;
  resolveCardByPayload(payload: string): Promise<CardItem | null>;
  saveCardBusinessData(cardId: string, data: BusinessData, publicUrl?: string): Promise<CardItem>;
  updateCardPublicUrl(cardId: string, publicUrl: string): Promise<CardItem>;
  getCardsByStatus(statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE'): Promise<CardItem[]>;
  resolvePublicCode(publicCode: string): Promise<{ card: CardItem; business: Business | null } | null>;
  assignCardToBusiness(cardId: string, businessId: string): Promise<CardItem>;
  toggleCardStatus(cardId: string): Promise<CardItem>;
  renewCardSubscription(cardId: string): Promise<CardItem>;
  deleteCard(cardId: string): Promise<boolean>;
}

class RealCardService implements ICardService {
  async getAllCards(params?: CardQueryParams): Promise<CardItem[]> {
    const res = await cardsApi.getCards(params);
    if (!res || !Array.isArray(res.data)) {
      return [];
    }
    return res.data.map(apiCardToCardItem);
  }

  async getCardStats(): Promise<CardInventoryStats> {
    // Fetch cards to calculate authoritative counts
    const res = await cardsApi.getCards({ limit: 100 });
    const cards = res.data || [];
    const total = res.total || cards.length;
    const active = cards.filter((c) => c.status === 'active').length;
    const inactive = total - active;

    return {
      total_cards: total,
      active_cards: active,
      inactive_cards: inactive,
      used_cards: active,
      unused_cards: inactive,
    };
  }

  async createCard(dto: ApiCreateCardDto): Promise<CardItem> {
    const createdApiCard = await cardsApi.createCard(dto);
    return apiCardToCardItem(createdApiCard);
  }

  async generateCardBatch(
    quantity: number,
    cardType: CardProductType = 'Google Review',
    categoryId?: string,
  ): Promise<{ batch: CardBatch; cards: CardItem[] }> {
    if (quantity < 1 || quantity > 500) {
      throw new Error('Quantity must be between 1 and 500');
    }

    const batchId = `BATCH-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const createdCards: CardItem[] = [];

    let startNum = Math.floor(1000 + Math.random() * 8000);
    try {
      const existing = await cardsApi.getCards({ limit: 100 });
      if (existing && Array.isArray(existing.data) && existing.data.length > 0) {
        const numbers = existing.data
          .map((c) => {
            const match = c.card_code ? c.card_code.match(/^CARD-(\d+)$/i) : null;
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((n) => !isNaN(n) && n > 0);
        if (numbers.length > 0) {
          startNum = Math.max(...numbers) + 1;
        }
      }
    } catch (e) {
      // Fallback to random 4-digit startNum
    }


    for (let i = 0; i < quantity; i++) {
      const currentNum = startNum + i;
      const cardCode = `CARD-${String(currentNum).padStart(4, '0')}`;
      const nfcUid = `NFC-${String(currentNum).padStart(8, '0')}`;

      // Generate redirect based on category
      const categoryConfig = getCategoryConfig(categoryId);
      const redirectUrl = resolveLandingUrl(cardCode, categoryConfig);

      try {
        const dto: ApiCreateCardDto = {
          card_code: cardCode,
          nfc_uid: nfcUid,
          card_type: cardType,
          current_redirect_url: redirectUrl,
        };
        if (categoryId) {
          dto.category_id = categoryId;
        }
        const newCard = await this.createCard(dto);
        createdCards.push(newCard);
      } catch (err) {
        console.error(`Failed to create card ${cardCode} in batch:`, err);
        throw err;
      }
    }

    return {
      batch: {
        id: batchId,
        quantity: createdCards.length,
        created_at: now,
      },
      cards: createdCards,
    };
  }

  async resolveCardByPayload(payload: string): Promise<CardItem | null> {
    let clean = payload.trim();
    if (clean.includes('/q/')) {
      clean = clean.split('/q/')[1].split('?')[0].split('#')[0];
    }
    if (clean.includes('/r/')) {
      clean = clean.split('/r/')[1].split('?')[0].split('#')[0];
    }
    if (clean.includes('/social/')) {
      clean = clean.split('/social/')[1].split('?')[0].split('#')[0];
    }
    if (clean.includes('/c/')) {
      clean = clean.split('/c/')[1].split('?')[0].split('#')[0];
    }
    clean = clean.trim();

    // 1. Try single card fetch if string is a MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(clean)) {
      try {
        const card = await cardsApi.getCardById(clean);
        if (card) return apiCardToCardItem(card);
      } catch (err) {
        // Fallback to search query
      }
    }

    // 2. Search using backend search parameter (searches card_code, nfc_uid, qr_code)
    try {
      const searchRes = await cardsApi.getCards({ search: clean, limit: 20 });
      if (searchRes && searchRes.data && searchRes.data.length > 0) {
        const exactMatch = searchRes.data.find(
          (c) =>
            c.card_code.toLowerCase() === clean.toLowerCase() ||
            (c.nfc_uid && c.nfc_uid.toLowerCase() === clean.toLowerCase()) ||
            (c.qr_code && c.qr_code.toLowerCase() === clean.toLowerCase()) ||
            c._id === clean
        );
        return apiCardToCardItem(exactMatch || searchRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to resolve card by payload:', err);
    }

    return null;
  }

  async saveCardBusinessData(cardId: string, data: BusinessData, publicUrl?: string): Promise<CardItem> {
    // 1. Fetch the current card to determine its code and type
    const currentApiCard = await cardsApi.getCardById(cardId);
    const cardCode = currentApiCard?.card_code || cardId;

    // 2. Sanitize logo — reject raw base64 data URLs (too large for DB)
    const cleanData = { ...data };
    if (cleanData.logo && cleanData.logo.length > 2000 && cleanData.logo.startsWith('data:image/')) {
      delete cleanData.logo;
    }

    // 3. Determine the redirect URL
    let targetUrl = publicUrl?.trim() || '';
    if (!targetUrl) {
      // Use category config instead of hardcoded strings
      const categoryId = currentApiCard?.category_id;
      const categoryConfig = getCategoryConfig(categoryId as any); // cast safely because it's a dynamic type

      if (categoryConfig.landingRoute === 'google-review' && cleanData.google_maps) {
        targetUrl = cleanData.google_maps;
      } else if (categoryConfig.landingRoute === 'payment' && cleanData.website) {
        targetUrl = cleanData.website;
      } else {
        targetUrl = resolveLandingUrl(cardCode, categoryConfig);
      }
    }

    // 4. Save business_data + redirect via PUT /api/cards/:id (NOT /redirect endpoint)
    // The /redirect endpoint only accepts { redirect_url } — business_data goes to PUT /api/cards/:id
    const updatedApiCard = await cardsApi.updateCard(cardId, {
      business_data: cleanData,
      current_redirect_url: targetUrl,
    });
    return apiCardToCardItem(updatedApiCard);
  }

  async updateCardPublicUrl(cardId: string, publicUrl: string): Promise<CardItem> {
    const cleanUrl = publicUrl.trim();
    // Use the /redirect endpoint for URL-only changes (no business_data)
    const updatedApiCard = await cardsApi.updateRedirectUrl(cardId, cleanUrl);
    return apiCardToCardItem(updatedApiCard);
  }

  async getCardsByStatus(statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE'): Promise<CardItem[]> {
    const statusParam = statusFilter === 'ACTIVE' ? 'active' : statusFilter === 'INACTIVE' ? 'inactive' : undefined;
    const res = await cardsApi.getCards({ status: statusParam, limit: 100 });
    return (res.data || []).map(apiCardToCardItem);
  }

  async resolvePublicCode(publicCode: string): Promise<{ card: CardItem; business: Business | null } | null> {
    const card = await this.resolveCardByPayload(publicCode);
    if (!card) return null;

    return {
      card,
      business: card.status === 'ACTIVE' && card.business_data ? {
        id: card.id,
        user_id: 'admin-user',
        name: card.business_data.business_name || 'Target Destination',
        status: 'ACTIVE',
        created_at: card.created_at,
        updated_at: card.updated_at || card.created_at,
      } : null,
    };
  }

  async assignCardToBusiness(cardId: string, businessId: string): Promise<CardItem> {
    return this.updateCardPublicUrl(cardId, `https://example.com/biz/${businessId}`);
  }

  async toggleCardStatus(cardId: string): Promise<CardItem> {
    const updated = await cardsApi.toggleCardStatus(cardId);
    return apiCardToCardItem(updated);
  }

  async renewCardSubscription(cardId: string): Promise<CardItem> {
    const renewed = await cardsApi.renewCardSubscription(cardId);
    return apiCardToCardItem(renewed);
  }

  async deleteCard(cardId: string): Promise<boolean> {
    const res = await cardsApi.deleteCard(cardId);
    return !!res;
  }
}

export const cardService: ICardService = new RealCardService();
