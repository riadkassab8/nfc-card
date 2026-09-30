import { CardItem, CardBatch, CardInventoryStats, BusinessData, Business, CardProductType } from '../types';

export interface ICardService {
  getAllCards(): Promise<CardItem[]>;
  getCardStats(): Promise<CardInventoryStats>;
  generateCardBatch(quantity: number, cardType?: CardProductType): Promise<{ batch: CardBatch; cards: CardItem[] }>;
  resolveCardByPayload(payload: string): Promise<CardItem | null>;
  saveCardBusinessData(cardId: string, data: BusinessData): Promise<CardItem>;
  updateCardPublicUrl(cardId: string, publicUrl: string): Promise<CardItem>;
  getCardsByStatus(statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE'): Promise<CardItem[]>;
  resolvePublicCode(publicCode: string): Promise<{ card: CardItem; business: Business | null } | null>;
  assignCardToBusiness(cardId: string, businessId: string): Promise<CardItem>;
  toggleCardStatus(cardId: string): Promise<CardItem>;
  deleteCard(cardId: string): Promise<boolean>;
}

// Initial mock cards database with distinct Product Types
const mockCards: CardItem[] = [
  {
    id: 'card-1',
    card_code: 'CARD-0001',
    public_code: '7FJ2K9',
    card_type: 'GOOGLE_REVIEW',
    qr: {
      id: 'QR-0001',
      public_code: '7FJ2K9',
    },
    nfc: {
      id: 'NFC-0001',
      identifier: 'NFC-7FJ2K9',
    },
    status: 'ACTIVE',
    business_data: {
      name: 'Acme Coffee Bar',
      description: 'Artisanal espresso, fresh bakery items, and cozy seating in downtown.',
      phone: '+14155552671',
      whatsapp: '+14155552671',
      address: '123 Main Street, Suite 100, San Francisco, CA',
      instagram_url: 'https://instagram.com/acmecoffee',
      google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      website_url: 'https://acmecoffee.example.com',
    },
    usage_status: 'USED',
    business_id: 'biz-1',
    business_name: 'Acme Coffee Bar',
    created_at: '2026-01-16T10:00:00Z',
  },
  {
    id: 'card-2',
    card_code: 'CARD-0002',
    public_code: '3MX9P2',
    card_type: 'INSTAPAY',
    qr: {
      id: 'QR-0002',
      public_code: '3MX9P2',
    },
    nfc: {
      id: 'NFC-0002',
      identifier: 'NFC-3MX9P2',
    },
    status: 'ACTIVE',
    business_data: {
      name: 'Apex Barber Shop',
      description: 'Classic cuts, hot towel shaves, and premium beard care.',
      phone: '+14155559812',
      whatsapp: '+14155559812',
      address: '456 Market St, San Francisco, CA',
      instapay_url: 'apexbarbers@instapay',
      instagram_url: 'https://instagram.com/apexbarbers',
      google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY5',
    },
    usage_status: 'USED',
    business_id: 'biz-2',
    business_name: 'Apex Barber Shop',
    created_at: '2026-01-20T11:30:00Z',
  },
  {
    id: 'card-3',
    card_code: 'CARD-0003',
    public_code: '9ZZ9X1',
    card_type: 'UNIFIED_SOCIAL',
    qr: {
      id: 'QR-0003',
      public_code: '9ZZ9X1',
    },
    nfc: {
      id: 'NFC-0003',
      identifier: 'NFC-9ZZ9X1',
    },
    status: 'INACTIVE',
    business_data: null,
    usage_status: 'UNUSED',
    business_id: null,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'card-4',
    card_code: 'CARD-0004',
    public_code: '4TK8W2',
    card_type: 'UNIFIED_SOCIAL',
    qr: {
      id: 'QR-0004',
      public_code: '4TK8W2',
    },
    nfc: {
      id: 'NFC-0004',
      identifier: 'NFC-4TK8W2',
    },
    status: 'ACTIVE',
    business_data: {
      name: 'Vibe Fashion Store',
      description: 'Trending streetwear and fashion outfits.',
      tiktok_url: 'https://tiktok.com/@vibefashion',
      instagram_url: 'https://instagram.com/vibefashion',
      whatsapp: '+14155557788',
    },
    usage_status: 'USED',
    created_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 'card-5',
    card_code: 'CARD-0005',
    public_code: '5WA9P1',
    card_type: 'UNIFIED_SOCIAL',
    qr: {
      id: 'QR-0005',
      public_code: '5WA9P1',
    },
    nfc: {
      id: 'NFC-0005',
      identifier: 'NFC-5WA9P1',
    },
    status: 'ACTIVE',
    business_data: {
      name: 'Quick Support Hotline',
      whatsapp: '+201001234567',
      phone: '+201001234567',
    },
    usage_status: 'USED',
    created_at: '2026-02-12T14:00:00Z',
  },
];

const mockBatches: CardBatch[] = [
  {
    id: 'BATCH-0001',
    quantity: 5,
    created_at: '2026-01-15T08:00:00Z',
  },
];

let nextCardIndex = 6;
let nextBatchIndex = 2;

class MockCardService implements ICardService {
  async getAllCards(): Promise<CardItem[]> {
    await this.simulateLatency();
    this.loadFromLocalStorage();
    return mockCards.map((c) => ({ ...c }));
  }

  async getCardStats(): Promise<CardInventoryStats> {
    await this.simulateLatency();
    this.loadFromLocalStorage();
    const total = mockCards.length;
    const active = mockCards.filter((c) => c.status === 'ACTIVE').length;
    const inactive = total - active;
    return {
      total_cards: total,
      active_cards: active,
      inactive_cards: inactive,
      used_cards: active,
      unused_cards: inactive,
    };
  }

