import React, { useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../../services';
import { ApiCategory, ApiCreateCategoryDto, ApiUpdateCategoryDto } from '../../types';
import {
  Plus, Edit2, RefreshCw, Tags,
  CheckCircle2, XCircle, X, Save, Search
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

/* ── Modal (إضافة / تعديل التصنيف - الاسم والحالة فقط) ───────────────── */
const Modal: React.FC<{ existing?: ApiCategory | null; onClose: () => void; onSaved: () => void }> = ({ existing, onClose, onSaved }) => {
  const isEdit = !!existing;
  const [name, setName]     = useState(existing?.name ?? '');
  const [active, setActive] = useState(existing?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr('اسم التصنيف مطلوب'); return; }
    setSaving(true); setErr(null);
    try {
      if (isEdit && existing) {
        const dto: ApiUpdateCategoryDto = { name: name.trim(), is_active: active };
        await categoriesApi.updateCategory(existing._id, dto);
      } else {
        const dto: ApiCreateCategoryDto = { name: name.trim(), is_active: active };
        await categoriesApi.createCategory(dto);
      }
      onSaved(); onClose();
    } catch (e: any) { setErr(e?.message || 'حدث خطأ'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel" dir="rtl" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {err && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', color: 'var(--clr-error)', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>
              {err}
            </div>
          )}
          <form id="cat-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px' }}>اسم التصنيف *</label>
              <input
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: مطاعم، أطباء، شركات، نشاط تجاري..."
                required
                autoFocus
                style={{ fontSize: '14.5px', padding: '10px 14px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px' }}>حالة التصنيف</label>
              <div
                onClick={() => setActive(!active)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1.5px solid ${active ? '#bbf7d0' : 'var(--bdr-light)'}`,
                  backgroundColor: active ? '#f0fdf4' : 'var(--bg-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    backgroundColor: active ? '#dcfce7' : '#f1f5f9',
                    color: active ? '#16a34a' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: active ? '#15803d' : 'var(--txt-secondary)', display: 'block' }}>
                      {active ? 'مفعّل (نشط)' : 'غير مفعّل (معطّل)'}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)' }}>
                      {active ? 'سيظهر في القائمة المنسدلة عند إنشاء وتعديل البطاقات' : 'لن يظهر في القائمة المنسدلة عند إضافة أو تعديل بطاقة'}
                    </span>
                  </div>
                </div>

                <div className={`toggle ${active ? 'toggle-on' : 'toggle-off'}`} style={{ pointerEvents: 'none' }}>
                  <div className="toggle-thumb" style={{ [active ? 'left' : 'right']: '3px' }} />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn-outline" type="button" onClick={onClose}>إلغاء</button>
          <button
            className="btn-primary" type="submit" form="cat-form" disabled={saving}
            style={{ minWidth: '130px', justifyContent: 'center' }}
          >
            {saving ? <><RefreshCw size={14} className="spin" /> حفظ...</> : <><Save size={14} /> {isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
export const AdminCategoriesPage: React.FC = () => {
  const [cats, setCats]             = useState<ApiCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<ApiCategory | null>(null);

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const firstPage = await categoriesApi.getCategories({ page: 1, limit: 100 });
      let allCats = firstPage.data ?? [];
      if (firstPage.totalPages && firstPage.totalPages > 1) {
        const promises = [];
        for (let p = 2; p <= firstPage.totalPages; p++) {
          promises.push(categoriesApi.getCategories({ page: p, limit: 100 }));
        }
        const restPages = await Promise.all(promises);
        restPages.forEach((pRes) => {
          allCats = allCats.concat(pRes.data ?? []);
        });
      }
      setCats(allCats);
    } catch (e: any) {
      setError(e?.message || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const totalCount = cats.length;
  const activeCount = cats.filter(c => c.is_active).length;
  const inactiveCount = cats.filter(c => !c.is_active).length;

  const filteredCats = cats.filter(cat => {
    const searchLow = search.toLowerCase();
    const matchSearch = !search || cat.name.toLowerCase().includes(searchLow);
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? cat.is_active : !cat.is_active);
    return matchSearch && matchStatus;
  });

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

      {/* Hero Header */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)'
      }}>
        <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', right: '25%', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', pointerEvents: 'none' }} />

        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.12)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#93c5fd' }}>
            <span>لوحة الإعدادات والتصنيفات</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px', color: '#fff' }}>إدارة تصنيفات البطاقات</h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
            إجمالي التصنيفات المسجلة: <strong style={{ color: '#38bdf8', fontWeight: 800 }}>{totalCount}</strong> تصنيف
          </p>
        </div>
        <div style={{ zIndex: 1, display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={18} /> إضافة تصنيف جديد
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { key: 'all',      label: 'إجمالي التصنيفات', val: totalCount,    icon: <Tags size={20} />,         color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
          { key: 'active',   label: 'تصنيفات مفعّلة',   val: activeCount,   icon: <CheckCircle2 size={20} />, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
          { key: 'inactive', label: 'تصنيفات معطّلة',  val: inactiveCount, icon: <XCircle size={20} />,      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
        ].map(s => {
          const isSelected = statusFilter === s.key;
          return (
            <div
              key={s.label}
              onClick={() => setStatusFilter(s.key as any)}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: isSelected ? `2px solid ${s.color}` : '1px solid var(--bdr-light)',
                boxShadow: isSelected ? `0 8px 20px -4px ${s.color}25` : '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: s.bg,
                border: `1px solid ${s.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.color,
                flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-muted)', marginBottom: '4px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--txt-heading)', lineHeight: 1 }}>
                  {loading ? '—' : s.val}
                </div>
              </div>
              {isSelected && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--bdr-light)',
        borderRadius: '16px',
        padding: '14px 18px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم التصنيف..."
            className="form-input"
            style={{ paddingRight: '36px', height: '40px', borderRadius: '10px', width: '100%' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          style={{
            padding: '8px 14px', borderRadius: '10px',
            border: '1.5px solid var(--bdr-light)',
            fontSize: 'var(--fs-sm)', fontFamily: 'var(--font)',
            color: 'var(--txt-body)', backgroundColor: 'var(--bg-white)',
            cursor: 'pointer', outline: 'none', height: '40px',
          }}
        >
          <option value="all">كل الحالات (عرض الكل)</option>
          <option value="active">مفعّل فقط</option>
          <option value="inactive">معطّل فقط</option>
        </select>

        <button
          className="btn-outline"
          onClick={fetch}
          style={{ padding: '0 16px', height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> تحديث
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', borderRadius: 'var(--r-lg)', padding: '13px 16px', color: 'var(--clr-error)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <XCircle size={17} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button className="btn-outline" onClick={fetch} style={{ fontSize: 'var(--fs-xs)', padding: '5px 12px' }}>إعادة</button>
        </div>
      )}

      {/* Table (عرض اسم التصنيف، الحالة مفعّل/معطّل، وزر التعديل فقط) */}
      <div className="data-table-wrapper">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '18px 24px', borderBottom: '1px solid var(--bg-subtle)' }}>
                <div className="shimmer" style={{ height: '16px', width: '35%', marginBottom: '8px' }} />
                <div className="shimmer" style={{ height: '12px', width: '20%' }} />
              </div>
            ))
          : filteredCats.length === 0
            ? (
              <div style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
                <Tags size={48} style={{ marginBottom: '14px', color: 'var(--bdr-medium)' }} />
                <p style={{ fontWeight: 700, fontSize: 'var(--fs-base)', marginBottom: '16px', color: 'var(--txt-heading)' }}>
                  {search || statusFilter !== 'all' ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد تصنيفات بعد'}
                </p>
                <button
                  className="btn-primary"
                  onClick={() => { setEditing(null); setModalOpen(true); }}
                  style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} /> إضافة تصنيف جديد
                </button>
              </div>
            )
            : (
              <div style={{ overflowX: 'auto', padding: '10px 4px' }}>
                <table className="premium-table" style={{ minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '55%' }}>اسم التصنيف</th>
                      <th style={{ width: '25%', textAlign: 'center' }}>الحالة</th>
                      <th style={{ width: '20%', textAlign: 'center' }}>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCats.map(cat => (
                      <tr key={cat._id}>
                        {/* Name */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '12px',
                              backgroundColor: cat.is_active ? 'var(--clr-primary-50)' : '#f1f5f9',
                              border: `1px solid ${cat.is_active ? 'var(--clr-primary-100)' : '#e2e8f0'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: cat.is_active ? 'var(--clr-primary-600)' : '#94a3b8', flexShrink: 0
                            }}>
                              <Tags size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, textAlign: 'center', fontSize: '15px', color: 'var(--txt-heading)' }}>
                                {cat.name}
                              </div>
                              
                            </div>
                          </div>
                        </td>

                        {/* Status (مفعّل / غير مفعّل) */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-error'}`} style={{ padding: '5px 14px', fontSize: '12px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
                            {cat.is_active ? 'مفعّل' : 'غير مفعّل'}
                          </span>
                        </td>

                        {/* Actions (تعديل فقط - بدون حذف) */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            title="تعديل التصنيف"
                            onClick={() => { setEditing(cat); setModalOpen(true); }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '7px 16px', borderRadius: '10px',
                              border: '1px solid var(--clr-primary-200)',
                              backgroundColor: 'var(--clr-primary-50)',
                              color: 'var(--clr-primary-700)',
                              cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                              fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                            }}
                          >
                            <Edit2 size={14} />
                            <span>تعديل</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
