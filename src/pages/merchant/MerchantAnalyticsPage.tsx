/* ==========================================================================
   MERCHANT ANALYTICS PAGE  /merchant/analytics
   Dedicated analytics for the store owner.
   Only queries cards assigned to this merchant.
   Zero partner information displayed.
   ========================================================================== */

import React, { useEffect, useState, useCallback } from 'react';
import { cardsApi } from '../../services';
import { ApiCard, ApiCardAnalytics, ScanByDay, ScanByDevice, ScanByBrowser } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart2, RefreshCw, TrendingUp, Smartphone, Monitor, Tablet,
  CreditCard, Eye, Calendar, Sparkles, Filter
} from 'lucide-react';

const DAYS_OPTIONS = [7, 14, 30, 60, 90];

/* ── Horizontal bar list ──────────────────────────────────────────── */
const BarList: React.FC<{ items: { label: string; count: number }[]; color: string }> = ({ items, color }) => {
  const max = Math.max(...items.map(i => i.count), 1);
  if (!items.length) {
    return (
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
        لا توجد مسحات مسجلة حتى الآن
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ minWidth: '95px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textAlign: 'right' }}>
            {item.label}
          </span>
          <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '6px', height: '16px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: '6px',
                width: `${(item.count / max) * 100}%`,
                backgroundColor: color,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <span style={{ minWidth: '40px', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textAlign: 'left' }}>
            {item.count.toLocaleString('ar-EG')}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Stat tile ─────────────────────────────────────────────────────── */
const Tile: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  loading?: boolean;
}> = ({ label, value, icon, color, bg, border, loading }) => (
  <div
    style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '18px 20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
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
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
        {label}
      </div>
      {loading ? (
        <div style={{ width: '60px', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
      ) : (
        <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
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
  if (!recent.length) {
    return (
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
        لا توجد زيارات مسجلة خلال هذه الفترة
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '110px', padding: '10px 0' }}>
      {recent.map(d => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count} مسحة`}
          style={{
            flex: 1,
            minWidth: '6px',
            height: `${Math.max(4, (d.count / max) * 100)}px`,
            background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.3s ease',
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  );
};

export const MerchantAnalyticsPage: React.FC = () => {
  const { admin } = useAuth();
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [days, setDays] = useState<number>(30);
  const [analytics, setAnalytics] = useState<ApiCardAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCards, setLoadingCards] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cards
  useEffect(() => {
    const fetchCards = async () => {
      setLoadingCards(true);
      try {
        const res = await cardsApi.getCards({ limit: 100 });
        const list = res.data || [];
        setCards(list);
        if (list.length > 0 && !selectedCardId) {
          setSelectedCardId(list[0]._id);
        }
      } catch (err: any) {
        setError(err?.message || 'فشل في تحميل البطاقات');
      } finally {
        setLoadingCards(false);
      }
    };
    fetchCards();
  }, []);

  // Fetch single card analytics
  const fetchAnalytics = useCallback(async () => {
    if (!selectedCardId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cardsApi.getCardAnalytics(selectedCardId, days);
      setAnalytics(data);
    } catch (err: any) {
      setError(err?.message || 'فشل في جلب إحصائيات البطاقة');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCardId, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const selectedCard = cards.find(c => c._id === selectedCardId);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.15)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Sparkles size={13} />
              إحصائيات وزوار المتجر
            </span>
            <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
              {admin?.store_name || admin?.name}
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900 }}>
            تتبع أداء المسح والزيارات اليومية
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '0.86rem' }}>
            شاهد في الوقت الفعلي عدد الزبائن الذين مسحوا بطاقات NFC ورموز QR الخاصة بمتجرك.
          </p>
        </div>

        {/* Controls: Card Selector + Days Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {cards.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '12px' }}>
              <Filter size={16} />
              <select
                value={selectedCardId}
                onChange={e => setSelectedCardId(e.target.value)}
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  outline: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {cards.map(c => (
                  <option key={c._id} value={c._id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                    {c.business_data?.business_name || c.card_code}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Days picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '12px' }}>
            <Calendar size={16} />
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              style={{
                background: 'transparent',
                color: '#ffffff',
                border: 'none',
                outline: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {DAYS_OPTIONS.map(d => (
                <option key={d} value={d} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                  آخر {d} يوم
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#065f46',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            تحديث
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '14px',
            padding: '14px 18px',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      {loadingCards ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          جاري تحميل بيانات البطاقات...
        </div>
      ) : cards.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <CreditCard size={48} color="#94a3b8" style={{ marginBottom: '14px' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
            لا توجد بطاقات مسندة لحسابك حتى الآن
          </h3>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            تواصل مع إدارة النظام لتفعيل وربط بطاقة متجرك الذكية.
          </p>
        </div>
      ) : (
        <>
          {/* Card Title & Meta Info */}
          {selectedCard && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    fontWeight: 900,
                  }}
                >
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedCard.business_data?.business_name || 'بطاقة المتجر'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                    كود البطاقة: {selectedCard.card_code}
                  </div>
                </div>
              </div>

              <a
                href={`${window.location.origin}/social/${selectedCard.custom_slug || selectedCard.card_code}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Eye size={14} color="#059669" />
                معاينة صفحة البطاقة
              </a>
            </div>
          )}

          {/* KPI Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <Tile
              label="إجمالي المسحات الكلية"
              value={analytics?.total_scans ?? 0}
              icon={<BarChart2 size={22} />}
              color="#059669"
              bg="#ecfdf5"
              border="#a7f3d0"
              loading={loading}
            />
            <Tile
              label={`مسحات آخر ${days} يوم`}
              value={analytics?.scans_last_N_days ?? 0}
              icon={<TrendingUp size={22} />}
              color="#2563eb"
              bg="#eff6ff"
              border="#bfdbfe"
              loading={loading}
            />
            <Tile
              label="نوع الجهاز الأكثر استخداماً"
              value={analytics?.scans_by_device?.[0]?.device_type || 'الهاتف'}
              icon={<Smartphone size={22} />}
              color="#7c3aed"
              bg="#f5f3ff"
              border="#ddd6fe"
              loading={loading}
            />
          </div>

          {/* Charts & Distributions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Daily visits */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                المسح اليومي (آخر 30 يوم)
              </h3>
              {loading ? (
                <div style={{ height: '110px', backgroundColor: '#f1f5f9', borderRadius: '8px' }} />
              ) : (
                <DayChart data={analytics?.scans_by_day ?? []} />
              )}
            </div>

            {/* Device breakdown */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                توزيع أجهزة الزوار
              </h3>
              {loading ? (
                <div style={{ height: '90px', backgroundColor: '#f1f5f9', borderRadius: '8px' }} />
              ) : (
                <BarList
                  items={(analytics?.scans_by_device ?? []).map((d: ScanByDevice) => ({
                    label: d.device_type === 'mobile' ? 'الهاتف الذكي' : d.device_type === 'desktop' ? 'الكمبيوتر' : d.device_type,
                    count: d.count,
                  }))}
                  color="#10b981"
                />
              )}
            </div>

            {/* Browser breakdown */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                المتصفحات المستخدمة
              </h3>
              {loading ? (
                <div style={{ height: '90px', backgroundColor: '#f1f5f9', borderRadius: '8px' }} />
              ) : (
                <BarList
                  items={(analytics?.scans_by_browser ?? []).map((b: ScanByBrowser) => ({
                    label: b.browser,
                    count: b.count,
                  }))}
                  color="#3b82f6"
                />
              )}
            </div>
          </div>

          {/* Recent Scans Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              أحدث المسحات وزيارات العملاء
            </h3>
            {loading ? (
              <div style={{ height: '120px', backgroundColor: '#f1f5f9', borderRadius: '8px' }} />
            ) : !analytics?.recent_scans?.length ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
                لا توجد مسحات حديثة
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
                      <th style={{ padding: '12px 14px' }}>وقت الزيارة</th>
                      <th style={{ padding: '12px 14px' }}>نوع الجهاز</th>
                      <th style={{ padding: '12px 14px' }}>المتصفح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recent_scans.slice(0, 10).map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                          {new Date(s.timestamp).toLocaleString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: '#0f172a',
                            }}
                          >
                            {s.device_type === 'mobile' ? (
                              <Smartphone size={15} color="#059669" />
                            ) : s.device_type === 'tablet' ? (
                              <Tablet size={15} color="#7c3aed" />
                            ) : (
                              <Monitor size={15} color="#2563eb" />
                            )}
                            {s.device_type === 'mobile' ? 'هاتف' : s.device_type === 'tablet' ? 'جهاز لوحي' : 'كمبيوتر'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                          {s.browser}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
