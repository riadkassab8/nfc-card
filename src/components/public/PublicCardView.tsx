import React, { useState } from 'react';
import { CardItem } from '../../types';
import {
  Star,
  MessageCircle,
  Phone,
  Globe,
  CreditCard,
  Check,
  Copy,
  Instagram,
  Facebook,
  Video,
  ExternalLink,
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

export const PublicCardView: React.FC<PublicCardViewProps> = ({ card }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bizData = card.business_data;
  const bizName = bizData?.name || card.business_name || card.card_code;
  const description = bizData?.description;
  const logoUrl = bizData?.logo_url;
  const cardType = card.card_type || 'Google Review';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Build Dynamic Links list strictly backed by real card data
  const links: CardLinkItem[] = [];

  // 1. Google Review Link
  const reviewUrl = bizData?.google_review_url || (cardType === 'Google Review' && card.public_url ? card.public_url : undefined);
  if (reviewUrl && reviewUrl.trim().length > 0) {
    links.push({
      id: 'google_review',
      title: 'تقييمنا على Google Reviews',
      subtitle: 'إضافة تقييم ونجوم على خرائط جوجل',
      url: reviewUrl,
      icon: <Star size={20} style={{ color: '#f59e0b', fill: '#f59e0b' }} />,
      color: '#065f46',
    });
  }

  // 2. InstaPay Payment Link/Handle
  const instaPayVal = bizData?.instapay_url || (cardType === 'InstaPay' && card.public_url ? card.public_url : undefined);
  if (instaPayVal && instaPayVal.trim().length > 0) {
    links.push({
      id: 'instapay',
      title: 'الدفع والتحويل عبر InstaPay',
      subtitle: instaPayVal,
      url: instaPayVal,
      icon: <CreditCard size={20} style={{ color: '#047857' }} />,
      color: '#047857',
      isCopyable: true,
    });
  }

  // 3. Phone Call
  if (bizData?.phone && bizData.phone.trim().length > 0) {
    links.push({
      id: 'phone',
      title: 'الاتصال الهاتفي المباشر',
      subtitle: bizData.phone,
      url: `tel:${bizData.phone.trim()}`,
      icon: <Phone size={20} style={{ color: '#0284c7' }} />,
      color: '#0284c7',
    });
  }

  // 4. WhatsApp Chat
  if (bizData?.whatsapp && bizData.whatsapp.trim().length > 0) {
    const cleanNum = bizData.whatsapp.replace(/[^0-9]/g, '');
    links.push({
      id: 'whatsapp',
      title: 'التواصل عبر واتساب (WhatsApp)',
      subtitle: bizData.whatsapp,
      url: `https://wa.me/${cleanNum}`,
      icon: <MessageCircle size={20} style={{ color: '#16a34a' }} />,
      color: '#16a34a',
    });
  }

  // 5. Instagram
  if (bizData?.instagram_url && bizData.instagram_url.trim().length > 0) {
    links.push({
      id: 'instagram',
      title: 'صفحة إنستجرام (Instagram)',
      url: bizData.instagram_url.trim(),
      icon: <Instagram size={20} style={{ color: '#e1306c' }} />,
      color: '#e1306c',
    });
  }

  // 6. Facebook
  if (bizData?.facebook_url && bizData.facebook_url.trim().length > 0) {
    links.push({
      id: 'facebook',
      title: 'صفحة فيسبوك (Facebook)',
      url: bizData.facebook_url.trim(),
      icon: <Facebook size={20} style={{ color: '#1877f2' }} />,
      color: '#1877f2',
    });
  }

  // 7. TikTok
  if (bizData?.tiktok_url && bizData.tiktok_url.trim().length > 0) {
    links.push({
      id: 'tiktok',
      title: 'حساب تيك توك (TikTok)',
      url: bizData.tiktok_url.trim(),
      icon: <Video size={20} style={{ color: '#0f172a' }} />,
      color: '#0f172a',
    });
  }

  // 8. Website or Primary Target Link
  const webUrl = bizData?.website_url || (card.public_url && !reviewUrl && !instaPayVal ? card.public_url : undefined);
  if (webUrl && webUrl.trim().length > 0 && !links.some((l) => l.url === webUrl)) {
    links.push({
      id: 'website',
      title: 'الموقع الإلكتروني الرسمي / الخدمة',
      url: webUrl.trim(),
      icon: <Globe size={20} style={{ color: '#047857' }} />,
      color: '#047857',
    });
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'Cairo, system-ui, -apple-system, sans-serif',
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Identity Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Logo or Initials */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={bizName}
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '3px solid #065f46',
                  boxShadow: '0 8px 24px rgba(6, 95, 70, 0.15)',
                  backgroundColor: '#ffffff',
                }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '24px',
                  backgroundColor: '#065f46',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(6, 95, 70, 0.2)',
                }}
              >
                {getInitials(bizName)}
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                padding: '2px',
              }}
            >
              <ShieldCheck size={20} style={{ color: '#065f46', fill: '#065f46' }} />
            </div>
          </div>

          {/* Business Name */}
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {bizName}
          </h1>

          {/* Business Description */}
          {description && (
            <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '8px', lineHeight: 1.5, maxWidth: '360px' }}>
              {description}
            </p>
          )}

          {/* Category Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginTop: '12px',
            }}
          >
            <Compass size={14} />
            <span>{cardType}</span>
          </div>
        </div>

        {/* Action List Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {links.length > 0 ? (
            <>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', textAlign: 'center', marginBottom: '2px' }}>
                اختر الخدمة أو الرابط المطلوبة
              </div>

              {links.map((link) => (
                <div key={link.id} style={{ width: '100%' }}>
                  {link.isCopyable ? (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(link.url, link.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #065f46',
                        color: '#0f172a',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(6, 95, 70, 0.08)',
                        textAlign: 'start',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            padding: '10px',
                            borderRadius: '12px',
                            backgroundColor: '#ecfdf5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {link.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>{link.title}</div>
                          {link.subtitle && (
                            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                              {link.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700, fontSize: '0.8125rem' }}>
                        {copiedId === link.id ? <Check size={18} /> : <Copy size={18} />}
                        <span>{copiedId === link.id ? 'تم النسخ!' : 'نسخ'}</span>
                      </div>
                    </button>
                  ) : (
                    <a
                      href={link.url}
                      target={link.url.startsWith('tel:') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        backgroundColor: link.id === 'google_review' ? '#065f46' : '#ffffff',
                        border: link.id === 'google_review' ? 'none' : '1px solid #e2e8f0',
                        color: link.id === 'google_review' ? '#ffffff' : '#0f172a',
                        textDecoration: 'none',
                        boxShadow: link.id === 'google_review' ? '0 6px 20px rgba(6, 95, 70, 0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'transform 150ms ease, boxShadow 150ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            padding: '10px',
                            borderRadius: '12px',
                            backgroundColor: link.id === 'google_review' ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {link.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{link.title}</div>
                          {link.subtitle && (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: link.id === 'google_review' ? '#a7f3d0' : '#64748b',
                                marginTop: '2px',
                              }}
                            >
                              {link.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <ExternalLink size={18} style={{ opacity: 0.7 }} />
                    </a>
                  )}
                </div>
              ))}
            </>
          ) : (
            /* Empty Links State */
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '32px 20px',
                textAlign: 'center',
                color: '#64748b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Globe size={32} style={{ color: '#cbd5e1' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#334155' }}>
                لا توجد روابط متاحة حالياً.
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
                لم يتم ضبط أي روابط خارجية لهذا الكارت بعد.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontWeight: 800, color: '#065f46' }}>NFC CARD</span>
          <span>• Smart Touch & Scan</span>
        </div>
        <div>Public Card Landing Page</div>
      </footer>
    </div>
  );
};
