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

export interface ICardService {
  getAllCards(params?: CardQueryParams): Promise<CardItem[]>;
  getCardStats(): Promise<CardInventoryStats>;
  createCard(dto: ApiCreateCardDto): Promise<CardItem>;
  generateCardBatch(quantity: number, cardType?: CardProductType): Promise<{ batch: CardBatch; cards: CardItem[] }>;
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

  async generateCardBatch(quantity: number, cardType: CardProductType = 'Google Review'): Promise<{ batch: CardBatch; cards: CardItem[] }> {
    if (quantity < 1 || quantity > 500) {
      throw new Error('Quantity must be between 1 and 500');
    }

    const batchId = `BATCH-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const createdCards: CardItem[] = [];

    const backendTypeStr = cardType;

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
      const redirectUrl = 'https://example.com';

      try {
        const newCard = await this.createCard({
          card_code: cardCode,
          nfc_uid: nfcUid,
          card_type: backendTypeStr,
          current_redirect_url: redirectUrl,
        });
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

    // 2. Search using backend search parameter
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
    // 1. Fetch the current card to know its type and public code
    const cardRes = await cardsApi.getCards({ limit: 100 });
    const currentCard = cardRes.data.find(c => c._id === cardId);
    const cardCode = currentCard?.card_code || cardId;
    
    // 2. Sanitize data to prevent massive URLs
    const cleanData = { ...data };
    if (cleanData.logo_url && cleanData.logo_url.length > 2000 && cleanData.logo_url.startsWith('data:image/')) {
      delete cleanData.logo_url;
    }

    let targetUrl = publicUrl?.trim() || '';

    // 3. Determine the redirect URL
    // ALWAYS redirect to our unified /c/:cardId route. The frontend routing engine will handle the specific logic.
    if (!targetUrl) {
      const jsonStr = JSON.stringify(cleanData);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Data = btoa(binary);
      
      // Use the actual origin where the app is running (e.g. localhost:3000 or the real vercel domain)
      const origin = import.meta.env.VITE_PUBLIC_FRONTEND_URL || window.location.origin;
      targetUrl = `${origin}/c/${cardCode}?data=${base64Data}`;
    }

    const updatedApiCard = await cardsApi.updateRedirectUrl(cardId, targetUrl);
    return apiCardToCardItem(updatedApiCard);
  }

  async updateCardPublicUrl(cardId: string, publicUrl: string): Promise<CardItem> {
    const cleanUrl = publicUrl.trim();
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
        name: card.business_name || 'Target Destination',
        google_review_url: card.business_data.google_review_url,
        instapay_url: card.business_data.instapay_url,
        website_url: card.business_data.website_url,
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
