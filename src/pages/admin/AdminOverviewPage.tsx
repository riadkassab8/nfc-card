import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cardsApi, categoriesApi } from '../../services';
import {
  ApiCard, ApiCategory, ApiGlobalAnalytics, ScanByDay,
  fmtDate, isSubscriptionExpired,
} from '../../types';
import { CardDetailsDrawer } from '../../components/admin/CardDetailsDrawer';
import {
  CreditCard, Tags, CheckCircle2, XCircle,
  RefreshCw, ArrowLeft, TrendingUp, BarChart2,
  Activity,
} from 'lucide-react';

/* ── Stat card ──────────────────────────────────────────────────── */
const StatCard: React.FC<{
  label: string; value: number; icon: React.ReactNode;
  accent: string; loading?: boolean; onClick?: () => void;
}> = ({ label, value, icon, accent, loading, onClick }) => (
  <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s' }}>
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

/* ── Card type badge ─────────────────────────────────────────────── */
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

/* ── Mini sparkline bar chart ────────────────────────────────────── */
const Sparkline: React.FC<{ data: ScanByDay[]; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <div className="shimmer" style={{ height: '56px', borderRadius: 'var(--r-md)' }} />;
  if (!data.length) return <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-muted)', fontSize: 'var(--fs-xs)' }}>لا توجد بيانات</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  const recent = data.slice(-14);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '56px' }}>
      {recent.map(d => (
        <div key={d.date} title={`${d.date}: ${d.count}`} style={{
          flex: 1, minWidth: '6px',
          height: `${Math.max(3, (d.count / max) * 56)}px`,
          backgroundColor: 'var(--clr-primary-400)',
          borderRadius: '3px 3px 0 0',
          opacity: 0.85,
          transition: 'height 0.3s ease',
          cursor: 'default',
        }} />
      ))}
    </div>
  );
};

/* ── Horizontal bar list ─────────────────────────────────────────── */
const BarList: React.FC<{ items: { label: string; count: number; color?: string }[]; loading: boolean }> = ({ items, loading }) => {
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[60, 40, 25].map(w => <div key={w} className="shimmer" style={{ height: '20px', width: `${w}%`, borderRadius: '4px' }} />)}
    </div>
  );
  const max = Math.max(...items.map(i => i.count), 1);
  const colors = ['var(--clr-primary-500)', '#16a34a', '#d97706', '#7c3aed', '#ef4444'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, idx) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ minWidth: '68px', fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--txt-body)', textAlign: 'right' }}>{item.label}</span>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', height: '18px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              width: `${(item.count / max) * 100}%`,
              backgroundColor: item.color || colors[idx % colors.length],
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ minWidth: '32px', fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--txt-heading)', textAlign: 'left' }}>
            {item.count.toLocaleString('ar-EG')}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [drawerCard, setDrawerCard] = useState<ApiCard | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const showToast = (msg: string, type: ToastType = 'success') => setToast({ msg, type });

  /* cards & categories */
  const [cards, setCards]           = useState<ApiCard[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [total, setTotal]       = useState(0);
  const [active, setActive]     = useState(0);
  const [inactive, setInactive] = useState(0);
  const [expired, setExpired]   = useState(0);

  useEffect(() => {
    //
  }, []);

  /* analytics */
  const [analytics, setAnalytics]     = useState<ApiGlobalAnalytics | null>(null);
  const [analyticsLoading, setAL]     = useState(true);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [all, catR] = await Promise.all([
        cardsApi.getAllCardsForStats(),
        categoriesApi.getCategories({ limit: 100 }),
      ]);
      setCards(all);
      setCategories(catR.data ?? []);
      setTotal(all.length);
      setActive(all.filter(c => c.status === 'active').length);
      setInactive(all.filter(c => c.status === 'inactive').length);
      setExpired(all.filter(c => c.requires_subscription && isSubscriptionExpired(c)).length);
    } catch (e: any) {
      setError(e?.message || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAL(true);
    try { setAnalytics(await cardsApi.getGlobalAnalytics(30)); }
    catch { /* silent — analytics is non-critical */ }
    finally { setAL(false); }
  };

  useEffect(() => { load(); loadAnalytics(); }, []);

  const recent = [...cards].reverse().slice(0, 8);

  /* derive device/browser data for charts */
  const deviceItems = (analytics?.scans_by_device ?? []).map(d => ({ label: d.device_type, count: d.count }));
  const browserItems = (analytics?.scans_by_browser ?? []).map(b => ({ label: b.browser, count: b.count }));

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

      {/* Hero */}
      <div className="page-hero">
        <div style={{ zIndex: 1 }}>
          <span className="page-hero-label">لوحة الإدارة</span>
          <h2>نظرة عامة على النظام</h2>
          <p>إحصائيات مباشرة من قاعدة البيانات</p>
        </div>
        <div style={{ zIndex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/analytics">
            <button className="page-hero-btn">
              <BarChart2 size={15} /> الإحصائيات
            </button>
          </Link>
          <Link to="/admin/cards">
            <button className="page-hero-btn page-hero-btn-solid">
              <CreditCard size={15} /> إدارة البطاقات
            </button>
          </Link>
        </div>
      </div>

      {/* Error */}
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

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '14px' }}>
        <StatCard label="إجمالي البطاقات"  value={total}    icon={<CreditCard size={20} />}     accent="var(--clr-primary-500)" loading={loading} onClick={() => navigate('/admin/cards')} />
        <StatCard label="بطاقات نشطة"       value={active}   icon={<CheckCircle2 size={20} />}   accent="#16a34a"                 loading={loading} onClick={() => navigate('/admin/cards?status=active')} />
        <StatCard label="بطاقات معطلة"      value={inactive} icon={<XCircle size={20} />}        accent="var(--clr-error)"        loading={loading} onClick={() => navigate('/admin/cards?status=inactive')} />
        <StatCard label="التصنيفات"          value={categories.length} icon={<Tags size={20} />}  accent="#d97706"                 loading={loading} onClick={() => navigate('/admin/categories')} />
        <StatCard label="منتهية الاشتراك"   value={expired}  icon={<TrendingUp size={20} />}    accent="#dc2626"                 loading={loading} onClick={() => navigate('/admin/cards?status=expired')} />
        <StatCard label="مسح آخر 30 يوم"    value={analytics?.scans_last_N_days ?? 0} icon={<Activity size={20} />} accent="#7c3aed" loading={analyticsLoading} onClick={() => navigate('/admin/analytics')} />
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

        {/* Scans trend */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>
              المسح — آخر 30 يوم
            </h3>
            <Link to="/admin/analytics" style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--clr-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              التفاصيل <ArrowLeft size={12} />
            </Link>
          </div>
          <Sparkline data={analytics?.scans_by_day ?? []} loading={analyticsLoading} />
          {!analyticsLoading && analytics && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>
                الإجمالي: <strong style={{ color: 'var(--txt-heading)' }}>{(analytics.total_scans ?? 0).toLocaleString('ar-EG')}</strong>
              </span>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>
                هذا الشهر: <strong style={{ color: 'var(--clr-primary-600)' }}>{(analytics.scans_last_N_days ?? 0).toLocaleString('ar-EG')}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>
            الأجهزة
          </h3>
          <BarList items={deviceItems} loading={analyticsLoading} />
        </div>

        {/* Browsers */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>
            المتصفحات
          </h3>
          <BarList items={browserItems} loading={analyticsLoading} />
        </div>
      </div>

      {/* ── Bottom grid: recent cards + categories ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>

        {/* Recent cards */}
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

       
      </div>
    </div>
  );
};

export default AdminOverviewPage;
