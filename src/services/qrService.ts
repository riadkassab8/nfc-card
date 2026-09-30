import { QRCode, QRStatus, Business } from '../types';
import { mockQRCodes, mockBusinesses } from './mockData';

export interface PublicResolutionResult {
  qr: QRCode;
  business: Business;
}

export interface IQRService {
  getQRCodesByBusinessId(businessId: string): Promise<QRCode[]>;
  getQRCodeById(id: string): Promise<QRCode | null>;
  resolvePublicCode(publicCode: string): Promise<PublicResolutionResult | null>;
  createQRCode(data: { business_id: string; label: string; placement?: string }): Promise<QRCode>;
  updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode>;
  setQRStatus(id: string, status: QRStatus): Promise<QRCode>;
  getAllQRCodes(): Promise<QRCode[]>;
  assignQRCodeToBusiness(qrId: string, businessId: string): Promise<QRCode>;
}

class MockQRService implements IQRService {
  private qrCodes: QRCode[] = [...mockQRCodes];

  async getQRCodesByBusinessId(businessId: string): Promise<QRCode[]> {
    await this.simulateLatency();
    return this.qrCodes
      .filter((q) => q.business_id === businessId && q.status !== 'ARCHIVED')
      .map((q) => ({ ...q }));
  }

  async getQRCodeById(id: string): Promise<QRCode | null> {
    await this.simulateLatency();
    const found = this.qrCodes.find((q) => q.id === id);
    return found ? { ...found } : null;
  }

  async resolvePublicCode(publicCode: string): Promise<PublicResolutionResult | null> {
    await this.simulateLatency();
    const qr = this.qrCodes.find((q) => q.public_code.toUpperCase() === publicCode.toUpperCase());
    if (!qr) return null;

    const business = mockBusinesses.find((b) => b.id === qr.business_id);
    if (!business) return null;

    return {
      qr: { ...qr },
      business: { ...business },
    };
  }

  async createQRCode(data: { business_id: string; label: string; placement?: string }): Promise<QRCode> {
    await this.simulateLatency();
    const publicCode = this.generateRandomCode();
    const newQR: QRCode = {
      id: `qr-${Date.now()}`,
      business_id: data.business_id,
      public_code: publicCode,
      label: data.label,
      placement: data.placement || '',
      status: 'ACTIVE',
      scans_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.qrCodes.push(newQR);
    return { ...newQR };
  }

  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode> {
    await this.simulateLatency();
    const index = this.qrCodes.findIndex((q) => q.id === id);
    if (index === -1) throw new Error('QR Code not found');

    const updated: QRCode = {
      ...this.qrCodes[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.qrCodes[index] = updated;
    return { ...updated };
  }

  async setQRStatus(id: string, status: QRStatus): Promise<QRCode> {
    return this.updateQRCode(id, { status });
  }

  async getAllQRCodes(): Promise<QRCode[]> {
    await this.simulateLatency();
    return this.qrCodes.map((q) => ({ ...q }));
  }

  async assignQRCodeToBusiness(qrId: string, businessId: string): Promise<QRCode> {
    return this.updateQRCode(qrId, { business_id: businessId });
  }

  private generateRandomCode(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private simulateLatency(ms = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const qrService: IQRService = new MockQRService();
