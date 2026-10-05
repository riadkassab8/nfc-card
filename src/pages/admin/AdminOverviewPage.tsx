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
  color: string; bg: string; border: string; loading?: boolean; onClick?: () => void;
}> = ({ label, value, icon, color, bg, border, loading, onClick }) => (
  <div
    onClick={onClick}
    style={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      background: '#ffffff',
      borderRadius: '16px',
      padding: '18px 20px',
      border: '1px solid var(--bdr-light)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}
    onMouseEnter={e => {
      if (onClick) {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 20px -4px ${color}25`;
        (e.currentTarget as HTMLElement).style.borderColor = color;
      }
    }}
    onMouseLeave={e => {
      if (onClick) {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr-light)';
      }
    }}
  >
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '14px',
      backgroundColor: bg,
      border: `1px solid ${border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color,
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-muted)', marginBottom: '4px' }}>
        {label}
      </div>
      {loading ? (
        <div className="shimmer" style={{ width: '60px', height: '24px', borderRadius: '4px' }} />
      ) : (
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--txt-heading)', lineHeight: 1 }}>
          {value.toLocaleString('ar-EG')}
        </div>
      )}
    </div>
  </div>
);

/* ── Card type badge ─────────────────────────────────────────────── */
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  return (
    <span style={{
      fontSize: '12px', fontWeight: 700, padding: '3px 10px',
      borderRadius: 'var(--r-full)', backgroundColor: '#f1f5f9',
      color: '#475569', border: '1px solid #e2e8f0', display: 'inline-block'
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
  if (loading) return <div className="shimmer" style={{ height: '70px', borderRadius: 'var(--r-md)' }} />;
  if (!data.length) return <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-muted)', fontSize: 'var(--fs-xs)' }}>لا توجد بيانات</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  const recent = data.slice(-14);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '70px', padding: '6px 0' }}>
      {recent.map(d => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count}`}
          style={{
            flex: 1, minWidth: '8px',
            height: `${Math.max(4, (d.count / max) * 65)}px`,
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.3s ease',
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  );
};

/* ── Horizontal bar list ─────────────────────────────────────────── */
const BarList: React.FC<{ items: { label: string; count: number; color?: string }[]; loading: boolean }> = ({ items, loading }) => {
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[60, 40, 25].map(w => <div key={w} className="shimmer" style={{ height: '22px', width: `${w}%`, borderRadius: '6px' }} />)}
    </div>
  );
  if (!items.length) return <div style={{ color: 'var(--txt-muted)', fontSize: 'var(--fs-xs)', textAlign: 'center', padding: '16px 0' }}>لا توجد بيانات</div>;
  const max = Math.max(...items.map(i => i.count), 1);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((item, idx) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ minWidth: '75px', fontSize: '12px', fontWeight: 700, color: 'var(--txt-body)', textAlign: 'right' }}>{item.label}</span>
          <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '6px', height: '16px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '6px',
              width: `${(item.count / max) * 100}%`,
              backgroundColor: item.color || colors[idx % colors.length],
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ minWidth: '36px', fontSize: '12px', fontWeight: 800, color: 'var(--txt-heading)', textAlign: 'left' }}>
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

  /* analytics */
  const [analytics, setAnalytics]     = useState<ApiGlobalAnalytics | null>(null);
  const [analyticsLoading, setAL]     = useState(true);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [countTotal, countActive, countInactive, all, catR] = await Promise.all([
        cardsApi.getCards({ limit: 1 }),
        cardsApi.getCards({ status: 'active', limit: 1 }),
        cardsApi.getCards({ status: 'inactive', limit: 1 }),
        cardsApi.getAllCardsForStats(),
        categoriesApi.getCategories({ limit: 100 }),
      ]);
      setCards(all);
      setCategories(catR.data ?? []);
      setTotal(countTotal.total ?? all.length);
      setActive(countActive.total ?? all.filter(c => c.status === 'active').length);
      setInactive(countInactive.total ?? all.filter(c => c.status === 'inactive').length);
      setExpired(all.filter(c => (c.requires_subscription ?? true) && isSubscriptionExpired(c)).length);
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

  const recent = [...cards].reverse().slice(0, 7);

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
            <span>لوحة التحكم الرئيسية</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px', color: '#fff' }}>نظرة عامة على المنظومة</h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
            إجمالي البطاقات: <strong style={{ color: '#38bdf8', fontWeight: 800 }}>{total}</strong> • النشطة: <strong style={{ color: '#34d399', fontWeight: 800 }}>{active}</strong> • المعطلة: <strong style={{ color: '#fbbf24', fontWeight: 800 }}>{inactive}</strong>
          </p>
        </div>

        <div style={{ zIndex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="hero-action-btn" onClick={() => navigate('/admin/analytics')}>
            <BarChart2 size={16} /> الإحصائيات
          </button>
          <button className="hero-action-btn" onClick={() => navigate('/admin/cards')}>
            <CreditCard size={16} /> إدارة البطاقات
          </button>
          <button
            onClick={() => navigate('/admin/add-card')}
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
            إضافة بطاقة جديدة
          </button>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <StatCard label="إجمالي البطاقات"  value={total}    icon={<CreditCard size={20} />}     color="#3b82f6" bg="#eff6ff" border="#bfdbfe" loading={loading} onClick={() => navigate('/admin/cards')} />
        <StatCard label="بطاقات نشطة"       value={active}   icon={<CheckCircle2 size={20} />}   color="#10b981" bg="#ecfdf5" border="#a7f3d0" loading={loading} onClick={() => navigate('/admin/cards?status=active')} />
        <StatCard label="بطاقات معطلة"      value={inactive} icon={<XCircle size={20} />}        color="#f59e0b" bg="#fffbeb" border="#fde68a" loading={loading} onClick={() => navigate('/admin/cards?status=inactive')} />
        <StatCard label="التصنيفات"          value={categories.length} icon={<Tags size={20} />}  color="#8b5cf6" bg="#f5f3ff" border="#ddd6fe" loading={loading} onClick={() => navigate('/admin/categories')} />
        <StatCard label="منتهية الاشتراك"   value={expired}  icon={<TrendingUp size={20} />}    color="#ef4444" bg="#fef2f2" border="#fecaca" loading={loading} onClick={() => navigate('/admin/cards?status=expired')} />
        <StatCard label="مسح آخر 30 يوم"    value={analytics?.scans_last_N_days ?? 0} icon={<Activity size={20} />} color="#06b6d4" bg="#ecfeff" border="#a5f3fc" loading={analyticsLoading} onClick={() => navigate('/admin/analytics')} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

        {/* Scans trend */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--bdr-light)',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)' }}>
              المسح — آخر 30 يوم
            </h3>
            <Link to="/admin/analytics" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-primary-600)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              التفاصيل <ArrowLeft size={13} />
            </Link>
          </div>
          <Sparkline data={analytics?.scans_by_day ?? []} loading={analyticsLoading} />
          {!analyticsLoading && analytics && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--bdr-light)', display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
                الإجمالي العام: <strong style={{ color: 'var(--txt-heading)' }}>{(analytics.total_scans ?? 0).toLocaleString('ar-EG')}</strong>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
                هذا الشهر: <strong style={{ color: 'var(--clr-primary-600)' }}>{(analytics.scans_last_N_days ?? 0).toLocaleString('ar-EG')}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Devices */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--bdr-light)',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)' }}>
            الأجهزة المستخدمة
          </h3>
          <BarList items={deviceItems} loading={analyticsLoading} />
        </div>

        {/* Browsers */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--bdr-light)',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)' }}>
            المتصفحات
          </h3>
          <BarList items={browserItems} loading={analyticsLoading} />
        </div>
      </div>

      {/* Recent cards section */}
      <div className="data-table-wrapper">
        <div style={{
          padding: '16px 20px', borderBottom: '1.5px solid var(--bdr-light)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} style={{ color: 'var(--clr-primary-600)' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)' }}>
              أحدث البطاقات المسجلة
            </h3>
          </div>
          <Link to="/admin/cards" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '13px', fontWeight: 700, color: 'var(--clr-primary-600)',
            textDecoration: 'none'
          }}>
            عرض الكل <ArrowLeft size={14} />
          </Link>
        </div>

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: '15px 20px', borderBottom: '1px solid var(--bg-subtle)' }}>
              <div className="shimmer" style={{ height: '14px', width: '50%', marginBottom: '6px' }} />
              <div className="shimmer" style={{ height: '11px', width: '30%' }} />
            </div>
          ))
        ) : recent.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: '14px' }}>
            لا توجد بطاقات بعد
          </div>
        ) : (
          <div style={{ overflowX: 'auto', padding: '10px 4px' }}>
            <table className="premium-table" style={{ minWidth: '750px' }}>
              <thead>
                <tr>
                  <th>كود البطاقة</th>
                  <th>النشاط</th>
                  <th>النوع</th>
                  <th style={{ textAlign: 'center' }}>الحالة</th>
                  <th>تاريخ الإضافة</th>
                  <th style={{ textAlign: 'center' }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((card) => (
                  <tr key={card._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '14px', color: 'var(--txt-heading)' }}>
                          {card.card_code}
                        </span>
                        {card.custom_slug && (
                          <span style={{ fontSize: '11px', color: '#2563eb', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>
                            /{card.custom_slug}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '13.5px', color: 'var(--txt-body)', fontWeight: 600 }}>
                      {card.business_data?.business_name || <span style={{ color: 'var(--txt-muted)' }}>—</span>}
                    </td>
                    <td>
                      <TypeBadge type={card.card_type} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ padding: '3px 10px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
                        {card.status === 'active' ? 'نشطة' : 'معطلة'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--txt-secondary)' }}>
                      {fmtDate(card.createdAt)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setDrawerCard(card)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '5px 12px', borderRadius: '7px',
                          border: '1px solid var(--clr-primary-200)',
                          backgroundColor: 'var(--clr-primary-50)',
                          color: 'var(--clr-primary-700)',
                          cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                          fontFamily: 'var(--font)',
                        }}
                      >
                        عرض
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

export default AdminOverviewPage;
