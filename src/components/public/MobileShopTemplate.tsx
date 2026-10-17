import React, { useState, useMemo } from 'react';
import { ApiSocialPageResponse, BusinessData, PaymentShift } from '../../types';
import {
  InstaPayIcon,
  VodafoneCashIcon,
  TelegramIcon,
  WhatsAppIcon,
  PhoneIcon,
  GoogleMapsIcon,
  VerifiedCheckIcon,
} from './BrandIcons';
import {
  Copy,
  Check,
  UserCheck,
  Star,
  ExternalLink,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  ArrowUpRight,
  Smartphone,
  Info,
  X,
  Share2,
  Moon,
  Sun,
  MapPin,
  ChevronLeft,
} from 'lucide-react';

interface MobileShopTemplateProps {
  data: ApiSocialPageResponse;
}

export const MobileShopTemplate: React.FC<MobileShopTemplateProps> = ({ data }) => {
  const biz: BusinessData = data.business_data || {};

  // System theme preference as default
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // State for copy feedback
  const [copiedInstaPay, setCopiedInstaPay] = useState(false);
  const [copiedVodafone, setCopiedVodafone] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Review gate state
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // ── 1. Shifts Extraction & Management ──────────────────────────────────
  const shifts: PaymentShift[] = useMemo(() => {
    if (data.payment_shifts && data.payment_shifts.length > 0) {
      return data.payment_shifts.filter((s) => s.is_active !== false);
    }
    if (data.active_shift) {
      return [
        {
          label: data.active_shift.label || 'شيفت الكاشير',
          cashier_name: data.active_shift.cashier_name,
          hour_from: data.active_shift.hour_from,
          period_from: data.active_shift.period_from,
          hour_to: data.active_shift.hour_to,
          period_to: data.active_shift.period_to,
          instapay: data.active_shift.instapay || biz.instapay || undefined,
          vodafone_cash: data.active_shift.vodafone_cash || biz.vodafone_cash || undefined,
          is_active: true,
        },
      ];
    }
    return [];
  }, [data.payment_shifts, data.active_shift, biz.instapay, biz.vodafone_cash]);

  // Convert 12-hour period to 24-hour minutes (0..1439)
  const to24Hour = (hour: number | undefined | null, period: 'am' | 'pm' | undefined | null): number => {
    if (hour === undefined || hour === null) return 0;
    let h = Number(hour);
    const p = (period || 'am').toLowerCase();
    if (p === 'pm' && h < 12) h += 12;
    if (p === 'am' && h === 12) h = 0;
    return h;
  };

  // Check if a shift is active right now based on local browser time
  const isShiftActiveNow = (s?: PaymentShift | null): boolean => {
    if (!s || s.hour_from === undefined || s.hour_from === null || s.hour_to === undefined || s.hour_to === null) {
      return false;
    }
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const from = to24Hour(s.hour_from, s.period_from) * 60;
    const to = to24Hour(s.hour_to, s.period_to) * 60;

    if (from === to) return true; // 24-hour shift
    if (from < to) {
      // Daytime shift (e.g., 10:00 AM to 6:00 PM)
      return cur >= from && cur < to;
    } else {
      // Overnight shift (e.g., 7:00 PM to 10:00 AM)
      return cur >= from || cur < to;
    }
  };

  // ── 1. Automatic Active Shift Resolution (تحديد تلقائي في الخلفية بدون تفاصيل إدارية) ──
  const activeShift: PaymentShift | null = useMemo(() => {
    if (shifts.length === 0) return null;
    // 1. Time-based match with local client time
    const live = shifts.find((s) => isShiftActiveNow(s));
    if (live) return live;

    // 2. Backend active_shift match if given
    if (data.active_shift?.label) {
      const match = shifts.find((s) => s.label === data.active_shift?.label);
      if (match) return match;
    }

    // 3. Fallback to first shift
    return shifts[0] || null;
  }, [shifts, data.active_shift]);

  const activeCashierName = activeShift?.cashier_name || data.active_shift?.cashier_name || '';

  // ── 2. Effective Payment Details for Active Shift ─────────────────────
  // Prioritize active shift payment credentials, with fallback to business_data
  const rawInstaPay = activeShift?.instapay?.trim() || biz.instapay?.trim() || '';
  const rawVodafoneCash = activeShift?.vodafone_cash?.trim() || biz.vodafone_cash?.trim() || '';

  // Extract clean username from InstaPay IPN URL if present:
  // e.g. "https://ipn.eg/S/abdallahrabeh8/instapay/8T0sBT" -> "abdallahrabeh8@instapay"
  const getInstaPayDisplay = (val: string) => {
    if (!val) return '';
    const match = val.match(/ipn\.eg\/S\/([^/]+)\/instapay/i);
    if (match && match[1]) {
      return `${match[1]}@instapay`;
    }
    return val.replace(/^https?:\/\//i, '');
  };

  const getInstaPayCopyValue = (val: string) => {
    if (!val) return '';
    const match = val.match(/ipn\.eg\/S\/([^/]+)\/instapay/i);
    if (match && match[1]) {
      return `${match[1]}@instapay`;
    }
    return val;
  };

  const getInstaPayOpenUrl = (val: string) => {
    if (!val) return 'https://ipn.eg';
    if (/^https?:\/\//i.test(val)) return val;
    return 'https://ipn.eg';
  };

  // Copy helper with Haptic Feedback
  const handleCopy = (text: string, type: 'instapay' | 'vodafone') => {
    if (!text) return;
    try {
      navigator.vibrate?.(50);
    } catch {
      // Ignore vibration error on unsupported devices
    }
    navigator.clipboard.writeText(text);
    if (type === 'instapay') {
      setCopiedInstaPay(true);
      setTimeout(() => setCopiedInstaPay(false), 2000);
    } else {
      setCopiedVodafone(true);
      setTimeout(() => setCopiedVodafone(false), 2000);
    }
  };

  // Handle Share Card
  const handleShare = async () => {
    try {
      navigator.vibrate?.(30);
    } catch {
      // Ignore
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: biz.business_name || 'كاشير المحل',
          text: `صفحة الدفع والتواصل مع ${biz.business_name || 'المحل'}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2200);
    }
  };

  // Handle rating click with Google Review Gate Logic
  const handleRatingClick = (star: number) => {
    try {
      navigator.vibrate?.(40);
    } catch {
      // Ignore
    }
    setSelectedRating(star);
    if (star >= 4) {
      if (biz.google_review_url) {
        window.open(biz.google_review_url, '_blank', 'noopener,noreferrer');
      }
    } else {
      setShowFeedbackModal(true);
    }
  };

  // Format Egyptian mobile numbers: 010 1234 5678
  const formatPhoneNumber = (phoneStr?: string | null) => {
    if (!phoneStr) return '';
    const clean = phoneStr.replace(/\D/g, '');
    if (clean.length === 11 && clean.startsWith('01')) {
      return `${clean.slice(0, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
    }
    return phoneStr;
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

  // Theme palettes (designed with human product design principles, zero tacky neon)
  const theme = {
    bg: isDark ? '#0b0f17' : '#f8fafc',
    cardBg: isDark ? '#141d2b' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    cardShadow: isDark ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)' : '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#64748b',
    subtleBg: isDark ? '#1a2436' : '#f1f5f9',
    subtleBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        backgroundColor: theme.bg,
        color: theme.textPrimary,
        fontFamily: "'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '18px 16px 64px',
        position: 'relative',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }
        .feedback-backdrop {
          animation: fadeInBackdrop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .feedback-modal-content {
          animation: slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .live-dot {
          animation: pulseDot 2s ease-in-out infinite;
        }
        .touch-action-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Main Single-Column Mobile Container */}
      <main
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* ── Top Utility Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 4px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '999px',
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              fontSize: '12px',
              fontWeight: 700,
              color: isDark ? '#94a3b8' : '#475569',
            }}
          >
            <ShieldCheck size={14} color="#10b981" />
            <span>نقطة دفع رسمية ومعتمدة</span>
          </div>

          {/* Theme & Share controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleShare}
              title="مشاركة الكارت"
              className="touch-action-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
            >
              <Share2 size={16} />
            </button>

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              title={isDark ? 'الوضع الفاتح' : 'الوضع الليلي'}
              className="touch-action-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
            >
              {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#64748b" />}
            </button>
          </div>
        </div>

        {/* Share Toast Notification */}
        {shareToast && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} />
            <span>تم نسخ رابط الكارت لمشاركته بنجاح ✓</span>
          </div>
        )}

        {/* ── 1. Store Header & Identity Card ── */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: '24px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: theme.cardShadow,
            position: 'relative',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Logo with clean squircle frame */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '22px',
                padding: '3px',
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.08)',
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
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '18px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '18px',
                    backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                >
                  <Smartphone size={38} />
                </div>
              )}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '-3px',
                right: '-3px',
                backgroundColor: theme.cardBg,
                borderRadius: '50%',
                padding: '2px',
                display: 'flex',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <VerifiedCheckIcon size={20} />
            </span>
          </div>

          {/* Business Name */}
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: theme.textPrimary,
              margin: '0 0 6px',
              letterSpacing: '-0.3px',
            }}
          >
            {biz.business_name || 'كاشير المحل'}
          </h1>

          {/* Description */}
          {biz.description && (
            <p
              style={{
                fontSize: '13.5px',
                color: theme.textSecondary,
                lineHeight: 1.6,
                margin: '0 0 16px',
                fontWeight: 500,
              }}
            >
              {biz.description}
            </p>
          )}

          {/* Quick Contact Action Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className="touch-action-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  backgroundColor: theme.subtleBg,
                  border: `1px solid ${theme.subtleBorder}`,
                  color: theme.textPrimary,
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  transition: 'background-color 0.15s ease',
                }}
              >
                <PhoneCall size={14} color="#2563eb" />
                <span dir="ltr">{formatPhoneNumber(biz.phone)}</span>
              </a>
            )}

            {biz.google_maps && (
              <a
                href={biz.google_maps}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-action-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  backgroundColor: theme.subtleBg,
                  border: `1px solid ${theme.subtleBorder}`,
                  color: theme.textPrimary,
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  transition: 'background-color 0.15s ease',
                }}
              >
                <MapPin size={14} color="#ea4335" />
                <span>موقع الفرع</span>
              </a>
            )}
          </div>
        </div>

        {/* ── 2. Cashier Badge (إشعار رسمي ومطمئن للزبون الواقف في المحل) ── */}
        {activeCashierName ? (
          <div
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)'}`,
              borderRadius: '16px',
              padding: '12px 16px',
              boxShadow: theme.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 600 }}>
                  الكاشير المسؤول حالياً:
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: theme.textPrimary }}>
                  {activeCashierName}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                color: isDark ? '#6ee7b7' : '#047857',
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'inline-block',
                }}
              />
              <span>جاهز للاستلام</span>
            </div>
          </div>
        ) : null}

        {/* ── 3. Fast Payment Cards (بوابات الدفع والتحويل اللحظي) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: theme.textPrimary,
                margin: 0,
                letterSpacing: '-0.2px',
              }}
            >
              الدفع والتحويل اللحظي
            </h2>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
              تحويل فوري ومباشر
            </span>
          </div>

          {/* InstaPay Card */}
          {rawInstaPay && (
            <div
              style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                borderRadius: '22px',
                padding: '18px 20px',
                color: '#ffffff',
                boxShadow: '0 10px 25px -4px rgba(75, 85, 99, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle card sheen */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '-40px',
                  width: '130px',
                  height: '130px',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <InstaPayIcon size={46} style={{ borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#e5e7eb', fontWeight: 600 }}>
                      حساب إنستاباي المعتمد
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#ffffff',
                        direction: 'ltr',
                        textAlign: 'right',
                        fontFamily: 'monospace, sans-serif',
                        letterSpacing: '0.2px',
                      }}
                    >
                      {getInstaPayDisplay(rawInstaPay)}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  فوري مجاناً
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(getInstaPayCopyValue(rawInstaPay), 'instapay')}
                  className="touch-action-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    backgroundColor: copiedInstaPay ? '#10b981' : '#ffffff',
                    color: copiedInstaPay ? '#ffffff' : '#4b5563',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: copiedInstaPay
                      ? '0 4px 12px rgba(16, 185, 129, 0.4)'
                      : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {copiedInstaPay ? (
                    <>
                      <Check size={16} />
                      <span>تم النسخ! ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>نسخ المعرف</span>
                    </>
                  )}
                </button>

                <a
                  href={getInstaPayOpenUrl(rawInstaPay)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-action-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ArrowUpRight size={16} />
                  <span>فتح إنستاباي</span>
                </a>
              </div>
            </div>
          )}

          {/* Vodafone Cash Card */}
          {rawVodafoneCash && (
            <div
              style={{
                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                borderRadius: '22px',
                padding: '18px 20px',
                color: '#ffffff',
                boxShadow: '0 10px 25px -4px rgba(107, 114, 128, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle card sheen */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '-40px',
                  width: '130px',
                  height: '130px',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <VodafoneCashIcon size={46} style={{ borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#e5e7eb', fontWeight: 600 }}>
                      محفظة فودافون كاش المعتمدة
                    </div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#ffffff',
                        direction: 'ltr',
                        textAlign: 'right',
                        fontFamily: 'monospace, sans-serif',
                        letterSpacing: '0.4px',
                      }}
                    >
                      {formatPhoneNumber(rawVodafoneCash)}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  كاش فوري
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(rawVodafoneCash, 'vodafone')}
                  className="touch-action-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    backgroundColor: copiedVodafone ? '#10b981' : '#ffffff',
                    color: copiedVodafone ? '#ffffff' : '#b80000',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: copiedVodafone
                      ? '0 4px 12px rgba(16, 185, 129, 0.4)'
                      : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {copiedVodafone ? (
                    <>
                      <Check size={16} />
                      <span>تم النسخ! ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>

                <a
                  href={`tel:${rawVodafoneCash}`}
                  className="touch-action-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <PhoneCall size={16} />
                  <span>اتصال / تحويل</span>
                </a>
              </div>
            </div>
          )}

          {/* Cashier payment reminder notice */}
          {(rawInstaPay || rawVodafoneCash) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#fffbeb',
                border: isDark ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid #fde68a',
                color: isDark ? '#fcd34d' : '#b45309',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              <Info size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>بعد إتمام التحويل، يُرجى إظهار إشعار العملية للكاشير لتأكيد استلام الفاتورة.</span>
            </div>
          )}
        </div>

        {/* ── 4. Store Services & Direct Communication (خدمات وتواصل المحل) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: theme.textPrimary,
              margin: '6px 4px 2px',
              letterSpacing: '-0.2px',
            }}
          >
            خدمات وتواصل المحل
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Maintenance WhatsApp */}
            {waMaintenanceUrl && (
              <a
                href={waMaintenanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '18px',
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  boxShadow: theme.cardShadow,
                  textDecoration: 'none',
                  color: theme.textPrimary,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <WhatsAppIcon size={42} style={{ borderRadius: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: theme.textPrimary }}>
                      واتساب الصيانة والاستفسار
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                      تواصل مباشر بخصوص فحص وصيانة جهازك
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#25d366',
                  }}
                >
                  <ChevronLeft size={18} />
                </div>
              </a>
            )}

            {/* Daily Offers Telegram / Link */}
            {biz.offers_url && (
              <a
                href={biz.offers_url}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '18px',
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  boxShadow: theme.cardShadow,
                  textDecoration: 'none',
                  color: theme.textPrimary,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <TelegramIcon size={42} style={{ borderRadius: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: theme.textPrimary }}>
                      قناة العروض والأسعار اليومية
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                      تابع أحدث أسعار الهواتف والإكسسوارات
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#229ed9',
                  }}
                >
                  <ChevronLeft size={18} />
                </div>
              </a>
            )}

            {/* Telegram Community */}
            {biz.telegram_group && (
              <a
                href={biz.telegram_group}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '18px',
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  boxShadow: theme.cardShadow,
                  textDecoration: 'none',
                  color: theme.textPrimary,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#f3e8ff',
                      color: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: theme.textPrimary }}>
                      جروب عملاء المحل
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                      مجتمع العملاء لتبادل الأجهزة والاستفسارات
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                  }}
                >
                  <ChevronLeft size={18} />
                </div>
              </a>
            )}

            {/* Direct Phone Call */}
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className="touch-action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '18px',
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  boxShadow: theme.cardShadow,
                  textDecoration: 'none',
                  color: theme.textPrimary,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <PhoneIcon size={42} style={{ borderRadius: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: theme.textPrimary }}>
                      اتصال مباشر بالفرع
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: theme.textSecondary,
                        direction: 'ltr',
                        textAlign: 'right',
                        marginTop: '2px',
                      }}
                    >
                      {formatPhoneNumber(biz.phone)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                  }}
                >
                  <ChevronLeft size={18} />
                </div>
              </a>
            )}
          </div>
        </div>

        {/* ── 5. Google Review Gate Card (تقييم التجربة) ── */}
        {biz.google_review_url && (
          <div
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '24px',
              padding: '22px 20px',
              textAlign: 'center',
              boxShadow: theme.cardShadow,
              transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
              <GoogleMapsIcon size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                تقييم تجربتك معنا اليوم
              </h3>
            </div>

            <p style={{ fontSize: '12.5px', color: theme.textSecondary, margin: '0 0 16px' }}>
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
                    gap: '12px',
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
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          transform: isFilled ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                        }}
                        title={`${star} من 5`}
                      >
                        <Star
                          size={32}
                          color={isFilled ? '#eab308' : isDark ? '#475569' : '#cbd5e1'}
                          fill={isFilled ? '#eab308' : 'none'}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Rating Feedback Response Area */}
                {selectedRating !== null && (
                  <div style={{ marginTop: '14px' }}>
                    {selectedRating >= 4 ? (
                      /* High rating (4-5) -> Google Maps */
                      <div
                        style={{
                          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                          border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #a7f3d0',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          alignItems: 'center',
                        }}
                      >
                        <p style={{ fontSize: '13.5px', color: isDark ? '#6ee7b7' : '#047857', margin: 0, fontWeight: 700 }}>
                          شكراً لتقييمك الرائع! يسعدنا توثيق رأيك على خرائط Google ⭐
                        </p>
                        <a
                          href={biz.google_review_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="touch-action-btn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            padding: '11px 22px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontSize: '13.5px',
                            fontWeight: 800,
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                          }}
                        >
                          <ExternalLink size={16} />
                          <span>فتح التقييم على Google Maps</span>
                        </a>
                      </div>
                    ) : (
                      /* Low rating (1-3) -> Direct Management WhatsApp */
                      <div
                        style={{
                          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                          border: isDark ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid #fecaca',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          alignItems: 'center',
                        }}
                      >
                        <p style={{ fontSize: '13.5px', color: isDark ? '#fca5a5' : '#b91c1c', margin: 0, fontWeight: 700 }}>
                          نعتذر عن أي تقصير! نود سماع ملاحظاتك لنطور الخدمة فوراً:
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowFeedbackModal(true)}
                          className="touch-action-btn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            padding: '11px 22px',
                            borderRadius: '12px',
                            fontSize: '13.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                          }}
                        >
                          <MessageCircle size={16} />
                          <span>توضيح الملاحظة للإدارة</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Review gate disabled: Direct Google review link */
              <a
                href={biz.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-action-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '11px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                <ExternalLink size={16} />
                <span>قيّمنا الآن على Google Maps</span>
              </a>
            )}
          </div>
        )}

        {/* ── 6. Clean Footer ── */}
        <footer
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
            paddingTop: '8px',
          }}
        >
          <div
            style={{
              fontSize: '11.5px',
              color: isDark ? '#475569' : '#94a3b8',
              direction: 'ltr',
            }}
          >
            &copy; {new Date().getFullYear()} k2rty NFC Solutions.
          </div>
        </footer>
      </main>

      {/* ── Internal Feedback Modal for 1-3 Stars (Smooth Fade & Slide) ── */}
      {showFeedbackModal && (
        <div
          className="feedback-backdrop"
          onClick={() => setShowFeedbackModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="feedback-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '24px',
              padding: '26px 22px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowFeedbackModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: theme.subtleBg,
                border: 'none',
                color: theme.textSecondary,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={17} />
            </button>

            {/* Icon */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <MessageCircle size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: theme.textPrimary, margin: '0 0 8px' }}>
              رأيك يهمنا جداً!
            </h3>

            <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.6, margin: '0 0 20px' }}>
              نعتذر جداً إذا لم تكن تجربتك بالشكل المطلوب اليوم. يسعدنا الاستماع لملاحظتك مباشرة لحلها وتطوير الخدمة.
            </p>

            {complaintsWaUrl ? (
              <a
                href={complaintsWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowFeedbackModal(false)}
                className="touch-action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#25d366',
                  color: '#ffffff',
                  padding: '13px 20px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)',
                  marginBottom: '10px',
                }}
              >
                <WhatsAppIcon size={22} />
                <span>إرسال ملاحظة للإدارة عبر واتساب</span>
              </a>
            ) : (
              <div style={{ fontSize: '12.5px', color: '#ef4444', marginBottom: '14px' }}>
                يرجى إبلاغ مسؤول الكاشير في الفرع مباشرة.
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowFeedbackModal(false)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
