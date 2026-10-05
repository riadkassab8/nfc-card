import React, { useState, useEffect, useCallback } from 'react';
import { cardsApi } from '../../services';
import {
  ApiCard, ApiCategory, ApiCardHistory, RedirectRule,
  BusinessData, fmtDate, isSubscriptionExpired,
  getPopulatedCategory, ApiUpdateRedirectRulesDto,
} from '../../types';
import {
  X, Info, Link as LinkIcon, QrCode, History,
  Copy, Check, Download, Power, Trash2, RefreshCw,
  Save, Edit2, ExternalLink, GitBranch, Plus,
  AlertCircle, GripVertical,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';

type ToastType = 'success' | 'error' | 'info';
type Tab = 'info' | 'redirect' | 'rules' | 'qr' | 'history';

export interface CardDetailsDrawerProps {
  card: ApiCard | null;
  categories: ApiCategory[];
  onClose: () => void;
  onUpdated: (card: ApiCard) => void;
  onDeleted: (id: string) => void;
  onToast: (msg: string, type?: ToastType) => void;
}

/* ── Field cell ──────────────────────────────────────────────────── */
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

/* ── Tab button ──────────────────────────────────────────────────── */
const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }> = ({ active, onClick, icon, label, badge }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 13px', borderRadius: 'var(--r-md)', border: 'none',
    cursor: 'pointer', fontFamily: 'var(--font)',
    fontSize: 'var(--fs-sm)', fontWeight: active ? 700 : 500,
    backgroundColor: active ? 'var(--clr-primary-500)' : 'transparent',
    color: active ? '#fff' : 'var(--txt-secondary)',
    transition: 'all 140ms var(--ease)',
    whiteSpace: 'nowrap', position: 'relative',
  }}>
    {icon} {label}
    {badge !== undefined && badge > 0 && (
      <span style={{
        minWidth: '16px', height: '16px', borderRadius: '8px',
        backgroundColor: active ? 'rgba(255,255,255,0.3)' : 'var(--clr-primary-500)',
        color: active ? '#fff' : '#fff',
        fontSize: '10px', fontWeight: 800,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px',
      }}>{badge}</span>
    )}
  </button>
);

/* ═══════════════════════════════════════════════════════════════════
   REDIRECT RULES EDITOR
   ═══════════════════════════════════════════════════════════════════ */
const DEVICE_OPTIONS = ['any', 'mobile', 'tablet', 'desktop'] as const;
const DEVICE_LABELS: Record<string, string> = {
  any: 'أي جهاز', mobile: 'موبايل', tablet: 'تابلت', desktop: 'ديسكتوب',
};

/* ── 12-hour helpers ─────────────────────────────────────────────────── */
type AmPm = 'am' | 'pm';

/** تحويل 24h → 12h (للعرض في الـ UI) */
const to12h = (hour24: number | null): { hour: number | null; period: AmPm } => {
  if (hour24 === null || hour24 === undefined) return { hour: null, period: 'am' };
  if (hour24 === 0)  return { hour: 12, period: 'am' };
  if (hour24 === 12) return { hour: 12, period: 'pm' };
  if (hour24 < 12)   return { hour: hour24, period: 'am' };
  return { hour: hour24 - 12, period: 'pm' };
};


type DraftRule = RedirectRule & {
  _key: string;
  /* حقول UI فقط — مش بتتبعت للـ API */
  _hour_from_12: number | null;
  _period_from: AmPm;
  _hour_to_12: number | null;
  _period_to: AmPm;
};

/** تحويل RedirectRule → DraftRule */
const toDraft = (r: RedirectRule): DraftRule => {
  // If period_from exists on rule, use it directly (12h format); otherwise fallback to to12h conversion
  let hf: number | null = null;
  let pf: AmPm = 'am';
  if (r.period_from != null && r.hour_from != null) {
    hf = r.hour_from;
    pf = r.period_from;
  } else if (r.hour_from != null) {
    const res = to12h(r.hour_from);
    hf = res.hour;
    pf = res.period;
  }

  let ht: number | null = null;
  let pt: AmPm = 'am';
  if (r.period_to != null && r.hour_to != null) {
    ht = r.hour_to;
    pt = r.period_to;
  } else if (r.hour_to != null) {
    const res = to12h(r.hour_to);
    ht = res.hour;
    pt = res.period;
  }

  return {
    ...r,
    _key: Math.random().toString(36).slice(2),
    _hour_from_12: hf,
    _period_from: pf,
    _hour_to_12: ht,
    _period_to: pt,
  };
};

