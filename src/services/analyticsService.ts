import { AnalyticsSummary, EventType } from '../types';
import { mockQREvents, mockQRCodes } from './mockData';

export interface IAnalyticsService {
  getAnalyticsSummary(businessId: string, range?: string): Promise<AnalyticsSummary>;
  logEvent(qrId: string, eventType: EventType): Promise<boolean>;
}

class MockAnalyticsService implements IAnalyticsService {
  async getAnalyticsSummary(businessId: string, _range = '7d'): Promise<AnalyticsSummary> {
    await this.simulateLatency();

    const businessQRs = mockQRCodes.filter((q) => q.business_id === businessId);
    const qrIds = new Set(businessQRs.map((q) => q.id));

    const events = mockQREvents.filter((e) => qrIds.has(e.qr_id));

    const totalScans = events.filter((e) => e.event_type === 'SCAN').length + 842 + 310 + 268;
    const totalClicks = events.filter((e) => e.event_type !== 'SCAN').length + 890;
    const conversionRate = totalScans > 0 ? parseFloat(((totalClicks / totalScans) * 100).toFixed(1)) : 0;

    return {
      total_scans: totalScans,
      total_clicks: totalClicks,
      conversion_rate: conversionRate,
      trend: [
        { date: 'Mon', scans: 140 },
        { date: 'Tue', scans: 190 },
        { date: 'Wed', scans: 230 },
        { date: 'Thu', scans: 210 },
        { date: 'Fri', scans: 310 },
        { date: 'Sat', scans: 420 },
        { date: 'Sun', scans: 380 },
      ],
      breakdown: {
        WHATSAPP_CLICK: 400,
        GOOGLE_REVIEW_CLICK: 267,
        PHONE_CLICK: 133,
        LOCATION_CLICK: 90,
        INSTAGRAM_CLICK: 0,
        WEBSITE_CLICK: 0,
        CUSTOM_LINK_CLICK: 0,
      },
      qr_performance: businessQRs.map((q) => ({
        qr_id: q.id,
        label: q.label,
        scans: q.scans_count || 0,
      })),
    };
  }

  async logEvent(qrId: string, eventType: EventType): Promise<boolean> {
    await this.simulateLatency(50);
    mockQREvents.push({
      id: `evt-${Date.now()}`,
      qr_id: qrId,
      event_type: eventType,
      created_at: new Date().toISOString(),
    });

    const qr = mockQRCodes.find((q) => q.id === qrId);
    if (qr && eventType === 'SCAN') {
      qr.scans_count = (qr.scans_count || 0) + 1;
    }
    return true;
  }

  private simulateLatency(ms = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const analyticsService: IAnalyticsService = new MockAnalyticsService();
