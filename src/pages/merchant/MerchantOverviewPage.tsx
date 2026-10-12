import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cardsApi } from '../../services';
import { ApiCard, fmtDate, isSubscriptionExpired } from '../../types';
import QRCode from 'qrcode';

export const MerchantOverviewPage: React.FC = () => {
  const { admin } = useAuth();
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const storeTitle = admin?.store_name || admin?.name || 'متجري الذكي';

  // تفاصيل اشتراك المتجر في النظام
  const isPermanent = !admin?.requires_subscription || admin?.subscription_type === 'permanent';
  const subEndDate = admin?.subscription_end_date ? new Date(admin.subscription_end_date) : null;
  const now = new Date();
  const diffDays = subEndDate ? Math.ceil((subEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const endDateFormatted = subEndDate ? subEndDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const loadCards = async () => {
    setLoading(true);
    try {
      // Backend automatically restricts to admin.assigned_cards for merchant
      const res = await cardsApi.getCards({ limit: 50 });
      setCards(res.data || []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const copyUrl = (card: ApiCard) => {
    const url = `${window.location.origin}/social/${card.custom_slug || card.card_code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(card._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = async (card: ApiCard) => {
    try {
      const liveUrl = `${window.location.origin}/r/${card.card_code}`;
      const dataUrl = await QRCode.toDataURL(liveUrl, { width: 600, margin: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QR-${card.card_code}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  const totalCards = cards.length;
  const activeCards = cards.filter(c => c.status === 'active' && !isSubscriptionExpired(c)).length;
  const expiredCards = cards.filter(c => isSubscriptionExpired(c)).length;

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '10px',
          }}>
            <Sparkles size={14} /> بوابة صاحب المحل الرسمية
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800 }}>
            أهلاً بك، {storeTitle} 🌟
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#bfdbfe', maxWidth: '540px', lineHeight: 1.6 }}>
            تحكّم في بطاقات متجرك الذكية، عدّل روابط التواصل، حمّل كود الـ QR لطباعته للزبائن وتابع تفاعل العملاء بكل سهولة.
          </p>
        </div>

        <Link
          to="/merchant/cards"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            color: '#1d4ed8',
            padding: '12px 22px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>إدارة بطاقات المحل</span>
          <ArrowLeft size={16} />
        </Link>
      </div>

      {/* Subscription Alert for Merchant if expiring soon or expired */}
      {!isPermanent && diffDays !== null && diffDays <= 15 && (
        <div
          style={{
            borderRadius: '16px',
            padding: '16px 20px',
            backgroundColor: diffDays <= 0 ? '#fef2f2' : '#fffbeb',
            border: `1.5px solid ${diffDays <= 0 ? '#fecaca' : '#fef08a'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: diffDays <= 0 ? '#fee2e2' : '#fef3c7',
                color: diffDays <= 0 ? '#dc2626' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {diffDays <= 0 ? <AlertCircle size={22} /> : <Clock size={22} />}
            </div>
            <div>
              <h4 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: diffDays <= 0 ? '#991b1b' : '#92400e' }}>
                {diffDays <= 0
                  ? 'انتهت فترة اشتراك حساب متجرك في النظام!'
                  : `تنبيه: متبقي ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'} فقط على انتهاء اشتراك حسابك!`}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: diffDays <= 0 ? '#b91c1c' : '#b45309' }}>
                تاريخ انتهاء الاشتراك: <strong>{endDateFormatted}</strong>. يرجى التواصل مع إدارة المنصة لتجديد الاشتراك لتفادي توقف الخدمة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        {/* Card 1: Total cards */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--bdr-light)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--txt-muted)', fontWeight: 600 }}>
              إجمالي بطاقات المتجر
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--txt-heading)', marginTop: '2px' }}>
              {loading ? '—' : totalCards}
            </div>
          </div>
        </div>

        {/* Card 2: Active cards */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--bdr-light)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <QrCode size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--txt-muted)', fontWeight: 600 }}>
              البطاقات الفعّالة
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
              {loading ? '—' : activeCards}
            </div>
          </div>
        </div>

        {/* Card 3: Store Subscription (باقي على اشتراك المحل) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: `1.5px solid ${isPermanent ? '#a7f3d0' : diffDays !== null && diffDays <= 15 ? '#fef08a' : 'var(--bdr-light)'}`,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: isPermanent ? '#ecfdf5' : diffDays !== null && diffDays <= 0 ? '#fef2f2' : diffDays !== null && diffDays <= 15 ? '#fefce8' : '#eff6ff',
            color: isPermanent ? '#059669' : diffDays !== null && diffDays <= 0 ? '#dc2626' : diffDays !== null && diffDays <= 15 ? '#d97706' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isPermanent ? <ShieldCheck size={24} /> : <Clock size={24} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', color: 'var(--txt-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>اشتراك المحل</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: isPermanent ? '#d1fae5' : '#e0e7ff',
                color: isPermanent ? '#065f46' : '#4338ca',
                fontWeight: 700,
              }}>
                {admin?.subscription_type === 'yearly' ? 'سنوي' : admin?.subscription_type === 'custom' ? 'مخصص' : 'دائم'}
              </span>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 800,
              color: isPermanent ? '#059669' : diffDays !== null && diffDays <= 0 ? '#dc2626' : diffDays !== null && diffDays <= 15 ? '#d97706' : '#1e40af',
              marginTop: '2px',
            }}>
              {isPermanent ? (
                'دائم (مدى الحياة)'
              ) : diffDays !== null && diffDays <= 0 ? (
                'منتهي الصلاحية ⚠️'
              ) : diffDays !== null ? (
                `متبقي ${diffDays} يوم`
              ) : (
                'غير محدد'
              )}
            </div>
            {!isPermanent && endDateFormatted && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                ينتهي في {endDateFormatted}
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Cards Subscription Status */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--bdr-light)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: expiredCards > 0 ? '#fef2f2' : '#f0fdf4',
            color: expiredCards > 0 ? '#dc2626' : '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--txt-muted)', fontWeight: 600 }}>
              حالة اشتراك البطاقات
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: expiredCards > 0 ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
              {loading ? '—' : expiredCards > 0 ? `${expiredCards} بطاقة بحاجة لتجديد` : 'جميع البطاقات سارية ✓'}
            </div>
          </div>
        </div>
      </div>

      {/* Cards List Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid var(--bdr-light)',
        padding: '24px',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--txt-heading)' }}>
              بطاقات المحل الذكية
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--txt-muted)' }}>
              اضغط على أي بطاقة لتعديل روابط التواصل أو تحميل كود الـ QR
            </p>
          </div>

          <button
            onClick={loadCards}
            className="btn-outline"
            style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '10px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> تحديث
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
            <span>جاري تحميل بطاقات المحل...</span>
          </div>
        ) : cards.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
            <CreditCard size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: 'var(--txt-heading)' }}>
              لا توجد بطاقات مربوطة بهذا المتجر حالياً
            </h3>
            <p style={{ margin: 0, fontSize: '13px' }}>
              يرجى التواصل مع إدارة المنصة لربط بطاقات NFC الذكية بمتجرك.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {cards.map((card) => {
              const expired = isSubscriptionExpired(card);
              const liveUrl = `${window.location.origin}/social/${card.custom_slug || card.card_code}`;
              const bizName = card.business_data?.business_name || storeTitle;

              return (
                <div
                  key={card._id}
                  style={{
                    borderRadius: '16px',
                    border: '1px solid var(--bdr-light)',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top: Code & Badge */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '15px',
                        color: 'var(--clr-primary-700)',
                        backgroundColor: '#eff6ff',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #bfdbfe',
                      }}>
                        {card.card_code}
                      </span>

                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: expired ? '#fef2f2' : '#f0fdf4',
                        color: expired ? '#dc2626' : '#16a34a',
                        border: `1px solid ${expired ? '#fecaca' : '#bbf7d0'}`,
                      }}>
                        {expired ? 'منتهية ⚠' : 'نشطة ✓'}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 6px', fontSize: '15.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                      {bizName}
                    </h3>

                    {/* Subscription info (Read only - No partner name) */}
                    <div style={{ fontSize: '12px', color: 'var(--txt-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>
                        {!card.requires_subscription
                          ? 'اشتراك دائم مدى الحياة'
                          : card.subscription_end_date
                          ? `صلاحية الاشتراك حتى: ${fmtDate(card.subscription_end_date)}`
                          : 'اشتراك سارٍ'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--bdr-light)',
                    flexWrap: 'wrap',
                  }}>
                    <Link
                      to="/merchant/cards"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--clr-primary-500)',
                        color: '#ffffff',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      تعديل الروابط
                    </Link>

                    <button
                      type="button"
                      onClick={() => copyUrl(card)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--bdr-light)',
                        color: 'var(--txt-secondary)',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="نسخ رابط الصفحة"
                    >
                      {copiedId === card._id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      <span>{copiedId === card._id ? 'تم النسخ' : 'نسخ الرابط'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadQR(card)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--bdr-light)',
                        color: 'var(--clr-primary-700)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="تحميل كود الـ QR بجودة عالية للطباعة"
                    >
                      <Download size={15} />
                    </button>

                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                      }}
                      title="معاينة الصفحة للزبائن"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
