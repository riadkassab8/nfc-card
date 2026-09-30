import { Business } from '../types';
import { mockBusinesses } from './mockData';

// Frontend Service Interface
export interface IBusinessService {
  getCurrentBusiness(): Promise<Business | null>;
  getBusinessById(id: string): Promise<Business | null>;
  getBusinessByUserId(userId: string): Promise<Business | null>;
  updateBusiness(id: string, updates: Partial<Business>): Promise<Business>;
  getAllBusinesses(): Promise<Business[]>;
  createBusiness(business: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business>;
}

// In-Memory Mock Implementation
class MockBusinessService implements IBusinessService {
  private businesses: Business[] = [...mockBusinesses];

  async getCurrentBusiness(): Promise<Business | null> {
    return this.getBusinessByUserId('user-1');
  }

  async getBusinessById(id: string): Promise<Business | null> {
    await this.simulateLatency();
    const found = this.businesses.find((b) => b.id === id);
    return found ? { ...found } : null;
  }

  async getBusinessByUserId(userId: string): Promise<Business | null> {
    await this.simulateLatency();
    const found = this.businesses.find((b) => b.user_id === userId);
    return found ? { ...found } : null;
  }

  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business> {
    await this.simulateLatency();
    const index = this.businesses.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('Business not found');
    }
    const updated: Business = {
      ...this.businesses[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.businesses[index] = updated;
    return { ...updated };
  }

  async getAllBusinesses(): Promise<Business[]> {
    await this.simulateLatency();
    return this.businesses.map((b) => ({ ...b }));
  }

  async createBusiness(data: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business> {
    await this.simulateLatency();
    const newBiz: Business = {
      ...data,
      id: `biz-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.businesses.push(newBiz);
    return { ...newBiz };
  }

  private simulateLatency(ms = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const businessService: IBusinessService = new MockBusinessService();
