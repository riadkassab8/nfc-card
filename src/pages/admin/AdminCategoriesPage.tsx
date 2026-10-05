import React, { useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../../services';
import { ApiCategory, ApiCreateCategoryDto, ApiUpdateCategoryDto, fmtDate, parseCategoryMeta, stringifyCategoryMeta } from '../../types';
import {
  Plus, Edit2, Trash2, RefreshCw, Tags,
  CheckCircle2, XCircle, X, Save, Search,
  Phone, Mail, MessageCircle, Instagram, Facebook, Video, MapPin, Globe, Check, CreditCard, Smartphone
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

const AVAILABLE_FIELDS = [
  { key: 'phone', label: 'رقم الهاتف', icon: <Phone size={13} /> },
  { key: 'email', label: 'البريد الإلكتروني', icon: <Mail size={13} /> },
  { key: 'whatsapp', label: 'واتساب', icon: <MessageCircle size={13} /> },
  { key: 'instagram', label: 'انستجرام', icon: <Instagram size={13} /> },
  { key: 'facebook', label: 'فيسبوك', icon: <Facebook size={13} /> },
  { key: 'tiktok', label: 'تيك توك', icon: <Video size={13} /> },
  { key: 'google_maps', label: 'رابط تقييمات جوجل', icon: <MapPin size={13} /> },
  { key: 'website', label: 'الموقع الإلكتروني', icon: <Globe size={13} /> },
  { key: 'instapay', label: 'انستا باي', icon: <CreditCard size={13} /> },
  { key: 'vodafone_cash', label: 'فودافون كاش', icon: <Smartphone size={13} /> },
];

const Modal: React.FC<{ existing?: ApiCategory | null; onClose: () => void; onSaved: () => void }> = ({ existing, onClose, onSaved }) => {
  const isEdit = !!existing;
  const meta = parseCategoryMeta(existing?.description);
  const [name, setName]     = useState(existing?.name ?? '');
  const [desc, setDesc]     = useState(meta.desc ?? '');
  const [fields, setFields] = useState<string[]>(meta.fields ?? []);
  const [icon, setIcon]     = useState(existing?.icon ?? '');
  const [active, setActive] = useState(existing?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  const toggleField = (key: string) => {
    setFields(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr('الاسم مطلوب'); return; }
    setSaving(true); setErr(null);
    try {
      const finalDesc = stringifyCategoryMeta(desc.trim(), fields);
      if (isEdit && existing) {
        const dto: ApiUpdateCategoryDto = { name: name.trim(), description: finalDesc, icon: icon.trim() || undefined, is_active: active };
        await categoriesApi.updateCategory(existing._id, dto);
      } else {
        const dto: ApiCreateCategoryDto = { name: name.trim(), description: finalDesc, icon: icon.trim() || undefined, is_active: active };
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
            
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>
                الحقول المطلوبة في البطاقات من هذا التصنيف
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', border: '1px solid var(--bdr-light)', borderRadius: 'var(--r-md)', backgroundColor: 'var(--bg-subtle)' }}>
                {AVAILABLE_FIELDS.map(f => {
                  const isSelected = fields.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => toggleField(f.key)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: 'var(--r-full)',
                        border: `1.5px solid ${isSelected ? 'var(--clr-primary-500)' : 'var(--bdr-medium)'}`,
                        backgroundColor: isSelected ? 'var(--clr-primary-50)' : 'var(--bg-white)',
                        color: isSelected ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
                        fontSize: 'var(--fs-xs)', fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer', transition: 'all 0.15s ease-out',
                        outline: 'none',
                      }}
                    >
                      {f.icon}
                      {f.label}
                      {isSelected && <Check size={13} style={{ strokeWidth: 3 }} />}
                    </button>
                  );
                })}
              </div>
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
  const [cats, setCats]             = useState<ApiCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<ApiCategory | null>(null);
  const [deleting, setDeleting]     = useState<ApiCategory | null>(null);

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

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

  const totalCount = cats.length;
  const activeCount = cats.filter(c => c.is_active).length;
  const inactiveCount = cats.filter(c => !c.is_active).length;

  const filteredCats = cats.filter(cat => {
    const meta = parseCategoryMeta(cat.description);
    const searchLow = search.toLowerCase();
    const matchSearch = !search ||
      cat.name.toLowerCase().includes(searchLow) ||
      (meta.desc || '').toLowerCase().includes(searchLow);
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
      {deleting && <Confirm name={deleting.name} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />}

      {/* Hero */}
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
            placeholder="ابحث باسم التصنيف أو الوصف..."
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
          <option value="all">كل الحالات</option>
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

      {/* Table */}
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
                <table className="premium-table" style={{ minWidth: '920px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>التصنيف</th>
                      <th style={{ width: '28%' }}>الوصف</th>
                      <th style={{ width: '18%' }}>الحقول المطلوبة</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>الحالة</th>
                      <th style={{ width: '14%', textAlign: 'center' }}>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCats.map(cat => {
                      const meta = parseCategoryMeta(cat.description);
                      return (
                        <tr key={cat._id}>
                          {/* Name & Icon */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {cat.icon ? (
                                <img
                                  src={cat.icon}
                                  alt=""
                                  style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    objectFit: 'cover', border: '1px solid var(--bdr-light)', flexShrink: 0
                                  }}
                                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div style={{
                                  width: '40px', height: '40px', borderRadius: '12px',
                                  backgroundColor: 'var(--clr-primary-50)', border: '1px solid var(--clr-primary-100)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'var(--clr-primary-600)', flexShrink: 0
                                }}>
                                  <Tags size={18} />
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--txt-heading)' }}>
                                  {cat.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--txt-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                                  ID: {cat._id.slice(-8)} • {fmtDate(cat.createdAt)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Description */}
                          <td style={{ color: 'var(--txt-secondary)', fontSize: '13.5px' }}>
                            {meta.desc ? (
                              <span>{meta.desc}</span>
                            ) : (
                              <span style={{ color: 'var(--txt-muted)', fontStyle: 'italic' }}>لا يوجد وصف</span>
                            )}
                          </td>

                          {/* Fields Chips */}
                          <td>
                            {meta.fields && meta.fields.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {meta.fields.slice(0, 3).map(fk => {
                                  const f = AVAILABLE_FIELDS.find(af => af.key === fk);
                                  return (
                                    <span
                                      key={fk}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                                        fontSize: '11px', fontWeight: 600,
                                        padding: '2px 7px', borderRadius: '6px',
                                        backgroundColor: '#f1f5f9', color: '#475569',
                                        border: '1px solid #e2e8f0'
                                      }}
                                    >
                                      {f?.icon}
                                      <span>{f?.label || fk}</span>
                                    </span>
                                  );
                                })}
                                {meta.fields.length > 3 && (
                                  <span style={{
                                    fontSize: '11px', fontWeight: 700,
                                    padding: '2px 6px', borderRadius: '6px',
                                    backgroundColor: 'var(--clr-primary-50)', color: 'var(--clr-primary-700)'
                                  }}>
                                    +{meta.fields.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>الافتراضية</span>
                            )}
                          </td>

                          {/* Status */}
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-error'}`} style={{ padding: '4px 12px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
                              {cat.is_active ? 'مفعّل' : 'معطّل'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                              <button
                                title="تعديل التصنيف"
                                onClick={() => { setEditing(cat); setModalOpen(true); }}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '6px 12px', borderRadius: '8px',
                                  border: '1px solid var(--clr-primary-200)',
                                  backgroundColor: 'var(--clr-primary-50)',
                                  color: 'var(--clr-primary-700)',
                                  cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                                  fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                                }}
                              >
                                <Edit2 size={13} />
                                <span>تعديل</span>
                              </button>

                              <button
                                title="حذف التصنيف"
                                onClick={() => setDeleting(cat)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '6px 10px', borderRadius: '8px',
                                  border: '1px solid var(--clr-error-bdr)',
                                  backgroundColor: 'var(--clr-error-bg)',
                                  color: 'var(--clr-error)',
                                  cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                                  fontFamily: 'var(--font)', transition: 'all 0.15s ease',
                                }}
                              >
                                <Trash2 size={13} />
                                <span>حذف</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
