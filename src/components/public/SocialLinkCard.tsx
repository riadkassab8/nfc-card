import React, { useState } from 'react';
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  GoogleMapsIcon,
  PhoneIcon,
  EmailIcon,
  GlobeIcon,
} from './BrandIcons';
import { Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export interface SocialLinkData {
  id: string;
  platform: 'whatsapp' | 'phone' | 'instagram' | 'facebook' | 'tiktok' | 'google_maps' | 'website' | 'email';
  title: string;
  subtitle?: string;
  url: string;
  copyable?: boolean;
}

interface SocialLinkCardProps {
  data: SocialLinkData;
  copiedId: string | null;
  onCopy: (url: string, id: string) => void;
  dir?: 'rtl' | 'ltr';
}

/* Platform style presets */
const PLATFORM_PRESETS: Record<
  SocialLinkData['platform'],
  {
    bgGradient: string;
    iconBg: string;
    iconColor: string;
    borderHover: string;
    glowColor: string;
    icon: React.ReactNode;
  }
> = {
  whatsapp: {
    bgGradient: 'linear-gradient(135deg, rgba(37, 211, 102, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
    iconBg: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    iconColor: '#FFFFFF',
    borderHover: 'rgba(37, 211, 102, 0.45)',
    glowColor: 'rgba(37, 211, 102, 0.25)',
    icon: <WhatsAppIcon size={24} />,
  },
  instagram: {
    bgGradient: 'linear-gradient(135deg, rgba(225, 48, 108, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
    iconBg: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    iconColor: '#FFFFFF',
    borderHover: 'rgba(225, 48, 108, 0.45)',
    glowColor: 'rgba(225, 48, 108, 0.25)',
    icon: <InstagramIcon size={24} />,
  },
  facebook: {
    bgGradient: 'linear-gradient(135deg, rgba(24, 119, 242, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
    iconBg: 'linear-gradient(135deg, #1877F2 0%, #0F52BA 100%)',
    iconColor: '#FFFFFF',
    borderHover: 'rgba(24, 119, 242, 0.45)',
    glowColor: 'rgba(24, 119, 242, 0.25)',
    icon: <FacebookIcon size={24} />,
  },
  tiktok: {
    bgGradient: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
    iconBg: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)',
    iconColor: '#00f2fe',
    borderHover: 'rgba(0, 242, 254, 0.45)',
    glowColor: 'rgba(0, 242, 254, 0.25)',
    icon: <TikTokIcon size={24} />,
  },
  google_maps: {
    bgGradient: 'linear-gradient(135deg, rgba(234, 67, 53, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
    iconBg: 'linear-gradient(135deg, #EA4335 0%, #4285F4 100%)',
    iconColor: '#FFFFFF',
    borderHover: 'rgba(234, 67, 53, 0.45)',
    glowColor: 'rgba(234, 67, 53, 0.25)',
    icon: <GoogleMapsIcon size={24} />,
  },
  phone: {
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
    iconBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    iconColor: '#FFFFFF',
    borderHover: 'rgba(59, 130, 246, 0.45)',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    icon: <PhoneIcon size={22} />,
  },
  email: {
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
    iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    iconColor: '#FFFFFF',
    borderHover: 'rgba(139, 92, 246, 0.45)',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    icon: <EmailIcon size={22} />,
  },
  website: {
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
    iconBg: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)',
    iconColor: '#FFFFFF',
    borderHover: 'rgba(6, 182, 212, 0.45)',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    icon: <GlobeIcon size={24} />,
  },
};

export const SocialLinkCard: React.FC<SocialLinkCardProps> = ({
  data,
  copiedId,
  onCopy,
  dir = 'rtl',
}) => {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const preset = PLATFORM_PRESETS[data.platform] || PLATFORM_PRESETS.website;
  const isCopied = copiedId === data.id;

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px 20px',
    marginBottom: '14px',
    backgroundColor: hover ? 'rgba(30, 41, 59, 0.75)' : 'rgba(15, 23, 42, 0.65)',
    backgroundImage: preset.bgGradient,
    border: `1px solid ${isCopied ? preset.borderHover : hover ? preset.borderHover : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '20px',
    textDecoration: 'none',
    color: '#f8fafc',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: hover
      ? `0 12px 28px -10px ${preset.glowColor}, 0 4px 12px rgba(0, 0, 0, 0.4)`
      : '0 4px 20px rgba(0, 0, 0, 0.25)',
    transform: pressed ? 'scale(0.98)' : hover ? 'translateY(-3px)' : 'none',
    transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
    backdropFilter: 'blur(16px)',
    WebkitTapHighlightColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  };

  const ArrowIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const innerContent = (
    <>
      {/* Left Glow Bar on Hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [dir === 'rtl' ? 'right' : 'left']: 0,
          width: '4px',
          background: preset.iconBg,
          opacity: hover || isCopied ? 1 : 0,
          transition: 'opacity 220ms ease',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        {/* Brand Icon Badge */}
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: preset.iconBg,
            color: preset.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 8px 18px -4px ${preset.glowColor}`,
            transform: hover ? 'scale(1.06)' : 'none',
            transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {preset.icon}
        </div>

        {/* Text Container */}
        <div style={{ minWidth: 0, flex: 1, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#f8fafc',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}
          >
            {data.title}
          </div>
          {data.subtitle && (
            <div
              style={{
                fontSize: '0.8125rem',
                color: '#94a3b8',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'monospace',
                direction: 'ltr',
                textAlign: dir === 'rtl' ? 'right' : 'left',
              }}
            >
              {data.subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Action Indicator (Arrow or Copy) */}
      <div
        style={{
          color: isCopied ? '#38BDF8' : hover ? '#f8fafc' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '12px',
          backgroundColor: hover ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          flexShrink: 0,
          transform: hover && !data.copyable ? (dir === 'rtl' ? 'translateX(-4px)' : 'translateX(4px)') : 'none',
          transition: 'all 220ms ease',
        }}
      >
        {data.copyable ? (
          isCopied ? (
            <Check size={20} style={{ color: '#38BDF8' }} />
          ) : (
            <Copy size={18} />
          )
        ) : (
          <ArrowIcon size={20} />
        )}
      </div>
    </>
  );

  if (data.copyable) {
    return (
      <button
        type="button"
        className="gsap-link-card"
        onClick={() => onCopy(data.url, data.id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          setPressed(false);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        style={cardStyle}
        aria-label={`نسخ ${data.title}`}
      >
        {innerContent}
      </button>
    );
  }

  return (
    <a
      href={data.url}
      className="gsap-link-card"
      target={data.url.startsWith('tel:') || data.url.startsWith('mailto:') ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={cardStyle}
      aria-label={`فتح ${data.title}`}
    >
      {innerContent}
    </a>
  );
};
