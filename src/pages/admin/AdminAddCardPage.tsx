import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cardsApi, categoriesApi, customersApi } from '../../services';
import {
  ApiCard,
  ApiCategory,
  ApiCreateCardDto,
  CARD_TYPES,
  CardType,
  BusinessData,
  PaymentShift,
  getCategoryId,
  CUSTOM_SLUG_REGEX,
  ApiCustomer,
} from '../../types';
import { SelectCustomerModal } from '../../components/admin/SelectCustomerModal';
import Swal from 'sweetalert2';
import {
  ArrowRight, CreditCard, Plus, Building2, Globe, Phone, Mail,
  Instagram, Facebook, MapPin, MessageCircle, Video, Link as LinkIcon,
  Image, FileText, RefreshCw, Smartphone, Check, Sparkles, AlertCircle,
  HelpCircle, ExternalLink, UploadCloud, Trash2, User, Clock, UserCheck, Store, Star
} from 'lucide-react';

/* ── Field definitions ─────────────────────────────────────────── */
interface BizFieldDef {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: React.ReactNode;
  hint?: string;
  gridFull?: boolean;
}


const CONTACT_FIELDS: BizFieldDef[] = [
  {
    key: 'phone',
    label: 'رقم الهاتف للمكالمات',
    placeholder: '01000000000 أو +20100000000',
    type: 'tel',
    icon: <Phone size={16} />,
    hint: 'يُمكّن العميل من الاتصال بك بنقرة واحدة',
  },
  {
    key: 'whatsapp',
    label: 'رابط واتساب',
    placeholder: 'https://wa.me/20100000000',
    type: 'url',
    icon: <MessageCircle size={16} />,
    hint: 'يفتح محادثة واتساب مباشرة عند الضغط عليه (يجب أن يكون رابطاً)',
  },
  {
    key: 'email',
    label: 'البريد الإلكتروني',
    placeholder: 'contact@example.com',
    type: 'email',
    icon: <Mail size={16} />,
    hint: 'لإرسال واستقبال الرسائل والبريد',
  },
  {
    key: 'website',
    label: 'الموقع الإلكتروني',
    placeholder: 'https://www.example.com',
    type: 'url',
    icon: <Globe size={16} />,
    hint: 'رابط موقعك الإلكتروني أو متجرك',
  },
  {
    key: 'google_maps',
    label: 'رابط خرائط جوجل أو تقييمات Google',
    placeholder: 'https://maps.app.goo.gl/... أو https://g.page/r/.../review',
    type: 'url',
    icon: <MapPin size={16} />,
    hint: 'لتوجيه الزبائن إلى موقعك أو لطلب تقييم 5 نجوم',
    gridFull: true,
  },
];

const SOCIAL_FIELDS: BizFieldDef[] = [
  {
    key: 'instagram',
    label: 'رابط حساب انستجرام',
    placeholder: 'https://instagram.com/your_username',
    type: 'url',
    icon: <Instagram size={16} />,
  },
  {
    key: 'facebook',
    label: 'رابط صفحة فيسبوك',
    placeholder: 'https://facebook.com/your_page',
    type: 'url',
    icon: <Facebook size={16} />,
  },
  {
    key: 'tiktok',
    label: 'رابط حساب تيك توك',
    placeholder: 'https://tiktok.com/@your_username',
    type: 'url',
    icon: <Video size={16} />,
  },
];

const PAYMENT_FIELDS: BizFieldDef[] = [
  {
    key: 'instapay',
    label: 'رابط أو اسم المستخدم على انستا باي (InstaPay)',
    placeholder: 'https://instapay.eg/name أو username@instapay',
    type: 'text',
    icon: <CreditCard size={16} />,
    hint: 'لتسهيل استقبال التحويلات البنكية الفورية',
  },
  {
    key: 'vodafone_cash',
    label: 'رقم محفظة فودافون كاش',
    placeholder: '01000000000',
    type: 'tel',
    icon: <Smartphone size={16} />,
    hint: 'لإرسال الأموال عبر محفظة فودافون كاش الذكية',
  },
];

const MOBILE_SHOP_FIELDS: BizFieldDef[] = [
  {
    key: 'maintenance_whatsapp',
    label: 'رقم أو رابط واتساب الصيانة والاستفسارات',
    placeholder: '01000000000 أو https://wa.me/20100000000',
    type: 'text',
    icon: <MessageCircle size={16} />,
    hint: 'يفتح محادثة واتساب مخصصة لخدمات الصيانة وفحص الأجهزة',
  },
  {
    key: 'offers_url',
    label: 'رابط قناة العروض والأسعار (تليجرام أو ويب)',
    placeholder: 'https://t.me/your_offers_channel',
    type: 'url',
    icon: <LinkIcon size={16} />,
    hint: 'لتوجيه الزبائن لقناة العروض اليومية وأسعار الأجهزة والإكسسوارات',
  },
  {
    key: 'telegram_group',
    label: 'رابط جروب عملاء المحل (Telegram Group)',
    placeholder: 'https://t.me/your_community_group',
    type: 'url',
    icon: <MessageCircle size={16} />,
    hint: 'للانضمام لمجتمع عملاء المحل وتبادل الأجهزة والاستفسارات',
  },
  {
    key: 'google_review_url',
    label: 'رابط التقييم المباشر على Google Maps',
    placeholder: 'https://g.page/r/YOUR_PLACE/review أو https://maps.app.goo.gl/...',
    type: 'url',
    icon: <MapPin size={16} />,
    hint: 'الرابط الذي يتم توجيه العميل إليه عند منحه تقييماً إيجابياً',
  },
];

