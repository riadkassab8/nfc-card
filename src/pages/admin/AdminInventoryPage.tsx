/* ==========================================================================
   ADMIN INVENTORY PAGE — Full card management
   GET /api/cards, toggle, renew, delete, search, filter, bulk actions
   ========================================================================== */

import React, { useEffect, useState, useCallback } from 'react';
import { cardsApi, categoriesApi } from '../../services';
import { ApiCard, ApiCategory, CardStats, fmtDate, isSubscriptionExpired, getPopulatedCategory, CARD_TYPES } from '../../types';
import { CardDetailsDrawer } from '../../components/admin/CardDetailsDrawer';
import { BatchGenerateCardsModal } from '../../components/admin/BatchGenerateCardsModal';
import {
  Plus, Search, RefreshCw, CreditCard, CheckCircle2, XCircle,
  Power, Trash2, Eye, Download, Copy, Check,
  AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ── Toast ─────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';
const Toast: React.FC<{ msg: string; type: ToastType; onClose: () => void }> = ({ msg, type, onClose }) => {
  const colors: Record<ToastType, { bg: string; border: string; text: string }> = {
    success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  };
  const c = colors[type];
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', top: '24px', insetInlineEnd: '24px', zIndex: 1200,
      backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: '12px', padding: '14px 18px', fontWeight: 700,
      boxShadow: '0 10px 28px rgba(15,23,42,0.12)', maxWidth: '380px',
      fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, fontSize: '1rem', padding: '0 2px' }}>✕</button>
    </div>
  );
};

// ── Confirm dialog ────────────────────────────────────────────────────────
const Confirm: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void; busy?: boolean }> = ({ message, onConfirm, onCancel, busy }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 1100, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
    <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', fontFamily: 'Cairo, sans-serif' }}>
      <AlertTriangle size={36} style={{ color: '#ef4444', marginBottom: '16px' }} />
      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} disabled={busy} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>إلغاء</button>
        <button onClick={onConfirm} disabled={busy} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, opacity: busy ? 0.7 : 1 }}>
          {busy ? 'جاري الحذف...' : 'تأكيد الحذف'}
        </button>
      </div>
    </div>
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
    backgroundColor: status === 'active' ? '#d1fae5' : '#fee2e2',
    color: status === 'active' ? '#047857' : '#dc2626',
  }}>
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
    {status === 'active' ? 'نشطة' : 'معطلة'}
  </span>
);

