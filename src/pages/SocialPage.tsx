/* ==========================================================================
   SOCIAL PAGE  /social/:code
   Uses the dedicated GET /social/:card_code public endpoint.
   Falls back to single-link auto-redirect when only one link is present.
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cardsApi } from '../services';
import { ApiSocialPageResponse, BusinessData } from '../types';
import { PublicCardView } from '../components/public/PublicCardView';
import { AlertCircle, RefreshCw } from 'lucide-react';

type State = 'loading' | 'ok' | 'not_found' | 'error';

export const SocialPage: React.FC = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const [social, setSocial] = useState<ApiSocialPageResponse | null>(null);
  const [state, setState]   = useState<State>('loading');

  const load = async () => {
    if (!publicCode?.trim()) { setState('not_found'); return; }
    setState('loading');
    try {
      const res = await cardsApi.getSocialPage(publicCode.trim());

      const biz: BusinessData | null = res.business_data;
      if (!biz) {
        // No profile — nothing to render, show not-found style
        setSocial(res); setState('ok');
        return;
      }

      // Collect non-empty links for single-link auto-redirect
      const links: string[] = [];
      if (biz.whatsapp?.trim())       links.push(biz.whatsapp.trim());
      if (biz.instagram?.trim())      links.push(biz.instagram.trim());
      if (biz.facebook?.trim())       links.push(biz.facebook.trim());
      if (biz.tiktok?.trim())         links.push(biz.tiktok.trim());
      if (biz.google_maps?.trim())    links.push(biz.google_maps.trim());
      if (biz.phone?.trim())          links.push(`tel:${biz.phone.trim()}`);
      if (biz.email?.trim())          links.push(`mailto:${biz.email.trim()}`);
      if (biz.website?.trim())        links.push(biz.website.trim());
      if (biz.instapay?.trim())       links.push(biz.instapay.trim());
      if (biz.vodafone_cash?.trim())  links.push(`tel:${biz.vodafone_cash.trim()}`);

      if (links.length === 1) {
        window.location.replace(links[0]);
        return;
      }

      setSocial(res); setState('ok');
    } catch (err: any) {
      if (err?.statusCode === 404) setState('not_found');
      else setState('error');
    }
  };

  useEffect(() => { load(); }, [publicCode]);

  // Pass a card-shaped object to the existing PublicCardView component
  if (state === 'ok' && social) {
    if (!social.business_data) {
      // Card exists but has no profile yet
      return (
        <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Cairo, sans-serif' }}>
          <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#fff', borderRadius: '20px', padding: '36px 28px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <AlertCircle size={30} style={{ color: '#94a3b8' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              لا توجد بيانات بعد
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
              {social.message || 'لم يتم إضافة بيانات الملف الشخصي لهذه البطاقة.'}
            </p>
          </div>
        </div>
      );
    }

    // Build a minimal card-like object for the existing PublicCardView
    const cardProxy = {
      _id:                    social.card_code,
      card_code:              social.card_code,
      card_type:              social.card_type,
      requires_subscription:  social.requires_subscription,
      business_data:          social.business_data,
      // fill required ApiCard fields with safe defaults
      current_redirect_url:   '',
      status:                 'active' as const,
      subscription_start_date: null,
      subscription_end_date:   null,
      redirect_rules:          [],
      createdAt:               '',
      updatedAt:               '',
    };
    return <PublicCardView card={cardProxy as any} />;
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#fff', borderRadius: '20px', padding: '36px 28px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)', textAlign: 'center' }}>

        {state === 'loading' && (
          <>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.65s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#64748b', fontWeight: 600 }}>جاري التحميل...</p>
          </>
        )}

        {state === 'not_found' && (
          <>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <AlertCircle size={30} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              الكارت غير موجود
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
              هذا الكارت غير متوفر أو تم حذفه.
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
