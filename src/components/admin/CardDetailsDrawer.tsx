import React, { useState, useEffect } from 'react';
import { Drawer, Button, Input, Select } from '../ui';
import { CardItem, CardProductType, ApiUpdateCardDto } from '../../types';
import {
  Download,
  Cpu,
  Building2,
  Copy,
  Check,
  RefreshCw,
  Save,
  Link as LinkIcon,
  Eye,
  CreditCard,
  QrCode as QrIcon,
  Power,
  Trash2,
  Printer,
  Edit2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { generateRealQRCode, decodeQRCodeDataUrl, getCardPublicUrl } from '../../utils/qrGenerator';
import { cardService } from '../../services';
import { PhysicalCardPreview } from './PhysicalCardPreview';
import { DigitalProfilePreview } from '../digital-profile';
import { cardsApi } from '../../services/api';

export interface CardDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardItem | null;
  onAssignRequest?: (card: CardItem) => void;
  onCardUpdated?: (card: CardItem) => void;
  onCardDeleted?: (cardId: string) => void;
}

/* ── helper ── */
const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

const CARD_TYPE_OPTIONS = [
  { value: 'Google Review', label: '🌟 Google Review' },
  { value: 'Instagram',     label: '📸 Instagram' },
  { value: 'TikTok',        label: '🎵 TikTok' },
  { value: 'WhatsApp',      label: '💬 WhatsApp' },
  { value: 'Google Maps',   label: '📍 Google Maps' },
  { value: 'InstaPay',      label: '💳 InstaPay' },
];


