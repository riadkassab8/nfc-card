/* ==========================================================================
   BUSINESS PROFILE PAGE  /business/:cardId
   Reads the card by _id and displays the full business_data in a
   clean public-facing layout.
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cardsApi } from '../services';
import { ApiCard, BusinessData } from '../types';
import {
  Building2, Phone, Mail, Globe, MapPin, MessageCircle,
  Instagram, Facebook, Video, AlertCircle, RefreshCw,
  ExternalLink,
} from 'lucide-react';

type State = 'loading' | 'ok' | 'not_found' | 'error';

/* ── Link item config ───────────────────────────────────────── */
interface SocialLink {
  key: keyof BusinessData;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  isLink?: boolean;
}

const SOCIAL_LINKS: SocialLink[] = [
  { key: 'phone',       label: 'اتصل بنا',      icon: <Phone size={20} />,          color: '#16a34a', bg: '#f0fdf4', isLink: false },
  { key: 'whatsapp',    label: 'واتساب',         icon: <MessageCircle size={20} />,  color: '#25d366', bg: '#f0fdf4' },
  { key: 'instagram',   label: 'انستجرام',       icon: <Instagram size={20} />,      color: '#e1306c', bg: '#fef2f2' },
  { key: 'facebook',    label: 'فيسبوك',         icon: <Facebook size={20} />,       color: '#1877f2', bg: '#eff6ff' },
  { key: 'tiktok',      label: 'تيك توك',        icon: <Video size={20} />,          color: '#000000', bg: '#f8fafc' },
  { key: 'google_maps', label: 'الموقع على الخريطة', icon: <MapPin size={20} />,     color: '#ea4335', bg: '#fef2f2' },
  { key: 'website',     label: 'الموقع الإلكتروني', icon: <Globe size={20} />,       color: '#3b82f6', bg: '#eff6ff' },
  { key: 'email',       label: 'البريد الإلكتروني', icon: <Mail size={20} />,        color: '#6366f1', bg: '#eef2ff' },
];

