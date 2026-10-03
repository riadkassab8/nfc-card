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

/** Exact card_type values accepted by backend */
export type CardProductType = string;


/**
 * business_data fields — EXACT backend API field names.
 * See API docs: POST /api/cards, PUT /api/cards/:id
 */
export interface BusinessData {
  business_name?: string;
  logo?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  google_maps?: string;
  website?: string;
  email?: string;
}

export interface CardItem {
  id: string;
  card_code: string;
  public_code: string;
  card_type: string;
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

  /** category_id from backend — may be populated object or string */
  category_id?: string | ApiCategory | null;

  batch_id?: string;
  created_at: string;
  updated_at?: string;

  // Convenience helpers
  usage_status?: CardUsageStatus;
  business_id?: string | null;
  business_name?: string;

  // Subscription dates from backend
  subscription_start_date?: string;
  subscription_end_date?: string;
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
   OFFICIAL BACKEND API SCHEMAS
   ========================================================================== */

export interface ApiAdmin {
  _id?: string;
  id?: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiAuthResponse {
  access_token: string;
  admin: ApiAdmin;
}

/** Category as returned by the backend */
export interface ApiCategory {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategoriesPaginatedResponse {
  data: ApiCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiCreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
}

export interface ApiUpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
}

/** Lookup entry as returned by the backend */
export interface ApiLookupEntry {
  _id: string;
  group: string;
  key: string;
  label: string;
  meta?: Record<string, any> | null;
  order: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCard {
  _id: string;
  card_code: string;
  nfc_uid?: string;
  qr_code?: string;
  card_type: string;
  current_redirect_url: string;
  /** business_data uses exact API field names */
  business_data?: BusinessData | null;
  /** category_id may be a string (ObjectId) or populated ApiCategory object */
  category_id?: string | ApiCategory | null;
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
  category_id?: string;
  business_data?: BusinessData;
}

export interface ApiUpdateCardDto {
  nfc_uid?: string;
  qr_code?: string;
  card_type?: string;
  current_redirect_url?: string;
  business_data?: BusinessData | null;
  status?: 'active' | 'inactive';
  category_id?: string;
}

export interface ApiUpdateRedirectDto {
  redirect_url: string;
}

/**
 * Adapter: Converts backend ApiCard object to frontend CardItem format.
 * Uses EXACT backend field names for business_data — no renaming.
 */
export const apiCardToCardItem = (apiCard: ApiCard): CardItem => {
  const publicCode = apiCard.card_code
    ? apiCard.card_code.replace('CARD-', '')
    : apiCard._id.slice(-6).toUpperCase();
  const status: CardStatus = apiCard.status === 'active' ? 'ACTIVE' : 'INACTIVE';

  // business_data comes from backend with exact field names — use directly
  const parsedBusinessData: BusinessData | null = apiCard.business_data || null;

  // Display name for the card
  const displayName =
    parsedBusinessData?.business_name ||
    (apiCard.card_type ? `${apiCard.card_type}` : 'Target Destination');

  return {
    id: apiCard._id,
    card_code: apiCard.card_code,
    public_code: publicCode,
    card_type: apiCard.card_type,
    public_url: apiCard.current_redirect_url || '',
    qr: {
      id: apiCard.qr_code || `https://smart-card-qr-api.koyeb.app/r/${apiCard.card_code}`,
      public_code: publicCode,
      public_url: apiCard.current_redirect_url || '',
    },
    nfc: {
      id: apiCard.nfc_uid ? `NFC-${apiCard.nfc_uid}` : `NFC-${publicCode}`,
      identifier: apiCard.nfc_uid || `NFC-${publicCode}`,
      public_url: apiCard.current_redirect_url || '',
    },
    status,
    business_data: parsedBusinessData,
    category_id: apiCard.category_id,
    business_name: displayName,
    usage_status: status === 'ACTIVE' ? 'USED' : 'UNUSED',
    created_at: apiCard.createdAt || apiCard.subscription_start_date || new Date().toISOString(),
    updated_at: apiCard.updatedAt || new Date().toISOString(),
    subscription_start_date: apiCard.subscription_start_date,
    subscription_end_date: apiCard.subscription_end_date,
  };
};
