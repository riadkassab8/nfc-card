import { AnalyticsSummary, EventType } from '../types';

export interface IAnalyticsService {
  getAnalyticsSummary(businessId: string, range?: string): Promise<AnalyticsSummary>;
  logEvent(qrId: string, eventType: EventType): Promise<boolean>;
}

class RealAnalyticsService implements IAnalyticsService {
  /**
   * BACKEND GAP: No backend /api/analytics endpoint exists.
   * Return zeroed analytics structure rather than fabricating fake numbers.
   */
  async getAnalyticsSummary(_businessId: string, _range = '7d'): Promise<AnalyticsSummary> {
    return {
      total_scans: 0,
      total_clicks: 0,
      conversion_rate: 0,
      trend: [
        { date: 'Mon', scans: 0 },
        { date: 'Tue', scans: 0 },
        { date: 'Wed', scans: 0 },
        { date: 'Thu', scans: 0 },
        { date: 'Fri', scans: 0 },
        { date: 'Sat', scans: 0 },
        { date: 'Sun', scans: 0 },
      ],
      breakdown: {
        WHATSAPP_CLICK: 0,
        GOOGLE_REVIEW_CLICK: 0,
        PHONE_CLICK: 0,
        LOCATION_CLICK: 0,
        INSTAGRAM_CLICK: 0,
        WEBSITE_CLICK: 0,
        CUSTOM_LINK_CLICK: 0,
      },
      qr_performance: [],
    };
  }

  async logEvent(_qrId: string, _eventType: EventType): Promise<boolean> {
    return true;
  }
}

export const analyticsService: IAnalyticsService = new RealAnalyticsService();

