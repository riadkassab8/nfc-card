import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { ApiCard } from '../../types';
import { ProfileHero } from './ProfileHero';
import { PublicCardFooter } from './PublicCardFooter';
import { Globe, UserPlus, Check, Wifi } from 'lucide-react';
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
            backgroundColor: 'currentColor',
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
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [wifiQrCode, setWifiQrCode] = useState<string | null>(null);
  const [vodafoneQrOpen, setVodafoneQrOpen] = useState(false);
  const biz = card.business_data;
  const wifiSsid = String(biz?.wifi_ssid ?? (card as any).wifi_ssid ?? '').trim();
  const wifiPassword = String(biz?.wifi_password ?? (card as any).wifi_password ?? '').trim();

  useEffect(() => {
    if (!wifiModalOpen || !wifiSsid) return;

    const escapeWifiValue = (value: string) => value.replace(/[\\;,:]/g, (char) => `\\${char}`);
    const security = String(biz?.wifi_security ?? (card as any).wifi_security ?? 'WPA').trim();
    const hidden = Boolean(biz?.wifi_hidden ?? (card as any).wifi_hidden ?? false);
    const qrPayload = `WIFI:T:${security};S:${escapeWifiValue(wifiSsid)};P:${escapeWifiValue(wifiPassword)};H:${hidden ? 'true' : 'false'};;`;

    setWifiQrCode(null);
    QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#111111', light: '#ffffff' },
    }).then(setWifiQrCode).catch(() => setWifiQrCode(null));
  }, [wifiModalOpen, wifiSsid, wifiPassword, biz?.wifi_security, biz?.wifi_hidden, card]);

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Get all available phone numbers
  const getAvailablePhones = () => {
    const phones: { label: string; number: string }[] = [];
    if (biz?.phone?.trim()) phones.push({ label: 'رقم رئيسي', number: biz.phone.trim() });
    if (biz?.phone1?.trim()) phones.push({ label: 'رقم هاتف آخر', number: biz.phone1.trim() });
    if (biz?.phone2?.trim()) phones.push({ label: 'رقم هاتف آخر', number: biz.phone2.trim() });
    if (biz?.phone3?.trim()) phones.push({ label: 'رقم هاتف آخر', number: biz.phone3.trim() });
    return phones;
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const phones = getAvailablePhones();
    if (phones.length === 1) {
      // Only one phone, call directly
      window.location.href = `tel:${phones[0].number}`;
    } else if (phones.length > 1) {
      // Multiple phones, show selection modal
      setPhoneModalOpen(true);
    }
  };

  const handleCallPhone = (number: string) => {
    setPhoneModalOpen(false);
    window.location.href = `tel:${number}`;
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
    
    // Add all phone numbers
    if (biz.phone?.trim()) {
      lines.push(`TEL;TYPE=CELL:${biz.phone.trim()}`);
    }
    if (biz.phone1?.trim()) {
      lines.push(`TEL;TYPE=CELL:${biz.phone1.trim()}`);
    }
    if (biz.phone2?.trim()) {
      lines.push(`TEL;TYPE=CELL:${biz.phone2.trim()}`);
    }
    if (biz.phone3?.trim()) {
      lines.push(`TEL;TYPE=CELL:${biz.phone3.trim()}`);
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
  // Build in order: Social → Locations → Payment Methods → Contact → Website
  const links: any[] = [];

  const waUrl = biz?.whatsapp?.trim() || 'https://wa.me/201098277229';
  const igUrl = biz?.instagram?.trim() || 'https://www.instagram.com/nasma.brand';
  const fbUrl = biz?.facebook?.trim() || 'https://www.facebook.com/nasma.brand.official';
  const ttUrl = biz?.tiktok?.trim() || 'https://www.tiktok.com/@nasma.brand';

  // ═══════════════════════════════════════════════════════════
  // 1. SOCIAL MEDIA (الشبكات الاجتماعية)
  // ═══════════════════════════════════════════════════════════
  const whatsappContacts = Array.isArray(biz?.whatsapp_contacts)
    ? biz.whatsapp_contacts
        .map((contact) => {
          const value = contact?.number?.trim() || (contact as any)?.url?.trim() || '';
          const url = /^https?:\/\//i.test(value)
            ? value
            : `https://wa.me/${value.replace(/\D/g, '')}`;
          return { ...contact, url };
        })
        .filter((contact) => contact?.name?.trim() && contact.url !== 'https://wa.me/')
    : [];
  if (whatsappContacts.length > 0) {
    whatsappContacts.forEach((contact, index) => {
      links.push({
        id: `wa-${index}`,
        platform: 'whatsapp',
        title: contact.name.trim(),
        subtitle: contact.url.trim(),
        url: contact.url.trim(),
        icon: <WhatsAppIcon size={60} />,
        brandColor: '#25D366'
      });
    });
  } else if (biz?.whatsapp?.trim() || !biz) {
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

  // ═══════════════════════════════════════════════════════════
  // 2. LOCATIONS (الفروع والمواقع)
  // ═══════════════════════════════════════════════════════════
  if (biz?.google_maps?.trim()) {
    links.push({ id: 'gm', platform: 'google_maps', title: 'Google Review', subtitle: 'قيمنا على الخريطة', url: biz.google_maps, icon: <GoogleMapsIcon size={60} />, brandColor: '#EA4335' });
  }

  // Add multiple locations if available
  if (biz?.locations && Array.isArray(biz.locations) && biz.locations.length > 0) {
    biz.locations.forEach((loc: any, idx: number) => {
      if (loc.name?.trim() && loc.google_maps_url?.trim()) {
        links.push({
          id: `loc-${idx}`,
          platform: 'location',
          title: loc.name.trim(),
          subtitle: 'اضغط لفتح الموقع على الخريطة',
          url: loc.google_maps_url.trim(),
          icon: <GoogleMapsIcon size={60} />,
          brandColor: '#0891b2'
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 3. PAYMENT METHODS (وسايل الدفع)
  // ═══════════════════════════════════════════════════════════
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
      subtitle: 'اضغط لعرض QR أو نسخ الرقم',
      url: `tel:${val}`,
      icon: <VodafoneCashIcon size={60} />,
      brandColor: '#E60000',
      copyValue: val,
      copyMessage: `تم نسخ رقم محفظة فودافون كاش (${val}) بنجاح ✓`,
    });
  }
  if (biz?.instapay2?.trim()) {
    const val = biz.instapay2.trim();
    const isUrl = /^https?:\/\//i.test(val);
    links.push({
      id: 'ip2',
      platform: 'instapay',
      title: 'InstaPay 2',
      subtitle: 'حساب تحويل إضافي',
      url: isUrl ? val : `https://instapay.eg`,
      icon: <InstaPayIcon size={60} />,
      brandColor: '#49258E',
      copyValue: val,
      copyMessage: `تم نسخ معرّف إنستاباي الثاني (${val}) بنجاح ✓`,
    });
  }
  if (biz?.instapay3?.trim()) {
    const val = biz.instapay3.trim();
    const isUrl = /^https?:\/\//i.test(val);
    links.push({
      id: 'ip3',
      platform: 'instapay',
      title: 'InstaPay 3',
      subtitle: 'حساب تحويل إضافي',
      url: isUrl ? val : `https://instapay.eg`,
      icon: <InstaPayIcon size={60} />,
      brandColor: '#49258E',
      copyValue: val,
      copyMessage: `تم نسخ معرّف إنستاباي الثالث (${val}) بنجاح ✓`,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 4. WIFI (بيانات شبكة الواي فاي)
  // ═══════════════════════════════════════════════════════════
  if (wifiSsid && wifiPassword) {
    links.push({
      id: 'wifi',
      platform: 'wifi',
      title: 'Wi-Fi',
      subtitle: `الشبكة: ${wifiSsid} | كلمة المرور: ${wifiPassword}`,
      url: `${wifiSsid}\n${wifiPassword}`,
      copyValue: `اسم الشبكة: ${wifiSsid}\nكلمة المرور: ${wifiPassword}`,
      copyMessage: 'تم نسخ بيانات الواي فاي بنجاح ✓',
      icon: <Wifi size={60} />,
      brandColor: '#0EA5E9'
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 5. CONTACT (وسائل الاتصال)
  // ═══════════════════════════════════════════════════════════
  const availablePhones = getAvailablePhones();
  if (biz?.show_call_button !== false && (availablePhones.length > 0 || !biz)) {
    links.push({
      id: 'ph',
      platform: 'phone',
      title: 'Call',
      subtitle: 'يسعدنا استقبال مكالمتك',
      url: '#',
      onClick: handlePhoneClick,
      icon: <PhoneIcon size={60} />,
      brandColor: '#2563EB'
    });
  }
  if (biz?.email?.trim()) {
    links.push({ id: 'em', platform: 'email', title: 'Email', subtitle: 'راسلنا عبر البريد', url: `mailto:${biz.email}`, icon: <EmailIcon size={60} />, brandColor: '#6366F1' });
  }

  // ═══════════════════════════════════════════════════════════
  // 5. WEBSITE (الموقع الإلكتروني)
  // ═══════════════════════════════════════════════════════════
  if (biz?.website?.trim()) {
    links.push({ id: 'ws', platform: 'website', title: 'Website', subtitle: 'تصفح موقعنا', url: biz.website, icon: <GlobeIcon size={60} />, brandColor: '#3B82F6' });
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
              if (link.platform === 'wifi') {
                e.preventDefault();
                setWifiModalOpen(true);
              } else if (link.platform === 'vodafone_cash') {
                e.preventDefault();
                setVodafoneQrOpen(true);
              } else if (link.copyValue && link.platform === 'instapay' && !link.url.startsWith('http')) {
                e.preventDefault();
                copyToClipboard(link.copyValue, link.copyMessage);
              } else if (link.onClick) {
                link.onClick(e);
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
          --bg-base: #ffffff;
          --bg-solid: #ffffff;
          --surface: #ffffff;
          --text-primary: #111111;
          --text-secondary: #666666;
          --border-light: rgba(0, 0, 0, 0.08);
          --shadow-subtle: 0 4px 16px rgba(0, 0, 0, 0.02);
          --shadow-hover: 0 12px 28px rgba(0, 0, 0, 0.05);
          --radius-card: 24px;
          --theme-accent: #111111;
        }

        .nfc-page[data-template='dark'] {
          --bg-base: #000000;
          --bg-solid: #050505;
          --surface: rgba(20, 20, 20, 0.96);
          --text-primary: #f5f5f5;
          --text-secondary: #b5b5b5;
          --border-light: rgba(255, 255, 255, 0.14);
          --shadow-subtle: 0 18px 44px rgba(0, 0, 0, 0.3);
          --shadow-hover: 0 24px 58px rgba(0, 0, 0, 0.42);
          --radius-card: 26px;
          --theme-accent: #ffffff;
          background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%);
        }

        .nfc-page[data-template='dark']::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(ellipse at 50% 8%, rgba(255, 255, 255, 0.045), transparent 44%);
        }

        .nfc-page[data-template='dark'] > .nfc-container {
          position: relative;
          z-index: 1;
        }

        .nfc-page[data-template='dark'] .hero-img-wrap {
          background: linear-gradient(145deg, #1b1b1b, #080808) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.025), 0 24px 60px rgba(0, 0, 0, 0.42) !important;
        }

        .nfc-page[data-template='dark'] .hero-img-wrap > div {
          color: #ffffff !important;
          background: linear-gradient(145deg, #262626, #111111) !important;
        }

        .nfc-page[data-template='dark'] .nfc-tile {
          background: linear-gradient(145deg, rgba(26, 26, 26, 0.98), rgba(10, 10, 10, 0.98));
          border-color: rgba(255, 255, 255, 0.14);
          color: var(--text-primary);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.055) !important;
          transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
        }

        .nfc-page[data-template='dark'] .nfc-tile::before {
          content: '';
          position: absolute;
          top: 0;
          left: 18%;
          right: 18%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.38), transparent);
        }

        .nfc-page[data-template='dark'] .nfc-tile:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: linear-gradient(145deg, rgba(34, 34, 34, 0.98), rgba(15, 15, 15, 0.98));
          box-shadow: 0 24px 52px rgba(0, 0, 0, 0.42), 0 0 24px rgba(255, 255, 255, 0.035) !important;
        }

        .nfc-page[data-template='dark'] .nfc-empty {
          background: rgba(18, 18, 18, 0.92);
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow: var(--shadow-subtle);
        }

        .nfc-page[data-template='dark'] .nfc-btn-primary,
        .nfc-page[data-template='dark'] .nfc-save-contact {
          background: linear-gradient(110deg, #ffffff, #e8e8e8) !important;
          color: #111111 !important;
          box-shadow: 0 12px 32px rgba(255, 255, 255, 0.08) !important;
        }

        .nfc-booking-wrap {
          position: fixed;
          left: max(16px, env(safe-area-inset-left));
          bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          z-index: 900;
          display: flex;
          justify-content: flex-start;
          width: auto;
          box-sizing: border-box;
          padding: 0;
          pointer-events: none;
        }

        .nfc-booking-cta {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          width: auto;
          min-width: 136px;
          max-width: calc(100vw - 32px);
          min-height: 56px;
          padding: 5px 14px 5px 6px;
          box-sizing: border-box;
          border: 1px solid #d4d4d4;
          border-radius: 999px;
          background: #ffffff;
          color: #111111;
          direction: ltr;
          text-align: right;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.035);
          opacity: 0.84;
          transition: border-color 160ms ease, opacity 160ms ease;
          pointer-events: auto;
        }

        .nfc-booking-cta:hover {
          border-color: #888888;
          opacity: 1;
        }

        .nfc-booking-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          border: 1px solid #e5e5e5;
          border-radius: 50%;
          background: #f5f5f5;
        }

        .nfc-booking-copy {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          min-width: 0;
          text-align: right;
        }

        .nfc-booking-label {
          color: #111111;
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.35;
        }

        .nfc-booking-wrap[data-template='dark'] .nfc-booking-cta {
          border-color: #484848;
          background: #111111;
          color: #f5f5f5;
          box-shadow: none;
        }

        .nfc-booking-wrap[data-template='dark'] .nfc-booking-icon {
          border-color: #393939;
          background: #202020;
        }

        .nfc-booking-wrap[data-template='dark'] .nfc-booking-label {
          color: #f5f5f5;
        }

        @media (prefers-reduced-motion: reduce) {
          .nfc-booking-cta {
            transition: none;
          }
        }

        body {
          background-color: var(--bg-solid);
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }

        .nfc-page {
          min-height: 100vh;
          box-sizing: border-box;
          position: relative;
          color: var(--text-primary);
          font-family: 'Tajawal', 'Plus Jakarta Sans', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px 16px;
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
          min-height: calc(100vh - 64px);
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
            padding: 24px 12px 16px;
          }
          .nfc-container {
            min-height: calc(100vh - 40px);
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

        @media (max-width: 400px) {
          .footer-wrap {
            justify-content: flex-end;
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
          margin-top: auto;
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
      
      <div className="nfc-page" data-template={card.template || 'default'} dir="rtl" ref={containerRef}>
        <div className="nfc-container">
          <div className="gsap-hero" style={{ width: '100%' }}>
            <ProfileHero card={card} />

            {/* Save Contact (vCard) Action Button - only show if phone exists */}
            {biz?.phone?.trim() && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <a
                  href="#"
                  className="nfc-save-contact"
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

      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="nfc-booking-wrap"
            data-template={card.template || 'default'}
            dir="rtl"
            style={{
              position: 'fixed',
              left: 'max(16px, env(safe-area-inset-left))',
              bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
              right: 'auto',
              top: 'auto',
              transform: 'none',
              zIndex: 2147483647,
            }}
          >
            <a
              className="nfc-booking-cta"
              href="https://wa.me/201098277229"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="احجز كارتك على واتساب 01098277229"
            >
              <span className="nfc-booking-icon" aria-hidden="true">
                <WhatsAppIcon size={26} />
              </span>
              <span className="nfc-booking-copy" dir="rtl">
                <span className="nfc-booking-label">احجز كارتك</span>
              </span>
            </a>
          </div>,
          document.documentElement,
        )}

      {/* Floating Copy Feedback Toast */}
      {toastMsg && (
        <div
          dir="rtl"
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#111111',
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
          <Check size={16} style={{ color: '#ffffff' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Phone Selection Modal */}
      {wifiModalOpen && (
        <div
          dir="rtl"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setWifiModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              fontFamily: 'Tajawal, sans-serif',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Wifi size={30} style={{ color: '#0EA5E9', marginBottom: '6px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', margin: '0 0 6px' }}>الاتصال بالواي فاي</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px' }}>وجّه كاميرا الهاتف إلى الكود للاتصال بالشبكة</p>

            <div style={{ minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', padding: '12px', marginBottom: '16px' }}>
              {wifiQrCode ? (
                <img src={wifiQrCode} alt="QR Code للواي فاي" style={{ width: '280px', maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
              ) : (
                <span style={{ color: '#64748b', fontSize: '13px' }}>جاري تجهيز QR Code...</span>
              )}
            </div>

            <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '12px', textAlign: 'right', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>اسم الشبكة</div>
              <div style={{ direction: 'ltr', textAlign: 'left', fontWeight: 800, color: '#0f172a', wordBreak: 'break-all' }}>{wifiSsid}</div>
              <div style={{ fontSize: '12px', color: '#64748b', margin: '10px 0 4px' }}>كلمة المرور</div>
              <div style={{ direction: 'ltr', textAlign: 'left', fontWeight: 800, color: '#0f172a', wordBreak: 'break-all' }}>{wifiPassword}</div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(`اسم الشبكة: ${wifiSsid}\nكلمة المرور: ${wifiPassword}`, 'تم نسخ بيانات الواي فاي بنجاح ✓')}
              style={{ width: '100%', padding: '13px', border: 'none', borderRadius: '12px', background: '#0EA5E9', color: '#fff', fontWeight: 800, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}
            >
              نسخ بيانات الشبكة
            </button>
            <button
              type="button"
              onClick={() => setWifiModalOpen(false)}
              style={{ marginTop: '9px', width: '100%', padding: '12px', border: 'none', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {vodafoneQrOpen && (
        <div dir="rtl" onClick={() => setVodafoneQrOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(15, 23, 42, .68)', backdropFilter: 'blur(4px)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '370px', padding: '22px', borderRadius: '22px', background: '#fff', boxShadow: '0 24px 70px rgba(0,0,0,.3)', textAlign: 'center', fontFamily: 'Tajawal, sans-serif' }}>
            <VodafoneCashIcon size={42} />
            <h3 style={{ margin: '10px 0 5px', color: '#7f1d1d', fontSize: '20px', fontWeight: 900 }}>التحويل عبر فودافون كاش</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px' }}>امسح رمز QR من تطبيق المحفظة، أو انسخ الرقم للتحويل يدويًا</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '220px', marginBottom: '14px', padding: '12px', border: '1px solid #fee2e2', borderRadius: '16px', background: '#fffafa' }}>
              {biz?.vodafone_cash_qr ? (
                <img src={biz.vodafone_cash_qr} alt="رمز QR لمحفظة فودافون كاش" style={{ display: 'block', width: '220px', maxWidth: '100%', aspectRatio: '1', objectFit: 'contain', borderRadius: '10px' }} />
              ) : (
                <span style={{ color: '#64748b', fontSize: '13px' }}>لم تُرفع صورة QR لهذه المحفظة.</span>
              )}
            </div>
            <div dir="ltr" style={{ marginBottom: '12px', color: '#111827', fontSize: '19px', fontWeight: 900, letterSpacing: '.5px' }}>{biz?.vodafone_cash}</div>
            <button type="button" onClick={() => copyToClipboard(String(biz?.vodafone_cash || ''), `تم نسخ رقم محفظة فودافون كاش (${biz?.vodafone_cash || ''}) بنجاح ✓`)} style={{ width: '100%', minHeight: '46px', border: 0, borderRadius: '12px', background: '#b91c1c', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>نسخ رقم المحفظة</button>
            <button type="button" onClick={() => setVodafoneQrOpen(false)} style={{ width: '100%', minHeight: '42px', marginTop: '8px', border: 0, borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>إغلاق</button>
          </div>
        </div>
      )}

      {phoneModalOpen && (
        <div
          dir="rtl"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setPhoneModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              fontFamily: 'Tajawal, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', marginBottom: '16px', textAlign: 'center' }}>
              اختر رقم للاتصال
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getAvailablePhones().map((phone, index) => (
                <button
                  key={index}
                  onClick={() => handleCallPhone(phone.number)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    backgroundColor: '#f7f7f7',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Tajawal, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#e5e5e5';
                    (e.currentTarget as HTMLElement).style.borderColor = '#c7c7c7';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f7f7f7';
                    (e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5';
                  }}
                >
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#666666', marginBottom: '4px' }}>
                      {phone.label}
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111111', direction: 'ltr' }}>
                      {phone.number}
                    </div>
                  </div>
                  <PhoneIcon size={20} style={{ color: '#111111' }} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setPhoneModalOpen(false)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '14px',
                backgroundColor: '#f2f2f2',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#666666',
                cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#e5e5e5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f2f2f2';
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </>
  );
};
