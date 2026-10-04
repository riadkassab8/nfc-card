import React, { useEffect, useState, useCallback } from 'react';
import { cardsApi, categoriesApi } from '../../services';
import {
  ApiCard, ApiCategory, fmtDate, isSubscriptionExpired,
  getPopulatedCategory, CARD_TYPES,
} from '../../types';
import { CardDetailsDrawer } from '../../components/admin/CardDetailsDrawer';
import { BatchGenerateCardsModal } from '../../components/admin/BatchGenerateCardsModal';
import {
  Plus, Search, RefreshCw, CreditCard, CheckCircle2, XCircle,
  Power, Trash2, Eye, Download, Copy, Check,
  AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

/* ── Toast ─────────────────────────────────────────────────────── */
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

/* ── Main ─────────────────────────────────────────────────────── */
export const AdminInventoryPage: React.FC = () => {
  const [cards, setCards]           = useState<ApiCard[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [total, setTotal]   = useState(0);
  const [active, setActive] = useState(0);
  const [inactive, setInact] = useState(0);

  const [search, setSearch]         = useState('');
  const [statusF, setStatusF]       = useState<'all' | 'active' | 'inactive'>('all');
  const [typeF, setTypeF]           = useState('');
  const [catF, setCatF]             = useState('');

  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerCard, setDrawerCard] = useState<ApiCard | null>(null);
  const [batchOpen, setBatchOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiCard | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const [copiedId, setCopied] = useState<string | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => setToast({ msg, type });

  const fetchCards = useCallback(async (pg = page) => {
    setLoading(true); setError(null);
    try {
      const [cr, catR] = await Promise.all([
        cardsApi.getCards({
          page: pg, limit: LIMIT,
          search: search || undefined,
          status: statusF !== 'all' ? statusF : undefined,
          card_type: typeF || undefined,
          category_id: catF || undefined,
        }),
        categoriesApi.getCategories({ limit: 100 }),
      ]);
      const all = cr.data ?? [];
      setCards(all);
      setTotalPages(cr.totalPages ?? 1);
      setTotal(cr.total ?? all.length);
      setActive(all.filter(c => c.status === 'active').length);
      setInact(all.filter(c => c.status === 'inactive').length);
      setCategories(catR.data ?? []);
    } catch (e: any) {
      setError(e?.message || 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  }, [search, statusF, typeF, catF, page]);

  useEffect(() => { setPage(1); fetchCards(1); }, [search, statusF, typeF, catF]);
  useEffect(() => { fetchCards(page); }, [page]);

  /* actions */
  const handleToggle = async (card: ApiCard) => {
    try {
      await cardsApi.toggleCard(card._id);
      showToast(card.status === 'active' ? `تم تعطيل ${card.card_code}` : `تم تفعيل ${card.card_code}`);
      fetchCards();
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
      fetchCards();
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

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const allSel = cards.length > 0 && cards.every(c => selected.has(c._id));
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(cards.map(c => c._id)));
  const toggleOne = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const bulkToggle = async (target: 'active' | 'inactive') => {
    const toChange = cards.filter(c => selected.has(c._id) && c.status !== target);
    await Promise.allSettled(toChange.map(c => cardsApi.toggleCard(c._id)));
    showToast(`تم تحديث ${toChange.length} بطاقة`);
    setSelected(new Set()); fetchCards();
  };

  const bulkDelete = async () => {
    await Promise.allSettled([...selected].map(id => cardsApi.deleteCard(id)));
    showToast(`تم حذف ${selected.size} بطاقة`);
    setSelected(new Set()); fetchCards();
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

      <CardDetailsDrawer
        card={drawerCard} categories={categories}
        onClose={() => setDrawerCard(null)}
        onUpdated={() => { fetchCards(); setDrawerCard(null); }}
        onDeleted={(id) => { if (drawerCard?._id === id) setDrawerCard(null); fetchCards(); }}
        onToast={showToast}
      />

      {batchOpen && (
        <BatchGenerateCardsModal
          categories={categories}
          onClose={() => setBatchOpen(false)}
          onCreated={() => { setBatchOpen(false); fetchCards(); showToast('تم إنشاء البطاقات بنجاح'); }}
        />
      )}

      {/* Hero */}
      <div className="page-hero">
        <div style={{ zIndex: 1 }}>
          <span className="page-hero-label">المخزون</span>
          <h2>إدارة البطاقات</h2>
          <p>إجمالي: <strong style={{ color: '#fff' }}>{total}</strong> بطاقة</p>
        </div>
        <button className="page-hero-btn page-hero-btn-solid" style={{ zIndex: 1 }} onClick={() => setBatchOpen(true)}>
          <Plus size={18} /> إنشاء بطاقة جديدة
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'الإجمالي', val: total,    icon: <CreditCard size={18} />,   accent: 'var(--clr-primary-500)' },
          { label: 'نشطة',     val: active,   icon: <CheckCircle2 size={18} />, accent: '#16a34a' },
          { label: 'معطلة',    val: inactive, icon: <XCircle size={18} />,      accent: 'var(--clr-error)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: s.accent + '14', color: s.accent }}>{s.icon}</div>
            <div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{loading ? '—' : s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--bg-white)', border: '1px solid var(--bdr-light)',
        borderRadius: 'var(--r-xl)', padding: '14px 16px',
        display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بكود البطاقة أو NFC..."
            className="form-input" style={{ paddingRight: '34px' }}
          />
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value as any)} style={selStyle}>
          <option value="all">كل الحالات</option>
          <option value="active">نشطة</option>
          <option value="inactive">معطلة</option>
        </select>
        <select value={typeF} onChange={e => setTypeF(e.target.value)} style={selStyle}>
          <option value="">كل الأنواع</option>
          {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={catF} onChange={e => setCatF(e.target.value)} style={selStyle}>
          <option value="">كل التصنيفات</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button className="btn-outline" onClick={() => fetchCards()} style={{ padding: '8px 14px', fontSize: 'var(--fs-sm)' }}>
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
          <div style={{ display: 'flex', gap: '7px', marginInlineStart: 'auto', flexWrap: 'wrap' }}>
            {[
              { label: 'تفعيل', action: () => bulkToggle('active'),   bg: 'var(--clr-success-bg)',  color: 'var(--clr-success)' },
              { label: 'تعطيل', action: () => bulkToggle('inactive'), bg: 'var(--clr-warning-bg)',  color: 'var(--clr-warning)' },
              { label: 'حذف',   action: bulkDelete,                   bg: 'var(--clr-error-bg)',    color: 'var(--clr-error)' },
              { label: 'إلغاء', action: () => setSelected(new Set()), bg: 'var(--bg-hover)',        color: 'var(--txt-secondary)' },
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
          <button onClick={() => fetchCards()} className="btn-outline" style={{ fontSize: 'var(--fs-xs)', padding: '5px 12px' }}>إعادة</button>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrapper">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: 'var(--clr-primary-500)' }} />
                </th>
                <th>الكارت</th>
                <th>النوع</th>
                <th>النشاط</th>
                <th>التصنيف</th>
                <th>الحالة</th>
                <th>الاشتراك</th>
                <th style={{ textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j}>
                          <div className="shimmer" style={{ height: '13px', width: j === 0 ? '20px' : '70%', borderRadius: '4px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : cards.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--txt-muted)' }}>
                        <CreditCard size={38} style={{ marginBottom: '10px', color: 'var(--bdr-medium)' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>لا توجد بطاقات</p>
                      </td>
                    </tr>
                  )
                  : cards.map(card => {
                      const cat = getPopulatedCategory(card.category_id);
                      const exp = isSubscriptionExpired(card);
                      const isSel = selected.has(card._id);
                      return (
                        <tr key={card._id} style={{ backgroundColor: isSel ? 'var(--clr-primary-50)' : undefined }}>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={isSel} onChange={() => toggleOne(card._id)} style={{ cursor: 'pointer', accentColor: 'var(--clr-primary-500)' }} />
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 'var(--fs-sm)', color: 'var(--txt-heading)' }}>{card.card_code}</div>
                            {card.nfc_uid && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)', fontFamily: 'monospace' }}>{card.nfc_uid}</div>}
                          </td>
                          <td>
                            <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--r-full)', backgroundColor: 'var(--bg-subtle)', color: 'var(--txt-secondary)', border: '1px solid var(--bdr-light)' }}>
                              {card.card_type}
                            </span>
                          </td>
                          <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--fs-sm)', color: 'var(--txt-body)' }}>
                            {card.business_data?.business_name || <span style={{ color: 'var(--txt-muted)' }}>—</span>}
                          </td>
                          <td style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-secondary)' }}>
                            {cat?.name || <span style={{ color: 'var(--txt-muted)' }}>—</span>}
                          </td>
                          <td>
                            <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
                              {card.status === 'active' ? 'نشطة' : 'معطلة'}
                            </span>
                          </td>
                          <td style={{ fontSize: 'var(--fs-xs)', color: exp ? 'var(--clr-error)' : 'var(--txt-secondary)', fontWeight: exp ? 700 : 400 }}>
                            {exp ? '⚠ منتهية' : fmtDate(card.subscription_end_date)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <IBtn title="تفاصيل" color="var(--clr-primary-600)" bg="var(--clr-primary-50)"   onClick={() => setDrawerCard(card)}><Eye size={14} /></IBtn>
                              <IBtn title="نسخ"    color={copiedId === card._id ? '#16a34a' : 'var(--txt-secondary)'} bg={copiedId === card._id ? 'var(--clr-success-bg)' : 'var(--bg-hover)'} onClick={() => copy(card.card_code, card._id)}>
                                {copiedId === card._id ? <Check size={14} /> : <Copy size={14} />}
                              </IBtn>
                              <IBtn title="QR"     color="var(--clr-primary-500)" bg="var(--clr-primary-50)"  onClick={() => downloadQR(card)}><Download size={14} /></IBtn>
                              <IBtn title={card.status === 'active' ? 'تعطيل' : 'تفعيل'} color={card.status === 'active' ? 'var(--clr-warning)' : 'var(--clr-success)'} bg={card.status === 'active' ? 'var(--clr-warning-bg)' : 'var(--clr-success-bg)'} onClick={() => handleToggle(card)}><Power size={14} /></IBtn>
                              <IBtn title="حذف"    color="var(--clr-error)"        bg="var(--clr-error-bg)"   onClick={() => setDeleteTarget(card)}><Trash2 size={14} /></IBtn>
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
          <div style={{
            padding: '11px 18px', borderTop: '1px solid var(--bdr-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '10px',
          }}>
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', fontWeight: 600 }}>
              صفحة {page} من {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <PageBtn disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronRight size={15} /></PageBtn>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <PageBtn key={pg} active={pg === page} onClick={() => setPage(pg)}>{pg}</PageBtn>
                );
              })}
              <PageBtn disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronLeft size={15} /></PageBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── مساعدات ──────────────────────────────────────────────────── */
const IBtn: React.FC<{ title: string; color: string; bg: string; onClick: () => void; children: React.ReactNode }> = ({ title, color, bg, onClick, children }) => (
  <button title={title} onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '28px', height: '28px', borderRadius: 'var(--r-sm)',
    border: 'none', backgroundColor: bg, color,
    cursor: 'pointer', transition: 'opacity 120ms', flexShrink: 0,
  }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.8'}
     onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
    {children}
  </button>
);

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
