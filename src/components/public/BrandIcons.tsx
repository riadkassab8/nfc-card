import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const WhatsAppIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#25D366" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <path fill="#FFF" transform="translate(4,4) scale(0.66)" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <defs>
      <linearGradient id="ig-squircle" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEDA75"/>
        <stop offset="0.3" stopColor="#FA7E1E"/>
        <stop offset="0.6" stopColor="#D62976"/>
        <stop offset="0.8" stopColor="#962FBF"/>
        <stop offset="1" stopColor="#4F5BD5"/>
      </linearGradient>
    </defs>
    <path fill="url(#ig-squircle)" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#fff" strokeWidth="2" fill="none" />
    <rect x="6.5" y="6.5" width="11" height="11" rx="3" ry="3" stroke="#fff" strokeWidth="2" fill="none" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" />
  </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#1877F2" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <path fill="#FFF" transform="translate(3,3) scale(0.75)" d="M15.54 12.07l.53-3.5h-3.32V6.31c0-.96.45-1.89 1.96-1.89h1.5V1.45s-1.37-.24-2.68-.24c-2.73 0-4.54 1.67-4.54 4.7v2.71H7.08v3.49h3.04V24a12.03 12.03 0 003.8 0v-8.44h2.62z"/>
  </svg>
);

export const TikTokIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#000" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <path fill="#FFF" transform="translate(4,4) scale(0.66)" d="M16.6 5.82A4.278 4.278 0 0113.2 2h-3.1v13.52a2.82 2.82 0 11-2.82-2.82c.28 0 .55.04.8.12V9.6a5.92 5.92 0 105.12 5.86V8.62a7.35 7.35 0 004.4 1.45V6.94a4.34 4.34 0 01-1-1.12z" />
  </svg>
);

export const GoogleMapsIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#EA4335" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <path fill="#FFF" transform="translate(4,4) scale(0.66)" d="M12 4c-2.76 0-5 2.24-5 5 0 3.75 5 9.29 5 9.29s5-5.54 5-9.29c0-2.76-2.24-5-5-5zm0 6.79c-1.04 0-1.89-.85-1.89-1.89 0-1.04.85-1.89 1.89-1.89 1.04 0 1.89.85 1.89 1.89 0 1.04-.85 1.89-1.89 1.89z" />
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#2563EB" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <path stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(4,4) scale(0.66)" d="M16 12.5v2c0 1.1-.9 2-2 2-4.42 0-8-3.58-8-8 0-1.1.9-2 2-2h2c1.1 0 1.45.9 1.63 1.54.12.45-.04 1.25-.43 1.64l-.9.9c1.02 1.84 2.76 3.58 4.6 4.6l.9-.9c.39-.39 1.19-.55 1.64-.43.64.18 1.54.53 1.54 1.63z" />
  </svg>
);

export const EmailIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#EA580C" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <path stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(4,4) scale(0.66)" d="M6 8h12c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1z" />
    <polyline stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(4,4) scale(0.66)" points="19,8.5 12,13.5 5,8.5" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#4F46E5" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <g transform="translate(4,4) scale(0.66)" stroke="#FFF" strokeWidth="2" fill="none">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </g>
  </svg>
);

export const VerifiedCheckIcon: React.FC<IconProps> = ({ size = 20, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path
      d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
      fill="#38BDF8"
    />
    <path
      d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4-6.7 6.7z"
      fill="#0F172A"
    />
  </svg>
);

export const InstaPayIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#49258E" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <path
      fill="#FFFFFF"
      transform="translate(4,4) scale(0.66)"
      d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm-1 6h2v6h-2V8zm1 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
    />
  </svg>
);

export const VodafoneCashIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <path fill="#E60000" d="M12,0 C21.6,0 24,2.4 24,12 C24,21.6 21.6,24 12,24 C2.4,24 0,21.6 0,12 C0,2.4 2.4,0 12,0 Z" />
    <circle cx="12" cy="12" r="7" fill="#FFFFFF" />
    <path fill="#E60000" d="M12 8c-2.21 0-4 1.79-4 4 0 1.2.53 2.27 1.37 3h2.15C10.6 14.53 10 13.34 10 12c0-1.1.9-2 2-2s2 .9 2 2c0 .73-.32 1.38-.82 1.83l1.45 1.45C15.42 14.47 16 13.31 16 12c0-2.21-1.79-4-4-4z" />
  </svg>
);

