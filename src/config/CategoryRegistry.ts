import { ApiCategory, BusinessData } from '../types';

export type LandingRouteType = 'google-review' | 'social' | 'payment' | 'direct';

export interface CategoryConfig {
  landingRoute: LandingRouteType;
  allowedFields: (keyof BusinessData)[];
}

/**
 * Temporary registry to determine category behavior.
 * TODO(Backend): Add `landing_key` or `slug` to the Category schema 
 * so we don't have to rely on string matching the category name here.
 */
export const getCategoryConfig = (
  apiCategory?: ApiCategory | string | null,
  categoriesList?: ApiCategory[]
): CategoryConfig => {
  const defaultConfig: CategoryConfig = {
    landingRoute: 'direct',
    allowedFields: ['website', 'phone', 'whatsapp', 'description'],
  };

  if (!apiCategory) return defaultConfig;

  let nameToMatch = '';
  if (typeof apiCategory === 'string') {
    // If we only have an ID, try to find it in the provided list
    if (categoriesList) {
      const found = categoriesList.find((c) => c._id === apiCategory);
      if (found) nameToMatch = found.name;
    } else {
      // We can't resolve it properly without the list, but we can't do much
      nameToMatch = apiCategory; // fallback just in case the string is the name
    }
  } else {
    nameToMatch = apiCategory.name;
  }

  if (!nameToMatch) return defaultConfig;

  const lower = nameToMatch.toLowerCase();

  if (lower.includes('google')) {
    return {
      landingRoute: 'google-review',
      allowedFields: ['google_maps'],
    };
  }

  if (lower.includes('instapay') || lower.includes('payment')) {
    return {
      landingRoute: 'payment',
      allowedFields: ['website'],
    };
  }

  if (lower.includes('social') || lower.includes('instagram')) {
    return {
      landingRoute: 'social',
      allowedFields: [
        'whatsapp',
        'phone',
        'instagram',
        'facebook',
        'tiktok',
        'website',
      ],
    };
  }

  return defaultConfig;
};

export const resolveLandingUrl = (cardCode: string, config: CategoryConfig): string => {
  const origin = (import.meta as any).env?.VITE_PUBLIC_FRONTEND_URL || window.location.origin;
  
  switch (config.landingRoute) {
    case 'social':
      return `${origin}/social/${cardCode}`;
    case 'google-review':
      return `${origin}/google-review/${cardCode}`;
    case 'payment':
      return `${origin}/payment/${cardCode}`;
    case 'direct':
    default:
      return `${origin}/c/${cardCode}`;
  }
};
