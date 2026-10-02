import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cardService } from '../../services';
import { CardItem, BusinessData, getMainCategory } from '../../types';
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
  Upload,
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
    } catch (err: any) {
      console.error('Failed to save business data:', err);
      setToast({ message: err.message || t('common.error'), type: 'error' });
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
                <Badge variant={getMainCategory(cardType) === 'Google Review' ? 'amber' : getMainCategory(cardType) === 'Payment' ? 'purple' : 'info'}>
                  {getMainCategory(cardType) === 'Google Review' ? '🌟 Google Review' : getMainCategory(cardType) === 'Payment' ? '💳 Payment' : `🌐 Social`}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                Public Code: <strong style={{ color: '#4f46e5' }}>{resolvedCard.public_code}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/c/${resolvedCard.public_code}`, '_blank')}
              >
                👁️ معاينة الكارت
              </Button>
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
            {(() => {
              const category = getMainCategory(resolvedCard?.card_type);
              return (
                <>
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px 18px', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e40af' }}>
                      {category === 'Google Review' && '🌟 نموذج كارت تقييمات جوجل (Google Review Card)'}
                      {category === 'Payment' && '💳 نموذج كارت الدفع والتحويل (Payment / InstaPay Card)'}
                      {category === 'Social' && '📱 نموذج كارت التواصل الاجتماعي (Social Media Card)'}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#3b82f6', marginTop: '4px' }}>
                      {category === 'Google Review' && 'أدخل اسم النشاط، الوصف، اللوجو، ورابط تقييم جوجل المباشر.'}
                      {category === 'Payment' && 'أدخل اسم المستفيد، عنوان InstaPay IPA، ورقم فودافون كاش أو رقم الهاتف.'}
                      {category === 'Social' && 'أدخل اسم النشاط ورابط البروفايل أو روابط التواصل الاجتماعي المطلوبة.'}
                    </p>
                  </div>

                  {/* Helper for Logo Upload / URL Input with live preview */}
                  {(() => {
                    const logoUploadControl = (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                          صورة الشعار / اللوجو (رابط URL فقط) (اختياري)
                        </label>
                        <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0' }}>
                          ملاحظة: لضمان سرعة الكارت، يرجى وضع رابط للصورة (مثال: Imgur) وعدم رفع صورة كبيرة الحجم مباشرة.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <Input
                              value={formData.logo_url || ''}
                              onChange={(e) => handleFormChange('logo_url', e.target.value)}
                              placeholder="https://example.com/logo.png أو اضغط زر رفع صورة"
                            />
                          </div>

                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '10px 18px',
                              backgroundColor: '#4f46e5',
                              color: '#ffffff',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                              transition: 'transform 100ms ease, opacity 100ms ease',
                            }}
                          >
                            <Upload size={16} />
                            <span>رفع صورة (Upload)</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    const dataUrl = evt.target?.result as string;
                                    handleFormChange('logo_url', dataUrl);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {formData.logo_url && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img
                                src={formData.logo_url}
                                alt="Logo Preview"
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  border: '2px solid #6366f1',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleFormChange('logo_url', '')}
                                style={{
                                  background: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '22px',
                                  height: '22px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                }}
                                title="حذف اللوجو"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );

                    return (
                      <>
                        {/* 1. GOOGLE REVIEW FORM FIELDS */}
                        {category === 'Google Review' && (
                          <>
                            <Input
                              label="اسم النشاط التجاري / المكان *"
                              value={formData.name}
                              onChange={(e) => handleFormChange('name', e.target.value)}
                              placeholder="مثال: مطعم الفيروز / Acme Coffee"
                              required
                            />
                            <Input
                              label="نبذة / وصف النشاط (اختياري)"
                              value={formData.description || ''}
                              onChange={(e) => handleFormChange('description', e.target.value)}
                              placeholder="مثال: أفضل المأكولات الشرقية والغربية"
                            />
                            {logoUploadControl}
                            <Input
                              label="رابط تقييمات جوجل المباشر (Google Review Link) *"
                              value={formData.google_review_url || ''}
                              onChange={(e) => handleFormChange('google_review_url', e.target.value)}
                              placeholder="https://search.google.com/local/writereview?placeid=..."
                              required
                            />
                          </>
                        )}

                        {/* 2. PAYMENT FORM FIELDS (InstaPay & Vodafone Cash) */}
                        {category === 'Payment' && (
                          <>
                            <Input
                              label="اسم المستفيد / صاحب الحساب *"
                              value={formData.name}
                              onChange={(e) => handleFormChange('name', e.target.value)}
                              placeholder="مثال: أحمد محمود / متجر الأمل"
                              required
                            />
                            <Input
                              label="عنوان / إيميل InstaPay IPA (مثال: name@instapay) *"
                              value={formData.instapay_url || ''}
                              onChange={(e) => handleFormChange('instapay_url', e.target.value)}
                              placeholder="مثال: name@instapay أو 01001234567@instapay"
                              required
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                              <Input
                                label="رقم الهاتف المربوط بالحساب (اختياري)"
                                value={formData.phone || ''}
                                onChange={(e) => handleFormChange('phone', e.target.value)}
                                placeholder="مثال: 01001234567"
                              />
                              <Input
                                label="رقم فودافون كاش (Vodafone Cash) (اختياري)"
                                value={formData.whatsapp || ''}
                                onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                                placeholder="مثال: 01012345678"
                              />
                            </div>
                            <Input
                              label="نبذة / ملحوظة للتحويل (اختياري)"
                              value={formData.description || ''}
                              onChange={(e) => handleFormChange('description', e.target.value)}
                              placeholder="مثال: يرجى إرسال صورة الإيصال بعد التحويل"
                            />
                            {logoUploadControl}
                          </>
                        )}

                        {/* 3. SOCIAL MEDIA FORM FIELDS */}
                        {category === 'Social' && (
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
                            {logoUploadControl}

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
                      </>
                    );
                  })()}
                </>
              );
            })()}

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
