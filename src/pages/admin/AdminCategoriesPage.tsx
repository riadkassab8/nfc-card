/* ==========================================================================
   ADMIN CATEGORIES PAGE
   Full CRUD: GET/POST/PUT/DELETE /api/categories
   ========================================================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../../services';
import { ApiCategory, ApiCreateCategoryDto, ApiUpdateCategoryDto, fmtDate } from '../../types';
import { Plus, Edit2, Trash2, RefreshCw, Tags, CheckCircle2, XCircle, X, Save } from 'lucide-react';

// ── Toast ─────────────────────────────────────────────────────────────────
type TT = 'success' | 'error';
const Toast: React.FC<{ msg: string; type: TT; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', top: '24px', insetInlineEnd: '24px', zIndex: 1200, maxWidth: '360px', backgroundColor: type === 'success' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${type === 'success' ? '#a7f3d0' : '#fecaca'}`, color: type === 'success' ? '#047857' : '#991b1b', borderRadius: '12px', padding: '14px 18px', fontWeight: 700, fontFamily: 'Cairo, sans-serif', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 10px 28px rgba(15,23,42,0.1)' }}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem' }}>✕</button>
    </div>
  );
};

// ── Category Modal ────────────────────────────────────────────────────────
const CategoryModal: React.FC<{
  existing?: ApiCategory | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ existing, onClose, onSaved }) => {
  const isEdit = !!existing;
  const [name, setName]         = useState(existing?.name ?? '');
  const [desc, setDesc]         = useState(existing?.description ?? '');
  const [icon, setIcon]         = useState(existing?.icon ?? '');
  const [active, setActive]     = useState(existing?.is_active ?? true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('اسم التصنيف مطلوب'); return; }
    setSaving(true); setError(null);
    try {
      if (isEdit && existing) {
        const dto: ApiUpdateCategoryDto = { name: name.trim(), description: desc.trim() || undefined, icon: icon.trim() || undefined, is_active: active };
        await categoriesApi.updateCategory(existing._id, dto);
      } else {
        const dto: ApiCreateCategoryDto = { name: name.trim(), description: desc.trim() || undefined, icon: icon.trim() || undefined, is_active: active };
        await categoriesApi.createCategory(dto);
      }
      onSaved(); onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 1000 }} />
      <div dir="rtl" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(480px,calc(100vw - 32px))', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1001, fontFamily: 'Cairo, sans-serif', animation: 'modalIn 220ms cubic-bezier(0.16,1,0.3,1) both', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a' }}>{isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '9px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><X size={17} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', color: '#991b1b', fontWeight: 700, fontSize: '0.875rem' }}>❌ {error}</div>}

          <div>
            <label style={lbl}>اسم التصنيف *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: مطاعم، مقاهي..." style={inp} required />
          </div>
          <div>
            <label style={lbl}>الوصف (اختياري)</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="وصف مختصر" style={inp} />
          </div>
          <div>
            <label style={lbl}>رابط الأيقونة (اختياري)</label>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="https://cdn.example.com/icon.png" style={inp} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" onClick={() => setActive(!active)} style={{ width: '44px', height: '24px', borderRadius: '99px', border: 'none', cursor: 'pointer', backgroundColor: active ? '#10b981' : '#cbd5e1', position: 'relative', transition: 'background 200ms', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '3px', left: active ? '22px' : '3px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 200ms' }} />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{active ? 'مفعّل' : 'معطّل'}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>إلغاء</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
              {saving ? <><RefreshCw size={15} className="spin" /> حفظ...</> : <><Save size={15} /> {isEdit ? 'حفظ التعديلات' : 'إضافة'}</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

// ── Confirm dialog ────────────────────────────────────────────────────────
const Confirm: React.FC<{ name: string; onConfirm: () => void; onCancel: () => void }> = ({ name, onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 1000 }} />
    <div dir="rtl" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(420px,calc(100vw - 32px))', backgroundColor: '#fff', borderRadius: '16px', padding: '28px', zIndex: 1001, fontFamily: 'Cairo, sans-serif', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
      <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '20px', fontSize: '1rem' }}>هل تريد حذف التصنيف "<strong>{name}</strong>"؟</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>إلغاء</button>
        <button onClick={onConfirm} style={{ padding: '9px 18px', borderRadius: '9px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>حذف</button>
      </div>
    </div>
  </>
);

// ── Main ──────────────────────────────────────────────────────────────────
export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: TT } | null>(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<ApiCategory | null>(null);
  const [deleting, setDeleting]     = useState<ApiCategory | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await categoriesApi.getCategories({ limit: 100 });
      setCategories(res.data ?? []);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await categoriesApi.deleteCategory(deleting._id);
      setToast({ msg: `🗑️ تم حذف "${deleting.name}"`, type: 'success' });
      setDeleting(null);
      fetch();
    } catch (err: any) {
      setToast({ msg: err?.message || 'فشل الحذف', type: 'error' });
      setDeleting(null);
    }
  };

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'Cairo, sans-serif' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {modalOpen && <CategoryModal existing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSaved={() => { fetch(); setToast({ msg: editing ? '✅ تم التعديل' : '✅ تم الإضافة', type: 'success' }); }} />}
      {deleting && <Confirm name={deleting.name} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e2d4a 55%,#312e81 100%)', borderRadius: '20px', padding: '22px 26px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', boxShadow: '0 10px 32px -5px rgba(15,23,42,0.3)' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>إدارة التصنيفات</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>إضافة وتعديل وحذف تصنيفات البطاقات</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetch} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.875rem' }}>
            <RefreshCw size={15} /> تحديث
          </button>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: '0.9rem' }}>
            <Plus size={17} /> إضافة تصنيف
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '16px 20px', color: '#991b1b', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <XCircle size={20} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button onClick={fetch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700, display: 'flex', gap: '5px', alignItems: 'center', fontFamily: 'Cairo, sans-serif' }}>
            <RefreshCw size={14} /> إعادة
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ height: '16px', width: '40%', borderRadius: '6px', ...shimmer }} />
              </div>
            ))
          : categories.length === 0
          ? (
              <div style={{ padding: '56px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Tags size={44} style={{ marginBottom: '12px' }} />
                <p style={{ fontWeight: 700, margin: '0 0 16px' }}>لا توجد تصنيفات</p>
                <button onClick={() => { setEditing(null); setModalOpen(true); }} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <Plus size={16} /> إضافة أول تصنيف
                </button>
              </div>
            )
          : (
              <>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr auto auto auto', gap: 0, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 20px' }}>
                  {['الاسم', 'الوصف', 'الحالة', 'التاريخ', 'إجراءات'].map((h) => (
                    <div key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0 8px' }}>{h}</div>
                  ))}
                </div>

                {categories.map((cat, idx) => (
                  <div key={cat._id} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr auto auto auto', gap: 0, padding: '14px 20px', borderBottom: idx < categories.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center', transition: 'background 120ms' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fafbff')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fff')}
                  >
                    {/* Name + icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
                      {cat.icon
                        ? <img src={cat.icon} alt={cat.name} style={{ width: '34px', height: '34px', borderRadius: '9px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        : <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Tags size={16} style={{ color: '#94a3b8' }} /></div>}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>{cat.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>{cat._id}</div>
                      </div>
                    </div>
                    {/* Desc */}
                    <div style={{ padding: '0 8px', fontSize: '0.8125rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.description || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>—</span>}
                    </div>
                    {/* Status */}
                    <div style={{ padding: '0 8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: cat.is_active ? '#d1fae5' : '#fee2e2', color: cat.is_active ? '#047857' : '#dc2626' }}>
                        {cat.is_active ? <><CheckCircle2 size={12} /> مفعّل</> : <><XCircle size={12} /> معطّل</>}
                      </span>
                    </div>
                    {/* Date */}
                    <div style={{ padding: '0 8px', fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{fmtDate(cat.createdAt)}</div>
                    {/* Actions */}
                    <div style={{ padding: '0 8px', display: 'flex', gap: '6px' }}>
                      <button title="تعديل" onClick={() => { setEditing(cat); setModalOpen(true); }} style={actionBtn('#6366f1')}><Edit2 size={14} /></button>
                      <button title="حذف"   onClick={() => setDeleting(cat)} style={actionBtn('#ef4444')}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}

                {/* Footer count */}
                <div style={{ padding: '12px 28px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>الإجمالي: <strong style={{ color: '#0f172a' }}>{categories.length}</strong></span>
                  <button onClick={() => { setEditing(null); setModalOpen(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.8125rem' }}>
                    <Plus size={14} /> إضافة
                  </button>
                </div>
              </>
            )}
      </div>
    </div>
  );
};

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' };
const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'Cairo, sans-serif', outline: 'none', backgroundColor: '#f8fafc' };
const actionBtn = (color: string): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: `1.5px solid ${color}33`, backgroundColor: `${color}10`, color, cursor: 'pointer' });
const shimmer: React.CSSProperties = { background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% auto', animation: 'shimmer 1.4s linear infinite' };

export default AdminCategoriesPage;
