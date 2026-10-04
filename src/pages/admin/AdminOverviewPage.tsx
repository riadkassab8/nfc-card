/* ==========================================================================
   ADMIN OVERVIEW PAGE
   Loads real stats from GET /api/cards and GET /api/categories
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cardsApi, categoriesApi } from '../../services';
import { ApiCard, ApiCategory, CardStats, fmtDate, isSubscriptionExpired } from '../../types';
import {
  CreditCard, Tags, CheckCircle2, XCircle, RefreshCw,
  ArrowLeft, Plus, Scan, TrendingUp,
} from 'lucide-react';

// ── Stat card ─────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  loading?: boolean;
}> = ({ label, value, icon, color, bg, loading }) => (
  <div style={{
    backgroundColor: '#fff', borderRadius: '16px', padding: '20px 22px',
    border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
    display: 'flex', alignItems: 'center', gap: '16px',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      backgroundColor: bg, color, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      {loading
        ? <div style={{ width: '56px', height: '28px', borderRadius: '8px', background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% auto', animation: 'shimmer 1.4s linear infinite' }} />
        : <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</div>}
    </div>
  </div>
);

// ── Card type badge ────────────────────────────────────────────────────────
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, string> = {
    'Google Review': '#3b82f6',
    'Instagram':     '#e1306c',
    'TikTok':        '#010101',
    'InstaPay':      '#8b5cf6',
    'Google Maps':   '#ea4335',
    'WhatsApp':      '#22c55e',
    'Social Page':   '#6366f1',
  };
  const color = map[type] || '#64748b';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '99px',
      fontSize: '0.72rem', fontWeight: 700,
      backgroundColor: color + '18', color, border: `1px solid ${color}33`,
    }}>
      {type}
    </span>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
export const AdminOverviewPage: React.FC = () => {
  const [cards, setCards]           = useState<ApiCard[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [stats, setStats]           = useState<CardStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cardsRes, catsRes] = await Promise.all([
        cardsApi.getCards({ limit: 100 }),
        categoriesApi.getCategories({ limit: 100 }),
      ]);
      const all = cardsRes.data ?? [];
      setCards(all);
      setCategories(catsRes.data ?? []);
      setStats({
        total:    cardsRes.total,
        active:   all.filter((c) => c.status === 'active').length,
        inactive: all.filter((c) => c.status === 'inactive').length,
      });
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const recentCards = [...cards].slice(0, 8);
  const expiredCount = cards.filter(isSubscriptionExpired).length;

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Cairo, sans-serif' }}>

      {/* ── Hero banner ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#1e2d4a 55%,#312e81 100%)',
        borderRadius: '20px', padding: '24px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px',
        boxShadow: '0 10px 32px -5px rgba(15,23,42,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ zIndex: 1 }}>
          <span style={{ display: 'inline-block', marginBottom: '10px', backgroundColor: 'rgba(99,102,241,0.22)', color: '#a5b4fc', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)' }}>
            لوحة الإدارة
          </span>
          <h2 style={{ fontSize: 'clamp(1.2rem,4vw,1.6rem)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            نظرة عامة على النظام
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            إحصائيات مباشرة من قاعدة البيانات — آخر تحديث الآن
          </p>
        </div>
        <div style={{ zIndex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/cards">
            <button style={btnStyle('#fff', '#0f172a')}>
              <CreditCard size={16} /> إدارة البطاقات
            </button>
          </Link>
          <Link to="/admin/scan">
            <button style={btnStyle('linear-gradient(135deg,#6366f1,#8b5cf6)', '#fff')}>
              <Scan size={16} /> فحص بطاقة
            </button>
          </Link>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '16px 20px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <XCircle size={20} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', display: 'flex', gap: '5px', alignItems: 'center', fontWeight: 700, fontFamily: 'Cairo, sans-serif', fontSize: '0.875rem' }}>
            <RefreshCw size={15} /> إعادة المحاولة
          </button>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
        <StatCard label="إجمالي البطاقات"  value={stats.total}            icon={<CreditCard size={22} />} color="#6366f1" bg="#eef2ff" loading={loading} />
        <StatCard label="بطاقات نشطة"      value={stats.active}           icon={<CheckCircle2 size={22} />} color="#10b981" bg="#ecfdf5" loading={loading} />
        <StatCard label="بطاقات معطلة"     value={stats.inactive}         icon={<XCircle size={22} />}      color="#ef4444" bg="#fef2f2" loading={loading} />
        <StatCard label="التصنيفات"         value={categories.length}     icon={<Tags size={22} />}          color="#f59e0b" bg="#fffbeb" loading={loading} />
        <StatCard label="منتهية الاشتراك"  value={expiredCount}           icon={<TrendingUp size={22} />}   color="#dc2626" bg="#fff1f2" loading={loading} />
      </div>

      {/* ── Two column: recent cards + categories ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '20px' }}>

        {/* Recent cards */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>آخر البطاقات</h3>
            <Link to="/admin/cards" style={{ textDecoration: 'none', color: '#6366f1', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              عرض الكل <ArrowLeft size={14} />
            </Link>
          </div>
          <div>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ height: '16px', width: '60%', borderRadius: '6px', ...shimmer }} />
                    <div style={{ height: '12px', width: '40%', borderRadius: '6px', marginTop: '8px', ...shimmer }} />
                  </div>
                ))
              : recentCards.length === 0
              ? <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>لا توجد بطاقات</div>
              : recentCards.map((card) => (
                  <div key={card._id} style={{
                    padding: '12px 20px', borderBottom: '1px solid #f8fafc',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                        {card.card_code}
                        {card.business_data?.business_name && (
                          <span style={{ marginRight: '8px', fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                            — {card.business_data.business_name}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fmtDate(card.createdAt)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <TypeBadge type={card.card_type} />
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px', borderRadius: '99px',
                        backgroundColor: card.status === 'active' ? '#d1fae5' : '#fee2e2',
                        color: card.status === 'active' ? '#047857' : '#dc2626',
                      }}>
                        {card.status === 'active' ? 'نشطة' : 'معطلة'}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Categories list */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>التصنيفات</h3>
            <Link to="/admin/categories" style={{ textDecoration: 'none', color: '#6366f1', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              إدارة <ArrowLeft size={14} />
            </Link>
          </div>
          <div>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ height: '16px', width: '50%', borderRadius: '6px', ...shimmer }} />
                  </div>
                ))
              : categories.length === 0
              ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Tags size={32} style={{ marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>لا توجد تصنيفات</p>
                    <Link to="/admin/categories">
                      <button style={{ marginTop: '14px', padding: '8px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={15} /> إضافة تصنيف
                      </button>
                    </Link>
                  </div>
                )
              : categories.map((cat) => (
                  <div key={cat._id} style={{
                    padding: '12px 20px', borderBottom: '1px solid #f8fafc',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {cat.icon
                        ? <img src={cat.icon} alt={cat.name} style={{ width: '30px', height: '30px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        : <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Tags size={15} style={{ color: '#94a3b8' }} /></div>}
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{cat.name}</span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                      backgroundColor: cat.is_active ? '#d1fae5' : '#fee2e2',
                      color: cat.is_active ? '#047857' : '#dc2626',
                    }}>
                      {cat.is_active ? 'مفعل' : 'معطل'}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Small style helpers ────────────────────────────────────────────────────
const btnStyle = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '7px',
  padding: '9px 18px', borderRadius: '10px', border: 'none',
  cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
  fontWeight: 700, fontSize: '0.875rem',
  background: bg, color,
  boxShadow: color === '#fff' ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
});

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
  backgroundSize: '200% auto',
  animation: 'shimmer 1.4s linear infinite',
};

export default AdminOverviewPage;
