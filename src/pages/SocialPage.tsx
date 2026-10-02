import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cardService } from '../services';
import { CardItem, getMainCategory } from '../types';
import { PublicCardView } from '../components/public/PublicCardView';
import { Skeleton, Button } from '../components/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const SocialPage: React.FC = () => {
  const { publicCode } = useParams<{ publicCode?: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [card, setCard] = useState<CardItem | null>(null);
  const [errorState, setErrorState] = useState<'none' | 'not_found' | 'invalid_category' | 'error'>('none');

  const fetchCardData = async () => {
    if (!publicCode || publicCode.trim().length === 0) {
      setErrorState('not_found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorState('none');

    try {
      const resolvedCard = await cardService.resolveCardByPayload(publicCode.trim());
      if (resolvedCard) {
        // Enforce Card Category Rule: Must be Social Media
        const category = getMainCategory(resolvedCard.card_type);
        if (category !== 'Social') {
          setErrorState('invalid_category');
        } else {
          setCard(resolvedCard);
        }
      } else {
        setErrorState('not_found');
      }
    } catch (err) {
      console.error('Failed to resolve social page:', err);
      setErrorState('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData();
  }, [publicCode]);

  // 1. LOADING SKELETON STATE
  if (loading) {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Skeleton style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #ffffff' }} />
          <Skeleton style={{ width: '200px', height: '28px', borderRadius: '8px', marginTop: '8px' }} />
          <Skeleton style={{ width: '120px', height: '20px', borderRadius: '9999px', marginTop: '4px' }} />
          
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
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{
          backgroundColor: '#ffffff',
          padding: '40px 32px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
          maxWidth: '420px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <AlertCircle size={32} style={{ color: '#ef4444' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            عذراً، الكارت غير موجود
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            هذا الكارت غير متوفر أو تم حذفه من النظام. يرجى التأكد من مسح الرمز الصحيح.
          </p>
        </div>
      </div>
    );
  }

  // 3. INVALID CATEGORY STATE
  if (errorState === 'invalid_category') {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{
          backgroundColor: '#ffffff',
          padding: '40px 32px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
          maxWidth: '420px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <AlertCircle size={32} style={{ color: '#f97316' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            نوع الكارت غير مطابق
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            هذا الكارت ليس مخصصاً لمنصات التواصل الاجتماعي (Social Media).
          </p>
        </div>
      </div>
    );
  }

  // 4. ERROR STATE
  if (errorState === 'error') {
    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{
          backgroundColor: '#ffffff',
          padding: '40px 32px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
          maxWidth: '420px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <AlertCircle size={32} style={{ color: '#ef4444' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            خطأ في الاتصال
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            حدث خطأ أثناء محاولة جلب بيانات الكارت. يرجى المحاولة مرة أخرى.
          </p>
          <Button 
            onClick={fetchCardData}
            style={{ backgroundColor: '#065f46', marginTop: '8px' }}
          >
            <RefreshCw size={16} /> إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // 5. SUCCESS STATE: Render Public Card View which acts as the Social Page UI
  return <PublicCardView card={card} />;
};
