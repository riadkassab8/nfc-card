/* ==========================================================================
   API CLIENT (src/services/api/client.ts)
   Base URL: VITE_API_BASE_URL || https://smart-card-qr-api.koyeb.app/api
   Auth matrix enforced via requiresAuth flag on every call.
   ========================================================================== */

const API_BASE = (
  (import.meta as any).env?.VITE_API_BASE_URL ||
  'https://smart-card-qr-api.koyeb.app/api'
).replace(/\/$/, '');

const TOKEN_KEY = 'nfc_admin_token';

// ── Token helpers ─────────────────────────────────────────────────────────

export const getToken = (): string | null => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token: string): void => {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
};

export const clearToken = (): void => {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload && typeof payload.exp === 'number') {
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearToken();
    return false;
  }
  return true;
};

// ── Error class ───────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorType?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Request options ───────────────────────────────────────────────────────

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  requiresAuth?: boolean;
  responseType?: 'json' | 'blob';
  skipUnauthorizedRedirect?: boolean;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    params,
    requiresAuth = true,
    responseType = 'json',
    skipUnauthorizedRedirect = false,
  } = options;

  // Build query string
  let qs = '';
  if (params) {
    const parts = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    if (parts.length) qs = '?' + parts.join('&');
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}${qs}`;

  const headers: Record<string, string> = {};

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, 'فشل الاتصال بالسيرفر. تحقق من الإنترنت.', 'NetworkError');
  }

  if (!response.ok) {
    let message = `خطأ ${response.status}: ${response.statusText}`;
    let errorType = 'HttpError';
    let details: unknown;
    try {
      const err = await response.json();
      details = err;
      errorType = err?.error || errorType;
      if (Array.isArray(err?.message)) message = err.message.join(' | ');
      else if (err?.message) message = err.message;
    } catch { /* not JSON */ }

    if (response.status === 429) {
      message = 'تم تجاوز الحد المسموح به. انتظر دقيقة ثم حاول مجدداً.';
    }

    // Global 401 handler
    if (response.status === 401 && requiresAuth) {
      // Check if this 401 is simply an invalid confirmation password (e.g. deleting customer/card)
      const hasPasswordInBody = body && typeof body === 'object' && 'password' in (body as any);
      const isPasswordConfirmationError =
        skipUnauthorizedRedirect ||
        hasPasswordInBody ||
        method === 'DELETE' ||
        message.includes('كلمة مرور') ||
        message.toLowerCase().includes('password');

      if (!isPasswordConfirmationError) {
        clearToken();
        window.dispatchEvent(new CustomEvent('api:unauthorized'));
        throw new ApiError(401, 'انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.', 'UnauthorizedException', details);
      }
    }

    throw new ApiError(response.status, message, errorType, details);
  }

  if (responseType === 'blob') {
    return (await response.blob()) as T;
  }

  // Some DELETE responses return 200 with a message body
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const getApiBaseUrl = () => API_BASE;
