import React, { useEffect, useState } from 'react';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { Card, Input, Button, Toast, ToastType, ErrorState, Skeleton } from '../components/ui';
import { businessService } from '../services';
import { Business } from '../types';
import { Save, Store } from 'lucide-react';
import { useTranslation } from '../i18n';

export const BusinessProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState<Partial<Business>>({});
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBusiness = async () => {
      setLoading(true);
      try {
        const biz = await businessService.getCurrentBusiness();
        if (!biz) throw new Error('Business details not found');
        if (isMounted) {
          setBusiness(biz);
          setFormData(biz);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load business profile');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusiness();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof Business, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setSaving(true);
    try {
      const updated = await businessService.updateBusiness(business.id, formData);
      setBusiness(updated);
      setToast({
        type: 'success',
        message: t('dashboard.profile.saveSuccess'),
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: t('common.error'),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell title={t('dashboard.profile.title')}>
      {/* Toast Notification Popup */}
      {toast && (
        <div style={{ position: 'fixed', top: 'var(--space-2xl)', insetInlineEnd: 'var(--space-2xl)', zIndex: 1100 }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : loading ? (
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
          {/* Section 1: Basic Brand Identity */}
          <Card padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <Store size={20} style={{ color: 'var(--text-primary)' }} />
                <h2 className="text-section">{t('modals.createBiz.title')}</h2>
              </div>

              <Input
                label={`${t('dashboard.profile.bizName')} *`}
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Acme Coffee Bar"
                required
              />

              <Input
                label={t('dashboard.profile.description')}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Artisanal espresso, fresh bakery items, and cozy seating"
              />

              <Input
                label={t('dashboard.profile.logoUrl')}
                value={formData.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />

              <Input
                label={t('dashboard.profile.address')}
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main Street, Suite 100, San Francisco, CA"
              />
            </div>
          </Card>

          {/* Section 2: Contact & Social Action Links */}
          <Card padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <h2 className="text-section">{t('modals.bizDrawer.links')}</h2>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.profile.subtitle')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
                <Input
                  label={t('dashboard.profile.whatsapp')}
                  value={formData.whatsapp || ''}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="+14155552671"
                />

                <Input
                  label={t('dashboard.profile.phone')}
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+14155552671"
                />

                <Input
                  label={t('dashboard.profile.instagram')}
                  value={formData.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/acmecoffee"
                />

                <Input
                  label={t('dashboard.profile.googleReviewUrl')}
                  value={formData.google_review_url || ''}
                  onChange={(e) => handleChange('google_review_url', e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                />

                <Input
                  label={t('dashboard.profile.website')}
                  value={formData.website_url || ''}
                  onChange={(e) => handleChange('website_url', e.target.value)}
                  placeholder="https://acmecoffee.example.com"
                />
              </div>
            </div>
          </Card>

          {/* Form Submit Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" size="lg" isLoading={saving}>
              <Save size={18} /> {t('common.save')}
            </Button>
          </div>
        </form>
      )}
    </DashboardShell>
  );
};
