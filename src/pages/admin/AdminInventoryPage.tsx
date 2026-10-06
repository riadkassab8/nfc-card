import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cardsApi, categoriesApi } from '../../services';
import {
  ApiCard, ApiCategory, isSubscriptionExpired,
  getPopulatedCategory, CARD_TYPES,
} from '../../types';
import { CardDetailsDrawer } from '../../components/admin/CardDetailsDrawer';
import { BatchGenerateCardsModal } from '../../components/admin/BatchGenerateCardsModal';
import { BulkAssignCustomerModal } from '../../components/admin/BulkAssignCustomerModal';
import {
  Plus, Search, RefreshCw, CreditCard, CheckCircle2, XCircle,
  Power, Trash2, Eye, Download, FileDown, Layers, Copy,
  AlertTriangle, ChevronLeft, ChevronRight, TrendingUp, Link as LinkIcon,
  MoreVertical, UserCheck,
} from 'lucide-react';


type ToastType = 'success' | 'error' | 'info';

/* ── Toast ─────────────────────────────────────────────────────── */
const Toast: React.FC<{ msg: string; type: ToastType; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => {
    const duration = type === 'error' ? 6000 : 3500;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, type]);
  const cls = type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info';
  return (
    <div className={`toast ${cls}`} style={{ maxWidth: '480px', lineHeight: 1.5 }}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem', padding: '0 2px' }}>✕</button>
    </div>
  );
};


/* ── Confirm ────────────────────────────────────────────────────── */
const Confirm: React.FC<{ msg: string; onConfirm: () => void; onCancel: () => void; busy?: boolean }> = ({ msg, onConfirm, onCancel, busy }) => (
  <div className="modal-overlay" style={{ zIndex: 1100 }}>
    <div style={{
      background: 'var(--bg-white)', borderRadius: 'var(--r-2xl)',
      padding: '28px', maxWidth: '420px', width: '100%',
      boxShadow: 'var(--shadow-xl)', fontFamily: 'var(--font)',
      animation: 'modalIn 220ms var(--ease-out) both',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '22px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--clr-error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={20} style={{ color: 'var(--clr-error)' }} />
        </div>
        <p style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--txt-body)', margin: 0, lineHeight: 1.6 }}>{msg}</p>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} className="btn-outline" disabled={busy}>إلغاء</button>
        <button onClick={onConfirm} disabled={busy} style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          padding: '9px 18px', borderRadius: 'var(--r-md)', border: 'none',
          backgroundColor: 'var(--clr-error)', color: '#fff', cursor: busy ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font)', fontWeight: 700, fontSize: 'var(--fs-base)',
          opacity: busy ? 0.7 : 1,
        }}>
          {busy ? <><RefreshCw size={14} className="spin" /> حذف...</> : 'تأكيد الحذف'}
        </button>
      </div>
    </div>
  </div>
);

