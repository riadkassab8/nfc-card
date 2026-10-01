/* ==========================================================================
   CENTRALIZED API CLIENT (src/services/api/client.ts)
   Strictly enforces the exact Authentication Matrix:
   - NO TOKEN: POST /api/auth/login, GET /api/cards/:id/qr, GET /r/:identifier
   - TOKEN REQUIRED: ALL OTHER /api endpoints
   ========================================================================== */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://smart-card-qr-api.koyeb.app/api').replace(/\/$/, '');
const PUBLIC_REDIRECT_BASE_URL = (import.meta.env.VITE_PUBLIC_REDIRECT_BASE_URL || 'https://smart-card-qr-api.koyeb.app/r').replace(/\/$/, '');

const TOKEN_STORAGE_KEY = 'nfc_admin_access_token';

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (e) {
    console.error('Failed to save access_token to storage:', e);
  }
};

export const clearStoredToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear access_token from storage:', e);
  }
};

export class ApiError extends Error {
  statusCode: number;
  errorType?: string;
  details?: any;

  constructor(statusCode: number, message: string, errorType?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean; // Explicit toggle for token inclusion
  responseType?: 'json' | 'blob';
}

/**
 * Helper to determine if an endpoint MUST NOT receive an Authorization header
 */
const isUnauthenticatedRoute = (endpoint: string, options?: RequestOptions): boolean => {
  if (options?.requiresAuth === false) return true;
  if (options?.requiresAuth === true) return false;

  // Strict check for documented unauthenticated routes
  const cleanEndpoint = endpoint.split('?')[0];
  if (cleanEndpoint === '/auth/login') return true;
  if (cleanEndpoint.startsWith('/cards/') && cleanEndpoint.endsWith('/qr')) return true;
  if (cleanEndpoint.startsWith('/r/')) return true;

  return false;
};

export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', headers = {}, body, params, responseType = 'json' } = options;

  // Construct Query String if params exist
  let queryString = '';
  if (params) {
    const validParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    if (validParams.length > 0) {
      queryString = `?${validParams.join('&')}`;
    }
  }

  // Construct full URL
  let fullUrl = '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    fullUrl = `${endpoint}${queryString}`;
  } else if (endpoint.startsWith('/r/')) {
    fullUrl = `${PUBLIC_REDIRECT_BASE_URL}${endpoint.substring(2)}${queryString}`;
  } else {
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    fullUrl = `${API_BASE_URL}${cleanPath}${queryString}`;
  }

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  // Add JSON content type if body is present and not FormData
  if (body && !(body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // STAGE AUTH MATRIX ENFORCEMENT
  const noTokenRequired = isUnauthenticatedRoute(endpoint, options);

  if (!noTokenRequired) {
    const token = getStoredToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  } else {
    // Ensure no Authorization header is accidentally sent to unauthenticated routes
    delete requestHeaders['Authorization'];
    delete requestHeaders['authorization'];
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    const response = await fetch(fullUrl, fetchOptions);

    // Handle 401 Unauthorized globally
    if (response.status === 401 && !noTokenRequired) {
      clearStoredToken();
      // Notify application of 401 to trigger redirect to Login
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api:unauthorized'));
      }
    }

    // Handle Error Responses
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      let errorType = 'HttpError';
      let errorDetails = null;

      try {
        const errorJson = await response.json();
        if (errorJson) {
          errorDetails = errorJson;
          errorType = errorJson.error || errorType;
          if (Array.isArray(errorJson.message)) {
            errorMessage = errorJson.message.join(' | ');
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        }
      } catch (e) {
        // Response wasn't JSON
      }

      throw new ApiError(response.status, errorMessage, errorType, errorDetails);
    }

    if (responseType === 'blob') {
      return (await response.blob()) as T;
    }

    // Return JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Network failure or API server unreachable', 'NetworkError');
  }
};

export const getApiBaseUrl = () => API_BASE_URL;
export const getPublicRedirectBaseUrl = () => PUBLIC_REDIRECT_BASE_URL;
