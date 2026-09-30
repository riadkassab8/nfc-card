import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cardService, analyticsService, PublicResolutionResult } from '../services';
import { PublicBusinessHeader } from '../components/public/PublicBusinessHeader';
import { PublicBusinessActions } from '../components/public/PublicBusinessActions';
import { PublicBusinessState, PageStateType } from '../components/public/PublicBusinessState';
import { LanguageSwitcher } from '../components/ui';
import { useTranslation } from '../i18n';

export const PublicBusinessPage: React.FC = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resolution, setResolution] = useState<PublicResolutionResult | null>(null);
  const [pageState, setPageState] = useState<PageStateType>('loading');

  useEffect(() => {
    let isMounted = true;

    const resolveCode = async () => {
      if (!publicCode || publicCode.trim().length === 0) {
        if (isMounted) {
          setPageState('not_found');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const cardResult = await cardService.resolvePublicCode(publicCode);

        if (!isMounted) return;

        if (!cardResult || !cardResult.card) {
          setPageState('not_found');
          setIsLoading(false);
          return;
        }

        // Check if card is unassigned / UNUSED
        if (cardResult.card.usage_status === 'UNUSED' || !cardResult.business) {
          setPageState('disabled');
          setIsLoading(false);
          return;
        }

        // Check if business status is disabled
        if (cardResult.business.status === 'DISABLED') {
          setPageState('disabled');
          setIsLoading(false);
          return;
        }

        // Log scan event asynchronously
        analyticsService.logEvent(cardResult.card.qr.id, 'SCAN').catch(() => {
          // Ignore client logging failure
        });

        setResolution({
          qr: {
            id: cardResult.card.qr.id,
            business_id: cardResult.business.id,
            public_code: cardResult.card.public_code,
            label: cardResult.card.card_code,
            status: 'ACTIVE',
            created_at: cardResult.card.created_at,
            updated_at: cardResult.card.created_at,
          },
          business: cardResult.business,
          cardType: cardResult.card.card_type,
        } as any);
        setPageState('loading');
      } catch (err) {
        if (isMounted) {
          setPageState('error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    resolveCode();

    return () => {
      isMounted = false;
    };
  }, [publicCode]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-2xl) var(--space-lg)',
        position: 'relative',
      }}
    >
      {/* Top Floating Language Switcher */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--space-lg)',
          insetInlineEnd: 'var(--space-lg)',
        }}
      >
        <LanguageSwitcher variant="ghost" size="sm" />
      </div>

      <main
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          marginTop: 'var(--space-xl)',
        }}
      >
        {isLoading ? (
          <PublicBusinessState state="loading" />
        ) : pageState !== 'loading' ? (
          <PublicBusinessState state={pageState} />
        ) : resolution ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              animation: 'fadeIn 200ms ease-out',
            }}
          >
            <PublicBusinessHeader business={resolution.business} />
            <PublicBusinessActions business={resolution.business} qrId={resolution.qr.id} cardType={(resolution as any).cardType} />
          </div>
        ) : (
          <PublicBusinessState state="error" />
        )}
      </main>

      {/* Footer Branding Attribution */}
      <footer
        className="text-caption"
        style={{
          textAlign: 'center',
          marginTop: 'var(--space-4xl)',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-caption)',
        }}
      >
        {t('public.poweredBy')} <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>DynamicQR</strong>
      </footer>
    </div>
  );
};
