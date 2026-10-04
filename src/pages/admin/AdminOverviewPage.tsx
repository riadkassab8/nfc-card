import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cardsApi, categoriesApi } from '../../services';
import { ApiCard, ApiCategory, fmtDate, isSubscriptionExpired } from '../../types';
import { CardDetailsDrawer } from '../../components/admin/CardDetailsDrawer';
import {
  CreditCard, Tags, CheckCircle2, XCircle,
  RefreshCw, ArrowLeft, Plus, TrendingUp,
} from 'lucide-react';

/* ── بطاقة إحصائية ─────────────────────────────────────────────── */
const StatCard: React.FC<{
  label: string; value: number; icon: React.ReactNode;
  accent: string; loading?: boolean; onClick?: () => void;
}> = ({ label, value, icon, accent, loading, onClick }) => (
  <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', ...(onClick ? { ':hover': { opacity: 0.9 } } as any : {}) }}>
    <div className="stat-card-icon" style={{ backgroundColor: accent + '18', color: accent }}>
      {icon}
    </div>
    <div>
      <div className="stat-card-label">{label}</div>
      {loading
        ? <div className="shimmer" style={{ width: '56px', height: '28px', marginTop: '4px' }} />
        : <div className="stat-card-value">{value.toLocaleString('ar-EG')}</div>}
    </div>
  </div>
);

/* ── وسم نوع البطاقة ────────────────────────────────────────────── */
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, string> = {
    'Google Review': 'var(--clr-primary-500)',
    'Instagram':     '#e1306c',
    'TikTok':        '#333',
    'InstaPay':      '#7c3aed',
    'Google Maps':   '#ea4335',
    'WhatsApp':      '#16a34a',
    'Social Page':   'var(--clr-primary-600)',
  };
  const color = map[type] || 'var(--txt-secondary)';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px',
      borderRadius: 'var(--r-full)', fontSize: 'var(--fs-xs)', fontWeight: 700,
      backgroundColor: color + '14', color,
      border: `1px solid ${color}28`,
    }}>
      {type}
    </span>
  );
};

type ToastType = 'success' | 'error' | 'info';
const Toast: React.FC<{ msg: string; type: ToastType; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const cls = type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info';
  return (
    <div className={`toast ${cls}`}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem', padding: '0 2px' }}>✕</button>
    </div>
  );
};

