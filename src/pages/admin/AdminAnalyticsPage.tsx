/* ==========================================================================
   ADMIN ANALYTICS PAGE  /admin/analytics
   Tab 1: Global analytics (GET /api/cards/analytics/global?days=N)
   Tab 2: Per-card analytics (GET /api/cards/:id/analytics?days=N)
   ========================================================================== */

import React, { useEffect, useState, useCallback } from 'react';
import { cardsApi } from '../../services';
import {
  ApiGlobalAnalytics, ApiCardAnalytics, ApiCard,
  ScanByDay, ScanByDevice, ScanByBrowser,
} from '../../types';
import {
  BarChart2, RefreshCw, TrendingUp, Clock, Award,
  Search, CreditCard, Smartphone, Monitor, Tablet,
  Globe, FileDown,
} from 'lucide-react';

const DAYS_OPTIONS = [7, 14, 30, 60, 90];

type TabId = 'global' | 'card';

/* ── Horizontal bar list ──────────────────────────────────────────── */
const BarList: React.FC<{ items: { label: string; count: number }[]; color: string }> = ({ items, color }) => {
  const max = Math.max(...items.map(i => i.count), 1);
  if (!items.length) return <p style={{ color: 'var(--txt-muted)', fontSize: 'var(--fs-sm)', textAlign: 'center', padding: '20px 0' }}>لا توجد بيانات</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ minWidth: '90px', fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--txt-body)', textAlign: 'right', wordBreak: 'break-all' }}>{item.label}</span>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', width: `${(item.count / max) * 100}%`, backgroundColor: color, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ minWidth: '40px', fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--txt-heading)', textAlign: 'left' }}>
            {item.count.toLocaleString('ar-EG')}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Stat tile ─────────────────────────────────────────────────────── */
const Tile: React.FC<{ label: string; value: number | string; icon: React.ReactNode; accent: string; loading?: boolean }> = ({ label, value, icon, accent, loading }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ backgroundColor: accent + '18', color: accent }}>{icon}</div>
    <div>
      <div className="stat-card-label">{label}</div>
      {loading
        ? <div className="shimmer" style={{ width: '60px', height: '26px', marginTop: '4px' }} />
        : <div className="stat-card-value">{typeof value === 'number' ? value.toLocaleString('ar-EG') : value}</div>}
    </div>
  </div>
);

/* ── Day bar chart ────────────────────────────────────────────────── */
const DayChart: React.FC<{ data: ScanByDay[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  const recent = data.slice(-30);
  if (!recent.length) return <p style={{ color: 'var(--txt-muted)', fontSize: 'var(--fs-sm)', textAlign: 'center', padding: '24px 0' }}>لا توجد بيانات</p>;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
      {recent.map(d => (
        <div key={d.date} title={`${d.date}: ${d.count}`} style={{
          flex: 1, minWidth: '6px',
          height: `${Math.max(3, (d.count / max) * 80)}px`,
          backgroundColor: 'var(--clr-primary-400)',
          borderRadius: '3px 3px 0 0',
          transition: 'height 0.3s ease',
          cursor: 'default',
        }} />
      ))}
    </div>
  );
};