// ── Main ──────────────────────────────────────────────────────────────────
export const AdminInventoryPage: React.FC = () => {
  const [cards, setCards]             = useState<ApiCard[]>([]);
  const [categories, setCategories]   = useState<ApiCategory[]>([]);
  const [stats, setStats]             = useState<CardStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Filters
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter]   = useState('');
  const [catFilter, setCatFilter]     = useState('');

  // Pagination
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalItems, setTotalItems]   = useState(0);
  const LIMIT = 20;

  // Selection
  const [selected, setSelected]       = useState<Set<string>>(new Set());

  // Drawers / modals
  const [drawerCard, setDrawerCard]   = useState<ApiCard | null>(null);
  const [batchOpen, setBatchOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiCard | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast]             = useState<{ msg: string; type: ToastType } | null>(null);
  const [copiedId, setCopiedId]       = useState<string | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────
  const fetchCards = useCallback(async (pg = page) => {
    setLoading(true);
    setError(null);
    try {
      const [cardsRes, catsRes] = await Promise.all([
        cardsApi.getCards({
          page: pg, limit: LIMIT,
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          card_type: typeFilter || undefined,
          category_id: catFilter || undefined,
        }),
        categoriesApi.getCategories({ limit: 100 }),
      ]);
      setCards(cardsRes.data ?? []);
      setTotalPages(cardsRes.totalPages ?? 1);
      setTotalItems(cardsRes.total ?? 0);
      setCategories(catsRes.data ?? []);
      setStats({
        total:    cardsRes.total,
        active:   (cardsRes.data ?? []).filter((c) => c.status === 'active').length,
        inactive: (cardsRes.data ?? []).filter((c) => c.status === 'inactive').length,
      });
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل البطاقات');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, catFilter, page]);

  useEffect(() => {
    setPage(1);
    fetchCards(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter, catFilter]);

  useEffect(() => {
    fetchCards(page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── actions ────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: ToastType = 'success') => setToast({ msg, type });

  const handleToggle = async (card: ApiCard) => {
    try {
      await cardsApi.toggleCard(card._id);
      showToast(card.status === 'active' ? `🔴 تم تعطيل ${card.card_code}` : `🟢 تم تفعيل ${card.card_code}`);
      fetchCards();
    } catch (err: any) {
      showToast(err?.message || 'فشل تغيير الحالة', 'error');
    }
  };

  // Renew is available inside CardDetailsDrawer per-card

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await cardsApi.deleteCard(deleteTarget._id);
      showToast(`🗑️ تم حذف ${deleteTarget.card_code}`);
      setDeleteTarget(null);
      setDrawerCard(null);
      fetchCards();
    } catch (err: any) {
      showToast(err?.message || 'فشل الحذف', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const downloadQR = async (card: ApiCard) => {
    try {
      const blob = await cardsApi.getCardQrBlob(card._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `qr-${card.card_code}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch {
      showToast('فشل تحميل QR', 'error');
    }
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bulk
  const allSelected = cards.length > 0 && cards.every((c) => selected.has(c._id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(cards.map((c) => c._id)));
  const toggleOne = (id: string) => setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const bulkToggle = async (targetStatus: 'active' | 'inactive') => {
    const toChange = cards.filter((c) => selected.has(c._id) && c.status !== targetStatus);
    await Promise.allSettled(toChange.map((c) => cardsApi.toggleCard(c._id)));
    showToast(`تم تحديث ${toChange.length} بطاقة`);
    setSelected(new Set());
    fetchCards();
  };

  const bulkDelete = async () => {
    await Promise.allSettled([...selected].map((id) => cardsApi.deleteCard(id)));
    showToast(`🗑️ تم حذف ${selected.size} بطاقة`);
    setSelected(new Set());
    fetchCards();
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Cairo, sans-serif' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <Confirm
          message={`هل أنت متأكد من حذف البطاقة "${deleteTarget.card_code}"؟ سيتم حفظ نسخة احتياطية.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleteLoading}
        />
      )}

      {/* Drawer */}
      <CardDetailsDrawer
        card={drawerCard}
        categories={categories}
        onClose={() => setDrawerCard(null)}
        onUpdated={() => { fetchCards(); setDrawerCard(null); }}
        onDeleted={(id) => { if (drawerCard?._id === id) setDrawerCard(null); fetchCards(); }}
        onToast={showToast}
      />

      {/* Batch modal */}
      {batchOpen && (
        <BatchGenerateCardsModal
          categories={categories}
          onClose={() => setBatchOpen(false)}
          onCreated={() => { setBatchOpen(false); fetchCards(); showToast('✅ تم إنشاء البطاقات بنجاح'); }}
        />
      )}

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#1e2d4a 55%,#312e81 100%)',
        borderRadius: '20px', padding: '22px 26px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '14px',
        boxShadow: '0 10px 32px -5px rgba(15,23,42,0.3)',
      }}>
        <div>
          <span style={{ display: 'inline-block', marginBottom: '8px', backgroundColor: 'rgba(99,102,241,0.22)', color: '#a5b4fc', padding: '2px 11px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)' }}>
            المخزون
          </span>
          <h2 style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            إدارة البطاقات
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
            إجمالي: <strong style={{ color: '#fff' }}>{totalItems}</strong> بطاقة
          </p>
        </div>
        <button
          onClick={() => setBatchOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: '0.9375rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
        >
          <Plus size={20} /> إنشاء بطاقة جديدة
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
        {[
          { label: 'الإجمالي',   value: totalItems,       color: '#6366f1', bg: '#eef2ff' },
          { label: 'نشطة',       value: stats.active,     color: '#10b981', bg: '#ecfdf5' },
          { label: 'معطلة',      value: stats.inactive,   color: '#ef4444', bg: '#fef2f2' },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px 18px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بكود البطاقة، NFC، أو الاسم..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 36px 9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif', outline: 'none' }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value as any)} style={selectStyle}>
          <option value="all">كل الحالات</option>
          <option value="active">نشطة فقط</option>
          <option value="inactive">معطلة فقط</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="">كل الأنواع</option>
          {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={selectStyle}>
          <option value="">كل التصنيفات</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button onClick={() => fetchCards()} title="تحديث" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.8125rem' }}>
          <RefreshCw size={15} /> تحديث
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.875rem' }}>تم تحديد {selected.size} بطاقة</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginInlineStart: 'auto' }}>
            <button onClick={() => bulkToggle('active')} style={bulkBtn('#d1fae5', '#047857')}>
              <CheckCircle2 size={14} /> تفعيل الكل
            </button>
            <button onClick={() => bulkToggle('inactive')} style={bulkBtn('#fee2e2', '#dc2626')}>
              <XCircle size={14} /> تعطيل الكل
            </button>
            <button onClick={bulkDelete} style={bulkBtn('#fee2e2', '#dc2626')}>
              <Trash2 size={14} /> حذف الكل
            </button>
            <button onClick={() => setSelected(new Set())} style={bulkBtn('#f1f5f9', '#475569')}>
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '16px 20px', color: '#991b1b', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <XCircle size={20} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button onClick={() => fetchCards()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700, display: 'flex', gap: '5px', alignItems: 'center', fontFamily: 'Cairo, sans-serif' }}>
            <RefreshCw size={15} /> إعادة المحاولة
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Cairo, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={th}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: 'pointer' }} />
                </th>
                <th style={{ ...th, textAlign: 'right' }}>الكارت</th>
                <th style={{ ...th, textAlign: 'right' }}>النوع</th>
                <th style={{ ...th, textAlign: 'right' }}>النشاط التجاري</th>
                <th style={{ ...th, textAlign: 'right' }}>التصنيف</th>
                <th style={{ ...th, textAlign: 'right' }}>الحالة</th>
                <th style={{ ...th, textAlign: 'right' }}>الاشتراك</th>
                <th style={{ ...th, textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} style={{ padding: '14px 12px' }}>
                          <div style={{ height: '14px', borderRadius: '6px', width: j === 0 ? '20px' : '80%', ...shimmerStyle }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : cards.length === 0
                ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '56px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        <CreditCard size={40} style={{ marginBottom: '12px' }} />
                        <p style={{ margin: 0, fontWeight: 700 }}>لا توجد بطاقات مطابقة</p>
                      </td>
                    </tr>
                  )
                : cards.map((card) => {
                    const cat = getPopulatedCategory(card.category_id);
                    const expired = isSubscriptionExpired(card);
                    const isSelected = selected.has(card._id);
                    return (
                      <tr
                        key={card._id}
                        style={{ borderBottom: '1px solid #f8fafc', backgroundColor: isSelected ? '#f0f4ff' : '#fff', transition: 'background 120ms' }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#fafbff'; }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '12px 12px', textAlign: 'center', width: '40px' }}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleOne(card._id)} style={{ cursor: 'pointer' }} />
                        </td>

                        {/* Card code */}
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a', fontFamily: 'monospace' }}>
                            {card.card_code}
                          </div>
                          {card.nfc_uid && (
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                              {card.nfc_uid}
                            </div>
                          )}
                        </td>

                        {/* Type */}
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 9px', borderRadius: '99px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                            {card.card_type}
                          </span>
                        </td>

                        {/* Business */}
                        <td style={{ padding: '12px 12px', maxWidth: '160px' }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {card.business_data?.business_name || <span style={{ color: '#cbd5e1' }}>—</span>}
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {cat?.name || <span style={{ color: '#cbd5e1' }}>—</span>}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 12px' }}>
                          <StatusBadge status={card.status} />
                        </td>

                        {/* Subscription */}
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontSize: '0.75rem', color: expired ? '#dc2626' : '#64748b', fontWeight: expired ? 700 : 400 }}>
                            {expired ? '⚠️ منتهية' : fmtDate(card.subscription_end_date)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <ActionBtn title="عرض التفاصيل" color="#6366f1" onClick={() => setDrawerCard(card)}><Eye size={15} /></ActionBtn>
                            <ActionBtn title="نسخ الكود" color={copiedId === card._id ? '#10b981' : '#64748b'} onClick={() => copy(card.card_code, card._id)}>
                              {copiedId === card._id ? <Check size={15} /> : <Copy size={15} />}
                            </ActionBtn>
                            <ActionBtn title="تحميل QR" color="#0ea5e9" onClick={() => downloadQR(card)}><Download size={15} /></ActionBtn>
                            <ActionBtn title={card.status === 'active' ? 'تعطيل' : 'تفعيل'} color={card.status === 'active' ? '#f59e0b' : '#10b981'} onClick={() => handleToggle(card)}><Power size={15} /></ActionBtn>
                            <ActionBtn title="حذف" color="#ef4444" onClick={() => setDeleteTarget(card)}><Trash2 size={15} /></ActionBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
              صفحة {page} من {totalPages} — {totalItems} نتيجة
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>
                <ChevronRight size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)} style={{ ...pageBtn, backgroundColor: pg === page ? '#6366f1' : '#f8fafc', color: pg === page ? '#fff' : '#334155', borderColor: pg === page ? '#6366f1' : '#e2e8f0' }}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtn}>
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Style helpers ──────────────────────────────────────────────────────────
const ActionBtn: React.FC<{ title: string; color: string; onClick: () => void; children: React.ReactNode }> = ({ title, color, onClick, children }) => (
  <button title={title} onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', border: `1.5px solid ${color}33`, backgroundColor: `${color}10`, color, cursor: 'pointer', transition: 'all 120ms', flexShrink: 0 }}>
    {children}
  </button>
);

const th: React.CSSProperties = {
  padding: '11px 12px', fontSize: '0.72rem', fontWeight: 700,
  color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
};

const selectStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0',
  fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif', color: '#334155',
  backgroundColor: '#f8fafc', cursor: 'pointer', outline: 'none',
};

const bulkBtn = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '7px 13px', borderRadius: '8px', border: 'none',
  backgroundColor: bg, color, cursor: 'pointer',
  fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.8125rem',
});

const pageBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '32px', height: '32px', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc',
  color: '#334155', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700,
};

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
  backgroundSize: '200% auto',
  animation: 'shimmer 1.4s linear infinite',
};

export default AdminInventoryPage;
