/* ==========================================================================
   PUBLIC CARD VIEW
   Renders business_data links for the customer-facing social page.
   ========================================================================== */

import React, { useState } from 'react';
import { ApiCard } from '../../types';
import {
  MessageCircle, Phone, Globe, Instagram, Facebook,
  Video, Compass, Mail, Copy, Check, ChevronLeft, ShieldCheck,
} from 'lucide-react';

interface LinkItem {
  id: string;
  label: string;
  subtitle?: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  copyable?: boolean;
}

// ── Smart link button ──────────────────────────────────────────────────────
const LinkBtn: React.FC<{ item: LinkItem; copiedId: string | null; onCopy: (url: string, id: string) => void }> = ({ item, copiedId, onCopy }) => {
  const isCopied = copiedId === item.id;
  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '15px', marginBottom: '10px',
    backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px',
    textDecoration: 'none', color: '#0f172a', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(15,23,42,0.05)', outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: 'box-shadow 150ms, border-color 150ms',
  };

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: `${item.color}18`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {item.icon}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
          {item.subtitle && <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.subtitle}</div>}
        </div>
      </div>
      <div style={{ color: isCopied ? item.color : '#94a3b8', display: 'flex', alignItems: 'center', paddingRight: '4px', flexShrink: 0 }}>
        {item.copyable ? (isCopied ? <Check size={19} /> : <Copy size={19} />) : <ChevronLeft size={19} />}
      </div>
    </>
  );

  if (item.copyable) {
    return (
      <button type="button" onClick={() => onCopy(item.url, item.id)} style={{ ...base, border: isCopied ? `1px solid ${item.color}` : base.border } as React.CSSProperties}>
        {content}
      </button>
    );
  }

  return (
    <a href={item.url} target={item.url.startsWith('tel:') || item.url.startsWith('mailto:') ? '_self' : '_blank'} rel="noopener noreferrer" style={base}>
      {content}
    </a>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
export const PublicCardView: React.FC<{ card: ApiCard }> = ({ card }) => {
  const [copiedId, setCopied] = useState<string | null>(null);
  const biz = card.business_data;

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const bizName = biz?.business_name || card.card_code;
  const initials = bizName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const links: LinkItem[] = [];
  if (biz?.whatsapp)    links.push({ id: 'wa',   label: 'واتساب',              subtitle: biz.whatsapp,  url: biz.whatsapp,                  icon: <MessageCircle size={22} />, color: '#22c55e' });
  if (biz?.phone)       links.push({ id: 'ph',   label: 'الهاتف',               subtitle: biz.phone,     url: `tel:${biz.phone}`,            icon: <Phone size={22} />,        color: '#0ea5e9', copyable: true });
  if (biz?.instagram)   links.push({ id: 'ig',   label: 'إنستجرام',            subtitle: 'Instagram',   url: biz.instagram,                 icon: <Instagram size={22} />,    color: '#e1306c' });
  if (biz?.facebook)    links.push({ id: 'fb',   label: 'فيسبوك',              subtitle: 'Facebook',    url: biz.facebook,                  icon: <Facebook size={22} />,     color: '#1877f2' });
  if (biz?.tiktok)      links.push({ id: 'tt',   label: 'تيك توك',             subtitle: 'TikTok',      url: biz.tiktok,                    icon: <Video size={22} />,        color: '#010101' });
  if (biz?.google_maps) links.push({ id: 'gm',   label: 'الموقع على الخريطة',  subtitle: 'Google Maps', url: biz.google_maps,               icon: <Compass size={22} />,      color: '#ea4335' });
  if (biz?.website)     links.push({ id: 'ws',   label: 'الموقع الإلكتروني',   subtitle: biz.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), url: biz.website, icon: <Globe size={22} />, color: '#64748b' });
  if (biz?.email)       links.push({ id: 'em',   label: 'البريد الإلكتروني',   subtitle: biz.email,     url: `mailto:${biz.email}`,         icon: <Mail size={22} />,         color: '#8b5cf6', copyable: true });

  return (
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#fafafa', backgroundImage: 'radial-gradient(circle at 50% 0%,#e2e8f0 0%,#fafafa 60%)', fontFamily: 'Cairo, system-ui, sans-serif', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            {biz?.logo
              ? <img src={biz.logo} alt={bizName} style={{ width: '96px', height: '96px', borderRadius: '24px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              : <div style={{ width: '96px', height: '96px', borderRadius: '24px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, border: '4px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>{initials}</div>}
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#fff', borderRadius: '50%', padding: '2px' }}>
              <ShieldCheck size={22} style={{ color: '#0f172a' }} />
            </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{bizName}</h1>
          {biz?.description && <p style={{ fontSize: '0.9375rem', color: '#475569', margin: '0 0 14px', lineHeight: 1.5, maxWidth: '90%' }}>{biz.description}</p>}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 13px', borderRadius: '9999px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.8125rem', fontWeight: 700 }}>
            <Compass size={14} /> {card.card_type}
          </span>
        </div>

        {/* Links */}
        {links.length > 0
          ? (
            <>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#334155', margin: '0 0 14px 0', padding: '0 4px' }}>اختر الخدمة</h2>
              {links.map((item) => <LinkBtn key={item.id} item={item} copiedId={copiedId} onCopy={copy} />)}
            </>
          )
          : (
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
              <Globe size={40} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
              <p style={{ fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>لا توجد روابط متاحة</p>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>لم يتم ضبط روابط لهذا الكارت بعد.</p>
            </div>
          )}

        {/* Footer */}
        <footer style={{ marginTop: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '3px' }}>
            <ShieldCheck size={14} />
            <span style={{ fontWeight: 800, letterSpacing: '0.06em', color: '#64748b' }}>NFC SMART CARD</span>
          </div>
          <div>Secured Digital Identity</div>
        </footer>
      </div>
    </div>
  );
};
