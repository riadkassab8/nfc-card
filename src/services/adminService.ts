/* ==========================================================================
   REAL ADMIN SERVICE (src/services/adminService.ts)
   ========================================================================== */

import { Business, UnifiedAsset, AdminStats } from '../types';
import { cardService } from './cardService';

export interface IAdminService {
  provisionNewNFC(label: string): Promise<any>;
  associateCodeWithBusiness(publicCode: string, businessId: string): Promise<{ success: boolean; message: string }>;
  getAllTenantBusinesses(): Promise<Business[]>;
  getAllUnifiedAssets(): Promise<UnifiedAsset[]>;
  getAdminStats(): Promise<AdminStats>;
  resolveAssetPayload(payload: string): Promise<UnifiedAsset | null>;
}

class RealAdminService implements IAdminService {
  async provisionNewNFC(label: string): Promise<any> {
    const batchRes = await cardService.generateCardBatch(1);
    const newCard = batchRes.cards[0];
    return {
      id: newCard?.nfc?.id || `NFC-${Date.now()}`,
      public_code: newCard?.public_code || 'NEW',
      label,
      status: 'ACTIVE',
      created_at: newCard?.created_at || new Date().toISOString(),
    };
  }

  async associateCodeWithBusiness(publicCode: string, businessId: string): Promise<{ success: boolean; message: string }> {
    const card = await cardService.resolveCardByPayload(publicCode);
    if (card) {
      await cardService.assignCardToBusiness(card.id, businessId);
      return {
        success: true,
        message: `Card "${card.card_code}" (${card.public_code}) updated successfully.`,
      };
    }
    return { success: false, message: 'Card not found for specified payload.' };
  }

  async getAllTenantBusinesses(): Promise<Business[]> {
    const cards = await cardService.getAllCards();
    const activeCards = cards.filter((c) => c.status === 'ACTIVE');
    return activeCards.map((c) => ({
      id: c.id,
      user_id: 'admin',
      name: c.business_name || `Card Target (${c.card_code})`,
      website_url: c.public_url,
      status: 'ACTIVE',
      created_at: c.created_at,
      updated_at: c.updated_at || c.created_at,
    }));
  }

  async getAllUnifiedAssets(): Promise<UnifiedAsset[]> {
    const cards = await cardService.getAllCards();
    const assets: UnifiedAsset[] = [];

    cards.forEach((c) => {
      const bizName = c.business_name || 'Unassigned';
      assets.push({
        id: c.qr.id,
        type: 'QR',
        public_code: c.public_code,
        business_id: c.id,
        business_name: bizName,
        label: `QR (${c.card_code})`,
        status: c.status === 'ACTIVE' ? 'ACTIVE' : 'UNASSIGNED',
        created_at: c.created_at,
      });
      assets.push({
        id: c.nfc.id,
        type: 'NFC',
        public_code: c.public_code,
        business_id: c.id,
        business_name: bizName,
        label: `NFC (${c.card_code})`,
        status: c.status === 'ACTIVE' ? 'ACTIVE' : 'UNASSIGNED',
        created_at: c.created_at,
      });
    });

    return assets;
  }

  async getAdminStats(): Promise<AdminStats> {
    const assets = await this.getAllUnifiedAssets();
    const cardStats = await cardService.getCardStats();

    return {
      total_businesses: cardStats.active_cards,
      active_businesses: cardStats.active_cards,
      total_assets: assets.length,
      unassigned_assets: assets.filter((a) => a.status === 'UNASSIGNED').length,
      total_cards: cardStats.total_cards,
      active_cards: cardStats.active_cards,
      inactive_cards: cardStats.inactive_cards,
      used_cards: cardStats.active_cards,
      unused_cards: cardStats.inactive_cards,
    };
  }

  async resolveAssetPayload(payload: string): Promise<UnifiedAsset | null> {
    const card = await cardService.resolveCardByPayload(payload);
    if (!card) return null;

    return {
      id: card.id,
      type: 'QR',
      public_code: card.public_code,
      business_id: card.id,
      business_name: card.business_name || 'Unassigned',
      label: card.card_code,
      status: card.status === 'ACTIVE' ? 'ACTIVE' : 'UNASSIGNED',
      created_at: card.created_at,
    };
  }
}

export const adminService: IAdminService = new RealAdminService();
