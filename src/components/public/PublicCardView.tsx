import React, { useState } from 'react';
import { CardItem } from '../../types';
import {
  MessageCircle,
  Phone,
  Globe,
  Check,
  Copy,
  Instagram,
  Facebook,
  Video,
  ChevronLeft,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export interface PublicCardViewProps {
  card: CardItem;
}

export interface CardLinkItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  isCopyable?: boolean;
}

// ─── SMART LINK BUTTON ─────────────────────────────────────────────
const SmartLinkButton: React.FC<{
  link: CardLinkItem;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}> = ({ link, copiedId, onCopy }) => {
  const isCopied = copiedId === link.id;

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    textDecoration: 'none',
    color: '#0f172a',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    outline: 'none',
    marginBottom: '12px',
    WebkitTapHighlightColor: 'transparent',
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
    minWidth: 0,
  };

  const iconWrapperStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: `${link.color}15`,
    color: link.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const textWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '100%',
    textAlign: 'start',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: '#64748b',
    marginTop: '2px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '100%',
    textAlign: 'start',
  };

  const actionIconStyle: React.CSSProperties = {
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingRight: '8px',
  };

  if (link.isCopyable) {
    return (
      <button
        type="button"
        onClick={() => onCopy(link.url, link.id)}
        style={{ ...baseStyle, border: isCopied ? `1px solid ${link.color}` : baseStyle.border }}
      >
        <div style={contentStyle}>
          <div style={iconWrapperStyle}>{link.icon}</div>
          <div style={textWrapperStyle}>
            <span style={titleStyle}>{link.title}</span>
            {link.subtitle && <span style={subtitleStyle}>{link.subtitle}</span>}
          </div>
        </div>
        <div style={{ ...actionIconStyle, color: isCopied ? link.color : '#94a3b8' }}>
          {isCopied ? <Check size={20} /> : <Copy size={20} />}
        </div>
      </button>
    );
  }

  return (
    <a href={link.url} target={link.url.startsWith('tel:') || link.url.startsWith('mailto:') ? '_self' : '_blank'} rel="noopener noreferrer" style={baseStyle}>
      <div style={contentStyle}>
        <div style={iconWrapperStyle}>{link.icon}</div>
        <div style={textWrapperStyle}>
          <span style={titleStyle}>{link.title}</span>
          {link.subtitle && <span style={subtitleStyle}>{link.subtitle}</span>}
        </div>
      </div>
      <div style={actionIconStyle}>
        <ChevronLeft size={20} />
      </div>
    </a>
  );
};

