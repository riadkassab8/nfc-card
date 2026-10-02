import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cardService } from '../services';
import { CardItem } from '../types';
import { PublicCardView } from '../components/public/PublicCardView';
import { Skeleton, Button } from '../components/ui';
import { AlertCircle, RefreshCw, ArrowRight, ShieldAlert } from 'lucide-react';

export const PublicCardLandingPage: React.FC = () => {
  const { cardId, publicCode } = useParams<{ cardId?: string; publicCode?: string }>();
  const navigate = useNavigate();

  const codeToResolve = cardId || publicCode;

  const [loading, setLoading] = useState<boolean>(true);
  const [card, setCard] = useState<CardItem | null>(null);
  const [errorState, setErrorState] = useState<'none' | 'not_found' | 'error'>('none');

  const fetchCardData = async () => {
    if (!codeToResolve || codeToResolve.trim().length === 0) {
      setErrorState('not_found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorState('none');

    try {
      const resolvedCard = await cardService.resolveCardByPayload(codeToResolve.trim());
      if (resolvedCard) {
        setCard(resolvedCard);
      } else {
        setErrorState('not_found');
      }
    } catch (err) {
      console.error('Failed to resolve public card page:', err);
      setErrorState('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Immediately hide query params from the URL bar to keep it clean (e.g., /c/CARD-0001)
    if (window.location.search) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
    }
    
    // 2. Fetch the card data
    fetchCardData();
  }, [codeToResolve]);

  // 1. LOADING SKELETON STATE
  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #e2e8f0 0%, #fafafa 60%)',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Skeleton style={{ width: '100px', height: '100px', borderRadius: '24px', border: '4px solid #ffffff' }} />
          <Skeleton style={{ width: '200px', height: '28px', borderRadius: '8px', marginTop: '8px' }} />
          <Skeleton style={{ width: '280px', height: '20px', borderRadius: '6px' }} />
          <Skeleton style={{ width: '120px', height: '32px', borderRadius: '9999px', marginTop: '8px' }} />
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
            <Skeleton style={{ width: '100%', height: '80px', borderRadius: '16px' }} />
            <Skeleton style={{ width: '100%', height: '80px', borderRadius: '16px' }} />
            <Skeleton style={{ width: '100%', height: '80px', borderRadius: '16px' }} />
          </div>
        </div>
      </div>
    );
  }

  // 2. INVALID / NOT FOUND STATE
  if (errorState === 'not_found' || !card) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #e2e8f0 0%, #fafafa 60%)',
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '32px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '50%', color: '#ef4444' }}>
            <ShieldAlert size={40} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            الكارت غير موجود
          </h2>

          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            يبدو أن هذا الكارت غير متاح حالياً أو تم حذفه من النظام.
          </p>

          <Button
            variant="primary"
            onClick={() => navigate('/')}
            style={{ marginTop: '8px' }}
          >
            <ArrowRight size={16} /> العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  // 3. API FAILURE / ERROR STATE
  if (errorState === 'error') {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #e2e8f0 0%, #fafafa 60%)',
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '32px 24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ padding: '16px', backgroundColor: '#fffbeb', borderRadius: '50%', color: '#d97706' }}>
            <AlertCircle size={40} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            تعذر تحميل بيانات الكارت
          </h2>

          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.
          </p>

          <Button
            variant="primary"
            onClick={fetchCardData}
            style={{ backgroundColor: '#065f46', marginTop: '8px' }}
          >
            <RefreshCw size={16} /> إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // 4. ROUTING LOGIC: Determine what happens after the card is resolved
  const category = String(card.card_type);
  switch (category) {
    case 'Google Review':
    case 'GOOGLE_REVIEW': {
      const reviewUrl = card.business_data?.google_review_url || 'https://google.com';
      window.location.replace(reviewUrl);
      return null; // Return null while redirecting
    }

    case 'Social':
    case 'Instagram':
    case 'TikTok':
    case 'WhatsApp':
    case 'Google Maps':
    case 'UNIFIED_SOCIAL':
      return <PublicCardView card={card} />;

    case 'Payment':
    case 'InstaPay':
      return <PublicCardView card={card} />;

    default:
      // Fallback
      return <PublicCardView card={card} />;
  }
};
