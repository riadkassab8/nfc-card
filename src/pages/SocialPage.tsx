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
    
    // Always fetch fresh data from API to ensure visit tracking
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
        <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#f5f4f1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Tajawal, sans-serif' }}>
          <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px 28px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertCircle size={32} style={{ color: '#737373' }} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#171717', margin: '0 0 10px' }}>
              لا توجد بيانات بعد
            </h2>
            <p style={{ color: '#737373', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
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
      custom_slug:            social.custom_slug || null,
      card_type:              social.card_type,
      requires_subscription:  social.requires_subscription ?? true,
      business_data:          social.business_data,
      visit_count:            social.visit_count,
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
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#f5f4f1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px 28px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)' }}>

        {state === 'loading' && (
          <>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(0, 0, 0, 0.05)', borderTopColor: '#171717', animation: 'spin 0.65s linear infinite', margin: '0 auto 24px' }} />
            <p style={{ color: '#737373', fontWeight: 600, margin: 0 }}>جاري التحميل...</p>
          </>
        )}

        {state === 'not_found' && (
          <>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #fee2e2' }}>
              <AlertCircle size={32} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#171717', margin: '0 0 10px' }}>
              الكارت غير موجود
            </h2>
            <p style={{ color: '#737373', fontSize: '0.95rem', margin: 0 }}>
              هذا الكارت غير متوفر أو تم حذفه.
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #ffedd5' }}>
              <AlertCircle size={32} style={{ color: '#f97316' }} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#171717', margin: '0 0 10px' }}>خطأ في الاتصال</h2>
            <p style={{ color: '#737373', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>تعذر تحميل البيانات. تحقق من الإنترنت.</p>
            <button onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#171717', color: '#fff', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}>
              <RefreshCw size={18} /> إعادة المحاولة
            </button>
          </>
        )}
      </div>
    </div>
  );
};
