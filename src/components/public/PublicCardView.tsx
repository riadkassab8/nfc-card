import React, { useEffect, useRef, useState } from 'react';
import { ApiCard } from '../../types';
import { ProfileHero } from './ProfileHero';
import { PublicCardFooter } from './PublicCardFooter';
import { Globe, UserPlus, Eye, Check } from 'lucide-react';
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
  InstaPayIcon,
  VodafoneCashIcon,
} from './BrandIcons';

const PremiumTile = ({ link, onClick }: { link: any, onClick: (e: React.MouseEvent) => void }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  const xTo = useRef<gsap.QuickToFunc>();
  const yTo = useRef<gsap.QuickToFunc>();
  
  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isTouch && !prefersReducedMotion && cardRef.current) {
      xTo.current = gsap.quickTo(cardRef.current, 'rotateY', { duration: 0.8, ease: 'power3.out' });
      yTo.current = gsap.quickTo(cardRef.current, 'rotateX', { duration: 0.8, ease: 'power3.out' });
    }
  }, []);

  const handleMouseEnter = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.to(cardRef.current, { y: -4, duration: 0.4, ease: 'power2.out' });
      return;
    }

    gsap.to(cardRef.current, {
      y: -10,
      boxShadow: '0 22px 45px rgba(0,0,0,0.08)',
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.to(iconRef.current, {
      y: -6,
      scale: 1.12,
      rotation: 5,
      duration: 1.0,
      ease: 'power3.out'
    });
    
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.15,
        scale: 1.2,
        duration: 1.0,
        ease: 'power3.out'
      });
    }

    gsap.to(titleRef.current, {
      y: -2,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.to(subtitleRef.current, {
      y: -1,
      duration: 0.8,
      ease: 'power3.out'
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!xTo.current || !yTo.current || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    
    xTo.current(rotateY);
    yTo.current(rotateX);
  };

  const handleMouseLeave = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.to(cardRef.current, { y: 0, duration: 0.4, ease: 'power2.out' });
      return;
    }

    gsap.to(cardRef.current, {
      y: 0,
      rotateX: 0,
      rotateY: 0,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)', // var(--shadow-subtle)
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.to(iconRef.current, {
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 0.9,
      ease: 'power3.out'
    });
    
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out'
      });
    }

    gsap.to([titleRef.current, subtitleRef.current], {
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  };

  return (
    <a
      ref={cardRef}
      href={link.url}
      target={link.url.startsWith('tel:') || link.url.startsWith('mailto:') ? '_self' : '_blank'}
      rel="noopener noreferrer"
      className="nfc-tile gsap-tile"
      style={{ '--brand-color': link.brandColor } as React.CSSProperties}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="nfc-tile-icon-wrap" style={{ position: 'relative' }}>
        <div 
          ref={glowRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            backgroundColor: link.brandColor,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            filter: 'blur(15px)',
            opacity: 0,
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        <div ref={iconRef} className="nfc-tile-icon" style={{ position: 'relative', zIndex: 1 }}>
          {link.icon}
        </div>
      </div>
      <div className="nfc-tile-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', position: 'relative', zIndex: 1 }}>
        <span ref={titleRef} className="nfc-tile-label" style={{ fontSize: '1.05rem', textAlign: 'center', lineHeight: '1.2', display: 'block' }}>{link.title}</span>
        <span ref={subtitleRef} className="nfc-tile-subtitle" style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', display: 'block' }}>{link.subtitle}</span>
      </div>
    </a>
  );
};

export const PublicCardView: React.FC<{ card: ApiCard }> = ({ card }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const biz = card.business_data;

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };
  
  const handleSaveContact = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!biz) return;
    
    // Generate vCard data
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${biz.business_name || card.custom_slug || card.card_code}`,
    ];
    
    if (biz.phone?.trim()) {
      lines.push(`TEL;TYPE=CELL:${biz.phone.trim()}`);
    }
    if (biz.email?.trim()) {
      lines.push(`EMAIL;TYPE=WORK:${biz.email.trim()}`);
    }
    if (biz.website?.trim()) {
      lines.push(`URL:${biz.website.trim()}`);
    }
    if (biz.google_maps?.trim()) {
      lines.push(`URL;TYPE=MAP:${biz.google_maps.trim()}`);
    }
    
    // Fallback to social page link
    lines.push(`URL;TYPE=PROFILE:${window.location.href}`);
    
    if (biz.description?.trim()) {
      lines.push(`NOTE:${biz.description.trim()}`);
    }
    
    lines.push('END:VCARD');
    
    const vcardContent = lines.join('\n');
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${biz.business_name || card.custom_slug || card.card_code}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Extract links
  const links: any[] = [];
  
  const waUrl = biz?.whatsapp?.trim() || 'https://wa.me/201098277229';
  const igUrl = biz?.instagram?.trim() || 'https://www.instagram.com/nasma.brand';
  const fbUrl = biz?.facebook?.trim() || 'https://www.facebook.com/nasma.brand.official';
  const ttUrl = biz?.tiktok?.trim() || 'https://www.tiktok.com/@nasma.brand';
  const phRaw = biz?.phone?.trim() || '01098277229';
  const phUrl = phRaw.startsWith('tel:') ? phRaw : `tel:${phRaw}`;

  if (biz?.whatsapp?.trim() || !biz) {
    links.push({
      id: 'wa',
      platform: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'تواصل معنا مباشرة',
      url: waUrl,
      icon: <WhatsAppIcon size={60} />,
      brandColor: '#25D366'
    });
  }
  if (biz?.instagram?.trim() || !biz) {
    links.push({
      id: 'ig',
      platform: 'instagram',
      title: 'Instagram',
      subtitle: 'شاهد يومياتنا',
      url: igUrl,
      icon: <InstagramIcon size={60} />,
      brandColor: '#E1306C'
    });
  }
  if (biz?.facebook?.trim() || !biz) {
    links.push({
      id: 'fb',
      platform: 'facebook',
      title: 'Facebook',
      subtitle: 'تابع آخر الأخبار',
      url: fbUrl,
      icon: <FacebookIcon size={60} />,
      brandColor: '#1877F2'
    });
  }
  if (biz?.tiktok?.trim() || !biz) {
    links.push({
      id: 'tt',
      platform: 'tiktok',
      title: 'TikTok',
      subtitle: 'اكتشف المزيد',
      url: ttUrl,
      icon: <TikTokIcon size={60} />,
      brandColor: '#000000'
    });
  }
  if (biz?.google_maps?.trim()) {
    links.push({ id: 'gm', platform: 'google_maps', title: 'Google Review', subtitle: 'موقعنا على الخريطة', url: biz.google_maps, icon: <GoogleMapsIcon size={60} />, brandColor: '#EA4335' });
  }
  if (biz?.phone?.trim() || !biz) {
    links.push({
      id: 'ph',
      platform: 'phone',
      title: 'Call',
      subtitle: 'يسعدنا استقبال مكالمتك',
      url: phUrl,
      icon: <PhoneIcon size={60} />,
      brandColor: '#2563EB'
    });
  }
  if (biz?.email?.trim()) {
    links.push({ id: 'em', platform: 'email', title: 'Email', subtitle: 'راسلنا عبر البريد', url: `mailto:${biz.email}`, icon: <EmailIcon size={60} />, brandColor: '#6366F1' });
  }
  if (biz?.website?.trim()) {
    links.push({ id: 'ws', platform: 'website', title: 'Website', subtitle: 'تصفح موقعنا', url: biz.website, icon: <GlobeIcon size={60} />, brandColor: '#3B82F6' });
  }
  if (biz?.instapay?.trim()) {
    const val = biz.instapay.trim();
    const isUrl = /^https?:\/\//i.test(val);
    links.push({
      id: 'ip',
      platform: 'instapay',
      title: 'InstaPay',
      subtitle: 'للدفع والتحويل',
      url: isUrl ? val : `https://instapay.eg`,
      icon: <InstaPayIcon size={60} />,
      brandColor: '#49258E',
      copyValue: val,
      copyMessage: `تم نسخ معرّف إنستاباي (${val}) بنجاح ✓`,
    });
  }
  if (biz?.vodafone_cash?.trim()) {
    const val = biz.vodafone_cash.trim();
    links.push({
      id: 'vc',
      platform: 'vodafone_cash',
      title: 'Vodafone Cash',
      subtitle: 'حول بسهولة وأمان',
      url: `tel:${val}`,
      icon: <VodafoneCashIcon size={60} />,
      brandColor: '#E60000',
      copyValue: val,
      copyMessage: `تم نسخ رقم محفظة فودافون كاش (${val}) بنجاح ✓`,
    });
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    // Small delay to ensure DOM is ready (especially important on slower mobile devices)
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ 
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            // Force visibility on all animated elements after animation completes
            gsap.set(['.gsap-hero', '.gsap-tile', '.gsap-footer'], { clearProps: 'opacity,transform' });
          }
        });

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
    }, 50);

    return () => clearTimeout(timer);
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
          <PremiumTile
            key={link.id}
            link={link}
            onClick={(e) => {
              if (link.copyValue && (link.platform === 'vodafone_cash' || (link.platform === 'instapay' && !link.url.startsWith('http')))) {
                e.preventDefault();
                copyToClipboard(link.copyValue, link.copyMessage);
              }
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800;900&display=swap');

        :root {
          --bg-base: #FAF8F5;
          --bg-solid: #FAF8F5;
          --surface: #ffffff;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --border-light: rgba(0, 0, 0, 0.04);
          --shadow-subtle: 0 4px 16px rgba(0, 0, 0, 0.02);
          --shadow-hover: 0 12px 28px rgba(0, 0, 0, 0.05);
          --radius-card: 24px;
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
          overflow-x: hidden;
          z-index: 1;
          background-color: var(--bg-solid);
        }

        .nfc-container {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .nfc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
          gap: 18px;
          width: 100%;
          max-width: 900px;
          margin-top: 32px;
          padding: 0 10px;
          box-sizing: border-box;
          perspective: 1000px;
        }

        /* Desktop: 3 columns */
        @media (min-width: 800px) {
          .nfc-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 22px;
          }
        }

        /* Mobile phones: 2 columns grid for sleek tile layout */
        @media (max-width: 600px) {
          .nfc-page {
            padding: 24px 12px;
          }
          .nfc-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 0 4px;
            margin-top: 24px;
          }
          .nfc-tile {
            padding: 20px 10px;
            border-radius: 20px;
            gap: 12px;
          }
          .nfc-tile-label {
            font-size: 0.88rem !important;
          }
          .nfc-tile-subtitle {
            font-size: 0.72rem !important;
          }
        }

        /* Ultra small phones (< 360px): 1 column */
        @media (max-width: 360px) {
          .nfc-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .nfc-tile {
            padding: 18px 12px;
          }
        }

        .nfc-tile {
          width: 100%;
          background-color: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-card);
          padding: 30px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          text-decoration: none;
          color: var(--text-primary);
          box-shadow: var(--shadow-subtle);
          position: relative;
          overflow: visible;
          box-sizing: border-box;
          z-index: 1;
          transform-style: preserve-3d;
        }
        
        .nfc-tile-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .nfc-tile-label {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }

        /* Ensure tiles are visible even if GSAP animation fails to run */
        .gsap-tile {
          opacity: 1;
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

            {/* Save Contact (vCard) Action Button - only show if phone exists */}
            {biz?.phone?.trim() && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <a
                  href="#"
                  onClick={handleSaveContact}
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
            )}
          </div>
          
          {renderContent()}

          <div className="gsap-footer footer-wrap">
            <PublicCardFooter />
          </div>
        </div>
      </div>

      {/* Floating Copy Feedback Toast */}
      {toastMsg && (
        <div
          dir="rtl"
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '50px',
            fontSize: '13.5px',
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 180ms ease both',
            fontFamily: 'Tajawal, sans-serif',
          }}
        >
          <Check size={16} style={{ color: '#22c55e' }} />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
};
