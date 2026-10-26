import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  RotateCcw,
  Sparkles,
  Layout,
  Video,
  List,
  Compass,
  PhoneCall,
  Info,
  HelpCircle,
  Plus,
  Trash2,
  Loader2,
  Upload,
  CheckSquare,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { websiteApi } from '../../services';
import { CheckoutFormFieldConfig, WebsiteContent } from '../../services/api/websiteApi';

type TabType =
  | 'branding'
  | 'hero'
  | 'video'
  | 'features'
  | 'useCases'
  | 'cta'
  | 'about'
  | 'how'
  | 'checkout'
  | 'footer';

export const AdminWebsiteContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('branding');
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const isDetailedAddressField = (field: CheckoutFormFieldConfig) => {
    const id = (field.id || '').toLowerCase().replace(/[^a-z]/g, '');
    const label = (field.label || '').replace(/\s/g, '');
    return id.includes('address') || label.includes('العنوان');
  };

  const requireDetailedAddress = (fields?: CheckoutFormFieldConfig[]) =>
    fields?.map((field) => isDetailedAddressField(field) ? { ...field, required: true } : field);

  const handleUploadMedia = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetCallback: (url: string) => void,
    fieldName: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingField(fieldName);
      showToast('جاري رفع الملف إلى السحابة Cloudinary...', 'success');
      const res = await websiteApi.uploadMedia(file);
      if (res?.url) {
        targetCallback(res.url);
        showToast('تم رفع الملف بنجاح وتحديث الرابط السحابي!', 'success');
      }
    } catch (err: any) {
      showToast('فشل رفع الملف: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    void Swal.fire({
      toast: true,
      position: 'top',
      icon: type === 'success' ? 'success' : 'error',
      title: msg,
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
    });
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await websiteApi.getContent();
      const addressFieldWasOptional = data.checkoutFields?.some(
        (field) => isDetailedAddressField(field) && field.required !== true,
      ) || false;
      const checkoutFields = requireDetailedAddress(data.checkoutFields);
      const normalizedContent = checkoutFields ? { ...data, checkoutFields } : data;
      setContent(normalizedContent);

      if (addressFieldWasOptional && checkoutFields) {
        try {
          const updated = await websiteApi.updateContent({ checkoutFields });
          setContent({ ...normalizedContent, ...updated, checkoutFields });
          showToast('تم جعل حقل العنوان بالتفصيل إلزاميًا في نموذج الطلب.', 'success');
        } catch {
          showToast('تعذر حفظ إلزامية العنوان تلقائيًا. اضغط حفظ التعديلات لإعادة المحاولة.', 'error');
        }
      }
    } catch (err: any) {
      showToast('تعذر تحميل بيانات الموقع: ' + (err.message || 'خطأ غير معروف'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSave = async () => {
    if (!content) return;
    try {
      setSaving(true);
      const checkoutFields = requireDetailedAddress(content.checkoutFields);
      const normalizedContent = checkoutFields ? { ...content, checkoutFields } : content;
      const updated = await websiteApi.updateContent(normalizedContent);
      setContent({ ...normalizedContent, ...updated, ...(checkoutFields ? { checkoutFields } : {}) });
      showToast('تم حفظ جميع التعديلات بنجاح وستظهر مباشرة في الموقع!', 'success');
    } catch (err: any) {
      showToast('حدث خطأ أثناء الحفظ: ' + (err.message || 'خطأ غير متوقع'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmation = await Swal.fire({
      title: 'استعادة الإعدادات الافتراضية؟',
      text: 'سيتم التراجع عن جميع التعديلات اليدوية على محتوى الموقع.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'استعادة',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;
    try {
      setResetting(true);
      const reset = await websiteApi.resetContent();
      const addressFieldWasOptional = reset.checkoutFields?.some(
        (field) => isDetailedAddressField(field) && field.required !== true,
      ) || false;
      const checkoutFields = requireDetailedAddress(reset.checkoutFields);
      const normalizedReset = checkoutFields ? { ...reset, checkoutFields } : reset;
      setContent(normalizedReset);
      if (addressFieldWasOptional && checkoutFields) {
        const updated = await websiteApi.updateContent({ checkoutFields });
        setContent({ ...normalizedReset, ...updated, checkoutFields });
      }
      showToast('تم استعادة النصوص الافتراضية بنجاح.', 'success');
    } catch (err: any) {
      showToast('تعذر استعادة النصوص: ' + err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  // Helper mutators
  const updateField = (field: keyof WebsiteContent, val: any) => {
    if (!content) return;
    setContent({ ...content, [field]: val });
  };

  const updateNested = (parent: keyof WebsiteContent, child: string, val: any) => {
    if (!content) return;
    setContent({
      ...content,
      [parent]: {
        ...(content[parent] as any),
        [child]: val,
      },
    });
  };

  const updateCheckoutField = (index: number, key: string, val: any) => {
    if (!content) return;
    const list = [...(content.checkoutFields || [])];
    if (list[index]) {
      const updatedField = { ...list[index], [key]: val };
      if (isDetailedAddressField(updatedField)) updatedField.required = true;
      list[index] = updatedField;
      setContent({ ...content, checkoutFields: list });
    }
  };

  const updatePaymentMethod = (index: number, key: string, val: any) => {
    if (!content) return;
    const list = [...(content.paymentMethods || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: val };
      setContent({ ...content, paymentMethods: list });
    }
  };

  if (loading || !content) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={36} className="spin" style={{ color: '#0f766e' }} />
        <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>جاري جلب إعدادات ومحتوى الموقع...</span>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'branding', label: 'الهوية والتواصل', icon: Globe },
    { id: 'hero', label: 'القسم الرئيسي (Hero)', icon: Layout },
    { id: 'video', label: 'الفيديو والعرض', icon: Video },
    { id: 'features', label: 'المميزات (Features)', icon: Sparkles },
    { id: 'useCases', label: 'مجالات الاستخدام', icon: List },
    { id: 'cta', label: 'شريط الحث (CTA)', icon: Compass },
    { id: 'about', label: 'صفحة من نحن', icon: Info },
    { id: 'how', label: 'صفحة كيف تعمل', icon: HelpCircle },
    { id: 'checkout', label: 'نموذج الطلب والدفع', icon: CheckSquare },
    { id: 'footer', label: 'تذييل الموقع (Footer)', icon: PhoneCall },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'linear-gradient(135deg, #042f2e 0%, #115e59 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px -10px rgba(15, 118, 110, 0.4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={28} style={{ color: '#5eead4' }} />
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              التحكم الشامل في محتوى الموقع (CMS)
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.92rem', opacity: 0.9, color: '#ccfbf1' }}>
            تحكم في كل حرف ونصوص الموقع، الأزرار، البانرات، خطوات الشرح، ومعلومات التواصل مباشرة ولحظياً.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting || saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: resetting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RotateCcw size={16} />
            {resetting ? 'جاري الاستعادة...' : 'استعادة الافتراضي'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || resetting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '12px',
              border: 'none',
              background: '#2dd4bf',
              color: '#042f2e',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(45, 212, 191, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? '#0f766e' : '#f8fafc',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        {/* ── 1. Branding & Contact ── */}
        {activeTab === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              الهوية الأساسية، الإعلان العلوي والتواصل
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  اسم العلامة التجارية (Brand Name)
                </label>
                <input
                  type="text"
                  value={content.brandName}
                  onChange={(e) => updateField('brandName', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  الشعار اللفظي (Tagline)
                </label>
                <input
                  type="text"
                  value={content.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            {/* Announcement bar */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  شريط الإعلان العلوي للموقع (Announcement Top Bar)
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={content.announcement?.enabled ?? true}
                    onChange={(e) => updateNested('announcement', 'enabled', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0f766e' }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>تفعيل الشريط</span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    نص الإعلان
                  </label>
                  <input
                    type="text"
                    value={content.announcement?.text || ''}
                    onChange={(e) => updateNested('announcement', 'text', e.target.value)}
                    placeholder="مثال: شحن سريع واختيار مجاني لألوان الكوستر!"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    رابط الإعلان (اختياري)
                  </label>
                  <input
                    type="text"
                    value={content.announcement?.link || ''}
                    onChange={(e) => updateNested('announcement', 'link', e.target.value)}
                    placeholder="product.html?id=sticker"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Contact details */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '10px 0 0' }}>
              معلومات الاتصال والواتساب
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  رقم الواتساب للطلبات (WhatsApp)
                </label>
                <input
                  type="text"
                  value={content.contact?.whatsappNumber || ''}
                  onChange={(e) => updateNested('contact', 'whatsappNumber', e.target.value)}
                  placeholder="201098277229"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>يكتب بالصيغة الدولية بدون + (مثل: 201098277229)</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  رقم الهاتف (للعرض)
                </label>
                <input
                  type="text"
                  value={content.contact?.phone || ''}
                  onChange={(e) => updateNested('contact', 'phone', e.target.value)}
                  placeholder="+201098277229"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={content.contact?.email || ''}
                  onChange={(e) => updateNested('contact', 'email', e.target.value)}
                  placeholder="contact@k2rty.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  العنوان / المقر
                </label>
                <input
                  type="text"
                  value={content.contact?.address || ''}
                  onChange={(e) => updateNested('contact', 'address', e.target.value)}
                  placeholder="القاهرة، مصر"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            {/* Social media links */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '10px 0 0' }}>
              روابط السوشيال ميديا
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Instagram
                </label>
                <input
                  type="text"
                  value={content.contact?.instagramUrl || ''}
                  onChange={(e) => updateNested('contact', 'instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Facebook
                </label>
                <input
                  type="text"
                  value={content.contact?.facebookUrl || ''}
                  onChange={(e) => updateNested('contact', 'facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  TikTok
                </label>
                <input
                  type="text"
                  value={content.contact?.tiktokUrl || ''}
                  onChange={(e) => updateNested('contact', 'tiktokUrl', e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={content.contact?.linkedinUrl || ''}
                  onChange={(e) => updateNested('contact', 'linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 2. Hero Section ── */}
        {activeTab === 'hero' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              القسم الرئيسي الترحيبي (Hero Section)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  العنوان الصغير العلوي (Eyebrow Tag)
                </label>
                <input
                  type="text"
                  value={content.hero?.eyebrow || ''}
                  onChange={(e) => updateNested('hero', 'eyebrow', e.target.value)}
                  placeholder="YOUR WORLD IN ONE TAP"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    صورة المنتج الرئيسية (Hero Image URL)
                  </label>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#f0fdfa',
                      color: '#0f766e',
                      border: '1px solid #ccfbf1',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={13} />
                    {uploadingField === 'heroImage' ? 'جاري الرفع...' : 'رفع صورة'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingField === 'heroImage'}
                      onChange={(e) => handleUploadMedia(e, (url) => updateNested('hero', 'heroImage', url), 'heroImage')}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={content.hero?.heroImage || ''}
                  onChange={(e) => updateNested('hero', 'heroImage', e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                العنوان الرئيسي الكبير (Title)
              </label>
              <textarea
                rows={2}
                value={content.hero?.title || ''}
                onChange={(e) => updateNested('hero', 'title', e.target.value)}
                placeholder="عالمك كله\nفي لمسة واحدة."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                الوصف التوضيحي (Subtitle / Description)
              </label>
              <textarea
                rows={3}
                value={content.hero?.subtitle || ''}
                onChange={(e) => updateNested('hero', 'subtitle', e.target.value)}
                placeholder="كوستر K2rty الذكي يجمع NFC وQR في تصميم واحد..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', fontFamily: 'inherit' }}
              />
            </div>

            {/* CTA Buttons */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 0' }}>
              أزرار الحث على الشراء (Call To Action Buttons)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  نص الزر الأساسي (Primary CTA)
                </label>
                <input
                  type="text"
                  value={content.hero?.ctaPrimaryText || ''}
                  onChange={(e) => updateNested('hero', 'ctaPrimaryText', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  رابط الزر الأساسي
                </label>
                <input
                  type="text"
                  value={content.hero?.ctaPrimaryLink || ''}
                  onChange={(e) => updateNested('hero', 'ctaPrimaryLink', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  نص الزر الثانوي (Secondary CTA)
                </label>
                <input
                  type="text"
                  value={content.hero?.ctaSecondaryText || ''}
                  onChange={(e) => updateNested('hero', 'ctaSecondaryText', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  رابط الزر الثانوي
                </label>
                <input
                  type="text"
                  value={content.hero?.ctaSecondaryLink || ''}
                  onChange={(e) => updateNested('hero', 'ctaSecondaryLink', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Badges */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 0' }}>
              بطاقات الملاحظات السفلية في الـ Hero
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  نص السعر الرئيسي
                </label>
                <input
                  type="text"
                  value={content.hero?.badgePrice || ''}
                  onChange={(e) => updateNested('hero', 'badgePrice', e.target.value)}
                  placeholder="650 جنيه"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  نص توضيح السعر
                </label>
                <input
                  type="text"
                  value={content.hero?.badgePriceSub || ''}
                  onChange={(e) => updateNested('hero', 'badgePriceSub', e.target.value)}
                  placeholder="شامل اختيار اللون"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  نص التقنية الرئيسي
                </label>
                <input
                  type="text"
                  value={content.hero?.badgeTech || ''}
                  onChange={(e) => updateNested('hero', 'badgeTech', e.target.value)}
                  placeholder="Scan · Connect · Support"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  نص توضيح التقنية
                </label>
                <input
                  type="text"
                  value={content.hero?.badgeTechSub || ''}
                  onChange={(e) => updateNested('hero', 'badgeTechSub', e.target.value)}
                  placeholder="NFC وQR معًا"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 3. Video Section ── */}
        {activeTab === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                قسم الفيديو التجريبي (Video Showcase)
              </h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={content.video?.enabled ?? true}
                  onChange={(e) => updateNested('video', 'enabled', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#0f766e' }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>تفعيل قسم الفيديو</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  عنوان قسم الفيديو
                </label>
                <input
                  type="text"
                  value={content.video?.title || ''}
                  onChange={(e) => updateNested('video', 'title', e.target.value)}
                  placeholder="شاهد كيف يعمل K2rty"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  النص التوضيحي للفيديو
                </label>
                <input
                  type="text"
                  value={content.video?.subtitle || ''}
                  onChange={(e) => updateNested('video', 'subtitle', e.target.value)}
                  placeholder="كوستر ذكي يجمع NFC وQR في تصميم واحد..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  مسار / رابط ملف الفيديو (Video URL or Path)
                </label>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#f0fdfa',
                    color: '#0f766e',
                    border: '1px solid #ccfbf1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={13} />
                  {uploadingField === 'videoUrl' ? 'جاري رفع الفيديو...' : 'رفع فيديو إلى السحابة'}
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    disabled={uploadingField === 'videoUrl'}
                    onChange={(e) => handleUploadMedia(e, (url) => updateNested('video', 'videoUrl', url), 'videoUrl')}
                  />
                </label>
              </div>
              <input
                type="text"
                value={content.video?.videoUrl || ''}
                onChange={(e) => updateNested('video', 'videoUrl', e.target.value)}
                placeholder="https://res.cloudinary.com/.../video.mp4"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                النص التوضيحي أسفل الفيديو (Caption)
              </label>
              <input
                type="text"
                value={content.video?.caption || ''}
                onChange={(e) => updateNested('video', 'caption', e.target.value)}
                placeholder="قرّب الهاتف — صفحتك تفتح فوراً بدون تطبيق"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>
          </div>
        )}

        {/* ── 4. Features Section ── */}
        {activeTab === 'features' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              قسم المميزات (لماذا K2rty؟)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  عنوان القسم
                </label>
                <input
                  type="text"
                  value={content.featuresTitle}
                  onChange={(e) => updateField('featuresTitle', e.target.value)}
                  placeholder="لماذا K2rty؟"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  الوصف الفرعي للقسم
                </label>
                <input
                  type="text"
                  value={content.featuresSubtitle}
                  onChange={(e) => updateField('featuresSubtitle', e.target.value)}
                  placeholder="كوستر واحد يجمع كل ما تحتاجه في تصميم أنيق."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>قائمة كروت المميزات</span>
              <button
                type="button"
                onClick={() => {
                  const newFeatures = [
                    ...(content.features || []),
                    {
                      id: String(Date.now()),
                      icon: 'zap',
                      title: 'ميزة جديدة',
                      description: 'تفاصيل الميزة الرائعة وكيف تساعد عميلك.',
                    },
                  ];
                  updateField('features', newFeatures);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #0f766e',
                  background: '#f0fdfa',
                  color: '#0f766e',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} /> إضافة ميزة
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {content.features?.map((feat, idx) => (
                <div
                  key={feat.id || idx}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = content.features.filter((_, i) => i !== idx);
                      updateField('features', filtered);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px',
                      cursor: 'pointer',
                    }}
                    title="حذف الميزة"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                      عنوان الميزة
                    </label>
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => {
                        const updated = [...content.features];
                        updated[idx].title = e.target.value;
                        updateField('features', updated);
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                      الوصف
                    </label>
                    <textarea
                      rows={2}
                      value={feat.description}
                      onChange={(e) => {
                        const updated = [...content.features];
                        updated[idx].description = e.target.value;
                        updateField('features', updated);
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Use Cases ── */}
        {activeTab === 'useCases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              مجالات الاستخدام (لشغلك. لمحلك. لنفسك.)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  عنوان القسم
                </label>
                <input
                  type="text"
                  value={content.useCasesTitle}
                  onChange={(e) => updateField('useCasesTitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  الوصف الفرعي
                </label>
                <input
                  type="text"
                  value={content.useCasesSubtitle}
                  onChange={(e) => updateField('useCasesSubtitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>كروت الاستخدام</span>
              <button
                type="button"
                onClick={() => {
                  const newUses = [
                    ...(content.useCases || []),
                    {
                      id: String(Date.now()),
                      title: 'استخدام جديد',
                      description: 'شرح مبسط كيف يستفيد هذا القطاع من الكوستر الذكي.',
                    },
                  ];
                  updateField('useCases', newUses);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #0f766e',
                  background: '#f0fdfa',
                  color: '#0f766e',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} /> إضافة كارت
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {content.useCases?.map((useCase, idx) => (
                <div
                  key={useCase.id || idx}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = content.useCases.filter((_, i) => i !== idx);
                      updateField('useCases', filtered);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px',
                      cursor: 'pointer',
                    }}
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                      عنوان الكارت
                    </label>
                    <input
                      type="text"
                      value={useCase.title}
                      onChange={(e) => {
                        const updated = [...content.useCases];
                        updated[idx].title = e.target.value;
                        updateField('useCases', updated);
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                      الوصف
                    </label>
                    <textarea
                      rows={2}
                      value={useCase.description}
                      onChange={(e) => {
                        const updated = [...content.useCases];
                        updated[idx].description = e.target.value;
                        updateField('useCases', updated);
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. CTA Band ── */}
        {activeTab === 'cta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              شريط الحث على الشراء قبل الفوتر (CTA Band)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  العنوان
                </label>
                <input
                  type="text"
                  value={content.ctaBandTitle}
                  onChange={(e) => updateField('ctaBandTitle', e.target.value)}
                  placeholder="جاهز تخلي أول انطباع أذكى؟"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  النص التوضيحي
                </label>
                <input
                  type="text"
                  value={content.ctaBandSubtitle}
                  onChange={(e) => updateField('ctaBandSubtitle', e.target.value)}
                  placeholder="كوستر واحد. ثلاث ألوان. وتقنية تشتغل من أول لمسة."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  نص الزر
                </label>
                <input
                  type="text"
                  value={content.ctaBandButtonText}
                  onChange={(e) => updateField('ctaBandButtonText', e.target.value)}
                  placeholder="اطلب K2rty"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  رابط الزر
                </label>
                <input
                  type="text"
                  value={content.ctaBandButtonLink}
                  onChange={(e) => updateField('ctaBandButtonLink', e.target.value)}
                  placeholder="product.html?id=sticker"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 7. About Page ── */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              محتوى صفحة من نحن (about.html)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  العنوان الصغير (Eyebrow)
                </label>
                <input
                  type="text"
                  value={content.aboutEyebrow}
                  onChange={(e) => updateField('aboutEyebrow', e.target.value)}
                  placeholder="BETTER TOGETHER"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    صورة الصفحة (Image URL)
                  </label>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#f0fdfa',
                      color: '#0f766e',
                      border: '1px solid #ccfbf1',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={13} />
                    {uploadingField === 'aboutImage' ? 'جاري الرفع...' : 'رفع صورة'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingField === 'aboutImage'}
                      onChange={(e) => handleUploadMedia(e, (url) => updateField('aboutImage', url), 'aboutImage')}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={content.aboutImage}
                  onChange={(e) => updateField('aboutImage', e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                العنوان الرئيسي
              </label>
              <input
                type="text"
                value={content.aboutTitle}
                onChange={(e) => updateField('aboutTitle', e.target.value)}
                placeholder="نحوّل اللمسة إلى علاقة."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                الوصف التمهيدي
              </label>
              <textarea
                rows={2}
                value={content.aboutSubtitle}
                onChange={(e) => updateField('aboutSubtitle', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', fontFamily: 'inherit' }}
              />
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 0' }}>
              القصة والتفاصيل
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                عنوان الفقرة
              </label>
              <input
                type="text"
                value={content.aboutStoryTitle}
                onChange={(e) => updateField('aboutStoryTitle', e.target.value)}
                placeholder="تقنية بسيطة. أثر واضح."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                نص الفقرة التفصيلية
              </label>
              <textarea
                rows={2}
                value={content.aboutStoryLead}
                onChange={(e) => updateField('aboutStoryLead', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  نقاط التميز (Bullets)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const bullets = [...(content.aboutStoryBullets || []), 'نقطة تميز جديدة'];
                    updateField('aboutStoryBullets', bullets);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #0f766e',
                    background: '#f0fdfa',
                    color: '#0f766e',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} /> إضافة نقطة
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {content.aboutStoryBullets?.map((bullet, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#0f766e', fontWeight: 800 }}>✓</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => {
                        const copy = [...content.aboutStoryBullets];
                        copy[idx] = e.target.value;
                        updateField('aboutStoryBullets', copy);
                      }}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = content.aboutStoryBullets.filter((_, i) => i !== idx);
                        updateField('aboutStoryBullets', copy);
                      }}
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 8. How It Works Page ── */}
        {activeTab === 'how' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              محتوى صفحة كيف تعمل (how-it-works.html)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  العنوان الصغير (Eyebrow)
                </label>
                <input
                  type="text"
                  value={content.howEyebrow}
                  onChange={(e) => updateField('howEyebrow', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  العنوان الرئيسي
                </label>
                <input
                  type="text"
                  value={content.howTitle}
                  onChange={(e) => updateField('howTitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                الوصف التمهيدي
              </label>
              <textarea
                rows={2}
                value={content.howSubtitle}
                onChange={(e) => updateField('howSubtitle', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', fontFamily: 'inherit' }}
              />
            </div>

            {/* NFC Steps */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f766e', margin: '8px 0 0' }}>
              خطوات استخدام الـ NFC (3 خطوات)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
              {content.howNfcSteps?.map((step, idx) => (
                <div key={idx} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #ccfbf1', background: '#f0fdfa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '1.1rem' }}>خطوة {step.num || `0${idx + 1}`}</div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const copy = [...content.howNfcSteps];
                      copy[idx].title = e.target.value;
                      updateField('howNfcSteps', copy);
                    }}
                    placeholder="عنوان الخطوة"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => {
                      const copy = [...content.howNfcSteps];
                      copy[idx].description = e.target.value;
                      updateField('howNfcSteps', copy);
                    }}
                    placeholder="شرح الخطوة"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
            </div>

            {/* QR Steps */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 0' }}>
              خطوات استخدام الـ QR (3 خطوات)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
              {content.howQrSteps?.map((step, idx) => (
                <div key={idx} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#334155', fontSize: '1.1rem' }}>خطوة {step.num || `0${idx + 1}`}</div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const copy = [...content.howQrSteps];
                      copy[idx].title = e.target.value;
                      updateField('howQrSteps', copy);
                    }}
                    placeholder="عنوان الخطوة"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => {
                      const copy = [...content.howQrSteps];
                      copy[idx].description = e.target.value;
                      updateField('howQrSteps', copy);
                    }}
                    placeholder="شرح الخطوة"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 9. Checkout & Payment Form ── */}
        {activeTab === 'checkout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                إعدادات نموذج الطلب والتحقق (Checkout Form & Validation)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                تحكم في الحقول المطلوبة من العميل في صفحة إتمام الطلب، ونصوص رسائل الخطأ التي تظهر في تنبيهات SweetAlert (Swal).
              </p>
            </div>

            {/* Dynamic Checkout Fields List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                حقول إدخال البيانات ورسائل التحقق (Swal Error Messages)
              </h3>

              {(content.checkoutFields || []).map((field, idx) => {
                const addressField = isDetailedAddressField(field);
                return (
                <div
                  key={field.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                        الحقل: {field.label}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        id: {field.id}
                      </span>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: addressField ? 'not-allowed' : 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={addressField || (field.required ?? true)}
                        disabled={addressField}
                        onChange={(e) => updateCheckoutField(idx, 'required', e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#0f766e' }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: addressField || field.required ? '#0f766e' : '#64748b' }}>
                        {addressField || field.required ? 'حقل إلزامي *' : 'حقل اختياري'}
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        عنوان الحقل (Label)
                      </label>
                      <input
                        type="text"
                        value={field.label || ''}
                        onChange={(e) => updateCheckoutField(idx, 'label', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        النص التوضيحي (Placeholder)
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateCheckoutField(idx, 'placeholder', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        أقل عدد أحرف (Min Length)
                      </label>
                      <input
                        type="number"
                        value={field.minLength ?? 0}
                        onChange={(e) => updateCheckoutField(idx, 'minLength', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', marginBottom: '4px' }}>
                      رسالة التنبيه (SweetAlert / Swal Error Message) عند ترك الحقل أو إدخال بيانات خاطئة:
                    </label>
                    <input
                      type="text"
                      value={field.errorMessage || ''}
                      onChange={(e) => updateCheckoutField(idx, 'errorMessage', e.target.value)}
                      placeholder="رسالة الخطأ التي ستظهر للمستخدم في نافذة Swal..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff5f5', fontSize: '0.88rem', color: '#991b1b', fontWeight: 600 }}
                    />
                  </div>
                </div>
                );
              })}
            </div>

            {/* Payment Methods Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                طرق الدفع وأرقام المحافظ (Payment Methods & Wallets)
              </h3>

              {(content.paymentMethods || []).map((pm, idx) => (
                <div
                  key={pm.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                        {pm.label}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        id: {pm.id}
                      </span>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={pm.enabled ?? true}
                        onChange={(e) => updatePaymentMethod(idx, 'enabled', e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#0f766e' }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: pm.enabled ? '#15803d' : '#94a3b8' }}>
                        {pm.enabled ? 'مفعل بالموقع' : 'معطل'}
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        اسم وسيلة الدفع
                      </label>
                      <input
                        type="text"
                        value={pm.label || ''}
                        onChange={(e) => updatePaymentMethod(idx, 'label', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        رقم المحفظة / رقم التحويل (يظهر للعميل)
                      </label>
                      <input
                        type="text"
                        value={pm.walletNumber || ''}
                        onChange={(e) => updatePaymentMethod(idx, 'walletNumber', e.target.value)}
                        placeholder="201098277229"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', direction: 'ltr' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      وصف تعليمات التحويل
                    </label>
                    <input
                      type="text"
                      value={pm.description || ''}
                      onChange={(e) => updatePaymentMethod(idx, 'description', e.target.value)}
                      placeholder="تحويل فوري عبر إنستا باي أو المحفظة..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      checked={pm.requireReceipt ?? false}
                      onChange={(e) => updatePaymentMethod(idx, 'requireReceipt', e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#0f766e' }}
                    />
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                      إلزام العميل برفع صورة إيصال التحويل قبل تأكيد الطلب
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 10. Footer ── */}
        {activeTab === 'footer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              تذييل الموقع (Footer Settings)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  اسم الشعار في الفوتر
                </label>
                <input
                  type="text"
                  value={content.footerLogo}
                  onChange={(e) => updateField('footerLogo', e.target.value)}
                  placeholder="K2rty"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  الشعار النصي أسفل اللوجو
                </label>
                <input
                  type="text"
                  value={content.footerTagline}
                  onChange={(e) => updateField('footerTagline', e.target.value)}
                  placeholder="Your world in one tap."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  نص حقوق الملكية (Copyright)
                </label>
                <input
                  type="text"
                  value={content.footerCopyright}
                  onChange={(e) => updateField('footerCopyright', e.target.value)}
                  placeholder="© 2026 K2rty. جميع الحقوق محفوظة."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save button at bottom */}
      <div
        style={{
          position: 'sticky',
          bottom: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || resetting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            borderRadius: '14px',
            border: 'none',
            background: '#0f766e',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 24px rgba(15, 118, 110, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
          {saving ? 'جاري حفظ التعديلات...' : 'حفظ ونشر التعديلات في الموقع'}
        </button>
      </div>
    </div>
  );
};
