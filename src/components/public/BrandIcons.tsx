import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* ── Authentic Official WhatsApp SVG ── */
export const WhatsAppIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
    <rect width="48" height="48" rx="14" fill="#25D366" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.07 33.93L15.34 29.28A11.83 11.83 0 0113.6 23.95C13.6 18.23 18.28 13.55 24 13.55C26.77 13.55 29.38 14.63 31.34 16.59C33.3 18.55 34.38 21.16 34.38 23.95C34.38 29.67 29.7 34.35 23.98 34.35C22.18 34.35 20.44 33.88 18.91 32.99L14.07 33.93ZM18.95 30.93L19.34 31.16A9.85 9.85 0 0023.98 32.35C28.61 32.35 32.38 28.58 32.38 23.95C32.38 21.69 31.5 19.57 29.91 17.98C28.32 16.39 26.2 15.51 23.94 15.51C15.54 25.6 16.05 27.24 17.02 28.63L17.27 29L16.5 31.81L18.95 30.93ZM21.32 20.08C21.1 19.59 20.87 19.58 20.66 19.57C20.49 19.56 20.29 19.56 20.09 19.56C19.89 19.56 19.56 19.64 19.29 19.93C19.02 20.22 18.26 20.93 18.26 22.38C18.26 23.83 19.31 25.23 19.46 25.43C19.61 25.63 21.5 28.52 24.39 29.77C25.08 30.07 25.61 30.25 26.03 30.38C26.72 30.6 27.35 30.57 27.85 30.5C28.4 30.42 29.54 29.81 29.78 29.15C30.02 28.49 30.02 27.93 29.95 27.81C29.88 27.69 29.68 27.62 29.38 27.47C29.08 27.32 26.6 27.61 26.67 26.65C26.47 26.95 25.9 27.62 25.73 27.82C25.56 28.02 25.39 28.05 25.09 27.9C24.79 27.75 23.83 27.44 22.69 26.42C21.8 25.63 21.2 24.65 21.03 24.35C20.86 24.05 21.01 23.89 21.16 23.74C21.29 23.61 21.46 23.39 21.61 23.22C21.76 23.05 21.81 22.92 21.91 22.72C22.01 22.52 21.96 22.35 21.89 22.2C21.82 22.05 21.26 20.69 21.32 20.08Z"
      fill="white"
    />
  </svg>
);

/* ── Authentic Official Instagram SVG ── */
export const InstagramIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
    <defs>
      <radialGradient id="ig-rg" cx="30%" cy="107%" r="130%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect width="48" height="48" rx="14" fill="url(#ig-rg)" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 14c2.715 0 3.036.01 4.106.06 1.07.048 1.799.218 2.438.466a4.92 4.92 0 011.77 1.153 4.92 4.92 0 011.153 1.77c.248.639.418 1.368.466 2.438.049 1.07.06 1.39.06 4.106s-.01 3.036-.06 4.106c-.048 1.07-.218 1.799-.466 2.438a4.92 4.92 0 01-1.153 1.77 4.92 4.92 0 01-1.77 1.153c-.639.248-1.368.418-2.438.466-1.07.049-1.39.06-4.106.06s-3.036-.01-4.106-.06c-1.07-.048-1.799-.218-2.438-.466a4.92 4.92 0 01-1.77-1.153 4.92 4.92 0 01-1.153-1.77c-.248-.639-.418-1.368-.466-2.438C14.01 27.036 14 26.715 14 24s.01-3.036.06-4.106c.048-1.07.218-1.799.466-2.438a4.92 4.92 0 011.153-1.77 4.92 4.92 0 011.77-1.153c.639-.248 1.368-.418 2.438-.466 1.07-.049 1.39-.06 4.106-.06zm0 2.162c-2.669 0-2.985.01-4.039.058-.975.044-1.503.207-1.856.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.881-.344 1.856-.048 1.054-.058 1.37-.058 4.039s.01 2.985.058 4.039c.044.975.207 1.503.344 1.856.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.881.3 1.856.344 1.054.048 1.37.058 4.039.058s2.985-.01 4.039-.058c.975-.044 1.503-.207 1.856-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.881.344-1.856.048-1.054.058-1.37.058-4.039s-.01-2.985-.058-4.039c-.044-.975-.207-1.503-.344-1.856a3.178 3.178 0 00-.748-1.15 3.178 3.178 0 00-1.15-.748c-.353-.137-.881-.3-1.856-.344-1.054-.048-1.37-.058-4.039-.058zM24 18.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.108a2.973 2.973 0 100-5.946 2.973 2.973 0 000 5.946zm7.541-11.838a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
      fill="white"
    />
  </svg>
);

/* ── Authentic Official Facebook SVG ── */
export const FacebookIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
    <circle cx="24" cy="24" r="24" fill="#1877F2" />
    <path
      d="M29.5 25.5l.8-5.5h-5.3v-3.6c0-1.5.7-2.9 3-2.9h2.3V8.8s-2.1-.4-4.1-.4c-4.2 0-7 2.6-7 7.2v4.4h-4.8v5.5h4.8V39h6V25.5h4.3z"
      fill="white"
    />
  </svg>
);

