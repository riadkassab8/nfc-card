import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const WhatsAppIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <img
    src="https://img.icons8.com/?size=100&id=uZWiLUyryScN&format=png&color=000000"
    alt="WhatsApp"
    width={size}
    height={size}
    className={className}
    style={{ borderRadius: '22%', objectFit: 'cover', ...style }}
  />
);

export const InstagramIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <img
    src="https://img.icons8.com/?size=100&id=Xy10Jcu1L2Su&format=png&color=000000"
    alt="Instagram"
    width={size}
    height={size}
    className={className}
    style={{ borderRadius: '22%', objectFit: 'cover', ...style }}
  />
);

export const FacebookIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <img
    src="https://img.icons8.com/?size=100&id=uLWV5A9vXIPu&format=png&color=000000"
    alt="Facebook"
    width={size}
    height={size}
    className={className}
    style={{ objectFit: 'cover', ...style }}
  />
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
  <img
    src="https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/73/c5/82/73c58271-c6b5-9474-6d2d-cc3a1dafddd4/AppIcon-0-1x_U007emarketing-0-10-0-sRGB-0-85-220-0.png/1200x630wa.png"
    alt="InstaPay"
    width={size}
    height={size}
    className={className}
    style={{ borderRadius: '22%', objectFit: 'cover', ...style }}
  />
);

export const VodafoneCashIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <img
    src="https://tse1.mm.bing.net/th/id/OIP.E83-pgp8_VP-WnFKW1Jq7gHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
    alt="Vodafone Cash"
    width={size}
    height={size}
    className={className}
    style={{ borderRadius: '22%', objectFit: 'cover', ...style }}
  />
);

