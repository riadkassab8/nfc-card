import React, { useState, useEffect, useRef } from 'react';
import { cardsApi, categoriesApi } from '../../services';
import { ApiCard, ApiCategory, BusinessData, fmtDate, isSubscriptionExpired, parseCategoryMeta } from '../../types';
import { Search, Save, RefreshCw, XCircle, ExternalLink, QrCode, X, Camera } from 'lucide-react';
import jsQR from 'jsqr';

const EMPTY: BusinessData = {
  business_name: '', description: '', logo: '',
  phone: '', whatsapp: '', instagram: '',
  facebook: '', tiktok: '', google_maps: '',
  website: '', email: '', instapay: '', vodafone_cash: '',
};

interface FieldDef {
  key: keyof BusinessData;
  label: string;
  placeholder: string;
}

const BIZ_FIELDS: FieldDef[] = [
  { key: 'business_name', label: 'اسم النشاط التجاري', placeholder: 'مثال: Coffee House' },
  { key: 'phone', label: 'رقم الهاتف', placeholder: '+20100000000' },
  { key: 'whatsapp', label: 'واتساب (رابط)', placeholder: 'https://wa.me/201...' },
  { key: 'instagram', label: 'إنستجرام (رابط)', placeholder: 'https://instagram.com/...' },
  { key: 'facebook', label: 'فيسبوك (رابط)', placeholder: 'https://facebook.com/...' },
  { key: 'tiktok', label: 'تيك توك (رابط)', placeholder: 'https://tiktok.com/@...' },
  { key: 'google_maps', label: 'خرائط جوجل (رابط)', placeholder: 'https://maps.google.com/...' },
  { key: 'website', label: 'الموقع الإلكتروني', placeholder: 'https://yoursite.com' },
  { key: 'email', label: 'البريد الإلكتروني', placeholder: 'hello@example.com' },
  { key: 'instapay', label: 'انستاباي', placeholder: 'username@instapay' },
  { key: 'vodafone_cash', label: 'فودافون كاش', placeholder: '01000000000' },
  { key: 'logo', label: 'رابط الشعار (URL)', placeholder: 'https://cdn.example.com/logo.png' },
  { key: 'description', label: 'الوصف', placeholder: 'وصف مختصر للنشاط' }
];

const getVisibleFields = (category: ApiCategory | null): FieldDef[] => {
  if (!category) return BIZ_FIELDS;
  const meta = parseCategoryMeta(category.description);
  if (meta.isLegacy) {
    const type = (category.name || '').toLowerCase();
    if (type.includes('tiktok')) return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'tiktok'].includes(f.key));
    if (type.includes('instagram')) return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'instagram'].includes(f.key));
    if (type.includes('whatsapp')) return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'phone', 'whatsapp'].includes(f.key));
    if (type.includes('google map') || type.includes('google review')) {
      return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'google_maps'].includes(f.key));
    }
    if (type.includes('instapay')) return BIZ_FIELDS.filter(f => ['business_name', 'logo', 'instapay'].includes(f.key));
    return BIZ_FIELDS;
  }
  return BIZ_FIELDS.filter(f => 
    ['business_name', 'logo', 'description'].includes(f.key) || meta.fields.includes(f.key)
  );
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
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState<ApiCard[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    categoriesApi.getCategories({ limit: 100 }).then(r => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  // Autocomplete: search while typing
  useEffect(() => {
    // Don't search if user is selecting from suggestions
    if (isSelecting) {
      return;
    }

    const term = query.trim();
    
    if (!term || term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await cardsApi.getCards({ search: term, limit: 10 });
        const data = res.data ?? [];
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (e) {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, isSelecting]);

  const resolve = async (q = query) => {
    let term = q.trim();
    if (!term) return;

    // Hide suggestions when searching
    setShowSuggestions(false);

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

      let targetCard = found;
      if (!targetCard && data.length > 1) {
        targetCard = data[0];
      }

      if (targetCard) {
        // نجلب الكارت الكامل من الـ API لضمان وجود business_data التي قد لا تكون في الـ list
        const fullCard = await cardsApi.getCardById(targetCard._id);
        setCard(fullCard);
        setForm({ ...EMPTY, ...(fullCard.business_data ?? {}) });
      } else {
        setNotFound(true);
      }
    } catch (e: any) {
      setToast({ msg: e?.message || 'فشل البحث', type: 'error' });
    } finally { setSearching(false); }
  };

  const selectSuggestion = (selectedCard: ApiCard) => {
    setIsSelecting(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setQuery(selectedCard.card_code);
    
    setTimeout(() => {
      resolve(selectedCard.card_code);
      setIsSelecting(false);
    }, 100);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="search-container" style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none', zIndex: 1 }} />
            <input
              className="form-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="CARD-0001 أو NFC-7FJ2K9"
              style={{ paddingRight: '36px' }}
            />
            
            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-white)',
                border: '1px solid var(--bdr-light)',
                borderRadius: 'var(--r-md)',
                boxShadow: 'var(--shadow-lg)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 100,
              }}>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(suggestion);
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--bdr-light)',
                      transition: 'background-color 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 'var(--fs-sm)', color: 'var(--txt-heading)' }}>
                        {suggestion.card_code}
                      </span>
                      <span className={`badge ${suggestion.status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {suggestion.status === 'active' ? 'نشطة' : 'معطلة'}
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {suggestion.card_type}
                      </span>
                    </div>
                    {suggestion.business_data?.business_name && (
                      <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-secondary)' }}>
                        {suggestion.business_data.business_name}
                      </span>
                    )}
                    {suggestion.nfc_uid && (
                      <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)', fontFamily: 'monospace' }}>
                        {suggestion.nfc_uid}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {loadingSuggestions && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-white)',
                border: '1px solid var(--bdr-light)',
                borderRadius: 'var(--r-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px',
                textAlign: 'center',
                color: 'var(--txt-muted)',
                fontSize: 'var(--fs-sm)',
                zIndex: 100,
              }}>
                <RefreshCw size={14} className="spin" style={{ display: 'inline-block', marginLeft: '6px' }} />
                جاري البحث...
              </div>
            )}
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
                {(() => {
                  const currentCatObj = card?.category_id 
                    ? categories.find(c => c._id === (typeof card.category_id === 'string' ? card.category_id : (card.category_id as ApiCategory)._id)) 
                    : null;
                  const visibleFields = getVisibleFields(currentCatObj || null);
                  return visibleFields.map(f => {
                    if (f.key === 'description') {
                      return (
                        <div key={f.key} className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">{f.label}</label>
                          <textarea
                            className="form-input"
                            value={form.description ?? ''}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder={f.placeholder}
                            rows={3}
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                      );
                    }
                    return (
                      <Field key={f.key} label={f.label} field={f.key} form={form} onChange={setForm} placeholder={f.placeholder} />
                    );
                  });
                })()}
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