/* ── Authentic Official TikTok SVG ── */
export const TikTokIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
    <rect width="48" height="48" rx="14" fill="#000000" />
    <g transform="translate(6, 6)">
      <path
        fill="#00F2FE"
        d="M22.5 13.5a7.5 7.5 0 01-4.5-1.5v8.25a6.75 6.75 0 11-6.75-6.75c.38 0 .75.04 1.13.11v3.45a3.38 3.38 0 102.25 3.19v-13.5h3.38a7.5 7.5 0 004.5 4.5v2.25z"
      />
      <path
        fill="#FF004F"
        d="M21.75 12.75a7.5 7.5 0 01-4.5-1.5v8.25a6.75 6.75 0 11-6.75-6.75c.38 0 .75.04 1.13.11v3.45a3.38 3.38 0 102.25 3.19v-13.5h3.38a7.5 7.5 0 004.5 4.5v2.25z"
      />
      <path
        fill="#FFFFFF"
        d="M22.13 13.13a7.5 7.5 0 01-4.5-1.5v8.25a6.75 6.75 0 11-6.75-6.75c.38 0 .75.04 1.13.11v3.45a3.38 3.38 0 102.25 3.19v-13.5h3.38a7.5 7.5 0 004.5 4.5v2.25z"
      />
    </g>
  </svg>
);

/* ── Authentic Official Google Maps SVG ── */
export const GoogleMapsIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
    <rect width="48" height="48" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    <path d="M24 11c-5.5 0-10 4.5-10 10 0 7.5 10 17 10 17s10-9.5 10-17c0-5.5-4.5-10-10-10zm0 13.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" fill="#EA4335" />
    <path d="M24 11c-5.5 0-10 4.5-10 10 0 2.2.8 4.2 2.1 5.8l7.9-15.8z" fill="#4285F4" />
    <path d="M24 11v10h10c0-5.5-4.5-10-10-10z" fill="#34A853" />
    <path d="M16.1 26.8l7.9 11.2V21H14c0 2.2.8 4.2 2.1 5.8z" fill="#FBBC04" />
  </svg>
);

/* ── Authentic Phone Call SVG ── */
export const PhoneIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
    <rect width="48" height="48" rx="14" fill="#2563EB" />
    <path
      d="M33.6 28.1c-1.3 0-2.6-.2-3.8-.6-.4-.1-.8 0-1.1.3l-2.4 2.4c-3.2-1.6-5.8-4.2-7.4-7.4l2.4-2.4c.3-.3.4-.7.3-1.1-.4-1.2-.6-2.5-.6-3.8 0-.8-.7-1.5-1.5-1.5h-3.8C14.2 14 13 15.2 13 23c0 8.3 6.7 15 15 15 7.8 0 9-1.2 9-2.7v-3.8c0-.8-.7-1.5-1.5-1.5z"
      fill="#FFFFFF"
    />
  </svg>
);

/* ── Authentic Email SVG ── */
export const EmailIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
    <rect width="48" height="48" rx="14" fill="url(#em-grad)" />
    <path d="M34 16H14c-1.7 0-3 1.3-3 3v10c0 1.7 1.3 3 3 3h20c1.7 0 3-1.3 3-3V19c0-1.7-1.3-3-3-3zm0 4l-10 6.25L14 20v-1l10 6.25L34 19v1z" fill="#FFFFFF" />
    <defs>
      <linearGradient id="em-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
  </svg>
);

/* ── Authentic Globe SVG ── */
export const GlobeIcon: React.FC<IconProps> = ({ size = 48, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
    <rect width="48" height="48" rx="14" fill="url(#ws-grad)" />
    <circle cx="24" cy="24" r="11" stroke="#FFFFFF" strokeWidth="2.2" />
    <line x1="13" y1="24" x2="35" y2="24" stroke="#FFFFFF" strokeWidth="2.2" />
    <path d="M24 13c3.2 0 6 4.9 6 11s-2.8 11-6 11-6-4.9-6-11 2.8-11 6-11z" stroke="#FFFFFF" strokeWidth="2.2" />
    <defs>
      <linearGradient id="ws-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06B6D4" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
  </svg>
);

/* ── Verified Badge ── */
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

/* ── Authentic Official InstaPay Egypt Logo ── */
export const InstaPayIcon: React.FC<IconProps> = ({ size = 48, className, style }) => {
  const [err, setErr] = React.useState(false);
  if (err) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
        <rect width="48" height="48" rx="14" fill="#482583" />
        <path d="M26 8L15 24h7l-2 14 13-17h-7l3-12z" fill="#FFD700" stroke="#FFFFFF" strokeWidth="1" />
        <text x="24" y="42" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="900" fontSize="6.5" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.6">instapay</text>
      </svg>
    );
  }

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${size * 0.29}px`,
      backgroundColor: '#482583',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...style
    }} className={className}>
      <img
        src="https://brandlogos.sgp1.digitaloceanspaces.com/png/arcticons/instapay-400.png"
        alt="InstaPay"
        style={{ width: `${size * 0.72}px`, height: `${size * 0.72}px`, objectFit: 'contain' }}
        onError={() => setErr(true)}
      />
    </div>
  );
};

/* ── Authentic Official Vodafone Cash Logo ── */
export const VodafoneCashIcon: React.FC<IconProps> = ({ size = 48, className, style }) => {
  const [err, setErr] = React.useState(false);
  if (err) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} style={style}>
        <rect width="48" height="48" rx="14" fill="#E60000" />
        <g transform="translate(10, 10)">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 4.9 2.5 9.2 6.3 11.7L4 30l7.3-2.4C12.3 27.8 13.1 28 14 28c7.732 0 14-6.268 14-14S21.732 0 14 0zm0 21c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z" fill="#FFFFFF" />
          <path d="M14 10c-2.209 0-4 1.791-4 4 0 2.209 1.791 4 4 4 2.209 0 4-1.791 4-4 0-2.209-1.791-4-4-4z" fill="#E60000" />
        </g>
      </svg>
    );
  }

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${size * 0.29}px`,
      backgroundColor: '#E60000',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...style
    }} className={className}>
      <img
        src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Vodafone_logo_2017.svg"
        alt="Vodafone Cash"
        style={{ width: `${size * 0.65}px`, height: `${size * 0.65}px`, objectFit: 'contain' }}
        onError={() => setErr(true)}
      />
    </div>
  );
};
