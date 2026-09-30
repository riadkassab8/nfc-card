import React, { useState } from 'react';
import { Business, EventType, CardProductType } from '../../types';
import { analyticsService } from '../../services';
import { useTranslation } from '../../i18n';
import { MessageCircle, Phone, MapPin, Star, Instagram, Globe, CreditCard, Copy, Check } from 'lucide-react';

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

    // 1. Google Review (If Google Review Card or available)
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

    // 2. WhatsApp Action
    if (business.whatsapp && business.whatsapp.trim().length > 0) {
      const formattedNum = business.whatsapp.replace(/[^0-9]/g, '');
      actions.push({
        id: 'whatsapp',
        eventType: 'WHATSAPP_CLICK',
        label: t('public.chatWhatsapp'),
        url: `https://wa.me/${formattedNum}?text=${encodeURIComponent('Hello! I scanned your card.')}`,
        icon: <MessageCircle size={20} />,
        variant: cardType === 'WHATSAPP' ? 'primary' : 'secondary',
      });
    }

    // 3. Instagram Action
    if (business.instagram_url && business.instagram_url.trim().length > 0) {
      actions.push({
        id: 'instagram',
        eventType: 'INSTAGRAM_CLICK',
        label: t('public.instagram'),
        url: business.instagram_url,
        icon: <Instagram size={20} />,
        variant: cardType === 'INSTAGRAM' ? 'primary' : 'secondary',
      });
    }

    // 4. Phone Call Action
    if (business.phone && business.phone.trim().length > 0) {
      actions.push({
        id: 'phone',
        eventType: 'PHONE_CLICK',
        label: t('public.callNow'),
        url: `tel:${business.phone}`,
        icon: <Phone size={20} />,
        variant: 'secondary',
      });
    }

    // 5. Location / Google Maps Action
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
        icon: <MapPin size={20} />,
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
        icon: <Globe size={20} />,
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
            backgroundColor: '#18181b',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            border: '2px solid #f59e0b',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)',
          }}
        >
          <div style={{ fontSize: '24px' }}>⭐️⭐️⭐️⭐️⭐️</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
            تقييمك يهمنا جداً!
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>
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
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            border: '2px solid #10b981',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
          }}
        >
          <CreditCard size={32} style={{ color: '#34d399' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
            الدفع والسداد الفوري عبر InstaPay
          </h3>
          <span style={{ fontFamily: 'monospace', fontSize: '1rem', backgroundColor: '#022c22', padding: '4px 12px', borderRadius: 'var(--radius-md)', color: '#6ee7b7' }}>
            {business.instapay_url || `${business.name.toLowerCase().replace(/\s+/g, '')}@instapay`}
          </span>
          <button
            type="button"
            onClick={() => copyInstaPay(business.instapay_url || `${business.name.toLowerCase().replace(/\s+/g, '')}@instapay`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-xs) var(--space-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            {copiedInsta ? <Check size={16} /> : <Copy size={16} />}
            {copiedInsta ? 'تم نسخ العنوان!' : 'نسخ عنوان InstaPay'}
          </button>
        </div>
      )}

      {/* Action Buttons List */}
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
              gap: 'var(--space-md)',
              minHeight: '54px',
              padding: 'var(--space-md) var(--space-xl)',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: isPrimary ? 'var(--primary-bg)' : 'var(--bg-surface)',
              color: isPrimary ? 'var(--text-on-primary)' : 'var(--text-primary)',
              border: isPrimary ? '1px solid var(--primary-bg)' : '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-subtle)',
              textDecoration: 'none',
              transition: 'all 150ms ease-out',
              cursor: 'pointer',
              userSelect: 'none',
              width: '100%',
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
