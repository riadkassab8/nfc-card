import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { cardsApi } from '../../services/api/cardsApi';
import { categoriesApi } from '../../services/api/categoriesApi';
import { customersApi } from '../../services/api/customersApi';
import { SelectCustomerModal } from '../../components/admin/SelectCustomerModal';
import {
  ApiCategory,
  ApiCustomer,
  ApiCard,
  ApiUpdateCardDto,
  CardType,
  CARD_TYPES,
  BusinessData,
  PaymentShift,
  PaymentShiftFormItem,
  isBulkMode,
  ApiBulkCardUpdateDto,
} from '../../types';
import {
  ArrowRight,
  Save,
  CreditCard,
  Globe,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MapPin,
  MessageCircle,
  Video,
  Link as LinkIcon,
  RefreshCw,
  Smartphone,
  Check,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  Trash2,
  User,
  Clock,
  Store,
  Star,
  Edit2,
  Building2,
  ChevronLeft,
  Plus,
  UserCheck,
} from 'lucide-react';

/* ── Field definitions ─────────────────────────────────────────── */
interface BizFieldDef {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  hint?: string;
  dir?: 'rtl' | 'ltr';
}

const CUSTOM_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function getCategoryId(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val._id) return val._id;
  return '';
}

const BIZ_GENERAL_FIELDS: BizFieldDef[] = [
  { key: 'phone', label: 'رقم الهاتف المباشر', placeholder: '01012345678', type: 'tel', icon: <Phone size={16} />, dir: 'ltr' },
  { key: 'whatsapp', label: 'رابط واتساب مباشر', placeholder: 'https://wa.me/201012345678', type: 'url', icon: <MessageCircle size={16} />, hint: 'يجب أن يبدأ بـ https://wa.me/', dir: 'ltr' },
  { key: 'email', label: 'البريد الإلكتروني للعمل', placeholder: 'contact@store.com', type: 'email', icon: <Mail size={16} />, dir: 'ltr' },
  { key: 'website', label: 'الموقع الإلكتروني أو المتجر', placeholder: 'https://example.com', type: 'url', icon: <Globe size={16} />, dir: 'ltr' },
  { key: 'google_maps', label: 'رابط خرائط جوجل (Google Maps)', placeholder: 'https://maps.app.goo.gl/...', type: 'url', icon: <MapPin size={16} />, dir: 'ltr' },
];

const BIZ_SOCIAL_FIELDS: BizFieldDef[] = [
  { key: 'instagram', label: 'رابط إنستجرام', placeholder: 'https://instagram.com/account', type: 'url', icon: <Instagram size={16} />, dir: 'ltr' },
  { key: 'facebook', label: 'رابط فيسبوك', placeholder: 'https://facebook.com/page', type: 'url', icon: <Facebook size={16} />, dir: 'ltr' },
  { key: 'tiktok', label: 'رابط تيك توك', placeholder: 'https://tiktok.com/@channel', type: 'url', icon: <Video size={16} />, dir: 'ltr' },
];

const MOBILE_SHOP_CHANNELS: BizFieldDef[] = [
  {
    key: 'maintenance_whatsapp',
    label: 'رقم واتساب قسم الصيانة والاستفسارات',
    placeholder: '201012345678 أو https://wa.me/201012345678',
    type: 'text',
    icon: <MessageCircle size={16} />,
    hint: 'يستخدم لفتح محادثة فورية عند الضغط على "تواصل مع الصيانة"',
    dir: 'ltr',
  },
  {
    key: 'offers_url',
    label: 'رابط عروض وأسعار اليوم (Telegram أو صفحة عروض)',
    placeholder: 'https://t.me/top_phone_offers',
    type: 'url',
    icon: <LinkIcon size={16} />,
    hint: 'زر مميز لنشر العروض اليومية وأحدث الأسعار لعملائك',
    dir: 'ltr',
  },
  {
    key: 'telegram_group',
    label: 'رابط جروب أو قناة التليجرام العامة',
    placeholder: 'https://t.me/top_phone_channel',
    type: 'url',
    icon: <MessageCircle size={16} />,
    hint: 'للانضمام لمجتمع عملاء المحل وتبادل الأجهزة والاستفسارات',
    dir: 'ltr',
  },
  {
    key: 'google_review_url',
    label: 'رابط التقييم المباشر على Google Maps',
    placeholder: 'https://g.page/r/YOUR_PLACE/review أو https://maps.app.goo.gl/...',
    type: 'url',
    icon: <MapPin size={16} />,
    hint: 'الرابط الذي يتم توجيه العميل إليه عند منحه تقييماً إيجابياً',
    dir: 'ltr',
  },
];

/* ── Steps Configuration ───────────────────────────────────────── */
const STEPS = [
  { id: 1, title: 'بيانات الكارت والقالب', desc: 'الكود، التصنيف، القالب، والاشتراك', icon: <CreditCard size={18} /> },
  { id: 2, title: 'هوية النشاط والتواصل', desc: 'الاسم، الشعار، وقنوات الاتصال', icon: <Building2 size={18} /> },
  { id: 3, title: 'الكاشير وطرق الدفع', desc: 'الشيفتات، الدفع الفوري، والتقييم', icon: <Smartphone size={18} /> },
  { id: 4, title: 'مراجعة وتأكيد', desc: 'ملخص البيانات وحفظ التعديلات', icon: <Sparkles size={18} /> },
];

