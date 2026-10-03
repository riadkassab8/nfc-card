import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../ui';
import { cardService } from '../../services';
import { categoriesApi, apiClient } from '../../services/api';
import { CardItem, ApiCategory, ApiLookupEntry } from '../../types';
import { getCategoryConfig } from '../../config/CategoryRegistry';
import { useTranslation } from '../../i18n';
import { Layers, CheckCircle2, CreditCard, Plus } from 'lucide-react';

export interface BatchGenerateCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (generatedCards: CardItem[]) => void;
}

type ActiveTab = 'batch' | 'single';

/* ──────────────────────────────────────────────────────────────── */
/*  Inline tab-pill styles                                          */
/* ──────────────────────────────────────────────────────────────── */
const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontWeight: active ? 700 : 500,
  cursor: 'pointer',
  border: 'none',
  transition: 'all 200ms ease',
  backgroundColor: active ? '#ffffff' : 'transparent',
  color: active ? '#0f172a' : '#64748b',
  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
});


/* ================================================================ */
export const BatchGenerateCardsModal: React.FC<BatchGenerateCardsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  /* ── shared ── */
  const [activeTab, setActiveTab] = useState<ActiveTab>('batch');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  /* ── dynamic data ── */
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [cardTypes, setCardTypes] = useState<ApiLookupEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [catsRes, typesRes] = await Promise.all([
            categoriesApi.getCategories({ limit: 100 }),
            apiClient<ApiLookupEntry[]>('/lookup/group/card_type'),
          ]);
          setCategories(catsRes.data || []);
          setCardTypes(typesRes || []);
        } catch (err) {
          console.error('Failed to load modal dependencies:', err);
        }
      };
      loadData();
    }
  }, [isOpen]);

  const typeOptions = cardTypes.length > 0 
    ? cardTypes.map(t => ({ value: t.key, label: t.label }))
    : [
        { value: 'Google Review', label: '🌟 تقييمات جوجل (Google Review)' },
        { value: 'Instagram',     label: '🌐 تواصل اجتماعي (Social)' },
        { value: 'InstaPay',      label: '💳 دفع (Payment)' },
        { value: 'Social Page',   label: '📱 صفحة تواصل اجتماعي (Social Page)' },
      ];
      
  const catOptions = [
    { value: '', label: '-- بدون تصنيف --' },
    ...categories.map(c => ({ value: c._id, label: c.name }))
  ];

  /* ── batch tab ── */
  const [quantity, setQuantity]       = useState<string>('10');
  const [batchCardType, setBatchCardType] = useState<string>('Social Page');
  const [batchCategoryId, setBatchCategoryId] = useState<string>('');
  const [batchError, setBatchError]   = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  /* ── single tab ── */
  const [cardCode, setCardCode]       = useState('');
  const [nfcUid, setNfcUid]           = useState('');
  const [singleCardType, setSingleCardType] = useState<string>('Social Page');
  const [singleCategoryId, setSingleCategoryId] = useState<string>('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [singleError, setSingleError] = useState<string | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);

  /* ────────────────────────────────── */
  /*  Helpers                           */
  /* ────────────────────────────────── */
  const numVal    = parseInt(quantity, 10);
  const isValidNum = !isNaN(numVal) && numVal >= 1 && numVal <= 500 && String(numVal) === quantity.trim();

  const resetAll = () => {
    setActiveTab('batch');
    setSuccessCount(null);
    setQuantity('10');
    setBatchCardType('Social Page');
    setBatchCategoryId('');
    setBatchError(null);
    setCardCode('');
    setNfcUid('');
    setSingleCardType('Social Page');
    setSingleCategoryId('');
    setRedirectUrl('');
    setSingleError(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  /* ────────────────────────────────── */
  /*  Submit – Batch                    */
  /* ────────────────────────────────── */
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);

    if (!isValidNum) {
      setBatchError(t('cards.batchModal.countHelper'));
      return;
    }

    setBatchLoading(true);
    try {
      const result = await cardService.generateCardBatch(numVal, batchCardType, batchCategoryId || undefined);
      setSuccessCount(numVal);
      onSuccess(result.cards);
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBatchLoading(false);
    }
  };

  /* ────────────────────────────────── */
  /*  Submit – Single                   */
  /* ────────────────────────────────── */
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);

    const trimCode = cardCode.trim();
    const trimUrl  = redirectUrl.trim();

    if (!trimCode) {
      setSingleError('كود الكارت مطلوب');
      return;
    }
    if (!trimUrl) {
      setSingleError('رابط التوجيه مطلوب');
      return;
    }

    setSingleLoading(true);
    try {
      const config = getCategoryConfig(singleCategoryId, categories);
      const initialBusinessData: Record<string, string> = {};
      
      // Route the redirect URL to the appropriate business data field based on category configuration
      if (config.allowedFields.includes('google_maps') && config.landingRoute === 'google-review') {
        initialBusinessData.google_maps = trimUrl;
      } else if (config.landingRoute === 'payment') {
        initialBusinessData.website = trimUrl;
      } else {
        // generic fallback
        initialBusinessData.website = trimUrl;
      }

      const created = await cardService.createCard({
        card_code:            trimCode.toUpperCase(),
        nfc_uid:              nfcUid.trim() || undefined,
        card_type:            singleCardType,
        category_id:          singleCategoryId || undefined,
        current_redirect_url: trimUrl,
        business_data:        initialBusinessData,
      });
      setSuccessCount(1);
      onSuccess([created]);
    } catch (err) {
      setSingleError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSingleLoading(false);
    }
  };

  /* ────────────────────────────────── */
  /*  Render                            */
  /* ────────────────────────────────── */
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successCount ? t('common.success') : 'إضافة كارت جديد'}
      maxWidth="500px"
    >
      {/* ── Success Screen ── */}
      {successCount ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-xl)',
            textAlign: 'center',
          }}
        >
          <CheckCircle2 size={52} style={{ color: 'var(--success-text)' }} />
          <div>
            <h3 className="text-title" style={{ fontSize: '1.25rem' }}>
              {successCount === 1
                ? 'تم إنشاء الكارت بنجاح! 🎉'
                : t('cards.batchModal.toastSuccess', { count: successCount })}
            </h3>
            <p
              className="text-body"
              style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}
            >
              {successCount === 1
                ? 'تم إضافة الكارت إلى المخزون بنجاح.'
                : t('cards.batchModal.summaryBody', { count: successCount })}
            </p>
          </div>
          <Button variant="primary" fullWidth onClick={handleClose}>
            {t('common.close')}
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

          {/* ── Tab Switcher ── */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '4px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              style={tabStyle(activeTab === 'batch')}
              onClick={() => setActiveTab('batch')}
            >
              <Layers size={16} />
              إضافة عدة كروت
            </button>
            <button
              type="button"
              style={tabStyle(activeTab === 'single')}
              onClick={() => setActiveTab('single')}
            >
              <CreditCard size={16} />
              إضافة كارت واحد
            </button>
          </div>

          {/* ════════════════════════════════ */}
          {/* TAB 1 – Batch (no data)         */}
          {/* ════════════════════════════════ */}
          {activeTab === 'batch' && (
            <form
              onSubmit={handleBatchSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
            >
              {/* description chip */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.8125rem',
                  color: '#64748b',
                  lineHeight: 1.5,
                }}
              >
                سيتم إنشاء الكروت بدون بيانات تجارية، يمكنك تعيينها لاحقاً من صفحة المسح.
              </div>

              <Select
                label="نوع الكارت *"
                value={batchCardType}
                onChange={(e) => setBatchCardType(e.target.value)}
                options={typeOptions}
              />

              <Select
                label="التصنيف (اختياري)"
                value={batchCategoryId}
                onChange={(e) => setBatchCategoryId(e.target.value)}
                options={catOptions}
              />

              <Input
                label={`${t('cards.batchModal.countLabel')} *`}
                type="number"
                min={1}
                max={500}
                step={1}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setBatchError(null);
                }}
                error={batchError || undefined}
                helperText="من 1 إلى 500 كارت في المرة الواحدة"
                required
              />

              {/* Summary Preview */}
              {isValidNum && (
                <div
                  style={{
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--bg-surface-hover)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-xs)',
                  }}
                >
                  <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
                    {t('cards.batchModal.summaryTitle')}
                  </span>
                  <span className="text-body-medium">
                    {t('cards.batchModal.summaryBody', { count: numVal })}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--space-md)',
                  marginTop: 'var(--space-sm)',
                }}
              >
                <Button type="button" variant="secondary" onClick={handleClose}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={batchLoading}
                  disabled={!isValidNum}
                >
                  <Layers size={16} /> {t('cards.batchModal.submit')}
                </Button>
              </div>
            </form>
          )}

          {/* ════════════════════════════════ */}
          {/* TAB 2 – Single card with data   */}
          {/* ════════════════════════════════ */}
          {activeTab === 'single' && (
            <form
              onSubmit={handleSingleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
            >
              <Input
                label="كود الكارت *"
                placeholder="CARD-0001"
                helperText="الصيغة: CARD-XXXX"
                value={cardCode}
                onChange={(e) => {
                  setCardCode(e.target.value);
                  setSingleError(null);
                }}
                required
              />

              <Input
                label="NFC UID"
                placeholder="NFC-7FJ2K9"
                helperText="اختياري — المعرّف الفيزيائي للشريحة"
                value={nfcUid}
                onChange={(e) => setNfcUid(e.target.value)}
              />

              <Select
                label="نوع الكارت *"
                value={singleCardType}
                onChange={(e) => setSingleCardType(e.target.value)}
                options={typeOptions}
              />

              <Select
                label="التصنيف (اختياري)"
                value={singleCategoryId}
                onChange={(e) => setSingleCategoryId(e.target.value)}
                options={catOptions}
              />

              <Input
                label="رابط التوجيه *"
                placeholder="https://g.page/r/..."
                value={redirectUrl}
                onChange={(e) => {
                  setRedirectUrl(e.target.value);
                  setSingleError(null);
                }}
                error={singleError || undefined}
                required
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--space-md)',
                  marginTop: 'var(--space-sm)',
                }}
              >
                <Button type="button" variant="secondary" onClick={handleClose}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" isLoading={singleLoading}>
                  <Plus size={16} /> حفظ
                </Button>
              </div>
            </form>
          )}

        </div>
      )}
    </Modal>
  );
};
