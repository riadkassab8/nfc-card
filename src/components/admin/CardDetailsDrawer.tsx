/* ==========================================================================
   CARD DETAILS DRAWER
   Tabs: info | redirect | qr | history
   All API calls use cardsApi directly — no service layer in between.
   ========================================================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { cardsApi } from '../../services';
import {
  ApiCard, ApiCategory, ApiCardHistory, ApiUpdateCardDto,
  BusinessData, CARD_TYPES, fmtDate, isSubscriptionExpired,
  getPopulatedCategory, getCategoryId,
} from '../../types';
import {
  X, Info, Link as LinkIcon, QrCode, History,
  Copy, Check, Download, Power, Trash2, RefreshCw,
  Save, Edit2, ExternalLink,
} from 'lucide-react';
import QRCode from 'qrcode';

type ToastType = 'success' | 'error' | 'info';
type Tab = 'info' | 'redirect' | 'qr' | 'history';

// ── Props ─────────────────────────────────────────────────────────────────
export interface CardDetailsDrawerProps {
  card: ApiCard | null;
  categories: ApiCategory[];
  onClose: () => void;
  onUpdated: (card: ApiCard) => void;
  onDeleted: (id: string) => void;
  onToast: (msg: string, type?: ToastType) => void;
}

// ── Field row ─────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>{value || <span style={{ color: '#cbd5e1' }}>—</span>}</span>
  </div>
);

// ── Tab button ────────────────────────────────────────────────────────────
const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '9px 14px', borderRadius: '9px', border: 'none',
    cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '0.8125rem', fontWeight: 700,
    backgroundColor: active ? '#6366f1' : 'transparent',
    color: active ? '#fff' : '#64748b',
    transition: 'all 150ms',
  }}>
    {icon} {label}
  </button>
);

// ── Main ──────────────────────────────────────────────────────────────────
export const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({
  card, categories, onClose, onUpdated, onDeleted, onToast,
}) => {
  const [tab, setTab]             = useState<Tab>('info');
  // Redirect tab
  const [newUrl, setNewUrl]       = useState('');
  const [savingUrl, setSavingUrl] = useState(false);

  // QR tab
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // History tab
  const [history, setHistory]     = useState<ApiCardHistory[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histLoaded, setHistLoaded]   = useState(false);

  // Edit mode (info tab)
  const [editMode, setEditMode]         = useState(false);
  const [editType, setEditType]         = useState('');
  const [editNfc, setEditNfc]           = useState('');
  const [editCat, setEditCat]           = useState('');
  const [editSaving, setEditSaving]     = useState(false);

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  // Renew / toggle
  const [toggling, setToggling]   = useState(false);
  const [renewing, setRenewing]   = useState(false);

  // Copy
  const [copied, setCopied]       = useState<string | null>(null);

  // ── Reset on card change ────────────────────────────────────────────────
  useEffect(() => {
    if (!card) return;
    setTab('info');
    setEditMode(false);
    setConfirmDelete(false);
    setNewUrl(card.current_redirect_url || '');
    setEditType(card.card_type || '');
    setEditNfc(card.nfc_uid || '');
    setEditCat(getCategoryId(card.category_id) || '');
    setQrDataUrl(null);
    setHistory([]);
    setHistLoaded(false);
  }, [card]);

  // ── Generate QR when tab opens ─────────────────────────────────────────
  const genQr = useCallback(async (url: string) => {
    setQrLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 360, margin: 2, errorCorrectionLevel: 'H' });
      setQrDataUrl(dataUrl);
    } catch {
      setQrDataUrl(null);
    } finally {
      setQrLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'qr' && card && !qrDataUrl) {
      genQr(card.current_redirect_url);
    }
  }, [tab, card, qrDataUrl, genQr]);

  // ── Load history when tab opens ────────────────────────────────────────
  useEffect(() => {
    if (tab === 'history' && card && !histLoaded) {
      setHistLoading(true);
      cardsApi.getCardHistory(card._id)
        .then((h) => { setHistory(h); setHistLoaded(true); })
        .catch(() => { /* silently fail */ })
        .finally(() => setHistLoading(false));
    }
  }, [tab, card, histLoaded]);

  if (!card) return null;

  const isActive  = card.status === 'active';
  const expired   = isSubscriptionExpired(card);
  const staticUrl = `https://smart-card-qr-api.koyeb.app/r/${card.card_code}`;
  const cat       = getPopulatedCategory(card.category_id);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleSaveUrl = async () => {
    if (!newUrl.trim()) return;
    setSavingUrl(true);
    try {
      const updated = await cardsApi.changeRedirect(card._id, newUrl.trim());
      onUpdated(updated);
      onToast('✅ تم تغيير رابط التوجيه');
      setQrDataUrl(null); // regenerate QR
    } catch (err: any) {
      onToast(err?.message || 'فشل تحديث الرابط', 'error');
    } finally {
      setSavingUrl(false);
    }
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    try {
      const dto: ApiUpdateCardDto = {
        card_type:   editType || undefined,
        nfc_uid:     editNfc.trim() || undefined,
        category_id: editCat || undefined,
      };
      const updated = await cardsApi.updateCard(card._id, dto);
      onUpdated(updated);
      setEditMode(false);
      onToast('✅ تم حفظ التعديلات');
    } catch (err: any) {
      onToast(err?.message || 'فشل الحفظ', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const updated = await cardsApi.toggleCard(card._id);
      onUpdated(updated);
      onToast(updated.status === 'active' ? '🟢 تم تفعيل البطاقة' : '🔴 تم تعطيل البطاقة');
    } catch (err: any) {
      onToast(err?.message || 'فشل تغيير الحالة', 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleRenew = async () => {
    setRenewing(true);
    try {
      const updated = await cardsApi.renewCard(card._id);
      onUpdated(updated);
      onToast('🔁 تم تجديد الاشتراك سنة إضافية');
    } catch (err: any) {
      onToast(err?.message || 'فشل التجديد', 'error');
    } finally {
      setRenewing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await cardsApi.deleteCard(card._id);
      onDeleted(card._id);
      onToast(`🗑️ تم حذف ${card.card_code}`);
      onClose();
    } catch (err: any) {
      onToast(err?.message || 'فشل الحذف', 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const downloadQrPng = async () => {
    try {
      const blob = await cardsApi.getCardQrBlob(card._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `qr-${card.card_code}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch {
      onToast('فشل تحميل QR', 'error');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 300 }}
      />

      {/* Panel */}
      <div
        dir="rtl"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(520px, 100vw)',
          backgroundColor: '#fff', zIndex: 301,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(15,23,42,0.15)',
          fontFamily: 'Cairo, sans-serif',
          animation: 'drawerInLtr 250ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 900, color: '#0f172a' }}>{card.card_code}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '5px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 9px', borderRadius: '99px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 700 }}>{card.card_type}</span>
              <span style={{ fontSize: '0.72rem', padding: '2px 9px', borderRadius: '99px', fontWeight: 700, backgroundColor: isActive ? '#d1fae5' : '#fee2e2', color: isActive ? '#047857' : '#dc2626' }}>
                {isActive ? '🟢 نشطة' : '🔴 معطلة'}
              </span>
              {expired && <span style={{ fontSize: '0.72rem', padding: '2px 9px', borderRadius: '99px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#d97706' }}>⚠️ منتهية الاشتراك</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '9px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '4px', flexShrink: 0, overflowX: 'auto' }}>
          <TabBtn active={tab === 'info'}     onClick={() => setTab('info')}     icon={<Info size={14} />}     label="المعلومات" />
          <TabBtn active={tab === 'redirect'} onClick={() => setTab('redirect')} icon={<LinkIcon size={14} />}  label="رابط التوجيه" />
          <TabBtn active={tab === 'qr'}       onClick={() => setTab('qr')}       icon={<QrCode size={14} />}   label="رمز QR" />
          <TabBtn active={tab === 'history'}  onClick={() => setTab('history')}  icon={<History size={14} />}  label="السجل" />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* ── INFO TAB ── */}
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Edit / Save buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {editMode
                  ? <>
                      <button onClick={() => setEditMode(false)} style={outlineBtn}>إلغاء</button>
                      <button onClick={handleSaveEdit} disabled={editSaving} style={primaryBtn}>
                        {editSaving ? <><RefreshCw size={14} className="spin" /> حفظ...</> : <><Save size={14} /> حفظ التعديلات</>}
                      </button>
                    </>
                  : <button onClick={() => setEditMode(true)} style={outlineBtn}><Edit2 size={14} /> تعديل</button>}
              </div>

              {/* Fields grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Field label="كود البطاقة" value={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code>{card.card_code}</code>
                    <button onClick={() => copyText(card.card_code, 'code')} style={iconBtn}>{copied === 'code' ? <Check size={13} /> : <Copy size={13} />}</button>
                  </span>
                } />
                <Field label="معرف NFC" value={
                  editMode
                    ? <input value={editNfc} onChange={(e) => setEditNfc(e.target.value)} placeholder="NFC-XXXXXX" style={inlineInput} />
                    : card.nfc_uid || '—'
                } />
                <Field label="نوع البطاقة" value={
                  editMode
                    ? <select value={editType} onChange={(e) => setEditType(e.target.value)} style={inlineInput}>
                        {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    : card.card_type
                } />
                <Field label="التصنيف" value={
                  editMode
                    ? <select value={editCat} onChange={(e) => setEditCat(e.target.value)} style={inlineInput}>
                        <option value="">— بدون تصنيف —</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    : cat?.name || '—'
                } />
                <Field label="تاريخ بداية الاشتراك" value={fmtDate(card.subscription_start_date)} />
                <Field label="تاريخ انتهاء الاشتراك" value={
                  <span style={{ color: expired ? '#dc2626' : undefined }}>
                    {fmtDate(card.subscription_end_date)}
                    {expired && ' ⚠️'}
                  </span>
                } />
                <Field label="تاريخ الإنشاء" value={fmtDate(card.createdAt)} />
                <Field label="آخر تحديث" value={fmtDate(card.updatedAt)} />
              </div>

              {/* Static URL */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>رابط NFC / QR الثابت (لا يتغير)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ fontSize: '0.78rem', color: '#1d4ed8', flex: 1, wordBreak: 'break-all' }}>{staticUrl}</code>
                  <button onClick={() => copyText(staticUrl, 'static')} style={iconBtn}>{copied === 'static' ? <Check size={13} /> : <Copy size={13} />}</button>
                  <a href={staticUrl} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: 'none', color: '#1d4ed8' }}><ExternalLink size={13} /></a>
                </div>
              </div>

              {/* Business data */}
              {card.business_data && Object.values(card.business_data).some(Boolean) && (
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>بيانات النشاط التجاري</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(Object.entries(card.business_data) as [keyof BusinessData, string | null | undefined][])
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <Field key={k} label={k.replace(/_/g, ' ')} value={v} />
                      ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={handleToggle} disabled={toggling} style={{ ...outlineBtn, borderColor: isActive ? '#f59e0b' : '#10b981', color: isActive ? '#d97706' : '#059669' }}>
                  {toggling ? <RefreshCw size={14} className="spin" /> : <Power size={14} />}
                  {isActive ? 'تعطيل' : 'تفعيل'}
                </button>
                <button onClick={handleRenew} disabled={renewing} style={outlineBtn}>
                  {renewing ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                  تجديد الاشتراك
                </button>
                {!confirmDelete
                  ? <button onClick={() => setConfirmDelete(true)} style={{ ...outlineBtn, borderColor: '#fca5a5', color: '#ef4444' }}><Trash2 size={14} /> حذف</button>
                  : <button onClick={handleDelete} disabled={deleting} style={{ ...outlineBtn, borderColor: '#ef4444', backgroundColor: '#ef4444', color: '#fff' }}>
                      {deleting ? 'جاري الحذف...' : '⚠️ تأكيد الحذف'}
                    </button>}
                {confirmDelete && !deleting && (
                  <button onClick={() => setConfirmDelete(false)} style={outlineBtn}>إلغاء</button>
                )}
              </div>
            </div>
          )}

          {/* ── REDIRECT TAB ── */}
          {tab === 'redirect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                غيّر رابط التوجيه الذي تنتقل إليه عند مسح الكارت. الكارت الفيزيائي لا يتغير.
              </p>
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>الرابط الحالي</div>
                <code style={{ fontSize: '0.8rem', color: '#4f46e5', wordBreak: 'break-all' }}>{card.current_redirect_url}</code>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>الرابط الجديد</label>
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'monospace', outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <button onClick={handleSaveUrl} disabled={savingUrl || !newUrl.trim()} style={{ ...primaryBtn, justifyContent: 'center', opacity: !newUrl.trim() ? 0.5 : 1 }}>
                {savingUrl ? <><RefreshCw size={15} className="spin" /> جاري الحفظ...</> : <><Save size={15} /> تغيير الرابط</>}
              </button>
            </div>
          )}

          {/* ── QR TAB ── */}
          {tab === 'qr' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {qrLoading
                ? <div style={{ width: '240px', height: '240px', borderRadius: '12px', ...shimmerStyle }} />
                : qrDataUrl
                ? <img src={qrDataUrl} alt="QR Code" style={{ width: '240px', height: '240px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                : <div style={{ width: '240px', height: '240px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <QrCode size={48} />
                  </div>}

              <code style={{ fontSize: '0.75rem', color: '#4f46e5', wordBreak: 'break-all', textAlign: 'center', maxWidth: '320px' }}>
                {card.current_redirect_url}
              </code>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={downloadQrPng} style={primaryBtn}>
                  <Download size={15} /> تحميل PNG
                </button>
                <button onClick={() => genQr(card.current_redirect_url)} style={outlineBtn}>
                  <RefreshCw size={15} /> إعادة توليد
                </button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px 16px', border: '1px solid #e2e8f0', width: '100%' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>الرابط الثابت للبطاقة</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <code style={{ fontSize: '0.75rem', color: '#1d4ed8', flex: 1, wordBreak: 'break-all' }}>{staticUrl}</code>
                  <button onClick={() => copyText(staticUrl, 'qr-static')} style={iconBtn}>{copied === 'qr-static' ? <Check size={13} /> : <Copy size={13} />}</button>
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {histLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ height: '72px', borderRadius: '10px', ...shimmerStyle }} />
                  ))
                : history.length === 0
                ? <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '0.875rem' }}>
                    <History size={36} style={{ marginBottom: '10px' }} />
                    <p style={{ margin: 0 }}>لا يوجد سجل لهذه البطاقة</p>
                  </div>
                : history.map((h) => (
                    <div key={h._id} style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 700, padding: '2px 9px', borderRadius: '99px',
                          backgroundColor: h.action === 'created' ? '#d1fae5' : h.action === 'deleted' ? '#fee2e2' : '#fef3c7',
                          color:           h.action === 'created' ? '#047857' : h.action === 'deleted' ? '#dc2626' : '#d97706',
                        }}>
                          {h.action === 'created' ? '✅ إنشاء' : h.action === 'deleted' ? '🗑️ حذف' : '✏️ تعديل'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{fmtDate(h.recorded_at)}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        {h.snapshot.current_redirect_url && (
                          <div>رابط: <code style={{ color: '#4f46e5' }}>{h.snapshot.current_redirect_url}</code></div>
                        )}
                        <div>الحالة: <strong>{h.snapshot.status === 'active' ? 'نشطة' : 'معطلة'}</strong></div>
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Style atoms ────────────────────────────────────────────────────────────
const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '7px',
  padding: '9px 18px', borderRadius: '10px', border: 'none',
  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  color: '#fff', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
  fontWeight: 700, fontSize: '0.875rem',
};

const outlineBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '7px',
  padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
  backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer',
  fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.875rem',
};

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '26px', height: '26px', borderRadius: '7px',
  border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc',
  color: '#64748b', cursor: 'pointer', flexShrink: 0,
};

const inlineInput: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '6px 8px', borderRadius: '7px',
  border: '1.5px solid #6366f1', fontSize: '0.875rem',
  fontFamily: 'Cairo, sans-serif', outline: 'none',
};

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
  backgroundSize: '200% auto',
  animation: 'shimmer 1.4s linear infinite',
};
