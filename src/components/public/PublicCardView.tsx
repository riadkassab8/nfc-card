import React, { useEffect, useRef } from 'react';
import { ApiCard } from '../../types';
import { ProfileHero } from './ProfileHero';
import { PublicCardFooter } from './PublicCardFooter';
import { cardsApi } from '../../services';
import { Globe, UserPlus, Eye } from 'lucide-react';
import { gsap } from 'gsap';
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  GoogleMapsIcon,
  PhoneIcon,
  EmailIcon,
  GlobeIcon,
} from './BrandIcons';

export const PublicCardView: React.FC<{ card: ApiCard }> = ({ card }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const biz = card.business_data;
  
  // Extract links
  const links: any[] = [];
  
  if (biz?.whatsapp?.trim()) {
    links.push({ id: 'wa', platform: 'whatsapp', title: 'WhatsApp', url: biz.whatsapp, icon: <WhatsAppIcon size={32} />, brandColor: '#25D366' });
  }
  if (biz?.instagram?.trim()) {
    links.push({ id: 'ig', platform: 'instagram', title: 'Instagram', url: biz.instagram, icon: <InstagramIcon size={32} />, brandColor: '#E1306C' });
  }
  if (biz?.facebook?.trim()) {
    links.push({ id: 'fb', platform: 'facebook', title: 'Facebook', url: biz.facebook, icon: <FacebookIcon size={32} />, brandColor: '#1877F2' });
  }
  if (biz?.tiktok?.trim()) {
    links.push({ id: 'tt', platform: 'tiktok', title: 'TikTok', url: biz.tiktok, icon: <TikTokIcon size={32} />, brandColor: '#000000' });
  }
  if (biz?.google_maps?.trim()) {
    links.push({ id: 'gm', platform: 'google_maps', title: 'Google Review', url: biz.google_maps, icon: <GoogleMapsIcon size={32} />, brandColor: '#EA4335' });
  }
  if (biz?.phone?.trim()) {
    links.push({ id: 'ph', platform: 'phone', title: 'Call', url: `tel:${biz.phone}`, icon: <PhoneIcon size={32} />, brandColor: '#10B981' });
  }
  if (biz?.email?.trim()) {
    links.push({ id: 'em', platform: 'email', title: 'Email', url: `mailto:${biz.email}`, icon: <EmailIcon size={32} />, brandColor: '#6366F1' });
  }
  if (biz?.website?.trim()) {
    links.push({ id: 'ws', platform: 'website', title: 'Website', url: biz.website, icon: <GlobeIcon size={32} />, brandColor: '#3B82F6' });
  }
  if (biz?.instapay?.trim()) {
    links.push({ id: 'ip', platform: 'instapay', title: 'InstaPay', url: biz.instapay, icon: <GlobeIcon size={32} />, brandColor: '#49258E' });
  }
  if (biz?.vodafone_cash?.trim()) {
    links.push({ id: 'vc', platform: 'vodafone_cash', title: 'Vodafone Cash', url: `tel:${biz.vodafone_cash}`, icon: <PhoneIcon size={32} />, brandColor: '#E60000' });
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.gsap-hero', { y: 20, opacity: 0, duration: 0.6 })
        .from('.gsap-tile', { 
          y: 15, 
          opacity: 0, 
          duration: 0.4, 
          stagger: 0.05 
        }, '-=0.3')
        .from('.gsap-footer', { opacity: 0, duration: 0.4 }, '-=0.2');
    }, containerRef);

    return () => ctx.revert();
  }, [card]);

  // Determine rendering mode
  const type = card.card_type || 'Social Page';
  
  const renderContent = () => {
    if (type === 'Google Review') {
      const reviewUrl = card.current_redirect_url || biz?.google_maps || '#';
      return (
        <div className="nfc-review-cta gsap-tile">
          <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="nfc-btn-primary">
            <GoogleMapsIcon size={24} />
            اترك تقييماً على جوجل
          </a>
        </div>
      );
    }
    
    if (links.length === 0) {
      return (
        <div className="nfc-empty gsap-tile">
          <Globe size={40} className="nfc-empty-icon" />
          <p>لا توجد روابط مُدرجة</p>
        </div>
      );
    }

    return (
      <div className="nfc-grid">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target={link.url.startsWith('tel:') || link.url.startsWith('mailto:') ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="nfc-tile gsap-tile"
            style={{ '--brand-color': link.brandColor } as React.CSSProperties}
          >
            <div className="nfc-tile-icon">{React.cloneElement(link.icon as React.ReactElement, { size: 48 })}</div>
            <div className="nfc-tile-content">
              <span className="nfc-tile-label">{link.title}</span>
            </div>
            <div className="nfc-tile-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800;900&display=swap');

        :root {
          --bg-base: #f8f9fa;
          --bg-solid: #f8f9fa;
          --surface: #ffffff;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --border-light: rgba(0, 0, 0, 0.05);
          --shadow-subtle: 0 2px 10px rgba(0, 0, 0, 0.03);
          --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.06);
          --radius-card: 20px;
        }

        body {
          background-color: var(--bg-solid);
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }

        .nfc-page {
          min-height: 100vh;
          position: relative;
          color: var(--text-primary);
          font-family: 'Tajawal', 'Plus Jakarta Sans', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px;
          overflow: hidden;
          z-index: 1;
          background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
        }

        .nfc-container {
          width: 100%;
          max-width: 440px; /* Mobile first Linktree style */
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .nfc-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
          margin-top: 32px;
        }

        .nfc-tile {
          width: 100%;
          background-color: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-card);
          padding: 16px 20px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          color: var(--text-primary);
          box-shadow: var(--shadow-subtle);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          z-index: 1;
        }

        .nfc-tile::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: var(--brand-color);
          opacity: 0;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s;
          z-index: -1;
          border-radius: inherit;
        }

        .nfc-tile:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 32px color-mix(in srgb, var(--brand-color, #000) 15%, transparent);
          border-color: color-mix(in srgb, var(--brand-color, #000) 30%, transparent);
        }

        .nfc-tile:hover::before {
          transform: scaleX(1);
          opacity: 0.08;
          transform-origin: left;
        }

        @keyframes jellyFlip {
          0% { transform: scale(1) rotate(0deg); }
          30% { transform: scale(1.2) rotate(-15deg); }
          60% { transform: scale(0.9) rotate(10deg); }
          100% { transform: scale(1.05) rotate(0deg); }
        }

        .nfc-tile-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nfc-tile:hover .nfc-tile-icon {
          animation: jellyFlip 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .nfc-tile-arrow {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .nfc-tile:hover .nfc-tile-arrow {
          color: var(--brand-color);
          transform: translateX(-4px);
        }

        .nfc-tile-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 16px;
        }

        .nfc-tile-label {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }
        
        .nfc-tile-cta {
          display: none; /* Hide subtitle for a cleaner look */
        }

        .nfc-review-cta {
          width: 100%;
          max-width: 400px;
          margin-top: 48px;
        }

        .nfc-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 18px 24px;
          background: var(--text-primary);
          color: #ffffff;
          border-radius: 20px;
          font-size: 1.0625rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .nfc-btn-primary:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
          background: #000000;
        }

        .nfc-empty {
          margin-top: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-secondary);
          text-align: center;
          padding: 48px;
          background: var(--surface);
          backdrop-filter: blur(10px);
          border: 1px dashed rgba(0,0,0,0.1);
          border-radius: var(--radius-card);
        }

        .nfc-empty-icon {
          margin-bottom: 16px;
          opacity: 0.3;
        }
        
        .footer-wrap {
          margin-top: 64px;
          padding-top: 32px;
          width: 100%;
          display: flex;
          justify-content: center;
          position: relative;
        }
        
        .footer-wrap::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 1px;
          background-color: rgba(0,0,0,0.06);
        }
      `}</style>
      
      <div className="nfc-page" dir="rtl" ref={containerRef}>
        <div className="nfc-container">
          <div className="gsap-hero" style={{ width: '100%' }}>
            <ProfileHero card={card} />

            {/* Visit Counter Badge */}
            {typeof card.visit_count === 'number' && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  boxShadow: 'var(--shadow-subtle)',
                }}>
                  <Eye size={14} style={{ color: '#8b5cf6' }} />
                  <span>{card.visit_count.toLocaleString('ar-EG')} زيارة</span>
                </div>
              </div>
            )}

            {/* Save Contact (vCard) Action Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <a
                href={cardsApi.getVcardUrl(card.card_code)}
                download={`${card.business_data?.business_name || card.card_code}.vcf`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  maxWidth: '320px',
                  padding: '14px 24px',
                  backgroundColor: 'var(--text-primary)',
                  color: '#ffffff',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#000000';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 25px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--text-primary)';
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                }}
              >
                <UserPlus size={18} />
                <span>حفظ في جهات الاتصال</span>
              </a>
            </div>
          </div>
          
          {renderContent()}

          <div className="gsap-footer footer-wrap">
            <PublicCardFooter />
          </div>
        </div>
      </div>
    </>
  );
};
