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

export interface SidebarNavItemConfig {
  id: string;
  path: string;
  label: string;
  defaultLabel: string;
  iconName: string;
  visible: boolean;
  order: number;
}

export type UserRole = 'super_admin' | 'staff' | 'merchant';
export type UserStatus = 'active' | 'suspended';
export type SubscriptionType = 'permanent' | 'yearly' | 'custom';

export interface UserPermissions {
  pages?: string[];
  actions?: string[];
}

export interface ApiAdmin {
  _id?: string;
  id?: string;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: UserPermissions;
  assigned_cards?: string[];
  phone?: string;
  store_name?: string;
  created_by?: string;
  subscription_type?: SubscriptionType;
  requires_subscription?: boolean;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  settings?: AdminSettings;
  sidebar_menu?: SidebarNavItemConfig[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: UserPermissions;
  assigned_cards?: string[];
  phone?: string;
  store_name?: string;
  subscription_type?: SubscriptionType;
  requires_subscription?: boolean;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
}

export interface UpdateUserPayload {
  username?: string;
  password?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: UserPermissions;
  assigned_cards?: string[];
  phone?: string;
  store_name?: string;
  subscription_type?: SubscriptionType;
  requires_subscription?: boolean;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
}

export interface UsersListResponse {
  users: ApiAdmin[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStatsSummary {
  total: number;
  superAdmins: number;
  staff: number;
  merchants: number;
  active: number;
  suspended: number;
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
  phone?: string;
  store_name?: string;
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
 */
export interface ActiveShift {
  label?: string;
  cashier_name?: string;
  hour_from?: number;
  period_from?: 'am' | 'pm';
  hour_to?: number;
  period_to?: 'am' | 'pm';
  instapay?: string;
  vodafone_cash?: string;
}

export interface PaymentShift {
  label: string;
  cashier_name?: string;
  hour_from?: number | null;
  period_from?: 'am' | 'pm' | null;
  hour_to?: number | null;
  period_to?: 'am' | 'pm' | null;
  instapay?: string;
  vodafone_cash?: string;
  priority?: number;
  is_active?: boolean;
}

export interface PaymentShiftFormItem {
  label: string;          // مثلاً "شيفت الصباح"
  cashier_name: string;   // مثلاً "أحمد"
  hour_from: number | ''; // 1-12
  period_from: 'am' | 'pm';
  hour_to: number | '';   // 1-12
  period_to: 'am' | 'pm';
  instapay: string;       // معرف إنستاباي الخاص بهذا الشيفت
  vodafone_cash: string;  // رقم فودافون كاش الخاص بهذا الشيفت
  is_active: boolean;
}

export interface BusinessData {
  business_name?: string | null;
  logo?: string | null;
  description?: string | null;
  phone?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  phone3?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  google_maps?: string | null;
  website?: string | null;
  email?: string | null;
  instapay?: string | null;
  vodafone_cash?: string | null;
  offers_url?: string | null;
  maintenance_whatsapp?: string | null;
  telegram_group?: string | null;
  google_review_url?: string | null;
  enable_review_gate?: boolean | null;
  locations?: Array<{ name: string; google_maps_url: string }> | null;
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
  template?: string;
  payment_shifts?: PaymentShift[];
  active_shift?: ActiveShift | null;
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
  card_type: string;
  current_redirect_url: string;
  category_id?: string;
  customer_id?: string | null;
  business_data?: BusinessData;
  template?: string;
  payment_shifts?: PaymentShift[];
  /** default: true on backend */
  requires_subscription?: boolean;
}

export interface ApiUpdateCardDto {
  customer_id?: string | null;
  custom_slug?: string | null;
  card_type?: string;
  current_redirect_url?: string;
  status?: CardStatus;
  category_id?: string;
  business_data?: BusinessData | null;
  template?: string;
  payment_shifts?: PaymentShift[];
  redirect_rules?: RedirectRule[];
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
  template?: 'default' | 'mobile_shop' | string;
  active_shift?: ActiveShift | null;
  payment_shifts?: PaymentShift[];
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
  return new Date(iso).toLocaleDateString('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Format an ISO date string to Arabic date with time */
export const fmtDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString('ar-EG-u-nu-latn', {
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
  partner?: string;
  total_cards?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  partner?: string;
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
  partner?: string;
}

export interface ApiUpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
  partner?: string;
}

export interface ApiChangeCustomerPartnerDto {
  partner: string;
}

export interface PartnerStatItem {
  partner: string;
  customers_count: number;
  cards_count: number;
  active_cards: number;
  expired_cards: number;
}

export interface ApiPartnerStatsResponse {
  total_partners: number;
  total_customers: number;
  total_cards: number;
  partners: string[];
  stats: PartnerStatItem[];
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

// ── Admin In-App Notifications ────────────────────────────────────────────

export interface ApiNotification {
  _id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  link?: string | null;
  is_read: boolean;
  card_id?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiNotificationsResponse {
  notifications: ApiNotification[];
  unread_count: number;
}

// ── User Activity Logs (Audit Trail) ──────────────────────────────────────

export interface ApiUserLog {
  _id: string;
  user_id: string;
  username: string;
  user_name?: string;
  role: string;
  action_type:
    | 'login'
    | 'logout'
    | 'page_view'
    | 'create'
    | 'update'
    | 'delete'
    | 'export'
    | 'status_change';
  action_name: string;
  page_url: string;
  page_title?: string;
  duration_seconds: number;
  session_id?: string | null;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed';
  createdAt: string;
  updatedAt?: string;
}

export interface ApiUserLogsResponse {
  logs: ApiUserLog[];
  total: number;
  page: number;
  total_pages: number;
  limit: number;
}

export interface ApiUserLogsStats {
  total_today: number;
  active_users_today: number;
  avg_duration_today_seconds: number;
  top_page_today: { page_title: string; page_url: string; count: number } | null;
  actions_breakdown: Record<string, number>;
}

export interface TrackActivityPayload {
  log_id?: string;
  action_type?: string;
  action_name?: string;
  page_url: string;
  page_title?: string;
  duration_seconds?: number;
  session_id?: string;
  details?: Record<string, any>;
  status?: string;
}


// ── Bulk Card Editing ─────────────────────────────────────────────────────

/**
 * Represents the state for bulk edit mode
 */
export interface BulkEditState {
  mode: 'single' | 'bulk';
  customerId?: string;
  cardIds: string[];
  affectedCards: ApiCard[];
}

/**
 * Update DTO for bulk edit mode
 * Excludes Step 1 fields (card_code, category_id, card_type, custom_slug, etc.)
 * Only includes Step 2-4 fields that should be applied to ALL cards
 */
export interface ApiBulkCardUpdateDto {
  // Step 2 fields (Business Profile & Contact)
  business_data?: BusinessData | null;
  
  // Step 3 fields (Cashier & Payment)
  payment_shifts?: PaymentShift[];
  
  // Template can be updated in bulk for some cases
  template?: string;
}

/**
 * Result of a bulk card update operation
 */
export interface BulkUpdateResult {
  totalCards: number;
  successCount: number;
  failCount: number;
  failedCardIds: Array<{ cardId: string; code: string; error: string }>;
}

/**
 * Helper function to detect if bulk mode from URL params
 */
export const isBulkMode = (id?: string, customerId?: string): boolean => {
  return !id && !!customerId;
};

/**
 * Helper function to build bulk update DTO (excludes Step 1 fields)
 */
export const buildBulkUpdateDto = (formData: {
  bizData: Record<string, string>;
  shifts: PaymentShiftFormItem[];
  enableReviewGate: boolean;
  template: string;
}): ApiBulkCardUpdateDto => {
  const dto: ApiBulkCardUpdateDto = {};

  // Build business data from form
  const business: BusinessData = {};
  let hasBizData = false;
  
  for (const [k, v] of Object.entries(formData.bizData)) {
    if (typeof v === 'string' && v.trim()) {
      (business as any)[k] = v.trim();
      hasBizData = true;
    }
  }

  if (formData.template === 'mobile_shop') {
    business.enable_review_gate = formData.enableReviewGate;
    hasBizData = true;
  }

  if (hasBizData) {
    dto.business_data = business;
  }

  // Build payment shifts
  if (formData.template === 'mobile_shop' && formData.shifts.length > 0) {
    dto.payment_shifts = formData.shifts.map((s, index) => ({
      label: s.label.trim() || `شيفت ${index + 1}`,
      cashier_name: s.cashier_name.trim() || undefined,
      hour_from: s.hour_from !== '' ? Number(s.hour_from) : undefined,
      period_from: s.period_from,
      hour_to: s.hour_to !== '' ? Number(s.hour_to) : undefined,
      period_to: s.period_to,
      instapay: s.instapay.trim() || undefined,
      vodafone_cash: s.vodafone_cash.trim() || undefined,
      priority: index,
      is_active: s.is_active,
    }));
  }

  dto.template = formData.template;

  return dto;
};
