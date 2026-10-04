/* ==========================================================================
   ADMIN SCAN / PROVISION PAGE
   1. Resolve a card by code (card_code or nfc_uid)
   2. Fill / update business_data via PUT /api/cards/:id
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { cardsApi, categoriesApi } from '../../services';
import { ApiCard, ApiCategory, BusinessData, fmtDate, isSubscriptionExpired } from '../../types';
import { Search, Save, RefreshCw, XCircle, ExternalLink } from 'lucide-react';

const EMPTY: BusinessData = {
  business_name: '', description: '', logo: '',
  phone: '', whatsapp: '', instagram: '',
  facebook: '', tiktok: '', google_maps: '',
  website: '', email: '',
};

// ── Toast ─────────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; type: 'success' | 'error'; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', top: '24px', insetInlineEnd: '24px', zIndex: 1200, maxWidth: '360px', backgroundColor: type === 'success' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${type === 'success' ? '#a7f3d0' : '#fecaca'}`, color: type === 'success' ? '#047857' : '#991b1b', borderRadius: '12px', padding: '14px 18px', fontWeight: 700, fontFamily: 'Cairo, sans-serif', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 10px 28px rgba(15,23,42,0.1)' }}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
export const AdminScanPage: React.FC = () => {
  const [query, setQuery]         = useState('');
  const [searching, setSearching] = useState(false);
  const [card, setCard]           = useState<ApiCard | null>(null);
  const [notFound, setNotFound]   = useState(false);
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const [form, setForm]           = useState<BusinessData>({ ...EMPTY });
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    categoriesApi.getCategories({ limit: 100 }).then((r) => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  const resolve = async (q = query) => {
    const term = q.trim();
    if (!term) return;
    setSearching(true); setNotFound(false); setCard(null);
    try {
      // Try by search (searches card_code, nfc_uid, qr_code)
      const res = await cardsApi.getCards({ search: term, limit: 10 });
      const found = (res.data ?? []).find(
        (c) =>
          c.card_code.toLowerCase() === term.toLowerCase() ||
          (c.nfc_uid && c.nfc_uid.toLowerCase() === term.toLowerCase()) ||
          (c.qr_code && c.qr_code.toLowerCase() === term.toLowerCase()),
      ) ?? res.data?.[0] ?? null;

      if (found) {
        setCard(found);
        setForm({ ...EMPTY, ...(found.business_data ?? {}) });
      } else {
        setNotFound(true);
      }
    } catch (err: any) {
      setToast({ msg: err?.message || 'فشل البحث', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    setSaving(true);
    try {
      // Clean empty strings to undefined
      const clean: BusinessData = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, (v as string)?.trim() || undefined]),
      ) as BusinessData;
      await cardsApi.updateCard(card._id, { business_data: clean });
      setToast({ msg: '✅ تم حفظ بيانات النشاط التجاري بنجاح', type: 'success' });
      // Refresh card
      const updated = await cardsApi.getCardById(card._id);
      setCard(updated);
    } catch (err: any) {
      setToast({ msg: err?.message || 'فشل الحفظ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const catName = () => {
    if (!card?.category_id) return null;
    if (typeof card.category_id !== 'string') return (card.category_id as ApiCategory).name;
    return categories.find((c) => c._id === card.category_id)?.name ?? null;
  };

  const expired = card ? isSubscriptionExpired(card) : false;

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'Cairo, sans-serif' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e2d4a 55%,#312e81 100%)', borderRadius: '20px', padding: '22px 26px', color: '#fff', boxShadow: '0 10px 32px -5px rgba(15,23,42,0.3)' }}>
        <h2 style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>فحص وتجهيز البطاقة</h2>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
          أدخل كود البطاقة أو معرف NFC للبحث وتحديث بيانات النشاط التجاري
        </p>
      </div>

      {/* Search form */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>البحث عن البطاقة</h3>
        <form onSubmit={(e) => { e.preventDefault(); resolve(); }} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="CARD-0001 أو NFC-7FJ2K9"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 38px 10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9375rem', fontFamily: 'Cairo, sans-serif', outline: 'none' }}
            />
          </div>
          <button type="submit" disabled={searching || !query.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: searching ? '#94a3b8' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: searching ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: '0.9375rem' }}>
            {searching ? <><RefreshCw size={16} className="spin" /> بحث...</> : <><Search size={16} /> فحص البطاقة</>}
          </button>
        </form>
      </div>

      {/* Not found */}
      {notFound && (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <XCircle size={44} style={{ color: '#ef4444', marginBottom: '12px' }} />
          <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>لم يتم العثور على بطاقة</p>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>الكود "{query}" غير موجود في قاعدة البيانات</p>
        </div>
      )}

      {/* Card found */}
      {card && (
        <>
          {/* Card meta */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>{card.card_code}</h3>
                  <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '99px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 700 }}>{card.card_type}</span>
                  <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, backgroundColor: card.status === 'active' ? '#d1fae5' : '#fee2e2', color: card.status === 'active' ? '#047857' : '#dc2626' }}>
                    {card.status === 'active' ? '🟢 نشطة' : '🔴 معطلة'}
                  </span>
                  {expired && <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '99px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#d97706' }}>⚠️ منتهية</span>}
                </div>
                {card.nfc_uid && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>NFC: {card.nfc_uid}</div>}
              </div>
              <a href={card.current_redirect_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
                <ExternalLink size={14} /> معاينة
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
              <div><div style={metaLbl}>التصنيف</div><div style={metaVal}>{catName() || '—'}</div></div>
              <div><div style={metaLbl}>بداية الاشتراك</div><div style={metaVal}>{fmtDate(card.subscription_start_date)}</div></div>
              <div><div style={metaLbl}>نهاية الاشتراك</div><div style={{ ...metaVal, color: expired ? '#dc2626' : undefined }}>{fmtDate(card.subscription_end_date)}</div></div>
              <div><div style={metaLbl}>رابط التوجيه</div><div style={{ ...metaVal, fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{card.current_redirect_url}</div></div>
            </div>
          </div>

          {/* Business data form */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>بيانات النشاط التجاري</h3>
            <p style={{ margin: '0 0 18px', fontSize: '0.8125rem', color: '#64748b' }}>هذه البيانات تظهر للعميل عند مسح الكارت</p>

            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '12px' }}>
                <Field label="اسم النشاط التجاري" field="business_name" form={form} onChange={setForm} placeholder="مثال: Coffee House" />
                <Field label="رقم الهاتف"          field="phone"          form={form} onChange={setForm} placeholder="+20100000000" />
                <Field label="واتساب (رابط)"       field="whatsapp"       form={form} onChange={setForm} placeholder="https://wa.me/20100000000" />
                <Field label="إنستجرام (رابط)"     field="instagram"      form={form} onChange={setForm} placeholder="https://instagram.com/..." />
                <Field label="فيسبوك (رابط)"       field="facebook"       form={form} onChange={setForm} placeholder="https://facebook.com/..." />
                <Field label="تيك توك (رابط)"      field="tiktok"         form={form} onChange={setForm} placeholder="https://tiktok.com/@..." />
                <Field label="خرائط جوجل (رابط)"  field="google_maps"    form={form} onChange={setForm} placeholder="https://maps.google.com/..." />
                <Field label="الموقع الإلكتروني"   field="website"        form={form} onChange={setForm} placeholder="https://yoursite.com" />
                <Field label="البريد الإلكتروني"   field="email"          form={form} onChange={setForm} placeholder="hello@example.com" />
                <Field label="رابط الشعار (URL)"   field="logo"           form={form} onChange={setForm} placeholder="https://cdn.example.com/logo.png" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>الوصف</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="وصف مختصر للنشاط التجاري"
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'Cairo, sans-serif', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setForm({ ...EMPTY, ...(card.business_data ?? {}) })} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>
                  <RefreshCw size={15} /> إعادة تعيين
                </button>
                <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: '0.9375rem' }}>
                  {saving ? <><RefreshCw size={16} className="spin" /> حفظ...</> : <><Save size={16} /> حفظ البيانات</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

// ── Field component ────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string; field: keyof BusinessData;
  form: BusinessData; onChange: React.Dispatch<React.SetStateAction<BusinessData>>;
  placeholder?: string;
}> = ({ label, field, form, onChange, placeholder }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>{label}</label>
    <input
      value={(form[field] ?? '') as string}
      onChange={(e) => onChange((p) => ({ ...p, [field]: e.target.value }))}
      placeholder={placeholder}
      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif', outline: 'none', backgroundColor: '#f8fafc' }}
    />
  </div>
);

const metaLbl: React.CSSProperties = { fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const metaVal: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' };

export default AdminScanPage;
