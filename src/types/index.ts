/* ==========================================================================
   DOMAIN TYPES & FRONTEND ABSTRACTIONS (src/types/index.ts)
   ========================================================================== */

export type UserRole = 'BUSINESS_OWNER' | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type BusinessStatus = 'ACTIVE' | 'DISABLED' | 'SUSPENDED';

export interface Business {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  instagram_url?: string;
  tiktok_url?: string;
  facebook_url?: string;
  google_review_url?: string;
  instapay_url?: string;
  website_url?: string;
  status: BusinessStatus;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  business_id: string;
  name: string;
  address?: string;
  is_primary: boolean;
  created_at: string;
}

export type QRStatus = 'ACTIVE' | 'DISABLED' | 'ARCHIVED';

export interface QRCode {
  id: string;
  business_id: string;
  branch_id?: string;
  public_code: string;
  label: string;
  placement?: string;
  status: QRStatus;
  scans_count?: number;
  created_at: string;
  updated_at: string;
}

export interface NFCTag {
  id: string;
  public_code: string;
  business_id?: string;
  label: string;
  status: QRStatus;
  created_at: string;
}

export type EventType =
  | 'SCAN'
  | 'WHATSAPP_CLICK'
  | 'PHONE_CLICK'
  | 'LOCATION_CLICK'
  | 'INSTAGRAM_CLICK'
  | 'GOOGLE_REVIEW_CLICK'
  | 'WEBSITE_CLICK'
  | 'CUSTOM_LINK_CLICK';

export interface QREvent {
  id: string;
  qr_id: string;
  event_type: EventType;
  created_at: string;
  user_agent?: string;
  referrer?: string;
}

export interface AnalyticsTrendItem {
  date: string;
  scans: number;
}

export interface AnalyticsBreakdown {
  WHATSAPP_CLICK: number;
  PHONE_CLICK: number;
  LOCATION_CLICK: number;
  INSTAGRAM_CLICK: number;
  GOOGLE_REVIEW_CLICK: number;
  WEBSITE_CLICK: number;
  CUSTOM_LINK_CLICK: number;
}

export interface QRPerformanceItem {
  qr_id: string;
  label: string;
  scans: number;
}

export interface AnalyticsSummary {
  total_scans: number;
  total_clicks: number;
  conversion_rate: number;
  trend: AnalyticsTrendItem[];
  breakdown: AnalyticsBreakdown;
  qr_performance: QRPerformanceItem[];
}

export type AssetType = 'QR' | 'NFC';
export type AssetStatus = 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVE' | 'DISABLED' | 'ARCHIVED';

export interface UnifiedAsset {
  id: string;
  type: AssetType;
  public_code: string;
  business_id?: string;
  business_name?: string;
  label: string;
  placement?: string;
  status: AssetStatus;
  created_at: string;
}

export type CardStatus = 'ACTIVE' | 'INACTIVE';
export type CardUsageStatus = 'UNUSED' | 'USED';

export type CardProductType =
  | 'Google Review'
  | 'Instagram'
  | 'TikTok'
  | 'InstaPay'
  | 'Google Maps'
  | 'WhatsApp';

export type MainCardCategory = 'Google Review' | 'Social' | 'Payment';

export const getMainCategory = (cardType?: string): MainCardCategory => {
  if (!cardType) return 'Social';
  const lower = cardType.toLowerCase();
  if (lower.includes('google review') || lower.includes('review') || lower === 'google_review') {
    return 'Google Review';
  }
  if (lower.includes('instapay') || lower.includes('payment') || lower.includes('vodafone')) {
    return 'Payment';
  }
  return 'Social';
};

export interface BusinessData {
  name: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagram_url?: string;
  tiktok_url?: string;
  facebook_url?: string;
  google_review_url?: string;
  instapay_url?: string;
  website_url?: string;
}

export interface CardItem {
  id: string;
  card_code: string;
  public_code: string;
  card_type: CardProductType;
  public_url?: string;

  qr: {
    id: string;
    public_code: string;
    public_url?: string;
  };

  nfc: {
    id: string;
    identifier: string;
    public_url?: string;
  };

  status: CardStatus; // 'ACTIVE' (🟢) | 'INACTIVE' (🔴)
  business_data: BusinessData | null;

  batch_id?: string;
  created_at: string;
  updated_at?: string;

  // Compatibility helpers
  usage_status?: CardUsageStatus;
  business_id?: string | null;
  business_name?: string;
}

export interface CardBatch {
  id: string;
  quantity: number;
  created_at: string;
}

export interface CardInventoryStats {
  total_cards: number;
  active_cards: number;
  inactive_cards: number;
  used_cards?: number;
  unused_cards?: number;
}

export interface AdminStats {
  total_businesses: number;
  active_businesses: number;
  total_assets: number;
  unassigned_assets: number;
  total_cards?: number;
  active_cards?: number;
  inactive_cards?: number;
  used_cards?: number;
  unused_cards?: number;
}

