/* ==========================================================================
   BATCH GENERATE CARDS MODAL
   Tab 1 — Batch: quantity + type + category → creates N cards
   Tab 2 — Single: full manual form for one card
   ========================================================================== */

import React, { useState } from 'react';
import { cardsApi } from '../../services';
import { ApiCategory, ApiCreateCardDto, CARD_TYPES } from '../../types';
import { X, Plus, Layers, CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';

type TabId = 'batch' | 'single';

interface Props {
  categories: ApiCategory[];
  onClose: () => void;
  onCreated: () => void;
}

// ── helpers ───────────────────────────────────────────────────────────────
function padNum(n: number) {
  return String(n).padStart(4, '0');
}

export const BatchGenerateCardsModal: React.FC<Props> = ({ categories, onClose, onCreated }) => {
  const [tab, setTab]         = useState<TabId>('batch');

  // Batch state
  const [qty, setQty]         = useState(1);
  const [bType, setBType]     = useState<string>('Social Page');
  const [bCat, setBCat]       = useState('');
  const [bRunning, setBRunning] = useState(false);
  const [bDone, setBDone]     = useState(false);
  const [bCount, setBCount]   = useState(0);
  const [bError, setBError]   = useState<string | null>(null);

  // Single state
  const [sCode, setSCode]     = useState('');
  const [sNfc, setSNfc]       = useState('');
  const [sType, setSType]     = useState<string>('Social Page');
  const [sCat, setSCat]       = useState('');
  const [sUrl, setSUrl]       = useState('');
  const [sBizName, setSBizName] = useState('');
  const [sRunning, setSRunning] = useState(false);
  const [sDone, setSDone]     = useState(false);
  const [sError, setSError]   = useState<string | null>(null);

  // ── Batch create ─────────────────────────────────────────────────────────
  const runBatch = async () => {
    if (qty < 1 || qty > 500) { setBError('الكمية يجب أن تكون بين 1 و 500'); return; }
    setBRunning(true); setBError(null);
    let created = 0;
    try {
      // Determine next card number
      const existing = await cardsApi.getCards({ limit: 100 });
      const nums = (existing.data ?? [])
        .map((c) => { const m = c.card_code.match(/^CARD-(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
        .filter(Boolean);
      let next = nums.length > 0 ? Math.max(...nums) + 1 : 1;

      const origin = window.location.origin;

      for (let i = 0; i < qty; i++) {
        const cardCode = `CARD-${padNum(next + i)}`;
        const nfcUid   = `NFC-${padNum(next + i).padStart(6, '0')}`;
        const redirectUrl = `${origin}/social/${cardCode}`;
        const dto: ApiCreateCardDto = {
          card_code:            cardCode,
          nfc_uid:              nfcUid,
          card_type:            bType,
          current_redirect_url: redirectUrl,
        };
        if (bCat) dto.category_id = bCat;
        await cardsApi.createCard(dto);
        created++;
      }
      setBCount(created);
      setBDone(true);
    } catch (err: any) {
      setBError(err?.message || `فشل الإنشاء — تم إنشاء ${created} بطاقة`);
    } finally {
      setBRunning(false);
    }
  };

  // ── Single create ─────────────────────────────────────────────────────────
  const runSingle = async () => {
    if (!sCode.trim()) { setSError('كود البطاقة مطلوب'); return; }
    if (!sUrl.trim())  { setSError('رابط التوجيه مطلوب'); return; }
    setSRunning(true); setSError(null);
    try {
      const dto: ApiCreateCardDto = {
        card_code:            sCode.trim().toUpperCase(),
        card_type:            sType,
        current_redirect_url: sUrl.trim(),
      };
      if (sNfc.trim())    dto.nfc_uid     = sNfc.trim().toUpperCase();
      if (sCat)           dto.category_id = sCat;
      if (sBizName.trim()) dto.business_data = { business_name: sBizName.trim() };
      await cardsApi.createCard(dto);
      setSDone(true);
    } catch (err: any) {
      setSError(err?.message || 'فشل إنشاء البطاقة');
    } finally {
      setSRunning(false);
    }
  };

  const handleDone = () => {
    onCreated();
    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', zIndex: 400 }} />
      <div
        dir="rtl"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'min(520px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 48px)',
          backgroundColor: '#fff', borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          display: 'flex', flexDirection: 'column',
          zIndex: 401, fontFamily: 'Cairo, sans-serif',
          animation: 'modalIn 220ms cubic-bezier(0.16,1,0.3,1) both',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a' }}>إنشاء بطاقات جديدة</h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '9px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <X size={17} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '12px 16px 0', flexShrink: 0 }}>
          {([['batch', 'إنشاء مجموعة', <Layers size={15} />], ['single', 'بطاقة واحدة', <CreditCard size={15} />]] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '9px', border: 'none',
              cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.875rem',
              backgroundColor: tab === id ? '#6366f1' : '#f1f5f9',
              color: tab === id ? '#fff' : '#64748b',
              transition: 'all 150ms',
            }}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* ── BATCH TAB ── */}
          {tab === 'batch' && (
            bDone
              ? <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <CheckCircle2 size={52} style={{ color: '#10b981', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>تم الإنشاء بنجاح!</h3>
                  <p style={{ color: '#64748b', marginBottom: '24px' }}>تم إنشاء <strong style={{ color: '#6366f1' }}>{bCount}</strong> بطاقة جديدة.</p>
                  <button onClick={handleDone} style={{ ...primBtn, margin: '0 auto' }}>عرض البطاقات</button>
                </div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {bError && <div style={errBanner}>{bError}</div>}

                  <div>
                    <label style={lbl}>الكمية (1 – 500)</label>
                    <input type="number" min={1} max={500} value={qty} onChange={(e) => setQty(Number(e.target.value))} style={inp} />
                  </div>

                  <div>
                    <label style={lbl}>نوع البطاقة</label>
                    <select value={bType} onChange={(e) => setBType(e.target.value)} style={inp}>
                      {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={lbl}>التصنيف (اختياري)</label>
                    <select value={bCat} onChange={(e) => setBCat(e.target.value)} style={inp}>
                      <option value="">— بدون تصنيف —</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px', fontSize: '0.8125rem', color: '#1e40af' }}>
                    💡 سيتم إنشاء {qty} بطاقة بأكواد تسلسلية تلقائية (CARD-XXXX + NFC-XXXXXX)
                  </div>

                  <button onClick={runBatch} disabled={bRunning} style={{ ...primBtn, justifyContent: 'center', opacity: bRunning ? 0.7 : 1, cursor: bRunning ? 'not-allowed' : 'pointer' }}>
                    {bRunning ? <><RefreshCw size={16} className="spin" /> جاري الإنشاء...</> : <><Plus size={16} /> إنشاء {qty} بطاقة</>}
                  </button>
                </div>
          )}

          {/* ── SINGLE TAB ── */}
          {tab === 'single' && (
            sDone
              ? <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <CheckCircle2 size={52} style={{ color: '#10b981', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>تم الإنشاء!</h3>
                  <p style={{ color: '#64748b', marginBottom: '24px' }}>تم إنشاء البطاقة <strong style={{ color: '#6366f1' }}>{sCode}</strong> بنجاح.</p>
                  <button onClick={handleDone} style={{ ...primBtn, margin: '0 auto' }}>عرض البطاقات</button>
                </div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {sError && <div style={errBanner}>{sError}</div>}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={lbl}>كود البطاقة * (CARD-XXXX)</label>
                      <input value={sCode} onChange={(e) => setSCode(e.target.value)} placeholder="CARD-0001" style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>معرف NFC (اختياري)</label>
                      <input value={sNfc} onChange={(e) => setSNfc(e.target.value)} placeholder="NFC-7FJ2K9" style={inp} />
                    </div>
                  </div>

                  <div>
                    <label style={lbl}>نوع البطاقة *</label>
                    <select value={sType} onChange={(e) => setSType(e.target.value)} style={inp}>
                      {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={lbl}>رابط التوجيه *</label>
                    <input value={sUrl} onChange={(e) => setSUrl(e.target.value)} placeholder="https://..." style={inp} />
                  </div>

                  <div>
                    <label style={lbl}>التصنيف (اختياري)</label>
                    <select value={sCat} onChange={(e) => setSCat(e.target.value)} style={inp}>
                      <option value="">— بدون تصنيف —</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={lbl}>اسم النشاط التجاري (اختياري)</label>
                    <input value={sBizName} onChange={(e) => setSBizName(e.target.value)} placeholder="مثال: Coffee House" style={inp} />
                  </div>

                  <button onClick={runSingle} disabled={sRunning} style={{ ...primBtn, justifyContent: 'center', opacity: sRunning ? 0.7 : 1, cursor: sRunning ? 'not-allowed' : 'pointer' }}>
                    {sRunning ? <><RefreshCw size={16} className="spin" /> جاري الإنشاء...</> : <><Plus size={16} /> إنشاء البطاقة</>}
                  </button>
                </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Style atoms ────────────────────────────────────────────────────────────
const primBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '11px 22px', borderRadius: '11px', border: 'none',
  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  color: '#fff', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: '0.9375rem',
  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '6px',
};

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0',
  fontSize: '0.9rem', fontFamily: 'Cairo, sans-serif', color: '#0f172a',
  backgroundColor: '#f8fafc', outline: 'none',
};

const errBanner: React.CSSProperties = {
  backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px',
  padding: '10px 14px', fontSize: '0.875rem', fontWeight: 700, color: '#991b1b',
};
