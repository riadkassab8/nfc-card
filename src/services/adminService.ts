import { Business, UnifiedAsset, AdminStats } from '../types';
import { mockBusinesses } from './mockData';
import { cardService } from './cardService';

export interface IAdminService {
  provisionNewNFC(label: string): Promise<any>;
  associateCodeWithBusiness(publicCode: string, businessId: string): Promise<{ success: boolean; message: string }>;
  getAllTenantBusinesses(): Promise<Business[]>;
  getAllUnifiedAssets(): Promise<UnifiedAsset[]>;
  getAdminStats(): Promise<AdminStats>;
  resolveAssetPayload(payload: string): Promise<UnifiedAsset | null>;
}

class MockAdminService implements IAdminService {
  async provisionNewNFC(label: string): Promise<any> {
    await this.simulateLatency();
    const batchRes = await cardService.generateCardBatch(1);
    const newCard = batchRes.cards[0];
    return {
      id: newCard.nfc.id,
      public_code: newCard.public_code,
      label,
      status: 'ACTIVE',
      created_at: newCard.created_at,
    };
  }

  async associateCodeWithBusiness(publicCode: string, businessId: string): Promise<{ success: boolean; message: string }> {
    await this.simulateLatency();
    const business = mockBusinesses.find((b) => b.id === businessId);
    if (!business) {
      return { success: false, message: 'Target business not found.' };
    }

    const card = await cardService.resolveCardByPayload(publicCode);
    if (card) {
      await cardService.assignCardToBusiness(card.id, businessId);
      return {
        success: true,
        message: `Card "${card.card_code}" (${card.public_code}) associated with "${business.name}" successfully.`,
      };
    }

    return { success: false, message: 'Card not found for payload.' };
  }

  async getAllTenantBusinesses(): Promise<Business[]> {
    await this.simulateLatency();
    return mockBusinesses.map((b) => ({ ...b }));
  }

  async getAllUnifiedAssets(): Promise<UnifiedAsset[]> {
    await this.simulateLatency();
    const cards = await cardService.getAllCards();
    const assets: UnifiedAsset[] = [];

    cards.forEach((c) => {
      const bizName = c.business_name || 'Unassigned';
      assets.push({
        id: c.qr.id,
        type: 'QR',
        public_code: c.public_code,
        business_id: c.business_id || undefined,
        business_name: bizName,
        label: `QR (${c.card_code})`,
        status: c.usage_status === 'USED' ? 'ACTIVE' : 'UNASSIGNED',
        created_at: c.created_at,
      });
      assets.push({
        id: c.nfc.id,
        type: 'NFC',
        public_code: c.public_code,
        business_id: c.business_id || undefined,
        business_name: bizName,
        label: `NFC (${c.card_code})`,
        status: c.usage_status === 'USED' ? 'ACTIVE' : 'UNASSIGNED',
        created_at: c.created_at,
      });
    });

    return assets;
  }

  async getAdminStats(): Promise<AdminStats> {
    await this.simulateLatency();
    const assets = await this.getAllUnifiedAssets();
    const cardStats = await cardService.getCardStats();

    return {
      total_businesses: mockBusinesses.length,
      active_businesses: mockBusinesses.filter((b) => b.status === 'ACTIVE').length,
      total_assets: assets.length,
      unassigned_assets: assets.filter((a) => !a.business_id || a.status === 'UNASSIGNED').length,
      total_cards: cardStats.total_cards,
      used_cards: cardStats.used_cards,
      unused_cards: cardStats.unused_cards,
    };
  }

  async resolveAssetPayload(payload: string): Promise<UnifiedAsset | null> {
    await this.simulateLatency();
    const card = await cardService.resolveCardByPayload(payload);
    if (!card) return null;

    return {
      id: card.id,
      type: 'QR',
      public_code: card.public_code,
      business_id: card.business_id || undefined,
      business_name: card.business_name || 'Unassigned',
      label: card.card_code,
      status: card.usage_status === 'USED' ? 'ACTIVE' : 'UNASSIGNED',
      created_at: card.created_at,
    };
  }

  private simulateLatency(ms = 80): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const adminService: IAdminService = new MockAdminService();
