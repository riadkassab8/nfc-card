import React, { useState } from 'react';
import { cardsApi } from '../../services';
import { ApiCategory, CARD_TYPES } from '../../types';
import { X, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  categories: ApiCategory[];
  onClose: () => void;
  onCreated: () => void;
}

function padNum(n: number) { return String(n).padStart(4, '0'); }

export const BatchGenerateCardsModal: React.FC<Props> = ({ categories, onClose, onCreated }) => {
  /* batch */
  const [qty, setQty]         = useState(1);
  const [bType, setBType]     = useState<string>(CARD_TYPES[0]);
  const [bCat, setBCat]       = useState('');
  const [bRunning, setBRunning] = useState(false);
  const [bDone, setBDone]     = useState(false);
  const [bCount, setBCount]   = useState(0);
  const [bErr, setBErr]       = useState<string | null>(null);

  const runBatch = async () => {
    console.log('[BatchModal] Starting batch creation with:', { qty, bType, bCat });
    if (qty < 1 || qty > 500) { setBErr('الكمية بين 1 و 500'); return; }
    if (!bCat) { setBErr('يجب اختيار تصنيف أولاً'); return; }
    setBRunning(true); setBErr(null);
    let created = 0;
    try {
      // Step 1: get the real total count to avoid missing codes beyond the first page
      const countRes = await cardsApi.getCards({ limit: 1 });
      const realTotal = countRes.total ?? 0;
      console.log('[BatchModal] Current total cards:', realTotal);
      
      // Step 2: fetch all existing cards (up to realTotal + safety buffer)
      const safeLimit = Math.max(realTotal + qty + 50, 200);
      const existing = await cardsApi.getCards({ limit: safeLimit });
      const nums = (existing.data ?? [])
        .map(c => { const m = c.card_code.match(/^CARD-(\d+)$/); return m ? parseInt(m[1]) : 0; })
        .filter(Boolean);
      let next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
      console.log('[BatchModal] Next card number:', next);
      
      const domainOrigin = window.location.origin.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, 'https://smart-card-qr-api.koyeb.app');

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
        console.log('[BatchModal] Creating chunk:', cards.length, 'cards');
        const res = await cardsApi.bulkCreateCards({ cards });
        console.log('[BatchModal] Chunk result:', res);
        created += res.success_count;
        if (res.fail_count > 0) {
          setBErr(`تم إنشاء ${created} بطاقة — فشل ${res.fail_count} بسبب تكرار`);
        }
      }
      console.log('[BatchModal] Total created:', created);
      setBCount(created); setBDone(true);
    } catch (e: any) {
      console.error('[BatchModal] Error:', e);
      setBErr(e?.message || `فشل — تم إنشاء ${created} بطاقة`);
    } finally { setBRunning(false); }
  };

  const handleDone = () => { onCreated(); onClose(); };

  return (
    <div className="modal-overlay">
      <div className="modal-panel" dir="rtl" style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">إنشاء مجموعة بطاقات</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* ════ BATCH ════ */}
          {bDone
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
          }
        </div>

        {/* Footer */}
        {!bDone && (
          <div className="modal-footer">
            <button className="btn-outline" onClick={onClose}>إلغاء</button>
            <button className="btn-primary" onClick={runBatch} disabled={bRunning} style={{ minWidth: '140px', justifyContent: 'center' }}>
              {bRunning ? <><RefreshCw size={14} className="spin" /> إنشاء...</> : <><Plus size={14} /> إنشاء {qty} بطاقة</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