export const BusinessProfilePage: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard]     = useState<ApiCard | null>(null);
  const [state, setState]   = useState<State>('loading');

  const load = async () => {
    if (!cardId?.trim()) { setState('not_found'); return; }
    setState('loading');
    try {
      const c = await cardsApi.getCardById(cardId.trim());
      if (!c) { setState('not_found'); return; }
      setCard(c);
      setState('ok');
    } catch (e: any) {
      if (e?.statusCode === 404) setState('not_found');
      else setState('error');
    }
  };

  useEffect(() => { load(); }, [cardId]);

  /* ── Loading / Error states ── */
  if (state !== 'ok' || !card) {
    return (
      <div dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf5 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          maxWidth: '420px', width: '100%', backgroundColor: '#fff',
          borderRadius: '24px', padding: '40px 32px',
          boxShadow: '0 20px 60px -15px rgba(0,0,0,0.1)', textAlign: 'center',
        }}>
          {state === 'loading' && (
            <>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                border: '3px solid #e2e8f0', borderTopColor: '#3b82f6',
                animation: 'spin 0.65s linear infinite', margin: '0 auto 20px',
              }} />
              <p style={{ color: '#64748b', fontWeight: 600, fontSize: '15px' }}>جاري تحميل البيانات...</p>
            </>
          )}
          {state === 'not_found' && (
            <>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <AlertCircle size={32} style={{ color: '#ef4444' }} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                البطاقة غير موجودة
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.7 }}>
                هذه البطاقة غير متوفرة أو تم حذفها. تأكد من الرابط وحاول مجدداً.
              </p>
            </>
          )}
          {state === 'error' && (
            <>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <AlertCircle size={32} style={{ color: '#f97316' }} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                خطأ في الاتصال
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '24px' }}>
                تعذر تحميل البيانات. تحقق من الإنترنت.
              </p>
              <button onClick={load} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 28px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
                fontWeight: 800, fontSize: '15px', boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
              }}>
                <RefreshCw size={16} /> إعادة المحاولة
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const biz = card.business_data;
  const hasLinks = biz && SOCIAL_LINKS.some(s => biz[s.key]);

  return (
    <div dir="rtl" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf5 100%)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 16px', fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>

        {/* ── Profile Card ── */}
        <div style={{
          backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 20px 60px -15px rgba(0,0,0,0.1)', marginBottom: '16px',
        }}>
          {/* Header gradient */}
          <div style={{
            height: '120px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', bottom: '-40px', right: '50%', transform: 'translateX(50%)',
            }}>
              {biz?.logo ? (
                <img
                  src={biz.logo}
                  alt={biz.business_name || 'Logo'}
                  style={{
                    width: '88px', height: '88px', borderRadius: '22px',
                    border: '4px solid #fff', objectFit: 'cover',
                    boxShadow: '0 8px 24px -6px rgba(0,0,0,0.15)',
                    backgroundColor: '#fff',
                  }}
                />
              ) : (
                <div style={{
                  width: '88px', height: '88px', borderRadius: '22px',
                  border: '4px solid #fff', backgroundColor: '#eff6ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px -6px rgba(0,0,0,0.15)',
                }}>
                  <Building2 size={36} style={{ color: '#3b82f6' }} />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '52px 24px 28px', textAlign: 'center' }}>
            <h1 style={{
              margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 900,
              color: '#0f172a', letterSpacing: '-0.01em',
            }}>
              {biz?.business_name || card.card_code}
            </h1>
            {biz?.description && (
              <p style={{
                margin: '0 0 16px', fontSize: '0.9375rem', color: '#64748b',
                lineHeight: 1.8, maxWidth: '380px', marginInline: 'auto',
              }}>
                {biz.description}
              </p>
            )}
            {/* Status badge */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                backgroundColor: card.status === 'active' ? '#f0fdf4' : '#fef2f2',
                color: card.status === 'active' ? '#16a34a' : '#dc2626',
                border: `1px solid ${card.status === 'active' ? '#bbf7d0' : '#fecaca'}`,
              }}>
                {card.status === 'active' ? '✓ نشطة' : '✗ معطلة'}
              </span>
              <span style={{
                padding: '4px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe',
              }}>
                {card.card_type}
              </span>
            </div>
          </div>
        </div>

        {/* ── Contact & Social Links ── */}
        {hasLinks && (
          <div style={{
            backgroundColor: '#fff', borderRadius: '20px', padding: '24px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)', marginBottom: '16px',
          }}>
            <h3 style={{
              margin: '0 0 16px', fontSize: '0.9375rem', fontWeight: 800,
              color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              وسائل التواصل
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SOCIAL_LINKS.map(s => {
                const val = biz?.[s.key];
                if (!val) return null;

                const href = s.key === 'phone' ? `tel:${val}` :
                             s.key === 'email' ? `mailto:${val}` : val as string;

                return (
                  <a
                    key={s.key}
                    href={href}
                    target={s.key !== 'phone' && s.key !== 'email' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 16px', borderRadius: '14px',
                      backgroundColor: s.bg, textDecoration: 'none',
                      transition: 'transform 150ms ease, box-shadow 150ms ease',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = '';
                      (e.currentTarget as HTMLElement).style.boxShadow = '';
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      backgroundColor: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: s.color, flexShrink: 0,
                      boxShadow: '0 2px 6px -1px rgba(0,0,0,0.06)',
                    }}>
                      {s.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                        {s.label}
                      </div>
                      <div style={{
                        fontSize: '12px', color: '#64748b', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {val}
                      </div>
                    </div>
                    <ExternalLink size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Card Details ── */}
        <div style={{
          backgroundColor: '#fff', borderRadius: '20px', padding: '24px',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)', marginBottom: '16px',
        }}>
          <h3 style={{
            margin: '0 0 16px', fontSize: '0.9375rem', fontWeight: 800,
            color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            تفاصيل البطاقة
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <DetailItem label="كود البطاقة" value={card.card_code} mono />
            {card.nfc_uid && <DetailItem label="معرف NFC" value={card.nfc_uid} mono />}
            <DetailItem label="النوع" value={card.card_type} />
            <DetailItem label="الحالة" value={card.status === 'active' ? 'نشطة' : 'معطلة'} />
            <DetailItem
              label="الاشتراك ينتهي"
              value={new Date(card.subscription_end_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: '12px' }}>
          Powered by Smart NFC Cards
        </div>
      </div>
    </div>
  );
};

/* ── Helper ── */
const DetailItem: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
      {label}
    </div>
    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', fontFamily: mono ? 'monospace' : 'inherit' }}>
      {value}
    </div>
  </div>
);

export default BusinessProfilePage;
