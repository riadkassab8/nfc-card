import React, { useState, useEffect, useRef } from 'react';
import { cardsApi, categoriesApi } from '../../services';
import { ApiCard, ApiCategory, BusinessData, fmtDate, isSubscriptionExpired } from '../../types';
import { Search, Save, RefreshCw, XCircle, ExternalLink, QrCode, X, Camera } from 'lucide-react';
import jsQR from 'jsqr';

const EMPTY: BusinessData = {
  business_name: '', description: '', logo: '',
  phone: '', whatsapp: '', instagram: '',
  facebook: '', tiktok: '', google_maps: '',
  website: '', email: '', instapay: '', vodafone_cash: '',
};

/* ── Toast ─────────────────────────────────────────────────────── */
const Toast: React.FC<{ msg: string; type: 'success' | 'error'; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
    </div>
  );
};

/* ── Field ─────────────────────────────────────────────────────── */
const Field: React.FC<{
  label: string; field: keyof BusinessData;
  form: BusinessData; onChange: React.Dispatch<React.SetStateAction<BusinessData>>;
  placeholder?: string;
}> = ({ label, field, form, onChange, placeholder }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input
      className="form-input"
      value={(form[field] ?? '') as string}
      onChange={e => onChange(p => ({ ...p, [field]: e.target.value }))}
      placeholder={placeholder}
    />
  </div>
);

