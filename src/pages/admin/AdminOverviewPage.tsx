/* ==========================================================================
   ADMIN OVERVIEW / DASHBOARD (src/pages/admin/AdminOverviewPage.tsx)
   Updated with CRM (Customers), Cards Security, Interactive Charts,
   Backup Downloads, System Health Donut, and Top Scanned Cards.
   ========================================================================== */

import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cardsApi, categoriesApi, customersApi } from '../../services';
import {
  ApiCard,
  ApiCategory,
  ApiGlobalAnalytics,
  ScanByDay,
  ApiCustomer,
  fmtDate,
  isSubscriptionExpired,
} from '../../types';
import { CardDetailsDrawer } from '../../components/admin/CardDetailsDrawer';
import { CustomerModal } from '../../components/admin/CustomerModal';
import {
  CreditCard,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  TrendingUp,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  Award,
  Sparkles,
  UserCheck,
} from 'lucide-react';

/* ── Toast notification ─────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'info';
const Toast: React.FC<{ msg: string; type: ToastType; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const cls = type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info';
  return (
    <div className={`toast ${cls}`}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem', padding: '0 2px' }}
      >
        ✕
      </button>
    </div>
  );
};

/* ── Card type badge ─────────────────────────────────────────────── */
const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span
    style={{
      fontSize: '12px',
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 'var(--r-full)',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0',
      display: 'inline-block',
    }}
  >
    {type}
  </span>
);

/* ── Stat card ──────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number;
  subtext?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  loading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  color,
  bg,
  border,
  loading,
  onClick,
}) => (
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
    onMouseEnter={(e) => {
      if (onClick) {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 20px -4px ${color}25`;
        (e.currentTarget as HTMLElement).style.borderColor = color;
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr-light)';
      }
    }}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-muted)', marginBottom: '3px' }}>
        {label}
      </div>
      {loading ? (
        <div className="shimmer" style={{ width: '60px', height: '26px', borderRadius: '4px' }} />
      ) : (
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--txt-heading)', lineHeight: 1.1 }}>
          {value.toLocaleString('ar-EG')}
        </div>
      )}
      {subtext && (
        <div style={{ fontSize: '11px', color: 'var(--txt-secondary)', marginTop: '4px', fontWeight: 600 }}>
          {subtext}
        </div>
      )}
    </div>
  </div>
);

/* ── Interactive SVG Scan Trends Chart ───────────────────────────── */
interface InteractiveChartProps {
  data: ScanByDay[];
  loading: boolean;
  daysRange: number;
  onRangeChange: (d: number) => void;
}