// ─── CARD IDENTITY ─────────────────────────────────────────────────
const CardIdentity: React.FC<{
  logoUrl?: string;
  bizName: string;
  description?: string;
  cardType: string;
}> = ({ logoUrl, bizName, description, cardType }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '32px' }}>
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={bizName}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              objectFit: 'cover',
              border: '4px solid #ffffff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              backgroundColor: '#ffffff',
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.25rem',
              fontWeight: 800,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '4px solid #ffffff',
            }}
          >
            {getInitials(bizName)}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            padding: '2px',
          }}
        >
          <ShieldCheck size={24} style={{ color: '#0f172a', fill: '#0f172a' }} />
        </div>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
        {bizName}
      </h1>

      {description && (
        <p style={{ fontSize: '0.9375rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5, maxWidth: '90%' }}>
          {description}
        </p>
      )}

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: '#f1f5f9',
          color: '#334155',
          fontSize: '0.8125rem',
          fontWeight: 700,
        }}
      >
        <Compass size={16} />
        <span>{cardType}</span>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export const PublicCardView: React.FC<PublicCardViewProps> = ({ card }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bizData = card.business_data;
  // Use exact backend field name: business_name
  const bizName = bizData?.business_name || card.business_name || card.card_code;
  const description = bizData?.description;
  // Use exact backend field name: logo
  const logoUrl = bizData?.logo;
  const cardType = card.card_type || 'Social Page';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Build Dynamic Links list — ONLY render fields that actually exist in business_data
  const links: CardLinkItem[] = [];

  // 1. WhatsApp (field: whatsapp)
  if (bizData?.whatsapp && bizData.whatsapp.trim().length > 0) {
    const cleanNum = bizData.whatsapp.replace(/[^0-9]/g, '');
    links.push({
      id: 'whatsapp',
      title: 'واتساب',
      subtitle: bizData.whatsapp,
      url: bizData.whatsapp.startsWith('http') ? bizData.whatsapp : `https://wa.me/${cleanNum}`,
      icon: <MessageCircle size={24} />,
      color: '#22c55e',
    });
  }

  // 2. Phone (field: phone)
  if (bizData?.phone && bizData.phone.trim().length > 0) {
    links.push({
      id: 'phone',
      title: 'رقم الهاتف',
      subtitle: bizData.phone,
      url: `tel:${bizData.phone.trim()}`,
      icon: <Phone size={24} />,
      color: '#0ea5e9',
    });
  }

  // 3. Instagram (field: instagram)
  if (bizData?.instagram && bizData.instagram.trim().length > 0) {
    links.push({
      id: 'instagram',
      title: 'إنستجرام',
      subtitle: 'Instagram',
      url: bizData.instagram.trim(),
      icon: <Instagram size={24} />,
      color: '#e1306c',
    });
  }

  // 4. Facebook (field: facebook)
  if (bizData?.facebook && bizData.facebook.trim().length > 0) {
    links.push({
      id: 'facebook',
      title: 'فيسبوك',
      subtitle: 'Facebook',
      url: bizData.facebook.trim(),
      icon: <Facebook size={24} />,
      color: '#1877f2',
    });
  }

  // 5. TikTok (field: tiktok)
  if (bizData?.tiktok && bizData.tiktok.trim().length > 0) {
    links.push({
      id: 'tiktok',
      title: 'تيك توك',
      subtitle: 'TikTok',
      url: bizData.tiktok.trim(),
      icon: <Video size={24} />,
      color: '#000000',
    });
  }

  // 6. Google Maps (field: google_maps)
  if (bizData?.google_maps && bizData.google_maps.trim().length > 0) {
    links.push({
      id: 'google_maps',
      title: 'الموقع على الخريطة',
      subtitle: 'Google Maps',
      url: bizData.google_maps.trim(),
      icon: <Compass size={24} />,
      color: '#ea4335',
    });
  }

  // 7. Website (field: website)
  if (bizData?.website && bizData.website.trim().length > 0) {
    links.push({
      id: 'website',
      title: 'الموقع الإلكتروني',
      subtitle: bizData.website.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      url: bizData.website.trim(),
      icon: <Globe size={24} />,
      color: '#64748b',
    });
  }

  // 8. Email (field: email)
  if (bizData?.email && bizData.email.trim().length > 0) {
    links.push({
      id: 'email',
      title: 'البريد الإلكتروني',
      subtitle: bizData.email,
      url: `mailto:${bizData.email.trim()}`,
      icon: <Globe size={24} />,
      color: '#8b5cf6',
    });
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #e2e8f0 0%, #fafafa 60%)',
        color: '#0f172a',
        fontFamily: 'Cairo, system-ui, -apple-system, sans-serif',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column' }}>
        
        <CardIdentity 
          logoUrl={logoUrl} 
          bizName={bizName} 
          description={description} 
          cardType={cardType} 
        />

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
          {links.length > 0 ? (
            <>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', margin: '0 0 16px 0', padding: '0 8px' }}>
                اختار الخدمة اللي محتاجها
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {links.map((link) => (
                  <SmartLinkButton 
                    key={link.id} 
                    link={link} 
                    copiedId={copiedId} 
                    onCopy={copyToClipboard} 
                  />
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Globe size={40} style={{ color: '#cbd5e1' }} />
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#334155' }}>
                لا توجد روابط متاحة حالياً.
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                لم يتم ضبط أي روابط خارجية لهذا الكارت بعد.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{ marginTop: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span style={{ fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>NFC SMART CARD</span>
          </div>
          <div>Secured Digital Identity</div>
        </footer>
      </div>
    </div>
  );
};
