import React from 'react';
import { Business, EventType } from '../../types';
import { analyticsService } from '../../services';
import { useTranslation } from '../../i18n';
import { MessageCircle, Phone, MapPin, Star, Instagram, Globe } from 'lucide-react';

export interface PublicBusinessActionsProps {
  business: Business;
  qrId: string;
}

interface ActionConfig {
  id: string;
  eventType: EventType;
  label: string;
  url: string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary';
}

export const PublicBusinessActions: React.FC<PublicBusinessActionsProps> = ({ business, qrId }) => {
  const { t } = useTranslation();

  const handleActionClick = (eventType: EventType) => {
    // Non-blocking ping to analytics service abstraction
    analyticsService.logEvent(qrId, eventType).catch(() => {
      // Ignore analytics logging failures on client
    });
  };

  const getActions = (): ActionConfig[] => {
    const actions: ActionConfig[] = [];

    // 1. WhatsApp Action
    if (business.whatsapp && business.whatsapp.trim().length > 0) {
      const formattedNum = business.whatsapp.replace(/[^0-9]/g, '');
      actions.push({
        id: 'whatsapp',
        eventType: 'WHATSAPP_CLICK',
        label: t('public.chatWhatsapp'),
        url: `https://wa.me/${formattedNum}?text=${encodeURIComponent('Hello! I scanned your QR code.')}`,
        icon: <MessageCircle size={20} />,
        variant: 'primary',
      });
    }

    // 2. Phone Call Action
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

    // 3. Location / Google Maps Action
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

    // 4. Google Review Action
    if (business.google_review_url && business.google_review_url.trim().length > 0) {
      actions.push({
        id: 'google_review',
        eventType: 'GOOGLE_REVIEW_CLICK',
        label: t('public.leaveReview'),
        url: business.google_review_url,
        icon: <Star size={20} />,
        variant: 'secondary',
      });
    }

    // 5. Instagram Action
    if (business.instagram_url && business.instagram_url.trim().length > 0) {
      actions.push({
        id: 'instagram',
        eventType: 'INSTAGRAM_CLICK',
        label: t('public.instagram'),
        url: business.instagram_url,
        icon: <Instagram size={20} />,
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

  if (activeActions.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-xl)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="text-body">No contact options configured for this business yet.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        width: '100%',
      }}
    >
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
