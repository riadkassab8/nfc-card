import React, { useEffect, useRef } from 'react';
import { ApiCard } from '../../types';
import { ProfileHero } from './ProfileHero';
import { PublicCardFooter } from './PublicCardFooter';
import { Globe } from 'lucide-react';
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
            <div className="nfc-tile-icon">{link.icon}</div>
            <span className="nfc-tile-label">{link.title}</span>
          </a>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        :root {
          --bg-color: #fafafa;
          --surface-color: #ffffff;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --border-color: #e5e7eb;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-hover: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          --radius-md: 12px;
          --radius-lg: 16px;
        }

        body {
          background-color: var(--bg-color);
        }

        .nfc-page {
          min-height: 100vh;
          background-color: var(--bg-color);
          color: var(--text-primary);
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px 64px;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .nfc-container {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .nfc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
          margin-top: 32px;
        }

        @media (min-width: 600px) {
          .nfc-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }

        .nfc-tile {
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          aspect-ratio: 1 / 1;
        }

        .nfc-tile:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 14px 24px -8px color-mix(in srgb, var(--brand-color, #6b7280) 40%, transparent), 0 4px 12px -3px rgba(0,0,0,0.05);
          border-color: var(--brand-color, var(--text-secondary));
        }

        .nfc-tile-icon {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-color, var(--text-primary));
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nfc-tile:hover .nfc-tile-icon {
          transform: scale(1.15) translateY(-2px);
        }

        .nfc-tile-label {
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          letter-spacing: -0.01em;
        }

        .nfc-review-cta {
          width: 100%;
          margin-top: 32px;
        }

        .nfc-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 18px 24px;
          background-color: var(--text-primary);
          color: var(--bg-color);
          border-radius: var(--radius-lg);
          font-size: 1.0625rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .nfc-btn-primary:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }

        .nfc-empty {
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-secondary);
          text-align: center;
          padding: 32px;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-lg);
        }

        .nfc-empty-icon {
          margin-bottom: 16px;
          opacity: 0.5;
        }
      `}</style>
      
      <div className="nfc-page" dir="rtl" ref={containerRef}>
        <div className="nfc-container">
          <div className="gsap-hero" style={{ width: '100%' }}>
            <ProfileHero card={card} />
          </div>
          
          {renderContent()}

          <div className="gsap-footer" style={{ marginTop: '64px', width: '100%' }}>
            <PublicCardFooter />
          </div>
        </div>
      </div>
    </>
  );
};
