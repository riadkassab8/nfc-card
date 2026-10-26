import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { businessFieldsApi } from '../../services/api';
import {
  ApiBusinessField,
  BusinessFieldType,
  BusinessFieldSection,
  CreateBusinessFieldDto,
  UpdateBusinessFieldDto,
} from '../../types';
import Swal from 'sweetalert2';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Video,
  Globe,
  CreditCard,
  Send,
  Youtube,
  Twitter,
  MapPin,
  Wifi,
  Mail,
  Shield,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Layers,
  Hash,
  Copy,
} from 'lucide-react';

/* ── Available Preset Icons ────────────────────────────────────────── */
const PRESET_ICONS: { name: string; label: string; icon: React.ElementType }[] = [
  { name: 'Phone', label: 'هاتف', icon: Phone },
  { name: 'MessageCircle', label: 'واتساب / رسالة', icon: MessageCircle },
  { name: 'Instagram', label: 'انستجرام', icon: Instagram },
  { name: 'Facebook', label: 'فيسبوك', icon: Facebook },
  { name: 'Video', label: 'تيك توك / فيديو', icon: Video },
  { name: 'CreditCard', label: 'دفع / بطاقة', icon: CreditCard },
  { name: 'Send', label: 'تليجرام / إرسال', icon: Send },
  { name: 'Globe', label: 'موقع إلكتروني', icon: Globe },
  { name: 'Mail', label: 'بريد إلكتروني', icon: Mail },
  { name: 'MapPin', label: 'خريطة / فرع', icon: MapPin },
  { name: 'Wifi', label: 'واي فاي', icon: Wifi },
  { name: 'Youtube', label: 'يوتيوب', icon: Youtube },
  { name: 'Twitter', label: 'منصة إكس / تويتر', icon: Twitter },
  { name: 'FileText', label: 'ملف / نص', icon: FileText },
  { name: 'ImageIcon', label: 'صورة', icon: ImageIcon },
  { name: 'Shield', label: 'أمان / حماية', icon: Shield },
  { name: 'Sparkles', label: 'مميز', icon: Sparkles },
];

const renderFieldIcon = (iconName?: string) => {
  const match = PRESET_ICONS.find((i) => i.name.toLowerCase() === iconName?.toLowerCase());
  if (match) {
    const IconComp = match.icon;
    return <IconComp size={18} />;
  }
  return <SlidersHorizontal size={18} />;
};

/* ── Section Labels & Colors ───────────────────────────────────────── */
const SECTION_CONFIG: Record<
  BusinessFieldSection,
  { label: string; bg: string; text: string; bdr: string }
> = {
  contact: {
    label: 'الاتصال والتواصل',
    bg: '#eff6ff',
    text: '#1d4ed8',
    bdr: '#bfdbfe',
  },
  social: {
    label: 'السوشيال ميديا',
    bg: '#fdf2f8',
    text: '#be185d',
    bdr: '#fbcfe8',
  },
  payment: {
    label: 'الدفع والتحويل',
    bg: '#f0fdf4',
    text: '#15803d',
    bdr: '#bbf7d0',
  },
  general: {
    label: 'عام ومعلومات',
    bg: '#f8fafc',
    text: '#475569',
    bdr: '#e2e8f0',
  },
  custom: {
    label: 'حقول مخصصة',
    bg: '#faf5ff',
    text: '#7e22ce',
    bdr: '#e9d5ff',
  },
};

const TYPE_CONFIG: Record<BusinessFieldType, { label: string; badge: string }> = {
  text: { label: 'نص قصير', badge: '#64748b' },
  tel: { label: 'رقم هاتف', badge: '#0284c7' },
  url: { label: 'رابط ويب', badge: '#2563eb' },
  email: { label: 'بريد إلكتروني', badge: '#7c3aed' },
  number: { label: 'رقم حساب / كود', badge: '#059669' },
  textarea: { label: 'نص متعدد الأسطر', badge: '#d97706' },
  image: { label: 'رابط صورة / شعار', badge: '#dc2626' },
};

/* ── Modal Component ───────────────────────────────────────────────── */
interface FieldModalProps {
  existing?: ApiBusinessField | null;
  onClose: () => void;
  onSaved: () => void;
}

