/* ==========================================================================
   TYPES — exact mirror of the backend API schema (API_DOCUMENTATION.md)
   ========================================================================== */

// ── Auth ──────────────────────────────────────────────────────────────────

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

// ── Category ─────────────────────────────────────────────────────────────

export interface ApiCategory {
  _id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
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

// ── Business Data (embedded in Card) ─────────────────────────────────────

/**
 * All fields match the exact backend API field names.
 * See API docs: POST /api/cards, PUT /api/cards/:id
 */
export interface BusinessData {
  business_name?: string | null;
  logo?: string | null;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  google_maps?: string | null;
  website?: string | null;
  email?: string | null;
  instapay?: string | null;
  vodafone_cash?: string | null;
}

// ── Card Types ────────────────────────────────────────────────────────────

export const CARD_TYPES = [
  'Card',
  'Stand',
  'Medal',
] as const;

export type CardType = (typeof CARD_TYPES)[number] | string;

export type CardStatus = 'active' | 'inactive';

// ── Card ──────────────────────────────────────────────────────────────────

export interface ApiCard {
  _id: string;
  card_code: string;
  nfc_uid?: string | null;
  qr_code?: string | null;
  card_type: string;
  current_redirect_url: string;
  status: CardStatus;
  subscription_start_date: string;
  subscription_end_date: string;
  /** category_id is returned as a populated object from the backend */
  category_id?: ApiCategory | string | null;
  business_data?: BusinessData | null;
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
  card_type: string;
  current_redirect_url: string;
  category_id?: string;
  business_data?: BusinessData;
}

export interface ApiUpdateCardDto {
  nfc_uid?: string;
  card_type?: string;
  current_redirect_url?: string;
  status?: CardStatus;
  category_id?: string;
  business_data?: BusinessData | null;
}

export interface ApiUpdateRedirectDto {
  redirect_url: string;
}

// ── Card History ──────────────────────────────────────────────────────────

export interface ApiCardHistory {
  _id: string;
  card_id: string;
  action: 'created' | 'updated' | 'deleted';
  snapshot: ApiCard;
  recorded_at: string;
}

// ── Query params ──────────────────────────────────────────────────────────

export interface CardQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CardStatus;
  card_type?: string;
  category_id?: string;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

// ── Stats (derived on frontend from real API data) ────────────────────────

export interface CardStats {
  total: number;
  active: number;
  inactive: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Returns the populated category object if available, else null */
export const getPopulatedCategory = (
  categoryId: ApiCard['category_id'],
): ApiCategory | null => {
  if (!categoryId) return null;
  if (typeof categoryId === 'string') return null;
  return categoryId;
};

/** Returns category _id string regardless of whether it's populated or not */
export const getCategoryId = (categoryId: ApiCard['category_id']): string | null => {
  if (!categoryId) return null;
  if (typeof categoryId === 'string') return categoryId;
  return categoryId._id;
};

/** Format an ISO date string to a localised Arabic date */
export const fmtDate = (iso?: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Returns true if subscription_end_date is in the past */
export const isSubscriptionExpired = (card: ApiCard): boolean => {
  return new Date(card.subscription_end_date) < new Date();
};

export interface CategoryMeta {
  desc: string;
  fields: string[];
  isLegacy: boolean;
}

export const parseCategoryMeta = (raw?: string | null): CategoryMeta => {
  if (!raw) return { desc: '', fields: [], isLegacy: true };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.fields)) {
      return { desc: parsed.desc || '', fields: parsed.fields, isLegacy: false };
    }
  } catch (e) {
    // not JSON, treat as plain text
  }
  return { desc: raw, fields: [], isLegacy: true };
};

export const stringifyCategoryMeta = (desc: string, fields: string[]): string => {
  return JSON.stringify({ desc, fields });
};