/* ── Recent scans table ───────────────────────────────────────────── */
const RecentScansTable: React.FC<{ scans: ApiCardAnalytics['recent_scans'] }> = ({ scans }) => {
  if (!scans.length) return <p style={{ color: 'var(--txt-muted)', fontSize: 'var(--fs-sm)', textAlign: 'center', padding: '20px 0' }}>لا توجد مسحات حديثة</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--bdr-light)' }}>
            {['الوقت', 'الجهاز', 'المتصفح', 'IP'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--txt-muted)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scans.slice(0, 10).map((s, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--bg-subtle)' }}>
              <td style={{ padding: '7px 10px', color: 'var(--txt-body)', whiteSpace: 'nowrap' }}>
                {new Date(s.timestamp).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td style={{ padding: '7px 10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--txt-body)' }}>
                  {s.device_type === 'mobile' ? <Smartphone size={12} /> : s.device_type === 'tablet' ? <Tablet size={12} /> : <Monitor size={12} />}
                  {s.device_type}
                </span>
              </td>
              <td style={{ padding: '7px 10px', color: 'var(--txt-body)' }}>{s.browser}</td>
              <td style={{ padding: '7px 10px', color: 'var(--txt-muted)', fontFamily: 'monospace' }}>{s.ip_address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   TAB 1 — GLOBAL ANALYTICS
   ═══════════════════════════════════════════════════════════════════ */
const GlobalTab: React.FC<{ days: number }> = ({ days }) => {
  const [data, setData]       = useState<ApiGlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await cardsApi.getGlobalAnalytics(days)); }
    catch (e: any) { setError(e?.message || 'فشل تحميل الإحصائيات العامة'); }
    finally { setLoading(false); }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && (
        <div style={{ backgroundColor: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', borderRadius: 'var(--r-lg)', padding: '12px 16px', color: 'var(--clr-error)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button onClick={load} className="btn-outline" style={{ fontSize: 'var(--fs-xs)', padding: '4px 10px' }}>إعادة</button>
        </div>
      )}

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        <Tile label="إجمالي المسح"            value={data?.total_scans ?? 0}        icon={<BarChart2 size={20} />}   accent="var(--clr-primary-500)" loading={loading} />
        <Tile label={`مسح آخر ${days} يوم`}   value={data?.scans_last_N_days ?? 0}  icon={<TrendingUp size={20} />}  accent="#16a34a"                loading={loading} />
        <Tile label="أكثر بطاقة (مسح)"        value={loading ? 0 : (data?.top_cards?.[0]?.count ?? 0)} icon={<Award size={20} />} accent="#7c3aed" loading={loading} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>المسح اليومي</h3>
          {loading ? <div className="shimmer" style={{ height: '80px', borderRadius: 'var(--r-md)' }} /> : <DayChart data={data?.scans_by_day ?? []} />}
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>الأجهزة</h3>
          {loading ? <div className="shimmer" style={{ height: '90px', borderRadius: 'var(--r-md)' }} />
            : <BarList items={(data?.scans_by_device ?? []).map((d: ScanByDevice) => ({ label: d.device_type, count: d.count }))} color="var(--clr-primary-400)" />}
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>المتصفحات</h3>
          {loading ? <div className="shimmer" style={{ height: '110px', borderRadius: 'var(--r-md)' }} />
            : <BarList items={(data?.scans_by_browser ?? []).map((b: ScanByBrowser) => ({ label: b.browser, count: b.count }))} color="#7c3aed" />}
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)' }}>أكثر البطاقات مسحاً</h3>
          {loading ? <div className="shimmer" style={{ height: '110px', borderRadius: 'var(--r-md)' }} />
            : <BarList items={(data?.top_cards ?? []).slice(0, 8).map(c => ({ label: c.card_code.slice(-8), count: c.count }))} color="#16a34a" />}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   TAB 2 — PER-CARD ANALYTICS  (GET /api/cards/:id/analytics)
   ═══════════════════════════════════════════════════════════════════ */
const CardTab: React.FC<{ days: number }> = ({ days }) => {
  const [cards, setCards]         = useState<ApiCard[]>([]);
  const [cardsLoading, setCL]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selectedId, setSelected] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>('');

  const [data, setData]           = useState<ApiCardAnalytics | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  /* load cards list for the picker */
  useEffect(() => {
    setCL(true);
    // Fetch all cards using the helper function
    cardsApi.getAllCardsForStats()
      .then(allCards => setCards(allCards))
      .catch(() => {})
      .finally(() => setCL(false));
  }, []);

  /* fetch analytics whenever selectedId or days changes */
  const loadAnalytics = useCallback(async (id: string) => {
    setLoading(true); setError(null); setData(null);
    try {
      const res = await cardsApi.getCardAnalytics(id, days);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'فشل تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (selectedId) loadAnalytics(selectedId);
  }, [selectedId, loadAnalytics]);

  /* download per-card report */
  const downloadReport = async () => {
    if (!selectedId) return;
    try {
      const blob = await cardsApi.exportCardReport(selectedId, days);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url; a.download = `card-report-${selectedCode}-${date}.xlsx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { /* silent */ }
  };

  const filtered = cards.filter(c =>
    c.card_code.toLowerCase().includes(search.toLowerCase()) ||
    (c.business_data?.business_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const peakHourEgypt = data ? `${(data.peak_hour + 3) % 24}:00` : '—';

  return (
    <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* ── Card picker ── */}
      <div className="card" style={{ width: '240px', flexShrink: 0, padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--txt-heading)' }}>اختر بطاقة</div>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث..."
            style={{ paddingRight: '30px', fontSize: 'var(--fs-sm)' }}
          />
        </div>
        <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {cardsLoading
            ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer" style={{ height: '36px', borderRadius: 'var(--r-md)' }} />)
            : filtered.map(c => (
              <button
                key={c._id}
                onClick={() => { setSelected(c._id); setSelectedCode(c.card_code); }}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '1px',
                  padding: '8px 10px', borderRadius: 'var(--r-md)',
                  border: `1.5px solid ${selectedId === c._id ? 'var(--clr-primary-400)' : 'transparent'}`,
                  backgroundColor: selectedId === c._id ? 'var(--clr-primary-50)' : 'var(--bg-subtle)',
                  cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'right',
                  transition: 'all 120ms',
                }}
              >
                <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, fontFamily: 'monospace', color: selectedId === c._id ? 'var(--clr-primary-700)' : 'var(--txt-heading)' }}>
                  {c.card_code}
                </span>
                {c.business_data?.business_name && (
                  <span style={{ fontSize: '10px', color: 'var(--txt-muted)', fontFamily: 'var(--font)' }}>{c.business_data.business_name}</span>
                )}
              </button>
            ))}
        </div>
      </div>

      {/* ── Analytics panel ── */}
      <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {!selectedId && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--txt-muted)' }}>
            <CreditCard size={42} style={{ marginBottom: '12px', color: 'var(--bdr-medium)' }} />
            <p style={{ fontWeight: 600, fontSize: 'var(--fs-base)' }}>اختر بطاقة من القائمة لعرض إحصائياتها</p>
          </div>
        )}

        {selectedId && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, fontFamily: 'monospace', color: 'var(--txt-heading)' }}>{selectedCode}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>آخر {days} يوم</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '7px 13px' }} onClick={() => loadAnalytics(selectedId)} disabled={loading}>
                  <RefreshCw size={13} className={loading ? 'spin' : ''} /> تحديث
                </button>
                <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '7px 13px' }} onClick={downloadReport} title="تصدير تقرير Excel">
                  <FileDown size={13} /> تقرير Excel
                </button>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', borderRadius: 'var(--r-lg)', padding: '12px 16px', color: 'var(--clr-error)', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* KPI tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <Tile label="إجمالي المسح"           value={data?.total_scans ?? 0}        icon={<BarChart2 size={18} />}  accent="var(--clr-primary-500)" loading={loading} />
              <Tile label={`مسح آخر ${days} يوم`}  value={data?.scans_last_N_days ?? 0}  icon={<TrendingUp size={18} />} accent="#16a34a"                loading={loading} />
              <Tile label="أعلى ساعة (توقيت مصر)"  value={loading ? '—' : peakHourEgypt} icon={<Clock size={18} />}      accent="#d97706"                loading={loading} />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div className="card" style={{ padding: '16px 18px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--txt-heading)' }}>المسح اليومي</h3>
                {loading ? <div className="shimmer" style={{ height: '80px', borderRadius: 'var(--r-md)' }} /> : <DayChart data={data?.scans_by_day ?? []} />}
              </div>
              <div className="card" style={{ padding: '16px 18px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--txt-heading)' }}>الأجهزة</h3>
                {loading ? <div className="shimmer" style={{ height: '80px', borderRadius: 'var(--r-md)' }} />
                  : <BarList items={(data?.scans_by_device ?? []).map((d: ScanByDevice) => ({ label: d.device_type, count: d.count }))} color="var(--clr-primary-400)" />}
              </div>
              <div className="card" style={{ padding: '16px 18px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--txt-heading)' }}>المتصفحات</h3>
                {loading ? <div className="shimmer" style={{ height: '80px', borderRadius: 'var(--r-md)' }} />
                  : <BarList items={(data?.scans_by_browser ?? []).map((b: ScanByBrowser) => ({ label: b.browser, count: b.count }))} color="#7c3aed" />}
              </div>
            </div>

            {/* Recent scans */}
            <div className="card" style={{ padding: '16px 18px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--txt-heading)' }}>
                آخر المسحات
                {data && <span style={{ marginRight: '8px', fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)', fontWeight: 400 }}>(أحدث 10)</span>}
              </h3>
              {loading
                ? <div className="shimmer" style={{ height: '120px', borderRadius: 'var(--r-md)' }} />
                : <RecentScansTable scans={data?.recent_scans ?? []} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export const AdminAnalyticsPage: React.FC = () => {
  const [tab, setTab]   = useState<TabId>('global');
  const [days, setDays] = useState(30);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 16px', borderRadius: 'var(--r-md)', border: 'none',
    cursor: 'pointer', fontFamily: 'var(--font)',
    fontSize: 'var(--fs-sm)', fontWeight: active ? 700 : 500,
    backgroundColor: active ? 'var(--clr-primary-500)' : 'var(--bg-subtle)',
    color: active ? '#fff' : 'var(--txt-secondary)',
    transition: 'all 140ms var(--ease)',
  });

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font)' }}>

      {/* Hero */}
      <div className="page-hero">
        <div style={{ zIndex: 1 }}>
          <span className="page-hero-label">الإحصائيات</span>
          <h2>تحليلات المسح</h2>
          <p>{tab === 'global' ? 'نظرة عامة على كل البطاقات' : 'إحصائيات بطاقة واحدة'}</p>
        </div>
        <div style={{ zIndex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>الفترة:</span>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{ padding: '7px 12px', borderRadius: 'var(--r-md)', border: 'none', fontSize: 'var(--fs-sm)', fontFamily: 'var(--font)', fontWeight: 700, cursor: 'pointer' }}
          >
            {DAYS_OPTIONS.map(d => <option key={d} value={d}>{d} يوم</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={tabBtn(tab === 'global')} onClick={() => setTab('global')}>
          <Globe size={15} /> إحصائيات عامة
        </button>
        <button style={tabBtn(tab === 'card')} onClick={() => setTab('card')}>
          <CreditCard size={15} /> إحصائيات بطاقة
        </button>
      </div>

      {/* Content */}
      {tab === 'global' && <GlobalTab days={days} />}
      {tab === 'card'   && <CardTab   days={days} />}
    </div>
  );
};

export default AdminAnalyticsPage;