/* ── Clone Card Modal ───────────────────────────────────────────── */
const CloneCardModal: React.FC<{
  card: ApiCard;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (m: string, t?: ToastType) => void;
}> = ({ card, onClose, onSuccess, onToast }) => {
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClone = async () => {
    const trimmed = newCode.trim().toUpperCase();
    if (!trimmed) {
      setError('يرجى إدخال كود الكارت الجديد');
      return;
    }
    if (!/^CARD-\d{4,}$/.test(trimmed)) {
      setError('كود الكارت يجب أن يبدأ بـ CARD- متبوعاً بـ 4 أرقام على الأقل (مثال: CARD-0099)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await cardsApi.cloneCard(card._id, { new_card_code: trimmed });
      onToast('تم نسخ الكارت بنجاح ✓', 'success');
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'فشل نسخ الكارت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div style={{
        background: 'var(--bg-white)', borderRadius: 'var(--r-2xl)',
        padding: '28px', maxWidth: '440px', width: '100%',
        boxShadow: 'var(--shadow-xl)', fontFamily: 'var(--font)',
        animation: 'modalIn 220ms var(--ease-out) both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--clr-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--clr-primary-600)' }}>
            <Copy size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--txt-heading)' }}>
              نسخ الكارت ({card.card_code})
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>
              سيتم إنشاء كارت متطابق ببيانات جديدة واشتراك مستقل
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)',
            borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: '16px',
            color: 'var(--clr-error)', fontSize: 'var(--fs-xs)', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--txt-secondary)', marginBottom: '6px' }}>
            كود الكارت الجديد *
          </label>
          <input
            className="form-input"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            placeholder="مثال: CARD-0099"
            style={{ width: '100%', fontFamily: 'monospace', fontSize: 'var(--fs-sm)' }}
            disabled={loading}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-outline" disabled={loading}>
            إلغاء
          </button>
          <button
            onClick={handleClone}
            disabled={loading}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}
          >
            {loading ? <><RefreshCw size={14} className="spin" /> جاري النسخ...</> : <><Copy size={14} /> نسخ الكارت</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────────────── */
export const AdminInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentTotal, setCurrentTotal] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalActive, setGlobalActive] = useState(0);
  const [globalInactive, setGlobalInactive] = useState(0);
  const [globalExpired, setGlobalExpired] = useState(0);

  const getDurationText = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    let m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (e.getDate() < s.getDate()) m--; // adjust for partial month
    if (m < 1) return 'أقل من شهر';
    if (m === 12) return 'سنة واحدة';
    if (m === 24) return 'سنتين';
    if (m % 12 === 0 && m <= 120) return `${m / 12} سنوات`;
    return `${m} شهر`;
  };

  const [searchParams] = useSearchParams();
  const initStatus = (searchParams.get('status') as any) || 'all';

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusF, setStatusF] = useState<'all' | 'active' | 'inactive' | 'expired'>(initStatus);
  const [typeF, setTypeF] = useState('');
  const [catF, setCatF] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerCard, setDrawerCard] = useState<ApiCard | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiCard | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [cloneTarget, setCloneTarget] = useState<ApiCard | null>(null);
  const [assignCustomerTarget, setAssignCustomerTarget] = useState<{ ids: string[]; codes: string[] } | null>(null);
  const [dropdownState, setDropdownState] = useState<{ id: string; top: number; left: number } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);



  const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: string) => {
    let dir: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.dir === 'asc') {
      dir = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.dir === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, dir });
  };

  const sortedCards = React.useMemo(() => {
    if (!sortConfig) return cards;
    return [...cards].sort((a, b) => {
      let aVal: any = ''; let bVal: any = '';
      switch (sortConfig.key) {
        case 'code': aVal = a.card_code; bVal = b.card_code; break;
        case 'type': aVal = a.card_type; bVal = b.card_type; break;
        case 'business': aVal = a.business_data?.business_name || ''; bVal = b.business_data?.business_name || ''; break;
        case 'category': aVal = getPopulatedCategory(a.category_id)?.name || ''; bVal = getPopulatedCategory(b.category_id)?.name || ''; break;
        case 'status': aVal = a.status; bVal = b.status; break;
        case 'sub': aVal = a.subscription_end_date ? new Date(a.subscription_end_date).getTime() : Infinity; bVal = b.subscription_end_date ? new Date(b.subscription_end_date).getTime() : Infinity; break;
      }
      if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [cards, sortConfig]);

  const showToast = (msg: string, type: ToastType = 'success') => setToast({ msg, type });

  const fetchCards = async (pg: number, currentLimit: number) => {
    setLoading(true); setError(null);
    try {
      const isExpiredFilter = statusF === 'expired';
      if (isExpiredFilter) {
        const allCards = await cardsApi.getAllCardsForStats({
          search: appliedSearch || undefined,
          card_type: typeF || undefined,
          category_id: catF || undefined,
        });
        const expiredCards = allCards.filter(c => (c.requires_subscription ?? true) && isSubscriptionExpired(c));
        const startIndex = (pg - 1) * currentLimit;
        const pagedCards = expiredCards.slice(startIndex, startIndex + currentLimit);
        setCards(pagedCards);
        setTotalPages(Math.ceil(expiredCards.length / currentLimit) || 1);
        setCurrentTotal(expiredCards.length);
      } else {
        const cr = await cardsApi.getCards({
          page: pg,
          limit: currentLimit,
          search: appliedSearch || undefined,
          status: statusF !== 'all' ? (statusF as any) : undefined,
          card_type: typeF || undefined,
          category_id: catF || undefined,
        });
        const rawCards = cr.data ?? [];
        setCards(rawCards);
        setTotalPages(cr.totalPages ?? 1);
        setCurrentTotal(cr.total ?? rawCards.length);
      }
    } catch (e: any) {
      setError(e?.message || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalStats = async () => {
    try {
      const [countTotal, countActive, countInactive, all] = await Promise.all([
        cardsApi.getCards({ limit: 1 }),
        cardsApi.getCards({ status: 'active', limit: 1 }),
        cardsApi.getCards({ status: 'inactive', limit: 1 }),
        cardsApi.getAllCardsForStats(),
      ]);

      const totalNum = countTotal.total ?? all.length;
      const activeNum = countActive.total ?? all.filter(c => c.status === 'active').length;
      const inactiveNum = countInactive.total ?? all.filter(c => c.status === 'inactive').length;
      const expiredNum = all.filter(c => (c.requires_subscription ?? true) && isSubscriptionExpired(c)).length;

      setGlobalTotal(totalNum);
      setGlobalActive(activeNum);
      setGlobalInactive(inactiveNum);
      setGlobalExpired(expiredNum);
    } catch (err) {
      console.error('Failed to load global stats:', err);
    }
  };

  useEffect(() => {
    categoriesApi.getCategories({ limit: 100 }).then(res => setCategories(res.data ?? [])).catch(() => { });
    loadGlobalStats();
  }, []);

  useEffect(() => {
    fetchCards(page, limit);
  }, [page, limit, appliedSearch, statusF, typeF, catF]);

  /* actions */
  const handleToggle = async (card: ApiCard) => {
    try {
      await cardsApi.toggleCard(card._id);
      showToast(card.status === 'active' ? `تم تعطيل ${card.card_code}` : `تم تفعيل ${card.card_code}`);
      fetchCards(page, limit);
      loadGlobalStats();
    } catch (e: any) { showToast(e?.message || 'فشل', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await cardsApi.deleteCard(deleteTarget._id);
      showToast(`تم حذف ${deleteTarget.card_code}`);
      setDeleteTarget(null);
      setDrawerCard(null);
      fetchCards(page, limit);
      loadGlobalStats();
    } catch (e: any) { showToast(e?.message || 'فشل الحذف', 'error'); }
    finally { setDeleteLoading(false); }
  };

  const downloadQR = async (card: ApiCard) => {
    try {
      const blob = await cardsApi.getCardQrBlob(card._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `qr-${card.card_code}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { showToast('فشل تحميل QR', 'error'); }
  };

  const downloadExcel = async () => {
    try {
      showToast('جاري تصدير Excel...', 'info');
      const blob = await cardsApi.exportCardsExcel({
        status: (statusF !== 'all' && statusF !== 'expired') ? (statusF as any) : undefined,
        card_type: typeF || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url; a.download = `cards-export-${date}.xlsx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      showToast('تم تصدير الملف بنجاح ✓');
    } catch (e: any) { showToast(e?.message || 'فشل التصدير', 'error'); }
  };


  const allSel = cards.length > 0 && cards.every(c => selected.has(c._id));
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(cards.map(c => c._id)));
  const toggleOne = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const bulkToggle = async (target: 'active' | 'inactive') => {
    const toChange = cards.filter(c => selected.has(c._id) && c.status !== target);
    await Promise.allSettled(toChange.map(c => cardsApi.toggleCard(c._id)));
    showToast(`تم تحديث ${toChange.length} بطاقة`);
    setSelected(new Set()); fetchCards(page, limit);
    loadGlobalStats();
  };

  const bulkDelete = async () => {
    await Promise.allSettled([...selected].map(id => cardsApi.deleteCard(id)));
    showToast(`تم حذف ${selected.size} بطاقة`);
    setSelected(new Set()); fetchCards(page, limit);
    loadGlobalStats();
  };

  /* ── select styles ── */
  const selStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 'var(--r-md)',
    border: '1.5px solid var(--bdr-light)',
    fontSize: 'var(--fs-sm)', fontFamily: 'var(--font)',
    color: 'var(--txt-body)', backgroundColor: 'var(--bg-white)',
    cursor: 'pointer', outline: 'none',
  };

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontFamily: 'var(--font)' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <Confirm
          msg={`هل تريد حذف البطاقة "${deleteTarget.card_code}"؟`}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} busy={deleteLoading}
        />
      )}

      {cloneTarget && (
        <CloneCardModal
          card={cloneTarget}
          onClose={() => setCloneTarget(null)}
          onSuccess={() => { fetchCards(page, limit); loadGlobalStats(); }}
          onToast={showToast}
        />
      )}

      {assignCustomerTarget && (
        <BulkAssignCustomerModal
          cardIds={assignCustomerTarget.ids}
          cardCodes={assignCustomerTarget.codes}
          onClose={() => setAssignCustomerTarget(null)}
          onSuccess={() => {
            setSelected(new Set());
            fetchCards(page, limit);
            loadGlobalStats();
          }}
          onToast={showToast}
        />
      )}

      <CardDetailsDrawer

        card={drawerCard} categories={categories}
        onClose={() => setDrawerCard(null)}
        onUpdated={() => { fetchCards(page, limit); setDrawerCard(null); }}
        onDeleted={(id) => { if (drawerCard?._id === id) setDrawerCard(null); fetchCards(page, limit); }}
        onToast={showToast}
      />

      {batchOpen && (
        <BatchGenerateCardsModal
          categories={categories}
          onClose={() => setBatchOpen(false)}
          onCreated={() => { setBatchOpen(false); setPage(1); fetchCards(1, limit); loadGlobalStats(); showToast('تم إنشاء البطاقات بنجاح'); }}
        />
      )}

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
        {/* Subtle decorative background shapes */}
        <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', right: '25%', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', pointerEvents: 'none' }} />

        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.12)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#93c5fd' }}>
            <span>لوحة إدارة المخزون</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px', color: '#fff' }}>إدارة بطاقات NFC</h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
            إجمالي البطاقات المسجلة بالمنظومة: <strong style={{ color: '#38bdf8', fontWeight: 800 }}>{globalTotal}</strong> بطاقة
          </p>
        </div>

        <div style={{ zIndex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="hero-action-btn" onClick={downloadExcel} title="تصدير Excel بحسب الفلاتر الحالية">
            <FileDown size={16} /> تصدير Excel
          </button>
          <button className="hero-action-btn" onClick={() => setBatchOpen(true)}>
            <Layers size={16} /> توليد دفعة كروت
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
            <Plus size={18} /> إضافة بطاقة جديدة
          </button>
        </div>
      </div>

      {/* KPI Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { key: 'all', label: 'إجمالي البطاقات', val: globalTotal, icon: <CreditCard size={20} />, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
          { key: 'active', label: 'البطاقات النشطة', val: globalActive, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
          { key: 'inactive', label: 'البطاقات المعطلة', val: globalInactive, icon: <XCircle size={20} />, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
          { key: 'expired', label: 'منتهية الاشتراك', val: globalExpired, icon: <TrendingUp size={20} />, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
        ].map(s => {
          const isSelected = statusF === s.key;
          return (
            <div
              key={s.label}
              onClick={() => { setStatusF(s.key as any); setPage(1); }}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: isSelected ? `2px solid ${s.color}` : '1px solid var(--bdr-light)',
                boxShadow: isSelected ? `0 8px 20px -4px ${s.color}25` : '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: s.bg,
                border: `1px solid ${s.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.color,
                flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-muted)', marginBottom: '4px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--txt-heading)', lineHeight: 1 }}>
                  {loading ? '—' : s.val}
                </div>
              </div>
              {isSelected && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Modern Filters */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--bdr-light)',
        borderRadius: '16px',
        padding: '14px 18px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: '1' }}>
            <Search size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setAppliedSearch(search); setPage(1); } }}
              placeholder="ابحث بكود البطاقة، الرابط المخصص، أو NFC..."
              className="form-input" style={{ paddingRight: '36px', height: '40px', borderRadius: '10px' }}
            />
          </div>
          <button className="btn-primary" onClick={() => { setAppliedSearch(search); setPage(1); }} style={{ padding: '0 20px', height: '40px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700 }}>
            بحث
          </button>
        </div>

        <select value={statusF} onChange={e => { setStatusF(e.target.value as any); setPage(1); }} style={{ ...selStyle, height: '40px', borderRadius: '10px' }}>
          <option value="all">كل الحالات</option>
          <option value="active">نشطة</option>
          <option value="inactive">معطلة</option>
          <option value="expired">منتهية الاشتراك</option>
        </select>
        <select value={typeF} onChange={e => { setTypeF(e.target.value); setPage(1); }} style={{ ...selStyle, height: '40px', borderRadius: '10px' }}>
          <option value="">كل الأنواع</option>
          {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={catF} onChange={e => { setCatF(e.target.value); setPage(1); }} style={{ ...selStyle, height: '40px', borderRadius: '10px' }}>
          <option value="">كل التصنيفات</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button className="btn-outline" onClick={() => { fetchCards(page, limit); loadGlobalStats(); }} style={{ padding: '0 16px', height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> تحديث
        </button>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div style={{
          background: 'var(--clr-primary-50)', border: '1px solid var(--clr-primary-200)',
          borderRadius: 'var(--r-lg)', padding: '11px 16px',
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--clr-primary-800)', fontSize: 'var(--fs-sm)' }}>
            {selected.size} بطاقة محددة
          </span>
          <div style={{ display: 'flex', gap: '7px', marginInlineStart: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => {
                const selCards = cards.filter(c => selected.has(c._id));
                setAssignCustomerTarget({
                  ids: selCards.map(c => c._id),
                  codes: selCards.map(c => c.card_code),
                });
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: 'var(--r-sm)', border: 'none',
                backgroundColor: 'var(--clr-primary-500)', color: '#fff',
                fontFamily: 'var(--font)', fontWeight: 800, fontSize: 'var(--fs-xs)',
                cursor: 'pointer', boxShadow: 'var(--shadow-blue)',
              }}
            >
              <UserCheck size={14} />
              <span>ربط بعميل (Assign Cards)</span>
            </button>

            {[
              { label: 'تفعيل', action: () => bulkToggle('active'), bg: 'var(--clr-success-bg)', color: 'var(--clr-success)' },
              { label: 'تعطيل', action: () => bulkToggle('inactive'), bg: 'var(--clr-warning-bg)', color: 'var(--clr-warning)' },
              { label: 'حذف', action: bulkDelete, bg: 'var(--clr-error-bg)', color: 'var(--clr-error)' },
              { label: 'إلغاء التحديد', action: () => setSelected(new Set()), bg: 'var(--bg-hover)', color: 'var(--txt-secondary)' },
            ].map(b => (
              <button key={b.label} onClick={b.action} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 13px', borderRadius: 'var(--r-sm)', border: 'none',
                backgroundColor: b.bg, color: b.color,
                fontFamily: 'var(--font)', fontWeight: 700, fontSize: 'var(--fs-xs)',
                cursor: 'pointer',
              }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Error */}
      {error && (
        <div style={{ background: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', borderRadius: 'var(--r-lg)', padding: '13px 16px', color: 'var(--clr-error)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <XCircle size={17} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error}</span>
          <button onClick={() => fetchCards(page, limit)} className="btn-outline" style={{ fontSize: 'var(--fs-xs)', padding: '5px 12px' }}>إعادة</button>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrapper">
        <div>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: 'var(--clr-primary-500)', width: '16px', height: '16px' }} />
                </th>
                <th onClick={() => requestSort('code')} style={{ cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>الكارت {sortConfig?.key === 'code' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}</div></th>
                <th onClick={() => requestSort('type')} style={{ cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>النوع {sortConfig?.key === 'type' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}</div></th>
                <th onClick={() => requestSort('category')} style={{ cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>التصنيف {sortConfig?.key === 'category' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}</div></th>
                <th onClick={() => requestSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>الحالة {sortConfig?.key === 'status' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}</div></th>
                <th style={{ userSelect: 'none', whiteSpace: 'nowrap' }}>نوع الاشتراك</th>
                <th onClick={() => requestSort('sub')} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>مدة الاشتراك {sortConfig?.key === 'sub' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}</div></th>
                <th style={{ textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j}>
                        <div className="shimmer" style={{ height: '13px', width: j === 0 ? '20px' : '70%', borderRadius: '4px' }} />
                      </td>
                    ))}
                  </tr>
                ))
                : sortedCards.length === 0
                  ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--txt-muted)' }}>
                        <CreditCard size={38} style={{ marginBottom: '10px', color: 'var(--bdr-medium)' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>لا توجد بطاقات</p>
                      </td>
                    </tr>
                  )
                  : sortedCards.map(card => {
                    const cat = getPopulatedCategory(card.category_id);
                    const isSel = selected.has(card._id);
                    return (
                      <tr key={card._id} className={isSel ? 'selected' : ''}>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleOne(card._id)} style={{ cursor: 'pointer', accentColor: 'var(--clr-primary-500)', width: '16px', height: '16px' }} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 'var(--fs-base)', color: 'var(--txt-heading)', letterSpacing: '0.5px' }}>{card.card_code}</span>

                            </div>


                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--r-full)', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                            {card.card_type}
                          </span>
                        </td>

                        <td style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', fontWeight: 600 }}>
                          {cat?.name || <span style={{ color: 'var(--txt-muted)' }}>—</span>}
                        </td>
                        <td>
                          <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ padding: '5px 12px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
                            {card.status === 'active' ? 'نشطة' : 'معطلة'}
                          </span>
                        </td>
                        <td style={{ fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap' }}>
                          {!card.requires_subscription
                            ? <span style={{ color: 'var(--clr-success)', fontWeight: 800, fontSize: '11px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px' }}>دائم ♾</span>
                            : <span style={{ color: 'var(--clr-primary-700)', fontWeight: 800, fontSize: '11px', backgroundColor: 'var(--clr-primary-50)', border: '1px solid var(--clr-primary-200)', padding: '4px 10px', borderRadius: '6px' }}>باشتراك</span>}
                        </td>
                        <td style={{ fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap' }}>
                          {card.requires_subscription && card.subscription_start_date && card.subscription_end_date
                            ? <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--clr-primary-700)' }}>
                              {getDurationText(card.subscription_start_date, card.subscription_end_date)}
                            </span>
                            : <span style={{ color: 'var(--txt-muted)' }}>—</span>}
                        </td>

                        <td>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              onClick={() => setDrawerCard(card)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--clr-primary-200)',
                                backgroundColor: 'var(--clr-primary-50)',
                                color: 'var(--clr-primary-700)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 700,
                                fontFamily: 'var(--font)',
                                transition: 'all 0.15s ease',
                              }}
                              title="عرض تفاصيل البطاقة وتعديلها"
                            >
                              <Eye size={14} />
                              <span>عرض</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (dropdownState?.id === card._id) {
                                  setDropdownState(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDropdownState({
                                    id: card._id,
                                    top: Math.min(rect.bottom + 6, window.innerHeight - 260),
                                    left: rect.left,
                                  });
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: `1px solid ${dropdownState?.id === card._id ? 'var(--clr-primary-300)' : 'var(--bdr-light)'}`,
                                backgroundColor: dropdownState?.id === card._id ? 'var(--clr-primary-50)' : '#f8fafc',
                                color: dropdownState?.id === card._id ? 'var(--clr-primary-600)' : 'var(--txt-secondary)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 700,
                                fontFamily: 'var(--font)',
                                transition: 'all 0.15s ease',
                              }}
                              title="المزيد من الإجراءات"
                            >
                              <span>المزيد</span>
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(totalPages > 1 || cards.length > 0) && (
          <div style={{
            padding: '16px 20px', borderTop: '1px solid var(--bdr-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px', backgroundColor: 'var(--bg-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', fontWeight: 600 }}>
                إجمالي <strong style={{ color: 'var(--txt-body)' }}>{currentTotal}</strong> بطاقات
              </span>
              <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--bdr-light)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)' }}>الصفوف في الصفحة:</span>
                <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} style={selStyle}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', marginInlineEnd: '10px' }}>
                صفحة <strong style={{ color: 'var(--txt-body)' }}>{page}</strong> من <strong>{totalPages || 1}</strong>
              </span>
              <PageBtn disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronRight size={15} /></PageBtn>
              {Array.from({ length: Math.min(5, Math.max(1, totalPages)) }, (_, i) => {
                let pg = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) pg = i + 1;
                  else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                  else pg = page - 2 + i;
                }
                if (pg < 1 || pg > Math.max(1, totalPages)) return null;
                return (
                  <PageBtn key={pg} active={pg === page} onClick={() => setPage(pg)}>{pg}</PageBtn>
                );
              })}
              <PageBtn disabled={page >= totalPages} onClick={() => setPage(p => Math.min(Math.max(1, totalPages), p + 1))}><ChevronLeft size={15} /></PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* Popover Action Menu */}
      {dropdownState && cards.find(c => c._id === dropdownState.id) && (() => {
        const dCard = cards.find(c => c._id === dropdownState.id)!;
        return (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 998 }}
              onClick={() => setDropdownState(null)}
            />
            <div
              style={{
                position: 'fixed',
                top: dropdownState.top,
                left: Math.max(16, dropdownState.left - 130),
                width: '185px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                border: '1px solid var(--bdr-light)',
                padding: '6px',
                zIndex: 999,
                animation: 'modalIn 0.15s var(--ease-out)',
                textAlign: 'right',
                fontFamily: 'var(--font)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="menu-item-btn"
                onClick={() => {
                  setDrawerCard(dCard);
                  setDropdownState(null);
                }}
              >
                <Eye size={15} style={{ color: 'var(--clr-primary-600)' }} />
                <span>تفاصيل البطاقة</span>
              </button>

              <button
                className="menu-item-btn"
                onClick={() => {
                  const url = `${window.location.origin}/social/${dCard.custom_slug || dCard.card_code}`;
                  navigator.clipboard.writeText(url);
                  showToast('تم نسخ الرابط ✓');
                  setDropdownState(null);
                }}
              >
                <LinkIcon size={15} style={{ color: '#0284c7' }} />
                <span>نسخ رابط الصفحة</span>
              </button>

              <button
                className="menu-item-btn"
                onClick={() => {
                  setAssignCustomerTarget({
                    ids: [dCard._id],
                    codes: [dCard.card_code],
                  });
                  setDropdownState(null);
                }}
              >
                <UserCheck size={15} style={{ color: 'var(--clr-primary-600)' }} />
                <span>ربط بالعميل (Assign)</span>
              </button>

              <button
                className="menu-item-btn"
                onClick={() => {
                  setCloneTarget(dCard);
                  setDropdownState(null);
                }}
              >
                <Copy size={15} style={{ color: '#7c3aed' }} />
                <span>نسخ البطاقة</span>
              </button>


              <button
                className="menu-item-btn"
                onClick={() => {
                  downloadQR(dCard);
                  setDropdownState(null);
                }}
              >
                <Download size={15} style={{ color: 'var(--clr-primary-500)' }} />
                <span>تحميل QR كود</span>
              </button>

              <div style={{ height: '1px', backgroundColor: 'var(--bdr-light)', margin: '4px 0' }} />

              <button
                className="menu-item-btn"
                onClick={() => {
                  handleToggle(dCard);
                  setDropdownState(null);
                }}
                style={{ color: dCard.status === 'active' ? 'var(--clr-warning)' : 'var(--clr-success)' }}
              >
                <Power size={15} />
                <span>{dCard.status === 'active' ? 'تعطيل البطاقة' : 'تفعيل البطاقة'}</span>
              </button>

              <button
                className="menu-item-btn"
                onClick={() => {
                  setDeleteTarget(dCard);
                  setDropdownState(null);
                }}
                style={{ color: 'var(--clr-error)' }}
              >
                <Trash2 size={15} />
                <span>حذف البطاقة</span>
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
};

/* ── مساعدات ──────────────────────────────────────────────────── */
const PageBtn: React.FC<{ onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }> = ({ onClick, disabled, active, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', borderRadius: 'var(--r-sm)',
    border: `1.5px solid ${active ? 'var(--clr-primary-500)' : 'var(--bdr-light)'}`,
    backgroundColor: active ? 'var(--clr-primary-500)' : 'var(--bg-white)',
    color: active ? '#fff' : 'var(--txt-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 700,
    fontSize: 'var(--fs-sm)', opacity: disabled ? 0.4 : 1,
  }}>
    {children}
  </button>
);

export default AdminInventoryPage;