  async generateCardBatch(quantity: number, cardType: CardProductType = 'GOOGLE_REVIEW'): Promise<{ batch: CardBatch; cards: CardItem[] }> {
    await this.simulateLatency();
    if (quantity < 1 || quantity > 500) {
      throw new Error('Quantity must be between 1 and 500');
    }

    const batchId = `BATCH-${String(nextBatchIndex++).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newBatch: CardBatch = {
      id: batchId,
      quantity,
      created_at: now,
    };
    mockBatches.push(newBatch);

    const generatedCards: CardItem[] = [];

    for (let i = 0; i < quantity; i++) {
      const cardNum = nextCardIndex++;
      const cardCode = `CARD-${String(cardNum).padStart(3, '0')}`;
      const publicCode = this.generateRandomCode();
      const cardId = `card-${cardNum}`;
      const qrId = `QR-${String(cardNum).padStart(3, '0')}`;
      const nfcId = `NFC-${String(cardNum).padStart(3, '0')}`;

      const card: CardItem = {
        id: cardId,
        card_code: cardCode,
        public_code: publicCode,
        card_type: cardType,
        qr: {
          id: qrId,
          public_code: publicCode,
        },
        nfc: {
          id: nfcId,
          identifier: `NFC-${publicCode}`,
        },
        status: 'INACTIVE',
        business_data: null,
        usage_status: 'UNUSED',
        business_id: null,
        batch_id: batchId,
        created_at: now,
      };

      mockCards.push(card);
      generatedCards.push(card);
    }

    return {
      batch: { ...newBatch },
      cards: generatedCards.map((c) => ({ ...c })),
    };
  }

  async resolveCardByPayload(payload: string): Promise<CardItem | null> {
    await this.simulateLatency();
    let clean = payload.trim();
    if (clean.includes('/q/')) {
      clean = clean.split('/q/')[1].split('?')[0].split('#')[0];
    }
    clean = clean.toUpperCase();

    const found = mockCards.find(
      (c) =>
        c.public_code.toUpperCase() === clean ||
        c.card_code.toUpperCase() === clean ||
        c.id.toUpperCase() === clean ||
        c.qr.id.toUpperCase() === clean ||
        c.nfc.id.toUpperCase() === clean ||
        c.nfc.identifier.toUpperCase() === clean
    );

    return found ? { ...found } : null;
  }

  async saveCardBusinessData(cardId: string, data: BusinessData): Promise<CardItem> {
    await this.simulateLatency();
    const card = mockCards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    card.status = 'ACTIVE';
    card.business_data = { ...data };
    card.business_name = data.name;
    card.usage_status = 'USED';
    card.updated_at = new Date().toISOString();

    this.saveToLocalStorage();
    return { ...card };
  }

  async updateCardPublicUrl(cardId: string, publicUrl: string): Promise<CardItem> {
    await this.simulateLatency();
    const card = mockCards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    const cleanUrl = publicUrl.trim();
    card.public_url = cleanUrl;
    card.qr.public_url = cleanUrl;
    card.nfc.public_url = cleanUrl;
    card.updated_at = new Date().toISOString();

    this.saveToLocalStorage();
    return { ...card };
  }

  async getCardsByStatus(statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE'): Promise<CardItem[]> {
    await this.simulateLatency();
    this.loadFromLocalStorage();
    if (statusFilter === 'ALL') return this.getAllCards();
    return mockCards.filter((c) => c.status === statusFilter).map((c) => ({ ...c }));
  }

  async resolvePublicCode(publicCode: string): Promise<{ card: CardItem; business: Business | null } | null> {
    await this.simulateLatency();
    this.loadFromLocalStorage();
    const clean = publicCode.trim().toUpperCase();
    const card = mockCards.find((c) => c.public_code.toUpperCase() === clean || c.public_url === publicCode);
    if (!card) return null;

    let business: Business | null = null;
    if (card.status === 'ACTIVE' && card.business_data) {
      business = {
        id: card.id,
        user_id: 'user-1',
        name: card.business_data.name,
        description: card.business_data.description,
        logo_url: card.business_data.logo_url,
        phone: card.business_data.phone,
        whatsapp: card.business_data.whatsapp,
        address: card.business_data.address,
        instagram_url: card.business_data.instagram_url,
        tiktok_url: card.business_data.tiktok_url,
        facebook_url: card.business_data.facebook_url,
        google_review_url: card.business_data.google_review_url,
        instapay_url: card.business_data.instapay_url,
        website_url: card.business_data.website_url,
        status: 'ACTIVE',
        created_at: card.created_at,
        updated_at: card.updated_at || card.created_at,
      };
    }

    return {
      card: { ...card },
      business,
    };
  }

  async assignCardToBusiness(cardId: string, businessId: string): Promise<CardItem> {
    return this.saveCardBusinessData(cardId, {
      name: `Assigned Business (${businessId})`,
    });
  }

  async toggleCardStatus(cardId: string): Promise<CardItem> {
    await this.simulateLatency();
    const card = mockCards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    card.status = card.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    card.updated_at = new Date().toISOString();
    this.saveToLocalStorage();
    return { ...card };
  }

  async deleteCard(cardId: string): Promise<boolean> {
    await this.simulateLatency();
    const index = mockCards.findIndex((c) => c.id === cardId);
    if (index !== -1) {
      mockCards.splice(index, 1);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  private saveToLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('nfc_cards_inventory_v3', JSON.stringify(mockCards));
      }
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  private loadFromLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('nfc_cards_inventory_v3');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            mockCards.length = 0;
            mockCards.push(...parsed);
          }
        }
      }
    } catch (e) {
      console.error('LocalStorage read error:', e);
    }
  }

  private generateRandomCode(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private simulateLatency(ms = 80): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const cardService: ICardService = new MockCardService();
