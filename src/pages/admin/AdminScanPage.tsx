import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cardService } from '../../services';
import { CardItem, BusinessData } from '../../types';
import { useTranslation } from '../../i18n';
import { QRScannerModal } from '../../components/admin/QRScannerModal';
import {
  Card,
  Button,
  Input,
  Badge,
  Skeleton,
  EmptyState,
  Toast,
} from '../../components/ui';
import {
  Search,
  Save,
  QrCode,
  Cpu,
  Store,
  Camera,
} from 'lucide-react';

export const AdminScanPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [payloadInput, setPayloadInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resolvedCard, setResolvedCard] = useState<CardItem | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Business Data Form State
  const [formData, setFormData] = useState<BusinessData>({
    name: '',
    description: '',
    logo_url: '',
    phone: '',
    whatsapp: '',
    address: '',
    instagram_url: '',
    google_review_url: '',
    website_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const paramPayload = searchParams.get('payload');
    if (paramPayload) {
      setPayloadInput(paramPayload);
      handleResolve(paramPayload);
    }
  }, [searchParams]);

  const handleResolve = async (inputToUse?: string) => {
    const term = inputToUse !== undefined ? inputToUse : payloadInput;
    if (!term.trim()) {
      setToast({ message: t('admin.scan.inputLabel'), type: 'error' });
      return;
    }

    setLoading(true);
    setSearched(true);
    setResolvedCard(null);

    try {
      const card = await cardService.resolveCardByPayload(term);
      setResolvedCard(card);
      if (card && card.business_data) {
        setFormData({ ...card.business_data });
      } else {
        setFormData({
          name: '',
          description: '',
          logo_url: '',
          phone: '',
          whatsapp: '',
          address: '',
          instagram_url: '',
          google_review_url: '',
          website_url: '',
        });
      }
    } catch (err) {
      setToast({ message: t('common.error'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof BusinessData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedCard) return;

    if (!formData.name.trim()) {
      setToast({ message: `${t('dashboard.profile.bizName')} *`, type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const updatedCard = await cardService.saveCardBusinessData(resolvedCard.id, formData);
      setResolvedCard(updatedCard);
      setToast({
        message: t('cards.saveCardDataSuccess'),
        type: 'success',
      });
    } catch (err) {
      setToast({ message: t('common.error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const isActive = resolvedCard?.status === 'ACTIVE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-page-title">{t('admin.scan.title')}</h1>
        <p className="text-body-secondary" style={{ marginTop: 'var(--space-xs)' }}>
          {t('admin.scan.subtitle')}
        </p>
      </div>

      {/* Input / Scanner Simulation Form */}
      <Card padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <h2 className="text-title">{t('admin.scan.cardTitle')}</h2>
            <p className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
              {t('admin.scan.cardSubtitle')}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResolve();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label={t('admin.scan.inputLabel')}
                  placeholder={t('admin.scan.inputPlaceholder')}
                  value={payloadInput}
                  onChange={(e) => setPayloadInput(e.target.value)}
                />
              </div>
              <div style={{ alignSelf: 'flex-end', marginBottom: '2px', display: 'flex', gap: 'var(--space-sm)' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsScannerOpen(true)}
                >
                  <Camera size={16} /> {t('admin.scan.scanQRBtn')}
                </Button>
                <Button type="submit" variant="primary" isLoading={loading}>
                  <Search size={16} /> {t('admin.scan.resolveBtn')}
                </Button>
              </div>
            </div>

            <QRScannerModal
              isOpen={isScannerOpen}
              onClose={() => setIsScannerOpen(false)}
              onScanComplete={(code) => {
                setPayloadInput(code);
                handleResolve(code);
              }}
            />

          </form>
        </div>
      </Card>

      {/* Resolution Result Section */}
      {loading ? (
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Skeleton width="40%" height="24px" />
            <Skeleton width="100%" height="60px" />
            <Skeleton width="60%" height="36px" />
          </div>
        </Card>
      ) : searched && !resolvedCard ? (
        <Card padding="lg">
          <EmptyState
            title={t('admin.scan.noAssetTitle')}
            description={t('admin.scan.noAssetDesc', { payload: payloadInput })}
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearched(false);
                  setPayloadInput('');
                }}
              >
                {t('admin.scan.resetBtn')}
              </Button>
            }
          />
        </Card>
      ) : resolvedCard ? (
        <Card padding="lg">
          {/* Card Meta Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <div>
              <h2 className="text-title">{resolvedCard.card_code}</h2>
              <p className="text-caption" style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                Public Code: <strong>{resolvedCard.public_code}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>{isActive ? '🟢' : '🔴'}</span>
              <Badge variant={isActive ? 'active' : 'warning'}>
                {isActive ? t('cards.statusActive') : t('cards.statusInactive')}
              </Badge>
            </div>
          </div>

          {/* Unified Card Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-lg)',
              backgroundColor: 'var(--bg-surface-hover)',
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-xl)',
            }}
          >
            <div>
              <div className="text-caption" style={{ color: 'var(--text-tertiary)' }}>Card ID</div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{resolvedCard.id}</div>
            </div>

            <div>
              <div className="text-caption" style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <QrCode size={12} /> Paired QR ID
              </div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{resolvedCard.qr.id}</div>
            </div>

            <div>
              <div className="text-caption" style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={12} /> Paired NFC Identifier
              </div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{resolvedCard.nfc.identifier}</div>
            </div>

            <div>
              <div className="text-caption" style={{ color: 'var(--text-tertiary)' }}>{t('cards.colBiz')}</div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <Store size={16} style={{ color: 'var(--text-secondary)' }} />
                {isActive && resolvedCard.business_data ? resolvedCard.business_data.name : t('cards.drawer.notAssigned')}
              </div>
            </div>
          </div>

          {/* Business Data Form (Save directly on Card) */}
          <form onSubmit={handleSaveData} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-lg)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
                {isActive ? t('cards.scanFormEditTitle') : t('cards.scanFormTitle')}
              </h3>
              <p className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Both QR ({resolvedCard.qr.id}) & NFC ({resolvedCard.nfc.identifier}) will point to this card data.
              </p>
            </div>

            <Input
              label={`${t('dashboard.profile.bizName')} *`}
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="e.g. Acme Coffee Bar"
              required
            />

            <Input
              label={t('dashboard.profile.description')}
              value={formData.description || ''}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Artisanal espresso, fresh bakery items, and cozy seating"
            />

            <Input
              label={t('dashboard.profile.logoUrl')}
              value={formData.logo_url || ''}
              onChange={(e) => handleFormChange('logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
            />

            <Input
              label={t('dashboard.profile.address')}
              value={formData.address || ''}
              onChange={(e) => handleFormChange('address', e.target.value)}
              placeholder="123 Main Street, Suite 100, San Francisco, CA"
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-lg)' }}>
              <Input
                label={t('dashboard.profile.whatsapp')}
                value={formData.whatsapp || ''}
                onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                placeholder="+14155552671"
              />

              <Input
                label={t('dashboard.profile.phone')}
                value={formData.phone || ''}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="+14155552671"
              />

              <Input
                label={t('dashboard.profile.instagram')}
                value={formData.instagram_url || ''}
                onChange={(e) => handleFormChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/acmecoffee"
              />

              <Input
                label={t('dashboard.profile.googleReviewUrl')}
                value={formData.google_review_url || ''}
                onChange={(e) => handleFormChange('google_review_url', e.target.value)}
                placeholder="https://search.google.com/local/writereview?placeid=..."
              />

              <Input
                label={t('dashboard.profile.website')}
                value={formData.website_url || ''}
                onChange={(e) => handleFormChange('website_url', e.target.value)}
                placeholder="https://acmecoffee.example.com"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
              <Button type="submit" variant="primary" size="lg" isLoading={saving}>
                <Save size={18} /> {t('cards.saveCardData')}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
};

export default AdminScanPage;
