/* ==========================================================================
   PLATFORM ICONS CONFIG — Centralized Official & Verified Brand Icon Registry
   Uses official brand SVGs & Simple Icons CDN for guaranteed crispness & accuracy.
   ========================================================================== */

export interface PlatformConfig {
  id: string;
  name: string;
  nameAr: string;
  iconUrl: string;
  brandColor: string;
  bgGradient?: string;
  subtitleAr: string;
  isOfficialAsset: boolean;
}

export const PLATFORM_ICONS: Record<string, PlatformConfig> = {
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    nameAr: 'واتساب',
    iconUrl: '/icons/whatsapp.png',
    brandColor: '#25D366',
    bgGradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    subtitleAr: 'تواصل معنا مباشرة',
    isOfficialAsset: true,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    nameAr: 'انستجرام',
    iconUrl: '/icons/instagram.png',
    brandColor: '#E4405F',
    bgGradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    subtitleAr: 'شاهد يومياتنا',
    isOfficialAsset: true,
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    nameAr: 'فيسبوك',
    iconUrl: '/icons/facebook.png',
    brandColor: '#1877F2',
    bgGradient: 'linear-gradient(135deg, #1877F2 0%, #0F52BA 100%)',
    subtitleAr: 'تابع آخر الأخبار',
    isOfficialAsset: true,
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    nameAr: 'تيك توك',
    iconUrl: '/icons/tiktok.png',
    brandColor: '#000000',
    bgGradient: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)',
    subtitleAr: 'اكتشف المزيد',
    isOfficialAsset: true,
  },
  google_maps: {
    id: 'google_maps',
    name: 'Google Review',
    nameAr: 'تقييمات جوجل / الخريطة',
    iconUrl: 'https://cdn.simpleicons.org/googlemaps',
    brandColor: '#EA4335',
    bgGradient: 'linear-gradient(135deg, #EA4335 0%, #4285F4 100%)',
    subtitleAr: 'موقعنا على الخريطة',
    isOfficialAsset: true,
  },
  phone: {
    id: 'phone',
    name: 'Call',
    nameAr: 'اتصال هاتفي',
    iconUrl: '/icons/phone.png',
    brandColor: '#2563EB',
    bgGradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    subtitleAr: 'يسعدنا استقبال مكالمتك',
    isOfficialAsset: true,
  },
  email: {
    id: 'email',
    name: 'Email',
    nameAr: 'البريد الإلكتروني',
    iconUrl: 'https://cdn.simpleicons.org/gmail',
    brandColor: '#EA4335',
    bgGradient: 'linear-gradient(135deg, #EA4335 0%, #B91C1C 100%)',
    subtitleAr: 'راسلنا عبر البريد',
    isOfficialAsset: true,
  },
  website: {
    id: 'website',
    name: 'Website',
    nameAr: 'الموقع الإلكتروني',
    iconUrl: 'https://cdn.simpleicons.org/googlechrome',
    brandColor: '#0284C7',
    bgGradient: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)',
    subtitleAr: 'تصفح موقعنا',
    isOfficialAsset: true,
  },
  instapay: {
    id: 'instapay',
    name: 'InstaPay',
    nameAr: 'إنستا باي',
    iconUrl: '/icons/instapay.png',
    brandColor: '#49258E',
    bgGradient: 'linear-gradient(135deg, #49258E 0%, #2A135C 100%)',
    subtitleAr: 'للدفع والتحويل',
    isOfficialAsset: true,
  },
  vodafone_cash: {
    id: 'vodafone_cash',
    name: 'Vodafone Cash',
    nameAr: 'فودافون كاش',
    iconUrl: '/icons/vodafone_cash.png',
    brandColor: '#E60000',
    bgGradient: 'linear-gradient(135deg, #E60000 0%, #990000 100%)',
    subtitleAr: 'حول بسهولة وأمان',
    isOfficialAsset: true,
  },
};

/** Helper to retrieve platform configuration safely with fallback */
export const getPlatformConfig = (platformKey: string): PlatformConfig => {
  const key = platformKey.toLowerCase().trim();
  if (key === 'call') return PLATFORM_ICONS.phone;
  return PLATFORM_ICONS[key] || PLATFORM_ICONS.website;
};