const FieldModal: React.FC<FieldModalProps> = ({ existing, onClose, onSaved }) => {
  const isEdit = !!existing;
  const isSystem = existing?.is_system ?? false;

  const [key, setKey] = useState(existing?.key || '');
  const [label, setLabel] = useState(existing?.label || '');
  const [type, setType] = useState<BusinessFieldType>(existing?.type || 'text');
  const [section, setSection] = useState<BusinessFieldSection>(existing?.section || 'custom');
  const [icon, setIcon] = useState(existing?.icon || 'Sparkles');
  const [placeholder, setPlaceholder] = useState(existing?.placeholder || '');
  const [hint, setHint] = useState(existing?.hint || '');
  const [order, setOrder] = useState<number>(existing?.order ?? 50);
  const [isActive, setIsActive] = useState<boolean>(existing?.is_active ?? true);
  const [isRequired, setIsRequired] = useState<boolean>(existing?.is_required ?? false);
  const [showInPublic, setShowInPublic] = useState<boolean>(existing?.show_in_public ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyChange = (val: string) => {
    // Sanitize to lowercase, numbers, underscores
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    setKey(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanKey = key.trim().toLowerCase();
    const cleanLabel = label.trim();

    if (!cleanKey) {
      setError('مفتاح الحقل البرمجي مطلوب (Key).');
      return;
    }
    if (!/^[a-z0-9_]{2,50}$/.test(cleanKey)) {
      setError('المفتاح البرمجي يجب أن يتكون من 2 إلى 50 حرفاً (أحرف إنجليزية صغيرة، أرقام، وشرطة سفلية _ فقط).');
      return;
    }
    if (!cleanLabel) {
      setError('اسم الحقل بالعربية مطلوب.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && existing) {
        const dto: UpdateBusinessFieldDto = {
          label: cleanLabel,
          type,
          section,
          icon,
          placeholder: placeholder.trim(),
          hint: hint.trim(),
          order: Number(order),
          is_active: isActive,
          is_required: isRequired,
          show_in_public: showInPublic,
        };
        // Only update key if custom field
        if (!isSystem && cleanKey !== existing.key) {
          (dto as any).key = cleanKey;
        }
        await businessFieldsApi.updateField(existing._id, dto);
        Swal.fire({
          icon: 'success',
          title: 'تم الحفظ',
          text: `تم تحديث الحقل "${cleanLabel}" بنجاح.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const dto: CreateBusinessFieldDto = {
          key: cleanKey,
          label: cleanLabel,
          type,
          section,
          icon,
          placeholder: placeholder.trim(),
          hint: hint.trim(),
          order: Number(order),
          is_active: isActive,
          is_required: isRequired,
          show_in_public: showInPublic,
        };
        await businessFieldsApi.createField(dto);
        Swal.fire({
          icon: 'success',
          title: 'تمت الإضافة',
          text: `تم إنشاء الحقل "${cleanLabel}" بنجاح.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء حفظ بيانات الحقل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-panel responsive-modal-panel"
        dir="rtl"
        style={{
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {renderFieldIcon(icon)}
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {isEdit ? 'تعديل حقل البيانات' : 'إضافة حقل بيانات جديد'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                {isSystem
                  ? 'حقل نظام أساسي (يمكنك تعديل المسمى، الأيقونة، والظهور)'
                  : 'حقل مخصص ديناميكي للبطاقات'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          <form id="business-field-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Key & Label Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>المفتاح البرمجي (Key) *</span>
                  {isSystem && <Lock size={14} color="#9ca3af" />}
                </label>
                <input
                  className="form-input"
                  dir="ltr"
                  value={key}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="e.g. instapay2, threads"
                  required
                  disabled={isSystem}
                  style={{
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    backgroundColor: isSystem ? '#f3f4f6' : '#ffffff',
                    cursor: isSystem ? 'not-allowed' : 'text',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  {isSystem ? 'محمي للنظام ولا يمكن تغييره' : 'حروف صغيرة و _ فقط بدون مسافات'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  الاسم بالعربية (Label) *
                </label>
                <input
                  className="form-input"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="مثال: انستاباي 2، ثريدز"
                  required
                  autoFocus={!isEdit}
                  style={{ fontSize: '0.95rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  الاسم الذي يظهر للمستخدم في لوحة التحكم
                </span>
              </div>
            </div>

            {/* Type & Section Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  نوع الإدخال (Type) *
                </label>
                <select
                  className="form-input"
                  value={type}
                  onChange={(e) => setType(e.target.value as BusinessFieldType)}
                  style={{ fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  <option value="text">نص عادي (Text)</option>
                  <option value="tel">رقم هاتف / محفظة (Tel)</option>
                  <option value="url">رابط إنترنت (URL)</option>
                  <option value="email">بريد إلكتروني (Email)</option>
                  <option value="number">رقم / كود حساب (Number)</option>
                  <option value="textarea">نص تفصيلي متعدد الأسطر (Textarea)</option>
                  <option value="image">رابط صورة / شعار (Image URL)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  القسم التابع له (Section) *
                </label>
                <select
                  className="form-input"
                  value={section}
                  onChange={(e) => setSection(e.target.value as BusinessFieldSection)}
                  style={{ fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  <option value="contact">الاتصال والتواصل (Contact)</option>
                  <option value="social">السوشيال ميديا (Social)</option>
                  <option value="payment">الدفع والتحويل (Payment)</option>
                  <option value="general">عام ومعلومات (General)</option>
                  <option value="custom">حقول مخصصة (Custom)</option>
                </select>
              </div>
            </div>

            {/* Icon Selector */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                الأيقونة التعبيرية (Icon)
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
                  gap: '8px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: '#f9fafb',
                }}
              >
                {PRESET_ICONS.map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = icon?.toLowerCase() === item.name.toLowerCase();
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 4px',
                        gap: '4px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#2563eb' : '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ItemIcon size={18} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Placeholder & Hint Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  نص التلميح الداخلي (Placeholder)
                </label>
                <input
                  className="form-input"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="مثال: https://... أو 010..."
                  style={{ fontSize: '0.9rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                  ملاحظة إرشادية للمستخدم (Hint)
                </label>
                <input
                  className="form-input"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="مثال: لاستقبال التحويلات عبر انستاباي"
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Order */}
            <div className="form-group" style={{ maxWidth: '200px' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                ترتيب العرض (Order)
              </label>
              <input
                type="number"
                className="form-input"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={0}
                max={999}
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            {/* Toggles */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1e293b',
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <span>الحقل مفعّل (Active)</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1e293b',
                }}
              >
                <input
                  type="checkbox"
                  checked={showInPublic}
                  onChange={(e) => setShowInPublic(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <span>يظهر في الصفحة العامة للبطاقة</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1e293b',
                }}
              >
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <span>حقل إلزامي عند إنشاء البطاقة</span>
              </label>
            </div>
          </form>
        </div>

        <div
          className="modal-footer"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: '#f9fafb',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
            style={{ padding: '8px 18px', fontWeight: 600 }}
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="business-field-form"
            className="btn btn-primary"
            disabled={saving}
            style={{
              padding: '8px 24px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>{isEdit ? 'حفظ التعديلات' : 'إضافة الحقل'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page Component ───────────────────────────────────────────── */
export const AdminBusinessFieldsPage: React.FC = () => {
  const [fields, setFields] = useState<ApiBusinessField[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | BusinessFieldSection>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<ApiBusinessField | null>(null);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    try {
      const data = await businessFieldsApi.getFields();
      setFields(data);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'فشل تحميل الحقول',
        text: err?.message || 'تعذر جلب حقول البيانات من الخادم',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleToggle = async (field: ApiBusinessField) => {
    try {
      const updated = await businessFieldsApi.toggleField(field._id);
      setFields((prev) =>
        prev.map((f) => (f._id === field._id ? { ...f, is_active: updated.is_active } : f))
      );
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: updated.is_active ? `تم تفعيل حقل "${field.label}"` : `تم تعطيل حقل "${field.label}"`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: err?.message || 'تعذر تغيير حالة الحقل',
      });
    }
  };

  const handleDelete = async (field: ApiBusinessField) => {
    if (field.is_system) {
      Swal.fire({
        icon: 'info',
        title: 'حقل نظام أساسي',
        text: 'لا يمكن حذف حقول النظام الأساسية للحفاظ على استقرار البطاقات. يمكنك تعطيل الحقل إذا كنت لا ترغب بظهوره.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: `حذف الحقل "${field.label}"؟`,
      text: `سيتم حذف الحقل البرمجي (${field.key}) نهائياً من النظام. هل أنت متأكد؟`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'نعم، حذف',
      cancelButtonText: 'إلغاء',
    });

    if (result.isConfirmed) {
      try {
        await businessFieldsApi.deleteField(field._id);
        setFields((prev) => prev.filter((f) => f._id !== field._id));
        Swal.fire({
          icon: 'success',
          title: 'تم الحذف',
          text: `تم حذف الحقل "${field.label}" بنجاح.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'فشل الحذف',
          text: err?.message || 'تعذر حذف الحقل',
        });
      }
    }
  };

  const copyKeyToClipboard = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `تم نسخ المفتاح: ${keyStr}`,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  /* Filtered fields */
  const filteredFields = useMemo(() => {
    return fields.filter((f) => {
      // Tab filter
      if (activeTab !== 'all' && f.section !== activeTab) return false;
      // Status filter
      if (statusFilter === 'active' && !f.is_active) return false;
      if (statusFilter === 'inactive' && f.is_active) return false;
      // Search
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesKey = f.key.toLowerCase().includes(query);
        const matchesLabel = f.label.toLowerCase().includes(query);
        const matchesPlaceholder = f.placeholder?.toLowerCase().includes(query);
        if (!matchesKey && !matchesLabel && !matchesPlaceholder) return false;
      }
      return true;
    });
  }, [fields, activeTab, statusFilter, search]);

  /* Stats summary */
  const stats = useMemo(() => {
    const total = fields.length;
    const active = fields.filter((f) => f.is_active).length;
    const system = fields.filter((f) => f.is_system).length;
    const custom = fields.filter((f) => !f.is_system).length;
    return { total, active, system, custom };
  }, [fields]);

  return (
    <div dir="rtl" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'inherit' }}>
      {/* ── Page Header & Stats ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                إدارة حقول بيانات البطاقات (Business Data)
              </h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                تحكم ديناميكي كامل في الحقول التي تظهر في بطاقات NFC وصفحات العرض بدون الحاجة لتعديل الكود البرمجي
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchFields}
            disabled={loading}
            className="btn btn-secondary"
            title="تحديث البيانات"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              fontWeight: 600,
              borderRadius: '10px',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => {
              setSelectedField(null);
              setModalOpen(true);
            }}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontWeight: 700,
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Plus size={18} />
            <span>إضافة حقل جديد</span>
          </button>
        </div>
      </div>

      {/* ── Stats Cards Banner ──────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>إجمالي الحقول</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{stats.total}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>الحقول المفعلة</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{stats.active}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>حقول النظام الأساسية</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>{stats.system}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#faf5ff',
              color: '#7e22ce',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>الحقول المخصصة الإضافية</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7e22ce' }}>{stats.custom}</div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {/* Section Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'all' ? '#0f172a' : '#f1f5f9',
                color: activeTab === 'all' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              جميع الأقسام ({fields.length})
            </button>
            {(Object.keys(SECTION_CONFIG) as BusinessFieldSection[]).map((sec) => {
              const count = fields.filter((f) => f.section === sec).length;
              const isSelected = activeTab === sec;
              const cfg = SECTION_CONFIG[sec];
              return (
                <button
                  key={sec}
                  onClick={() => setActiveTab(sec)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: isSelected ? cfg.bdr : '#e2e8f0',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? cfg.bg : '#ffffff',
                    color: isSelected ? cfg.text : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="all">كل الحالات</option>
              <option value="active">المفعلة فقط</option>
              <option value="inactive">المعطلة فقط</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالاسم العربي، المفتاح البرمجي (Key)، أو نص التلميح..."
            style={{
              paddingRight: '42px',
              fontSize: '0.92rem',
              backgroundColor: '#f8fafc',
            }}
          />
        </div>
      </div>

      {/* ── Fields Grid / Cards ─────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
          <p style={{ fontWeight: 600 }}>جاري تحميل حقول البيانات...</p>
        </div>
      ) : filteredFields.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#f1f5f9',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <SlidersHorizontal size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            لا توجد حقول مطابقة
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px' }}>
            لم نجد أي حقل يطابق الفلتر أو كلمة البحث الحالية.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveTab('all');
              setStatusFilter('all');
            }}
            className="btn btn-secondary"
            style={{ padding: '8px 18px', fontWeight: 600 }}
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredFields.map((field) => {
            const secCfg = SECTION_CONFIG[field.section] || SECTION_CONFIG.custom;
            const typeCfg = TYPE_CONFIG[field.type] || TYPE_CONFIG.text;

            return (
              <div
                key={field._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: field.is_active ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  opacity: field.is_active ? 1 : 0.7,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Header: Icon, Label, Badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: secCfg.bg,
                        color: secCfg.text,
                        border: `1px solid ${secCfg.bdr}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {renderFieldIcon(field.icon)}
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{field.label}</span>
                        {field.is_required && (
                          <span style={{ color: '#dc2626', fontSize: '0.8rem' }} title="مطلوب">*</span>
                        )}
                      </h3>
                      {/* Key badge with copy */}
                      <button
                        type="button"
                        onClick={() => copyKeyToClipboard(field.key)}
                        title="انقر لنسخ المفتاح البرمجي"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '3px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Hash size={12} />
                        <span>{field.key}</span>
                        <Copy size={11} style={{ opacity: 0.6 }} />
                      </button>
                    </div>
                  </div>

                  {/* System vs Custom Pill */}
                  <div>
                    {field.is_system ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                        }}
                        title="حقل نظام محمي"
                      >
                        <Lock size={11} />
                        <span>نظام</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#faf5ff',
                          color: '#7e22ce',
                          border: '1px solid #e9d5ff',
                        }}
                        title="حقل مخصص أضافه المشرف"
                      >
                        <Sparkles size={11} />
                        <span>مخصص</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Section & Type Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: secCfg.bg,
                      color: secCfg.text,
                      border: `1px solid ${secCfg.bdr}`,
                    }}
                  >
                    {secCfg.label}
                  </span>

                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#f8fafc',
                      color: typeCfg.badge,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {typeCfg.label}
                  </span>

                  {field.show_in_public ? (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="يظهر كزر/أيقونة في الصفحة العامة"
                    >
                      <Eye size={12} />
                      <span>عام</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="مخفي من الصفحة العامة"
                    >
                      <EyeOff size={12} />
                      <span>داخلي</span>
                    </span>
                  )}

                  <span
                    style={{
                      marginRight: 'auto',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    ترتيب: #{field.order}
                  </span>
                </div>

                {/* Hint or Placeholder snippet */}
                {(field.hint || field.placeholder) && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      lineHeight: 1.4,
                    }}
                  >
                    {field.hint && <div>{field.hint}</div>}
                    {field.placeholder && (
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px', fontFamily: 'monospace' }} dir="ltr">
                        مثال: {field.placeholder}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls: Active Switch & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '10px',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  {/* Active Switch */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: field.is_active ? '#15803d' : '#94a3b8',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={field.is_active}
                      onChange={() => handleToggle(field)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#16a34a',
                        cursor: 'pointer',
                      }}
                    />
                    <span>{field.is_active ? 'مفعّل' : 'معطّل'}</span>
                  </label>

                  {/* Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedField(field);
                        setModalOpen(true);
                      }}
                      className="btn btn-secondary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                    >
                      <Edit2 size={13} />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(field)}
                      disabled={field.is_system}
                      title={field.is_system ? 'محمي من الحذف (حقل نظام)' : 'حذف الحقل'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: field.is_system ? '#e2e8f0' : '#fecaca',
                        backgroundColor: field.is_system ? '#f8fafc' : '#fef2f2',
                        color: field.is_system ? '#cbd5e1' : '#dc2626',
                        cursor: field.is_system ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ───────────────────────────────────────────────────── */}
      {modalOpen && (
        <FieldModal
          existing={selectedField}
          onClose={() => {
            setModalOpen(false);
            setSelectedField(null);
          }}
          onSaved={fetchFields}
        />
      )}
    </div>
  );
};
