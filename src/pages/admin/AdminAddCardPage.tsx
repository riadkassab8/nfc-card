import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cardsApi, categoriesApi } from '../../services';
import { ApiCard, ApiCategory, ApiCreateCardDto, CARD_TYPES, CardType, BusinessData, getCategoryId, CUSTOM_SLUG_REGEX } from '../../types';
import Swal from 'sweetalert2';
import {
  ArrowRight, CreditCard, Plus, Building2, Globe, Phone, Mail,
  Instagram, Facebook, MapPin, MessageCircle, Video, Link as LinkIcon,
  Image, FileText, RefreshCw, Smartphone,
} from 'lucide-react';

/* ── Field config ─────────────────────────────────────────────── */
interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  type?: string;
  icon?: React.ReactNode;
  hint?: string;
  pattern?: string;
  gridFull?: boolean;
  options?: readonly string[];
}

const BIZ_FIELDS: FieldDef[] = [
  { key: 'business_name', label: 'اسم النشاط',    placeholder: 'مثال: Coffee House',              required: false, icon: <Building2 size={16} />,      hint: 'بحد أقصى 120 حرف' },
  { key: 'logo',          label: 'شعار (رابط)',   placeholder: 'https://cdn.example.com/logo.png', required: false, type: 'url', icon: <Image size={16} />,  hint: 'رابط مباشر للصورة (http/https)' },
  { key: 'description',   label: 'الوصف',         placeholder: 'وصف مختصر عن النشاط',             required: false, icon: <FileText size={16} />,       hint: 'بحد أقصى 500 حرف', gridFull: true },
  { key: 'phone',         label: 'رقم الهاتف',    placeholder: '+20100000000',                    required: false, type: 'tel', icon: <Phone size={16} /> },
  { key: 'email',         label: 'البريد الإلكتروني', placeholder: 'hello@example.com',            required: false, type: 'email', icon: <Mail size={16} /> },
  { key: 'whatsapp',      label: 'واتساب',        placeholder: 'https://wa.me/20100000000',       required: false, type: 'url', icon: <MessageCircle size={16} /> },
  { key: 'instagram',     label: 'انستجرام',      placeholder: 'https://instagram.com/name',      required: false, type: 'url', icon: <Instagram size={16} /> },
  { key: 'facebook',      label: 'فيسبوك',        placeholder: 'https://facebook.com/name',       required: false, type: 'url', icon: <Facebook size={16} /> },
  { key: 'tiktok',        label: 'تيك توك',       placeholder: 'https://tiktok.com/@name',        required: false, type: 'url', icon: <Video size={16} /> },
  { key: 'google_maps',   label: 'رابط تقييمات جوجل',    placeholder: 'https://g.page/r/.../review',  required: false, type: 'url', icon: <MapPin size={16} /> },
  { key: 'website',       label: 'الموقع الإلكتروني', placeholder: 'https://example.com',          required: false, type: 'url', icon: <Globe size={16} /> },
  { key: 'instapay',      label: 'رابط انستا باي',  placeholder: 'https://instapay.eg/name',       required: false, type: 'url', icon: <CreditCard size={16} /> },
  { key: 'vodafone_cash', label: 'رقم فودافون كاش', placeholder: '01000000000',                  required: false, type: 'tel', icon: <Smartphone size={16} /> },
];

import { parseCategoryMeta } from '../../types';

const getVisibleFields = (category: ApiCategory | null): FieldDef[] => {
  if (!category) return BIZ_FIELDS;

  const meta = parseCategoryMeta(category.description);
  
  // Backward compatibility: If it's a legacy category, use category name rules
  if (meta.isLegacy) {
    const type = (category.name || '').toLowerCase();
    
    if (type.includes('tiktok')) return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'tiktok'].includes(f.key));
    if (type.includes('instagram')) return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'instagram'].includes(f.key));
    if (type.includes('whatsapp')) return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'phone', 'whatsapp'].includes(f.key));
    if (type.includes('google map') || type.includes('google review')) {
      return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'google_maps'].includes(f.key));
    }
    if (type.includes('instapay')) return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'instapay'].includes(f.key));
    return BIZ_FIELDS;
  }

  // Use dynamic fields configuration
  return BIZ_FIELDS.filter(f => 
    ['business_name', 'logo', 'description'].includes(f.key) || meta.fields.includes(f.key)
  );
};

