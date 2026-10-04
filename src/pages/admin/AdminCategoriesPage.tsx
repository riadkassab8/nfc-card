import React, { useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../../services';
import { ApiCategory, ApiCreateCategoryDto, ApiUpdateCategoryDto, fmtDate } from '../../types';
import {
  Plus, Edit2, Trash2, RefreshCw, Tags,
  CheckCircle2, XCircle, X, Save,
} from 'lucide-react';

/* ── Toast ─────────────────────────────────────────────────────── */
const Toast: React.FC<{ msg: string; type: 'success' | 'error'; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
    </div>
  );
};

/* ── Modal ─────────────────────────────────────────────────────── */
const Modal: React.FC<{ existing?: ApiCategory | null; onClose: () => void; onSaved: () => void }> = ({ existing, onClose, onSaved }) => {
  const isEdit = !!existing;
  const [name, setName]     = useState(existing?.name ?? '');
  const [desc, setDesc]     = useState(existing?.description ?? '');
  const [icon, setIcon]     = useState(existing?.icon ?? '');
  const [active, setActive] = useState(existing?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr('الاسم مطلوب'); return; }
    setSaving(true); setErr(null);
    try {
      if (isEdit && existing) {
        const dto: ApiUpdateCategoryDto = { name: name.trim(), description: desc.trim() || undefined, icon: icon.trim() || undefined, is_active: active };
        await categoriesApi.updateCategory(existing._id, dto);
      } else {
        const dto: ApiCreateCategoryDto = { name: name.trim(), description: desc.trim() || undefined, icon: icon.trim() || undefined, is_active: active };
        await categoriesApi.createCategory(dto);
      }
      onSaved(); onClose();
    } catch (e: any) { setErr(e?.message || 'حدث خطأ'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel" dir="rtl">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {err && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', color: 'var(--clr-error)', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>
              {err}
            </div>
          )}
          <form id="cat-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">اسم التصنيف *</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: مطاعم، مقاهي..." required />
            </div>
            <div className="form-group">
              <label className="form-label">الوصف (اختياري)</label>
              <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="وصف مختصر" />
            </div>
            <div className="form-group">
              <label className="form-label">رابط الأيقونة (اختياري)</label>
              <input className="form-input" value={icon} onChange={e => setIcon(e.target.value)} placeholder="https://..." />
            </div>
            <div className="toggle-wrap">
              <button
                type="button"
                className={`toggle ${active ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => setActive(!active)}
              >
                <div className="toggle-thumb" style={{ [active ? 'left' : 'right']: '3px' }} />
              </button>
              <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--txt-body)' }}>
                {active ? 'مفعّل' : 'معطّل'}
              </span>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn-outline" type="button" onClick={onClose}>إلغاء</button>
          <button
            className="btn-primary" type="submit" form="cat-form" disabled={saving}
            style={{ minWidth: '120px', justifyContent: 'center' }}
          >
            {saving ? <><RefreshCw size={14} className="spin" /> حفظ...</> : <><Save size={14} /> {isEdit ? 'حفظ التعديلات' : 'إضافة'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Confirm ────────────────────────────────────────────────────── */
const Confirm: React.FC<{ name: string; onConfirm: () => void; onCancel: () => void }> = ({ name, onConfirm, onCancel }) => (
  <div className="modal-overlay" style={{ zIndex: 1050 }}>
    <div style={{
      background: 'var(--bg-white)', borderRadius: 'var(--r-2xl)',
      padding: '26px', maxWidth: '400px', width: '100%',
      boxShadow: 'var(--shadow-xl)', fontFamily: 'var(--font)',
      animation: 'modalIn 220ms var(--ease-out) both',
    }} dir="rtl">
      <p style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--txt-body)', marginBottom: '22px' }}>
        هل تريد حذف التصنيف "<strong style={{ color: 'var(--txt-heading)' }}>{name}</strong>"؟
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onCancel}>إلغاء</button>
        <button onClick={onConfirm} style={{ padding: '9px 18px', borderRadius: 'var(--r-md)', border: 'none', backgroundColor: 'var(--clr-error)', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700, fontSize: 'var(--fs-base)' }}>حذف</button>
      </div>
    </div>
  </div>
);

/* ── Main ─────────────────────────────────────────────────────── */
export const AdminCategoriesPage: React.FC = () => {
  const [cats, setCats]       = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<ApiCategory | null>(null);
  const [deleting, setDeleting]   = useState<ApiCategory | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setCats((await categoriesApi.getCategories({ limit: 100 })).data ?? []); }
    catch (e: any) { setError(e?.message || 'فشل التحميل'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await categoriesApi.deleteCategory(deleting._id);
      setToast({ msg: `تم حذف "${deleting.name}"`, type: 'success' });
      setDeleting(null); fetch();
    } catch (e: any) {
      setToast({ msg: e?.message || 'فشل الحذف', type: 'error' });
      setDeleting(null);
    }
  };

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font)' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {modalOpen && (
        <Modal
          existing={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={() => { fetch(); setToast({ msg: editing ? 'تم التعديل بنجاح' : 'تم الإضافة بنجاح', type: 'success' }); }}
        />
      )}
      {deleting && <Confirm name={deleting.name} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />}

      {/* Hero */}
      <div className="page-hero">
        <div style={{ zIndex: 1 }}>
          <span className="page-hero-label">الإعدادات</span>
          <h2>إدارة التصنيفات</h2>
          <p>إضافة وتعديل وحذف تصنيفات البطاقات</p>
        </div>
        <div style={{ zIndex: 1, display: 'flex', gap: '10px' }}>
          <button className="page-hero-btn" onClick={fetch}><RefreshCw size={14} /> تحديث</button>
          <button className="page-hero-btn page-hero-btn-solid" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={16} /> إضافة تصنيف
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', borderRadius: 'var(--r-lg)', padding: '13px 16px', color: 'var(--clr-error)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <XCircle size={17} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button className="btn-outline" onClick={fetch} style={{ fontSize: 'var(--fs-xs)', padding: '5px 12px' }}>إعادة</button>
        </div>
      )}

      <div className="data-table-wrapper">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '15px 20px', borderBottom: '1px solid var(--bg-subtle)' }}>
                <div className="shimmer" style={{ height: '14px', width: '40%', marginBottom: '6px' }} />
                <div className="shimmer" style={{ height: '11px', width: '25%' }} />
              </div>
            ))
          : cats.length === 0
            ? (
              <div style={{ padding: '56px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
                <Tags size={42} style={{ marginBottom: '12px', color: 'var(--bdr-medium)' }} />
                <p style={{ fontWeight: 600, marginBottom: '16px' }}>لا توجد تصنيفات بعد</p>
                <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }} style={{ margin: '0 auto' }}>
                  <Plus size={15} /> إضافة أول تصنيف
                </button>
              </div>
            )
            : (
              <>
                {/* رأس الجدول */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 3fr 100px 130px 90px',
                  padding: '10px 20px', backgroundColor: 'var(--bg-subtle)',
                  borderBottom: '1px solid var(--bdr-light)',
                }}>
                  {['الاسم', 'الوصف', 'الحالة', 'التاريخ', 'إجراءات'].map(h => (
                    <div key={h} style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--txt-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 6px' }}>{h}</div>
                  ))}
                </div>

                {cats.map((cat, idx) => (
                  <div
                    key={cat._id}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 3fr 100px 130px 90px',
                      padding: '14px 20px', alignItems: 'center',
                      borderBottom: idx < cats.length - 1 ? '1px solid var(--bg-subtle)' : 'none',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--clr-primary-50)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
                  >
                    {/* الاسم */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px' }}>
                      {cat.icon
                        ? <img src={cat.icon} alt="" style={{ width: '32px', height: '32px', borderRadius: 'var(--r-sm)', objectFit: 'cover', border: '1px solid var(--bdr-light)', flexShrink: 0 }} onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                        : <div style={{ width: '32px', height: '32px', borderRadius: 'var(--r-sm)', backgroundColor: 'var(--clr-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Tags size={15} style={{ color: 'var(--clr-primary-400)' }} />
                          </div>}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-base)', color: 'var(--txt-heading)' }}>{cat.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--txt-muted)', fontFamily: 'monospace' }}>{cat._id.slice(-8)}</div>
                      </div>
                    </div>
                    {/* الوصف */}
                    <div style={{ padding: '0 6px', fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.description || <span style={{ color: 'var(--txt-muted)', fontStyle: 'italic' }}>—</span>}
                    </div>
                    {/* الحالة */}
                    <div style={{ padding: '0 6px' }}>
                      <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-error'}`}>
                        {cat.is_active ? <><CheckCircle2 size={11} /> مفعّل</> : <><XCircle size={11} /> معطّل</>}
                      </span>
                    </div>
                    {/* التاريخ */}
                    <div style={{ padding: '0 6px', fontSize: 'var(--fs-xs)', color: 'var(--txt-secondary)' }}>
                      {fmtDate(cat.createdAt)}
                    </div>
                    {/* إجراءات */}
                    <div style={{ padding: '0 6px', display: 'flex', gap: '6px' }}>
                      <button title="تعديل" onClick={() => { setEditing(cat); setModalOpen(true); }} style={{ ...actBtn, color: 'var(--clr-primary-600)', backgroundColor: 'var(--clr-primary-50)' }}>
                        <Edit2 size={14} />
                      </button>
                      <button title="حذف" onClick={() => setDeleting(cat)} style={{ ...actBtn, color: 'var(--clr-error)', backgroundColor: 'var(--clr-error-bg)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ padding: '11px 20px', backgroundColor: 'var(--bg-subtle)', borderTop: '1px solid var(--bdr-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', fontWeight: 600 }}>
                    الإجمالي: <strong style={{ color: 'var(--txt-heading)' }}>{cats.length}</strong> تصنيف
                  </span>
                  <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }} style={{ padding: '7px 16px', fontSize: 'var(--fs-sm)' }}>
                    <Plus size={14} /> إضافة
                  </button>
                </div>
              </>
            )}
      </div>
    </div>
  );
};

const actBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '30px', height: '30px', borderRadius: 'var(--r-sm)',
  border: 'none', cursor: 'pointer', flexShrink: 0,
};

export default AdminCategoriesPage;