/* ── QR Scanner ───────────────────────────────────────────────── */
const QRScannerModal: React.FC<{ onScan: (data: string) => void; onClose: () => void }> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let requestAnimFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
          requestAnimFrameId = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("لا يمكن الوصول للكاميرا. يرجى التأكد من الصلاحيات.");
      }
    };

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
          if (code && code.data) {
            onScan(code.data);
            return;
          }
        }
      }
      requestAnimFrameId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestAnimFrameId) {
        cancelAnimationFrame(requestAnimFrameId);
      }
    };
  }, [onScan]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-white)', padding: '20px', borderRadius: '16px',
        width: '90%', maxWidth: '400px', position: 'relative',
        display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--txt-heading)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} /> فحص رمز QR
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--txt-muted)' }}>
            <X size={20} />
          </button>
        </div>
        
        {error ? (
          <div style={{ color: 'var(--clr-error)', textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#000' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{
              position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px',
              backgroundColor: 'var(--clr-primary-500)', boxShadow: '0 0 10px var(--clr-primary-500)',
              transform: 'translateY(-50%)',
              animation: 'scanline 2s linear infinite'
            }} />
          </div>
        )}
      </div>
      <style>{`
        @keyframes scanline {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────────────── */
export const AdminScanPage: React.FC = () => {
  const [query, setQuery]       = useState('');
  const [searching, setSearching] = useState(false);
  const [card, setCard]         = useState<ApiCard | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [form, setForm]         = useState<BusinessData>({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    categoriesApi.getCategories({ limit: 100 }).then(r => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  const resolve = async (q = query) => {
    let term = q.trim();
    if (!term) return;

    // استخراج الكود في حال كان الرابط كاملاً
    const match = term.match(/(CARD-\d+|NFC-[A-Z0-9]+)/i);
    if (match) {
      term = match[1].toUpperCase();
      setQuery(term);
    }

    setSearching(true); setNotFound(false); setCard(null);
    try {
      const res = await cardsApi.getCards({ search: term, limit: 50 });
      const data = res.data ?? [];
      console.log('[ScanPage] search:', term, '→ results:', data.length, data.map(c => c.card_code));

      // أولاً: نحاول exact match
      const exact = data.find(c =>
        c.card_code.toLowerCase() === term.toLowerCase() ||
        (c.nfc_uid && c.nfc_uid.toLowerCase() === term.toLowerCase())
      );

      // لو ما فيش exact match خذ أول نتيجة (الـ API search كان كافياً)
      const found = exact ?? (data.length === 1 ? data[0] : null);

      if (found) {
        setCard(found);
        setForm({ ...EMPTY, ...(found.business_data ?? {}) });
      } else if (data.length > 1) {
        // رجّع أكتر من نتيجة بدون exact match — خذ الأقرب
        setCard(data[0]);
        setForm({ ...EMPTY, ...(data[0].business_data ?? {}) });
      } else {
        setNotFound(true);
      }
    } catch (e: any) {
      setToast({ msg: e?.message || 'فشل البحث', type: 'error' });
    } finally { setSearching(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    setSaving(true);
    try {
      const clean: BusinessData = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, (v as string)?.trim() || undefined])
      ) as BusinessData;
      await cardsApi.updateCard(card._id, { business_data: clean });
      setToast({ msg: 'تم حفظ البيانات بنجاح', type: 'success' });
      const updated = await cardsApi.getCardById(card._id);
      setCard(updated);
    } catch (e: any) {
      setToast({ msg: e?.message || 'فشل الحفظ', type: 'error' });
    } finally { setSaving(false); }
  };

  const catName = () => {
    if (!card?.category_id) return null;
    if (typeof card.category_id !== 'string') return (card.category_id as ApiCategory).name;
    return categories.find(c => c._id === card.category_id)?.name ?? null;
  };

  const expired = card ? isSubscriptionExpired(card) : false;

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font)' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {showScanner && (
        <QRScannerModal 
          onClose={() => setShowScanner(false)} 
          onScan={(data) => {
            setShowScanner(false);
            setQuery(data);
            resolve(data);
          }} 
        />
      )}

      {/* Hero */}
      <div className="page-hero">
        <div style={{ zIndex: 1 }}>
          <span className="page-hero-label">الأدوات</span>
          <h2>فحص وتجهيز البطاقة</h2>
          <p>ابحث بكود البطاقة أو معرف NFC لتحديث البيانات</p>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>
          البحث عن بطاقة
        </h3>
        <form onSubmit={e => { e.preventDefault(); resolve(); }} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
            <input
              className="form-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="CARD-0001 أو NFC-7FJ2K9"
              style={{ paddingRight: '36px' }}
            />
          </div>
          <button
            type="button"
            className="btn-outline"
            onClick={() => setShowScanner(true)}
            style={{ padding: '0 14px' }}
            title="فحص بالكاميرا"
          >
            <QrCode size={18} />
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={searching || !query.trim()}
            style={{ minWidth: '130px', justifyContent: 'center' }}
          >
            {searching
              ? <><RefreshCw size={15} className="spin" /> بحث...</>
              : <><Search size={15} /> فحص البطاقة</>}
          </button>
        </form>
      </div>

      {/* Not found */}
      {notFound && (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
          <XCircle size={40} style={{ color: 'var(--clr-error)', marginBottom: '12px' }} />
          <p style={{ fontWeight: 700, color: 'var(--txt-heading)', marginBottom: '6px' }}>لم يُعثر على البطاقة</p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>الكود "{query}" غير موجود</p>
        </div>
      )}

      {/* Card found */}
      {card && (
        <>
          {/* Meta */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontFamily: 'monospace', fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--txt-heading)' }}>{card.card_code}</h3>
                  <span className="badge badge-blue">{card.card_type}</span>
                  <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                    {card.status === 'active' ? 'نشطة' : 'معطلة'}
                  </span>
                  {expired && <span className="badge badge-warning">⚠ منتهية الاشتراك</span>}
                </div>
                {card.nfc_uid && (
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-muted)', fontFamily: 'monospace', marginTop: '4px' }}>
                    {card.nfc_uid}
                  </div>
                )}
              </div>
              <a
                href={card.current_redirect_url}
                target="_blank" rel="noopener noreferrer"
                className="btn-outline"
                style={{ textDecoration: 'none', fontSize: 'var(--fs-sm)', padding: '7px 14px' }}
              >
                <ExternalLink size={13} /> معاينة
              </a>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px', backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--r-lg)', padding: '14px 16px',
              border: '1px solid var(--bdr-light)',
            }}>
              {[
                { label: 'التصنيف',      val: catName() || '—' },
                { label: 'بداية الاشتراك', val: fmtDate(card.subscription_start_date) },
                { label: 'نهاية الاشتراك', val: fmtDate(card.subscription_end_date) },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)', fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--txt-body)' }}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Business data form */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>
              بيانات النشاط التجاري
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)' }}>
              هذه البيانات تظهر للعميل عند مسح الكارت
            </p>

            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <Field label="اسم النشاط التجاري"   field="business_name" form={form} onChange={setForm} placeholder="مثال: Coffee House" />
                <Field label="رقم الهاتف"            field="phone"          form={form} onChange={setForm} placeholder="+20100000000" />
                <Field label="واتساب (رابط)"         field="whatsapp"       form={form} onChange={setForm} placeholder="https://wa.me/201..." />
                <Field label="إنستجرام (رابط)"       field="instagram"      form={form} onChange={setForm} placeholder="https://instagram.com/..." />
                <Field label="فيسبوك (رابط)"         field="facebook"       form={form} onChange={setForm} placeholder="https://facebook.com/..." />
                <Field label="تيك توك (رابط)"        field="tiktok"         form={form} onChange={setForm} placeholder="https://tiktok.com/@..." />
                <Field label="خرائط جوجل (رابط)"    field="google_maps"    form={form} onChange={setForm} placeholder="https://maps.google.com/..." />
                <Field label="الموقع الإلكتروني"     field="website"        form={form} onChange={setForm} placeholder="https://yoursite.com" />
                <Field label="البريد الإلكتروني"     field="email"          form={form} onChange={setForm} placeholder="hello@example.com" />
                <Field label="انستاباي"              field="instapay"       form={form} onChange={setForm} placeholder="username@instapay" />
                <Field label="فودافون كاش"          field="vodafone_cash"  form={form} onChange={setForm} placeholder="01000000000" />
                <Field label="رابط الشعار (URL)"     field="logo"           form={form} onChange={setForm} placeholder="https://cdn.example.com/logo.png" />
              </div>

              <div className="form-group">
                <label className="form-label">الوصف</label>
                <textarea
                  className="form-input"
                  value={form.description ?? ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="وصف مختصر للنشاط"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px', borderTop: '1px solid var(--bdr-light)' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setForm({ ...EMPTY, ...(card.business_data ?? {}) })}
                >
                  <RefreshCw size={14} /> إعادة تعيين
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{ minWidth: '150px', justifyContent: 'center' }}
                >
                  {saving
                    ? <><RefreshCw size={15} className="spin" /> حفظ...</>
                    : <><Save size={15} /> حفظ البيانات</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminScanPage;
