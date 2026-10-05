/* ==========================================================================
   APP CONFIG & DOMAIN RESOLUTION (src/config/appConfig.ts)
   Dynamically determines the public app URL based on environment or browser origin.
   ========================================================================== */

export const getAppBaseUrl = (): string => {
  // 1. Allow overriding via environment variable (e.g. VITE_APP_URL in .env)
  const envUrl = (import.meta as any).env?.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/$/, '');
  }

  // 2. Dynamic browser origin (works in dev localhost as well as production domain)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // 3. Fallback default
  return 'https://smart-card-qr-api.koyeb.app';
};

export const getSocialPageUrl = (cardCode: string): string => {
  return `${getAppBaseUrl()}/r/${cardCode}`;
};
