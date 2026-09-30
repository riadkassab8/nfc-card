import React, { useState } from 'react';
import { Business, EventType, CardProductType } from '../../types';
import { analyticsService } from '../../services';
import { useTranslation } from '../../i18n';
import { MessageCircle, Phone, MapPin, Star, Instagram, Globe, CreditCard, Copy, Check, Facebook, Video } from 'lucide-react';

export interface PublicBusinessActionsProps {
  business: Business;
  qrId: string;
  cardType?: CardProductType;
}

interface ActionConfig {
  id: string;
  eventType: EventType;
  label: string;
  url: string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary';
}

export const PublicBusinessActions: React.FC<PublicBusinessActionsProps> = ({ business, qrId, cardType = 'UNIFIED_SOCIAL' }) => {
  const { t } = useTranslation();
  const [copiedInsta, setCopiedInsta] = useState(false);

  const handleActionClick = (eventType: EventType) => {
    analyticsService.logEvent(qrId, eventType).catch(() => {});
  };

  const copyInstaPay = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInsta(true);
    setTimeout(() => setCopiedInsta(false), 2000);
  };

  const getActions = (): ActionConfig[] => {
    const actions: ActionConfig[] = [];

    // 1. Google Review Action
    if (business.google_review_url && business.google_review_url.trim().length > 0) {
      actions.push({
        id: 'google_review',
        eventType: 'GOOGLE_REVIEW_CLICK',
        label: t('public.leaveReview'),
        url: business.google_review_url,
        icon: <Star size={20} style={{ color: '#f59e0b' }} />,
        variant: cardType === 'GOOGLE_REVIEW' ? 'primary' : 'secondary',
      });
    }

    // 2. Facebook Action
    if (business.facebook_url && business.facebook_url.trim().length > 0) {
      actions.push({
        id: 'facebook',
        eventType: 'CUSTOM_LINK_CLICK',
        label: 'صفحة فيسبوك (Facebook)',
        url: business.facebook_url,
        icon: <Facebook size={20} style={{ color: '#1877f2' }} />,
        variant: 'secondary',
      });
    }

    // 3. Instagram Action
    if (business.instagram_url && business.instagram_url.trim().length > 0) {
      actions.push({
        id: 'instagram',
        eventType: 'INSTAGRAM_CLICK',
        label: t('public.instagram'),
        url: business.instagram_url,
        icon: <Instagram size={20} style={{ color: '#e1306c' }} />,
        variant: 'secondary',
      });
    }

    // 4. TikTok Action
    if (business.tiktok_url && business.tiktok_url.trim().length > 0) {
      actions.push({
        id: 'tiktok',
        eventType: 'CUSTOM_LINK_CLICK',
        label: 'حساب تيك توك (TikTok)',
        url: business.tiktok_url,
        icon: <Video size={20} style={{ color: '#000000' }} />,
        variant: 'secondary',
      });
    }

    // 5. WhatsApp Action
    if (business.whatsapp && business.whatsapp.trim().length > 0) {
      const formattedNum = business.whatsapp.replace(/[^0-9]/g, '');
      actions.push({
        id: 'whatsapp',
        eventType: 'WHATSAPP_CLICK',
        label: t('public.chatWhatsapp'),
        url: `https://wa.me/${formattedNum}?text=${encodeURIComponent('Hello! I scanned your card.')}`,
        icon: <MessageCircle size={20} style={{ color: '#25d366' }} />,
        variant: 'secondary',
      });
    }

    // 6. Website Action
    if (business.website_url && business.website_url.trim().length > 0) {
      actions.push({
        id: 'website',
        eventType: 'WEBSITE_CLICK',
        label: t('public.visitWebsite'),
        url: business.website_url,
        icon: <Globe size={20} style={{ color: '#4f46e5' }} />,
        variant: 'secondary',
      });
    }

    // 7. Phone Call Action
    if (business.phone && business.phone.trim().length > 0) {
      actions.push({
        id: 'phone',
        eventType: 'PHONE_CLICK',
        label: t('public.callNow'),
        url: `tel:${business.phone}`,
        icon: <Phone size={20} style={{ color: '#0b9816' }} />,
        variant: 'secondary',
      });
    }

    // 8. Location Action
    if (
      (business.latitude && business.longitude) ||
      (business.address && business.address.trim().length > 0)
    ) {
      const mapsUrl =
        business.latitude && business.longitude
          ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address || '')}`;

      actions.push({
        id: 'location',
        eventType: 'LOCATION_CLICK',
        label: t('public.viewMap'),
        url: mapsUrl,
        icon: <MapPin size={20} style={{ color: '#ef4444' }} />,
        variant: 'secondary',
      });
    }

    return actions;
  };

  const activeActions = getActions();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%' }}>
      {/* 🌟 Special Google Review Card Banner */}
      {cardType === 'GOOGLE_REVIEW' && (
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid #f59e0b',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)',
          }}
        >
          <div style={{ fontSize: '28px' }}>⭐️⭐️⭐️⭐️⭐️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            تقييمك يهمنا جداً!
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            اضغط أدناه لترك تقييمك المباشر على Google Maps في ثوانٍ.
          </p>
        </div>
      )}

      {/* 💳 Special InstaPay Card Banner */}
      {cardType === 'INSTAPAY' && (
        <div
          style={{
            backgroundColor: '#064e3b',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid #10b981',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
          }}
        >
          <CreditCard size={36} style={{ color: '#34d399' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            الدفع والسداد الفوري عبر InstaPay
          </h3>
          <span style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 700, backgroundColor: '#022c22', padding: '6px 16px', borderRadius: '12px', color: '#6ee7b7' }}>
            {business.instapay_url || `${business.name.toLowerCase().replace(/\s+/g, '')}@instapay`}
          </span>
          <button
            type="button"
            onClick={() => copyInstaPay(business.instapay_url || `${business.name.toLowerCase().replace(/\s+/g, '')}@instapay`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 18px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            {copiedInsta ? <Check size={16} /> : <Copy size={16} />}
            {copiedInsta ? 'تم نسخ العنوان!' : 'نسخ عنوان InstaPay'}
          </button>
        </div>
      )}

      {/* Action Buttons List (ONLY filled non-empty links are rendered!) */}
      {activeActions.map((action) => {
        const isPrimary = action.variant === 'primary';
        return (
          <a
            key={action.id}
            href={action.url}
            target={action.url.startsWith('tel:') ? undefined : '_blank'}
            rel={action.url.startsWith('tel:') ? undefined : 'noopener noreferrer'}
            onClick={() => handleActionClick(action.eventType)}
            aria-label={action.label}
            className="text-body-medium"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              minHeight: '52px',
              padding: '12px 20px',
              borderRadius: '14px',
              backgroundColor: isPrimary ? '#0f172a' : '#ffffff',
              color: isPrimary ? '#ffffff' : '#0f172a',
              border: isPrimary ? '1px solid #0f172a' : '1px solid #cbd5e1',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              textDecoration: 'none',
              transition: 'all 150ms ease-out',
              cursor: 'pointer',
              userSelect: 'none',
              width: '100%',
              fontWeight: 700,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{action.icon}</span>
            <span>{action.label}</span>
          </a>
        );
      })}
    </div>
  );
};
