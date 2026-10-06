/* ==========================================================================
   PUBLIC CARD LANDING  /card/:cardId  /c/:publicCode  /r/:publicCode
   Resolves a card and renders the PublicCardView.
   Direct-redirect cards (Google Review etc.) are handled server-side by
   GET /r/:identifier — if the user reaches this page, backend didn't redirect,
   meaning it's a Social Page or similar display card.
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cardsApi } from '../services';
import { ApiCard, BusinessData } from '../types';
import { PublicCardView } from '../components/public/PublicCardView';
import { AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

type State = 'loading' | 'ok' | 'not_found' | 'error';

export const PublicCardLandingPage: React.FC = () => {
  const { cardId, publicCode } = useParams<{ cardId?: string; publicCode?: string }>();
  const navigate = useNavigate();
  const code = cardId ?? publicCode ?? '';

  const [card, setCard] = useState<ApiCard | null>(null);
  const [state, setState] = useState<State>('loading');

  const load = async () => {
    if (!code.trim()) { setState('not_found'); return; }

    // Strip query params from URL bar
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);

    // Always fetch fresh data from API to ensure visit tracking
    setState('loading');
    try {
      const res = await cardsApi.getSocialPage(code.trim());

      const biz: BusinessData | null = res.business_data;
      if (!biz) {
        const cardProxy: ApiCard = {
          _id: res.card_code,
          card_code: res.card_code,
          custom_slug: res.custom_slug || null,
          card_type: res.card_type,
          requires_subscription: res.requires_subscription ?? true,
          business_data: null,
          current_redirect_url: '',
          status: 'active',
          subscription_start_date: null,
          subscription_end_date: null,
          redirect_rules: [],
          createdAt: '',
          updatedAt: '',
        };
        setCard(cardProxy);
        setState('ok');
        return;
      }

      const links: string[] = [];
      if (biz.whatsapp?.trim()) links.push(biz.whatsapp.trim());
      if (biz.instagram?.trim()) links.push(biz.instagram.trim());
      if (biz.facebook?.trim()) links.push(biz.facebook.trim());
      if (biz.tiktok?.trim()) links.push(biz.tiktok.trim());
      if (biz.google_maps?.trim()) links.push(biz.google_maps.trim());
      if (biz.phone?.trim()) links.push(`tel:${biz.phone.trim()}`);
      if (biz.email?.trim()) links.push(`mailto:${biz.email.trim()}`);
      if (biz.website?.trim()) links.push(biz.website.trim());
      if (biz.instapay?.trim()) links.push(biz.instapay.trim());
      if (biz.vodafone_cash?.trim()) links.push(`tel:${biz.vodafone_cash.trim()}`);

      if (links.length === 1) {
        window.location.replace(links[0]);
        return;
      }

      const cardProxy: ApiCard = {
        _id: res.card_code,
        card_code: res.card_code,
        custom_slug: res.custom_slug || null,
        card_type: res.card_type,
        requires_subscription: res.requires_subscription ?? true,
        business_data: biz,
        visit_count: res.visit_count,
        current_redirect_url: '',
        status: 'active',
        subscription_start_date: null,
        subscription_end_date: null,
        redirect_rules: [],
        createdAt: '',
        updatedAt: '',
      };

      setCard(cardProxy);
      setState('ok');
    } catch (err: any) {
      if (err?.statusCode === 404) {
        setState('not_found');
      } else {
        setState('error');
      }
    }
  };

  useEffect(() => { load(); }, [code]);

  if (state === 'ok' && card) return <PublicCardView card={card} />;

  return (
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#f5f4f1', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(226, 232, 240, 0.4) 0%, #f5f4f1 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#fff', borderRadius: '20px', padding: '36px 28px', boxShadow: '0 10px 28px rgba(0,0,0,0.06)', textAlign: 'center' }}>

        {state === 'loading' && (
          <>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.65s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#64748b', fontWeight: 600 }}>جاري التحميل...</p>
          </>
        )}

        {state === 'not_found' && (
          <>
            <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'inline-flex', marginBottom: '16px' }}>
              <AlertCircle size={36} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>الكارت غير موجود</h2>
            <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '20px' }}>يبدو أن هذا الكارت غير متاح أو تم حذفه.</p>
            <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '10px', border: 'none', backgroundColor: '#0f172a', color: '#fff', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontWeight: 800 }}>
              <ArrowRight size={16} /> الصفحة الرئيسية
            </button>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ padding: '16px', backgroundColor: '#fffbeb', borderRadius: '50%', display: 'inline-flex', marginBottom: '16px' }}>
              <AlertCircle size={36} style={{ color: '#d97706' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>تعذر التحميل</h2>
            <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '20px' }}>حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.</p>
            <button onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontWeight: 800 }}>
              <RefreshCw size={16} /> إعادة المحاولة
            </button>
          </>
        )}
      </div>
    </div>
  );
};