/* ==========================================================================
   OFFICIAL BACKEND API SCHEMAS & CONVERTERS
   ========================================================================== */

export interface ApiAdmin {
  id: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiAuthResponse {
  access_token: string;
  admin: ApiAdmin;
}

export interface ApiCard {
  _id: string;
  card_code: string;
  nfc_uid?: string;
  qr_code?: string;
  card_type: string;
  current_redirect_url: string;
  business_data?: any;
  status: 'active' | 'inactive';
  subscription_start_date: string;
  subscription_end_date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCardsPaginatedResponse {
  data: ApiCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiCreateCardDto {
  card_code: string;
  nfc_uid?: string;
  qr_code?: string;
  card_type: string;
  current_redirect_url: string;
}

export interface ApiUpdateCardDto {
  nfc_uid?: string;
  qr_code?: string;
  card_type?: string;
  current_redirect_url?: string;
  business_data?: any;
  status?: 'active' | 'inactive';
}

export interface ApiUpdateRedirectDto {
  redirect_url: string;
  business_data?: any;
}

/**
 * Adapter: Converts backend ApiCard object to frontend CardItem format
 */
export const apiCardToCardItem = (apiCard: ApiCard): CardItem => {
  const publicCode = apiCard.card_code ? apiCard.card_code.replace('CARD-', '') : apiCard._id.slice(-6).toUpperCase();
  const status: CardStatus = apiCard.status === 'active' ? 'ACTIVE' : 'INACTIVE';

  let cardType: CardProductType = 'Google Review';
  const typeStr = apiCard.card_type || '';
  const typeLower = typeStr.toLowerCase();

  if (typeLower.includes('google review') || typeLower.includes('review')) {
    cardType = 'Google Review';
  } else if (typeLower.includes('google map') || typeLower.includes('maps')) {
    cardType = 'Google Maps';
  } else if (typeLower.includes('insta') && typeLower.includes('pay')) {
    cardType = 'InstaPay';
  } else if (typeLower.includes('instagram')) {
    cardType = 'Instagram';
  } else if (typeLower.includes('tiktok')) {
    cardType = 'TikTok';
  } else if (typeLower.includes('whatsapp')) {
    cardType = 'WhatsApp';
  } else if (typeStr) {
    cardType = typeStr as CardProductType;
  }

  let parsedBusinessData: BusinessData | null = apiCard.business_data || null;
  
  if (!parsedBusinessData) {
    // If the backend didn't provide business_data, try fallback to URL (for old cached cards),
    // OR create a default empty BusinessData object.
    if (apiCard.current_redirect_url) {
      try {
        const urlObj = new URL(apiCard.current_redirect_url);
        const dataParam = urlObj.searchParams.get('data');
        if (dataParam) {
           const base64Decoded = atob(dataParam);
           const utf8Decoded = new TextDecoder().decode(new Uint8Array([...base64Decoded].map(c => c.charCodeAt(0))));
           parsedBusinessData = JSON.parse(utf8Decoded);
        }
      } catch (e) {
        // Ignored
      }
    }
    
    if (!parsedBusinessData) {
      parsedBusinessData = {
        name: apiCard.card_type ? `${apiCard.card_type}` : 'Target Destination',
        google_review_url: cardType === 'Google Review' ? apiCard.current_redirect_url : undefined,
        instapay_url: cardType === 'InstaPay' ? apiCard.current_redirect_url : undefined,
        website_url: ['Instagram', 'TikTok', 'WhatsApp', 'Social', 'UNIFIED_SOCIAL'].includes(cardType) ? apiCard.current_redirect_url : undefined,
      } as BusinessData;
    }
  }

  // Clean the public URL to hide the base64 data from the user interface
  let cleanPublicUrl = apiCard.current_redirect_url || '';
  if (cleanPublicUrl.includes('?data=')) {
    cleanPublicUrl = cleanPublicUrl.split('?data=')[0];
  }

  return {
    id: apiCard._id,
    card_code: apiCard.card_code,
    public_code: publicCode,
    card_type: cardType,
    public_url: cleanPublicUrl,
    qr: {
      id: apiCard.qr_code || `https://smart-card-qr-api.koyeb.app/r/${apiCard.card_code}`,
      public_code: publicCode,
      public_url: cleanPublicUrl,
    },
    nfc: {
      id: `NFC-${apiCard.nfc_uid || publicCode}`,
      identifier: apiCard.nfc_uid || `NFC-${publicCode}`,
      public_url: cleanPublicUrl,
    },
    status,
    business_data: parsedBusinessData,
    business_name: parsedBusinessData?.name || (apiCard.card_type ? `${apiCard.card_type}` : 'Target Destination'),
    usage_status: status === 'ACTIVE' ? 'USED' : 'UNUSED',
    created_at: apiCard.createdAt || apiCard.subscription_start_date || new Date().toISOString(),
    updated_at: apiCard.updatedAt || new Date().toISOString(),
  };
};
