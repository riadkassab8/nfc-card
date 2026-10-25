import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Clock3,
  Copy,
  Coffee,
  Facebook,
  Globe2,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  ShoppingBag,
  Star,
  Utensils,
  Video,
} from 'lucide-react';
import { ApiSocialPageResponse, BusinessData, PaymentShift } from '../../types';
import { InstaPayIcon, VodafoneCashIcon } from './BrandIcons';

interface Props {
  data: ApiSocialPageResponse;
}

const normalizeUrl = (value?: string | null) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const phoneHref = (value?: string | null) => {
  if (!value) return '';
  return `tel:${value.replace(/[^+\d]/g, '')}`;
};

export const RestaurantCafeTemplate: React.FC<Props> = ({ data }) => {
  const [copiedPayment, setCopiedPayment] = useState<string | null>(null);
  const biz: BusinessData = data.business_data || {};
  const shifts = useMemo<PaymentShift[]>(
    () => (data.payment_shifts || []).filter((item) => item.is_active !== false),
    [data.payment_shifts],
  );
  const hasMenu = Boolean(biz.offers_url || biz.website);
  const primaryPhone = biz.phone || biz.phone1 || biz.phone2 || biz.phone3;
  const locations = biz.locations || [];
  const paymentRows = shifts
    .filter((shift) => shift.instapay?.trim() || shift.vodafone_cash?.trim())
    .map((shift) => ({ label: shift.label, instapay: shift.instapay?.trim() || '', vodafone_cash: shift.vodafone_cash?.trim() || '' }));
  const payments = paymentRows.length > 0
    ? paymentRows
    : [{ label: 'وسائل الدفع', instapay: biz.instapay?.trim() || '', vodafone_cash: biz.vodafone_cash?.trim() || '' }];
  const hasPayments = payments.some((payment) => payment.instapay || payment.vodafone_cash);
  const getInstaPayUrl = (value: string) => {
    if (/^https?:\/\//i.test(value)) return value;
    return `https://ipn.eg/S/${encodeURIComponent(value)}/instapay`;
  };
  const getInstaPayDisplay = (value: string) => {
    const match = value.match(/ipn\.eg\/S\/([^/]+)\/instapay/i);
    return match?.[1] ? `${match[1]}@instapay` : value.replace(/^https?:\/\//i, '');
  };
  const copyPayment = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedPayment(key);
      window.setTimeout(() => setCopiedPayment(null), 1800);
    } catch {
      // Clipboard can be unavailable on non-secure pages; keep the button harmless.
    }
  };
  const socialLinks = [
    { label: 'Instagram', href: biz.instagram, icon: <Instagram size={18} /> },
    { label: 'Facebook', href: biz.facebook, icon: <Facebook size={18} /> },
    { label: 'TikTok', href: biz.tiktok, icon: <Video size={18} /> },
  ].filter((item) => item.href);

  const openNow = shifts.some((shift) => {
    if (shift.hour_from == null || shift.hour_to == null) return false;
    const toMinutes = (hour: number, period?: string | null) => {
      let value = Number(hour) % 12;
      if ((period || '').toLowerCase() === 'pm') value += 12;
      return value * 60;
    };
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const from = toMinutes(shift.hour_from, shift.period_from);
    const to = toMinutes(shift.hour_to, shift.period_to);
    return from <= to ? current >= from && current < to : current >= from || current < to;
  });

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const mapsUrl = normalizeUrl(biz.google_maps);
  const menuUrl = normalizeUrl(biz.offers_url || biz.website);

  return (
    <div className="restaurant-template" dir="rtl">
      <style>{`
        .restaurant-template{min-height:100vh;background:#f6f8f6;color:#26332e;font-family:var(--font,Arial,sans-serif);padding-bottom:32px}
        .restaurant-shell{width:min(100%,760px);margin:auto;padding:16px}
        .restaurant-hero{position:relative;overflow:hidden;border-radius:30px;background:linear-gradient(135deg,#34463f 0%,#4e655b 58%,#718579 100%);color:#fff;padding:24px 20px 22px;box-shadow:0 16px 34px rgba(50,70,61,.16)}
        .restaurant-hero:before,.restaurant-hero:after{content:'';position:absolute;border-radius:50%;pointer-events:none;background:rgba(224,236,228,.12)}
        .restaurant-hero:before{width:210px;height:210px;top:-120px;left:-70px}.restaurant-hero:after{width:180px;height:180px;bottom:-110px;right:-55px}
        .restaurant-topbar{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:28px}
        .restaurant-brand{display:flex;align-items:center;gap:10px;min-width:0}.restaurant-logo{width:52px;height:52px;border-radius:17px;object-fit:cover;border:2px solid rgba(255,255,255,.5);background:#e3eee7}.restaurant-logo-fallback{display:flex;align-items:center;justify-content:center;color:#456056}
        .restaurant-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,225,174,.35);background:rgba(255,255,255,.1);padding:7px 10px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap}
        .restaurant-hero h1{position:relative;z-index:1;font-size:clamp(27px,7vw,44px);line-height:1.12;margin:0 0 10px;font-weight:900;letter-spacing:-.8px}.restaurant-hero p{position:relative;z-index:1;color:#e3eee7;line-height:1.8;font-size:13px;margin:0;max-width:580px}
        .restaurant-actions{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:20px}.restaurant-btn{display:flex;align-items:center;justify-content:center;gap:7px;border-radius:13px;padding:12px 10px;font-size:12.5px;font-weight:800;text-decoration:none;border:1px solid rgba(255,255,255,.18);cursor:pointer}.restaurant-btn-primary{background:#dce9df;color:#30483d;border-color:#dce9df}.restaurant-btn-ghost{background:rgba(255,255,255,.1);color:#fff}
        .restaurant-nav{display:flex;gap:7px;overflow:auto;padding:12px 2px 2px;scrollbar-width:none}.restaurant-nav::-webkit-scrollbar{display:none}.restaurant-nav button{white-space:nowrap;border:1px solid #dfe7e1;background:#ffffff;color:#4f6b5d;border-radius:999px;padding:9px 13px;font-family:inherit;font-size:11.5px;font-weight:800;cursor:pointer}
        .restaurant-section{margin-top:22px}.restaurant-section-heading{display:flex;align-items:end;justify-content:space-between;gap:10px;margin:0 3px 11px}.restaurant-section-heading h2{font-size:18px;margin:0;font-weight:900;color:#304039}.restaurant-section-heading span{font-size:11px;color:#7f9689;font-weight:700}
        .restaurant-menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.restaurant-menu-card{min-height:134px;border:1px solid #dfe7e1;border-radius:18px;padding:16px;background:linear-gradient(145deg,#fffdf9,#ffffff);display:flex;flex-direction:column;justify-content:space-between}.restaurant-menu-icon{width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:#dce9df;color:#4f6b5d}.restaurant-menu-card strong{font-size:14px;color:#304039}.restaurant-menu-card small{font-size:11px;color:#81958b;line-height:1.5}
        .restaurant-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.restaurant-info-card{border-radius:18px;padding:15px;background:#fff;border:1px solid #dfe7e1;box-shadow:0 8px 22px rgba(54,77,65,.05)}.restaurant-info-card strong{display:block;font-size:13px;margin-top:8px;color:#304039}.restaurant-info-card span{font-size:11px;color:#81958b;line-height:1.6}.restaurant-info-icon{color:#668878}
        .restaurant-hours{display:flex;flex-direction:column;gap:8px}.restaurant-hour-row{display:flex;justify-content:space-between;gap:12px;align-items:center;background:#fff;border:1px solid #dfe7e1;border-radius:13px;padding:11px 13px;font-size:12px}.restaurant-hour-row strong{color:#40594d}.restaurant-hour-row span{color:#81958b;direction:rtl;unicode-bidi:plaintext;white-space:nowrap}.restaurant-open{color:#16845a!important}.restaurant-location{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff;border:1px solid #dfe7e1;border-radius:16px;padding:13px;text-decoration:none;color:#30483d}.restaurant-location-name{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:800}.restaurant-location small{display:block;color:#7f9689;font-size:10px;margin-top:3px;font-weight:500}.restaurant-link{display:inline-flex;align-items:center;gap:5px;color:#668878;font-size:11px;font-weight:800}
        .restaurant-review{border-radius:22px;padding:20px;text-align:center;background:linear-gradient(135deg,#ffffff,#f6f8f6);border:1px solid #dfe7e1}.restaurant-review h3{font-size:17px;margin:0 0 6px}.restaurant-review p{font-size:12px;color:#81958b;margin:0 0 14px}.restaurant-stars{color:#c89a4b;letter-spacing:4px;font-size:25px}.restaurant-socials{display:flex;justify-content:center;gap:9px}.restaurant-social{width:42px;height:42px;border-radius:13px;background:#fff;border:1px solid #dfe7e1;display:flex;align-items:center;justify-content:center;color:#4f6b5d;text-decoration:none}.restaurant-footer{text-align:center;color:#9aaca2;font-size:10.5px;margin-top:26px}
        @media(max-width:430px){.restaurant-shell{padding:10px}.restaurant-hero{border-radius:24px;padding:19px 16px 18px}.restaurant-menu-grid,.restaurant-info-grid{gap:8px}.restaurant-menu-card{padding:13px;min-height:125px}.restaurant-menu-card strong{font-size:12.5px}.restaurant-badge{font-size:10px;padding:6px 8px}}
      `}</style>

      <main className="restaurant-shell">
        <section className="restaurant-hero">
          <div className="restaurant-topbar">
            <div className="restaurant-brand">
              {biz.logo ? <img className="restaurant-logo" src={biz.logo} alt="" /> : <div className="restaurant-logo restaurant-logo-fallback"><Coffee size={25} /></div>}
              <div><div style={{ fontSize: 11, color: '#e3eee7', fontWeight: 700 }}>مطعم وكافيه</div><div style={{ fontSize: 13, fontWeight: 900 }}>{biz.business_name || 'اسم المطعم والكافيه'}</div></div>
            </div>
            <span className="restaurant-badge"><span style={{ width: 7, height: 7, borderRadius: '50%', background: openNow ? '#5ee39a' : '#f7c66d' }} />{openNow ? 'مفتوح الآن' : 'أهلاً بكم'}</span>
          </div>
          <h1>طعم يستحق<br />أن يُحكى.</h1>
          <p>{biz.description || 'اكتشف أطباقنا المختارة، قهوتنا المميزة، وتجربة ضيافة مصممة لتبقى في ذاكرتك.'}</p>
          <div className="restaurant-actions">
            {hasMenu && <a className="restaurant-btn restaurant-btn-primary" href={menuUrl} target="_blank" rel="noreferrer"><Utensils size={16} /> تصفح المنيو</a>}
            {primaryPhone && <a className="restaurant-btn restaurant-btn-ghost" href={phoneHref(primaryPhone)}><Phone size={16} /> احجز طاولتك</a>}
            {!hasMenu && !primaryPhone && <button className="restaurant-btn restaurant-btn-primary" onClick={() => scrollTo('restaurant-contact')}><ArrowLeft size={16} /> اكتشف المكان</button>}
          </div>
        </section>

        <nav className="restaurant-nav" aria-label="التنقل داخل الصفحة">
          <button onClick={() => scrollTo('restaurant-menu')}>المنيو والعروض</button><button onClick={() => scrollTo('restaurant-hours')}>مواعيد العمل</button>{hasPayments && <button onClick={() => scrollTo('restaurant-payments')}>وسائل الدفع</button>}<button onClick={() => scrollTo('restaurant-locations')}>الفروع</button><button onClick={() => scrollTo('restaurant-contact')}>تواصل معنا</button>
        </nav>

        <section id="restaurant-menu" className="restaurant-section">
          <div className="restaurant-section-heading"><h2>كل ما تشتهيه في مكان واحد</h2><span>اختياراتنا اليومية</span></div>
          <div className="restaurant-menu-grid">
            <div className="restaurant-menu-card"><div className="restaurant-menu-icon"><Utensils size={20} /></div><div><strong>قائمة الطعام</strong><br /><small>أطباقنا الرئيسية والوجبات المفضلة</small></div></div>
            <div className="restaurant-menu-card"><div className="restaurant-menu-icon" style={{ background: '#e8d8c7' }}><Coffee size={20} /></div><div><strong>ركن القهوة</strong><br /><small>مشروبات ساخنة وباردة بحب</small></div></div>
            <a className="restaurant-menu-card" href={menuUrl || '#'} target={menuUrl ? '_blank' : undefined} rel="noreferrer" style={{ textDecoration: 'none' }}><div className="restaurant-menu-icon" style={{ background: '#d9ead8', color: '#32623d' }}><ShoppingBag size={20} /></div><div><strong>العروض والطلبات</strong><br /><small>{menuUrl ? 'اطلب الآن أو شاهد عروض اليوم' : 'أضف رابط المنيو من لوحة التحكم'}</small></div></a>
            <div className="restaurant-menu-card"><div className="restaurant-menu-icon" style={{ background: '#f0d6d0', color: '#8d4336' }}><Star size={20} /></div><div><strong>تجربة تستحق التقييم</strong><br /><small>شاركنا رأيك وساعدنا نتحسن</small></div></div>
          </div>
        </section>

        <section id="restaurant-hours" className="restaurant-section">
          <div className="restaurant-section-heading"><h2>مواعيد العمل</h2><span>{openNow ? 'نستقبلكم الآن' : 'نتشرف بزيارتكم'}</span></div>
          <div className="restaurant-hours">{shifts.length ? shifts.map((shift, index) => <div className="restaurant-hour-row" key={`${shift.label}-${index}`}><strong><Clock3 size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />{shift.label || `الفترة ${index + 1}`}</strong><span className={openNow ? 'restaurant-open' : ''}>{shift.hour_from != null ? `${shift.hour_from} ${shift.period_from === 'pm' ? 'م' : 'ص'} — ${shift.hour_to} ${shift.period_to === 'pm' ? 'م' : 'ص'}` : 'يرجى التواصل معنا'}</span></div>) : <div className="restaurant-hour-row"><strong>مفتوحين لخدمتكم</strong><span>اتصل بنا لمعرفة المواعيد</span></div>}</div>
        </section>

        {hasPayments && <section className="restaurant-section" id="restaurant-payments">
          <div className="restaurant-section-heading"><h2>الدفع والتحويل اللحظي</h2><span style={{ color: '#10b981' }}>تحويل فوري ومباشر</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {payments.map((payment, index) => <div key={`${payment.label}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {payments.length > 1 && <strong style={{ color: '#40594d', fontSize: 12 }}>{payment.label || `الفترة ${index + 1}`}</strong>}
              {payment.instapay && <div style={{ background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', borderRadius: 22, padding: '18px 20px', color: '#fff', boxShadow: '0 10px 25px -4px rgba(75,85,99,.25)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><InstaPayIcon size={46} style={{ borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,.15)' }} /><div><div style={{ fontSize: 12, color: '#e5e7eb', fontWeight: 600 }}>حساب إنستاباي المعتمد</div><div dir="ltr" style={{ fontSize: 16, fontWeight: 800, color: '#fff', textAlign: 'right', fontFamily: 'monospace, sans-serif' }}>{getInstaPayDisplay(payment.instapay)}</div></div></div><span style={{ background: 'rgba(255,255,255,.14)', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>فوري مجاناً</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><button type="button" onClick={() => copyPayment(getInstaPayDisplay(payment.instapay), `insta-${payment.label}-${index}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 10px', borderRadius: 12, background: copiedPayment === `insta-${payment.label}-${index}` ? '#10b981' : '#fff', color: copiedPayment === `insta-${payment.label}-${index}` ? '#fff' : '#4b5563', border: 'none', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>{copiedPayment === `insta-${payment.label}-${index}` ? <><Check size={16} /> تم النسخ!</> : <><Copy size={16} /> نسخ المعرف</>}</button><a href={getInstaPayUrl(payment.instapay)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 10px', borderRadius: 12, background: 'rgba(255,255,255,.16)', color: '#fff', textDecoration: 'none', fontSize: 12.5, fontWeight: 700, border: '1px solid rgba(255,255,255,.25)' }}><ArrowUpRight size={16} /> فتح إنستاباي</a></div>
              </div>}
              {payment.vodafone_cash && <div style={{ background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', borderRadius: 22, padding: '18px 20px', color: '#fff', boxShadow: '0 10px 25px -4px rgba(107,114,128,.25)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><VodafoneCashIcon size={46} style={{ borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,.15)' }} /><div><div style={{ fontSize: 12, color: '#e5e7eb', fontWeight: 600 }}>محفظة فودافون كاش المعتمدة</div><div dir="ltr" style={{ fontSize: 18, fontWeight: 800, color: '#fff', textAlign: 'right', fontFamily: 'monospace, sans-serif' }}>{payment.vodafone_cash}</div></div></div><span style={{ background: 'rgba(255,255,255,.16)', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>كاش فوري</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><button type="button" onClick={() => copyPayment(payment.vodafone_cash, `vodafone-${payment.label}-${index}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 10px', borderRadius: 12, background: copiedPayment === `vodafone-${payment.label}-${index}` ? '#10b981' : '#fff', color: copiedPayment === `vodafone-${payment.label}-${index}` ? '#fff' : '#b80000', border: 'none', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>{copiedPayment === `vodafone-${payment.label}-${index}` ? <><Check size={16} /> تم النسخ!</> : <><Copy size={16} /> نسخ الرقم</>}</button><a href={phoneHref(payment.vodafone_cash)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 10px', borderRadius: 12, background: 'rgba(255,255,255,.18)', color: '#fff', textDecoration: 'none', fontSize: 12.5, fontWeight: 700, border: '1px solid rgba(255,255,255,.25)' }}><PhoneCall size={16} /> اتصال / تحويل</a></div>
              </div>}
            </div>)}
          </div>
        </section>}

        {locations.length > 0 && <section id="restaurant-locations" className="restaurant-section"><div className="restaurant-section-heading"><h2>زورنا في أقرب فرع</h2><span>{locations.length} فروع</span></div><div className="restaurant-hours">{locations.map((location, index) => <a className="restaurant-location" href={normalizeUrl(location.google_maps_url)} target="_blank" rel="noreferrer" key={`${location.name}-${index}`}><span className="restaurant-location-name"><MapPin className="restaurant-info-icon" size={20} /><span>{location.name}<small>الموقع على خرائط Google</small></span></span><span className="restaurant-link">الاتجاهات <ChevronLeft size={14} /></span></a>)}</div></section>}

        <section id="restaurant-contact" className="restaurant-section"><div className="restaurant-section-heading"><h2>نحن قريبون منك</h2><span>تواصل واحجز بسهولة</span></div><div className="restaurant-info-grid">
          {primaryPhone && <a className="restaurant-info-card" href={phoneHref(primaryPhone)} style={{ textDecoration: 'none' }}><Phone className="restaurant-info-icon" size={20} /><strong>اتصل بنا</strong><span dir="ltr">{primaryPhone}</span></a>}
          {biz.whatsapp && <a className="restaurant-info-card" href={normalizeUrl(biz.whatsapp)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}><MessageCircle className="restaurant-info-icon" size={20} /><strong>واتساب الحجز</strong><span>رد سريع على استفسارك</span></a>}
          {mapsUrl && <a className="restaurant-info-card" href={mapsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}><MapPin className="restaurant-info-icon" size={20} /><strong>الموقع الرئيسي</strong><span>افتح الاتجاهات الآن</span></a>}
          {biz.website && <a className="restaurant-info-card" href={normalizeUrl(biz.website)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}><Globe2 className="restaurant-info-icon" size={20} /><strong>اطلب أونلاين</strong><span>زور موقعنا الإلكتروني</span></a>}
        </div></section>

        {biz.google_review_url && <section className="restaurant-section"><div className="restaurant-review"><div className="restaurant-stars">★★★★★</div><h3>انبسطت معانا؟</h3><p>تقييمك الجميل يساعدنا نوصل لناس أكثر.</p><a className="restaurant-btn restaurant-btn-primary" href={normalizeUrl(biz.google_review_url)} target="_blank" rel="noreferrer"><Star size={16} /> قيّمنا على Google</a></div></section>}

        {socialLinks.length > 0 && <section className="restaurant-section"><div className="restaurant-socials">{socialLinks.map((item) => <a className="restaurant-social" href={normalizeUrl(item.href)} target="_blank" rel="noreferrer" title={item.label} key={item.label}>{item.icon}</a>)}</div></section>}
        <footer className="restaurant-footer">صُممت تجربة {biz.business_name || 'مطعمك'} بحب بواسطة k2rty NFC Solutions</footer>
      </main>
    </div>
  );
};

