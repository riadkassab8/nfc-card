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
  if (!items.length) return <p style={{ color: 'var(--txt-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>لا توجد بيانات</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ minWidth: '95px', fontSize: '12px', fontWeight: 700, color: 'var(--txt-body)', textAlign: 'right', wordBreak: 'break-all' }}>{item.label}</span>
          <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '6px', height: '18px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '6px', width: `${(item.count / max) * 100}%`, backgroundColor: color, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ minWidth: '45px', fontSize: '12.5px', fontWeight: 800, color: 'var(--txt-heading)', textAlign: 'left' }}>
            {item.count.toLocaleString('ar-EG')}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Stat tile ─────────────────────────────────────────────────────── */
const Tile: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string; bg: string; border: string; loading?: boolean }> = ({ label, value, icon, color, bg, border, loading }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '16px',
    padding: '18px 20px',
    border: '1px solid var(--bdr-light)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s ease',
  }}>
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
          {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        </div>
      )}
    </div>
  </div>
);

/* ── Day bar chart ────────────────────────────────────────────────── */
const DayChart: React.FC<{ data: ScanByDay[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  const recent = data.slice(-30);
  if (!recent.length) return <p style={{ color: 'var(--txt-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>لا توجد بيانات</p>;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '90px', padding: '6px 0' }}>
      {recent.map(d => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count}`}
          style={{
            flex: 1, minWidth: '6px',
            height: `${Math.max(4, (d.count / max) * 85)}px`,
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

/* ── Recent scans table ───────────────────────────────────────────── */
const RecentScansTable: React.FC<{ scans: ApiCardAnalytics['recent_scans'] }> = ({ scans }) => {
  if (!scans.length) return <p style={{ color: 'var(--txt-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>لا توجد مسحات حديثة</p>;
  return (
    <div style={{ overflowX: 'auto', padding: '8px 4px' }}>
      <table className="premium-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>الوقت</th>
            <th>نوع الجهاز</th>
            <th>المتصفح</th>
            <th>عنوان IP</th>
          </tr>
        </thead>
        <tbody>
          {scans.slice(0, 10).map((s, i) => (
            <tr key={i}>
              <td style={{ color: 'var(--txt-body)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {new Date(s.timestamp).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: 'var(--txt-heading)', fontSize: '12.5px' }}>
                  {s.device_type === 'mobile' ? <Smartphone size={14} style={{ color: '#3b82f6' }} /> : s.device_type === 'tablet' ? <Tablet size={14} style={{ color: '#8b5cf6' }} /> : <Monitor size={14} style={{ color: '#10b981' }} />}
                  {s.device_type}
                </span>
              </td>
              <td style={{ color: 'var(--txt-secondary)', fontWeight: 600 }}>{s.browser}</td>
              <td style={{ color: 'var(--txt-muted)', fontFamily: 'monospace', fontSize: '12px' }}>{s.ip_address}</td>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Tile label="إجمالي المسحات بالمنظومة" value={data?.total_scans ?? 0}        icon={<BarChart2 size={20} />}   color="#3b82f6" bg="#eff6ff" border="#bfdbfe" loading={loading} />
        <Tile label={`مسحات آخر ${days} يوم`}   value={data?.scans_last_N_days ?? 0}  icon={<TrendingUp size={20} />}  color="#10b981" bg="#ecfdf5" border="#a7f3d0" loading={loading} />
        <Tile label="أكثر بطاقة مسحاً"        value={loading ? 0 : (data?.top_cards?.[0]?.count ?? 0)} icon={<Award size={20} />} color="#8b5cf6" bg="#f5f3ff" border="#ddd6fe" loading={loading} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--bdr-light)', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)' }}>المسح اليومي</h3>
          {loading ? <div className="shimmer" style={{ height: '90px', borderRadius: 'var(--r-md)' }} /> : <DayChart data={data?.scans_by_day ?? []} />}
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--bdr-light)', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)' }}>توزيع الأجهزة</h3>
          {loading ? <div className="shimmer" style={{ height: '90px', borderRadius: 'var(--r-md)' }} />
            : <BarList items={(data?.scans_by_device ?? []).map((d: ScanByDevice) => ({ label: d.device_type, count: d.count }))} color="#3b82f6" />}
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--bdr-light)', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)' }}>المتصفحات</h3>
          {loading ? <div className="shimmer" style={{ height: '110px', borderRadius: 'var(--r-md)' }} />
            : <BarList items={(data?.scans_by_browser ?? []).map((b: ScanByBrowser) => ({ label: b.browser, count: b.count }))} color="#8b5cf6" />}
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--bdr-light)', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)' }}>أكثر البطاقات مسحاً (المتصدرة)</h3>
          {loading ? <div className="shimmer" style={{ height: '110px', borderRadius: 'var(--r-md)' }} />
            : <BarList items={(data?.top_cards ?? []).slice(0, 8).map(c => ({ label: c.card_code, count: c.count }))} color="#10b981" />}
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

  useEffect(() => {
    setCL(true);
    cardsApi.getAllCardsForStats()
      .then(allCards => setCards(allCards))
      .catch(() => {})
      .finally(() => setCL(false));
  }, []);

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
    (c.custom_slug || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.business_data?.business_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const peakHourEgypt = data ? `${(data.peak_hour + 3) % 24}:00` : '—';

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* Card picker */}
      <div style={{
        width: 'min(270px, 100%)', flexShrink: 0, flexGrow: 1,
        backgroundColor: '#ffffff', borderRadius: '16px',
        border: '1px solid var(--bdr-light)', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--txt-heading)' }}>اختر بطاقة للتحليل</div>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالكود أو الاسم..."
            style={{ paddingRight: '34px', height: '38px', borderRadius: '8px', fontSize: '13px', width: '100%' }}
          />
        </div>
        <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {cardsLoading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer" style={{ height: '42px', borderRadius: '8px' }} />)
            : filtered.map(c => {
              const isSel = selectedId === c._id;
              return (
                <button
                  key={c._id}
                  onClick={() => { setSelected(c._id); setSelectedCode(c.card_code); }}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    padding: '9px 12px', borderRadius: '10px',
                    border: `1.5px solid ${isSel ? 'var(--clr-primary-500)' : 'var(--bdr-light)'}`,
                    backgroundColor: isSel ? 'var(--clr-primary-50)' : '#f8fafc',
                    cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'right',
                    transition: 'all 120ms',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'monospace', color: isSel ? 'var(--clr-primary-700)' : 'var(--txt-heading)' }}>
                      {c.card_code}
                    </span>
                    {c.custom_slug && (
                      <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>
                        /{c.custom_slug}
                      </span>
                    )}
                  </div>
                  {c.business_data?.business_name && (
                    <span style={{ fontSize: '11px', color: 'var(--txt-muted)', fontFamily: 'var(--font)' }}>{c.business_data.business_name}</span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* Analytics panel */}
      <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {!selectedId && (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--bdr-light)' }}>
            <CreditCard size={48} style={{ marginBottom: '14px', color: 'var(--bdr-medium)' }} />
            <p style={{ fontWeight: 800, fontSize: '16px', color: 'var(--txt-heading)', margin: '0 0 6px' }}>اختر بطاقة من القائمة الجانبية</p>
            <p style={{ fontSize: '13px', color: 'var(--txt-muted)', margin: 0 }}>لعرض تحليلات المسح الدقيقة ومصادر الزيارات</p>
          </div>
        )}

        {selectedId && (
          <>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
              backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1px solid var(--bdr-light)'
            }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--txt-heading)' }}>{selectedCode}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--txt-muted)', marginTop: '2px' }}>تحليلات آخر {days} يوم مسح</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '10px', fontWeight: 700 }} onClick={() => loadAnalytics(selectedId)} disabled={loading}>
                  <RefreshCw size={14} className={loading ? 'spin' : ''} /> تحديث
                </button>
                <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={downloadReport} title="تصدير تقرير Excel">
                  <FileDown size={14} /> تصدير تقرير Excel
                </button>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', borderRadius: 'var(--r-lg)', padding: '14px 18px', color: 'var(--clr-error)', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* KPI tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <Tile label="إجمالي المسحات"          value={data?.total_scans ?? 0}        icon={<BarChart2 size={20} />}  color="#3b82f6" bg="#eff6ff" border="#bfdbfe" loading={loading} />
              <Tile label={`مسحات آخر ${days} يوم`} value={data?.scans_last_N_days ?? 0}  icon={<TrendingUp size={20} />} color="#10b981" bg="#ecfdf5" border="#a7f3d0" loading={loading} />
              <Tile label="ساعة الذروة (مصر)"      value={loading ? '—' : peakHourEgypt} icon={<Clock size={20} />}      color="#f59e0b" bg="#fffbeb" border="#fde68a" loading={loading} />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--bdr-light)', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>المسح اليومي</h3>
                {loading ? <div className="shimmer" style={{ height: '80px', borderRadius: 'var(--r-md)' }} /> : <DayChart data={data?.scans_by_day ?? []} />}
              </div>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--bdr-light)', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>نوع الأجهزة</h3>
                {loading ? <div className="shimmer" style={{ height: '80px', borderRadius: 'var(--r-md)' }} />
                  : <BarList items={(data?.scans_by_device ?? []).map((d: ScanByDevice) => ({ label: d.device_type, count: d.count }))} color="#3b82f6" />}
              </div>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--bdr-light)', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>المتصفحات</h3>
                {loading ? <div className="shimmer" style={{ height: '80px', borderRadius: 'var(--r-md)' }} />
                  : <BarList items={(data?.scans_by_browser ?? []).map((b: ScanByBrowser) => ({ label: b.browser, count: b.count }))} color="#8b5cf6" />}
              </div>
            </div>

            {/* Recent scans table */}
            <div className="data-table-wrapper">
              <div style={{ padding: '14px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--bdr-light)' }}>
                <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                  أحدث المسحات المسجلة
                  {data && <span style={{ marginRight: '8px', fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 500 }}>(أحدث 10 زيارات)</span>}
                </h3>
              </div>
              {loading ? (
                <div style={{ padding: '20px' }}>
                  <div className="shimmer" style={{ height: '100px', borderRadius: 'var(--r-md)' }} />
                </div>
              ) : (
                <RecentScansTable scans={data?.recent_scans ?? []} />
              )}
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

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'var(--font)' }}>

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
            <span>لوحة التحليلات الذكية</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px', color: '#fff' }}>تحليلات وإحصائيات المسح</h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
            {tab === 'global' ? 'نظرة تحليلية شاملة لجميع بطاقات النظام' : 'تحليل تفصيلي لمسحات وزيارات بطاقة معينة'}
          </p>
        </div>

        <div style={{ zIndex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 700 }}>فترة التحليل:</span>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{
              padding: '9px 14px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontSize: '13.5px', fontFamily: 'var(--font)', fontWeight: 700,
              cursor: 'pointer', outline: 'none', backdropFilter: 'blur(8px)'
            }}
          >
            {DAYS_OPTIONS.map(d => <option key={d} value={d} style={{ color: '#000' }}>آخر {d} يوم</option>)}
          </select>
        </div>
      </div>

      {/* Modern Tabs */}
      <div style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
        gap: '6px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--bdr-light)',
        borderRadius: '12px',
        padding: '5px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        <button
          onClick={() => setTab('global')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '9px 18px', borderRadius: '8px', border: 'none',
            fontSize: '13.5px', fontWeight: 800, fontFamily: 'var(--font)',
            cursor: 'pointer', transition: 'all 0.15s ease',
            backgroundColor: tab === 'global' ? 'var(--clr-primary-500)' : 'transparent',
            color: tab === 'global' ? '#ffffff' : 'var(--txt-secondary)',
            boxShadow: tab === 'global' ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
          }}
        >
          <Globe size={16} /> إحصائيات عامة
        </button>
        <button
          onClick={() => setTab('card')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '9px 18px', borderRadius: '8px', border: 'none',
            fontSize: '13.5px', fontWeight: 800, fontFamily: 'var(--font)',
            cursor: 'pointer', transition: 'all 0.15s ease',
            backgroundColor: tab === 'card' ? 'var(--clr-primary-500)' : 'transparent',
            color: tab === 'card' ? '#ffffff' : 'var(--txt-secondary)',
            boxShadow: tab === 'card' ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
          }}
        >
          <CreditCard size={16} /> إحصائيات بطاقة محددة
        </button>
      </div>

      {/* Content */}
      {tab === 'global' && <GlobalTab days={days} />}
      {tab === 'card'   && <CardTab   days={days} />}
    </div>
  );
};

export default AdminAnalyticsPage;
