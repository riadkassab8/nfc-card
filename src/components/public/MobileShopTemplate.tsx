import React, { useState } from 'react';
import { ApiSocialPageResponse, ActiveShift, BusinessData } from '../../types';
import {
  InstaPayIcon,
  VodafoneCashIcon,
  TelegramIcon,
  WhatsAppIcon,
  PhoneIcon,
  VerifiedCheckIcon,
} from './BrandIcons';
import {
  Copy,
  Check,
  Clock,
  UserCheck,
  Star,
  ExternalLink,
  PhoneCall,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Smartphone,
  Eye,
  Info,
} from 'lucide-react';

interface MobileShopTemplateProps {
  data: ApiSocialPageResponse;
}

export const MobileShopTemplate: React.FC<MobileShopTemplateProps> = ({ data }) => {
  const biz: BusinessData = data.business_data || {};
  const shift: ActiveShift | null = data.active_shift || null;

  // State for copy feedback
  const [copiedInstaPay, setCopiedInstaPay] = useState(false);
  const [copiedVodafone, setCopiedVodafone] = useState(false);

  // Review gate state
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Copy helper
  const handleCopy = (text: string, type: 'instapay' | 'vodafone') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'instapay') {
      setCopiedInstaPay(true);
      setTimeout(() => setCopiedInstaPay(false), 2200);
    } else {
      setCopiedVodafone(true);
      setTimeout(() => setCopiedVodafone(false), 2200);
    }
  };

  // Format hours helper
  const formatPeriod = (period?: 'am' | 'pm') => {
    if (!period) return '';
    return period.toLowerCase() === 'pm' ? 'م' : 'ص';
  };

  const cleanPhoneForWa = (phoneStr?: string | null) => {
    if (!phoneStr) return '';
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('01')) return `2${digits}`;
    return digits;
  };

  const maintenancePhone = biz.maintenance_whatsapp || biz.whatsapp || biz.phone || '';
  const waMaintenanceUrl = maintenancePhone
    ? `https://wa.me/${cleanPhoneForWa(maintenancePhone)}?text=${encodeURIComponent(
        'مرحباً، أود الاستفسار عن خدمات الصيانة والأجهزة لدى ' + (biz.business_name || 'المحل')
      )}`
    : '';

  const complaintsWaUrl = maintenancePhone
    ? `https://wa.me/${cleanPhoneForWa(maintenancePhone)}?text=${encodeURIComponent(
        'مرحباً، لدي ملاحظة بخصوص الخدمة لدى ' + (biz.business_name || 'المحل')
      )}`
    : '';

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0f19',
        color: '#f8fafc',
        fontFamily: "'Tajawal', system-ui, -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 60px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'fixed',
          top: '-120px',
          right: '50%',
          transform: 'translateX(50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-150px',
          left: '-50px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(230, 0, 0, 0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* ── 1. Top Bar / Business Header ───────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '22px',
                padding: '3px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              {biz.logo ? (
                <img
                  src={biz.logo}
                  alt={biz.business_name || 'Logo'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '19px',
                    objectFit: 'cover',
                    backgroundColor: '#1e293b',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '19px',
                    backgroundColor: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                  }}
                >
                  <Smartphone size={40} color="#38bdf8" />
                </div>
              )}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                background: '#0f172a',
                borderRadius: '50%',
                padding: '2px',
                display: 'flex',
              }}
            >
              <VerifiedCheckIcon size={22} />
            </span>
          </div>

          {/* Business Title */}
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {biz.business_name || 'كاشير الفرع'}
          </h1>

          {/* Description */}
          {biz.description && (
            <p
              style={{
                fontSize: '0.92rem',
                color: '#94a3b8',
                lineHeight: 1.6,
                margin: '0 0 16px',
                fontWeight: 500,
              }}
            >
              {biz.description}
            </p>
          )}

          {/* Badges / Quick Status */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              color: '#38bdf8',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={15} />
            <span>نقطة دفع رسمية ومعتمدة</span>
          </div>
        </div>

        {/* ── 2. Active Shift Card (الشيفت الحالي والكاشير) ───────────── */}
        {shift && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.25) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '20px',
              padding: '16px 18px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    height: '10px',
                    width: '10px',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      display: 'inline-flex',
                      height: '100%',
                      width: '100%',
                      borderRadius: '50%',
                      backgroundColor: '#34d399',
                      opacity: 0.75,
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                    }}
                  />
                  <span
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      borderRadius: '50%',
                      height: '10px',
                      width: '10px',
                      backgroundColor: '#10b981',
                    }}
                  />
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                  شيفت نشط الآن
                </span>
              </div>

              {shift.label && (
                <span
                  style={{
                    backgroundColor: 'rgba(52, 211, 153, 0.15)',
                    color: '#6ee7b7',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {shift.label}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                  }}
                >
                  <UserCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>الكاشير المسؤول:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {shift.cashier_name || 'مسؤول الصالة'}
                  </div>
                </div>
              </div>

              {(shift.hour_from !== undefined || shift.hour_to !== undefined) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <Clock size={15} color="#94a3b8" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {shift.hour_from} {formatPeriod(shift.period_from)} - {shift.hour_to}{' '}
                    {formatPeriod(shift.period_to)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 3. Fast Payment Section (الدفع الفوري) ────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#eab308',
                }}
              >
                <Sparkles size={16} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                الدفع والتحويل السريع
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>انقر للنسخ والتحويل فوراً</span>
          </div>

          {/* InstaPay Tile */}
          {biz.instapay && (
            <div
              style={{
                background: 'linear-gradient(135deg, #2b114d 0%, #17092b 100%)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(72, 37, 131, 0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <InstaPayIcon size={46} style={{ borderRadius: '12px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>
                      حساب إنستاباي
                    </div>
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        direction: 'ltr',
                        textAlign: 'right',
                        fontFamily: 'monospace, sans-serif',
                      }}
                    >
                      {biz.instapay}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    color: '#e9d5ff',
                    fontWeight: 600,
                  }}
                >
                  فوري مجاناً
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(biz.instapay || '', 'instapay')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: copiedInstaPay ? '#10b981' : 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {copiedInstaPay ? (
                    <>
                      <Check size={16} />
                      <span>تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>نسخ المعرف</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://ipn.eg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ArrowUpRight size={16} />
                  <span>فتح التطبيق</span>
                </a>
              </div>
            </div>
          )}

          {/* Vodafone Cash Tile */}
          {biz.vodafone_cash && (
            <div
              style={{
                background: 'linear-gradient(135deg, #3d0c0c 0%, #1f0505 100%)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(230, 0, 0, 0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <VodafoneCashIcon size={46} style={{ borderRadius: '12px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>
                      محفظة فودافون كاش
                    </div>
                    <div
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        direction: 'ltr',
                        textAlign: 'right',
                        letterSpacing: '0.5px',
                        fontFamily: 'monospace, sans-serif',
                      }}
                    >
                      {biz.vodafone_cash}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    color: '#fecaca',
                    fontWeight: 600,
                  }}
                >
                  كاش فوري
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(biz.vodafone_cash || '', 'vodafone')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: copiedVodafone ? '#10b981' : 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {copiedVodafone ? (
                    <>
                      <Check size={16} />
                      <span>تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>

                <a
                  href={`tel:${biz.vodafone_cash}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <PhoneCall size={16} />
                  <span>اتصال / تحويل</span>
                </a>
              </div>
            </div>
          )}

          {/* Cashier payment reminder note */}
          {(biz.instapay || biz.vodafone_cash) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#fbbf24',
                fontSize: '0.78rem',
                lineHeight: 1.5,
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>يرجى إظهار رسالة أو إشعار التحويل لمسؤول الكاشير فور إتمام الدفع.</span>
            </div>
          )}
        </div>

        {/* ── 4. Store Services & Quick Channels ─────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '4px 4px 0' }}>
            خدمات وتواصل المحل
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Maintenance WhatsApp */}
            {waMaintenanceUrl && (
              <a
                href={waMaintenanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.65)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  textDecoration: 'none',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <WhatsAppIcon size={40} style={{ borderRadius: '10px' }} />
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                      واتساب الصيانة والاستفسار
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      تواصل مباشر بخصوص فحص وصيانة جهازك
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={18} color="#25d366" />
              </a>
            )}

            {/* Daily Offers Telegram / Channel */}
            {biz.offers_url && (
              <a
                href={biz.offers_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.65)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  textDecoration: 'none',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <TelegramIcon size={40} style={{ borderRadius: '10px' }} />
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                      قناة العروض والأسعار اليومية
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      تابع أحدث أسعار الهواتف، الإكسسوارات والعروض
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={18} color="#38bdf8" />
              </a>
            )}

            {/* Telegram Community / Group */}
            {biz.telegram_group && (
              <a
                href={biz.telegram_group}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.65)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  textDecoration: 'none',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a78bfa',
                    }}
                  >
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                      جروب عملاء المحل
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      انضم لمجتمع عملائنا للنقاش والتبادل
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={18} color="#a78bfa" />
              </a>
            )}

            {/* Direct Phone Call */}
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textDecoration: 'none',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <PhoneIcon size={40} style={{ borderRadius: '10px' }} />
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                      اتصال مباشر بالفرع
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        direction: 'ltr',
                        textAlign: 'right',
                      }}
                    >
                      {biz.phone}
                    </div>
                  </div>
                </div>
                <PhoneCall size={18} color="#3b82f6" />
              </a>
            )}
          </div>
        </div>

        {/* ── 5. Google Review Gate (تقييم التجربة) ──────────────────── */}
        {biz.google_review_url && (
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '20px 18px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
              <Star size={18} color="#eab308" fill="#eab308" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                تقييم تجربتك اليوم
              </h3>
              <Star size={18} color="#eab308" fill="#eab308" />
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px' }}>
              كيف كانت سرعة الخدمة وتجربتك مع الكاشير؟
            </p>

            {biz.enable_review_gate ? (
              <div>
                {/* 5-Star Interactive Rating */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    direction: 'ltr',
                    marginBottom: '14px',
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled =
                      (hoveredRating !== null && star <= hoveredRating) ||
                      (hoveredRating === null && selectedRating !== null && star <= selectedRating);

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <Star
                          size={32}
                          color={isFilled ? '#eab308' : '#475569'}
                          fill={isFilled ? '#eab308' : 'none'}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Rating Response Gate */}
                {selectedRating !== null && (
                  <div style={{ marginTop: '14px' }}>
                    {selectedRating >= 4 ? (
                      /* High rating (4-5) -> Google Maps direct */
                      <div
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '14px',
                          padding: '14px',
                        }}
                      >
                        <p style={{ fontSize: '0.85rem', color: '#6ee7b7', margin: '0 0 10px', fontWeight: 600 }}>
                          شكراً لتقييمك الرائع! يسعدنا توثيق رأيك على خرائط Google ⭐
                        </p>
                        <a
                          href={biz.google_review_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                          }}
                        >
                          <ExternalLink size={16} />
                          <span>كتابة التقييم على Google Maps</span>
                        </a>
                      </div>
                    ) : (
                      /* Low rating (1-3) -> Internal complaints/management */
                      <div
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '14px',
                          padding: '14px',
                        }}
                      >
                        <p style={{ fontSize: '0.85rem', color: '#fca5a5', margin: '0 0 10px', fontWeight: 600 }}>
                          نعتذر عن أي تقصير! شاركنا ملاحظاتك فوراً مع الإدارة لنطور الخدمة:
                        </p>
                        {complaintsWaUrl ? (
                          <a
                            href={complaintsWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              padding: '10px 20px',
                              borderRadius: '12px',
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                            }}
                          >
                            <MessageCircle size={16} />
                            <span>مراسلة الإدارة عبر واتساب</span>
                          </a>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            يرجى إبلاغ الكاشير مباشرة أو التواصل هاتفياً.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Review gate disabled: direct Google review link */
              <a
                href={biz.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                <ExternalLink size={16} />
                <span>قيّمنا الآن على Google Maps</span>
              </a>
            )}
          </div>
        )}

        {/* ── 6. Footer & Scan Counter ───────────────────────────────── */}
        <footer
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            paddingTop: '10px',
          }}
        >
          {data.visit_count !== undefined && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: '#64748b',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                padding: '4px 10px',
                borderRadius: '8px',
              }}
            >
              <Eye size={13} />
              <span>عدد التمريرات: {data.visit_count}</span>
            </div>
          )}

          <div
            style={{
              fontSize: '0.75rem',
              color: '#475569',
              direction: 'ltr',
            }}
          >
            &copy; {new Date().getFullYear()} k2rty NFC Solutions. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
};