/* ── المكوّن الرئيسي ───────────────────────────────────────────── */
export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [drawerCard, setDrawerCard] = useState<ApiCard | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const showToast = (msg: string, type: ToastType = 'success') => setToast({ msg, type });

  const [cards, setCards]             = useState<ApiCard[]>([]);
  const [categories, setCategories]   = useState<ApiCategory[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const [total, setTotal]     = useState(0);
  const [active, setActive]   = useState(0);
  const [inactive, setInactive] = useState(0);
  const [expired, setExpired] = useState(0);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [cr, catR] = await Promise.all([
        cardsApi.getCards({ limit: 100 }),
        categoriesApi.getCategories({ limit: 100 }),
      ]);
      const all = cr.data ?? [];
      setCards(all);
      setCategories(catR.data ?? []);
      setTotal(cr.total ?? all.length);
      setActive(all.filter(c => c.status === 'active').length);
      setInactive(all.filter(c => c.status === 'inactive').length);
      setExpired(all.filter(isSubscriptionExpired).length);
    } catch (e: any) {
      setError(e?.message || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const recent = [...cards].reverse().slice(0, 8);

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'var(--font)' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <CardDetailsDrawer
        card={drawerCard} categories={categories}
        onClose={() => setDrawerCard(null)}
        onUpdated={() => { load(); setDrawerCard(null); }}
        onDeleted={(id) => { if (drawerCard?._id === id) setDrawerCard(null); load(); }}
        onToast={showToast}
      />

      {/* ── Hero ── */}
      <div className="page-hero">
        <div style={{ zIndex: 1 }}>
          <span className="page-hero-label">لوحة الإدارة</span>
          <h2>نظرة عامة على النظام</h2>
          <p>إحصائيات مباشرة من قاعدة البيانات</p>
        </div>
        <div style={{ zIndex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/cards">
            <button className="page-hero-btn page-hero-btn-solid">
              <CreditCard size={15} /> إدارة البطاقات
            </button>
          </Link>
        </div>
      </div>

      {/* ── خطأ ── */}
      {error && (
        <div style={{
          backgroundColor: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)',
          borderRadius: 'var(--r-lg)', padding: '14px 18px',
          color: 'var(--clr-error)', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <XCircle size={18} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button onClick={load} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--clr-error)', fontWeight: 700, fontFamily: 'var(--font)',
            display: 'flex', alignItems: 'center', gap: '5px', fontSize: 'var(--fs-sm)',
          }}>
            <RefreshCw size={14} /> إعادة
          </button>
        </div>
      )}

      {/* ── بطاقات الإحصاء ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '14px',
      }}>
        <StatCard label="إجمالي البطاقات"     value={total}    icon={<CreditCard size={20} />}     accent="var(--clr-primary-500)" loading={loading} onClick={() => navigate('/admin/cards')} />
        <StatCard label="بطاقات نشطة"          value={active}   icon={<CheckCircle2 size={20} />}   accent="#16a34a"                 loading={loading} onClick={() => navigate('/admin/cards?status=active')} />
        <StatCard label="بطاقات معطلة"         value={inactive} icon={<XCircle size={20} />}        accent="var(--clr-error)"        loading={loading} onClick={() => navigate('/admin/cards?status=inactive')} />
        <StatCard label="التصنيفات"             value={categories.length} icon={<Tags size={20} />}  accent="#d97706"                 loading={loading} onClick={() => navigate('/admin/categories')} />
        <StatCard label="منتهية الاشتراك"      value={expired}  icon={<TrendingUp size={20} />}    accent="#dc2626"                  loading={loading} onClick={() => navigate('/admin/cards?status=expired')} />
      </div>

      {/* ── محتوى مزدوج ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px',
      }}>

        {/* آخر البطاقات */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '15px 20px', borderBottom: '1px solid var(--bdr-light)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>
              آخر البطاقات
            </h3>
            <Link to="/admin/cards" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--clr-primary-600)',
            }}>
              عرض الكل <ArrowLeft size={13} />
            </Link>
          </div>

          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ padding: '13px 20px', borderBottom: '1px solid var(--bg-subtle)' }}>
                  <div className="shimmer" style={{ height: '14px', width: '55%', marginBottom: '6px' }} />
                  <div className="shimmer" style={{ height: '11px', width: '35%' }} />
                </div>
              ))
            : recent.length === 0
              ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: 'var(--fs-sm)' }}>
                  لا توجد بطاقات بعد
                </div>
              )
              : recent.map((card) => (
                <div key={card._id} onClick={() => setDrawerCard(card)} style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--bg-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 'var(--fs-sm)', fontWeight: 700,
                      color: 'var(--txt-heading)', fontFamily: 'monospace',
                      marginBottom: '2px',
                    }}>
                      {card.card_code}
                      {card.business_data?.business_name && (
                        <span style={{ marginRight: '8px', fontFamily: 'var(--font)', fontWeight: 500, color: 'var(--txt-secondary)', fontSize: 'var(--fs-xs)' }}>
                          {card.business_data.business_name}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>
                      {fmtDate(card.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    <TypeBadge type={card.card_type} />
                    <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {card.status === 'active' ? 'نشطة' : 'معطلة'}
                    </span>
                  </div>
                </div>
              ))}
        </div>

        {/* التصنيفات */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '15px 20px', borderBottom: '1px solid var(--bdr-light)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>
              التصنيفات
            </h3>
            <Link to="/admin/categories" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--clr-primary-600)',
            }}>
              إدارة <ArrowLeft size={13} />
            </Link>
          </div>

          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '13px 20px', borderBottom: '1px solid var(--bg-subtle)' }}>
                  <div className="shimmer" style={{ height: '14px', width: '45%' }} />
                </div>
              ))
            : categories.length === 0
              ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: 'var(--fs-sm)' }}>
                  <Tags size={36} style={{ marginBottom: '10px', color: 'var(--bdr-medium)' }} />
                  <p style={{ marginBottom: '14px' }}>لا توجد تصنيفات</p>
                  <Link to="/admin/categories">
                    <button className="btn-primary" style={{ fontSize: 'var(--fs-sm)', padding: '8px 16px' }}>
                      <Plus size={14} /> إضافة تصنيف
                    </button>
                  </Link>
                </div>
              )
              : categories.map((cat) => (
                <div key={cat._id} style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--bg-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {cat.icon
                      ? <img src={cat.icon} alt="" style={{ width: '28px', height: '28px', borderRadius: 'var(--r-sm)', objectFit: 'cover', border: '1px solid var(--bdr-light)' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                      : <div style={{ width: '28px', height: '28px', borderRadius: 'var(--r-sm)', backgroundColor: 'var(--clr-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Tags size={14} style={{ color: 'var(--clr-primary-400)' }} />
                        </div>}
                    <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--txt-body)' }}>{cat.name}</span>
                  </div>
                  <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-error'}`}>
                    {cat.is_active ? 'مفعّل' : 'معطّل'}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