const emptyRule = (): DraftRule => ({
  _key: Math.random().toString(36).slice(2),
  device_target: 'any',
  redirect_url: '',
  priority: 0,
  is_active: true,
  label: '',
  hour_from: null,
  period_from: null,
  hour_to: null,
  period_to: null,
  _hour_from_12: null,
  _period_from: 'am',
  _hour_to_12: null,
  _period_to: 'am',
});

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12

const RulesTab: React.FC<{ card: ApiCard; onUpdated: (c: ApiCard) => void; onToast: (m: string, t?: ToastType) => void }> = ({ card, onUpdated, onToast }) => {
  const [rules, setRules] = useState<DraftRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  /* seed from card */
  useEffect(() => {
    setRules((card.redirect_rules ?? []).map(toDraft));
    setDirty(false);
  }, [card._id]);

  const update = (key: string, field: keyof DraftRule, value: any) => {
    setRules(prev => prev.map(r => {
      if (r._key !== key) return r;
      const next = { ...r, [field]: value };
      /* تزامن الساعات 12h مع الـ fields الأساسية */
      if (field === '_hour_from_12' || field === '_period_from') {
        const h12 = field === '_hour_from_12' ? value : next._hour_from_12;
        const prd = field === '_period_from'  ? value : next._period_from;
        next.hour_from = h12;
        next.period_from = h12 != null ? prd : null;
      }
      if (field === '_hour_to_12' || field === '_period_to') {
        const h12 = field === '_hour_to_12' ? value : next._hour_to_12;
        const prd = field === '_period_to'   ? value : next._period_to;
        next.hour_to = h12;
        next.period_to = h12 != null ? prd : null;
      }
      return next;
    }));
    setDirty(true);
  };

  const addRule = () => {
    const next = rules.length > 0 ? Math.max(...rules.map(r => r.priority)) + 1 : 1;
    setRules(prev => [...prev, { ...emptyRule(), priority: next }]);
    setDirty(true);
  };

  const removeRule = (key: string) => {
    setRules(prev => prev.filter(r => r._key !== key));
    setDirty(true);
  };

  const save = async () => {
    /* validate */
    for (const r of rules) {
      if (!r.redirect_url.trim()) { onToast('كل rule لازم يكون عنده redirect_url', 'error'); return; }
      if (!/^https?:\/\//i.test(r.redirect_url.trim())) { onToast(`الرابط غير صالح: ${r.redirect_url}`, 'error'); return; }
    }
    setSaving(true);
    try {
      const dto: ApiUpdateRedirectRulesDto = {
        rules: rules.map(({ _key, _hour_from_12, _period_from, _hour_to_12, _period_to, ...r }) => ({
          ...r,
          hour_from: _hour_from_12 ?? undefined,
          period_from: _hour_from_12 != null ? _period_from : undefined,
          hour_to: _hour_to_12 ?? undefined,
          period_to: _hour_to_12 != null ? _period_to : undefined,
          redirect_url: r.redirect_url.trim(),
          label: r.label?.trim() || undefined,
        })),
      };
      const updated = await cardsApi.updateRedirectRules(card._id, dto);
      onUpdated(updated);
      setDirty(false);
      onToast('تم حفظ القواعد ✓');
    } catch (e: any) {
      onToast(e?.message || 'فشل الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const clearAll = async () => {
    setSaving(true);
    try {
      const updated = await cardsApi.updateRedirectRules(card._id, { rules: [] });
      onUpdated(updated);
      setRules([]);
      setDirty(false);
      onToast('تم مسح كل القواعد');
    } catch (e: any) {
      onToast(e?.message || 'فشل', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Explainer */}
      <div style={{ backgroundColor: 'var(--clr-info-bg)', borderRadius: 'var(--r-md)', padding: '11px 14px', border: '1px solid var(--clr-info-bdr)', fontSize: 'var(--fs-sm)', color: 'var(--clr-info)', lineHeight: 1.6 }}>
        💡 القواعد بتوجّه الزوار لروابط مختلفة حسب الجهاز أو الوقت. لو مفيش rule اتطابق — بيروح لـ <strong>Redirect الأساسي</strong>.
      </div>

      {/* Rules list */}
      {rules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--txt-muted)' }}>
          <GitBranch size={36} style={{ marginBottom: '10px', color: 'var(--bdr-medium)' }} />
          <p style={{ margin: 0, fontSize: 'var(--fs-sm)', fontWeight: 600 }}>لا توجد قواعد — اضغط "إضافة" لإنشاء أول rule</p>
        </div>
      )}

      {rules.map((rule, idx) => (
        <div key={rule._key} style={{
          backgroundColor: rule.is_active ? 'var(--bg-white)' : 'var(--bg-subtle)',
          border: `1.5px solid ${rule.is_active ? 'var(--bdr-light)' : 'var(--bdr-light)'}`,
          borderRadius: 'var(--r-lg)', padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          opacity: rule.is_active ? 1 : 0.65,
        }}>

          {/* Rule header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GripVertical size={16} style={{ color: 'var(--txt-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--txt-muted)', minWidth: '20px' }}>#{idx + 1}</span>

            {/* Label */}
            <input
              className="form-input"
              value={rule.label || ''}
              onChange={e => update(rule._key, 'label', e.target.value)}
              placeholder="اسم القاعدة (اختياري)"
              style={{ flex: 1, fontSize: 'var(--fs-sm)', padding: '6px 10px' }}
            />

            {/* Active toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={rule.is_active}
                onChange={e => update(rule._key, 'is_active', e.target.checked)}
                style={{ accentColor: 'var(--clr-primary-500)', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--txt-secondary)' }}>مفعّل</span>
            </label>

            {/* Delete */}
            <button
              onClick={() => removeRule(rule._key)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: 'var(--r-sm)', border: 'none', backgroundColor: 'var(--clr-error-bg)', color: 'var(--clr-error)', cursor: 'pointer', flexShrink: 0 }}
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Rule fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

            {/* Device */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 'var(--fs-xs)' }}>الجهاز *</label>
              <select
                className="form-input"
                value={rule.device_target}
                onChange={e => update(rule._key, 'device_target', e.target.value)}
                style={{ fontSize: 'var(--fs-sm)', padding: '6px 10px' }}
              >
                {DEVICE_OPTIONS.map(d => <option key={d} value={d}>{DEVICE_LABELS[d]}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 'var(--fs-xs)' }}>الأولوية (الأصغر أعلى)</label>
              <input
                type="number"
                className="form-input"
                value={rule.priority}
                onChange={e => update(rule._key, 'priority', Number(e.target.value))}
                min={0}
                style={{ fontSize: 'var(--fs-sm)', padding: '6px 10px' }}
              />
            </div>

            {/* Hour from */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 'var(--fs-xs)' }}>من الساعة — اختياري</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <select
                  className="form-input"
                  value={rule._hour_from_12 ?? ''}
                  onChange={e => update(rule._key, '_hour_from_12', e.target.value === '' ? null : Number(e.target.value))}
                  style={{ fontSize: 'var(--fs-sm)', padding: '6px 6px', flex: 1 }}
                >
                  <option value="">—</option>
                  {HOURS_12.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select
                  className="form-input"
                  value={rule._period_from}
                  onChange={e => update(rule._key, '_period_from', e.target.value as AmPm)}
                  disabled={rule._hour_from_12 === null}
                  style={{ fontSize: 'var(--fs-sm)', padding: '6px 6px', width: '68px', opacity: rule._hour_from_12 === null ? 0.4 : 1 }}
                >
                  <option value="am">ص</option>
                  <option value="pm">م</option>
                </select>
              </div>
            </div>

            {/* Hour to */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 'var(--fs-xs)' }}>إلى الساعة — اختياري</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <select
                  className="form-input"
                  value={rule._hour_to_12 ?? ''}
                  onChange={e => update(rule._key, '_hour_to_12', e.target.value === '' ? null : Number(e.target.value))}
                  style={{ fontSize: 'var(--fs-sm)', padding: '6px 6px', flex: 1 }}
                >
                  <option value="">—</option>
                  {HOURS_12.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select
                  className="form-input"
                  value={rule._period_to}
                  onChange={e => update(rule._key, '_period_to', e.target.value as AmPm)}
                  disabled={rule._hour_to_12 === null}
                  style={{ fontSize: 'var(--fs-sm)', padding: '6px 6px', width: '68px', opacity: rule._hour_to_12 === null ? 0.4 : 1 }}
                >
                  <option value="am">ص</option>
                  <option value="pm">م</option>
                </select>
              </div>
            </div>
          </div>

          {/* Redirect URL — full width */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 'var(--fs-xs)' }}>رابط التحويل *</label>
            <input
              className="form-input"
              type="url"
              value={rule.redirect_url}
              onChange={e => update(rule._key, 'redirect_url', e.target.value)}
              placeholder="https://..."
              style={{ fontSize: 'var(--fs-sm)', padding: '6px 10px' }}
            />
          </div>
        </div>
      ))}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
        <button className="btn-outline" onClick={addRule} style={{ fontSize: 'var(--fs-sm)', padding: '8px 14px' }}>
          <Plus size={14} /> إضافة rule
        </button>
        {dirty && (
          <button className="btn-primary" onClick={save} disabled={saving} style={{ fontSize: 'var(--fs-sm)', padding: '8px 18px' }}>
            {saving ? <><RefreshCw size={13} className="spin" /> حفظ...</> : <><Save size={13} /> حفظ القواعد</>}
          </button>
        )}
        {rules.length > 0 && !dirty && (
          <button
            className="btn-outline"
            style={{ fontSize: 'var(--fs-sm)', padding: '8px 14px', borderColor: 'var(--clr-error-bdr)', color: 'var(--clr-error)', marginInlineStart: 'auto' }}
            onClick={clearAll} disabled={saving}
          >
            <Trash2 size={13} /> مسح الكل
          </button>
        )}
      </div>

      {/* Hour hint */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', padding: '10px 13px', border: '1px solid var(--bdr-light)' }}>
        <AlertCircle size={14} style={{ color: 'var(--txt-muted)', flexShrink: 0, marginTop: '1px' }} />
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)', lineHeight: 1.6 }}>
          الساعات بالتوقيت المصري (ص = صباح، م = مساء). مثال: نهار ٩ص–٥م، ليل ١٠م–٨ص.
          النظام بيحوّل تلقائياً للتوقيت العالمي (UTC) قبل الحفظ.
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN DRAWER
   ═══════════════════════════════════════════════════════════════════ */
export const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({
  card, onClose, onUpdated, onDeleted, onToast,
}) => {
  const navigate = useNavigate();
  const [tab, setTab]               = useState<Tab>('info');
  const [newUrl, setNewUrl]         = useState('');
  const [savingUrl, setSavingUrl]   = useState(false);
  const [qrDataUrl, setQrDataUrl]   = useState<string | null>(null);
  const [qrLoading, setQrLoading]   = useState(false);
  const [history, setHistory]       = useState<ApiCardHistory[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histLoaded, setHistLoaded] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [toggling, setToggling]     = useState(false);
  const [renewing, setRenewing]     = useState(false);
  const [copied, setCopied]         = useState<string | null>(null);

  /* reset on card change */
  useEffect(() => {
    if (!card) return;
    setTab('info'); setConfirmDel(false);
    setNewUrl(card.current_redirect_url || '');
    setQrDataUrl(null); setHistory([]); setHistLoaded(false);
  }, [card]);

  /* QR */
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

  /* History */
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

  const isActive  = card.status === 'active';
  const expired   = isSubscriptionExpired(card);
  const cat       = getPopulatedCategory(card.category_id);
  const staticUrl = `${window.location.origin}/r/${card.card_code}`;
  const rulesCount = (card.redirect_rules ?? []).length;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  /* actions */
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

  const handleSaveEdit = () => {
    onClose();
    navigate('/admin/add-card', { state: { cardToEdit: card } });
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
          width: 'min(520px, 100vw)',
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
              {!card.requires_subscription && <span className="badge badge-success">دائم ♾</span>}
              {expired && <span className="badge badge-warning">⚠ منتهية</span>}
              {rulesCount > 0 && <span className="badge badge-blue">⚡ {rulesCount} rules</span>}
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
          <TabBtn active={tab === 'info'}     onClick={() => setTab('info')}     icon={<Info size={13} />}        label="المعلومات" />
          <TabBtn active={tab === 'redirect'} onClick={() => setTab('redirect')} icon={<LinkIcon size={13} />}     label="الرابط" />
          <TabBtn active={tab === 'rules'}    onClick={() => setTab('rules')}    icon={<GitBranch size={13} />}   label="القواعد" badge={rulesCount} />
          <TabBtn active={tab === 'qr'}       onClick={() => setTab('qr')}       icon={<QrCode size={13} />}      label="رمز QR" />
          <TabBtn active={tab === 'history'}  onClick={() => setTab('history')}  icon={<History size={13} />}     label="السجل" />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

          {/* ════ INFO ════ */}
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Edit button */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '7px 14px' }} onClick={handleSaveEdit}>
                  <Edit2 size={13} /> تعديل
                </button>
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
                  <span style={{ fontFamily: 'monospace' }}>{card.nfc_uid || '—'}</span>
                </Field>
                <Field label="نوع البطاقة">{card.card_type}</Field>
                <Field label="التصنيف">{cat?.name || '—'}</Field>
                <Field label="نوع الاشتراك">
                  {card.requires_subscription
                    ? <span className="badge badge-warning">باشتراك</span>
                    : <span className="badge badge-success">دائم ♾</span>}
                </Field>
                <Field label="بداية الاشتراك">
                  {card.requires_subscription ? fmtDate(card.subscription_start_date) : '—'}
                </Field>
                <Field label="نهاية الاشتراك">
                  {card.requires_subscription
                    ? (
                      <span style={{ color: expired ? 'var(--clr-error)' : undefined }}>
                        {fmtDate(card.subscription_end_date)} {expired ? '⚠' : ''}
                      </span>
                    )
                    : <span style={{ color: 'var(--clr-success)', fontWeight: 700 }}>دائم</span>}
                </Field>
                <Field label="قواعد التحويل">
                  {rulesCount > 0
                    ? <button onClick={() => setTab('rules')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-primary-600)', fontWeight: 700, fontFamily: 'var(--font)', fontSize: 'var(--fs-sm)', padding: 0 }}>⚡ {rulesCount} rules — عرض</button>
                    : <span style={{ color: 'var(--txt-muted)' }}>لا توجد</span>}
                </Field>
                <Field label="تاريخ الإنشاء">{fmtDate(card.createdAt)}</Field>
                <Field label="آخر تحديث">{fmtDate(card.updatedAt)}</Field>
              </div>

              {/* Static URL */}
              <div style={{ backgroundColor: 'var(--clr-primary-50)', borderRadius: 'var(--r-lg)', padding: '13px 16px', border: '1px solid var(--clr-primary-200)' }}>
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--clr-primary-700)', marginBottom: '6px' }}>الرابط الثابت (NFC / QR)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-primary-800)', flex: 1, wordBreak: 'break-all' }}>{staticUrl}</code>
                  <button onClick={() => copyText(staticUrl, 'static')} style={iconBtnStyle}>
                    {copied === 'static' ? <Check size={12} style={{ color: 'var(--clr-success)' }} /> : <Copy size={12} />}
                  </button>
                  <a href={staticUrl} target="_blank" rel="noopener noreferrer" style={{ ...iconBtnStyle, textDecoration: 'none', color: 'var(--clr-primary-600)' }}>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Social Page */}
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: 'var(--r-lg)', padding: '13px 16px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>صفحة الأزرار التفاعلية (Social Page)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ fontSize: 'var(--fs-xs)', color: '#166534', flex: 1, wordBreak: 'break-all' }}>{`${window.location.origin}/r/${card.card_code}`}</code>
                  <button onClick={() => copyText(`${window.location.origin}/r/${card.card_code}`, 'socialPreview')} style={iconBtnStyle}>
                    {copied === 'socialPreview' ? <Check size={12} style={{ color: 'var(--clr-success)' }} /> : <Copy size={12} />}
                  </button>
                  <a href={`/r/${card.card_code}`} target="_blank" rel="noopener noreferrer" style={{ ...iconBtnStyle, textDecoration: 'none', color: '#fff', backgroundColor: '#16a34a', padding: '4px 10px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    <ExternalLink size={12} /> فتح
                  </a>
                </div>
              </div>

              {/* Business data */}
              {card.business_data && Object.values(card.business_data).some(Boolean) && (
                <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--r-lg)', padding: '14px 16px', border: '1px solid var(--bdr-light)' }}>
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
                <button className="btn-outline" style={{ fontSize: 'var(--fs-sm)', padding: '8px 14px' }} onClick={handleRenew} disabled={renewing || !card.requires_subscription} title={!card.requires_subscription ? 'الكارت دائم — لا يحتاج تجديد' : undefined}>
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
                غيّر رابط التوجيه الأساسي. لو عندك <strong>Redirect Rules</strong> مفعّلة — بيأخذ أولوية عليه.
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

          {/* ════ REDIRECT RULES ════ */}
          {tab === 'rules' && (
            <RulesTab card={card} onUpdated={onUpdated} onToast={onToast} />
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
