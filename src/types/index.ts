/* ==========================================================================
   TYPES — exact mirror of the backend API schema (API_DOCUMENTATION.md)
   ========================================================================== */

// ── Auth ──────────────────────────────────────────────────────────────────

export interface AdminSettings {
  platform_name?: string;
  support_email?: string;
  support_phone?: string;
  default_redirect_base_url?: string;
  enable_email_alerts?: boolean;
}

export interface ApiAdmin {
  _id?: string;
  id?: string;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  settings?: AdminSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiAuthResponse {
  access_token: string;
  admin: ApiAdmin;
}

export interface ForgotPasswordDto {
  identifier: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email?: string;
  reset_token?: string;
  expires_in?: string;
}

export interface ResetPasswordDto {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  username?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface UpdateSettingsDto {
  platform_name?: string;
  support_email?: string;
  support_phone?: string;
  default_redirect_base_url?: string;
  enable_email_alerts?: boolean;
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

export enum CardType {
  MEDAL = 'ميدالية',
  STAND = 'استاند',
  CARD = 'كارت',
}

export const CARD_TYPES = [
  CardType.CARD,
  CardType.STAND,
  CardType.MEDAL,
];

export type CardStatus = 'active' | 'inactive';

// ── Redirect Rules ────────────────────────────────────────────────────────

export interface RedirectRule {
  label?: string;
  device_target: 'mobile' | 'tablet' | 'desktop' | 'any';
  hour_from?: number | null;
  period_from?: 'am' | 'pm' | null;
  hour_to?: number | null;
  period_to?: 'am' | 'pm' | null;
  redirect_url: string;
  priority: number;
  is_active: boolean;
}

export interface ApiUpdateRedirectRulesDto {
  rules: RedirectRule[];
}

// ── Card ──────────────────────────────────────────────────────────────────

export interface ApiCard {
  _id: string;
  card_code: string;
  custom_slug?: string | null;
  nfc_uid?: string | null;
  qr_code?: string | null;
  card_type: string;
  current_redirect_url: string;
  status: CardStatus;
  /** ✅ NEW — false = permanent card (no subscription) */
  requires_subscription: boolean;
  /** ⚠️ null when requires_subscription is false */
  subscription_start_date: string | null;
  /** ⚠️ null when requires_subscription is false */
  subscription_end_date: string | null;
  /** ✅ NEW — [] when no rules are set */
  redirect_rules: RedirectRule[];
  /** category_id is returned as a populated object from the backend */
  category_id?: ApiCategory | string | null;
  /** Customer if assigned to a customer */
  customer_id?: ApiCustomer | string | null;
  customer?: ApiCustomer | null;
  business_data?: BusinessData | null;
  visit_count?: number;
  createdAt: string;
  updatedAt: string;
}


export interface ApiTrashCard extends ApiCard {
  deleted_at?: string;
  deletedAt?: string;
}

export interface ApiDeleteCardDto {
  password?: string;
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
  custom_slug?: string;
  nfc_uid?: string;
  card_type: string;
  current_redirect_url: string;
  category_id?: string;
  business_data?: BusinessData;
  /** default: true on backend */
  requires_subscription?: boolean;
}

export interface ApiUpdateCardDto {
  custom_slug?: string | null;
  nfc_uid?: string;
  card_type?: string;
  current_redirect_url?: string;
  status?: CardStatus;
  category_id?: string;
  business_data?: BusinessData | null;
  requires_subscription?: boolean;
}

export interface ApiUpdateRedirectDto {
  redirect_url: string;
}

// ── Bulk Create ────────────────────────────────────────────────────────────

export interface ApiBulkCreateDto {
  cards: ApiCreateCardDto[];
}

export interface ApiBulkCreateResult {
  total: number;
  success_count: number;
  fail_count: number;
  created: ApiCard[];
  failed: { card_code: string; reason: string }[];
}

// ── Social Page ────────────────────────────────────────────────────────────

export interface ApiSocialPageResponse {
  card_code: string;
  custom_slug?: string | null;
  card_type: string;
  visit_count?: number;
  requires_subscription?: boolean;
  business_data: BusinessData | null;
  message?: string;
}

// ── Clone Card ─────────────────────────────────────────────────────────────

export interface ApiCloneCardDto {
  new_card_code: string;
}

// ── Analytics ─────────────────────────────────────────────────────────────

export interface ScanByDay {
  date: string;  // 'YYYY-MM-DD'
  count: number;
}

export interface ScanByDevice {
  device_type: string;
  count: number;
}

export interface ScanByBrowser {
  browser: string;
  count: number;
}

export interface RecentScan {
  card_id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  browser: string;
}

export interface ApiCardAnalytics {
  total_scans: number;
  scans_last_N_days: number;
  scans_by_day: ScanByDay[];
  scans_by_device: ScanByDevice[];
  scans_by_browser: ScanByBrowser[];
  peak_hour: number;
  recent_scans: RecentScan[];
}

export interface TopCard {
  card_code: string;
  count: number;
}

export interface ApiGlobalAnalytics {
  total_scans: number;
  scans_last_N_days: number;
  scans_by_day: ScanByDay[];
  top_cards: TopCard[];
  scans_by_device: ScanByDevice[];
  scans_by_browser: ScanByBrowser[];
}

// ── Export Query Params ───────────────────────────────────────────────────

export interface ExportCardsParams {
  status?: CardStatus;
  card_type?: string;
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

/** Format an ISO date string to Arabic date with time */
export const fmtDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} - ${timePart}`;
};

/** Returns true if subscription_end_date is in the past.
 *  Cards with requires_subscription: false are never expired. */
export const isSubscriptionExpired = (card: ApiCard): boolean => {
  if (!card.requires_subscription) return false;
  if (!card.subscription_end_date) return false;
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

/** Regex to validate custom slug: only lowercase letters, numbers, and hyphens without spaces */
export const CUSTOM_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Helper to get card identifier: custom_slug if present, else card_code */
export const getCardSlugOrCode = (card: { custom_slug?: string | null; card_code: string }): string => {
  return card.custom_slug?.trim() ? card.custom_slug.trim() : card.card_code;
};

// ── Customers (CRM Module) ────────────────────────────────────────────────

export interface ApiCustomer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
  total_cards?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ApiCustomersPaginatedResponse {
  data: ApiCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiCustomerCardSummary {
  total_cards: number;
  active_cards: number;
  inactive_cards: number;
}

export interface ApiCustomerDetailCard {
  _id: string;
  card_code: string;
  custom_slug?: string | null;
  card_type: string;
  status: CardStatus;
  current_redirect_url?: string;
  requires_subscription?: boolean;
  subscription_end_date?: string | null;
}

export interface ApiCustomerDetailResponse {
  customer: ApiCustomer;
  summary: ApiCustomerCardSummary;
  cards: ApiCustomerDetailCard[];
}

export interface ApiCreateCustomerDto {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
}

export interface ApiUpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
}

export interface ApiAssignCardsDto {
  card_ids: string[];
}

export interface ApiTrashCustomer extends ApiCustomer {
  deleted_at?: string;
  deletedAt?: string;
}

export interface ApiDeleteCustomerDto {
  password?: string;
}

// ── Customer History & Audit Log ──────────────────────────────────────────

export type CustomerHistoryAction =
  | 'created'
  | 'updated'
  | 'cards_assigned'
  | 'card_unassigned'
  | 'deleted'
  | 'restored'
  | string;

export interface CustomerSnapshot {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
  total_cards?: number;
  [key: string]: any;
}

export interface ApiCustomerHistory {
  _id: string;
  customer_id: string;
  action: CustomerHistoryAction;
  details?: string;
  snapshot?: CustomerSnapshot | null;
  recorded_at: string;
}

// ── Customer Email Messaging ──────────────────────────────────────────────

export interface SendCustomerEmailDto {
  subject: string;
  message: string;
  badge?: string;
  button_text?: string;
  button_url?: string;
}

export interface SendCustomerEmailResponse {
  success: boolean;
  message: string;
  to: string;
}

export interface BroadcastEmailDto {
  subject: string;
  message: string;
  badge?: string;
  button_text?: string;
  button_url?: string;
  customer_ids?: string[];
}

export interface BroadcastEmailResponse {
  success: boolean;
  total_targeted: number;
  sent_count: number;
  failed_count: number;
  message: string;
}



