import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { cardsApi, categoriesApi, customersApi } from '../../services';
import {
  ApiCard,
  ApiCategory,
  ApiCreateCardDto,
  ApiUpdateCardDto,
  CARD_TYPES,
  CardType,
  BusinessData,
  PaymentShift,
  PaymentShiftFormItem,
  getCategoryId,
  CUSTOM_SLUG_REGEX,
  ApiCustomer,
} from '../../types';
import { SelectCustomerModal } from '../../components/admin/SelectCustomerModal';
import Swal from 'sweetalert2';
import {
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Plus,
  Building2,
  Globe,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MapPin,
  MessageCircle,
  Video,
  Link as LinkIcon,
  FileText,
  RefreshCw,
  Smartphone,
  Check,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  UploadCloud,
  Trash2,
  User,
  Clock,
  UserCheck,
  Store,
  Star,
  Edit2,
  Copy,
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
    hint: 'يفتح محادثة واتساب مباشرة عند الضغط عليه (يجب أن يكون رابطاً يبدأ بـ https://)',
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
    label: 'رابط خرائط جوجل أو الموقع الجغرافي',
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

/* ── Steps Configuration ───────────────────────────────────────── */
const STEPS = [
  { id: 1, title: 'بيانات الكارت والقالب', desc: 'الكود، التصنيف، القالب، والاشتراك', icon: <CreditCard size={18} /> },
  { id: 2, title: 'هوية النشاط والتواصل', desc: 'الاسم، الشعار، وقنوات الاتصال', icon: <Building2 size={18} /> },
  { id: 3, title: 'الكاشير وطرق الدفع', desc: 'الشيفتات، الدفع الفوري، والتقييم', icon: <Smartphone size={18} /> },
  { id: 4, title: 'مراجعة وتأكيد', desc: 'ملخص البيانات والإنشاء النهائي', icon: <Sparkles size={18} /> },
];

export const AdminAddCardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: cardId } = useParams<{ id: string }>();
  const editCard = location.state?.cardToEdit as ApiCard | undefined;

  /* Step state */
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(!editCard);

  /* Card state */
  const [cardCode, setCardCode] = useState(editCard?.card_code || '');
  const [customSlug, setCustomSlug] = useState(editCard?.custom_slug || '');
  const [cardType, setCardType] = useState<string>(editCard?.card_type || CardType.CARD);
  const [categoryId, setCategoryId] = useState(getCategoryId(editCard?.category_id) || '');
  const [requiresSubscription, setRequiresSubscription] = useState<boolean>(
    editCard ? (editCard.requires_subscription ?? true) : true
  );

  /* Template & Payment Shifts State */
  const [template, setTemplate] = useState<string>(editCard?.template || 'default');
  const [shifts, setShifts] = useState<PaymentShiftFormItem[]>(() => {
    if (editCard?.payment_shifts && editCard.payment_shifts.length > 0) {
      return editCard.payment_shifts.map((s) => ({
        label: s.label || 'شيفت الكاشير',
        cashier_name: s.cashier_name || '',
        hour_from: s.hour_from ?? '',
        period_from: s.period_from || 'pm',
        hour_to: s.hour_to ?? '',
        period_to: s.period_to || 'am',
        instapay: s.instapay || '',
        vodafone_cash: s.vodafone_cash || '',
        is_active: s.is_active ?? true,
      }));
    }
    const legacyShift = (editCard as any)?.active_shift;
    if (legacyShift) {
      return [
        {
          label: legacyShift.label || 'شيفت المساء',
          cashier_name: legacyShift.cashier_name || '',
          hour_from: legacyShift.hour_from ?? 6,
          period_from: legacyShift.period_from || 'pm',
          hour_to: legacyShift.hour_to ?? 2,
          period_to: legacyShift.period_to || 'am',
          instapay: editCard?.business_data?.instapay || '',
          vodafone_cash: editCard?.business_data?.vodafone_cash || '',
          is_active: true,
        },
      ];
    }
    return [
      {
        label: 'شيفت الصباح',
        cashier_name: '',
        hour_from: 10,
        period_from: 'am',
        hour_to: 6,
        period_to: 'pm',
        instapay: '',
        vodafone_cash: '',
        is_active: true,
      },
      {
        label: 'شيفت المساء',
        cashier_name: '',
        hour_from: 6,
        period_from: 'pm',
        hour_to: 2,
        period_to: 'am',
        instapay: '',
        vodafone_cash: '',
        is_active: true,
      },
    ];
  });

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

  /* Multiple Locations state */
  interface Location {
    id: string;
    name: string;
    google_maps_url: string;
  }
  const [locations, setLocations] = useState<Location[]>(() => {
    console.log('🔍 editCard:', editCard);
    console.log('🔍 editCard?.business_data:', editCard?.business_data);
    
    // Load from business_data.locations if editing
    if (editCard?.business_data?.locations && Array.isArray(editCard.business_data.locations)) {
      const locs = editCard.business_data.locations.map((loc: any, idx: number) => ({
        id: `loc-${idx}`,
        name: loc.name || `فرع ${idx + 1}`,
        google_maps_url: loc.google_maps_url || '',
      }));
      console.log('✅ Locations loaded from editCard:', locs);
      return locs;
    }
    // Fallback: If editing card with old google_maps field, migrate it to first location
    if (editCard?.business_data?.google_maps) {
      const locFromMaps = [{
        id: 'loc-0',
        name: 'الموقع الرئيسي',
        google_maps_url: editCard.business_data.google_maps,
      }];
      console.log('✅ Location created from google_maps:', locFromMaps);
      return locFromMaps;
    }
    console.log('✅ Locations initialized empty - no editCard or google_maps found');
    return [];
  });

  const [autoCode, setAutoCode] = useState(!editCard);

  /* Load card from API if accessing via URL (not via state) */
  useEffect(() => {
    if (cardId && !editCard) {
      // User navigated via URL, load from API
      cardsApi.getCardById(cardId).then((card) => {
        // Populate all form fields with the loaded card data
        setCardCode(card.card_code || '');
        setCustomSlug(card.custom_slug || '');
        setCardType(card.card_type || CardType.CARD);
        setCategoryId(getCategoryId(card.category_id) || '');
        setRequiresSubscription(card.requires_subscription ?? true);
        setTemplate(card.template || 'default');
        
        if (card.business_data) {
          setBizData((prev) => ({
            ...prev,
            business_name: card.business_data?.business_name || '',
            logo: card.business_data?.logo || '',
            description: card.business_data?.description || '',
            phone: card.business_data?.phone || '',
            email: card.business_data?.email || '',
            whatsapp: card.business_data?.whatsapp || '',
            instagram: card.business_data?.instagram || '',
            facebook: card.business_data?.facebook || '',
            tiktok: card.business_data?.tiktok || '',
            google_maps: card.business_data?.google_maps || '',
            website: card.business_data?.website || '',
            instapay: card.business_data?.instapay || '',
            vodafone_cash: card.business_data?.vodafone_cash || '',
            maintenance_whatsapp: card.business_data?.maintenance_whatsapp || '',
            offers_url: card.business_data?.offers_url || '',
            telegram_group: card.business_data?.telegram_group || '',
            google_review_url: card.business_data?.google_review_url || '',
          }));
        }

        // Load locations from card
        if (card.business_data?.locations && Array.isArray(card.business_data.locations)) {
          setLocations(
            card.business_data.locations.map((loc: any, idx: number) => ({
              id: `loc-${idx}`,
              name: loc.name || `فرع ${idx + 1}`,
              google_maps_url: loc.google_maps_url || '',
            }))
          );
        } else if (card.business_data?.google_maps) {
          setLocations([{
            id: 'loc-0',
            name: 'الموقع الرئيسي',
            google_maps_url: card.business_data.google_maps,
          }]);
        }

        setFetchingData(false);
        console.log('✅ Card loaded from API:', card);
      }).catch((err) => {
        console.error('Failed to load card:', err);
        setFetchingData(false);
      });
    }
  }, [cardId, editCard]);

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
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  /* Initial data loader */
  const loadData = useCallback(async () => {
    try {
      setFetchingData(true);
      const [catsRes, countRes] = await Promise.all([
        categoriesApi.getCategories({ limit: 100, is_active: true }),
        cardsApi.getCards({ limit: 1 }),
      ]);

      const activeCats = catsRes.data ?? [];
      setCategories(activeCats);

      // Auto-select Business Profile category if available
      const bizCat = activeCats.find(
        (c) => c.name.includes('نشاط') || c.name.toLowerCase().includes('business')
      );
      if (!categoryId && bizCat) {
        setCategoryId(bizCat._id);
      } else if (!categoryId && activeCats.length > 0) {
        setCategoryId(activeCats[0]._id);
      }

      // If editing, load customer if assigned
      if (editCard) {
        const rawCustId = editCard.customer_id || editCard.customer;
        const custId = typeof rawCustId === 'string' ? rawCustId : rawCustId?._id;
        if (custId) {
          try {
            const custRes = await customersApi.getCustomerById(custId);
            const actualCust = custRes?.customer || (custRes as any);
            setSelectedCustomer(actualCust);
            setInitialCustomer(actualCust);
          } catch (err) {
            console.error('Failed to load assigned customer:', err);
          }
        }
      }

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

      if (autoCode && !editCard) {
        setCardCode(nextCode);
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
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const updateBiz = (key: string, val: string) => {
    setBizData((prev) => ({ ...prev, [key]: val }));
  };

  const addLocation = () => {
    const newId = `loc-${Date.now()}`;
    setLocations((prev) => [...prev, {
      id: newId,
      name: `فرع ${prev.length + 1}`,
      google_maps_url: '',
    }]);
  };

  const updateLocation = (id: string, field: 'name' | 'google_maps_url', value: string) => {
    setLocations((prev) =>
      prev.map((loc) => loc.id === id ? { ...loc, [field]: value } : loc)
    );
  };

  const removeLocation = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  const updateShift = (index: number, field: keyof PaymentShiftFormItem, value: any) => {
    setShifts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addShift = () => {
    setShifts((prev) => [
      ...prev,
      {
        label: `شيفت ${prev.length + 1}`,
        cashier_name: '',
        hour_from: 10,
        period_from: 'am',
        hour_to: 6,
        period_to: 'pm',
        instapay: '',
        vodafone_cash: '',
        is_active: true,
      },
    ]);
  };

  const removeShift = (index: number) => {
    if (shifts.length <= 1) {
      Swal.fire({
        icon: 'info',
        title: 'تنبيه',
        text: 'يجب الإبقاء على شيفت عمل واحد على الأقل لكاشير المحل',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }
    setShifts((prev) => prev.filter((_, i) => i !== index));
  };

  /* Category ID for Business Profile */
  const BUSINESS_PROFILE_CATEGORY_ID = '6ac46e143883b08344234133';
  const isBusinessProfileCategory = Boolean(
    template === 'mobile_shop' ||
    categoryId === BUSINESS_PROFILE_CATEGORY_ID ||
    categories.find((c) => c._id === categoryId && (c.name.includes('نشاط') || c.name.toLowerCase().includes('business')))
  );

  /* Step Validation */
  const validateStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) {
      if (!cardCode.trim()) {
        Swal.fire({ icon: 'warning', title: 'حقل مطلوب', text: 'كود البطاقة مطلوب', confirmButtonColor: '#3b82f6' });
        return false;
      }
      if (!/^CARD-\d{4,}$/.test(cardCode.trim())) {
        Swal.fire({
          icon: 'warning',
          title: 'صيغة خاطئة',
          text: 'كود البطاقة يجب أن يكون بالصيغة CARD-XXXX مثل CARD-0001',
          confirmButtonColor: '#3b82f6',
        });
        return false;
      }
      const trimmedSlug = customSlug.trim().toLowerCase();
      if (trimmedSlug && !CUSTOM_SLUG_REGEX.test(trimmedSlug)) {
        Swal.fire({
          icon: 'warning',
          title: 'صيغة خاطئة للرابط المخصص',
          text: 'الرابط المخصص يقبل فقط حروف إنجليزية صغيرة، أرقام، والشرطة (-) بدون مسافات أو رموز خاصة (مثال: dr-ahmed)',
          confirmButtonColor: '#3b82f6',
        });
        return false;
      }
      if (!categoryId) {
        Swal.fire({ icon: 'warning', title: 'حقل مطلوب', text: 'يرجى اختيار تصنيف للبطاقة', confirmButtonColor: '#3b82f6' });
        return false;
      }
    }

    if (stepNumber === 2) {
      const waVal = bizData.whatsapp?.trim();
      if (waVal && !/^https?:\/\//i.test(waVal)) {
        Swal.fire({
          icon: 'warning',
          title: 'رابط واتساب غير صالح',
          text: 'يجب أن تقوم بإدخال رابط واتساب صحيح يبدأ بـ https:// (مثل: https://wa.me/201000000000) وليس مجرد رقم.',
          confirmButtonColor: '#3b82f6',
        });
        return false;
      }
    }

    if (stepNumber === 3 && template === 'mobile_shop') {
      if (shifts.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'شيفت مطلوب',
          text: 'يرجى إضافة شيفت عمل واحد على الأقل لكاشير المحل',
          confirmButtonColor: '#3b82f6',
        });
        return false;
      }
      for (let i = 0; i < shifts.length; i++) {
        if (!shifts[i].label.trim()) {
          Swal.fire({
            icon: 'warning',
            title: 'بيانات غير مكتملة',
            text: `يرجى تحديد مسمى للشيفت رقم ${i + 1}`,
            confirmButtonColor: '#3b82f6',
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (stepNumber: number) => {
    if (editCard || stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (validateStep(currentStep)) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── Submit Handler ── */
  const handleSubmit = async (e?: React.FormEvent, isQuickSave: boolean = false) => {
    if (e) e.preventDefault();

    console.log('🔍 [handleSubmit] Starting - currentStep:', currentStep, 'isQuickSave:', isQuickSave);
    console.log('🔍 [handleSubmit] bizData:', bizData);
    console.log('🔍 [handleSubmit] locations:', locations);

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      console.log('❌ [handleSubmit] Validation failed');
      return;
    }

    const trimmedSlug = customSlug.trim().toLowerCase();

    // Build business_data
    const business: BusinessData = {};
    let hasBiz = false;
    if (isBusinessProfileCategory) {
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

      // Add multiple locations if any exist
      if (locations.length > 0) {
        const validLocations = locations.filter(
          (loc) => loc.name.trim() && loc.google_maps_url.trim()
        );
        if (validLocations.length > 0) {
          (business as any).locations = validLocations.map((loc) => ({
            name: loc.name.trim(),
            google_maps_url: loc.google_maps_url.trim(),
          }));
          hasBiz = true;
        }
      }
    }

    // Payment shifts packaging for backend
    let paymentShiftsList: PaymentShift[] | undefined = undefined;
    if (template === 'mobile_shop') {
      paymentShiftsList = shifts.map((s, index) => ({
        label: s.label.trim() || `شيفت ${index + 1}`,
        cashier_name: s.cashier_name.trim() || undefined,
        hour_from: s.hour_from !== '' ? Number(s.hour_from) : undefined,
        period_from: s.period_from,
        hour_to: s.hour_to !== '' ? Number(s.hour_to) : undefined,
        period_to: s.period_to,
        instapay: s.instapay.trim() || undefined,
        vodafone_cash: s.vodafone_cash.trim() || undefined,
        priority: index,
        is_active: s.is_active,
      }));
    }

    // Handle redirect URL - always use Frontend domain
    const frontendDomain = 'https://k2rty.vercel.app';
    const formattedUrl = `${frontendDomain}/social/${cardCode.trim().toUpperCase()}`;

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
        const updateDto: ApiUpdateCardDto = {
          ...baseDto,
          custom_slug: trimmedSlug || null,
          template: template,
          payment_shifts: paymentShiftsList,
        };
        updateDto.business_data = isBusinessProfileCategory ? (hasBiz ? business : null) : null;

        const updated = await cardsApi.updateCard(editCard._id, updateDto);

        // Update Frontend state with the response from Backend
        setCustomSlug(updated.custom_slug || '');

        // Handle customer assignment change
        if (selectedCustomer?._id !== initialCustomer?._id) {
          if (initialCustomer) {
            await customersApi.unassignCard(initialCustomer._id, updated._id).catch(console.error);
          }
          if (selectedCustomer) {
            await customersApi.assignCards(selectedCustomer._id, { card_ids: [updated._id] }).catch(console.error);
          }
        }

        // If this is Quick Save (not final step), stay on current page and show success
        if (isQuickSave) {
          await Swal.fire({
            icon: 'success',
            title: 'تم الحفظ السريع!',
            text: `تم حفظ التعديلات للبطاقة ${updated.card_code}`,
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#3b82f6',
            timer: 2000,
          });
        } else {
          // Final submission
          await Swal.fire({
            icon: 'success',
            title: 'تم تعديل البطاقة بنجاح!',
            text: `تم حفظ التعديلات للبطاقة ${updated.card_code}`,
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#3b82f6',
          });
          navigate('/admin/cards');
        }
      } else {
        // Create mode
        const createDto: ApiCreateCardDto = {
          ...baseDto,
          card_code: cardCode.trim().toUpperCase(),
          template: template,
          payment_shifts: paymentShiftsList,
        };
        if (trimmedSlug) createDto.custom_slug = trimmedSlug;
        if (isBusinessProfileCategory && hasBiz) createDto.business_data = business;

        const created = await cardsApi.createCard(createDto);

        console.log('✅ [handleSubmit] Card created:', created);

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
              <p style="margin:4px 0;font-size:13px;color:#64748b">النوع: ${created.card_type} | القالب: ${created.template === 'mobile_shop' ? 'كاشير محلات الموبايل' : created.template === 'dark' ? 'القالب الليلي الفاخر' : 'الافتراضي'}</p>
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
            setBizData({
              business_name: '', logo: '', description: '', phone: '',
              email: '', whatsapp: '', instagram: '', facebook: '',
              tiktok: '', google_maps: '', website: '', instapay: '',
              vodafone_cash: '', maintenance_whatsapp: '', offers_url: '',
              telegram_group: '', google_review_url: '',
            });
            setLocations([]);
            setShifts([
              {
                label: 'شيفت الصباح',
                cashier_name: '',
                hour_from: 10,
                period_from: 'am',
                hour_to: 6,
                period_to: 'pm',
                instapay: '',
                vodafone_cash: '',
                is_active: true,
              },
              {
                label: 'شيفت المساء',
                cashier_name: '',
                hour_from: 6,
                period_from: 'pm',
                hour_to: 2,
                period_to: 'am',
                instapay: '',
                vodafone_cash: '',
                is_active: true,
              },
            ]);
            setSelectedCustomer(null);
            setCurrentStep(1);
            // Don't call loadData() here - it's not needed for form reset
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

  const selectedCategoryName = categories.find((c) => c._id === categoryId)?.name || 'غير محدد';

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font)', maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>

      {/* ══════ Top Header & Title ══════ */}
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
                {editCard ? `تعديل البطاقة ${editCard.card_code}` : 'معالج إنشاء بطاقة ذكية جديدة'}
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
                {editCard ? 'وضع التعديل' : 'خطوات منظمة'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--txt-muted)' }}>
              {editCard
                ? 'تحديث بيانات الكارت والشيفتات وهوية النشاط عبر خطوات منظمة'
                : 'اتبع الخطوات لإعداد بيانات الكارت، هوية النشاط، وإعدادات الكاشير والدفع'}
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
            <ExternalLink size={14} /> معاينة صفحة الكارت الحالية
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

      {/* ══════ Multi-Step Stepper Bar ══════ */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid var(--bdr-light)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            const isClickable = editCard || isCompleted || s.id === currentStep;

            return (
              <div
                key={s.id}
                onClick={() => isClickable && goToStep(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: isCurrent ? 'var(--clr-primary-50)' : isCompleted ? '#f0fdf4' : 'transparent',
                  border: isCurrent ? '1.5px solid var(--clr-primary-500)' : isCompleted ? '1.5px solid #bbf7d0' : '1px solid transparent',
                  cursor: isClickable ? 'pointer' : 'default',
                  opacity: isClickable ? 1 : 0.65,
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Step Number / Icon */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: isCurrent ? 'var(--clr-primary-500)' : isCompleted ? '#16a34a' : 'var(--bg-subtle)',
                    color: isCurrent || isCompleted ? '#ffffff' : 'var(--txt-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: isCurrent ? '0 4px 12px rgba(59, 130, 246, 0.28)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : s.icon}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: isCurrent ? 'var(--clr-primary-600)' : isCompleted ? '#16a34a' : 'var(--txt-muted)' }}>
                      الخطوة {s.id}
                    </span>
                    {isCompleted && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                        مكتملة
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: isCurrent ? 800 : 700,
                      color: isCurrent ? 'var(--clr-primary-900)' : isCompleted ? '#166534' : 'var(--txt-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {s.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Line */}
        <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '999px', marginTop: '14px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              backgroundColor: 'var(--clr-primary-500)',
              width: `${(currentStep / 4) * 100}%`,
              transition: 'width 0.25s ease',
              borderRadius: '999px',
            }}
          />
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 4) handleSubmit(); else handleNext(); }}>

        {/* ════════════════════════════════════════════════════════════
            STEP 1: بيانات الكارت ونوع القالب (Card & Template)
            ════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--bdr-light)',
              borderRadius: '20px',
              padding: '26px 28px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {/* Step 1 Header */}
            <div style={{ borderBottom: '1px solid var(--bdr-light)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--clr-primary-50)', color: 'var(--clr-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                      الخطوة 1: بيانات البطاقة ونوع القالب
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                      حدد كود البطاقة، التصنيف، الشكل الفيزيائي، ونموذج العرض المخصص
                    </p>
                  </div>
                </div>
                {fetchingData && (
                  <span style={{ fontSize: '12px', color: 'var(--txt-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={13} className="spin" /> تحميل البيانات...
                  </span>
                )}
              </div>
            </div>

            {/* Template Selection Cards */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: 'var(--clr-primary-500)' }} />
                  قالب صفحة العرض (Card Page Template) <span style={{ color: 'var(--clr-error)' }}>*</span>
                </span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '12px' }}>
                {/* Default Template */}
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

                {/* Mobile Shop Template */}
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
                      مخصص لنقاط البيع: تبديل الشيفتات، إنستاباي، فودافون كاش، وخدمات الصيانة والتقييم.
                    </p>
                  </div>
                </div>

                {/* Dark Theme Template */}
                <div
                  onClick={() => setTemplate('dark')}
                  style={{
                    border: template === 'dark' ? '2px solid #0f172a' : '1px solid var(--bdr-light)',
                    backgroundColor: template === 'dark' ? 'rgba(15, 23, 42, 0.06)' : 'var(--bg-subtle)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#67e8f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: template === 'dark' ? '#0f172a' : 'var(--txt-heading)' }}>
                        القالب الليلي الفاخر (Dark)
                      </span>
                      {template === 'dark' && <Check size={16} style={{ color: '#0f172a' }} />}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--txt-muted)', lineHeight: 1.5 }}>
                      واجهة كحلية عميقة بلمسات سماوية مضيئة، مع الحفاظ على نفس ترتيب المحتوى والروابط.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid for Primary Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '18px' }}>
              {/* Card Code */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={15} style={{ color: 'var(--clr-primary-500)' }} />
                    كود البطاقة <span style={{ color: 'var(--clr-error)' }}>*</span>
                  </span>
                </label>
                <input
                  className="form-input"
                  value={cardCode}
                  onChange={(e) => {
                    setCardCode(e.target.value.toUpperCase());
                    setAutoCode(false);
                  }}
                  placeholder="CARD-0001"
                  required
                  style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px', fontSize: '14.5px' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                  صيغة الكود: CARD-XXXX (يتم توليده تلقائياً بالتسلسل)
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
                <input
                  className="form-input"
                  dir="ltr"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase())}
                  placeholder="dr-ahmed"
                  style={{ textAlign: 'left', fontWeight: 600, fontSize: '14px' }}
                />
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
              </div>

              {/* Physical Card Type */}
              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                  شكل المنتج الفيزيائي <span style={{ color: 'var(--clr-error)' }}>*</span>
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
                          padding: '10px 8px',
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

              {/* Subscription Type */}
              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                  نظام الاشتراك
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                      padding: '9px 12px', borderRadius: '10px',
                      border: `2px solid ${requiresSubscription ? 'var(--clr-primary-500)' : 'var(--bdr-light)'}`,
                      backgroundColor: requiresSubscription ? 'var(--clr-primary-50)' : 'var(--bg-subtle)',
                      flex: 1,
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
                        باشتراك سنوي
                      </span>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                      padding: '9px 12px', borderRadius: '10px',
                      border: `2px solid ${!requiresSubscription ? '#16a34a' : 'var(--bdr-light)'}`,
                      backgroundColor: !requiresSubscription ? '#f0fdf4' : 'var(--bg-subtle)',
                      flex: 1,
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
                    </div>
                  </label>
                </div>
              </div>

              {/* Customer Link Section */}
              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
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
                      width: '100%', padding: '12px', borderRadius: '10px',
                      border: '1px dashed var(--clr-primary-300)', backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--clr-primary-600)', fontWeight: 700, fontSize: '13.5px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    <Plus size={16} /> اختيار العميل لربط الكارت به
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 2: هوية النشاط والتواصل (Business & Contact)
            ════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--bdr-light)',
              borderRadius: '20px',
              padding: '26px 28px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Step 2 Header */}
            <div style={{ borderBottom: '1px solid var(--bdr-light)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    الخطوة 2: هوية النشاط التجاري وقنوات التواصل
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                    اسم النشاط، الشعار، النبذة التعريفية، وحسابات التواصل الاجتماعي
                  </p>
                </div>
              </div>
            </div>

            {/* Business Info & Logo */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--bdr-light)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} style={{ color: 'var(--clr-primary-600)' }} />
                1. البيانات الأساسية والشعار
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '18px' }}>
                {/* Business Name */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                    اسم النشاط التجاري / الشخصي
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    value={bizData.business_name || ''}
                    onChange={(e) => updateBiz('business_name', e.target.value)}
                    placeholder="مثال: توب فون للإلكترونيات أو عيادة د. أحمد"
                    maxLength={120}
                    style={{ fontSize: '13.5px', backgroundColor: '#fff' }}
                  />
                </div>

                {/* Logo Upload Component */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>
                      شعار النشاط أو الصورة الشخصية (Logo)
                    </label>
                    <button
                      type="button"
                      onClick={() => setLogoMode(logoMode === 'upload' ? 'url' : 'upload')}
                      style={{ background: 'none', border: 'none', color: 'var(--clr-primary-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {logoMode === 'upload' ? '🔗 أو إدخال رابط خارجي (URL)' : '📁 أو رفع ملف من الجهاز'}
                    </button>
                  </div>

                  {logoMode === 'upload' ? (
                    <div>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--bdr-light)', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img src={bizData.logo} alt="Preview" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt-heading)' }}>تم اختيار الشعار</div>
                              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>جاهز للعرض ✓</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>
                              تغيير الصورة
                            </button>
                            <button type="button" onClick={() => updateBiz('logo', '')} style={{ background: '#fff', border: '1px solid var(--clr-error-bdr)', color: 'var(--clr-error)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleLogoFile(e.dataTransfer.files[0]); }}
                          style={{
                            border: `2px dashed ${dragOver ? 'var(--clr-primary-500)' : 'var(--bdr-medium)'}`,
                            borderRadius: '12px', padding: '24px', textAlign: 'center', backgroundColor: dragOver ? 'var(--clr-primary-50)' : '#fff', cursor: 'pointer',
                          }}
                        >
                          <UploadCloud size={30} style={{ color: 'var(--clr-primary-500)', margin: '0 auto 8px' }} />
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--txt-heading)' }}>
                            اضغط لاختيار صورة أو اسحبها هنا
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--txt-muted)', marginTop: '4px' }}>
                            PNG, JPG, WEBP بحد أقصى 5 ميجابايت
                          </div>
                        </div>
                      )}
                      {uploadStatus && (
                        <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600, color: uploadingLogo ? 'var(--clr-primary-600)' : '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {uploadingLogo && <span className="spinner-border spinner-border-sm" role="status" />}
                          {uploadStatus}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      className="form-input"
                      type="url"
                      dir="ltr"
                      value={bizData.logo || ''}
                      onChange={(e) => updateBiz('logo', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      style={{ fontSize: '13.5px', backgroundColor: '#fff' }}
                    />
                  )}
                </div>

                {/* Description */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                    نبذة عن النشاط (الوصف)
                  </label>
                  <textarea
                    className="form-input"
                    value={bizData.description || ''}
                    onChange={(e) => updateBiz('description', e.target.value)}
                    placeholder="اكتب نبذة مختصرة عن الخدمات لتعريف العملاء بنشاطك..."
                    rows={2}
                    maxLength={500}
                    style={{ resize: 'vertical', minHeight: '65px', fontSize: '13.5px', backgroundColor: '#fff' }}
                  />
                </div>
              </div>
            </div>

            {/* Contact Channels */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--bdr-light)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: '#059669' }} />
                2. قنوات الاتصال والموقع
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '16px' }}>
                {CONTACT_FIELDS.map((f) => (
                  <div key={f.key} className="form-group" style={f.gridFull ? { gridColumn: '1 / -1' } : undefined}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {f.icon}
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
                      style={{ fontSize: '13px', backgroundColor: '#fff' }}
                    />
                    {f.hint && <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>{f.hint}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Accounts */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--bdr-light)' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Instagram size={16} style={{ color: '#e1306c' }} />
                3. حسابات التواصل الاجتماعي (Social Media)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '16px' }}>
                {SOCIAL_FIELDS.map((f) => (
                  <div key={f.key} className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {f.icon}
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
                      style={{ fontSize: '13px', backgroundColor: '#fff' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Multiple Locations */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--bdr-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={16} style={{ color: '#0891b2' }} />
                  4. الفروع والمواقع الإضافية (Multiple Locations)
                </h3>
                <button
                  type="button"
                  onClick={addLocation}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0891b2',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  إضافة فرع
                </button>
              </div>

              {locations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--txt-muted)', fontSize: '13px' }}>
                  لم تضف أي فروع حتى الآن. اضغط على "إضافة فرع" لإضافة مواقع متعددة لنشاطك.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {locations.map((loc, idx) => (
                    <div
                      key={loc.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--bdr-light)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: 'var(--clr-primary-50)', color: 'var(--clr-primary-600)', padding: '3px 10px', borderRadius: '6px' }}>
                          فرع #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLocation(loc.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--clr-error)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="حذف هذا الفرع"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                            اسم الفرع
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            value={loc.name}
                            onChange={(e) => updateLocation(loc.id, 'name', e.target.value)}
                            placeholder="الفرع الأول، الفرع الرئيسي، إلخ"
                            style={{ fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                            رابط خرائط جوجل
                          </label>
                          <input
                            className="form-input"
                            type="url"
                            dir="ltr"
                            value={loc.google_maps_url}
                            onChange={(e) => updateLocation(loc.id, 'google_maps_url', e.target.value)}
                            placeholder="https://maps.app.goo.gl/... أو https://g.page/r/..."
                            style={{ fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 3: الكاشير وبوابات الدفع (Cashier & Payments)
            ════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--bdr-light)',
              borderRadius: '20px',
              padding: '26px 28px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Step 3 Header */}
            <div style={{ borderBottom: '1px solid var(--bdr-light)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={22} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    الخطوة 3: إعدادات الكاشير والدفع والخدمات
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                    {template === 'mobile_shop'
                      ? 'إعدادات شيفت الكاشير، بوابات إنستاباي وفودافون كاش، وخدمات الصيانة والتقييم'
                      : 'بوابات الدفع والتحويل المالي السريع (إنستاباي وفودافون كاش)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Multi-Shift Payment Builder (For Mobile Shop Template) */}
            {template === 'mobile_shop' && (
              <div
                style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.04)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(139, 92, 246, 0.15)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#581c87' }}>
                        إدارة شيفتات العمل وحسابات الكاشير (Multi-Shift Builder)
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#7c3aed' }}>
                        أضف شيفتات العمل (صباحي، مسائي، ليلي) مع تخصيص اسم الكاشير وساعاته وحسابات إنستاباي وفودافون كاش لكل شيفت
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addShift}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#7c3aed',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    <Plus size={16} />
                    إضافة شيفت جديد
                  </button>
                </div>

                {/* List of Shifts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {shifts.map((shift, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      {/* Shift Card Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', padding: '3px 10px', borderRadius: '8px' }}>
                            شيفت #{idx + 1}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                            {shift.label || `شيفت ${idx + 1}`}
                          </span>
                        </div>
                        {shifts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShift(idx)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              border: '1px solid #fee2e2',
                              backgroundColor: '#fff5f5',
                              color: '#ef4444',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="حذف هذا الشيفت"
                          >
                            <Trash2 size={13} />
                            حذف الشيفت
                          </button>
                        )}
                      </div>

                      {/* Shift Inputs Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '14px' }}>
                        {/* Shift Label */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>
                            مسمى الشيفت
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            value={shift.label}
                            onChange={(e) => updateShift(idx, 'label', e.target.value)}
                            placeholder="مثال: شيفت الصباح"
                            style={{ fontSize: '13px', backgroundColor: '#fff' }}
                          />
                          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                            {['شيفت الصباح', 'شيفت المساء', 'شيفت الليل'].map((lbl) => (
                              <button
                                key={lbl}
                                type="button"
                                onClick={() => updateShift(idx, 'label', lbl)}
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(139, 92, 246, 0.25)',
                                  backgroundColor: shift.label === lbl ? '#8b5cf6' : '#fff',
                                  color: shift.label === lbl ? '#fff' : '#6b21a8',
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
                            value={shift.cashier_name}
                            onChange={(e) => updateShift(idx, 'cashier_name', e.target.value)}
                            placeholder="مثال: أحمد"
                            style={{ fontSize: '13px', backgroundColor: '#fff' }}
                          />
                          <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                            يظهر اسمه للعملاء في هذا الشيفت
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
                              value={shift.hour_from}
                              onChange={(e) => updateShift(idx, 'hour_from', e.target.value ? Number(e.target.value) : '')}
                              placeholder="10"
                              style={{ width: '70px', textAlign: 'center', fontWeight: 700, fontSize: '13px', backgroundColor: '#fff' }}
                            />
                            <select
                              className="form-input"
                              value={shift.period_from}
                              onChange={(e) => updateShift(idx, 'period_from', e.target.value as 'am' | 'pm')}
                              style={{ flex: 1, fontWeight: 700, fontSize: '13px', backgroundColor: '#fff' }}
                            >
                              <option value="am">صباحاً (ص)</option>
                              <option value="pm">مساءً (م)</option>
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
                              value={shift.hour_to}
                              onChange={(e) => updateShift(idx, 'hour_to', e.target.value ? Number(e.target.value) : '')}
                              placeholder="6"
                              style={{ width: '70px', textAlign: 'center', fontWeight: 700, fontSize: '13px', backgroundColor: '#fff' }}
                            />
                            <select
                              className="form-input"
                              value={shift.period_to}
                              onChange={(e) => updateShift(idx, 'period_to', e.target.value as 'am' | 'pm')}
                              style={{ flex: 1, fontWeight: 700, fontSize: '13px', backgroundColor: '#fff' }}
                            >
                              <option value="pm">مساءً (م)</option>
                              <option value="am">صباحاً (ص)</option>
                            </select>
                          </div>
                        </div>

                        {/* Shift InstaPay */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CreditCard size={14} style={{ color: '#7c3aed' }} />
                            حساب إنستاباي لهذا الشيفت
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            dir="ltr"
                            value={shift.instapay}
                            onChange={(e) => updateShift(idx, 'instapay', e.target.value)}
                            placeholder="username@instapay أو رابط الحساب"
                            style={{ fontSize: '13px', backgroundColor: '#fff' }}
                          />
                          <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                            يتم نسخه تلقائياً عند الضغط أثناء هذا الشيفت
                          </span>
                        </div>

                        {/* Shift Vodafone Cash */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Smartphone size={14} style={{ color: '#ef4444' }} />
                            رقم فودافون كاش لهذا الشيفت
                          </label>
                          <input
                            className="form-input"
                            type="tel"
                            dir="ltr"
                            value={shift.vodafone_cash}
                            onChange={(e) => updateShift(idx, 'vodafone_cash', e.target.value)}
                            placeholder="01012345678"
                            style={{ fontSize: '13px', backgroundColor: '#fff' }}
                          />
                          <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                            يتم نسخه فوراً للدفع عبر فودافون كاش
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fast Payment Options (Only for default template) */}
            {template !== 'mobile_shop' && (
              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--bdr-light)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} style={{ color: '#7c3aed' }} />
                  طرق الدفع والتحويل المالي السريع
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '16px' }}>
                  {PAYMENT_FIELDS.map((f) => (
                    <div key={f.key} className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {f.icon}
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
            )}

            {/* Mobile Shop Services and Review Gate */}
            {template === 'mobile_shop' && (
              <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.04)', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={16} style={{ color: '#8b5cf6' }} />
                    خدمات محلات الموبايل وبوابة تقييم Google Maps
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                    قالب الكاشير مفعل ⭐
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '16px' }}>
                  {MOBILE_SHOP_FIELDS.map((f) => (
                    <div key={f.key} className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {f.icon}
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
                        display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer',
                        padding: '12px 16px', borderRadius: '12px',
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
            )}

            {/* Direct Redirect URL (Automatic Frontend) */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '18px 20px', border: '1px solid var(--bdr-light)' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LinkIcon size={15} style={{ color: 'var(--clr-primary-500)' }} />
                    رابط التوجيه المباشر (Redirect URL)
                    <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--clr-primary-50)', color: 'var(--clr-primary-700)' }}>تلقائي</span>
                  </span>
                </label>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid var(--bdr-light)',
                  fontSize: '13.5px',
                  color: 'var(--clr-primary-700)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}>
                  <span>{`https://k2rty.vercel.app/social/${cardCode.trim().toUpperCase() || 'CARD-XXXX'}`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `https://k2rty.vercel.app/social/${cardCode.trim().toUpperCase()}`;
                      navigator.clipboard.writeText(url);
                      Swal.fire({
                        icon: 'success',
                        title: 'تم النسخ',
                        text: 'تم نسخ الرابط إلى الحافظة',
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--clr-primary-600)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      padding: '4px',
                    }}
                    title="نسخ الرابط"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                  ✅ الرابط يُنشأ تلقائياً من كود البطاقة. عند الضغط عليه أو الـ QR code، العميل بيُوجَّه مباشرة لصفحة البطاقة التفاعلية.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 4: مراجعة وتأكيد (Review & Confirm)
            ════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--bdr-light)',
              borderRadius: '20px',
              padding: '26px 28px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Step 4 Header */}
            <div style={{ borderBottom: '1px solid var(--bdr-light)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(234, 179, 8, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    الخطوة 4: مراجعة وتأكيد بيانات البطاقة
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                    راجع تفاصيل البطاقة وهوية النشاط وإعدادات الكاشير قبل الحفظ النهائي
                  </p>
                </div>
              </div>
            </div>

            {/* Review Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '16px' }}>
              {/* Card 1: Card & Template Summary */}
              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '16px', border: '1px solid var(--bdr-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={15} style={{ color: 'var(--clr-primary-500)' }} />
                    بيانات الكارت
                  </span>
                  <button type="button" onClick={() => goToStep(1)} style={{ background: 'none', border: 'none', color: 'var(--clr-primary-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Edit2 size={12} /> تعديل
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div><span style={{ color: 'var(--txt-muted)' }}>كود الكارت:</span> <strong style={{ color: 'var(--clr-primary-700)', fontFamily: 'monospace' }}>{cardCode}</strong></div>
                  <div><span style={{ color: 'var(--txt-muted)' }}>التصنيف:</span> <strong>{selectedCategoryName}</strong></div>
                  <div><span style={{ color: 'var(--txt-muted)' }}>الشكل الفيزيائي:</span> <strong>{cardType}</strong></div>
                  <div><span style={{ color: 'var(--txt-muted)' }}>الاشتراك:</span> <strong>{requiresSubscription ? 'سنوي' : 'دائم مدى الحياة ♾'}</strong></div>
                  <div>
                    <span style={{ color: 'var(--txt-muted)' }}>القالب:</span>{' '}
                    <span style={{ backgroundColor: template === 'mobile_shop' ? '#f3e8ff' : template === 'dark' ? '#e0f2fe' : '#eff6ff', color: template === 'mobile_shop' ? '#7e22ce' : template === 'dark' ? '#0f172a' : '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '11.5px' }}>
                      {template === 'mobile_shop' ? '📱 كاشير محلات الموبايل' : template === 'dark' ? '🌙 القالب الليلي الفاخر' : '🌟 القالب الافتراضي'}
                    </span>
                  </div>
                  {customSlug && (
                    <div><span style={{ color: 'var(--txt-muted)' }}>الرابط المخصص:</span> <code style={{ color: '#16a34a' }}>/social/{customSlug}</code></div>
                  )}
                  {selectedCustomer && (
                    <div><span style={{ color: 'var(--txt-muted)' }}>العميل المربوط:</span> <strong>{selectedCustomer.name}</strong></div>
                  )}
                </div>
              </div>

              {/* Card 2: Business & Identity Summary */}
              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '16px', border: '1px solid var(--bdr-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} style={{ color: '#16a34a' }} />
                    هوية النشاط
                  </span>
                  <button type="button" onClick={() => goToStep(2)} style={{ background: 'none', border: 'none', color: 'var(--clr-primary-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Edit2 size={12} /> تعديل
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  {bizData.logo ? (
                    <img src={bizData.logo} alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <Building2 size={24} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--txt-heading)' }}>
                      {bizData.business_name || 'بدون اسم محدد'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--txt-muted)', lineClamp: 1, overflow: 'hidden' }}>
                      {bizData.description || 'بدون نبذة'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--txt-secondary)' }}>
                  {bizData.phone && <div>📞 هاتف: <span dir="ltr">{bizData.phone}</span></div>}
                  {bizData.whatsapp && <div>💬 واتساب: <span dir="ltr">{bizData.whatsapp}</span></div>}
                  {bizData.email && <div>✉️ بريد: <span dir="ltr">{bizData.email}</span></div>}
                  {bizData.website && <div>🌐 موقع: <span dir="ltr">{bizData.website}</span></div>}
                </div>
              </div>

              {/* Card 3: Cashier & Payments Summary */}
              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '14px', padding: '16px', border: '1px solid var(--bdr-light)', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={15} style={{ color: '#7c3aed' }} />
                    إعدادات الكاشير والدفع
                  </span>
                  <button type="button" onClick={() => goToStep(3)} style={{ background: 'none', border: 'none', color: 'var(--clr-primary-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Edit2 size={12} /> تعديل
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '12px', fontSize: '12.5px' }}>
                  {template === 'mobile_shop' ? (
                    shifts.map((s, idx) => (
                      <div key={idx} style={{ backgroundColor: '#fff', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--bdr-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: 800, color: '#7c3aed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{s.label || `شيفت ${idx + 1}`}</span>
                          <span style={{ fontSize: '11px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', padding: '2px 8px', borderRadius: '6px' }}>#{idx + 1}</span>
                        </div>
                        <div>الكاشير: <strong>{s.cashier_name || '—'}</strong></div>
                        <div>ساعات العمل: <strong>{s.hour_from ? `${s.hour_from} ${s.period_from === 'pm' ? 'م' : 'ص'}` : '—'} إلى {s.hour_to ? `${s.hour_to} ${s.period_to === 'pm' ? 'م' : 'ص'}` : '—'}</strong></div>
                        <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #e2e8f0', fontSize: '11.5px', color: '#475569' }}>
                          <div>إنستاباي: <strong dir="ltr">{s.instapay || '—'}</strong></div>
                          <div>فودافون كاش: <strong dir="ltr">{s.vodafone_cash || '—'}</strong></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ backgroundColor: '#fff', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--bdr-light)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--txt-heading)', marginBottom: '4px' }}>بوابات الدفع الفوري:</div>
                      <div>إنستاباي: <strong>{bizData.instapay || 'غير محدد'}</strong></div>
                      <div>فودافون كاش: <strong>{bizData.vodafone_cash || 'غير محدد'}</strong></div>
                    </div>
                  )}

                  {template === 'mobile_shop' && (
                    <div style={{ backgroundColor: '#fff', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--bdr-light)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--txt-heading)', marginBottom: '4px' }}>خدمات المحل والتقييم:</div>
                      <div>واتساب الصيانة: <strong>{bizData.maintenance_whatsapp ? 'موجود ✓' : '—'}</strong></div>
                      <div>قناة العروض: <strong>{bizData.offers_url ? 'موجودة ✓' : '—'}</strong></div>
                      <div>بوابة تقييم Google: <strong>{enableReviewGate ? 'مفعلة بالفلترة ⭐' : 'مباشرة'}</strong></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════ Bottom Stepper Navigation Actions Bar ══════ */}
        <div
          className="responsive-bottom-bar"
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
            marginTop: '20px',
          }}
        >
          {/* Back Step / Cancel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn-outline"
                onClick={handlePrev}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowRight size={16} />
                <span>الخطوة السابقة</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-outline"
                onClick={() => navigate('/admin/cards')}
                style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700 }}
              >
                إلغاء
              </button>
            )}

            <span style={{ fontSize: '12.5px', color: 'var(--txt-muted)' }}>
              الخطوة {currentStep} من 4
            </span>
          </div>

          {/* Next / Final Submit Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {currentStep < 4 ? (
              <>
                {/* Quick Save Button (Steps 1-3) */}
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    if (validateStep(currentStep)) {
                      handleSubmit(undefined, true);
                    }
                  }}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    border: '2px solid #10b981',
                    color: '#10b981',
                    backgroundColor: '#ecfdf5',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>حفظ سريع</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>متابعة للخطوة التالية</span>
                  <ArrowLeft size={16} />
                </button>
              </>
            ) : (
              <>
                {/* Quick Save Button in Step 4 */}
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    if (validateStep(1) && validateStep(2) && validateStep(3)) {
                      handleSubmit(undefined, true);
                    }
                  }}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    border: '2px solid #10b981',
                    color: '#10b981',
                    backgroundColor: '#ecfdf5',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>حفظ سريع</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSubmit()}
                  disabled={loading || !isFormValid}
                  style={{
                    minWidth: '200px',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  }}
                >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>{editCard ? 'جاري حفظ التعديلات...' : 'جاري إنشاء البطاقة...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>{editCard ? 'حفظ التعديلات النهائية' : 'إتمام وإنشاء البطاقة الذكية 🎉'}</span>
                  </>
                )}
              </button>
              </>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export default AdminAddCardPage;