/* ──────────────────────────────────────────── */
export const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({
  isOpen,
  onClose,
  card,
  onAssignRequest,
  onCardUpdated,
  onCardDeleted,
}) => {
  /* ── tabs ── */
  const [activeTab, setActiveTab] = useState<'info' | 'link' | 'qr' | 'print'>('info');

  /* ── QR ── */
  const [qrDataUrl, setQrDataUrl]     = useState<string | null>(null);
  const [qrSvgString, setQrSvgString] = useState<string | null>(null);
  const [decodedResult, setDecodedResult] = useState<{ success: boolean; decodedPayload: string | null } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  /* ── redirect url editor ── */
  const [redirectUrl, setRedirectUrl]     = useState('');
  const [isSavingUrl, setIsSavingUrl]     = useState(false);
  const [urlSaved, setUrlSaved]           = useState(false);

  /* ── edit card fields ── */
  const [editMode, setEditMode]           = useState(false);
  const [editCardCode, setEditCardCode]   = useState('');
  const [editNfcUid, setEditNfcUid]       = useState('');
  const [editCardType, setEditCardType]   = useState<CardProductType>('Google Review');
  const [isSavingEdit, setIsSavingEdit]   = useState(false);
  const [editSavedMsg, setEditSavedMsg]   = useState<string | null>(null);

  /* ── toggle / renew / delete ── */
  const [isToggling, setIsToggling]       = useState(false);
  const [isRenewing, setIsRenewing]       = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* ── misc ── */
  const [copiedLink, setCopiedLink]       = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toastMsg, setToastMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ────────────────────────────────── */
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const generateQR = async (url: string) => {
    setIsVerifying(true);
    const result = await generateRealQRCode(url);
    setQrDataUrl(result.dataUrl);
    setQrSvgString(result.svgString);
    const dec = await decodeQRCodeDataUrl(result.dataUrl);
    setDecodedResult(dec);
    setIsVerifying(false);
  };

  useEffect(() => {
    if (card && isOpen) {
      const url = getCardPublicUrl(card);
      setRedirectUrl(url);
      setActiveTab('info');
      setEditMode(false);
      setConfirmDelete(false);
      setEditCardCode(card.card_code);
      setEditNfcUid(card.nfc?.identifier || '');
      setEditCardType(card.card_type);
      generateQR(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, isOpen]);

  if (!card) return null;

  const isActive  = card.status === 'ACTIVE';
  const staticUrl = `https://smart-card-qr-api.koyeb.app/r/${card.card_code}`;

  /* ── handlers ── */
  const handleSaveUrl = async () => {
    if (!redirectUrl.trim()) return;
    setIsSavingUrl(true);
    try {
      const updated = await cardService.updateCardPublicUrl(card.id, redirectUrl.trim());
      onCardUpdated?.(updated);
      await generateQR(redirectUrl.trim());
      setUrlSaved(true);
      setTimeout(() => setUrlSaved(false), 2500);
      showToast('success', '✅ تم تغيير رابط التوجيه بنجاح');
    } catch {
      showToast('error', '❌ فشل تحديث الرابط');
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editCardCode.trim()) return;
    setIsSavingEdit(true);
    const dto: ApiUpdateCardDto = {
      card_type: editCardType,
      nfc_uid:   editNfcUid.trim() || undefined,
    };
    try {
      const updated = await cardsApi.updateCard(card.id, dto);
      const { apiCardToCardItem } = await import('../../types');
      const mapped = apiCardToCardItem(updated);
      onCardUpdated?.(mapped);
      setEditMode(false);
      setEditSavedMsg('✅ تم حفظ التعديلات');
      setTimeout(() => setEditSavedMsg(null), 2500);
      showToast('success', '✅ تم تحديث بيانات الكارت');
    } catch {
      showToast('error', '❌ فشل حفظ التعديلات');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const updated = await cardService.toggleCardStatus(card.id);
      onCardUpdated?.(updated);
      showToast('success', updated.status === 'ACTIVE' ? '🟢 تم تفعيل الكارت' : '🔴 تم إيقاف الكارت');
    } catch {
      showToast('error', '❌ فشل تغيير الحالة');
    } finally {
      setIsToggling(false);
    }
  };

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const updated = await cardService.renewCardSubscription(card.id);
      onCardUpdated?.(updated);
      showToast('success', '🔁 تم تجديد الاشتراك سنة إضافية');
    } catch {
      showToast('error', '❌ فشل تجديد الاشتراك');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setIsDeleting(true);
    try {
      await cardService.deleteCard(card.id);
      onCardDeleted?.(card.id);
      onClose();
    } catch {
      showToast('error', '❌ فشل حذف الكارت');
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const blob = await cardsApi.getCardQrBlob(card.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `qr-${card.card_code}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch {
      if (!qrSvgString) return;
      const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `qr-${card.card_code}.svg`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }
  };

  const copyStatic = () => {
    navigator.clipboard.writeText(staticUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  /* ── Tab button style ── */
  const tabBtn = (key: typeof activeTab): React.CSSProperties => ({
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '5px',
    padding: '9px 6px',
    borderRadius: '8px',
    fontSize: '0.775rem',
    fontWeight: activeTab === key ? 800 : 600,
    backgroundColor: activeTab === key ? '#0f172a' : 'transparent',
    color: activeTab === key ? '#dfb75c' : '#64748b',
    border: 'none', cursor: 'pointer',
    transition: 'all 150ms ease-out',
    whiteSpace: 'nowrap',
  });

  /* ── info row helper ── */
  /* ── info row helper (removed unused InfoRow) ── */

  /* ────────────────────────────────── */
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="تفاصيل الكارت" width="540px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>

        {/* ── Toast ── */}
        {toastMsg && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem',
            backgroundColor: toastMsg.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: toastMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${toastMsg.type === 'success' ? '#a7f3d0' : '#fca5a5'}`,
          }}>
            {toastMsg.text}
          </div>
        )}

        {/* ── Hero Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1a2540 100%)',
          border: '1px solid rgba(223,183,92,0.25)',
          borderRadius: '18px',
          padding: '20px 22px',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative glow */}
          <div style={{
            position: 'absolute', insetInlineEnd: '-30px', top: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(223,183,92,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* top row: status badge + type badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {/* Status */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: isActive ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
              color: isActive ? '#34d399' : '#f87171',
              padding: '4px 12px', borderRadius: '99px',
              fontSize: '0.8rem', fontWeight: 700,
              border: `1px solid ${isActive ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                backgroundColor: isActive ? '#34d399' : '#f87171',
                flexShrink: 0,
              }} />
              {isActive ? 'نشط' : 'متوقف'}
            </span>

            {/* Type */}
            {(() => {
              return (
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                  padding: '4px 12px', borderRadius: '99px',
                  fontSize: '0.8rem', fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {card.card_type}
                </span>
              );
            })()}
          </div>

          {/* bottom row: card code (right) + NFC (left in RTL) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>NFC UID</div>
              <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.04em' }}>
                {card.nfc.identifier}
              </div>
            </div>
            <div style={{ textAlign: 'end' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>كود الكارت</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dfb75c', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                {card.card_code}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', backgroundColor: '#f1f5f9',
          padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '3px',
        }}>
          <button type="button" style={tabBtn('info')}    onClick={() => setActiveTab('info')}>
            <CreditCard size={14} /> معلومات
          </button>
          <button type="button" style={tabBtn('link')}    onClick={() => setActiveTab('link')}>
            <LinkIcon size={14} /> الرابط
          </button>
          <button type="button" style={tabBtn('qr')}      onClick={() => setActiveTab('qr')}>
            <QrIcon size={14} /> QR Code
          </button>
          <button type="button" style={tabBtn('print')}   onClick={() => setActiveTab('print')}>
            <Printer size={14} /> الطباعة
          </button>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* TAB: INFO                               */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Info Grid */}
            <div style={{
              backgroundColor: '#fff', borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}>
              {[
                { label: 'كود الكارت',     value: card.card_code,        mono: true,  accent: true },
                { label: 'NFC UID',         value: card.nfc.identifier,  mono: true,  accent: false },
                { label: 'النوع',           value: card.card_type,       mono: false, accent: false },
                { label: 'الحالة',          value: null,                 mono: false, accent: false },
                { label: 'بداية الاشتراك', value: fmtDate(card.created_at), mono: false, accent: false },
                { label: 'نهاية الاشتراك', value: fmtDate(
                  new Date(new Date(card.created_at).setFullYear(
                    new Date(card.created_at).getFullYear() + 1
                  )).toISOString()
                ), mono: false, accent: false },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 18px',
                  borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
                  backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafbff',
                }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>{row.label}</span>
                  {row.label === 'الحالة' ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      fontSize: '0.875rem', fontWeight: 700,
                      color: isActive ? '#047857' : '#dc2626',
                    }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        backgroundColor: isActive ? '#10b981' : '#ef4444',
                        display: 'inline-block',
                      }} />
                      {isActive ? 'نشط' : 'متوقف'}
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      fontFamily: row.mono ? 'monospace' : 'Cairo, sans-serif',
                      color: row.accent ? '#4f46e5' : '#0f172a',
                      letterSpacing: row.mono ? '0.03em' : undefined,
                    }}>
                      {row.value as string}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Redirect URL display */}
            <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                رابط التوجيه الحالي
              </div>
              <a
                href={redirectUrl} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.875rem', color: '#4f46e5', fontWeight: 600, wordBreak: 'break-all', textDecoration: 'none' }}
              >
                {redirectUrl || '—'}
              </a>
            </div>

            {/* Static QR/NFC URL */}
            <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                رابط الـ QR / NFC (الثابت)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ fontSize: '0.8125rem', color: '#475569', flex: 1, wordBreak: 'break-all' }}>
                  {staticUrl}
                </code>
                <button
                  type="button" onClick={copyStatic}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', flexShrink: 0 }}
                  title="نسخ الرابط"
                >
                  {copiedLink ? <Check size={16} color="#047857" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>

              {/* Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setEditMode(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                    border: '1.5px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; }}
                >
                  <Edit2 size={15} /> تعديل
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('link'); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                    border: '1.5px solid #818cf8', backgroundColor: '#eef2ff', color: '#4338ca',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e0e7ff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#eef2ff'; }}
                >
                  <LinkIcon size={15} /> تغيير الرابط
                </button>
              </div>

              {/* Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleRenew}
                  disabled={isRenewing}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px 14px', borderRadius: '10px', cursor: isRenewing ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                    border: '1.5px solid #6ee7b7', backgroundColor: '#d1fae5', color: '#065f46',
                    transition: 'all 150ms ease', opacity: isRenewing ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#a7f3d0'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d1fae5'; }}
                >
                  {isRenewing
                    ? <><RefreshCw size={15} className="spin" /> جاري...</>
                    : <><RefreshCw size={15} /> تجديد سنة</>}
                </button>

                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={isToggling}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px 14px', borderRadius: '10px', cursor: isToggling ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                    border: `1.5px solid ${isActive ? '#fcd34d' : '#6ee7b7'}`,
                    backgroundColor: isActive ? '#fef9c3' : '#d1fae5',
                    color: isActive ? '#92400e' : '#065f46',
                    transition: 'all 150ms ease', opacity: isToggling ? 0.6 : 1,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = isActive ? '#fef08a' : '#a7f3d0';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = isActive ? '#fef9c3' : '#d1fae5';
                  }}
                >
                  {isToggling
                    ? <><Power size={15} className="spin" /> جاري...</>
                    : <><Power size={15} /> {isActive ? 'إيقاف (Inactive)' : 'تفعيل (Active)'}</>}
                </button>
              </div>

              {/* Row 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                    border: '1.5px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'; }}
                >
                  <Download size={15} /> تحميل QR
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('print')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                    border: '1.5px solid #ddd6fe', backgroundColor: '#ede9fe', color: '#5b21b6',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ddd6fe'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ede9fe'; }}
                >
                  <Printer size={15} /> طباعة الكارت
                </button>
              </div>

              {/* Delete Row */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                  border: `1.5px solid ${confirmDelete ? '#ef4444' : '#fca5a5'}`,
                  backgroundColor: confirmDelete ? '#fee2e2' : '#fff5f5',
                  color: '#dc2626',
                  transition: 'all 150ms ease', opacity: isDeleting ? 0.6 : 1,
                  marginTop: '4px',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = confirmDelete ? '#fee2e2' : '#fff5f5'; }}
              >
                <Trash2 size={15} />
                {confirmDelete ? 'تأكيد الحذف — اضغط مرة ثانية' : 'حذف الكارت'}
              </button>

              {confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    fontSize: '0.8125rem', color: '#64748b', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'center', fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  إلغاء الحذف
                </button>
              )}
            </div>

            {editSavedMsg && (
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#047857', backgroundColor: '#d1fae5', padding: '8px 14px', borderRadius: '8px', textAlign: 'center' }}>
                {editSavedMsg}
              </div>
            )}
          </div>
        )}


        {/* ═══════════════════════════════════════ */}
        {/* TAB: INFO → EDIT MODE (inline)          */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'info' && editMode && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              backgroundColor: '#fff', borderRadius: '20px',
              padding: '24px', width: '440px', maxWidth: '90vw',
              display: 'flex', flexDirection: 'column', gap: '16px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>تعديل بيانات الكارت</h3>
                <button type="button" onClick={() => setEditMode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <Input
                label="كود الكارت"
                value={editCardCode}
                onChange={(e) => setEditCardCode(e.target.value)}
                helperText="لا يمكن تعديل الكود من الـ API حالياً"
                disabled
              />

              <Input
                label="NFC UID"
                value={editNfcUid}
                onChange={(e) => setEditNfcUid(e.target.value)}
                placeholder="NFC-XXXXXXXX"
              />

              <Select
                label="نوع الكارت *"
                value={editCardType}
                onChange={(e) => setEditCardType(e.target.value as CardProductType)}
                options={CARD_TYPE_OPTIONS}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" fullWidth onClick={() => setEditMode(false)}>إلغاء</Button>
                <Button variant="primary" fullWidth isLoading={isSavingEdit} onClick={handleSaveEdit}>
                  <Save size={15} /> حفظ
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB: LINK                               */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'link' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              padding: '18px', backgroundColor: '#fff',
              border: '1px solid #e2e8f0', borderRadius: '14px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9375rem' }}>
                <LinkIcon size={18} color="#4f46e5" />
                رابط التوجيه الحالي
              </div>

              <Input
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                helperText="سيتوجه إليه القارئ عند مسح الـ QR أو لمس الـ NFC"
              />

              <Button
                variant="primary" fullWidth isLoading={isSavingUrl}
                onClick={handleSaveUrl}
                style={{ backgroundColor: '#4f46e5', fontWeight: 800 }}
              >
                {urlSaved
                  ? <><Check size={16} /> تم الحفظ!</>
                  : <><Save size={16} /> حفظ الرابط الجديد</>}
              </Button>
            </div>

            {/* Business */}
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '14px', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>
                <Building2 size={16} /> النشاط التجاري المرتبط
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                {card.business_data?.name || card.business_name || 'غير معين'}
              </span>
              {onAssignRequest && (
                <Button variant="outline" size="sm" style={{ marginTop: '10px' }}
                  onClick={() => { onClose(); onAssignRequest(card); }}>
                  <Edit2 size={14} /> ربط / تعيين نشاط
                </Button>
              )}
            </div>

            {/* Digital Preview */}
            <Button
              variant="outline" fullWidth onClick={() => setIsPreviewOpen(true)}
              style={{ backgroundColor: '#0f172a', color: '#dfb75c', borderColor: '#dfb75c', fontWeight: 800 }}
            >
              <Eye size={17} /> معاينة بروفايل العميل
            </Button>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB: QR                                 */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'qr' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div style={{
              padding: '20px', backgroundColor: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%',
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.9375rem' }}>
                رمز الـ QR المباشر لكارت {card.card_code}
              </span>

              <div style={{
                padding: '16px', backgroundColor: '#fff', borderRadius: '16px',
                border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
                minWidth: '200px', minHeight: '200px',
              }}>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt={`QR ${card.card_code}`} style={{ width: '200px', height: '200px' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" /> جاري التوليد...
                  </div>
                )}
              </div>

              {/* Verification */}
              <div style={{
                width: '100%', padding: '12px', borderRadius: '12px', textAlign: 'start',
                backgroundColor: decodedResult?.success ? '#ecfdf5' : '#fffbeb',
                border: `1px solid ${decodedResult?.success ? '#a7f3d0' : '#fde68a'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: decodedResult?.success ? '#047857' : '#b45309' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: decodedResult?.success ? '#047857' : '#b45309' }}>
                    {isVerifying ? 'جاري الفحص...' : decodedResult?.success
                      ? '✓ تم التحقق من سلامة الـ QR'
                      : 'تعذر فك التشفير تلقائياً'}
                  </span>
                </div>
              </div>

              <Button variant="primary" fullWidth onClick={handleDownloadQR}
                style={{ backgroundColor: '#0f172a', color: '#dfb75c', fontWeight: 800 }}>
                <Download size={16} /> تحميل QR بجودة عالية (PNG / SVG)
              </Button>

              <Button variant="outline" fullWidth onClick={copyStatic}>
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                {copiedLink ? 'تم النسخ!' : 'نسخ رابط الكارت الثابت'}
              </Button>
            </div>

            {/* NFC chip info */}
            <div style={{
              width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0',
              borderRadius: '14px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px' }}>
                <Cpu size={20} color="#0f172a" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>شريحة NFC المزدوجة</div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
                  {card.nfc.identifier}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB: PRINT                              */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'print' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <PhysicalCardPreview card={card} showPrintControls={true} />
          </div>
        )}

      </div>

      {/* Digital Profile Preview Modal */}
      <DigitalProfilePreview
        card={card}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </Drawer>
  );
};
