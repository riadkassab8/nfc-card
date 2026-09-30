import React from 'react';
import { Skeleton, Card } from '../ui';
import { AlertCircle, QrCode } from 'lucide-react';
import { useTranslation } from '../../i18n';

export type PageStateType = 'loading' | 'disabled' | 'not_found' | 'error';

export interface PublicBusinessStateProps {
  state: PageStateType;
  customMessage?: string;
}

export const PublicBusinessState: React.FC<PublicBusinessStateProps> = ({ state, customMessage }) => {
  const { t } = useTranslation();

  if (state === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2xl)',
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: 'var(--space-2xl) var(--space-lg)',
        }}
        aria-busy="true"
        aria-label={t('common.loading')}
      >
        {/* Header Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)', width: '100%' }}>
          <Skeleton width="84px" height="84px" borderRadius="var(--radius-xl)" />
          <Skeleton width="60%" height="28px" borderRadius="var(--radius-sm)" />
          <Skeleton width="80%" height="18px" borderRadius="var(--radius-sm)" />
          <Skeleton width="40%" height="14px" borderRadius="var(--radius-sm)" />
        </div>

        {/* Action Buttons Skeletons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%' }}>
          <Skeleton width="100%" height="54px" borderRadius="var(--radius-xl)" />
          <Skeleton width="100%" height="54px" borderRadius="var(--radius-xl)" />
          <Skeleton width="100%" height="54px" borderRadius="var(--radius-xl)" />
          <Skeleton width="100%" height="54px" borderRadius="var(--radius-xl)" />
        </div>
      </div>
    );
  }

  if (state === 'disabled') {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: 'var(--space-4xl) var(--space-lg)',
        }}
      >
        <Card padding="lg" style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--warning-bg)',
                color: 'var(--warning-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={28} />
            </div>

            <h2 className="text-section" style={{ color: 'var(--text-primary)' }}>
              {t('public.qrDisabledTitle')}
            </h2>

            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {customMessage || t('public.qrDisabledDesc')}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (state === 'not_found') {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: 'var(--space-4xl) var(--space-lg)',
        }}
      >
        <Card padding="lg" style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={28} />
            </div>

            <h2 className="text-section" style={{ color: 'var(--text-primary)' }}>
              {t('public.qrNotFoundTitle')}
            </h2>

            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {customMessage || t('public.qrNotFoundDesc')}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback Error State
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: 'var(--space-4xl) var(--space-lg)',
      }}
    >
      <Card padding="lg" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}
        >
          <AlertCircle size={32} style={{ color: 'var(--error-text)' }} />
          <h2 className="text-section" style={{ color: 'var(--text-primary)' }}>
            {t('public.errorTitle')}
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {customMessage || t('public.errorDesc')}
          </p>
        </div>
      </Card>
    </div>
  );
};