const InteractiveScansChart: React.FC<InteractiveChartProps> = ({
  data,
  loading,
  daysRange,
  onRangeChange,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const slicedData = useMemo(() => {
    if (!data || !data.length) return [];
    return data.slice(-daysRange);
  }, [data, daysRange]);

  const maxCount = useMemo(() => {
    if (!slicedData.length) return 1;
    return Math.max(...slicedData.map((d) => d.count), 1);
  }, [slicedData]);

  const totalPeriodScans = useMemo(() => {
    return slicedData.reduce((acc, d) => acc + d.count, 0);
  }, [slicedData]);

  const avgDailyScans = useMemo(() => {
    if (!slicedData.length) return 0;
    return Math.round(totalPeriodScans / slicedData.length);
  }, [slicedData, totalPeriodScans]);

  const peakDay = useMemo(() => {
    if (!slicedData.length) return null;
    return [...slicedData].sort((a, b) => b.count - a.count)[0];
  }, [slicedData]);

  // SVG Area path generator
  const svgWidth = 800;
  const svgHeight = 160;
  const paddingX = 20;
  const paddingBottom = 24;
  const paddingTop = 15;

  const points = useMemo(() => {
    if (!slicedData.length) return [];
    const step = (svgWidth - paddingX * 2) / Math.max(slicedData.length - 1, 1);
    const usableHeight = svgHeight - paddingTop - paddingBottom;

    return slicedData.map((item, idx) => {
      const x = paddingX + idx * step;
      const y = paddingTop + usableHeight - (item.count / maxCount) * usableHeight;
      return { x, y, item, idx };
    });
  }, [slicedData, maxCount]);

  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    return points.reduce((path, pt, i) => `${path} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const usableBottom = svgHeight - paddingBottom;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${linePath} L ${lastX} ${usableBottom} L ${firstX} ${usableBottom} Z`;
  }, [linePath, points]);

  const activeItem = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx].item : null;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--bdr-light)',
        padding: '22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header with Range Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--clr-primary-600)' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
              مسار الزيارات والمسح التفاعلي
            </h3>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--txt-muted)' }}>
            تتبع أداء البطاقات الذكية ومعدل التفاعل اللحظي
          </p>
        </div>

        {/* Range Buttons */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          {[
            { label: '7 أيام', val: 7 },
            { label: '14 يوم', val: 14 },
            { label: '30 يوم', val: 30 },
          ].map((r) => (
            <button
              key={r.val}
              onClick={() => onRangeChange(r.val)}
              style={{
                border: 'none',
                background: daysRange === r.val ? '#ffffff' : 'transparent',
                color: daysRange === r.val ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
                fontWeight: daysRange === r.val ? 800 : 600,
                fontSize: '12px',
                padding: '5px 12px',
                borderRadius: '7px',
                cursor: 'pointer',
                boxShadow: daysRange === r.val ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '18px',
          border: '1px solid #f1f5f9',
        }}
      >
        <div>
          <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', fontWeight: 600 }}>إجمالي مسحات الفترة:</span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--clr-primary-600)' }}>
            {totalPeriodScans.toLocaleString('ar-EG')}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', fontWeight: 600 }}>المتوسط اليومي:</span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
            {avgDailyScans.toLocaleString('ar-EG')}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', fontWeight: 600 }}>أعلى يوم (الذروة):</span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>
            {peakDay ? peakDay.count.toLocaleString('ar-EG') : 0}
            {peakDay && <span style={{ fontSize: '11px', color: 'var(--txt-muted)', marginRight: '6px' }}>({peakDay.date})</span>}
          </div>
        </div>
        {activeItem && (
          <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '4px 10px', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700 }}>اليوم المحدد: {activeItem.date}</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#1d4ed8' }}>
              {activeItem.count.toLocaleString('ar-EG')} مسحة
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas Chart */}
      {loading ? (
        <div className="shimmer" style={{ height: `${svgHeight}px`, borderRadius: '12px' }} />
      ) : !slicedData.length ? (
        <div style={{ height: `${svgHeight}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-muted)', fontSize: '13px' }}>
          لا توجد بيانات مسح مسجلة في هذه الفترة
        </div>
      ) : (
        <div style={{ width: '100%', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', height: 'auto', maxHeight: '180px', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="scansAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.5, 1].map((pct, i) => {
              const y = paddingTop + (svgHeight - paddingTop - paddingBottom) * pct;
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Filled Area */}
            {areaPath && <path d={areaPath} fill="url(#scansAreaGrad)" />}

            {/* Line Path */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points & Interactive Hover Columns */}
            {points.map((pt) => {
              const isHovered = hoveredIdx === pt.idx;
              const colWidth = (svgWidth - paddingX * 2) / points.length;

              return (
                <g key={pt.item.date}>
                  {/* Invisible Hitbox column for easier hover */}
                  <rect
                    x={pt.x - colWidth / 2}
                    y={0}
                    width={colWidth}
                    height={svgHeight}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredIdx(pt.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />

                  {/* Vertical bar column */}
                  <rect
                    x={pt.x - 3}
                    y={pt.y}
                    width={6}
                    height={Math.max(4, svgHeight - paddingBottom - pt.y)}
                    rx={3}
                    fill={isHovered ? '#1d4ed8' : '#60a5fa'}
                    opacity={isHovered ? 1 : 0.6}
                    style={{ transition: 'all 0.2s' }}
                  />

                  {/* Data dot on top */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 3.5}
                    fill={isHovered ? '#1d4ed8' : '#ffffff'}
                    stroke={isHovered ? '#ffffff' : '#2563eb'}
                    strokeWidth={isHovered ? 2.5 : 2}
                    style={{ transition: 'all 0.2s', pointerEvents: 'none' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Date Axis Labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 10px 0',
              fontSize: '11px',
              color: 'var(--txt-muted)',
              fontFamily: 'monospace',
            }}
          >
            <span>{slicedData[0]?.date}</span>
            <span>{slicedData[Math.floor(slicedData.length / 2)]?.date}</span>
            <span>{slicedData[slicedData.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── SVG System Health Donut Chart ───────────────────────────────── */
interface DonutProps {
  active: number;
  inactive: number;
  expired: number;
  assigned: number;
  unassigned?: number;
  total: number;
  loading: boolean;
}

const SystemHealthDonut: React.FC<DonutProps> = ({
  active,
  inactive,
  expired,
  assigned,
  total,
  loading,
}) => {
  const safeTotal = Math.max(total, 1);
  const activePct = Math.round((active / safeTotal) * 100);

  // SVG ring dimensions
  const size = 180;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Segment calculations
  const segActive = (active / safeTotal) * circumference;
  const segInactive = (inactive / safeTotal) * circumference;
  const segExpired = (expired / safeTotal) * circumference;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--bdr-light)',
        padding: '22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: '#10b981' }} />
          <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
            توزيع وحالة البطاقات
          </h3>
        </div>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: activePct > 70 ? '#ecfdf5' : '#fef2f2',
            color: activePct > 70 ? '#059669' : '#dc2626',
          }}
        >
          {activePct}% جاهزية
        </span>
      </div>

      {loading ? (
        <div className="shimmer" style={{ height: '180px', borderRadius: '12px' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '10px 0' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Active Segment (Green) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${segActive} ${circumference - segActive}`}
              strokeDashoffset={0}
              strokeLinecap="round"
            />

            {/* Inactive Segment (Amber) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={`${segInactive} ${circumference - segInactive}`}
              strokeDashoffset={-segActive}
            />

            {/* Expired Segment (Red) */}
            {expired > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#ef4444"
                strokeWidth={strokeWidth}
                strokeDasharray={`${segExpired} ${circumference - segExpired}`}
                strokeDashoffset={-(segActive + segInactive)}
              />
            )}
          </svg>

          {/* Center text in donut */}
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt-heading)', lineHeight: 1 }}>
              {activePct}%
            </span>
            <span style={{ fontSize: '11px', color: 'var(--txt-muted)', fontWeight: 700, marginTop: '2px' }}>
              نشاط المنظومة
            </span>
          </div>
        </div>
      )}

      {/* Legend Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ color: 'var(--txt-body)', fontWeight: 600 }}>نشطة:</span>
          <strong style={{ marginRight: 'auto', color: 'var(--txt-heading)' }}>{active}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span style={{ color: 'var(--txt-body)', fontWeight: 600 }}>معطلة:</span>
          <strong style={{ marginRight: 'auto', color: 'var(--txt-heading)' }}>{inactive}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span style={{ color: 'var(--txt-body)', fontWeight: 600 }}>منتهية:</span>
          <strong style={{ marginRight: 'auto', color: 'var(--txt-heading)' }}>{expired}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
          <span style={{ color: 'var(--txt-body)', fontWeight: 600 }}>مربوطة بعملاء:</span>
          <strong style={{ marginRight: 'auto', color: 'var(--txt-heading)' }}>{assigned}</strong>
        </div>
      </div>
    </div>
  );
};

/* ── Top 5 Scanned Cards Visual Widget ───────────────────────────── */
interface TopCardsProps {
  topCards: ApiGlobalAnalytics['top_cards'];
  allCards: ApiCard[];
  loading: boolean;
  onOpenCardDrawer: (code: string) => void;
}

const TopCardsWidget: React.FC<TopCardsProps> = ({ topCards, allCards, loading, onOpenCardDrawer }) => {
  const maxScans = useMemo(() => {
    if (!topCards || !topCards.length) return 1;
    return Math.max(...topCards.map((c) => c.count), 1);
  }, [topCards]);

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--bdr-light)',
        padding: '22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} style={{ color: '#f59e0b' }} />
          <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
            أكثر البطاقات تفاعلاً ومسحاً
          </h3>
        </div>
        <Link
          to="/admin/analytics"
          style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-primary-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          كل الإحصائيات <ArrowLeft size={13} />
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer" style={{ height: '36px', borderRadius: '8px' }} />
          ))}
        </div>
      ) : !topCards || topCards.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--txt-muted)', fontSize: '13px' }}>
          لا توجد بيانات مسح كافية حتى الآن
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topCards.slice(0, 5).map((card, idx) => {
            const pct = Math.round((card.count / maxScans) * 100);
            const matchedCard = allCards.find((c) => c.card_code === card.card_code);
            const customSlug = matchedCard?.custom_slug;

            return (
              <div
                key={card.card_code}
                onClick={() => onOpenCardDrawer(card.card_code)}
                style={{
                  cursor: 'pointer',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#eff6ff';
                  (e.currentTarget as HTMLElement).style.borderColor = '#bfdbfe';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                  (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{medals[idx] || `${idx + 1}.`}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '13px', color: 'var(--txt-heading)' }}>
                      {card.card_code}
                    </span>
                    {customSlug && (
                      <span style={{ fontSize: '11px', color: '#2563eb', backgroundColor: '#dbeafe', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>
                        /{customSlug}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--clr-primary-700)' }}>
                      {card.count.toLocaleString('ar-EG')}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>مسحة</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: idx === 0 ? 'linear-gradient(90deg, #3b82f6, #1d4ed8)' : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Devices & Browsers Horizontal Bar Component ─────────────────── */
interface DevicesBrowsersProps {
  deviceItems: { label: string; count: number }[];
  browserItems: { label: string; count: number }[];
  loading: boolean;
}

const DevicesBrowsersWidget: React.FC<DevicesBrowsersProps> = ({ deviceItems, browserItems, loading }) => {
  const [tab, setTab] = useState<'devices' | 'browsers'>('devices');

  const items = tab === 'devices' ? deviceItems : browserItems;
  const max = useMemo(() => {
    if (!items.length) return 1;
    return Math.max(...items.map((i) => i.count), 1);
  }, [items]);

  const getDeviceIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('mobile') || l.includes('جوال') || l.includes('هاتف')) return <Smartphone size={14} style={{ color: '#3b82f6' }} />;
    if (l.includes('tablet') || l.includes('لوحي')) return <Tablet size={14} style={{ color: '#8b5cf6' }} />;
    return <Monitor size={14} style={{ color: '#10b981' }} />;
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--bdr-light)',
        padding: '22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} style={{ color: '#8b5cf6' }} />
          <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
            توزيع التقنية والجمهور
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setTab('devices')}
            style={{
              border: 'none',
              background: tab === 'devices' ? '#ffffff' : 'transparent',
              color: tab === 'devices' ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            الأجهزة
          </button>
          <button
            onClick={() => setTab('browsers')}
            style={{
              border: 'none',
              background: tab === 'browsers' ? '#ffffff' : 'transparent',
              color: tab === 'browsers' ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            المتصفحات
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[60, 40, 25].map((w) => (
            <div key={w} className="shimmer" style={{ height: '22px', width: `${w}%`, borderRadius: '6px' }} />
          ))}
        </div>
      ) : !items.length ? (
        <div style={{ color: 'var(--txt-muted)', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>
          لا توجد بيانات متاحة
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  minWidth: '85px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--txt-body)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab === 'devices' && getDeviceIcon(item.label)}
                {item.label}
              </span>
              <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '6px', height: '14px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: '6px',
                    width: `${(item.count / max) * 100}%`,
                    backgroundColor: tab === 'devices' ? '#3b82f6' : '#8b5cf6',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <span style={{ minWidth: '40px', fontSize: '12px', fontWeight: 800, color: 'var(--txt-heading)', textAlign: 'left' }}>
                {item.count.toLocaleString('ar-EG')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT: AdminOverviewPage
   ═══════════════════════════════════════════════════════════════════ */
export const AdminOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  /* Drawer & Modals */
  const [drawerCard, setDrawerCard] = useState<ApiCard | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const showToast = (msg: string, type: ToastType = 'success') => setToast({ msg, type });

  /* Data States */
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Stats numbers */
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [expired, setExpired] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [trashCustomersCount, setTrashCustomersCount] = useState(0);
  const [trashCardsCount, setTrashCardsCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);

  /* Analytics */
  const [analytics, setAnalytics] = useState<ApiGlobalAnalytics | null>(null);
  const [analyticsLoading, setAL] = useState(true);
  const [analyticsDays, setAnalyticsDays] = useState(30);

  /* Recent Customers Preview */
  const [recentCustomers, setRecentCustomers] = useState<ApiCustomer[]>([]);

  /* Bottom Table Tab */
  const [activeTab, setActiveTab] = useState<'cards' | 'customers'>('cards');

  /* Backup Download States */
  const [downloadingCardsBackup, setDownloadingCardsBackup] = useState(false);
  const [downloadingCustomersBackup, setDownloadingCustomersBackup] = useState(false);

  /* Fetch all data */
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        countTotal,
        countActive,
        countInactive,
        allCards,
        catRes,
        custRes,
        trashCustRes,
        trashCardsRes,
      ] = await Promise.all([
        cardsApi.getCards({ limit: 1 }),
        cardsApi.getCards({ status: 'active', limit: 1 }),
        cardsApi.getCards({ status: 'inactive', limit: 1 }),
        cardsApi.getAllCardsForStats(),
        categoriesApi.getCategories({ limit: 100 }),
        customersApi.getCustomers({ page: 1, limit: 5 }).catch(() => ({ data: [], total: 0 })),
        customersApi.getTrash().catch(() => []),
        cardsApi.getTrash().catch(() => []),
      ]);

      setCards(allCards);
      setCategories(catRes.data ?? []);
      setTotal(countTotal.total ?? allCards.length);
      setActive(countActive.total ?? allCards.filter((c) => c.status === 'active').length);
      setInactive(countInactive.total ?? allCards.filter((c) => c.status === 'inactive').length);
      setExpired(allCards.filter((c) => (c.requires_subscription ?? true) && isSubscriptionExpired(c)).length);

      // Customers & CRM counts
      setTotalCustomers(custRes.total ?? 0);
      setRecentCustomers(custRes.data ?? []);

      // Trash counts
      const tCustLen = Array.isArray(trashCustRes) ? trashCustRes.length : (trashCustRes as any)?.data?.length ?? 0;
      const tCardLen = Array.isArray(trashCardsRes) ? trashCardsRes.length : (trashCardsRes as any)?.data?.length ?? 0;
      setTrashCustomersCount(tCustLen);
      setTrashCardsCount(tCardLen);

      // Assigned cards count
      const assigned = allCards.filter((c) => !!c.customer_id || !!c.customer).length;
      setAssignedCount(assigned);
    } catch (e: any) {
      setError(e?.message || 'فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (days = analyticsDays) => {
    setAL(true);
    try {
      const res = await cardsApi.getGlobalAnalytics(days);
      setAnalytics(res);
    } catch {
      /* silent */
    } finally {
      setAL(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadAnalytics(analyticsDays);
  }, [analyticsDays]);

  const handleDownloadCardsBackup = async () => {
    setDownloadingCardsBackup(true);
    try {
      const blob = await cardsApi.downloadBackup();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cards-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('تم تحميل النسخة الاحتياطية للكروت بنجاح 💾', 'success');
    } catch (err: any) {
      showToast('فشل تحميل النسخة الاحتياطية للكروت', 'error');
    } finally {
      setDownloadingCardsBackup(false);
    }
  };

  const handleDownloadCustomersBackup = async () => {
    setDownloadingCustomersBackup(true);
    try {
      const blob = await customersApi.downloadBackup();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('تم تحميل النسخة الاحتياطية للعملاء بنجاح 💾', 'success');
    } catch (err: any) {
      showToast('فشل تحميل النسخة الاحتياطية للعملاء', 'error');
    } finally {
      setDownloadingCustomersBackup(false);
    }
  };

  const openCardByCode = (cardCode: string) => {
    const found = cards.find((c) => c.card_code === cardCode);
    if (found) {
      setDrawerCard(found);
    } else {
      navigate(`/admin/cards?search=${encodeURIComponent(cardCode)}`);
    }
  };

  const recentCards = useMemo(() => {
    return [...cards].reverse().slice(0, 7);
  }, [cards]);

  const unassignedCount = Math.max(0, total - assignedCount);
  const totalTrashCount = trashCardsCount + trashCustomersCount;

  const deviceItems = (analytics?.scans_by_device ?? []).map((d) => ({ label: d.device_type, count: d.count }));
  const browserItems = (analytics?.scans_by_browser ?? []).map((b) => ({ label: b.browser, count: b.count }));

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'var(--font)' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Card Details Drawer */}
      <CardDetailsDrawer
        card={drawerCard}
        categories={categories}
        onClose={() => setDrawerCard(null)}
        onUpdated={() => {
          load();
          setDrawerCard(null);
        }}
        onDeleted={(id) => {
          if (drawerCard?._id === id) setDrawerCard(null);
          load();
        }}
        onToast={showToast}
      />

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <CustomerModal
          onClose={() => setShowAddCustomerModal(false)}
          onSuccess={() => {
            setShowAddCustomerModal(false);
            load();
            showToast('تمت إضافة العميل بنجاح');
          }}
          onToast={showToast}
        />
      )}

      {/* Hero Header Banner */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '-40px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.08)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '25%',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.08)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '8px',
              color: '#93c5fd',
            }}
          >
            <Sparkles size={13} />
            <span>لوحة التحكم الرئيسية والمنظومة الشاملة</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px', color: '#fff' }}>
            نظرة عامة على البطاقات والعملاء
          </h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
            البطاقات: <strong style={{ color: '#38bdf8' }}>{total}</strong> • العملاء: <strong style={{ color: '#a78bfa' }}>{totalCustomers}</strong> • النشطة: <strong style={{ color: '#34d399' }}>{active}</strong> • المربوطة:{' '}
            <strong style={{ color: '#60a5fa' }}>{assignedCount}</strong>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ zIndex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={15} /> إضافة عميل جديد
          </button>

          <button
            onClick={() => navigate('/admin/add-card')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <CreditCard size={16} /> إضافة بطاقة جديدة
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--clr-error-bg)',
            border: '1px solid var(--clr-error-bdr)',
            borderRadius: 'var(--r-lg)',
            padding: '14px 18px',
            color: 'var(--clr-error)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <XCircle size={18} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button
            onClick={load}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--clr-error)',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: 'var(--fs-sm)',
            }}
          >
            <RefreshCw size={14} /> إعادة المحاولة
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <StatCard
          label="إجمالي البطاقات"
          value={total}
          subtext="كل البطاقات المسجلة"
          icon={<CreditCard size={20} />}
          color="#3b82f6"
          bg="#eff6ff"
          border="#bfdbfe"
          loading={loading}
          onClick={() => navigate('/admin/cards')}
        />
        <StatCard
          label="العملاء (CRM)"
          value={totalCustomers}
          subtext="الأنشطة والعملاء المسجلين"
          icon={<Users size={20} />}
          color="#8b5cf6"
          bg="#f5f3ff"
          border="#ddd6fe"
          loading={loading}
          onClick={() => navigate('/admin/customers')}
        />
        <StatCard
          label="البطاقات النشطة"
          value={active}
          subtext={`${Math.round((active / (total || 1)) * 100)}% جاهزة للمسح`}
          icon={<CheckCircle2 size={20} />}
          color="#10b981"
          bg="#ecfdf5"
          border="#a7f3d0"
          loading={loading}
          onClick={() => navigate('/admin/cards?status=active')}
        />
        <StatCard
          label="كروت مربوطة بعملاء"
          value={assignedCount}
          subtext={`${unassignedCount} كارت حر ومتاح`}
          icon={<UserCheck size={20} />}
          color="#06b6d4"
          bg="#ecfeff"
          border="#a5f3fc"
          loading={loading}
          onClick={() => navigate('/admin/cards')}
        />
        <StatCard
          label="بطاقات معطلة"
          value={inactive}
          subtext="غير مفعلة مؤقتاً"
          icon={<XCircle size={20} />}
          color="#f59e0b"
          bg="#fffbeb"
          border="#fde68a"
          loading={loading}
          onClick={() => navigate('/admin/cards?status=inactive')}
        />
        <StatCard
          label="إجمالي المسحات"
          value={analytics?.total_scans ?? 0}
          subtext={`${(analytics?.scans_last_N_days ?? 0).toLocaleString('ar-EG')} في 30 يوم`}
          icon={<Activity size={20} />}
          color="#3b82f6"
          bg="#eff6ff"
          border="#bfdbfe"
          loading={analyticsLoading}
          onClick={() => navigate('/admin/analytics')}
        />
        <StatCard
          label="منتهية الاشتراك"
          value={expired}
          subtext="تحتاج لتجديد"
          icon={<TrendingUp size={20} />}
          color="#ef4444"
          bg="#fef2f2"
          border="#fecaca"
          loading={loading}
          onClick={() => navigate('/admin/cards?status=expired')}
        />
        <StatCard
          label="سلة المهملات"
          value={totalTrashCount}
          subtext={`${trashCardsCount} كروت • ${trashCustomersCount} عملاء`}
          icon={<Trash2 size={20} />}
          color="#64748b"
          bg="#f8fafc"
          border="#e2e8f0"
          loading={loading}
          onClick={() => navigate('/admin/cards')}
        />
      </div>

      {/* Interactive Main Scan Trend Chart */}
      <InteractiveScansChart
        data={analytics?.scans_by_day ?? []}
        loading={analyticsLoading}
        daysRange={analyticsDays}
        onRangeChange={setAnalyticsDays}
      />

      {/* Visual Analytics Widgets Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Donut Chart: Card Distribution */}
        <SystemHealthDonut
          active={active}
          inactive={inactive}
          expired={expired}
          assigned={assignedCount}
          unassigned={unassignedCount}
          total={total}
          loading={loading}
        />

        {/* Top 5 Performing Cards */}
        <TopCardsWidget
          topCards={analytics?.top_cards ?? []}
          allCards={cards}
          loading={analyticsLoading}
          onOpenCardDrawer={openCardByCode}
        />

        {/* Devices and Browsers */}
        <DevicesBrowsersWidget
          deviceItems={deviceItems}
          browserItems={browserItems}
          loading={analyticsLoading}
        />
      </div>

      {/* Quick Operations & Backup Download Ribbon */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--bdr-light)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Download size={18} style={{ color: 'var(--clr-primary-600)' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
              النسخ الاحتياطي وإجراءات الأمان السريعة
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
              احتفظ بنسخ احتياطية من بيانات المنظومة محلياً بصيغة JSON
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadCardsBackup}
            disabled={downloadingCardsBackup}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '9px',
              border: '1px solid var(--bdr-light)',
              backgroundColor: '#f8fafc',
              color: 'var(--txt-heading)',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {downloadingCardsBackup ? <RefreshCw size={13} className="spin" /> : <Download size={13} />}
            نسخة احتياطية للكروت (JSON)
          </button>

          <button
            onClick={handleDownloadCustomersBackup}
            disabled={downloadingCustomersBackup}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '9px',
              border: '1px solid var(--bdr-light)',
              backgroundColor: '#f8fafc',
              color: 'var(--txt-heading)',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {downloadingCustomersBackup ? <RefreshCw size={13} className="spin" /> : <Download size={13} />}
            نسخة احتياطية للعملاء (JSON)
          </button>

          <button
            onClick={() => navigate('/admin/customers')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '9px',
              border: '1px solid #bfdbfe',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Users size={13} /> إدارة العملاء CRM
          </button>
        </div>
      </div>

      {/* Recent Data Sections: Cards vs Customers Tab */}
      <div className="data-table-wrapper">
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1.5px solid var(--bdr-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('cards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'cards' ? '#ffffff' : 'transparent',
                color: activeTab === 'cards' ? 'var(--clr-primary-700)' : 'var(--txt-muted)',
                fontWeight: activeTab === 'cards' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'cards' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <CreditCard size={15} /> أحدث البطاقات ({recentCards.length})
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'customers' ? '#ffffff' : 'transparent',
                color: activeTab === 'customers' ? 'var(--clr-primary-700)' : 'var(--txt-muted)',
                fontWeight: activeTab === 'customers' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'customers' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Users size={15} /> أحدث العملاء ({recentCustomers.length})
            </button>
          </div>

          <Link
            to={activeTab === 'cards' ? '/admin/cards' : '/admin/customers'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--clr-primary-600)',
              textDecoration: 'none',
            }}
          >
            عرض الكل <ArrowLeft size={14} />
          </Link>
        </div>

        {/* Tab 1: Recent Cards Table */}
        {activeTab === 'cards' && (
          <>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '15px 20px', borderBottom: '1px solid var(--bg-subtle)' }}>
                  <div className="shimmer" style={{ height: '14px', width: '50%', marginBottom: '6px' }} />
                  <div className="shimmer" style={{ height: '11px', width: '30%' }} />
                </div>
              ))
            ) : recentCards.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: '14px' }}>
                لا توجد بطاقات مسجلة بعد
              </div>
            ) : (
              <div style={{ overflowX: 'auto', padding: '10px 4px' }}>
                <table className="premium-table" style={{ minWidth: '780px' }}>
                  <thead>
                    <tr>
                      <th>كود البطاقة</th>
                      <th>النشاط / العميل</th>
                      <th>النوع</th>
                      <th style={{ textAlign: 'center' }}>الحالة</th>
                      <th>تاريخ الإضافة</th>
                      <th style={{ textAlign: 'center' }}>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCards.map((card) => {
                      const customerName =
                        card.customer?.name || (typeof card.customer_id === 'object' ? card.customer_id?.name : null);

                      return (
                        <tr key={card._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '14px', color: 'var(--txt-heading)' }}>
                                {card.card_code}
                              </span>
                              {card.custom_slug && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    color: '#2563eb',
                                    backgroundColor: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                  }}
                                >
                                  /{card.custom_slug}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ fontSize: '13.5px', color: 'var(--txt-body)', fontWeight: 600 }}>
                            {customerName ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#1d4ed8', fontWeight: 700 }}>
                                <Users size={12} /> {customerName}
                              </span>
                            ) : card.business_data?.business_name ? (
                              card.business_data.business_name
                            ) : (
                              <span style={{ color: 'var(--txt-muted)', fontSize: '12px' }}>غير مربوط</span>
                            )}
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
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 12px',
                                borderRadius: '7px',
                                border: '1px solid var(--clr-primary-200)',
                                backgroundColor: 'var(--clr-primary-50)',
                                color: 'var(--clr-primary-700)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 700,
                                fontFamily: 'var(--font)',
                              }}
                            >
                              عرض
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Recent Customers Table */}
        {activeTab === 'customers' && (
          <>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '15px 20px', borderBottom: '1px solid var(--bg-subtle)' }}>
                  <div className="shimmer" style={{ height: '14px', width: '50%', marginBottom: '6px' }} />
                  <div className="shimmer" style={{ height: '11px', width: '30%' }} />
                </div>
              ))
            ) : recentCustomers.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--txt-muted)', fontSize: '14px' }}>
                لا يوجد عملاء مسجلين بعد. انقر على "إضافة عميل جديد" للبدء.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', padding: '10px 4px' }}>
                <table className="premium-table" style={{ minWidth: '780px' }}>
                  <thead>
                    <tr>
                      <th>اسم العميل / النشاط</th>
                      <th>رقم الهاتف</th>
                      <th>المحافظة / العنوان</th>
                      <th style={{ textAlign: 'center' }}>عدد الكروت المربوطة</th>
                      <th>تاريخ التسجيل</th>
                      <th style={{ textAlign: 'center' }}>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCustomers.map((cust) => (
                      <tr key={cust._id}>
                        <td style={{ fontWeight: 800, color: 'var(--txt-heading)', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                backgroundColor: '#f5f3ff',
                                color: '#7c3aed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '12px',
                              }}
                            >
                              {cust.name.slice(0, 1)}
                            </div>
                            <span>{cust.name}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--txt-body)', fontWeight: 600 }}>
                          {cust.phone}
                        </td>
                        <td style={{ fontSize: '12.5px', color: 'var(--txt-secondary)' }}>
                          {cust.city || cust.address || <span style={{ color: 'var(--txt-muted)' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              backgroundColor: (cust.total_cards || 0) > 0 ? '#eff6ff' : '#f1f5f9',
                              color: (cust.total_cards || 0) > 0 ? '#1d4ed8' : '#64748b',
                              fontWeight: 800,
                              fontSize: '12.5px',
                            }}
                          >
                            {cust.total_cards || 0} كارت
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--txt-secondary)' }}>
                          {fmtDate(cust.createdAt)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => navigate(`/admin/customers/${cust._id}`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 12px',
                              borderRadius: '7px',
                              border: '1px solid #ddd6fe',
                              backgroundColor: '#f5f3ff',
                              color: '#7c3aed',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 700,
                              fontFamily: 'var(--font)',
                            }}
                          >
                            التفاصيل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewPage;
