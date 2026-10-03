import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cardService } from '../../services';
import { CardItem, BusinessData } from '../../types';
import { getCategoryConfig, resolveLandingUrl } from '../../config/CategoryRegistry';
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

const EMPTY_BUSINESS_DATA: BusinessData = {
  business_name: '',
  description: '',
  logo: '',
  phone: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  google_maps: '',
  website: '',
  email: '',
};

export const AdminScanPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [payloadInput, setPayloadInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resolvedCard, setResolvedCard] = useState<CardItem | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Business Data Form State — uses exact backend API field names
  const [formData, setFormData] = useState<BusinessData>({ ...EMPTY_BUSINESS_DATA });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Fetch categories to resolve configuration
    import('../../services/api/categoriesApi').then(({ categoriesApi }) => {
      categoriesApi.getCategories({ limit: 100 })
        .then(res => setCategories(res.data || []))
        .catch(console.error);
    });

    const paramPayload = searchParams.get('payload');
    if (paramPayload) {
      setPayloadInput(paramPayload);
      handleResolve(paramPayload);
    }
  }, [searchParams]);

  // Use a ref or simple function to handle resolve when categories are loaded or updated
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
        const categoryId = typeof card.category_id === 'string' ? card.category_id : card.category_id?._id;
        const config = getCategoryConfig(categoryId as any, categories);
        const initialRedirect = card.public_url || '';

        if (card.business_data) {
          setFormData({
            ...EMPTY_BUSINESS_DATA,
            ...card.business_data,
            google_maps: card.business_data.google_maps || (config.landingRoute === 'google-review' ? initialRedirect : ''),
            website: card.business_data.website || (config.landingRoute === 'payment' ? initialRedirect : ''),
          });
        } else {
          setFormData({
            ...EMPTY_BUSINESS_DATA,
            google_maps: config.landingRoute === 'google-review' ? initialRedirect : '',
            website: config.landingRoute === 'payment' ? initialRedirect : '',
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

    if (!formData.business_name?.trim()) {
      setToast({ message: 'يرجى كتابة اسم النشاط التجاري', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const updatedCard = await cardService.saveCardBusinessData(resolvedCard.id, formData);
      setResolvedCard(updatedCard);
      setToast({
        message: '🟢 تم حفظ وتفعيل بيانات البطاقة بنجاح!',
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
  const categoryId = typeof resolvedCard?.category_id === 'string' ? resolvedCard.category_id : resolvedCard?.category_id?._id;
  const config = getCategoryConfig(categoryId as any, categories);

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

      {/* Input / Scanner Form */}
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
                  placeholder="مثال: CARD-0001 أو NFC-7FJ2K9"
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

      {/* Resolution Result */}
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
                <Badge variant="info">{resolvedCard.card_type || 'غير محدد'}</Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                Public Code: <strong style={{ color: '#4f46e5' }}>{resolvedCard.public_code}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(resolveLandingUrl(resolvedCard.card_code, config), '_blank');
                }}
              >
                👁️ معاينة الكارت
              </Button>
              <Badge variant={isActive ? 'active' : 'disabled'} showDot>
                {isActive ? 'نشطة ومتصلة' : 'معطلة / في الانتظار'}
              </Badge>
            </div>
          </div>

          {/* Card Details Grid */}
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
                {resolvedCard.business_data?.business_name || 'غير معين'}
              </div>
            </div>
          </div>

          {/* Contextual Form based on card_type */}
          <form onSubmit={handleSaveData} style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            {/* Form Header */}
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px 18px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e40af' }}>
                {config.landingRoute === 'google-review' && '🌟 نموذج كارت تقييمات جوجل (Google Review Card)'}
                {config.landingRoute === 'payment' && '💳 نموذج كارت الدفع (InstaPay Card)'}
                {config.landingRoute === 'social' && '📱 نموذج كارت التواصل الاجتماعي (Social Page Card)'}
                {config.landingRoute === 'direct' && `🔗 نموذج بيانات الكارت`}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#3b82f6', marginTop: '4px' }}>
                {config.landingRoute === 'google-review' && 'أدخل اسم النشاط، الوصف، اللوجو، ورابط تقييم جوجل المباشر.'}
                {config.landingRoute === 'payment' && 'أدخل اسم المستفيد، رابط InstaPay، ورقم الهاتف.'}
                {config.landingRoute === 'social' && 'أدخل اسم النشاط وروابط التواصل الاجتماعي المطلوبة.'}
                {config.landingRoute === 'direct' && 'أدخل بيانات النشاط التجاري.'}
              </p>
            </div>

            {/* Logo Upload Control */}
            {(() => {
              const logoUploadControl = (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                    صورة الشعار / اللوجو (رابط URL) (اختياري)
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0' }}>
                    ملاحظة: يرجى وضع رابط للصورة (مثال: Imgur) وعدم رفع صورة كبيرة الحجم مباشرة.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <Input
                        value={formData.logo || ''}
                        onChange={(e) => handleFormChange('logo', e.target.value)}
                        placeholder="https://example.com/logo.png"
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
                              handleFormChange('logo', dataUrl);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {formData.logo && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={formData.logo}
                          alt="Logo Preview"
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: '2px solid #6366f1',
                          }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleFormChange('logo', '')}
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
                  {/* Common Fields */}
                  <Input
                    label="اسم النشاط التجاري / المكان *"
                    value={formData.business_name || ''}
                    onChange={(e) => handleFormChange('business_name', e.target.value)}
                    placeholder="مثال: مطعم الفيروز / Coffee House"
                    required
                  />
                  <Input
                    label="نبذة / وصف النشاط (اختياري)"
                    value={formData.description || ''}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="مثال: أفضل المأكولات الشرقية والغربية"
                  />
                  {logoUploadControl}

                  {/* Google Review specific */}
                  {config.allowedFields.includes('google_maps') && (
                    <Input
                      label="رابط تقييمات جوجل المباشر *"
                      value={formData.google_maps || ''}
                      onChange={(e) => handleFormChange('google_maps', e.target.value)}
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                    />
                  )}

                  {/* InstaPay specific */}
                  {config.landingRoute === 'payment' && config.allowedFields.includes('website') && (
                    <Input
                      label="رابط InstaPay *"
                      value={formData.website || ''}
                      onChange={(e) => handleFormChange('website', e.target.value)}
                      placeholder="https://instapay.com.eg/..."
                    />
                  )}

                  {/* Social and Generic Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {config.allowedFields.includes('whatsapp') && (
                        <Input
                          label="واتساب (WhatsApp URL) (اختياري)"
                          value={formData.whatsapp || ''}
                          onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                          placeholder="https://wa.me/20100000000"
                        />
                      )}
                      {config.allowedFields.includes('phone') && (
                        <Input
                          label="رقم الهاتف (اختياري)"
                          value={formData.phone || ''}
                          onChange={(e) => handleFormChange('phone', e.target.value)}
                          placeholder="+20100000000"
                        />
                      )}
                      {config.allowedFields.includes('instagram') && (
                        <Input
                          label="إنستجرام (Instagram URL) (اختياري)"
                          value={formData.instagram || ''}
                          onChange={(e) => handleFormChange('instagram', e.target.value)}
                          placeholder="https://instagram.com/yourhandle"
                        />
                      )}
                      {config.allowedFields.includes('facebook') && (
                        <Input
                          label="فيسبوك (Facebook URL) (اختياري)"
                          value={formData.facebook || ''}
                          onChange={(e) => handleFormChange('facebook', e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                        />
                      )}
                      {config.allowedFields.includes('tiktok') && (
                        <Input
                          label="تيك توك (TikTok URL) (اختياري)"
                          value={formData.tiktok || ''}
                          onChange={(e) => handleFormChange('tiktok', e.target.value)}
                          placeholder="https://tiktok.com/@yourusername"
                        />
                      )}
                      {config.allowedFields.includes('website') && config.landingRoute !== 'payment' && (
                        <Input
                          label="الموقع الإلكتروني (اختياري)"
                          value={formData.website || ''}
                          onChange={(e) => handleFormChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      )}
                      {config.allowedFields.includes('google_maps') && config.landingRoute !== 'google-review' && (
                        <Input
                          label="خرائط جوجل (Google Maps URL) (اختياري)"
                          value={formData.google_maps || ''}
                          onChange={(e) => handleFormChange('google_maps', e.target.value)}
                          placeholder="https://maps.google.com/?q=..."
                        />
                      )}
                      {config.allowedFields.includes('email') && (
                        <Input
                          label="البريد الإلكتروني (اختياري)"
                          value={formData.email || ''}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          placeholder="hello@example.com"
                        />
                      )}
                    </div>
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