export const AdminEditCardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customerId');
  const navigate = useNavigate();

  /* ── Detect bulk vs single mode ── */
  const bulkMode = isBulkMode(id, customerId ?? undefined);

  const [loadingCard, setLoadingCard] = useState<boolean>(true);
  const [currentCard, setCurrentCard] = useState<ApiCard | null>(null);
  
  /* Bulk mode state */
  const [affectedCards, setAffectedCards] = useState<ApiCard[]>([]);

  /* Step state */
  const [currentStep, setCurrentStep] = useState<number>(bulkMode ? 2 : 1);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [saving, setSaving] = useState(false);

  /* Card state */
  const [cardCode, setCardCode] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [cardType, setCardType] = useState<string>(CardType.CARD);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [requiresSubscription, setRequiresSubscription] = useState<boolean>(true);

  /* Template & Payment Shifts state */
  const [template, setTemplate] = useState<string>('default');
  const [shifts, setShifts] = useState<PaymentShiftFormItem[]>([
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
  const [enableReviewGate, setEnableReviewGate] = useState<boolean>(true);

  /* Customer link state */
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(null);
  const [initialCustomer, setInitialCustomer] = useState<ApiCustomer | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  /* Business data state */
  const [bizData, setBizData] = useState<Record<string, string>>({
    business_name: '',
    logo: '',
    description: '',
    phone: '',
    email: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    google_maps: '',
    website: '',
    instapay: '',
    vodafone_cash: '',
    maintenance_whatsapp: '',
    offers_url: '',
    telegram_group: '',
    google_review_url: '',
  });

  /* Multiple Locations state */
  interface Location {
    id: string;
    name: string;
    google_maps_url: string;
  }
  const [locations, setLocations] = useState<Location[]>([]);

  /* Logo upload state & handlers */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [logoMode, setLogoMode] = useState<'upload' | 'url'>('upload');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

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
    setLocations((prev) => prev.map((loc) => loc.id === id ? { ...loc, [field]: value } : loc));
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

  /* Initialize form for bulk edit mode - populate common data from cards */
  const initializeFormForBulkMode = useCallback((cards: ApiCard[]) => {
    // Set current step to 2 for bulk mode (skip step 1)
    setCurrentStep(2);
    
    // Initialize with default/empty values as baseline
    setCardCode('');
    setCustomSlug('');
    setCardType(CardType.CARD);
    setRedirectUrl('');
    setCategoryId('');
    setRequiresSubscription(true);
    
    // Detect common template and business data across all cards
    if (cards.length > 0) {
      // Find common template
      const templates = cards.map(c => c.template || 'default');
      const commonTemplate = templates.every(t => t === templates[0]) ? templates[0] : 'default';
      setTemplate(commonTemplate);

      // Extract common business data
      const businessDataList = cards.map(c => c.business_data || {});
      
      // Helper to check if all cards have same value for a field
      const getCommonValue = (field: string): string => {
        const values = businessDataList.map((b: any) => b[field] || '');
        return values.every((v: string) => v === values[0]) ? values[0] : '';
      };

      // Populate business data with common values
      setBizData({
        business_name: getCommonValue('business_name'),
        logo: getCommonValue('logo'),
        description: getCommonValue('description'),
        phone: getCommonValue('phone'),
        email: getCommonValue('email'),
        whatsapp: getCommonValue('whatsapp'),
        instagram: getCommonValue('instagram'),
        facebook: getCommonValue('facebook'),
        tiktok: getCommonValue('tiktok'),
        google_maps: getCommonValue('google_maps'),
        website: getCommonValue('website'),
        instapay: getCommonValue('instapay'),
        vodafone_cash: getCommonValue('vodafone_cash'),
        maintenance_whatsapp: getCommonValue('maintenance_whatsapp'),
        offers_url: getCommonValue('offers_url'),
        telegram_group: getCommonValue('telegram_group'),
        google_review_url: getCommonValue('google_review_url'),
      });

      // Check if all cards have enable_review_gate setting
      const reviewGateSettings = businessDataList.map((b: any) => b.enable_review_gate ?? true);
      const commonReviewGate = reviewGateSettings.every((v: boolean) => v === reviewGateSettings[0]) ? reviewGateSettings[0] : true;
      setEnableReviewGate(commonReviewGate);

      // Extract common payment shifts for mobile_shop
      if (commonTemplate === 'mobile_shop') {
        const shiftsList = cards.map(c => c.payment_shifts || []);
        
        // Check if all cards have the same shifts structure
        const shiftsJSON = shiftsList.map(s => JSON.stringify(s));
        const allSame = shiftsJSON.every(s => s === shiftsJSON[0]);
        
        if (allSame && shiftsList[0].length > 0) {
          // Use existing shifts from first card (they're all the same)
          setShifts(
            shiftsList[0].map((s: any) => ({
              label: s.label || 'شيفت الكاشير',
              cashier_name: s.cashier_name || '',
              hour_from: s.hour_from ?? '',
              period_from: s.period_from || 'pm',
              hour_to: s.hour_to ?? '',
              period_to: s.period_to || 'am',
              instapay: s.instapay || '',
              vodafone_cash: s.vodafone_cash || '',
              is_active: s.is_active ?? true,
            }))
          );
        } else {
          // Shifts differ - use defaults
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
        }
      } else {
        // Not mobile_shop - use default shifts
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
      }

      // Extract common locations
      const locationsList = businessDataList.map((b: any) => b.locations || []);
      const locationsJSON = locationsList.map(l => JSON.stringify(l));
      const allLocationsSame = locationsJSON.every(l => l === locationsJSON[0]);
      
      if (allLocationsSame && locationsList[0].length > 0) {
        setLocations(locationsList[0].map((loc: any, index: number) => ({
          id: `loc-${index}`,
          name: loc.name || `فرع ${index + 1}`,
          google_maps_url: loc.google_maps_url || '',
        })));
      } else {
        setLocations([]);
      }

      setSelectedCustomer(null);
      setInitialCustomer(null);
    } else {
      // Fallback if no cards (shouldn't happen)
      setTemplate('default');
      setBizData({
        business_name: '',
        logo: '',
        description: '',
        phone: '',
        email: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        google_maps: '',
        website: '',
        instapay: '',
        vodafone_cash: '',
        maintenance_whatsapp: '',
        offers_url: '',
        telegram_group: '',
        google_review_url: '',
      });
      setEnableReviewGate(true);
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
      setLocations([]);
    }
  }, []);

  /* Populate form from card */
  const populateFromCard = useCallback(async (card: ApiCard) => {
    setCurrentCard(card);
    setCardCode(card.card_code || '');
    setCustomSlug(card.custom_slug || '');
    setCardType(card.card_type || CardType.CARD);
    setRedirectUrl(card.current_redirect_url || '');
    setCategoryId(getCategoryId(card.category_id) || '');
    setRequiresSubscription(card.requires_subscription ?? true);
    setTemplate(card.template || 'default');

    // Populate shifts
    if (card.payment_shifts && card.payment_shifts.length > 0) {
      setShifts(
        card.payment_shifts.map((s) => ({
          label: s.label || 'شيفت الكاشير',
          cashier_name: s.cashier_name || '',
          hour_from: s.hour_from ?? '',
          period_from: s.period_from || 'pm',
          hour_to: s.hour_to ?? '',
          period_to: s.period_to || 'am',
          instapay: s.instapay || '',
          vodafone_cash: s.vodafone_cash || '',
          is_active: s.is_active ?? true,
        }))
      );
    } else {
      const legacyShift = (card as any)?.active_shift;
      if (legacyShift) {
        setShifts([
          {
            label: legacyShift.label || 'شيفت المساء',
            cashier_name: legacyShift.cashier_name || '',
            hour_from: legacyShift.hour_from ?? 6,
            period_from: legacyShift.period_from || 'pm',
            hour_to: legacyShift.hour_to ?? 2,
            period_to: legacyShift.period_to || 'am',
            instapay: card.business_data?.instapay || '',
            vodafone_cash: card.business_data?.vodafone_cash || '',
            is_active: true,
          },
        ]);
      } else {
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
      }
    }

    const b = card.business_data || {};
    setEnableReviewGate(b.enable_review_gate ?? true);
    setBizData({
      business_name: b.business_name || '',
      logo: b.logo || '',
      description: b.description || '',
      phone: b.phone || '',
      email: b.email || '',
      whatsapp: b.whatsapp || '',
      instagram: b.instagram || '',
      facebook: b.facebook || '',
      tiktok: b.tiktok || '',
      google_maps: b.google_maps || '',
      website: b.website || '',
      instapay: b.instapay || '',
      vodafone_cash: b.vodafone_cash || '',
      maintenance_whatsapp: b.maintenance_whatsapp || '',
      offers_url: b.offers_url || '',
      telegram_group: b.telegram_group || '',
      google_review_url: b.google_review_url || '',
    });

    // Load multiple locations, with a backwards-compatible fallback for the old single map field.
    if (Array.isArray(b.locations)) {
      setLocations(b.locations.map((loc, index) => ({
        id: `loc-${index}`,
        name: loc.name || `فرع ${index + 1}`,
        google_maps_url: loc.google_maps_url || '',
      })));
    } else if (b.google_maps) {
      setLocations([{
        id: 'loc-0',
        name: 'الموقع الرئيسي',
        google_maps_url: b.google_maps,
      }]);
    } else {
      setLocations([]);
    }

    // Customer
    const rawCustId = card.customer_id || card.customer;
    const custId = typeof rawCustId === 'string' ? rawCustId : rawCustId?._id;
    if (custId) {
      if (typeof rawCustId === 'object' && rawCustId?.name) {
        setSelectedCustomer(rawCustId as any);
        setInitialCustomer(rawCustId as any);
      } else {
        try {
          const custRes = await customersApi.getCustomerById(custId);
          const actualCust = custRes?.customer || (custRes as any);
          setSelectedCustomer(actualCust);
          setInitialCustomer(actualCust);
        } catch (err) {
          console.error('Failed to load assigned customer:', err);
          const fallbackCust = { _id: custId, name: 'عميل مربوط' } as any;
          setSelectedCustomer(fallbackCust);
          setInitialCustomer(fallbackCust);
        }
      }
    } else {
      setSelectedCustomer(null);
      setInitialCustomer(null);
    }
  }, []);

  /* Initial fetch */
  useEffect(() => {
    let isMounted = true;
    async function init() {
      // Single mode: require card ID
      if (!bulkMode && !id) {
        Swal.fire({
          icon: 'error',
          title: 'معرف غير صالح',
          text: 'لم يتم تمرير معرف البطاقة المطلوب تعديلها',
          confirmButtonColor: '#3b82f6',
        }).then(() => navigate('/admin/cards'));
        return;
      }

      // Bulk mode: require customer ID
      if (bulkMode && !customerId) {
        Swal.fire({
          icon: 'error',
          title: 'معرف غير صالح',
          text: 'لم يتم تمرير معرف العميل',
          confirmButtonColor: '#3b82f6',
        }).then(() => navigate('/admin/customers'));
        return;
      }

      setLoadingCard(true);
      try {
        const catsRes = await categoriesApi.getCategories({ limit: 100, is_active: true });

        if (!isMounted) return;
        setCategories(catsRes.data ?? []);

        if (bulkMode && customerId) {
          // Bulk mode: Fetch all cards for customer
          try {
            const customerData = await customersApi.getCustomerById(customerId);
            if (!isMounted) return;

            const cards = customerData.cards || [];
            
            if (cards.length === 0) {
              Swal.fire({
                icon: 'warning',
                title: 'لا توجد بطاقات',
                text: 'هذا العميل لا يملك أي بطاقات مرتبطة به',
                confirmButtonColor: '#3b82f6',
              }).then(() => navigate(`/admin/customers/${customerId}`));
              return;
            }

            setAffectedCards(cards as ApiCard[]);
            
            // Initialize form with smart population from existing card data
            initializeFormForBulkMode(cards as ApiCard[]);
          } catch (err: any) {
            if (!isMounted) return;
            Swal.fire({
              icon: 'error',
              title: 'فشل تحميل بيانات العميل',
              text: err?.message || 'تعذر جلب بيانات العميل والبطاقات',
              confirmButtonColor: '#3b82f6',
            }).then(() => navigate('/admin/customers'));
          }
        } else {
          // Single mode: Fetch single card and populate form
          const cardData = await cardsApi.getCardById(id!);
          if (!isMounted) return;
          await populateFromCard(cardData);
        }
      } catch (err: any) {
        if (!isMounted) return;
        Swal.fire({
          icon: 'error',
          title: 'فشل تحميل البطاقة',
          text: err?.message || 'تعذر جلب تفاصيل البطاقة من السيرفر',
          confirmButtonColor: '#3b82f6',
        }).then(() => navigate('/admin/cards'));
      } finally {
        if (isMounted) setLoadingCard(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [id, customerId, bulkMode, navigate]);

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
    // In bulk mode on Step 2, go back to customer page instead of Step 1
    if (bulkMode && currentStep === 2) {
      navigate(`/admin/customers/${customerId}`);
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Submit Handler ── */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Bulk mode: different logic
    if (bulkMode) {
      if (!affectedCards || affectedCards.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'لا توجد بطاقات',
          text: 'لم يتم العثور على بطاقات مرتبطة بهذا العميل',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      // Validate steps 2 and 3
      if (!validateStep(2) || !validateStep(3)) return;

      // Build business data
      const business: BusinessData = {};
      let hasBiz = false;
      
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

      const validLocations = locations.filter(
        (loc) => loc.name.trim() && loc.google_maps_url.trim()
      );
      if (validLocations.length > 0) {
        business.locations = validLocations.map((loc) => ({
          name: loc.name.trim(),
          google_maps_url: loc.google_maps_url.trim(),
        }));
        hasBiz = true;
      }

      // Build payment shifts for mobile_shop
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

      // Build bulk update DTO
      const bulkUpdateDto: ApiBulkCardUpdateDto = {
        business_data: hasBiz ? business : null,
        payment_shifts: paymentShiftsList,
        template: template,
      };

      setSaving(true);
      const failedCards: { cardId: string; code: string; error: string }[] = [];
      let successCount = 0;

      try {
        // Update each card
        for (const card of affectedCards) {
          try {
            await cardsApi.updateCard(card._id, bulkUpdateDto as any);
            successCount++;
          } catch (err: any) {
            failedCards.push({
              cardId: card._id,
              code: card.card_code,
              error: err?.message || 'خطأ غير معروف',
            });
          }
        }

        // Check if all succeeded
        if (failedCards.length === 0) {
          // All succeeded
          await Swal.fire({
            icon: 'success',
            title: 'تم التحديث بنجاح!',
            text: `تم تحديث ${successCount} بطاقة بنجاح`,
            confirmButtonText: 'العودة للعميل',
            confirmButtonColor: '#3b82f6',
          });
          navigate(`/admin/customers/${customerId}`);
        } else if (successCount > 0) {
          // Partial success
          await Swal.fire({
            icon: 'warning',
            title: 'تم التحديث جزئياً',
            html: `
              <div style="text-align: right; direction: rtl;">
                <p>تم تحديث <strong>${successCount}</strong> من <strong>${affectedCards.length}</strong> بطاقة بنجاح</p>
                <details style="margin: 12px 0; text-align: right;">
                  <summary style="cursor: pointer; font-weight: bold;">البطاقات التي فشلت (${failedCards.length})</summary>
                  <ul style="text-align: right; margin-top: 8px;">
                    ${failedCards.map(f => `<li>${f.code}: ${f.error}</li>`).join('')}
                  </ul>
                </details>
              </div>
            `,
            confirmButtonText: 'العودة للعميل',
            confirmButtonColor: '#3b82f6',
          });
          navigate(`/admin/customers/${customerId}`);
        } else {
          // All failed
          await Swal.fire({
            icon: 'error',
            title: 'فشل التحديث',
            html: `
              <div style="text-align: right; direction: rtl;">
                <p>فشل تحديث جميع البطاقات</p>
                <ul style="text-align: right;">
                  ${failedCards.map(f => `<li>${f.code}: ${f.error}</li>`).join('')}
                </ul>
              </div>
            `,
            confirmButtonText: 'حاول مرة أخرى',
            confirmButtonColor: '#3b82f6',
          });
        }
      } catch (err: any) {
        console.error('Unexpected error during bulk update:', err);
        Swal.fire({
          icon: 'error',
          title: 'خطأ غير متوقع',
          text: err?.message || 'حدث خطأ أثناء تحديث البطاقات',
          confirmButtonColor: '#3b82f6',
        });
      } finally {
        setSaving(false);
      }
      return;
    }

    // Single mode: existing logic
    if (!currentCard || !id) return;

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

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

      const validLocations = locations.filter(
        (loc) => loc.name.trim() && loc.google_maps_url.trim()
      );
      if (validLocations.length > 0) {
        business.locations = validLocations.map((loc) => ({
          name: loc.name.trim(),
          google_maps_url: loc.google_maps_url.trim(),
        }));
        hasBiz = true;
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

    // Handle redirect URL
    const domainOrigin = window.location.origin.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
      'https://smart-card-qr-api.koyeb.app'
    );
    let formattedUrl = redirectUrl.trim();
    if (!formattedUrl) {
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

    setSaving(true);
    try {
      const updateDto: ApiUpdateCardDto = {
        ...baseDto,
        custom_slug: trimmedSlug || null,
        template: template,
        payment_shifts: paymentShiftsList,
        customer_id: selectedCustomer ? selectedCustomer._id : null,
      };
      updateDto.business_data = isBusinessProfileCategory ? (hasBiz ? business : null) : null;

      const updated = await cardsApi.updateCard(id, updateDto);

      // Handle customer assignment change
      if (!selectedCustomer) {
        // No customer selected - unassign from any customer
        if (initialCustomer?._id) {
          await customersApi.unassignCard(initialCustomer._id, updated._id).catch(console.error);
        }
      } else if (selectedCustomer._id !== initialCustomer?._id) {
        // Customer changed - unassign old, assign new
        if (initialCustomer?._id) {
          await customersApi.unassignCard(initialCustomer._id, updated._id).catch(console.error);
        }
        await customersApi.assignCards(selectedCustomer._id, { card_ids: [updated._id] }).catch(console.error);
      }

      await Swal.fire({
        icon: 'success',
        title: 'تم تعديل البطاقة بنجاح!',
        text: `تم حفظ جميع التعديلات للبطاقة ${updated.card_code}`,
        confirmButtonText: 'العودة للبطاقات',
        confirmButtonColor: '#3b82f6',
      });
      navigate('/admin/cards');
    } catch (e: any) {
      let errMsg = e?.message || 'حدث خطأ أثناء حفظ تعديلات البطاقة';
      if (e?.statusCode === 409 || /already taken/i.test(errMsg) || /custom slug.*already taken/i.test(errMsg)) {
        errMsg = 'هذا الرابط المخصص محجوز بالفعل، يرجى اختيار اسم آخر';
      } else if (errMsg.includes('500') || errMsg.includes('Internal server error')) {
        errMsg = 'كود البطاقة مستخدم ومكرر بالفعل في بطاقة أخرى.';
      }
      Swal.fire({
        icon: 'error',
        title: 'فشل التعديل',
        text: errMsg,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = Boolean(
    cardCode.trim() &&
    /^CARD-\d{4,}$/.test(cardCode.trim()) &&
    categoryId
  );

  const selectedCategoryName = categories.find((c) => c._id === categoryId)?.name || 'غير محدد';

  if (loadingCard) {
    return (
      <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '14px' }}>
        <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--clr-primary-500)' }} />
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--txt-secondary)' }}>جاري تحميل بيانات البطاقة...</span>
      </div>
    );
  }

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
                تعديل البطاقة {cardCode}
              </h1>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '20px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                }}
              >
                تعديل منفصل / Edit Mode
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt-muted)' }}>
              قم بتعديل بيانات البطاقة وهوية النشاط وطرق الدفع والشيفت عبر الخطوات المنظمة
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/cards')}
            className="btn-outline"
            style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700 }}
          >
            إلغاء التعديل
          </button>
          {currentStep === 4 ? (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={saving || !isFormValid}
              className="btn-primary"
              style={{ padding: '8px 22px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>التالي</span>
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ══════ Modern Stepper Navigation ══════ */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid var(--bdr-light)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${bulkMode ? STEPS.length - 1 : STEPS.length}, 1fr)`, gap: '10px' , overflow: 'auto' }}>
          {STEPS.filter(s => !bulkMode || s.id !== 1).map((s) => {
            const isCurrent = currentStep === s.id;
            const isPassed = currentStep > s.id;
            return (
              <div
                key={s.id}
                onClick={() => goToStep(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: isCurrent ? 'var(--clr-primary-50)' : isPassed ? '#f8fafc' : 'transparent',
                  border: `1.5px solid ${isCurrent ? 'var(--clr-primary-500)' : isPassed ? '#bbf7d0' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: isCurrent ? 'var(--clr-primary-500)' : isPassed ? '#16a34a' : '#f1f5f9',
                    color: isCurrent || isPassed ? '#fff' : 'var(--txt-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '14px',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isPassed ? <Check size={18} /> : s.id}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: isCurrent ? 800 : 700,
                      color: isCurrent ? 'var(--clr-primary-800)' : isPassed ? 'var(--txt-heading)' : 'var(--txt-muted)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: isCurrent ? 'var(--clr-primary-600)' : 'var(--txt-muted)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      marginTop: '1px',
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar line */}
        <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginTop: '14px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              backgroundColor: 'var(--clr-primary-500)',
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* ══════ Steps Content ══════ */}
      <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 4) handleSubmit(); else handleNext(); }}>
        {/* ── STEP 1: Card & Template (Hidden in bulk mode) ────────────────────────────── */}
        {!bulkMode && currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Template Selector Card */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid var(--bdr-light)',
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Sparkles size={20} style={{ color: 'var(--clr-primary-600)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    نوع قالب العرض (Template)
                  </h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                    حدد شكل الواجهة التي تظهر للعميل عند فتح صفحة الكارت عبر الـ QR أو NFC
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {/* Default Template Option */}
                <div
                  onClick={() => setTemplate('default')}
                  style={{
                    border: `2px solid ${template === 'default' ? 'var(--clr-primary-500)' : 'var(--bdr-light)'}`,
                    backgroundColor: template === 'default' ? 'var(--clr-primary-50)' : '#fff',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: template === 'default' ? 'var(--clr-primary-500)' : '#f1f5f9',
                      color: template === 'default' ? '#fff' : 'var(--txt-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Globe size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: template === 'default' ? 'var(--clr-primary-800)' : 'var(--txt-heading)' }}>
                        القالب الافتراضي (Social Links)
                      </span>
                      {template === 'default' && <CheckCircle2 size={16} style={{ color: 'var(--clr-primary-600)' }} />}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: '1.5' }}>
                      عرض كروت وروابط التواصل الاجتماعي والأعمال الشخصية بنمط البطاقة الاحترافية.
                    </p>
                  </div>
                </div>

                {/* Mobile Shop Cashier Template Option */}
                <div
                  onClick={() => setTemplate('mobile_shop')}
                  style={{
                    border: `2px solid ${template === 'mobile_shop' ? '#16a34a' : 'var(--bdr-light)'}`,
                    backgroundColor: template === 'mobile_shop' ? '#f0fdf4' : '#fff',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: template === 'mobile_shop' ? '#16a34a' : '#f1f5f9',
                      color: template === 'mobile_shop' ? '#fff' : 'var(--txt-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Smartphone size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: template === 'mobile_shop' ? '#14532d' : 'var(--txt-heading)' }}>
                        كاشير محلات الموبايل (سريع الدفع & شيفتات)
                      </span>
                      {template === 'mobile_shop' && <CheckCircle2 size={16} style={{ color: '#16a34a' }} />}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: '1.5' }}>
                      دعم تبديل الشيفتات، أزرار نسخ إنستاباي وفودافون كاش، عروض اليوم، وبوابة تقييم جوجل الذكية.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Card Identity Details */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid var(--bdr-light)',
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <CreditCard size={20} style={{ color: 'var(--clr-primary-600)' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                  بيانات تعريف البطاقة والتصنيف
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {/* Card Code */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                    كود البطاقة (Card Code) <span style={{ color: 'var(--clr-error)' }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    dir="ltr"
                    value={cardCode}
                    onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                    placeholder="CARD-0001"
                    style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                    صيغة الكود: CARD-XXXX (أرقام متسلسلة)
                  </span>
                </div>

                {/* Custom Slug */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                    الرابط المخصص (Custom Slug)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase())}
                      placeholder="top-phone"
                      style={{ paddingLeft: '80px', fontFamily: 'monospace', fontSize: '13.5px' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '12px',
                        color: 'var(--txt-muted)',
                        direction: 'ltr',
                        pointerEvents: 'none',
                        fontFamily: 'monospace',
                      }}
                    >
                      /social/
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                    يقبل حروف إنجليزية صغيرة وأرقام والشرطة (-)
                  </span>
                </div>

                {/* Category Selection */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                    التصنيف (Category) <span style={{ color: 'var(--clr-error)' }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{ fontSize: '13.5px', fontWeight: 600 }}
                    required
                  >
                    <option value="">-- اختر التصنيف --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical Card Type & Subscription */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {/* Physical Type */}
                <div className="form-group" style={{ gridColumn: 'span 1' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px' }}>
                    نوع الخامة للبطاقة المادية
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
                          دائم مدى الحياة ♾️
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Customer Link Box */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--bdr-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: selectedCustomer ? 'var(--clr-primary-100)' : '#e2e8f0',
                      color: selectedCustomer ? 'var(--clr-primary-700)' : 'var(--txt-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt-muted)' }}>
                      العميل المربوط بالبطاقة
                    </div>
                    {selectedCustomer ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--txt-heading)' }}>
                          {selectedCustomer.name}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--txt-secondary)', direction: 'ltr' }}>
                          ({selectedCustomer.phone})
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--txt-secondary)', marginTop: '2px' }}>
                        غير مرتبطة بعميل حالياً
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="btn-outline"
                      style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--clr-error)', borderColor: 'var(--clr-error-bdr)' }}
                    >
                      إلغاء الربط
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCustomerModalOpen(true)}
                    className="btn-primary"
                    style={{ fontSize: '12.5px', padding: '6px 14px', fontWeight: 700 }}
                  >
                    {selectedCustomer ? 'تغيير العميل' : 'ربط بعميل'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Business & Social Identity ─────────────────── */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid var(--bdr-light)',
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Store size={20} style={{ color: 'var(--clr-primary-600)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    هوية النشاط التجاري والشعار
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--txt-muted)' }}>
                    تظهر هذه البيانات كواجهة رئيسية للبطاقة وصفحتها العامة
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Business Name */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                    اسم المحل / الشركة / النشاط
                  </label>
                  <input
                    className="form-input"
                    value={bizData.business_name || ''}
                    onChange={(e) => updateBiz('business_name', e.target.value)}
                    placeholder="مثال: توب فون للإلكترونيات"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  />
                </div>

                {/* Logo Uploader / URL */}
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
                    rows={3}
                    value={bizData.description || ''}
                    onChange={(e) => updateBiz('description', e.target.value)}
                    placeholder="بيع وشراء وصيانة جميع أجهزة الموبايل والإكسسوارات الأصلية..."
                    style={{ fontSize: '13.5px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Direct Communication Channels */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid var(--bdr-light)',
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Phone size={20} style={{ color: 'var(--clr-primary-600)' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                  قنوات التواصل المباشر والموقع
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {BIZ_GENERAL_FIELDS.map((f) => (
                  <div className="form-group" key={f.key}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {f.icon}
                      <span>{f.label}</span>
                    </label>
                    <input
                      className="form-input"
                      type={f.type || 'text'}
                      dir={f.dir || 'rtl'}
                      value={bizData[f.key] || ''}
                      onChange={(e) => updateBiz(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ fontSize: '13.5px' }}
                    />
                    {f.hint && (
                      <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                        {f.hint}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Accounts */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid var(--bdr-light)',
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Globe size={20} style={{ color: 'var(--clr-primary-600)' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                  روابط منصات التواصل الاجتماعي
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {BIZ_SOCIAL_FIELDS.map((f) => (
                  <div className="form-group" key={f.key}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {f.icon}
                      <span>{f.label}</span>
                    </label>
                    <input
                      className="form-input"
                      type={f.type || 'url'}
                      dir={f.dir || 'ltr'}
                      value={bizData[f.key] || ''}
                      onChange={(e) => updateBiz(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ fontSize: '13.5px' }}
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
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#0891b2', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
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
                    <div key={loc.id} style={{ backgroundColor: '#ffffff', border: '1px solid var(--bdr-light)', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: 'var(--clr-primary-50)', color: 'var(--clr-primary-600)', padding: '3px 10px', borderRadius: '6px' }}>
                          فرع #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLocation(loc.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--clr-error)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="حذف هذا الفرع"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>اسم الفرع</label>
                          <input className="form-input" type="text" value={loc.name} onChange={(e) => updateLocation(loc.id, 'name', e.target.value)} placeholder="الفرع الأول، الفرع الرئيسي، إلخ" style={{ fontSize: '13px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>رابط خرائط جوجل</label>
                          <input className="form-input" type="url" dir="ltr" value={loc.google_maps_url} onChange={(e) => updateLocation(loc.id, 'google_maps_url', e.target.value)} placeholder="https://maps.app.goo.gl/... أو https://g.page/r/..." style={{ fontSize: '13px' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Cashier, Shifts & Fast Payments ───────────── */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Multi-Shift Payment Builder (For Mobile Shop Template) */}
            {template === 'mobile_shop' && (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                        إدارة شيفتات العمل وحسابات الكاشير (Multi-Shift Builder)
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
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
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#7c3aed',
                      color: '#ffffff',
                      fontSize: '13px',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {shifts.map((shift, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      {/* Shift Card Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed', padding: '3px 10px', borderRadius: '8px' }}>
                            شيفت #{idx + 1}
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
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
                              padding: '4px 10px',
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
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>
                            مسمى الشيفت
                          </label>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            {['شيفت الصباح', 'شيفت المساء', 'شيفت السهرة'].map((pill) => (
                              <button
                                key={pill}
                                type="button"
                                onClick={() => updateShift(idx, 'label', pill)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: shift.label === pill ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                                  backgroundColor: shift.label === pill ? '#f3e8ff' : '#fff',
                                  color: shift.label === pill ? '#6b21a8' : '#475569',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                {pill}
                              </button>
                            ))}
                          </div>
                          <input
                            className="form-input"
                            type="text"
                            value={shift.label}
                            onChange={(e) => updateShift(idx, 'label', e.target.value)}
                            placeholder="مثال: شيفت الصباح"
                            style={{ fontSize: '13px', backgroundColor: '#fff' }}
                          />
                        </div>

                        {/* Cashier Name */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>
                            اسم الكاشير أو المسؤول
                          </label>
                          <input
                            className="form-input"
                            type="text"
                            value={shift.cashier_name}
                            onChange={(e) => updateShift(idx, 'cashier_name', e.target.value)}
                            placeholder="مثال: أحمد"
                            style={{ fontSize: '13px', backgroundColor: '#fff' }}
                          />
                        </div>

                        {/* Working Hours From */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} style={{ color: '#7c3aed' }} />
                            يبدأ الشيفت من الساعة
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
                              style={{ width: '75px', textAlign: 'center', fontWeight: 800, backgroundColor: '#fff' }}
                            />
                            <select
                              className="form-input"
                              value={shift.period_from}
                              onChange={(e) => updateShift(idx, 'period_from', e.target.value as 'am' | 'pm')}
                              style={{ flex: 1, fontWeight: 700, backgroundColor: '#fff' }}
                            >
                              <option value="am">صباحاً (ص)</option>
                              <option value="pm">مساءً (م)</option>
                            </select>
                          </div>
                        </div>

                        {/* Working Hours To */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '4px' }}>
                            ينتهي الشيفت في الساعة
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
                              style={{ width: '75px', textAlign: 'center', fontWeight: 800, backgroundColor: '#fff' }}
                            />
                            <select
                              className="form-input"
                              value={shift.period_to}
                              onChange={(e) => updateShift(idx, 'period_to', e.target.value as 'am' | 'pm')}
                              style={{ flex: 1, fontWeight: 700, backgroundColor: '#fff' }}
                            >
                              <option value="pm">مساءً (م)</option>
                              <option value="am">صباحاً (ص)</option>
                            </select>
                          </div>
                        </div>

                        {/* InstaPay */}
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
                          <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>
                            يتم نسخه تلقائياً عند الضغط أثناء هذا الشيفت
                          </span>
                        </div>

                        {/* Vodafone Cash */}
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
                          <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>
                            يتم نسخه فوراً للدفع عبر فودافون كاش
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fast Payment Wallets (Only for default template) */}
            {template !== 'mobile_shop' && (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  border: '1px solid var(--bdr-light)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Smartphone size={20} style={{ color: '#16a34a' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    محافظ الدفع الفوري (InstaPay & كاش)
                  </h3>
                </div>
                <p style={{ margin: '0 0 20px', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                  تظهر في صفحة البطاقة كبطاقات دفع سريعة مع زر نسخ بنقرة واحدة لتسهيل تحويل الحساب
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* InstaPay */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                      عنوان الدفع اللحظي إنستاباي (InstaPay GPA)
                    </label>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={bizData.instapay || ''}
                      onChange={(e) => updateBiz('instapay', e.target.value)}
                      placeholder="ahmed@instapay أو رقم التليفون"
                      style={{ fontSize: '13.5px', fontWeight: 600 }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                      يُمكّن العميل من نسخ الحساب فورياً بلمسة واحدة
                    </span>
                  </div>

                  {/* Vodafone Cash */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>
                      رقم المحفظة الإلكترونية (فودافون كاش / اتصالات / أورنج / وي)
                    </label>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={bizData.vodafone_cash || ''}
                      onChange={(e) => updateBiz('vodafone_cash', e.target.value)}
                      placeholder="01012345678"
                      style={{ fontSize: '13.5px', fontWeight: 600 }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                      زر نسخ مباشر وفتح تطبيق المحفظة لتحويل الفاتورة
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Shop Dedicated Channels */}
            {template === 'mobile_shop' && (
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  border: '1px solid var(--bdr-light)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Store size={20} style={{ color: 'var(--clr-primary-600)' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    قنوات وبوابات محلات الموبايل المتخصصة
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {MOBILE_SHOP_CHANNELS.map((f) => (
                    <div className="form-group" key={f.key}>
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {f.icon}
                        <span>{f.label}</span>
                      </label>
                      <input
                        className="form-input"
                        type={f.type || 'text'}
                        dir={f.dir || 'ltr'}
                        value={bizData[f.key] || ''}
                        onChange={(e) => updateBiz(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        style={{ fontSize: '13.5px' }}
                      />
                      {f.hint && (
                        <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                          {f.hint}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Review Gate Toggle */}
                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    backgroundColor: '#fefce8',
                    border: '1px solid #fef08a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Star size={20} style={{ color: '#ca8a04', fill: '#ca8a04' }} />
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#854d0e', display: 'block' }}>
                        بوابة التقييمات الذكية (Google Review Gate)
                      </span>
                      <span style={{ fontSize: '12px', color: '#a16207' }}>
                        التقييم 4 أو 5 نجوم يوجّه مباشرة لجوجل مابس، بينما 1 إلى 3 نجوم يحوّل العميل للواتساب لحل الشكوى داخلياً!
                      </span>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#854d0e' }}>
                    <input
                      type="checkbox"
                      checked={enableReviewGate}
                      onChange={(e) => setEnableReviewGate(e.target.checked)}
                      style={{ accentColor: '#ca8a04', width: '18px', height: '18px' }}
                    />
                    <span>مفعّلة</span>
                  </label>
                </div>
              </div>
            )}

            {/* Direct Redirect Override URL */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid var(--bdr-light)',
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <LinkIcon size={18} style={{ color: 'var(--txt-muted)' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--txt-heading)' }}>
                  رابط إعادة التوجيه المباشر المخصص (اختياري)
                </h3>
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--txt-muted)' }}>
                اترك هذا الحقل فارغاً لاستخدام الصفحة التفاعلية الافتراضية للكارت تلقائياً
              </p>
              <input
                className="form-input"
                type="url"
                dir="ltr"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://yourdomain.com/my-page"
                style={{ fontSize: '13.5px' }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: Review & Summary ──────────────────────────── */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Master Summary Card */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid var(--bdr-light)',
                padding: '24px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={22} style={{ color: 'var(--clr-primary-600)' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: 'var(--txt-heading)' }}>
                      مراجعة البيانات قبل حفظ التعديلات
                    </h3>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                      تأكد من صحة بيانات الكارت والنشاط وطرق الدفع
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: template === 'mobile_shop' ? '#f0fdf4' : 'var(--clr-primary-50)',
                    color: template === 'mobile_shop' ? '#15803d' : 'var(--clr-primary-700)',
                    border: `1px solid ${template === 'mobile_shop' ? '#bbf7d0' : 'var(--clr-primary-200)'}`,
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                  }}
                >
                  {template === 'mobile_shop' ? '📱 قالب كاشير محلات الموبايل' : '🌐 القالب الافتراضي'}
                </span>
              </div>

              {/* Grid Summaries */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Identity Summary Box */}
                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--bdr-light)', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={16} /> بيانات الكارت
                    </span>
                    <button type="button" onClick={() => goToStep(1)} style={{ background: 'none', border: 'none', color: 'var(--clr-primary-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Edit2 size={12} /> تعديل
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                    <div>كود البطاقة: <strong style={{ fontFamily: 'monospace' }}>{cardCode}</strong></div>
                    <div>التصنيف: <strong>{selectedCategoryName}</strong></div>
                    <div>خامة الكارت: <strong>{cardType}</strong></div>
                    <div>نوع الاشتراك: <strong>{requiresSubscription ? 'سنوي' : 'دائم مدى الحياة ♾️'}</strong></div>
                    {customSlug && <div>الرابط المخصص: <strong style={{ direction: 'ltr', display: 'inline-block' }}>/social/{customSlug}</strong></div>}
                    <div>العميل: <strong>{selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : 'غير مربوط'}</strong></div>
                  </div>
                </div>

                {/* Business Profile Summary Box */}
                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--bdr-light)', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Store size={16} /> هوية النشاط
                    </span>
                    <button type="button" onClick={() => goToStep(2)} style={{ background: 'none', border: 'none', color: 'var(--clr-primary-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Edit2 size={12} /> تعديل
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                    <div>اسم المحل: <strong>{bizData.business_name || 'غير محدد'}</strong></div>
                    <div>الهاتف: <strong style={{ direction: 'ltr' }}>{bizData.phone || '—'}</strong></div>
                    <div>واتساب: <strong style={{ direction: 'ltr' }}>{bizData.whatsapp || '—'}</strong></div>
                    <div>الشعار: <strong>{bizData.logo ? 'مرفق ومحدد ✓' : 'لا يوجد'}</strong></div>
                    <div>خرائط جوجل: <strong>{bizData.google_maps ? 'محدد ✓' : '—'}</strong></div>
                  </div>
                </div>

                {/* Cashier & Shift Summary Box */}
                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--bdr-light)', backgroundColor: '#f8fafc', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={16} /> الكاشير والدفع
                    </span>
                    <button type="button" onClick={() => goToStep(3)} style={{ background: 'none', border: 'none', color: 'var(--clr-primary-600)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Edit2 size={12} /> تعديل
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '12.5px' }}>
                    {template === 'mobile_shop' ? (
                      shifts.map((s, idx) => (
                        <div key={idx} style={{ backgroundColor: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: 800, color: '#7c3aed', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{s.label || `شيفت ${idx + 1}`}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>#{idx + 1}</span>
                          </div>
                          <div>الكاشير: <strong>{s.cashier_name || '—'}</strong></div>
                          <div>ساعات العمل: <strong>{s.hour_from ? `${s.hour_from} ${s.period_from === 'pm' ? 'م' : 'ص'}` : '—'} إلى {s.hour_to ? `${s.hour_to} ${s.period_to === 'pm' ? 'م' : 'ص'}` : '—'}</strong></div>
                          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #e2e8f0', fontSize: '11.5px' }}>
                            <div>إنستاباي: <strong style={{ direction: 'ltr' }}>{s.instapay || '—'}</strong></div>
                            <div>فودافون كاش: <strong style={{ direction: 'ltr' }}>{s.vodafone_cash || '—'}</strong></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ backgroundColor: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>إنستاباي: <strong style={{ direction: 'ltr' }}>{bizData.instapay || '—'}</strong></div>
                        <div>فودافون كاش: <strong style={{ direction: 'ltr' }}>{bizData.vodafone_cash || '—'}</strong></div>
                      </div>
                    )}
                    {template === 'mobile_shop' && (
                      <div style={{ backgroundColor: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>الخدمات وبوابة التقييم:</div>
                        <div>واتساب الصيانة: <strong>{bizData.maintenance_whatsapp ? 'موجود ✓' : '—'}</strong></div>
                        <div>فلتر تقييمات جوجل: <strong>{enableReviewGate ? 'مفعّل ✓' : 'معطل'}</strong></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '28px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--bdr-light)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  className="btn-outline"
                  style={{ padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
                >
                  الرجوع للخطوة السابقة
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={saving || !isFormValid}
                    className="btn-primary"
                    style={{
                      padding: '12px 32px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--clr-primary-600)',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                    }}
                  >
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>{saving ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات الآن'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Steps Footer Navigation (for Steps 1, 2, 3) ──────── */}
        {currentStep < 4 && (
          <div
            className="responsive-bottom-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '10px',
              backgroundColor: '#fff',
              padding: '14px 20px',
              borderRadius: '14px',
              border: '1px solid var(--bdr-light)',
              flexWrap: 'wrap',
            }}
          >
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="btn-outline"
                style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700 }}
              >
                السابق
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Quick Save Button */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={saving}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '2px solid #10b981',
                  color: '#10b981',
                  backgroundColor: '#ecfdf5',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
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
                onClick={handleNext}
                className="btn-primary"
                style={{ padding: '9px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>التالي: {STEPS[currentStep].title}</span>
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Select Customer Modal */}
      {customerModalOpen && (
        <SelectCustomerModal
          onSelect={(c) => {
            setSelectedCustomer(c);
            setCustomerModalOpen(false);
          }}
          onClose={() => setCustomerModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminEditCardPage;
