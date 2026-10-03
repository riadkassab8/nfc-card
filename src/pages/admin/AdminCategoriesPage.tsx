import React, { useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../../services/api';
import { ApiCategory, ApiCreateCategoryDto, ApiUpdateCategoryDto } from '../../types';
import { Input, Toast, Skeleton, ConfirmDialog } from '../../components/ui';
import { ApiError } from '../../services/api/client';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Tags,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Layers,
} from 'lucide-react';

/* ─── helpers ─── */
const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

/* ─── Modal ─── */
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existing?: ApiCategory | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSaved, existing }) => {
  const isEdit = !!existing;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(existing?.name || '');
      setDescription(existing?.description || '');
      setIcon(existing?.icon || '');
      setIsActive(existing?.is_active ?? true);
      setError(null);
    }
  }, [isOpen, existing]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('اسم التصنيف مطلوب');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && existing) {
        const dto: ApiUpdateCategoryDto = {
          name: name.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          is_active: isActive,
        };
        await categoriesApi.updateCategory(existing._id, dto);
      } else {
        const dto: ApiCreateCategoryDto = {
          name: name.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          is_active: isActive,
        };
        await categoriesApi.createCategory(dto);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('حدث خطأ. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>
            {isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2', color: '#991b1b',
            border: '1px solid #fca5a5', borderRadius: '10px',
            padding: '10px 14px', fontSize: '0.875rem', fontWeight: 600,
            fontFamily: 'Cairo, sans-serif',
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="اسم التصنيف *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: مطاعم، مقاهي، خدمات..."
            required
          />

          <Input
            label="الوصف (اختياري)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر لهذا التصنيف"
          />

          <Input
            label="رابط الأيقونة (اختياري)"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="https://cdn.example.com/icon.png"
          />

          {/* is_active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '99px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? '#10b981' : '#cbd5e1',
                transition: 'background-color 200ms',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '3px',
                left: isActive ? '22px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transition: 'left 200ms',
              }} />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', fontFamily: 'Cairo, sans-serif' }}>
              {isActive ? 'مفعّل' : 'معطّل'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '11px', borderRadius: '10px', fontFamily: 'Cairo, sans-serif',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155',
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, padding: '11px', borderRadius: '10px', fontFamily: 'Cairo, sans-serif',
                fontWeight: 800, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer',
                border: 'none',
                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
              {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ApiCategory | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoriesApi.getCategories({ limit: 100 });
      setCategories(res.data || []);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل التصنيفات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await categoriesApi.deleteCategory(deletingCategory._id);
      showToast('success', `🗑️ تم حذف التصنيف "${deletingCategory.name}" بنجاح`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'فشل حذف التصنيف';
      showToast('error', `❌ ${msg}`);
      setDeletingCategory(null);
    }
  };

  const openCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: ApiCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Cairo, sans-serif' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', insetInlineEnd: '24px', zIndex: 1100 }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => {
          fetchCategories();
          showToast('success', editingCategory ? '✅ تم تحديث التصنيف بنجاح' : '✅ تم إضافة التصنيف بنجاح');
        }}
        existing={editingCategory}
      />

      {/* Confirm Delete */}
      {deletingCategory && (
        <ConfirmDialog
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onConfirm={handleDelete}
          title="تأكيد حذف التصنيف"
          message={`هل أنت متأكد من رغبتك في حذف التصنيف "${deletingCategory.name}"؟ إذا كانت هناك بطاقات مرتبطة بهذا التصنيف، قد يرفض السيرفر الحذف ويعرض الخطأ المناسب.`}
          confirmLabel="حذف التصنيف"
          cancelLabel="إلغاء"
          isDanger
        />
      )}

      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e2d4a 60%, #312e81 100%)',
          borderRadius: '20px',
          padding: '24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 32px -5px rgba(15,23,42,0.28)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', insetInlineEnd: '-30px', top: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ zIndex: 1 }}>
          <span style={{ display: 'inline-block', marginBottom: '10px', backgroundColor: 'rgba(99,102,241,0.22)', color: '#a5b4fc', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)' }}>
            إدارة المنصة
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.2 }}>
            التصنيفات
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            إدارة تصنيفات البطاقات — إضافة، تعديل، وحذف من قاعدة البيانات الحقيقية.
          </p>
        </div>

        <div style={{ zIndex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchCategories}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
              border: '1.5px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff', transition: 'all 150ms ease',
            }}
          >
            <RefreshCw size={16} /> تحديث
          </button>
          <button
            type="button"
            onClick={openCreate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 800, fontFamily: 'Cairo, sans-serif',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}
          >
            <Plus size={18} /> إضافة تصنيف
          </button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        /* Error State */
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #fca5a5',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <XCircle size={48} style={{ color: '#ef4444' }} />
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#991b1b' }}>
            خطأ في تحميل التصنيفات
          </div>
          <p style={{ color: '#ef4444', fontSize: '0.875rem', maxWidth: '400px' }}>{error}</p>
          <button
            type="button"
            onClick={fetchCategories}
            style={{
              padding: '10px 24px', borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
              border: '1.5px solid #ef4444', backgroundColor: '#fff', color: '#ef4444',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            <RefreshCw size={16} /> إعادة المحاولة
          </button>
        </div>
      ) : loading ? (
        /* Loading State */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="72px" style={{ borderRadius: '14px' }} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        /* Empty State */
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '64px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers size={36} style={{ color: '#94a3b8' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            لا يوجد تصنيفات بعد
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', maxWidth: '360px', lineHeight: 1.6 }}>
            أضف أول تصنيف لتنظيم البطاقات في مجموعات منطقية.
          </p>
          <button
            type="button"
            onClick={openCreate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '12px', cursor: 'pointer',
              fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'Cairo, sans-serif',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff', marginTop: '8px',
            }}
          >
            <Plus size={18} /> إضافة أول تصنيف
          </button>
        </div>
      ) : (
        /* Categories Table */
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr auto auto auto',
            gap: '0',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '12px 20px',
          }}>
            {['اسم التصنيف', 'الوصف', 'الحالة', 'تاريخ الإنشاء', 'الإجراءات'].map((col, i) => (
              <div key={i} style={{
                fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                padding: '0 8px',
              }}>
                {col}
              </div>
            ))}
          </div>

          {/* Rows */}
          {categories.map((cat, index) => (
            <div
              key={cat._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr auto auto auto',
                gap: '0',
                padding: '16px 20px',
                borderBottom: index < categories.length - 1 ? '1px solid #f1f5f9' : 'none',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fafbff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff'; }}
            >
              {/* Name + Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
                {cat.icon ? (
                  <img
                    src={cat.icon}
                    alt={cat.name}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Tags size={18} style={{ color: '#94a3b8' }} />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                    {cat._id}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ padding: '0 8px', color: '#475569', fontSize: '0.875rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {cat.description || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>—</span>}
              </div>

              {/* Status */}
              <div style={{ padding: '0 8px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700,
                  backgroundColor: cat.is_active ? '#d1fae5' : '#fee2e2',
                  color: cat.is_active ? '#047857' : '#dc2626',
                  border: `1px solid ${cat.is_active ? '#a7f3d0' : '#fca5a5'}`,
                }}>
                  {cat.is_active
                    ? <><CheckCircle2 size={13} /> مفعّل</>
                    : <><XCircle size={13} /> معطّل</>}
                </span>
              </div>

              {/* Created At */}
              <div style={{ padding: '0 8px', color: '#64748b', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                {fmtDate(cat.createdAt)}
              </div>

              {/* Actions */}
              <div style={{ padding: '0 8px', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  title="تعديل التصنيف"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer',
                    border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#eef2ff'; (e.currentTarget as HTMLElement).style.borderColor = '#818cf8'; (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#334155'; }}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingCategory(cat)}
                  title="حذف التصنيف"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer',
                    border: '1.5px solid #fca5a5', backgroundColor: '#fff5f5', color: '#dc2626',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff5f5'; }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {/* Footer count */}
          <div style={{ padding: '12px 28px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
              إجمالي التصنيفات: <strong style={{ color: '#0f172a' }}>{categories.length}</strong>
            </span>
            <button
              type="button"
              onClick={openCreate}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
              }}
            >
              <Plus size={15} /> إضافة تصنيف
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
