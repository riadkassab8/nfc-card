import React, { useState } from 'react';
import { ApiCard } from '../../types';
import {
  MessageCircle, Phone, Globe, Instagram, Facebook,
  Video, Compass, Mail, Copy, Check, ChevronLeft, ShieldCheck,
} from 'lucide-react';

interface LinkItem {
  id: string; label: string; subtitle?: string;
  url: string; icon: React.ReactNode; color: string; copyable?: boolean;
}

/* ── زر رابط ──────────────────────────────────────────────────── */
const LinkBtn: React.FC<{ item: LinkItem; copiedId: string | null; onCopy: (url: string, id: string) => void }> = ({ item, copiedId, onCopy }) => {
  const [hover, setHover] = useState(false);
  const isCopied = copiedId === item.id;

  const style: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '14px 16px', marginBottom: '10px',
    backgroundColor: hover ? 'var(--clr-primary-50)' : 'var(--bg-white)',
    border: `1px solid ${isCopied ? item.color : hover ? 'var(--clr-primary-300)' : 'var(--bdr-light)'}`,
    borderRadius: 'var(--r-lg)',
    textDecoration: 'none', color: 'var(--txt-body)',
    cursor: 'pointer', outline: 'none',
    boxShadow: hover ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
    transition: 'all 150ms var(--ease)',
    WebkitTapHighlightColor: 'transparent',
  };

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: 'var(--r-md)',
          backgroundColor: item.color + '14', color: item.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {item.icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--txt-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </div>
          {item.subtitle && (
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.subtitle}
            </div>
          )}
        </div>
      </div>
      <div style={{ color: isCopied ? item.color : 'var(--txt-muted)', display: 'flex', alignItems: 'center', paddingRight: '4px', flexShrink: 0 }}>
        {item.copyable
          ? (isCopied ? <Check size={18} /> : <Copy size={18} />)
          : <ChevronLeft size={18} />}
      </div>
    </>
  );

  if (item.copyable) {
    return (
      <button
        type="button"
        onClick={() => onCopy(item.url, item.id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={style as React.CSSProperties}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={item.url}
      target={item.url.startsWith('tel:') || item.url.startsWith('mailto:') ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
    >
      {content}
    </a>
  );
};

/* ── Main ─────────────────────────────────────────────────────── */
export const PublicCardView: React.FC<{ card: ApiCard }> = ({ card }) => {
  const [copiedId, setCopied] = useState<string | null>(null);
  const biz = card.business_data;

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const bizName = biz?.business_name || card.card_code;
  const initials = bizName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  /* بناء قائمة الروابط */
  const links: LinkItem[] = [];
  if (biz?.whatsapp)    links.push({ id: 'wa', label: 'واتساب',             subtitle: biz.whatsapp.replace(/^https?:\/\//, ''),  url: biz.whatsapp,          icon: <MessageCircle size={21} />, color: '#16a34a' });
  if (biz?.phone)       links.push({ id: 'ph', label: 'الهاتف',              subtitle: biz.phone,                                 url: `tel:${biz.phone}`,    icon: <Phone size={21} />,         color: 'var(--clr-primary-500)', copyable: true });
  if (biz?.instagram)   links.push({ id: 'ig', label: 'إنستجرام',           subtitle: 'Instagram',                               url: biz.instagram,         icon: <Instagram size={21} />,     color: '#e1306c' });
  if (biz?.facebook)    links.push({ id: 'fb', label: 'فيسبوك',             subtitle: 'Facebook',                                url: biz.facebook,          icon: <Facebook size={21} />,      color: '#1877f2' });
  if (biz?.tiktok)      links.push({ id: 'tt', label: 'تيك توك',            subtitle: 'TikTok',                                  url: biz.tiktok,            icon: <Video size={21} />,         color: '#333' });
  if (biz?.google_maps) links.push({ id: 'gm', label: 'الموقع على الخريطة', subtitle: 'Google Maps',                             url: biz.google_maps,       icon: <Compass size={21} />,       color: '#ea4335' });
  if (biz?.website)     links.push({ id: 'ws', label: 'الموقع الإلكتروني',  subtitle: biz.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), url: biz.website, icon: <Globe size={21} />, color: 'var(--clr-primary-600)' });
  if (biz?.email)       links.push({ id: 'em', label: 'البريد الإلكتروني',  subtitle: biz.email,                                 url: `mailto:${biz.email}`, icon: <Mail size={21} />,          color: '#7c3aed', copyable: true });

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        backgroundImage: 'radial-gradient(circle at 50% 0%, var(--clr-primary-100) 0%, var(--bg-page) 55%)',
        fontFamily: 'var(--font)',
        padding: '36px 20px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* بطاقة الهوية */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            {biz?.logo
              ? <img
                  src={biz.logo} alt={bizName}
                  style={{
                    width: '92px', height: '92px', borderRadius: 'var(--r-xl)',
                    objectFit: 'cover',
                    border: '3px solid var(--bg-white)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              : <div style={{
                  width: '92px', height: '92px', borderRadius: 'var(--r-xl)',
                  backgroundColor: 'var(--clr-primary-500)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 800,
                  border: '3px solid var(--bg-white)',
                  boxShadow: 'var(--shadow-md)',
                }}>
                  {initials}
                </div>}
            {/* شارة التحقق */}
            <div style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              backgroundColor: 'var(--bg-white)', borderRadius: '50%', padding: '2px',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <ShieldCheck size={20} style={{ color: 'var(--clr-primary-500)', display: 'block' }} />
            </div>
          </div>

          <h1 style={{
            fontSize: 'var(--fs-2xl)', fontWeight: 800,
            color: 'var(--txt-heading)', margin: '0 0 7px',
            letterSpacing: '-0.01em',
          }}>
            {bizName}
          </h1>

          {biz?.description && (
            <p style={{
              fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)',
              margin: '0 0 12px', lineHeight: 1.6, maxWidth: '90%',
            }}>
              {biz.description}
            </p>
          )}

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '5px 13px', borderRadius: 'var(--r-full)',
            backgroundColor: 'var(--clr-primary-50)',
            color: 'var(--clr-primary-700)',
            border: '1px solid var(--clr-primary-200)',
            fontSize: 'var(--fs-xs)', fontWeight: 700,
          }}>
            <Compass size={13} /> {card.card_type}
          </span>
        </div>

        {/* قائمة الروابط */}
        {links.length > 0
          ? (
            <>
              <h2 style={{
                fontSize: 'var(--fs-sm)', fontWeight: 700,
                color: 'var(--txt-secondary)', margin: '0 0 12px',
                padding: '0 4px',
              }}>
                اختر الخدمة
              </h2>
              {links.map(item => (
                <LinkBtn key={item.id} item={item} copiedId={copiedId} onCopy={copy} />
              ))}
            </>
          )
          : (
            <div style={{
              backgroundColor: 'var(--bg-white)', border: '1px solid var(--bdr-light)',
              borderRadius: 'var(--r-xl)', padding: '40px 20px', textAlign: 'center',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <Globe size={38} style={{ color: 'var(--bdr-medium)', marginBottom: '12px' }} />
              <p style={{ fontWeight: 700, color: 'var(--txt-body)', margin: '0 0 6px' }}>لا توجد روابط</p>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-muted)', margin: 0 }}>
                لم يتم إضافة روابط لهذا الكارت بعد
              </p>
            </div>
          )}

        {/* Footer */}
        <footer style={{ marginTop: '40px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '3px' }}>
            <ShieldCheck size={13} style={{ color: 'var(--clr-primary-400)' }} />
            <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--txt-muted)', letterSpacing: '0.07em' }}>
              NFC SMART CARD
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--txt-muted)' }}>هوية رقمية آمنة</span>
        </footer>
      </div>
    </div>
  );
};
