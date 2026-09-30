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
    tiktok_url: '',
    facebook_url: '',
    google_review_url: '',
    instapay_url: '',
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
      if (card) {
        if (card.business_data) {
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
            tiktok_url: '',
            facebook_url: '',
            google_review_url: '',
            instapay_url: '',
            website_url: '',
          });
        }
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
      setToast({ message: 'يرجى كتابة اسم النشاط التجاري', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const updatedCard = await cardService.saveCardBusinessData(resolvedCard.id, formData);
      setResolvedCard(updatedCard);
      setToast({
        message: '🟢 تم حفظ وتفعيل بيانات البطاقة وتحديث الـ QR بنجاح!',
        type: 'success',
      });
    } catch (err) {
      setToast({ message: t('common.error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const isActive = resolvedCard?.status === 'ACTIVE';
  const cardType = resolvedCard?.card_type || 'UNIFIED_SOCIAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-page-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          فحص وتجهيز البطاقة (Card Provisioning)
        </h1>
        <p className="text-body-secondary" style={{ marginTop: '4px', color: '#64748b' }}>
          قم بمسح كود البطاقة أو ادخاله، وستظهر لك الحقول المخصصة لنوع هذا الكارت فقط.
        </p>
      </div>

      {/* Input / Scanner Simulation Form */}
      <Card padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 className="text-title" style={{ fontSize: '1.125rem' }}>إدخال أو مسح كود البطاقة</h2>
            <p className="text-caption" style={{ color: '#64748b' }}>
              أدخل الكود العام (Public Code)، رقم البطاقة، أو رمز QR/NFC
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResolve();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <Input
                  label="كود العام / رقم QR / معرف NFC"
                  placeholder="مثال: 7FJ2K9 أو CARD-0001"
                  value={payloadInput}
                  onChange={(e) => setPayloadInput(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsScannerOpen(true)}
                >
                  <Camera size={16} /> مسح QR بالقارئ
                </Button>
                <Button type="submit" variant="primary" isLoading={loading}>
                  <Search size={16} /> فحص الكارت
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton width="40%" height="24px" />
            <Skeleton width="100%" height="60px" />
            <Skeleton width="60%" height="36px" />
          </div>
        </Card>
      ) : searched && !resolvedCard ? (
        <Card padding="lg">
          <EmptyState
            title="لم يتم العثور على بطاقة مطابقة"
            description={`الكود [${payloadInput}] غير موجود في قاعدة بيانات البطاقات`}
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearched(false);
                  setPayloadInput('');
                }}
              >
                إعادة المحاولة
              </Button>
            }
          />
        </Card>
      ) : resolvedCard ? (
        <Card padding="lg">
          {/* Card Meta Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{resolvedCard.card_code}</h2>
                <Badge variant={cardType === 'GOOGLE_REVIEW' ? 'amber' : cardType === 'INSTAPAY' ? 'purple' : 'info'}>
                  {cardType === 'GOOGLE_REVIEW' ? '🌟 Google Review' : cardType === 'INSTAPAY' ? '💳 InstaPay' : '🌐 السوشيال الموحدة'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                Public Code: <strong style={{ color: '#4f46e5' }}>{resolvedCard.public_code}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant={isActive ? 'active' : 'disabled'} showDot>
                {isActive ? 'نشطة ومتصلة' : 'معطلة / في الانتظار'}
              </Badge>
            </div>
          </div>

          {/* Unified Card Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>معرف البطاقة</div>
              <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.875rem' }}>{resolvedCard.id}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <QrCode size={12} /> كود QR المرتبط
              </div>
              <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.875rem' }}>{resolvedCard.qr.id}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={12} /> شريحة NFC المرتبطة
              </div>
              <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.875rem' }}>{resolvedCard.nfc.identifier}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>النشاط التجاري الحالي</div>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                <Store size={14} style={{ color: '#64748b' }} />
                {isActive && resolvedCard.business_data ? resolvedCard.business_data.name : 'غير معين'}
              </div>
            </div>
          </div>

          {/* Contextual Form Rendered Specifically based on cardType */}
          <form onSubmit={handleSaveData} style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px 18px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e40af' }}>
                {cardType === 'GOOGLE_REVIEW' && '🌟 نموذج كارت تقييمات جوجل (Google Review Card)'}
                {cardType === 'INSTAPAY' && '💳 نموذج كارت انستا باي (InstaPay Card)'}
                {cardType === 'UNIFIED_SOCIAL' && '🌐 نموذج كارت السوشيال الموحدة (Unified Social Card)'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#3b82f6', marginTop: '4px' }}>
                {cardType === 'GOOGLE_REVIEW' && 'أدخل اسم النشاط ورابط تقييم جوجل المباشر فقط.'}
                {cardType === 'INSTAPAY' && 'أدخل اسم صاحب الحساب وعنوان InstaPay IPA.'}
                {cardType === 'UNIFIED_SOCIAL' && 'أدخل اللينكات المتاحة فقط. الحقول التي تقوم بملئها هي فقط التي ستظهر للعميل بعد المسح!'}
              </p>
            </div>

            {/* 1. GOOGLE REVIEW FORM FIELDS */}
            {cardType === 'GOOGLE_REVIEW' && (
              <>
                <Input
                  label="اسم النشاط التجاري / المحل *"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="مثال: مطعم الفيروز / Acme Coffee"
                  required
                />
                <Input
                  label="رابط تقييمات جوجل المباشر (Google Review Link) *"
                  value={formData.google_review_url || ''}
                  onChange={(e) => handleFormChange('google_review_url', e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  required
                />
              </>
            )}

            {/* 2. INSTAPAY FORM FIELDS */}
            {cardType === 'INSTAPAY' && (
              <>
                <Input
                  label="اسم المستفيد / صاحب حساب InstaPay *"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="مثال: أحمد محمود / متجر الأمل"
                  required
                />
                <Input
                  label="عنوان أو رابط InstaPay IPA (Handle) *"
                  value={formData.instapay_url || ''}
                  onChange={(e) => handleFormChange('instapay_url', e.target.value)}
                  placeholder="مثال: name@instapay أو 01001234567@instapay"
                  required
                />
                <Input
                  label="رقم الهاتف المرتبط بالحساب (اختياري)"
                  value={formData.phone || ''}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="مثال: +201001234567"
                />
              </>
            )}

            {/* 3. UNIFIED SOCIAL FORM FIELDS */}
            {cardType === 'UNIFIED_SOCIAL' && (
              <>
                <Input
                  label="اسم النشاط التجاري / المكان *"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="مثال: Vibe Fashion Store"
                  required
                />

                <Input
                  label="نبذة / وصف النشاط (اختياري)"
                  value={formData.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="مثال: أرقى صيحات الموضة والملابس الجاهزة"
                />

                <Input
                  label="رابط صورة الشعار / اللوجو (اختياري)"
                  value={formData.logo_url || ''}
                  onChange={(e) => handleFormChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <Input
                    label="رابط صفحة فيسبوك (Facebook URL) (اختياري)"
                    value={formData.facebook_url || ''}
                    onChange={(e) => handleFormChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />

                  <Input
                    label="حساب / رابط إنستجرام (Instagram URL) (اختياري)"
                    value={formData.instagram_url || ''}
                    onChange={(e) => handleFormChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />

                  <Input
                    label="حساب / رابط تيك توك (TikTok URL) (اختياري)"
                    value={formData.tiktok_url || ''}
                    onChange={(e) => handleFormChange('tiktok_url', e.target.value)}
                    placeholder="https://tiktok.com/@yourusername"
                  />

                  <Input
                    label="رابط الموقع الإلكتروني الرسمي (Website URL) (اختياري)"
                    value={formData.website_url || ''}
                    onChange={(e) => handleFormChange('website_url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />

                  <Input
                    label="رقم / رابط الواتساب (WhatsApp) (اختياري)"
                    value={formData.whatsapp || ''}
                    onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                    placeholder="+201001234567"
                  />

                  <Input
                    label="رقم الهاتف للتواصل المباشر (Phone) (اختياري)"
                    value={formData.phone || ''}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="+201001234567"
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button type="submit" variant="gradient" size="lg" isLoading={saving}>
                <Save size={18} /> حفظ وتفعيل بيانات البطاقة
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
};

export default AdminScanPage;
