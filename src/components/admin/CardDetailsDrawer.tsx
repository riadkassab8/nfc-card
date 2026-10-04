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

export interface CardDetailsDrawerProps {
  card: ApiCard | null;
  categories: ApiCategory[];
  onClose: () => void;
  onUpdated: (card: ApiCard) => void;
  onDeleted: (id: string) => void;
  onToast: (msg: string, type?: ToastType) => void;
}

/* ── خلية معلومة ──────────────────────────────────────────────── */
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
    <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
    <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--txt-body)', wordBreak: 'break-all' }}>
      {children || <span style={{ color: 'var(--txt-muted)' }}>—</span>}
    </span>
  </div>
);

/* ── زر تبويب ─────────────────────────────────────────────────── */
const Tab: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 13px', borderRadius: 'var(--r-md)', border: 'none',
    cursor: 'pointer', fontFamily: 'var(--font)',
    fontSize: 'var(--fs-sm)', fontWeight: active ? 700 : 500,
    backgroundColor: active ? 'var(--clr-primary-500)' : 'transparent',
    color: active ? '#fff' : 'var(--txt-secondary)',
    transition: 'all 140ms var(--ease)',
    whiteSpace: 'nowrap',
  }}>
    {icon} {label}
  </button>
);

/* ── Main ─────────────────────────────────────────────────────── */
export const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({
  card, categories, onClose, onUpdated, onDeleted, onToast,
}) => {
  const [tab, setTab]               = useState<Tab>('info');
  const [newUrl, setNewUrl]         = useState('');
  const [savingUrl, setSavingUrl]   = useState(false);
  const [qrDataUrl, setQrDataUrl]   = useState<string | null>(null);
  const [qrLoading, setQrLoading]   = useState(false);
  const [history, setHistory]       = useState<ApiCardHistory[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histLoaded, setHistLoaded] = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [editType, setEditType]     = useState('');
  const [editNfc, setEditNfc]       = useState('');
  const [editCat, setEditCat]       = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [toggling, setToggling]     = useState(false);
  const [renewing, setRenewing]     = useState(false);
  const [copied, setCopied]         = useState<string | null>(null);

  /* ── reset on card change ── */
  useEffect(() => {
    if (!card) return;
    setTab('info'); setEditMode(false); setConfirmDel(false);
    setNewUrl(card.current_redirect_url || '');
    setEditType(card.card_type || '');
    setEditNfc(card.nfc_uid || '');
    setEditCat(getCategoryId(card.category_id) || '');
    setQrDataUrl(null); setHistory([]); setHistLoaded(false);
  }, [card]);

  /* ── QR ── */
  const genQr = useCallback(async (url: string) => {
    setQrLoading(true);
    try {
      const d = await QRCode.toDataURL(url, { width: 320, margin: 2, errorCorrectionLevel: 'H' });
      setQrDataUrl(d);
    } catch { setQrDataUrl(null); }
    finally { setQrLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'qr' && card && !qrDataUrl) genQr(card.current_redirect_url);
  }, [tab, card, qrDataUrl, genQr]);

  /* ── History ── */
  useEffect(() => {
    if (tab === 'history' && card && !histLoaded) {
      setHistLoading(true);
      cardsApi.getCardHistory(card._id)
        .then(h => { setHistory(h); setHistLoaded(true); })
        .catch(() => {})
        .finally(() => setHistLoading(false));
    }
  }, [tab, card, histLoaded]);

  if (!card) return null;

  const isActive = card.status === 'active';
  const expired  = isSubscriptionExpired(card);
  const cat      = getPopulatedCategory(card.category_id);
  const staticUrl = `https://smart-card-qr-api.koyeb.app/r/${card.card_code}`;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  /* ── actions ── */
  const handleSaveUrl = async () => {
    if (!newUrl.trim()) return;
    setSavingUrl(true);
    try {
      const u = await cardsApi.changeRedirect(card._id, newUrl.trim());
      onUpdated(u); setQrDataUrl(null);
      onToast('تم تغيير رابط التوجيه');
    } catch (e: any) { onToast(e?.message || 'فشل', 'error'); }
    finally { setSavingUrl(false); }
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    try {
      const dto: ApiUpdateCardDto = {
        card_type:   editType || undefined,
        nfc_uid:     editNfc.trim() || undefined,
        category_id: editCat || undefined,
      };
      const u = await cardsApi.updateCard(card._id, dto);
      onUpdated(u); setEditMode(false);
      onToast('تم حفظ التعديلات');
    } catch (e: any) { onToast(e?.message || 'فشل', 'error'); }
    finally { setEditSaving(false); }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const u = await cardsApi.toggleCard(card._id);
      onUpdated(u);
      onToast(u.status === 'active' ? 'تم تفعيل البطاقة' : 'تم تعطيل البطاقة');
    } catch (e: any) { onToast(e?.message || 'فشل', 'error'); }
    finally { setToggling(false); }
  };

  const handleRenew = async () => {
    setRenewing(true);
    try {
      const u = await cardsApi.renewCard(card._id);
      onUpdated(u); onToast('تم تجديد الاشتراك سنة إضافية');
    } catch (e: any) { onToast(e?.message || 'فشل', 'error'); }
    finally { setRenewing(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await cardsApi.deleteCard(card._id);
      onDeleted(card._id); onToast(`تم حذف ${card.card_code}`); onClose();
    } catch (e: any) { onToast(e?.message || 'فشل الحذف', 'error'); }
    finally { setDeleting(false); setConfirmDel(false); }
  };

  const downloadQrPng = async () => {
    try {
      const blob = await cardsApi.getCardQrBlob(card._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `qr-${card.card_code}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { onToast('فشل تحميل QR', 'error'); }
  };

  /* ── shared styles ── */
  const inlineInput: React.CSSProperties = {
    boxSizing: 'border-box', padding: '7px 10px',
    borderRadius: 'var(--r-sm)', border: '1.5px solid var(--clr-primary-400)',
    fontSize: 'var(--fs-sm)', fontFamily: 'var(--font)', width: '100%', outline: 'none',
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg-overlay)', zIndex: 300 }}
      />

      {/* Panel */}
      <div
        dir="rtl"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(500px, 100vw)',
          backgroundColor: 'var(--bg-white)', zIndex: 301,
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          fontFamily: 'var(--font)',
          animation: 'drawerInLtr 250ms var(--ease-out) both',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--bdr-light)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--txt-heading)', fontFamily: 'monospace' }}>
              {card.card_code}
            </h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">{card.card_type}</span>
              <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
                {isActive ? 'نشطة' : 'معطلة'}
              </span>
              {expired && <span className="badge badge-warning">⚠ منتهية</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--bdr-light)', backgroundColor: 'var(--bg-subtle)',
              color: 'var(--txt-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid var(--bdr-light)',
          display: 'flex', gap: '4px', flexShrink: 0, overflowX: 'auto',
          backgroundColor: 'var(--bg-subtle)',
        }}>
          <Tab active={tab === 'info'}     onClick={() => setTab('info')}     icon={<Info size={13} />}     label="المعلومات" />
          <Tab active={tab === 'redirect'} onClick={() => setTab('redirect')} icon={<LinkIcon size={13} />}  label="الرابط" />
          <Tab active={tab === 'qr'}       onClick={() => setTab('qr')}       icon={<QrCode size={13} />}   label="رمز QR" />
          <Tab active={tab === 'history'}  onClick={() => setTab('history')}  icon={<History size={13} />}  label="السجل" />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

          {/* ════ INFO ════ */}
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Edit toggle */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {editMode ? (
                  <>
                    <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '7px 14px' }} onClick={() => setEditMode(false)}>إلغاء</button>
                    <button className="btn-primary" style={{ fontSize: 'var(--fs-sm)', padding: '7px 16px', justifyContent: 'center' }} onClick={handleSaveEdit} disabled={editSaving}>
                      {editSaving ? <><RefreshCw size={13} className="spin" /> حفظ...</> : <><Save size={13} /> حفظ</>}
                    </button>
                  </>
                ) : (
                  <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '7px 14px' }} onClick={() => setEditMode(true)}>
                    <Edit2 size={13} /> تعديل
                  </button>
                )}
              </div>

              {/* Fields grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
                backgroundColor: 'var(--bg-subtle)', padding: '16px',
                borderRadius: 'var(--r-lg)', border: '1px solid var(--bdr-light)',
              }}>
                <Field label="كود البطاقة">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
                    {card.card_code}
                    <button onClick={() => copyText(card.card_code, 'code')} style={iconBtnStyle}>
                      {copied === 'code' ? <Check size={12} style={{ color: 'var(--clr-success)' }} /> : <Copy size={12} />}
                    </button>
                  </span>
                </Field>
                <Field label="معرف NFC">
                  {editMode
                    ? <input value={editNfc} onChange={e => setEditNfc(e.target.value)} placeholder="NFC-XXXXXX" style={inlineInput} />
                    : <span style={{ fontFamily: 'monospace' }}>{card.nfc_uid || '—'}</span>}
                </Field>
                <Field label="نوع البطاقة">
                  {editMode
                    ? <select value={editType} onChange={e => setEditType(e.target.value)} style={{ ...inlineInput }}>
                        {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    : card.card_type}
                </Field>
                <Field label="التصنيف">
                  {editMode
                    ? <select value={editCat} onChange={e => setEditCat(e.target.value)} style={{ ...inlineInput }}>
                        <option value="">— بدون تصنيف —</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    : cat?.name || '—'}
                </Field>
                <Field label="بداية الاشتراك">{fmtDate(card.subscription_start_date)}</Field>
                <Field label="نهاية الاشتراك">
                  <span style={{ color: expired ? 'var(--clr-error)' : undefined }}>
                    {fmtDate(card.subscription_end_date)} {expired ? '⚠' : ''}
                  </span>
                </Field>
                <Field label="تاريخ الإنشاء">{fmtDate(card.createdAt)}</Field>
                <Field label="آخر تحديث">{fmtDate(card.updatedAt)}</Field>
              </div>

              {/* Static URL */}
              <div style={{
                backgroundColor: 'var(--clr-primary-50)', borderRadius: 'var(--r-lg)',
                padding: '13px 16px', border: '1px solid var(--clr-primary-200)',
              }}>
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--clr-primary-700)', marginBottom: '6px' }}>
                  الرابط الثابت (NFC / QR)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-primary-800)', flex: 1, wordBreak: 'break-all' }}>
                    {staticUrl}
                  </code>
                  <button onClick={() => copyText(staticUrl, 'static')} style={iconBtnStyle}>
                    {copied === 'static' ? <Check size={12} style={{ color: 'var(--clr-success)' }} /> : <Copy size={12} />}
                  </button>
                  <a href={staticUrl} target="_blank" rel="noopener noreferrer" style={{ ...iconBtnStyle, textDecoration: 'none', color: 'var(--clr-primary-600)' }}>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Business data */}
              {card.business_data && Object.values(card.business_data).some(Boolean) && (
                <div style={{
                  backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--r-lg)',
                  padding: '14px 16px', border: '1px solid var(--bdr-light)',
                }}>
                  <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--txt-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    بيانات النشاط التجاري
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(Object.entries(card.business_data) as [keyof BusinessData, string | null | undefined][])
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <Field key={k} label={k.replace(/_/g, ' ')}>{v}</Field>
                      ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--bdr-light)' }}>
                <button
                  className="btn-outline"
                  style={{ fontSize: 'var(--fs-sm)', padding: '8px 14px', borderColor: isActive ? 'var(--clr-warning-bdr)' : 'var(--clr-success-bdr)', color: isActive ? 'var(--clr-warning)' : 'var(--clr-success)' }}
                  onClick={handleToggle} disabled={toggling}
                >
                  {toggling ? <RefreshCw size={13} className="spin" /> : <Power size={13} />}
                  {isActive ? 'تعطيل' : 'تفعيل'}
                </button>
                <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '8px 14px' }} onClick={handleRenew} disabled={renewing}>
                  {renewing ? <RefreshCw size={13} className="spin" /> : <RefreshCw size={13} />}
                  تجديد الاشتراك
                </button>
                {!confirmDel
                  ? <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '8px 14px', borderColor: 'var(--clr-error-bdr)', color: 'var(--clr-error)' }} onClick={() => setConfirmDel(true)}>
                      <Trash2 size={13} /> حذف
                    </button>
                  : <>
                      <button onClick={handleDelete} disabled={deleting} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: 'var(--r-md)', border: 'none', backgroundColor: 'var(--clr-error)', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', fontWeight: 700, fontSize: 'var(--fs-sm)', opacity: deleting ? 0.7 : 1 }}>
                        {deleting ? 'حذف...' : '⚠ تأكيد الحذف'}
                      </button>
                      <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '8px 14px' }} onClick={() => setConfirmDel(false)}>إلغاء</button>
                    </>}
              </div>
            </div>
          )}

          {/* ════ REDIRECT ════ */}
          {tab === 'redirect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', lineHeight: 1.7 }}>
                غيّر رابط التوجيه الذي يُفتح عند مسح الكارت. الكارت الفيزيائي لا يتأثر.
              </p>
              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', padding: '11px 14px', border: '1px solid var(--bdr-light)' }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)', fontWeight: 700, marginBottom: '4px' }}>الرابط الحالي</div>
                <code style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-primary-700)', wordBreak: 'break-all' }}>{card.current_redirect_url}</code>
              </div>
              <div className="form-group">
                <label className="form-label">الرابط الجديد</label>
                <input
                  className="form-input"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleSaveUrl}
                disabled={savingUrl || !newUrl.trim()}
                style={{ justifyContent: 'center', opacity: !newUrl.trim() ? 0.5 : 1 }}
              >
                {savingUrl ? <><RefreshCw size={14} className="spin" /> جاري الحفظ...</> : <><Save size={14} /> تغيير الرابط</>}
              </button>
            </div>
          )}

          {/* ════ QR ════ */}
          {tab === 'qr' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {qrLoading
                ? <div className="shimmer" style={{ width: '220px', height: '220px', borderRadius: 'var(--r-lg)' }} />
                : qrDataUrl
                  ? <img src={qrDataUrl} alt="QR" style={{ width: '220px', height: '220px', borderRadius: 'var(--r-lg)', border: '1px solid var(--bdr-light)' }} />
                  : <div style={{ width: '220px', height: '220px', borderRadius: 'var(--r-lg)', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={56} style={{ color: 'var(--bdr-medium)' }} />
                    </div>}

              <code style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-primary-700)', wordBreak: 'break-all', textAlign: 'center', maxWidth: '320px' }}>
                {card.current_redirect_url}
              </code>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={downloadQrPng} style={{ padding: '9px 18px', fontSize: 'var(--fs-sm)' }}>
                  <Download size={14} /> تحميل PNG
                </button>
                <button className="btn-outline" onClick={() => genQr(card.current_redirect_url)} style={{ padding: '9px 18px', fontSize: 'var(--fs-sm)' }}>
                  <RefreshCw size={14} /> إعادة توليد
                </button>
              </div>

              <div style={{ width: '100%', backgroundColor: 'var(--clr-primary-50)', borderRadius: 'var(--r-md)', padding: '12px 14px', border: '1px solid var(--clr-primary-200)' }}>
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--clr-primary-700)', marginBottom: '5px' }}>الرابط الثابت</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <code style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-primary-800)', flex: 1, wordBreak: 'break-all' }}>{staticUrl}</code>
                  <button onClick={() => copyText(staticUrl, 'qr-st')} style={iconBtnStyle}>
                    {copied === 'qr-st' ? <Check size={12} style={{ color: 'var(--clr-success)' }} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ HISTORY ════ */}
          {tab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {histLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shimmer" style={{ height: '70px', borderRadius: 'var(--r-lg)' }} />
                  ))
                : history.length === 0
                  ? <div style={{ textAlign: 'center', padding: '40px', color: 'var(--txt-muted)' }}>
                      <History size={36} style={{ marginBottom: '10px', color: 'var(--bdr-medium)' }} />
                      <p style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>لا يوجد سجل لهذه البطاقة</p>
                    </div>
                  : history.map(h => (
                      <div key={h._id} style={{
                        backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--r-lg)',
                        padding: '12px 14px', border: '1px solid var(--bdr-light)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                          <span className={`badge ${h.action === 'created' ? 'badge-success' : h.action === 'deleted' ? 'badge-error' : 'badge-warning'}`}>
                            {h.action === 'created' ? 'إنشاء' : h.action === 'deleted' ? 'حذف' : 'تعديل'}
                          </span>
                          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>{fmtDate(h.recorded_at)}</span>
                        </div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-secondary)' }}>
                          {h.snapshot.current_redirect_url && (
                            <div>الرابط: <code style={{ color: 'var(--clr-primary-700)' }}>{h.snapshot.current_redirect_url}</code></div>
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

const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '24px', height: '24px', borderRadius: 'var(--r-sm)',
  border: '1px solid var(--bdr-light)', backgroundColor: 'var(--bg-white)',
  color: 'var(--txt-secondary)', cursor: 'pointer', flexShrink: 0,
};
