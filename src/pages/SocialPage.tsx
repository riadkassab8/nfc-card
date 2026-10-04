/* ==========================================================================
   SOCIAL PAGE  /social/:code
   Resolves a card and renders the PublicCardView if it has business_data.
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cardsApi } from '../services';
import { ApiCard } from '../types';
import { PublicCardView } from '../components/public/PublicCardView';
import { AlertCircle, RefreshCw } from 'lucide-react';

type State = 'loading' | 'ok' | 'not_found' | 'no_data' | 'error';

export const SocialPage: React.FC = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const [card, setCard]   = useState<ApiCard | null>(null);
  const [state, setState] = useState<State>('loading');

  const load = async () => {
    if (!publicCode?.trim()) { setState('not_found'); return; }
    setState('loading');
    try {
      const res = await cardsApi.getCards({ search: publicCode.trim(), limit: 10 });
      // Exact match only — never fall back to first result
      const found = (res.data ?? []).find(
        (c) => c.card_code.toLowerCase() === publicCode.toLowerCase() ||
               (c.nfc_uid && c.nfc_uid.toLowerCase() === publicCode.toLowerCase()),
      ) ?? null;

      if (!found)                   { setState('not_found'); return; }
      if (!found.business_data || !Object.values(found.business_data).some(Boolean)) {
        setState('no_data'); return;
      }
      setCard(found); setState('ok');
    } catch {
      setState('error');
    }
  };

  useEffect(() => { load(); }, [publicCode]);

  if (state === 'ok' && card) return <PublicCardView card={card} />;

  return (
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#fff', borderRadius: '20px', padding: '36px 28px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)', textAlign: 'center' }}>

        {state === 'loading' && (
          <>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.65s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#64748b', fontWeight: 600 }}>جاري التحميل...</p>
          </>
        )}

        {(state === 'not_found' || state === 'no_data') && (
          <>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <AlertCircle size={30} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              {state === 'not_found' ? 'الكارت غير موجود' : 'لا توجد بيانات'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
              {state === 'not_found' ? 'هذا الكارت غير متوفر أو تم حذفه.' : 'هذا الكارت لا يحتوي على صفحة تواصل اجتماعي.'}
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <AlertCircle size={30} style={{ color: '#f97316' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>خطأ في الاتصال</h2>
            <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '20px' }}>تعذر تحميل البيانات. تحقق من الإنترنت.</p>
            <button onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 800 }}>
              <RefreshCw size={16} /> إعادة المحاولة
            </button>
          </>
        )}
      </div>
    </div>
  );
};
