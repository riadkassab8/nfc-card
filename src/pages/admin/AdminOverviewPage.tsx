import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Skeleton, ErrorState } from '../../components/ui';
import { adminService } from '../../services';
import { AdminStats, Business, UnifiedAsset } from '../../types';
import { useTranslation } from '../../i18n';
import { Building2, QrCode, Scan, Plus, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([]);
  const [recentAssets, setRecentAssets] = useState<UnifiedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const adminStats = await adminService.getAdminStats();
        const businesses = await adminService.getAllTenantBusinesses();
        const assets = await adminService.getAllUnifiedAssets();

        if (isMounted) {
          setStats(adminStats);
          setRecentBusinesses(businesses.slice(0, 5));
          setRecentAssets(assets.slice(0, 5));
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load admin overview');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
      {/* Quick Operational Banner & Action CTAs */}
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
            <span className="text-caption" style={{ color: 'var(--error-text)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('common.adminDashboard')}
            </span>
            <h2 className="text-title" style={{ marginTop: 'var(--space-xs)' }}>
              {t('admin.overview.title')}
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {t('admin.overview.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <Link to="/admin/businesses">
              <Button variant="secondary" size="sm">
                <Plus size={16} /> {t('admin.overview.quickActions.addBusiness')}
              </Button>
            </Link>
            <Link to="/admin/qr-nfc">
              <Button variant="secondary" size="sm">
                <QrCode size={16} /> {t('admin.overview.quickActions.generateAssets')}
              </Button>
            </Link>
            <Link to="/admin/scan">
              <Button variant="primary" size="sm">
                <Scan size={16} /> {t('admin.overview.quickActions.scanAsset')}
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          {/* Top 4 Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-xl)',
            }}
          >
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
                  <Building2 size={24} style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('admin.overview.registeredBusinesses')}</span>
                  {loading ? (
                    <Skeleton width="60px" height="32px" />
                  ) : (
                    <h3 className="text-title" style={{ fontSize: '1.75rem' }}>{stats?.total_businesses || 0}</h3>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('admin.overview.activeBusinesses')}</span>
                  {loading ? (
                    <Skeleton width="60px" height="32px" />
                  ) : (
                    <h3 className="text-title" style={{ fontSize: '1.75rem' }}>{stats?.active_businesses || 0}</h3>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
                  <QrCode size={24} style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('admin.overview.totalAssets')}</span>
                  {loading ? (
                    <Skeleton width="60px" height="32px" />
                  ) : (
                    <h3 className="text-title" style={{ fontSize: '1.75rem' }}>{stats?.total_assets || 0}</h3>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
                  <Scan size={24} />
                </div>
                <div>
                  <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('admin.overview.unassignedAssets')}</span>
                  {loading ? (
                    <Skeleton width="60px" height="32px" />
                  ) : (
                    <h3 className="text-title" style={{ fontSize: '1.75rem' }}>{stats?.unassigned_assets || 0}</h3>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Content Split: Recent Businesses & Hardware Assets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-xl)' }}>
            {/* Registered Businesses List */}
            <Card padding="lg">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="text-section">{t('admin.overview.recentBusinesses')}</h3>
                  <Link to="/admin/businesses" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost" size="sm">
                      {t('admin.overview.viewAll')} <ArrowUpRight size={14} className="icon-flip-rtl" />
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <Skeleton height="120px" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {recentBusinesses.map((biz) => (
                      <div
                        key={biz.id}
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
                        <div>
                          <p className="text-body-medium">{biz.name}</p>
                          <span className="text-caption">{biz.address || 'Address pending'}</span>
                        </div>
                        <Badge variant={biz.status === 'ACTIVE' ? 'active' : 'disabled'}>{biz.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Hardware Assets Stream */}
            <Card padding="lg">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="text-section">{t('admin.overview.recentAssets')}</h3>
                  <Link to="/admin/qr-nfc" style={{ textDecoration: 'none' }}>
                    <Button variant="ghost" size="sm">
                      {t('admin.overview.viewInventory')} <ArrowUpRight size={14} className="icon-flip-rtl" />
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <Skeleton height="120px" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {recentAssets.map((asset) => (
                      <div
                        key={asset.id}
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
                          <Badge variant={asset.type === 'QR' ? 'neutral' : 'warning'}>{asset.type}</Badge>
                          <div>
                            <p className="text-body-medium">{asset.label}</p>
                            <span className="text-caption" style={{ fontFamily: 'monospace' }}>Code: {asset.public_code}</span>
                          </div>
                        </div>
                        <span className="text-caption" style={{ fontWeight: 500 }}>
                          {asset.business_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

