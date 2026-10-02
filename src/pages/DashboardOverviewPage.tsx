import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { Card, Button, Badge, Skeleton, ErrorState } from '../components/ui';
import { businessService, qrService, analyticsService } from '../services';
import { Business, QRCode, AnalyticsSummary } from '../types';
import { useTranslation } from '../i18n';
import { QrCode, MessageCircle, Phone, Eye } from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState<boolean>(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const biz = await businessService.getCurrentBusiness();
        if (!biz) throw new Error('Business details not found');

        const qrs = await qrService.getQRCodesByBusinessId(biz.id);
        const stats = await analyticsService.getAnalyticsSummary(biz.id, '7d');

        if (isMounted) {
          setBusiness(biz);
          setQrCodes(qrs);
          setAnalytics(stats);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard overview');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeQRCount = qrCodes.filter((q) => q.status === 'ACTIVE').length;

  return (
    <DashboardShell title={t('dashboard.overview.title')}>
      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
          {/* Top Quick Status Card */}
          <Card padding="lg">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-md)',
              }}
            >
              <div>
                <span className="text-caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('common.businessDashboard')}
                </span>
                <h2 className="text-title" style={{ marginTop: 'var(--space-xs)' }}>
                  {loading ? <Skeleton width="200px" height="28px" /> : business?.name}
                </h2>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  {business?.address || t('dashboard.overview.subtitle')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <Link to="/dashboard/business">
                  <Button variant="secondary" size="sm">
                    {t('dashboard.overview.editProfile')}
                  </Button>
                </Link>
                <Link to="/dashboard/qr-codes">
                  <Button variant="primary" size="sm">
                    <QrCode size={16} /> {t('dashboard.overview.viewQRCodes')}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Metrics Summary Grid (3 Stat Cards) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-xl)',
            }}
          >
            {/* Stat Card 1: Total Scans */}
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
                  {t('dashboard.overview.totalScans')}
                </span>
                {loading ? (
                  <Skeleton width="100px" height="36px" />
                ) : (
                  <span className="text-display" style={{ fontSize: '2.25rem' }}>
                    {analytics?.total_scans.toLocaleString() || 0}
                  </span>
                )}
                <span className="text-caption" style={{ color: 'var(--success-text)' }}>
                  {t('dashboard.overview.scanTrend')}
                </span>
              </div>
            </Card>

            {/* Stat Card 2: Active QR Codes */}
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
                  {t('dashboard.overview.activeQRs')}
                </span>
                {loading ? (
                  <Skeleton width="60px" height="36px" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
                    <span className="text-display" style={{ fontSize: '2.25rem' }}>
                      {activeQRCount}
                    </span>
                    <Badge variant="active">{qrCodes.length} {t('common.all')}</Badge>
                  </div>
                )}
                <span className="text-caption">{t('dashboard.overview.subtitle')}</span>
              </div>
            </Card>

            {/* Stat Card 3: Action Clicks */}
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
                  {t('dashboard.analytics.topChannel')}
                </span>
                {loading ? (
                  <Skeleton width="100px" height="36px" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
                    <span className="text-display" style={{ fontSize: '2.25rem' }}>
                      {analytics?.total_clicks.toLocaleString() || 0}
                    </span>
                    <span className="text-caption" style={{ fontWeight: 600 }}>
                      ({analytics?.conversion_rate || 0}% CTR)
                    </span>
                  </div>
                )}
                <span className="text-caption">{t('public.chatWhatsapp')}, {t('public.callNow')}</span>
              </div>
            </Card>
          </div>

          {/* Recent Activity Stream */}
          <Card padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-section">{t('dashboard.overview.recentScans')}</h3>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <Skeleton height="40px" />
                  <Skeleton height="40px" />
                  <Skeleton height="40px" />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-md)',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <MessageCircle size={18} style={{ color: 'var(--success-text)' }} />
                      <div>
                        <p className="text-body-medium">{t('public.chatWhatsapp')}</p>
                        <span className="text-caption">Main Counter Display QR</span>
                      </div>
                    </div>
                    <span className="text-caption">2 mins ago</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-md)',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <Phone size={18} style={{ color: 'var(--text-primary)' }} />
                      <div>
                        <p className="text-body-medium">{t('public.callNow')}</p>
                        <span className="text-caption">Table 4 Acrylic Stand</span>
                      </div>
                    </div>
                    <span className="text-caption">14 mins ago</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-md)',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <Eye size={18} style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <p className="text-body-medium">{t('dashboard.overview.totalScans')}</p>
                        <span className="text-caption">Main Counter Display QR</span>
                      </div>
                    </div>
                    <span className="text-caption">1 hour ago</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
};
