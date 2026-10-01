import React, { useEffect, useState } from 'react';
import { Card, Button, Skeleton, EmptyState, ErrorState } from '../components/ui';
import { analyticsService, businessService } from '../services';
import { AnalyticsSummary } from '../types';
import { BarChart3, TrendingUp, MousePointerClick, Smartphone } from 'lucide-react';
import { useTranslation } from '../i18n';

export const AnalyticsPage: React.FC = () => {
  const { t, formatNumber, isRtl } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [range, setRange] = useState<string>('7d');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const biz = await businessService.getCurrentBusiness();
        if (!biz) throw new Error('Business identity not found');
        const stats = await analyticsService.getAnalyticsSummary(biz.id, range);
        if (isMounted) {
          setAnalytics(stats);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load analytics');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [range]);

  const maxScanValue = analytics?.trend
    ? Math.max(...analytics.trend.map((t) => t.scans), 1)
    : 1;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
        {/* Header Action Bar with Time Range Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="text-title">{t('dashboard.analytics.title')}</h2>
              <span style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                BACKEND GAP — Analytics API not available
              </span>
            </div>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {t('dashboard.analytics.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-xs)', backgroundColor: 'var(--bg-surface-hover)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            {(['today', '7d', '30d', 'all'] as const).map((r) => (
              <Button
                key={r}
                variant={range === r ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRange(r)}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
              </Button>
            ))}
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : loading ? (
          <Card padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <Skeleton height="100px" />
              <Skeleton height="200px" />
            </div>
          </Card>
        ) : !analytics || analytics.total_scans === 0 ? (
          <EmptyState
            icon={<BarChart3 size={48} />}
            title={t('common.noData')}
            description={t('dashboard.analytics.subtitle')}
          />
        ) : (
          <>
            {/* Top 3 Metric Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-xl)',
              }}
            >
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
                    <Smartphone size={24} style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.analytics.totalScans')}</span>
                    <h3 className="text-title" style={{ fontSize: '1.75rem' }}>{formatNumber(analytics.total_scans)}</h3>
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
                    <MousePointerClick size={24} style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.overview.recentScans')}</span>
                    <h3 className="text-title" style={{ fontSize: '1.75rem' }}>{formatNumber(analytics.total_clicks)}</h3>
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
                    <TrendingUp size={24} style={{ color: 'var(--success-text)' }} />
                  </div>
                  <div>
                    <span className="text-label" style={{ color: 'var(--text-secondary)' }}>Conversion</span>
                    <h3 className="text-title" style={{ fontSize: '1.75rem' }}>{analytics.conversion_rate}%</h3>
                  </div>
                </div>
              </Card>
            </div>

            {/* Scans Over Time Bar Visualization */}
            <Card padding="lg">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                <h3 className="text-section">{t('dashboard.analytics.scansOverTime')}</h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 'var(--space-md)',
                    height: '180px',
                    paddingTop: 'var(--space-lg)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {analytics.trend.map((item) => {
                    const heightPercent = Math.max(Math.round((item.scans / maxScanValue) * 100), 8);
                    return (
                      <div
                        key={item.date}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 'var(--space-xs)',
                          height: '100%',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <span className="text-caption" style={{ fontWeight: 600 }}>
                          {formatNumber(item.scans)}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '40px',
                            height: `${heightPercent}%`,
                            backgroundColor: 'var(--primary-bg)',
                            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                            transition: 'height 300ms ease-out',
                          }}
                          title={`${item.date}: ${item.scans} scans`}
                        />
                        <span className="text-caption" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                          {item.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Action Breakdown Section */}
            <Card padding="lg">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <h3 className="text-section">Action Conversions</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {Object.entries(analytics.breakdown).map(([actionKey, count]) => {
                    if (count === 0) return null;
                    const label = actionKey.replace('_CLICK', '').replace('_', ' ');
                    const percent = Math.round((count / (analytics.total_clicks || 1)) * 100);

                    return (
                      <div key={actionKey} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-body-medium">{label}</span>
                          <span className="text-caption">{formatNumber(count)} clicks ({percent}%)</span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'var(--bg-surface-hover)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              backgroundColor: 'var(--primary-bg)',
                              borderRadius: 'var(--radius-full)',
                              transition: 'width 300ms ease-out',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* QR Placement Performance Table */}
            <Card padding="lg">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <h3 className="text-section">{t('dashboard.qrCodes.placement')}</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <th className="text-label" style={{ padding: 'var(--space-sm) 0' }}>{t('dashboard.qrCodes.placement')}</th>
                        <th className="text-label" style={{ padding: 'var(--space-sm) 0', textAlign: isRtl ? 'left' : 'right' }}>{t('dashboard.qrCodes.scansCount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.qr_performance.map((item) => (
                        <tr key={item.qr_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: 'var(--space-md) 0' }} className="text-body-medium">
                            {item.label}
                          </td>
                          <td style={{ padding: 'var(--space-md) 0', textAlign: isRtl ? 'left' : 'right' }} className="text-body">
                            {formatNumber(item.scans)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
};