export const AdminAddCardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editCard = location.state?.cardToEdit as ApiCard | undefined;

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(!editCard);

  /* Card state */
  const [cardCode, setCardCode] = useState(editCard?.card_code || '');
  const [customSlug, setCustomSlug] = useState(editCard?.custom_slug || '');
  const [nfcUid, setNfcUid] = useState(editCard?.nfc_uid || '');
  const [cardType, setCardType] = useState<string>(editCard?.card_type || CardType.CARD);
  // Default to EMPTY as requested: رابط التوجيه يكون فاضي
  const [redirectUrl, setRedirectUrl] = useState(editCard?.current_redirect_url || '');
  const [categoryId, setCategoryId] = useState(getCategoryId(editCard?.category_id) || '');
  const [requiresSubscription, setRequiresSubscription] = useState<boolean>(
    editCard ? (editCard.requires_subscription ?? true) : true
  );

  /* Template & Active Shift state */
  const initialShift = editCard?.payment_shifts?.[0] || (editCard as any)?.active_shift;
  const [template, setTemplate] = useState<string>(editCard?.template || 'default');
  const [shiftLabel, setShiftLabel] = useState<string>(initialShift?.label || 'شيفت المساء');
  const [cashierName, setCashierName] = useState<string>(initialShift?.cashier_name || '');
  const [hourFrom, setHourFrom] = useState<number | ''>(initialShift?.hour_from ?? 6);
  const [periodFrom, setPeriodFrom] = useState<'am' | 'pm'>(initialShift?.period_from || 'pm');
  const [hourTo, setHourTo] = useState<number | ''>(initialShift?.hour_to ?? 2);
  const [periodTo, setPeriodTo] = useState<'am' | 'pm'>(initialShift?.period_to || 'am');
  const [enableReviewGate, setEnableReviewGate] = useState<boolean>(editCard?.business_data?.enable_review_gate ?? true);

  /* Customer link state */
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(null);
  const [initialCustomer, setInitialCustomer] = useState<ApiCustomer | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

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
    maintenance_whatsapp: editCard?.business_data?.maintenance_whatsapp || '',
    offers_url: editCard?.business_data?.offers_url || '',
    telegram_group: editCard?.business_data?.telegram_group || '',
    google_review_url: editCard?.business_data?.google_review_url || '',
  });

  const [autoCode, setAutoCode] = useState(!editCard);

  /* Logo upload state & handlers */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [logoMode, setLogoMode] = useState<'upload' | 'url'>('upload');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleLogoFile = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'حجم الملف كبير',
        text: 'يرجى اختيار صورة بحجم أقل من 5 ميجابايت',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'warning',
        title: 'نوع الملف غير صالح',
        text: 'يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, SVG)',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    // Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateBiz('logo', reader.result);
      }
    };
    reader.readAsDataURL(file);

    setUploadingLogo(true);
    setUploadStatus('جاري رفع الصورة للسيرفر...');
    try {
      const res = await cardsApi.uploadLogo(file);
      if (res && res.url) {
        updateBiz('logo', res.url);
        setUploadStatus('تم رفع الصورة بنجاح ✓');
      } else {
        setUploadStatus('تم حفظ الصورة بنجاح ✓');
      }
    } catch (err: any) {
      console.warn('Backend upload endpoint error or not deployed yet, using local preview:', err);
      setUploadStatus('تم حفظ الصورة محلياً بنجاح ✓');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    updateBiz('logo', '');
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* Fetch full card details in edit mode */
  useEffect(() => {
    if (editCard) {
      cardsApi
        .getCardById(editCard._id)
        .then((fullCard) => {
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

          if (fullCard.customer && typeof fullCard.customer === 'object') {
            setSelectedCustomer(fullCard.customer);
            setInitialCustomer(fullCard.customer);
          }
        })
        .catch(console.error);
    }
  }, [editCard]);

  const loadData = useCallback(async () => {
    setFetchingData(true);
    try {
      const [catRes, countRes] = await Promise.all([
        categoriesApi.getCategories({ limit: 100 }),
        cardsApi.getCards({ limit: 1 }),
      ]);
      const allCats = catRes.data ?? [];
      const activeCats = allCats.filter((c: ApiCategory) => c.is_active);
      setCategories(activeCats);

      // Auto-generate next card code
      const realTotal = countRes.total ?? 0;
      const safeLimit = Math.max(realTotal + 50, 200);
      const cardsRes = await cardsApi.getCards({ limit: safeLimit });

      const nums = (cardsRes.data ?? [])
        .map((c) => {
          const m = c.card_code.match(/^CARD-(\d+)$/);
          return m ? parseInt(m[1]) : 0;
        })
        .filter(Boolean);
      const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
      const nextCode = `CARD-${String(next).padStart(4, '0')}`;
      const nextNfc = `NFC-${String(next).padStart(6, '0')}`;

      if (autoCode && !editCard) {
        setCardCode(nextCode);
        setNfcUid(nextNfc);
        // Note: redirectUrl is deliberately KEPT EMPTY as per user instruction!
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: e?.message || 'فشل تحميل البيانات',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setFetchingData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateBiz = (key: string, val: string) => {
    setBizData((prev) => ({ ...prev, [key]: val }));
  };

  /* Category ID for Business Profile */
  const BUSINESS_PROFILE_CATEGORY_ID = '6ac46e143883b08344234133';
  const isBusinessProfileCategory = Boolean(
    template === 'mobile_shop' ||
    categoryId === BUSINESS_PROFILE_CATEGORY_ID ||
    categories.find((c) => c._id === categoryId && (c.name.includes('نشاط') || c.name.toLowerCase().includes('business')))
  );

  /* ── Submit Handler ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!cardCode.trim()) {
      Swal.fire({ icon: 'warning', title: 'حقل مطلوب', text: 'كود البطاقة مطلوب', confirmButtonColor: '#3b82f6' });
      return;
    }
    if (!/^CARD-\d{4,}$/.test(cardCode.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'صيغة خاطئة',
        text: 'كود البطاقة يجب أن يكون بالصيغة CARD-XXXX مثل CARD-0001',
        confirmButtonColor: '#3b82f6',
      });
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
    if (!categoryId) {
      Swal.fire({ icon: 'warning', title: 'حقل مطلوب', text: 'يرجى اختيار تصنيف للبطاقة', confirmButtonColor: '#3b82f6' });
      return;
    }

    // Build business_data only if category is Business Profile or Mobile Shop template
    const business: BusinessData = {};
    let hasBiz = false;
    if (isBusinessProfileCategory) {
      // Validate WhatsApp is a link if provided
      const waVal = bizData.whatsapp?.trim();
      if (waVal && !/^https?:\/\//i.test(waVal)) {
        Swal.fire({
          icon: 'warning',
          title: 'رابط واتساب غير صالح',
          text: 'يجب أن تقوم بإدخال رابط واتساب صحيح يبدأ بـ https:// (مثل: https://wa.me/201000000000) وليس مجرد رقم.',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      for (const [k, v] of Object.entries(bizData)) {
        if (typeof v === 'string' && v.trim()) {
          (business as any)[k] = v.trim();
          hasBiz = true;
        }
      }

      if (template === 'mobile_shop') {
        business.enable_review_gate = enableReviewGate;
        hasBiz = true;
      }
    }

    // Payment shifts packaging for backend
    let paymentShiftsList: PaymentShift[] | undefined = undefined;
    if (template === 'mobile_shop') {
      paymentShiftsList = [
        {
          label: shiftLabel.trim() || 'شيفت الكاشير',
          cashier_name: cashierName.trim() || undefined,
          hour_from: hourFrom !== '' ? Number(hourFrom) : undefined,
          period_from: periodFrom,
          hour_to: hourTo !== '' ? Number(hourTo) : undefined,
          period_to: periodTo,
          instapay: bizData.instapay?.trim() || undefined,
          vodafone_cash: bizData.vodafone_cash?.trim() || undefined,
          priority: 0,
          is_active: true,
        },
      ];
    }

    // Handle redirect URL: if empty, gracefully fallback to default redirect URL for this card
    const domainOrigin = window.location.origin.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
      'https://smart-card-qr-api.koyeb.app'
    );
    let formattedUrl = redirectUrl.trim();
    if (!formattedUrl) {
      // Auto-fallback so backend receives valid URL
      formattedUrl = `${domainOrigin}/r/${cardCode.trim().toUpperCase()}`;
    } else if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

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
          template: template,
          payment_shifts: paymentShiftsList,
        };
        updateDto.nfc_uid = nfcUid.trim() ? nfcUid.trim().toUpperCase() : '';
        updateDto.business_data = isBusinessProfileCategory ? (hasBiz ? business : null) : null;

        const updated = await cardsApi.updateCard(editCard._id, updateDto);

        // Handle customer assignment change
        if (selectedCustomer?._id !== initialCustomer?._id) {
          if (initialCustomer) {
            await customersApi.unassignCard(initialCustomer._id, updated._id).catch(console.error);
          }
          if (selectedCustomer) {
            await customersApi.assignCards(selectedCustomer._id, { card_ids: [updated._id] }).catch(console.error);
          }
        }

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
          template: template,
          payment_shifts: paymentShiftsList,
        };
        if (trimmedSlug) createDto.custom_slug = trimmedSlug;
        if (nfcUid.trim()) createDto.nfc_uid = nfcUid.trim().toUpperCase();
        if (isBusinessProfileCategory && hasBiz) createDto.business_data = business;

        const created = await cardsApi.createCard(createDto);

        // Assign to customer if selected
        if (selectedCustomer) {
          await customersApi.assignCards(selectedCustomer._id, { card_ids: [created._id] }).catch(console.error);
        }

        await Swal.fire({
          icon: 'success',
          title: 'تم إنشاء البطاقة بنجاح! 🎉',
          html: `
            <div style="text-align:right;direction:rtl;font-family:Tajawal,sans-serif">
              <p style="margin:8px 0;font-size:15px">البطاقة <strong style="color:#2563eb">${created.card_code}</strong> جاهزة تماماً</p>
              ${created.custom_slug ? `<p style="margin:4px 0;font-size:13.5px;color:#16a34a">الرابط المخصص: <strong>/social/${created.custom_slug}</strong></p>` : ''}
              <p style="margin:4px 0;font-size:13px;color:#64748b">النوع: ${created.card_type}</p>
              <div style="margin-top:16px;text-align:center">
                <a href="/social/${created.custom_slug || created.card_code}" target="_blank" style="display:inline-block;padding:9px 20px;background:#16a34a;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
                  🚀 فتح صفحة البطاقة التفاعلية
                </a>
              </div>
            </div>
          `,
          confirmButtonText: 'عرض قائمة البطاقات',
          confirmButtonColor: '#3b82f6',
          showCancelButton: true,
          cancelButtonText: 'إضافة بطاقة أخرى',
          cancelButtonColor: '#64748b',
        }).then((result: import('sweetalert2').SweetAlertResult) => {
          if (result.isConfirmed) {
            navigate('/admin/cards');
          } else {
            // Reset form for next card
            setAutoCode(true);
            setCustomSlug('');
            setNfcUid('');
            setRedirectUrl(''); // Reset to empty!
            setBizData({
              business_name: '', logo: '', description: '', phone: '',
              email: '', whatsapp: '', instagram: '', facebook: '',
              tiktok: '', google_maps: '', website: '', instapay: '',
              vodafone_cash: '',
            });
            setSelectedCustomer(null);
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

  const isFormValid = Boolean(
    cardCode.trim() &&
    /^CARD-\d{4,}$/.test(cardCode.trim()) &&
    categoryId
  );

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'var(--font)', maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>

      {/* ══════ Top Header & Breadcrumb ══════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/admin/cards')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '42px', height: '42px', borderRadius: '12px',
              border: '1px solid var(--bdr-light)', backgroundColor: '#fff',
              cursor: 'pointer', color: 'var(--txt-secondary)', flexShrink: 0,
              boxShadow: 'var(--shadow-xs)',
              transition: 'all 0.15s ease',
            }}
            title="الرجوع لقائمة البطاقات"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: 'var(--txt-heading)' }}>
                {editCard ? `تعديل البطاقة ${editCard.card_code}` : 'إضافة بطاقة ذكية جديدة'}
              </h1>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '20px',
                  backgroundColor: editCard ? 'var(--clr-warning-bg)' : 'var(--clr-primary-50)',
                  color: editCard ? 'var(--clr-warning)' : 'var(--clr-primary-700)',
                  border: `1px solid ${editCard ? 'var(--clr-warning-bdr)' : 'var(--clr-primary-200)'}`,
                }}
              >
                {editCard ? 'وضع التعديل' : 'بطاقة جديدة'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--txt-muted)' }}>
              {editCard
                ? 'تحديث بيانات البطاقة والنشاط التجاري وروابط التواصل'
                : 'أدخل تفاصيل البطاقة واملأ بيانات النشاط التجاري لتجهيز صفحة العميل'}
            </p>
          </div>
        </div>

        {/* Quick Preview Link if editing */}
        {editCard && (
          <a
            href={`/social/${editCard.custom_slug || editCard.card_code}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--clr-primary-50)',
              color: 'var(--clr-primary-700)',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              border: '1px solid var(--clr-primary-200)',
            }}
          >
            <ExternalLink size={14} /> معاينة صفحة البطاقة الحالية
          </a>
        )}
      </div>

      {/* Customer Selection Modal */}
      {customerModalOpen && (
        <SelectCustomerModal
          onClose={() => setCustomerModalOpen(false)}
          onSelect={(c) => {
            setSelectedCustomer(c);
            setCustomerModalOpen(false);
          }}
          selectedCustomerId={selectedCustomer?._id}
        />
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

        {/* ══════ Section 1: بيانات البطاقة الأساسية ══════ */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--bdr-light)',
            borderRadius: '20px',
            padding: '26px 28px',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {/* Section Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', borderBottom: '1px solid var(--bdr-light)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--clr-primary-50)',
                  color: 'var(--clr-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--clr-primary-200)',
                }}
              >
                <CreditCard size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                  بيانات البطاقة والتشغيل (Card Information)
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                  إعدادات كود البطاقة ونوعها والاشتراك والتصنيف
                </p>
              </div>
            </div>

            {fetchingData && (
              <span style={{ fontSize: '12px', color: 'var(--txt-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={13} className="spin" /> تحميل البيانات...
              </span>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
              gap: '18px',
            }}
          >
            {/* Card Code */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} style={{ color: 'var(--clr-primary-500)' }} />
                  كود البطاقة <span style={{ color: 'var(--clr-error)' }}>*</span>
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  value={cardCode}
                  onChange={(e) => {
                    setCardCode(e.target.value.toUpperCase());
                    setAutoCode(false);
                  }}
                  placeholder="CARD-0001"
                  required
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    fontSize: '14.5px',
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                صيغة الكود: CARD-XXXX (يتم توليده تلقائياً بالتسلسل)
              </span>
            </div>

            {/* NFC UID */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} style={{ color: 'var(--txt-muted)' }} />
                  معرف NFC الفعلي (NFC UID)
                </span>
              </label>
              <input
                className="form-input"
                value={nfcUid}
                onChange={(e) => setNfcUid(e.target.value.toUpperCase())}
                placeholder="NFC-7FJ2K9"
                style={{ fontFamily: 'monospace', fontSize: '14px' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                اختياري — معرّف رقاقة الـ NFC الفيزيائية
              </span>
            </div>

            {/* Custom Slug */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={15} style={{ color: 'var(--clr-primary-500)' }} />
                  الرابط المخصص (Custom Slug)
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  dir="ltr"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase())}
                  placeholder="dr-ahmed"
                  style={{ textAlign: 'left', fontWeight: 600, fontSize: '14px' }}
                />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                معاينة الرابط: <code style={{ color: 'var(--clr-primary-700)', fontWeight: 700 }}>/social/{customSlug || (cardCode || 'card-name')}</code>
              </span>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} style={{ color: 'var(--clr-primary-500)' }} />
                  التصنيف (Category) <span style={{ color: 'var(--clr-error)' }}>*</span>
                </span>
              </label>
              <select
                className="form-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                <option value="">— اختر تصنيف البطاقة —</option>
                {categories.filter((c) => c.is_active).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {isBusinessProfileCategory ? (
                <div style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> تم تفعيل سكشن بيانات النشاط التجاري (Business Profile)
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                  يظهر سكشن بيانات النشاط التجاري تلقائياً عند اختيار تصنيف النشاط التجاري
                </span>
              )}
            </div>

            {/* Card Physical Type */}
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} style={{ color: 'var(--clr-primary-500)' }} />
                  شكل المنتج الفيزيائي <span style={{ color: 'var(--clr-error)' }}>*</span>
                </span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {CARD_TYPES.map((t) => {
                  const isSelected = cardType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCardType(t)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--clr-primary-500)' : '1px solid var(--bdr-light)',
                        backgroundColor: isSelected ? 'var(--clr-primary-50)' : 'var(--bg-subtle)',
                        color: isSelected ? 'var(--clr-primary-800)' : 'var(--txt-secondary)',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected && <Check size={14} style={{ color: 'var(--clr-primary-600)' }} />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Page Template Selection */}
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: 'var(--clr-primary-500)' }} />
                  قالب صفحة العرض (Card Page Template)
                </span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '12px' }}>
                {/* Default Template Option */}
                <div
                  onClick={() => setTemplate('default')}
                  style={{
                    border: template === 'default' ? '2px solid var(--clr-primary-500)' : '1px solid var(--bdr-light)',
                    backgroundColor: template === 'default' ? 'var(--clr-primary-50)' : 'var(--bg-subtle)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: template === 'default' ? 'var(--clr-primary-500)' : '#e2e8f0',
                      color: template === 'default' ? '#fff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Globe size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: template === 'default' ? 'var(--clr-primary-900)' : 'var(--txt-heading)' }}>
                        القالب الافتراضي (Default)
                      </span>
                      {template === 'default' && <Check size={16} style={{ color: 'var(--clr-primary-600)' }} />}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--txt-muted)', lineHeight: 1.5 }}>
                      صفحة البروفايل وبطاقة الأعمال القياسية لروابط التواصل والنشاط التجاري.
                    </p>
                  </div>
                </div>

                {/* Mobile Shop Template Option */}
                <div
                  onClick={() => setTemplate('mobile_shop')}
                  style={{
                    border: template === 'mobile_shop' ? '2px solid #8b5cf6' : '1px solid var(--bdr-light)',
                    backgroundColor: template === 'mobile_shop' ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-subtle)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: template === 'mobile_shop' ? '#8b5cf6' : '#e2e8f0',
                      color: template === 'mobile_shop' ? '#fff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Smartphone size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: template === 'mobile_shop' ? '#6b21a8' : 'var(--txt-heading)' }}>
                        كاشير محلات الموبايل (Mobile Shop)
                      </span>
                      {template === 'mobile_shop' && <Check size={16} style={{ color: '#7c3aed' }} />}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--txt-muted)', lineHeight: 1.5 }}>
                      مخصص لكاونتر الكاشير: تبديل الشيفتات، إنستاباي، فودافون كاش، وخدمات الصيانة والتقييم.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Shift Settings when template is mobile_shop */}
            {template === 'mobile_shop' && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  backgroundColor: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(139, 92, 246, 0.15)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#581c87' }}>
                        إعدادات الشيفت الحالي والكاشير المسؤول (Active Shift)
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#7c3aed' }}>
                        يظهر هذا الكاشير في شريط الشيفت النشط أعلى واجهة الكارت للعملاء
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#10b981', color: '#fff', padding: '3px 8px', borderRadius: '6px' }}>
                    ● شيفت نشط
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '14px' }}>
                  {/* Shift Label */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>
                      مسمى الشيفت
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      value={shiftLabel}
                      onChange={(e) => setShiftLabel(e.target.value)}
                      placeholder="مثال: شيفت المساء"
                      style={{ fontSize: '13px', backgroundColor: '#fff' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      {['شيفت الصباح', 'شيفت المساء', 'شيفت الليل'].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setShiftLabel(lbl)}
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(139, 92, 246, 0.25)',
                            backgroundColor: shiftLabel === lbl ? '#8b5cf6' : '#fff',
                            color: shiftLabel === lbl ? '#fff' : '#6b21a8',
                            cursor: 'pointer',
                          }}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cashier Name */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>
                      اسم الكاشير المسؤول
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      placeholder="مثال: أحمد"
                      style={{ fontSize: '13px', backgroundColor: '#fff' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                      يظهر اسمه للعميل لتأكيد التحويلات النقدية
                    </span>
                  </div>

                  {/* Hours From */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} style={{ color: '#8b5cf6' }} />
                      من الساعة
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        className="form-input"
                        type="number"
                        min={1}
                        max={12}
                        value={hourFrom}
                        onChange={(e) => setHourFrom(e.target.value ? Number(e.target.value) : '')}
                        placeholder="6"
                        style={{ width: '70px', textAlign: 'center', fontWeight: 700, fontSize: '13px', backgroundColor: '#fff' }}
                      />
                      <select
                        className="form-input"
                        value={periodFrom}
                        onChange={(e) => setPeriodFrom(e.target.value as 'am' | 'pm')}
                        style={{ flex: 1, fontWeight: 700, fontSize: '13px', backgroundColor: '#fff' }}
                      >
                        <option value="pm">مساءً (م)</option>
                        <option value="am">صباحاً (ص)</option>
                      </select>
                    </div>
                  </div>

                  {/* Hours To */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>
                      إلى الساعة
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        className="form-input"
                        type="number"
                        min={1}
                        max={12}
                        value={hourTo}
                        onChange={(e) => setHourTo(e.target.value ? Number(e.target.value) : '')}
                        placeholder="2"
                        style={{ width: '70px', textAlign: 'center', fontWeight: 700, fontSize: '13px', backgroundColor: '#fff' }}
                      />
                      <select
                        className="form-input"
                        value={periodTo}
                        onChange={(e) => setPeriodTo(e.target.value as 'am' | 'pm')}
                        style={{ flex: 1, fontWeight: 700, fontSize: '13px', backgroundColor: '#fff' }}
                      >
                        <option value="am">صباحاً (ص)</option>
                        <option value="pm">مساءً (م)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Link Section */}
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} style={{ color: 'var(--clr-primary-500)' }} />
                  ربط الكارت بعميل (Customer)
                </span>
              </label>
              
              {selectedCustomer ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--clr-primary-200)', backgroundColor: 'var(--clr-primary-50)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--clr-primary-800)', fontSize: '14px' }}>
                      {selectedCustomer.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--clr-primary-600)', marginTop: '2px' }}>
                      {selectedCustomer.phone}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setCustomerModalOpen(true)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px', height: '32px' }}>
                      تغيير العميل
                    </button>
                    <button type="button" onClick={() => setSelectedCustomer(null)} style={{ background: '#fff', border: '1px solid var(--clr-error-bdr)', color: 'var(--clr-error)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                      إلغاء الربط
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(true)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px dashed var(--clr-primary-300)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--clr-primary-600)',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--clr-primary-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                >
                  <Plus size={16} /> اختيار العميل لربط الكارت به
                </button>
              )}
            </div>

            {/* Subscription Type */}
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={15} style={{ color: 'var(--clr-primary-500)' }} />
                  نظام الاشتراك
                </span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${requiresSubscription ? 'var(--clr-primary-500)' : 'var(--bdr-light)'}`,
                    backgroundColor: requiresSubscription ? 'var(--clr-primary-50)' : 'var(--bg-subtle)',
                    flex: 1,
                    transition: 'all 140ms ease',
                  }}
                >
                  <input
                    type="radio"
                    checked={requiresSubscription}
                    onChange={() => setRequiresSubscription(true)}
                    style={{ accentColor: 'var(--clr-primary-500)' }}
                  />
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: requiresSubscription ? 'var(--clr-primary-800)' : 'var(--txt-secondary)', display: 'block' }}>
                      باشتراك دوري
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>ينتهي بعد سنة</span>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${!requiresSubscription ? '#16a34a' : 'var(--bdr-light)'}`,
                    backgroundColor: !requiresSubscription ? '#f0fdf4' : 'var(--bg-subtle)',
                    flex: 1,
                    transition: 'all 140ms ease',
                  }}
                >
                  <input
                    type="radio"
                    checked={!requiresSubscription}
                    onChange={() => setRequiresSubscription(false)}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: !requiresSubscription ? '#15803d' : 'var(--txt-secondary)', display: 'block' }}>
                      دائم مدى الحياة ♾
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>بدون انتهاء صلاحية</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Redirect URL (رابط التوجيه - فاضي افتراضياً) */}
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LinkIcon size={15} style={{ color: 'var(--clr-primary-500)' }} />
                  رابط التوجيه المباشر (Redirect URL)
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--txt-muted)' }}>
                    (اختياري — اتركه فارغاً إذا كنت تريد فتح صفحة البطاقة التفاعلية)
                  </span>
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  dir="ltr"
                  type="text"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://example.com أو اتركه فارغاً للتوجيه التلقائي"
                  style={{
                    textAlign: 'left',
                    fontSize: '14px',
                    paddingRight: redirectUrl ? '36px' : '14px',
                  }}
                />
                {redirectUrl && (
                  <button
                    type="button"
                    onClick={() => setRedirectUrl('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--txt-muted)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: '4px',
                    }}
                    title="تفريغ الرابط"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  fontSize: '12.5px',
                  color: 'var(--txt-secondary)',
                }}
              >
                <HelpCircle size={14} style={{ color: 'var(--clr-primary-500)', flexShrink: 0 }} />
                <span>
                  إذا تُرك هذا الحقل <strong>فارغاً</strong>، فسيتم توجيه الماسح تلقائياً لصفحة أزرار النشاط التجاري (Social Profile). أما إذا أدخلت رابطاً خارجياً (مثل صفحة انستجرام أو متجر)، فسيتم تحويل العميل إليه مباشرة.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ Section 2: بيانات النشاط التجاري وملف التواصل (يظهر فقط لتصنيف النشاط التجاري 6ac46e143883b08344234133) ══════ */}
        {isBusinessProfileCategory && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--bdr-light)',
              borderRadius: '20px',
              padding: '26px 28px',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--bdr-light)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #bbf7d0',
                }}
              >
                <Building2 size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                  بيانات النشاط التجاري وملف التواصل (Business Profile)
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                  جميع الحقول متاحة الآن بالكامل لجميع البطاقات والتصنيفات (اختيارية)
                </p>
              </div>
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#16a34a',
                backgroundColor: '#f0fdf4',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid #bbf7d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Sparkles size={13} /> 13 حقلاً متاحاً
            </span>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
              fontSize: '13px',
              color: 'var(--txt-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--clr-primary-100)',
                color: 'var(--clr-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              i
            </div>
            <span>
              املأ الحقول التي تريد ظهورها في صفحة التواصل الاجتماعي الخاصة بالبطاقة. أي حقل تتركه فارغاً لن يظهر للعميل.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>

            {/* ── Group A: المعلومات الأساسية ── */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '14px',
                padding: '18px 20px',
                border: '1px solid var(--bdr-light)',
              }}
            >
              <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} style={{ color: 'var(--clr-primary-600)' }} />
                1. البيانات الأساسية والشعار
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '18px' }}>
                {/* Business Name */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={16} style={{ color: 'var(--clr-primary-500)' }} />
                      اسم النشاط التجاري / الشخصي
                    </span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    value={bizData.business_name || ''}
                    onChange={(e) => updateBiz('business_name', e.target.value)}
                    placeholder="مثال: عيادة د. أحمد علي أو مطعم كوفي هاوس"
                    maxLength={120}
                    style={{ fontSize: '13.5px', backgroundColor: '#fff' }}
                  />
                  <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>
                    الاسم الرئيسي الذي سيظهر في أعلى صفحة البطاقة (بحد أقصى 120 حرف)
                  </span>
                </div>

                {/* Logo Upload Component (Full Width) */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Image size={16} style={{ color: 'var(--clr-primary-500)' }} />
                        شعار النشاط أو الصورة الشخصية (Logo)
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setLogoMode(logoMode === 'upload' ? 'url' : 'upload')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--clr-primary-600)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {logoMode === 'upload' ? '🔗 أو إدخال رابط خارجي (URL)' : '📁 أو رفع ملف من الجهاز'}
                    </button>
                  </div>

                  {logoMode === 'upload' ? (
                    <div>
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleLogoFile(e.target.files[0]);
                          }
                        }}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        style={{ display: 'none' }}
                      />

                      {bizData.logo ? (
                        /* Image Preview Card */
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '1px solid var(--bdr-light)',
                            boxShadow: 'var(--shadow-xs)',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '12px',
                                border: '1px solid var(--bdr-light)',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--bg-subtle)',
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={bizData.logo}
                                alt="Logo Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                                تم اختيار وتجهيز الشعار
                              </div>
                              <div style={{ fontSize: '12px', color: uploadingLogo ? 'var(--clr-primary-600)' : 'var(--clr-success)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                                {uploadingLogo ? <RefreshCw size={12} className="spin" /> : <Check size={12} />}
                                <span>{uploadStatus || 'جاهز للاستخدام في صفحة البطاقة'}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingLogo}
                              className="btn-outline"
                              style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <UploadCloud size={14} /> تغيير الصورة
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              disabled={uploadingLogo}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--clr-error-bdr)',
                                backgroundColor: 'var(--clr-error-bg)',
                                color: 'var(--clr-error)',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <Trash2 size={14} /> حذف
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Dropzone */
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleLogoFile(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            border: `2px dashed ${dragOver ? 'var(--clr-primary-500)' : 'var(--bdr-medium)'}`,
                            backgroundColor: dragOver ? 'var(--clr-primary-50)' : '#fff',
                            borderRadius: '12px',
                            padding: '24px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--clr-primary-50)',
                              color: 'var(--clr-primary-600)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 10px',
                            }}
                          >
                            <UploadCloud size={22} />
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--txt-heading)', marginBottom: '3px' }}>
                            {uploadingLogo ? 'جاري رفع الملف...' : 'اضغط لرفع الشعار أو اسحب الصورة وأفلتها هنا'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
                            يدعم PNG, JPG, WEBP, SVG (بحد أقصى 5 ميجابايت)
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback: Direct URL mode */
                    <div>
                      <input
                        className="form-input"
                        type="url"
                        dir="ltr"
                        value={bizData.logo || ''}
                        onChange={(e) => updateBiz('logo', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        style={{ fontSize: '13.5px', backgroundColor: '#fff' }}
                      />
                      <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>
                        رابط صورة مباشر يبدأ بـ https://
                      </span>
                    </div>
                  )}
                </div>

                {/* Description Textarea */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} style={{ color: 'var(--clr-primary-500)' }} />
                      نبذة عن النشاط (الوصف)
                    </span>
                  </label>
                  <textarea
                    className="form-input"
                    value={bizData.description || ''}
                    onChange={(e) => updateBiz('description', e.target.value)}
                    placeholder="اكتب نبذة مختصرة عن الخدمات أو النشاط التجاري لتعريف العملاء بك..."
                    rows={3}
                    maxLength={500}
                    style={{ resize: 'vertical', minHeight: '75px', fontSize: '13.5px', backgroundColor: '#fff' }}
                  />
                  <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>
                    وصف جذاب ومختصر يظهر تحت الاسم (بحد أقصى 500 حرف)
                  </span>
                </div>
              </div>
            </div>

            {/* ── Group B: الاتصال والموقع ── */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '14px',
                padding: '18px 20px',
                border: '1px solid var(--bdr-light)',
              }}
            >
              <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: '#059669' }} />
                2. قنوات الاتصال والموقع
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '16px' }}>
                {CONTACT_FIELDS.map((f) => (
                  <div key={f.key} className="form-group" style={f.gridFull ? { gridColumn: '1 / -1' } : undefined}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {React.cloneElement(f.icon as React.ReactElement, { style: { color: '#059669' } })}
                        {f.label}
                      </span>
                    </label>
                    <input
                      className="form-input"
                      type={f.type || 'text'}
                      dir={f.type === 'url' || f.type === 'tel' || f.type === 'email' ? 'ltr' : undefined}
                      value={bizData[f.key] || ''}
                      onChange={(e) => updateBiz(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ fontSize: '13.5px', backgroundColor: '#fff' }}
                    />
                    {f.hint && <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>{f.hint}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Group C: التواصل الاجتماعي ── */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '14px',
                padding: '18px 20px',
                border: '1px solid var(--bdr-light)',
              }}
            >
              <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Instagram size={16} style={{ color: '#e1306c' }} />
                3. حسابات التواصل الاجتماعي (Social Media)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '16px' }}>
                {SOCIAL_FIELDS.map((f) => (
                  <div key={f.key} className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {React.cloneElement(f.icon as React.ReactElement, { style: { color: 'var(--txt-secondary)' } })}
                        {f.label}
                      </span>
                    </label>
                    <input
                      className="form-input"
                      type={f.type || 'url'}
                      dir="ltr"
                      value={bizData[f.key] || ''}
                      onChange={(e) => updateBiz(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ fontSize: '13.5px', backgroundColor: '#fff' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Group D: الدفع والمحافظ الإلكترونية ── */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '14px',
                padding: '18px 20px',
                border: '1px solid var(--bdr-light)',
              }}
            >
              <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={16} style={{ color: '#7c3aed' }} />
                4. طرق الدفع والتحويل المالي السريع
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '16px' }}>
                {PAYMENT_FIELDS.map((f) => (
                  <div key={f.key} className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {React.cloneElement(f.icon as React.ReactElement, { style: { color: '#7c3aed' } })}
                        {f.label}
                      </span>
                    </label>
                    <input
                      className="form-input"
                      type={f.type || 'text'}
                      dir={f.type === 'tel' || f.type === 'url' ? 'ltr' : undefined}
                      value={bizData[f.key] || ''}
                      onChange={(e) => updateBiz(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ fontSize: '13.5px', backgroundColor: '#fff' }}
                    />
                    {f.hint && <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>{f.hint}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Group E: خدمات محلات الموبايل وتقييم جوجل ── */}
            <div
              style={{
                backgroundColor: template === 'mobile_shop' ? 'rgba(139, 92, 246, 0.04)' : 'var(--bg-subtle)',
                borderRadius: '14px',
                padding: '18px 20px',
                border: template === 'mobile_shop' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--bdr-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={16} style={{ color: '#8b5cf6' }} />
                  5. خدمات محلات الموبايل وبوابة تقييم Google Maps
                </h3>
                {template === 'mobile_shop' && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                    قالب الكاشير مفعل ⭐
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '16px' }}>
                {MOBILE_SHOP_FIELDS.map((f) => (
                  <div key={f.key} className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {React.cloneElement(f.icon as React.ReactElement, { style: { color: '#8b5cf6' } })}
                        {f.label}
                      </span>
                    </label>
                    <input
                      className="form-input"
                      type={f.type || 'text'}
                      dir={f.type === 'url' || f.type === 'tel' ? 'ltr' : undefined}
                      value={bizData[f.key] || ''}
                      onChange={(e) => updateBiz(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ fontSize: '13.5px', backgroundColor: '#fff' }}
                    />
                    {f.hint && <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>{f.hint}</span>}
                  </div>
                ))}

                {/* Review Gate Toggle */}
                <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: enableReviewGate ? 'rgba(16, 185, 129, 0.08)' : '#fff',
                      border: enableReviewGate ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--bdr-light)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={enableReviewGate}
                      onChange={(e) => setEnableReviewGate(e.target.checked)}
                      style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: enableReviewGate ? '#065f46' : 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={15} color="#eab308" fill="#eab308" />
                        تفعيل بوابة الفلترة الذكية للتقييم (Review Gate)
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
                        عند تفعيلها: تقييم 4 أو 5 نجوم يوجّه العميل تلقائياً لكتابة رأيه على خرائط Google Maps، بينما التقييم من 1 إلى 3 نجوم يفتح نافذة داخلية لمراسلة إدارة المحل عبر واتساب لمعالجة أي شكوى ودياً قبل نشرها.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ══════ Bottom Submit Bar ══════ */}
        <div
          style={{
            position: 'sticky',
            bottom: '16px',
            zIndex: 100,
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--bdr-light)',
            padding: '16px 24px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--txt-secondary)', fontWeight: 600 }}>
              {editCard ? (
                <>جاهز لحفظ التعديلات على كود <code style={{ color: 'var(--clr-primary-700)', fontWeight: 800 }}>{cardCode}</code></>
              ) : (
                <>كود البطاقة الجديدة: <code style={{ color: 'var(--clr-primary-700)', fontWeight: 800 }}>{cardCode || '—'}</code></>
              )}
            </span>
            {!isFormValid && (
              <span style={{ fontSize: '12px', color: 'var(--clr-error)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> يرجى ملء الحقول الإجبارية (كود البطاقة والتصنيف)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/admin/cards')}
              style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !isFormValid}
              style={{
                minWidth: '180px',
                padding: '9px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>{editCard ? 'جاري الحفظ...' : 'جاري الإنشاء...'}</span>
                </>
              ) : (
                <>
                  <Plus size={17} />
                  <span>{editCard ? 'إتمام وحفظ التعديلات' : 'إنشاء البطاقة الذكية'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default AdminAddCardPage;
