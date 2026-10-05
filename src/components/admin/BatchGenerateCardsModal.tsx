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

function padNum(n: number) { return String(n).padStart(4, '0'); }

export const BatchGenerateCardsModal: React.FC<Props> = ({ categories, onClose, onCreated }) => {
  const [tab, setTab]         = useState<TabId>('batch');

  /* batch */
  const [qty, setQty]         = useState(1);
  const [bType, setBType]     = useState<string>(CARD_TYPES[0]);
  const [bCat, setBCat]       = useState('');
  const [bRunning, setBRunning] = useState(false);
  const [bDone, setBDone]     = useState(false);
  const [bCount, setBCount]   = useState(0);
  const [bErr, setBErr]       = useState<string | null>(null);

  /* single */
  const [sCode, setSCode]     = useState('');
  const [sNfc, setSNfc]       = useState('');
  const [sType, setSType]     = useState<string>(CARD_TYPES[0]);
  const [sCat, setSCat]       = useState('');
  const [sUrl, setSUrl]       = useState('');
  const [sBiz, setSBiz]       = useState('');
  const [sRunning, setSRunning] = useState(false);
  const [sDone, setSDone]     = useState(false);
  const [sErr, setSErr]       = useState<string | null>(null);

  const runBatch = async () => {
    if (qty < 1 || qty > 500) { setBErr('الكمية بين 1 و 500'); return; }
    if (!bCat) { setBErr('يجب اختيار تصنيف أولاً'); return; }
    setBRunning(true); setBErr(null);
    let created = 0;
    try {
      // Step 1: get the real total count to avoid missing codes beyond the first page
      const countRes = await cardsApi.getCards({ limit: 1 });
      const realTotal = countRes.total ?? 0;
      // Step 2: fetch all existing cards (up to realTotal + safety buffer)
      const safeLimit = Math.max(realTotal + qty + 50, 200);
      const existing = await cardsApi.getCards({ limit: safeLimit });
      const nums = (existing.data ?? [])
        .map(c => { const m = c.card_code.match(/^CARD-(\d+)$/); return m ? parseInt(m[1]) : 0; })
        .filter(Boolean);
      let next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
      const domainOrigin = window.location.origin.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, 'https://smartcard-app.com');

      // Use bulk endpoint for chunks of up to 100 cards
      const CHUNK = 100;
      for (let offset = 0; offset < qty; offset += CHUNK) {
        const chunkSize = Math.min(CHUNK, qty - offset);
        const cards = Array.from({ length: chunkSize }, (_, i) => {
          const code = `CARD-${padNum(next + offset + i)}`;
          return {
            card_code: code,
            nfc_uid: `NFC-${padNum(next + offset + i).padStart(6, '0')}`,
            card_type: bType,
            current_redirect_url: `${domainOrigin}/r/${code}`,
            category_id: bCat,
          };
        });
        const res = await cardsApi.bulkCreateCards({ cards });
        created += res.success_count;
        if (res.fail_count > 0) {
          setBErr(`تم إنشاء ${created} بطاقة — فشل ${res.fail_count} بسبب تكرار`);
        }
      }
      setBCount(created); setBDone(true);
    } catch (e: any) {
      setBErr(e?.message || `فشل — تم إنشاء ${created} بطاقة`);
    } finally { setBRunning(false); }
  };

  const runSingle = async () => {
    if (!sCode.trim()) { setSErr('كود البطاقة مطلوب'); return; }
    if (!sUrl.trim())  { setSErr('رابط التوجيه مطلوب'); return; }
    if (!sCat)         { setSErr('يجب اختيار تصنيف أولاً'); return; }
    setSRunning(true); setSErr(null);
    try {
      let formattedUrl = sUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      formattedUrl = formattedUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, 'https://smartcard-app.com');
      const dto: ApiCreateCardDto = {
        card_code: sCode.trim().toUpperCase(),
        card_type: sType,
        current_redirect_url: formattedUrl,
      };
      if (sNfc.trim()) dto.nfc_uid = sNfc.trim().toUpperCase();
      dto.category_id = sCat;
      if (sBiz.trim()) dto.business_data = { business_name: sBiz.trim() };
      await cardsApi.createCard(dto);
      setSDone(true);
    } catch (e: any) { setSErr(e?.message || 'فشل الإنشاء'); }
    finally { setSRunning(false); }
  };

  const handleDone = () => { onCreated(); onClose(); };

  /* tab button style */
  const tabBtn = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 16px', borderRadius: 'var(--r-md)', border: 'none',
    cursor: 'pointer', fontFamily: 'var(--font)',
    fontSize: 'var(--fs-sm)', fontWeight: active ? 700 : 500,
    backgroundColor: active ? 'var(--clr-primary-500)' : 'var(--bg-subtle)',
    color: active ? '#fff' : 'var(--txt-secondary)',
    transition: 'all 140ms var(--ease)',
  });

  return (
    <div className="modal-overlay">
      <div className="modal-panel" dir="rtl" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">إنشاء بطاقات جديدة</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '12px 20px 0', display: 'flex', gap: '6px', borderBottom: '1px solid var(--bdr-light)', paddingBottom: '12px' }}>
          <button style={tabBtn(tab === 'batch')}  onClick={() => setTab('batch')}>
            <Layers size={14} /> مجموعة
          </button>
          <button style={tabBtn(tab === 'single')} onClick={() => setTab('single')}>
            <CreditCard size={14} /> بطاقة واحدة
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* ════ BATCH ════ */}
          {tab === 'batch' && (
            bDone
              ? <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={52} style={{ color: 'var(--clr-success)', marginBottom: '14px' }} />
                  <h3 style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--txt-heading)', marginBottom: '8px' }}>
                    تم الإنشاء!
                  </h3>
                  <p style={{ color: 'var(--txt-secondary)', marginBottom: '22px', fontSize: 'var(--fs-base)' }}>
                    تم إنشاء <strong style={{ color: 'var(--clr-primary-600)' }}>{bCount}</strong> بطاقة بنجاح
                  </p>
                  <button className="btn-primary" onClick={handleDone} style={{ margin: '0 auto', justifyContent: 'center' }}>
                    عرض البطاقات
                  </button>
                </div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bErr && <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', color: 'var(--clr-error)', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{bErr}</div>}

                  <div className="form-group">
                    <label className="form-label">الكمية (1 – 500)</label>
                    <input type="number" min={1} max={500} value={qty} onChange={e => setQty(Number(e.target.value))} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">نوع البطاقة</label>
                    <select value={bType} onChange={e => setBType(e.target.value)} className="form-input">
                      {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">التصنيف <span style={{ color: 'var(--clr-error)' }}>*</span></label>
                    <select value={bCat} onChange={e => setBCat(e.target.value)} className="form-input">
                      <option value="">— اختر تصنيفاً —</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div style={{ backgroundColor: 'var(--clr-primary-50)', borderRadius: 'var(--r-md)', padding: '11px 14px', border: '1px solid var(--clr-primary-200)', fontSize: 'var(--fs-sm)', color: 'var(--clr-primary-800)' }}>
                    سيتم إنشاء <strong>{qty}</strong> بطاقة بأكواد تسلسلية تلقائية (CARD-XXXX)
                  </div>
                </div>
          )}

          {/* ════ SINGLE ════ */}
          {tab === 'single' && (
            sDone
              ? <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={52} style={{ color: 'var(--clr-success)', marginBottom: '14px' }} />
                  <h3 style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--txt-heading)', marginBottom: '8px' }}>تم الإنشاء!</h3>
                  <p style={{ color: 'var(--txt-secondary)', marginBottom: '22px' }}>
                    البطاقة <strong style={{ color: 'var(--clr-primary-600)' }}>{sCode}</strong> جاهزة
                  </p>
                  <button className="btn-primary" onClick={handleDone} style={{ margin: '0 auto', justifyContent: 'center' }}>
                    عرض البطاقات
                  </button>
                </div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {sErr && <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--clr-error-bg)', border: '1px solid var(--clr-error-bdr)', color: 'var(--clr-error)', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{sErr}</div>}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">كود البطاقة * (CARD-XXXX)</label>
                      <input className="form-input" value={sCode} onChange={e => setSCode(e.target.value)} placeholder="CARD-0001" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">معرف NFC (اختياري)</label>
                      <input className="form-input" value={sNfc} onChange={e => setSNfc(e.target.value)} placeholder="NFC-7FJ2K9" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">نوع البطاقة *</label>
                    <select value={sType} onChange={e => setSType(e.target.value)} className="form-input">
                      {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">رابط التوجيه *</label>
                    <input className="form-input" value={sUrl} onChange={e => setSUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">التصنيف <span style={{ color: 'var(--clr-error)' }}>*</span></label>
                    <select value={sCat} onChange={e => setSCat(e.target.value)} className="form-input">
                      <option value="">— اختر تصنيفاً —</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">اسم النشاط (اختياري)</label>
                    <input className="form-input" value={sBiz} onChange={e => setSBiz(e.target.value)} placeholder="مثال: Coffee House" />
                  </div>
                </div>
          )}
        </div>

        {/* Footer */}
        {!bDone && !sDone && (
          <div className="modal-footer">
            <button className="btn-outline" onClick={onClose}>إلغاء</button>
            {tab === 'batch'
              ? <button className="btn-primary" onClick={runBatch} disabled={bRunning} style={{ minWidth: '140px', justifyContent: 'center' }}>
                  {bRunning ? <><RefreshCw size={14} className="spin" /> إنشاء...</> : <><Plus size={14} /> إنشاء {qty} بطاقة</>}
                </button>
              : <button className="btn-primary" onClick={runSingle} disabled={sRunning} style={{ minWidth: '140px', justifyContent: 'center' }}>
                  {sRunning ? <><RefreshCw size={14} className="spin" /> إنشاء...</> : <><Plus size={14} /> إنشاء البطاقة</>}
                </button>}
          </div>
        )}
      </div>
    </div>
  );
};