/* ── Component ────────────────────────────────────────────────── */
export const AdminAddCardPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading]       = useState(false);

  const location = useLocation();
  const editCard = location.state?.cardToEdit as ApiCard | undefined;

  /* Card state */
  const [cardCode, setCardCode]     = useState(editCard?.card_code || '');
  const [customSlug, setCustomSlug] = useState(editCard?.custom_slug || '');
  const [nfcUid, setNfcUid]         = useState(editCard?.nfc_uid || '');
  const [cardType, setCardType]     = useState<string>(editCard?.card_type || CardType.CARD);
  const [redirectUrl, setRedirectUrl] = useState(editCard?.current_redirect_url || '');
  const [categoryId, setCategoryId] = useState(getCategoryId(editCard?.category_id) || '');
  const [requiresSubscription, setRequiresSubscription] = useState<boolean>(
    editCard ? (editCard.requires_subscription ?? true) : true
  );

  /* Business data state */
  const [bizData, setBizData] = useState<Record<string, string>>({
    business_name: editCard?.business_data?.business_name || '',
    logo: editCard?.business_data?.logo || '',
    description: editCard?.business_data?.description || '',
    phone: editCard?.business_data?.phone || '',
    email: editCard?.business_data?.email || '',
    whatsapp: editCard?.business_data?.whatsapp || '',
    instagram: editCard?.business_data?.instagram || '',
    facebook: editCard?.business_data?.facebook || '',
    tiktok: editCard?.business_data?.tiktok || '',
    google_maps: editCard?.business_data?.google_maps || '',
    website: editCard?.business_data?.website || '',
    instapay: editCard?.business_data?.instapay || '',
    vodafone_cash: editCard?.business_data?.vodafone_cash || '',
  });

  //

  /* Auto-generate next card code */
  const [autoCode, setAutoCode] = useState(!editCard);

  /* Fetch full card details to ensure we have business_data (in case list endpoint omitted it) */
  useEffect(() => {
    if (editCard) {
      cardsApi.getCardById(editCard._id).then(fullCard => {
        setCardCode(fullCard.card_code || '');
        setCustomSlug(fullCard.custom_slug || '');
        setNfcUid(fullCard.nfc_uid || '');
        setCardType(fullCard.card_type || CardType.CARD);
        setRedirectUrl(fullCard.current_redirect_url || '');
        setCategoryId(getCategoryId(fullCard.category_id) || '');
        setRequiresSubscription(fullCard.requires_subscription ?? true);
        
        setBizData({
          business_name: fullCard.business_data?.business_name || '',
          logo: fullCard.business_data?.logo || '',
          description: fullCard.business_data?.description || '',
          phone: fullCard.business_data?.phone || '',
          email: fullCard.business_data?.email || '',
          whatsapp: fullCard.business_data?.whatsapp || '',
          instagram: fullCard.business_data?.instagram || '',
          facebook: fullCard.business_data?.facebook || '',
          tiktok: fullCard.business_data?.tiktok || '',
          google_maps: fullCard.business_data?.google_maps || '',
          website: fullCard.business_data?.website || '',
          instapay: fullCard.business_data?.instapay || '',
          vodafone_cash: fullCard.business_data?.vodafone_cash || '',
        });
      }).catch(console.error);
    }
  }, [editCard]);

  const loadData = useCallback(async () => {
    try {
      const [catRes, countRes] = await Promise.all([
        categoriesApi.getCategories({ limit: 100 }),
        cardsApi.getCards({ limit: 1 }),  // get total count first
      ]);
      setCategories(catRes.data ?? []);

      // Fetch all cards to find the true maximum code number
      const realTotal = countRes.total ?? 0;
      const safeLimit = Math.max(realTotal + 50, 200);
      const cardsRes = await cardsApi.getCards({ limit: safeLimit });

      // Auto-generate next card code
      const nums = (cardsRes.data ?? [])
        .map(c => { const m = c.card_code.match(/^CARD-(\d+)$/); return m ? parseInt(m[1]) : 0; })
        .filter(Boolean);
      const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
      const nextCode = `CARD-${String(next).padStart(4, '0')}`;
      const nextNfc  = `NFC-${String(next).padStart(6, '0')}`;
      const domainOrigin = window.location.origin.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, 'https://smart-card-qr-api.koyeb.app');
      
      if (autoCode && !editCard) {
        setCardCode(nextCode);
        setNfcUid(nextNfc);
        setRedirectUrl(`${domainOrigin}/r/${nextCode}`);
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: e?.message || 'فشل تحميل البيانات', confirmButtonColor: '#3b82f6' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* Update redirect URL dynamically based on selected category and input fields */
  /* Set initial auto-generated redirect URL */
  useEffect(() => {
    if (!cardCode) return;
    const domainOrigin = window.location.origin.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, 'https://smart-card-qr-api.koyeb.app');
    const defaultUrl = `${domainOrigin}/r/${cardCode}`;
    // Only set it if creating a new card, or if it's somehow empty during edit
    if (!editCard || redirectUrl === '') {
      setRedirectUrl(defaultUrl);
    }
  }, [cardCode, editCard]);

  const updateBiz = (key: string, val: string) => {
    setBizData(prev => ({ ...prev, [key]: val }));
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!cardCode.trim()) {
      Swal.fire({ icon: 'warning', title: 'حقل مطلوب', text: 'كود البطاقة مطلوب', confirmButtonColor: '#3b82f6' });
      return;
    }
    if (!/^CARD-\d{4,}$/.test(cardCode.trim())) {
      Swal.fire({ icon: 'warning', title: 'صيغة خاطئة', text: 'كود البطاقة يجب أن يكون بالصيغة CARD-XXXX مثل CARD-0001', confirmButtonColor: '#3b82f6' });
      return;
    }
    const trimmedSlug = customSlug.trim().toLowerCase();
    if (trimmedSlug && !CUSTOM_SLUG_REGEX.test(trimmedSlug)) {
      Swal.fire({
        icon: 'warning',
        title: 'صيغة خاطئة للرابط المخصص',
        text: 'الرابط المخصص يقبل فقط حروف إنجليزية صغيرة، أرقام، والشرطة (-) بدون مسافات أو رموز خاصة (مثال: dr-ahmed)',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }
    if (!redirectUrl.trim()) {
      Swal.fire({ icon: 'warning', title: 'حقل مطلوب', text: 'رابط التوجيه مطلوب', confirmButtonColor: '#3b82f6' });
      return;
    }
    if (!categoryId) {
      Swal.fire({ icon: 'warning', title: 'حقل مطلوب', text: 'يجب اختيار تصنيف', confirmButtonColor: '#3b82f6' });
      return;
    }

    // Build business_data (only non-empty values)
    const business: BusinessData = {};
    let hasBiz = false;
    for (const [k, v] of Object.entries(bizData)) {
      if (typeof v === 'string' && v.trim()) {
        (business as any)[k] = v.trim();
        hasBiz = true;
      }
    }

    let formattedUrl = redirectUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    // Localhost domains should not be overwritten; backend validation should be environment-aware instead.
    const baseDto = {
      card_type: cardType,
      current_redirect_url: formattedUrl,
      category_id: categoryId,
      requires_subscription: requiresSubscription,
    };

    setLoading(true);
    try {
      if (editCard) {
        // Update mode
        const updateDto: import('../../types').ApiUpdateCardDto = {
          ...baseDto,
          custom_slug: trimmedSlug || null,
        };
        updateDto.nfc_uid = nfcUid.trim() ? nfcUid.trim().toUpperCase() : '';
        updateDto.business_data = hasBiz ? business : null;

        const updated = await cardsApi.updateCard(editCard._id, updateDto);
        await Swal.fire({
          icon: 'success',
          title: 'تم تعديل البطاقة بنجاح!',
          text: `تم حفظ التعديلات للبطاقة ${updated.card_code}`,
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#3b82f6',
        });
        navigate('/admin/cards');
      } else {
        // Create mode
        const createDto: ApiCreateCardDto = {
          ...baseDto,
          card_code: cardCode.trim().toUpperCase(),
        };
        if (trimmedSlug) createDto.custom_slug = trimmedSlug;
        if (nfcUid.trim()) createDto.nfc_uid = nfcUid.trim().toUpperCase();
        if (hasBiz) createDto.business_data = business;

        const created = await cardsApi.createCard(createDto);
        await Swal.fire({
          icon: 'success',
          title: 'تم الإنشاء بنجاح! 🎉',
          html: `
            <div style="text-align:right;direction:rtl;font-family:Tajawal,sans-serif">
              <p style="margin:8px 0;font-size:15px">البطاقة <strong style="color:#3b82f6">${created.card_code}</strong> جاهزة تماماً</p>
              ${created.custom_slug ? `<p style="margin:4px 0;font-size:13px;color:#16a34a">الرابط المخصص: <strong>/social/${created.custom_slug}</strong></p>` : ''}
              <p style="margin:4px 0;font-size:13px;color:#64748b">النوع: ${created.card_type}</p>
              <div style="margin-top:14px;text-align:center">
                <a href="/social/${created.custom_slug || created.card_code}" target="_blank" style="display:inline-block;padding:9px 18px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
                  🚀 فتح صفحة الأزرار التفاعلية
                </a>
              </div>
            </div>
          `,
          confirmButtonText: 'عرض البطاقات',
          confirmButtonColor: '#3b82f6',
          showCancelButton: true,
          cancelButtonText: 'إضافة بطاقة أخرى',
          cancelButtonColor: '#64748b',
        }).then((result: import('sweetalert2').SweetAlertResult) => {
          if (result.isConfirmed) {
            navigate('/admin/cards');
          } else {
            // Reset form for another card
            setAutoCode(true);
            setCustomSlug('');
            setNfcUid('');
            setBizData({
              business_name: '', logo: '', description: '', phone: '',
              email: '', whatsapp: '', instagram: '', facebook: '',
              tiktok: '', google_maps: '', website: '',
            });
            loadData();
          }
        });
      }
    } catch (e: any) {
      let errMsg = e?.message || 'حدث خطأ أثناء حفظ البطاقة';
      if (e?.statusCode === 409 || /already taken/i.test(errMsg) || /custom slug.*already taken/i.test(errMsg)) {
        errMsg = 'هذا الرابط المخصص محجوز بالفعل، يرجى اختيار اسم آخر';
      } else if (errMsg.includes('500') || errMsg.includes('Internal server error')) {
        errMsg = 'معرف NFC أو كود البطاقة مستخدم ومكرر بالفعل في بطاقة أخرى. يرجى تغيير معرف NFC (أو ترك الحقل فارغاً).';
      }
      Swal.fire({
        icon: 'error',
        title: 'فشل العملية',
        text: errMsg,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !!(
    cardCode.trim() &&
    /^CARD-\d{4,}$/.test(cardCode.trim()) &&
    redirectUrl.trim() &&
    categoryId 
  );


  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font)', maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate('/admin/cards')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: 'var(--r-md)',
            border: '1.5px solid var(--bdr-light)', backgroundColor: 'var(--bg-white)',
            cursor: 'pointer', color: 'var(--txt-secondary)', flexShrink: 0,
          }}
        >
          <ArrowRight size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--txt-heading)' }}>
            {editCard ? `تعديل البطاقة ${editCard.card_code}` : 'إضافة بطاقة جديدة'}
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--txt-muted)' }}>
            {editCard ? 'قم بتحديث بيانات البطاقة والنشاط التجاري' : 'أدخل جميع بيانات البطاقة والنشاط التجاري'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ══════ Card Info Section ══════ */}
        <div style={{
          background: 'var(--bg-white)', border: '1px solid var(--bdr-light)',
          borderRadius: 'var(--r-xl)', padding: '24px', marginBottom: '18px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--r-md)',
              backgroundColor: 'var(--clr-primary-50)', color: 'var(--clr-primary-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CreditCard size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 800, color: 'var(--txt-heading)' }}>
                بيانات البطاقة
              </h2>
              <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>الحقول المطلوبة محددة بـ *</p>
            </div>
          </div>

          <div className="form-grid">
            {/* Card Code */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} style={{ color: 'var(--clr-primary-500)' }} />
                  كود البطاقة <span style={{ color: 'var(--clr-error)' }}>*</span>
                </span>
              </label>
              <input
                className="form-input"
                value={cardCode}
                onChange={e => { setCardCode(e.target.value); setAutoCode(false); }}
                placeholder="CARD-0001"
                required
              />
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>صيغة: CARD-XXXX</span>
            </div>

            {/* NFC UID */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} style={{ color: 'var(--txt-muted)' }} />
                  معرف NFC
                </span>
              </label>
              <input
                className="form-input"
                value={nfcUid}
                onChange={e => setNfcUid(e.target.value)}
                placeholder="NFC-7FJ2K9"
              />
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>صيغة: NFC-XXXXXX (اختياري)</span>
            </div>

            {/* Custom Slug */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} style={{ color: 'var(--clr-primary-500)' }} />
                  الرابط المخصص (Custom Slug) <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)', fontWeight: 400 }}>(اختياري)</span>
                </span>
              </label>
              <input
                className="form-input"
                dir="ltr"
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value.toLowerCase())}
                placeholder="dr-ahmed"
              />
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>مثال: dr-ahmed أو my-company (حروف صغيرة، أرقام، وشرطة فقط)</span>
            </div>

            {/* Card Type */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} style={{ color: 'var(--clr-primary-500)' }} />
                  نوع البطاقة <span style={{ color: 'var(--clr-error)' }}>*</span>
                </span>
              </label>
              <select
                className="form-input"
                value={cardType}
                onChange={e => setCardType(e.target.value)}
                required
              >
                {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} style={{ color: 'var(--clr-primary-500)' }} />
                  التصنيف <span style={{ color: 'var(--clr-error)' }}>*</span>
                </span>
              </label>
              <select
                className="form-input"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
              >
                <option value="">— اختر تصنيف —</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {/* Requires Subscription */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} style={{ color: 'var(--clr-primary-500)' }} />
                  نوع الاشتراك
                </span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 14px', borderRadius: 'var(--r-md)', border: `2px solid ${requiresSubscription ? 'var(--clr-primary-400)' : 'var(--bdr-light)'}`, backgroundColor: requiresSubscription ? 'var(--clr-primary-50)' : 'var(--bg-subtle)', flex: 1, transition: 'all 140ms' }}>
                  <input type="radio" checked={requiresSubscription} onChange={() => setRequiresSubscription(true)} style={{ accentColor: 'var(--clr-primary-500)' }} />
                  <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: requiresSubscription ? 'var(--clr-primary-700)' : 'var(--txt-secondary)' }}>باشتراك</span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>ينتهي بتاريخ</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 14px', borderRadius: 'var(--r-md)', border: `2px solid ${!requiresSubscription ? '#16a34a' : 'var(--bdr-light)'}`, backgroundColor: !requiresSubscription ? '#f0fdf4' : 'var(--bg-subtle)', flex: 1, transition: 'all 140ms' }}>
                  <input type="radio" checked={!requiresSubscription} onChange={() => setRequiresSubscription(false)} style={{ accentColor: '#16a34a' }} />
                  <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: !requiresSubscription ? '#15803d' : 'var(--txt-secondary)' }}>دائم ♾</span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>بدون انتهاء</span>
                </label>
              </div>
            </div>

            {/* Redirect URL */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LinkIcon size={14} style={{ color: 'var(--clr-primary-500)' }} />
                  رابط التوجيه <span style={{ color: 'var(--clr-error)' }}>*</span>
                </span>
              </label>
              <input
                className="form-input"
                type="url"
                value={redirectUrl}
                onChange={e => setRedirectUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>الرابط الذي يُفتح عند مسح البطاقة</span>
            </div>
          </div>
        </div>

        {/* ══════ Business Data Section ══════ */}
        <div style={{
          background: 'var(--bg-white)', border: '1px solid var(--bdr-light)',
          borderRadius: 'var(--r-xl)', padding: '24px', marginBottom: '18px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--r-md)',
              backgroundColor: '#f0fdf4', color: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 800, color: 'var(--txt-heading)' }}>
                بيانات النشاط التجاري
              </h2>
              <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>جميع الحقول اختيارية</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--clr-info-bg)', borderRadius: 'var(--r-md)',
            padding: '10px 14px', border: '1px solid var(--clr-info-bdr)',
            marginBottom: '18px', fontSize: 'var(--fs-sm)', color: 'var(--clr-info)',
          }}>
            💡 هذه البيانات تظهر في صفحة التواصل الاجتماعي الخاصة بالبطاقة
          </div>

          <div className="form-grid">
            {getVisibleFields(categories.find(c => c._id === categoryId) || null).map(f => (
              <div key={f.key} className="form-group" style={f.gridFull ? { gridColumn: '1 / -1' } : undefined}>
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {React.cloneElement(f.icon as React.ReactElement, { style: { color: 'var(--txt-muted)' } })}
                    {f.label}
                  </span>
                </label>
                {f.key === 'description' ? (
                  <textarea
                    className="form-input"
                    value={bizData[f.key] || ''}
                    onChange={e => updateBiz(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    maxLength={500}
                    style={{ resize: 'vertical', minHeight: '70px' }}
                  />
                ) : (
                  <input
                    className="form-input"
                    type={f.type || 'text'}
                    value={bizData[f.key] || ''}
                    onChange={e => updateBiz(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    maxLength={f.key === 'business_name' ? 120 : undefined}
                  />
                )}
                {f.hint && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>{f.hint}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ══════ Submit ══════ */}
        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'flex-end',
          padding: '16px 0', borderTop: '1px solid var(--bdr-light)',
        }}>
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate('/admin/cards')}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !isFormValid}
            style={{ minWidth: '160px', justifyContent: 'center' }}
          >
            {loading
              ? <><RefreshCw size={16} className="spin" /> {editCard ? 'جاري الحفظ...' : 'جاري الإنشاء...'}</>
              : <><Plus size={16} /> {editCard ? 'إتمام التعديل' : 'إنشاء البطاقة'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddCardPage;
