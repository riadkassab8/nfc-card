import React, { useMemo, useState } from 'react';
import { Eye, PencilLine, RotateCcw } from 'lucide-react';
import { GymTemplateDataStep } from '../components/admin/GymTemplateDataStep';
import { GymTemplate } from '../components/public/GymTemplate';
import { ApiSocialPageResponse, BusinessData } from '../types';

const initialValues: Record<string, string> = {
  business_name: 'أطلس فتنس',
  logo: '',
  description: 'مساحة متكاملة للتدريب، بإشراف مدربين محترفين وبرامج تناسب كل مستوى. ابدأ رحلتك اليوم وخلي كل تمرينة تقربك من هدفك.',
  gym_tagline: 'قوتك تبدأ من هنا',
  gym_cover_image: '',
  phone: '01012345678',
  whatsapp: 'https://wa.me/201012345678',
  website: '',
  google_maps: 'https://maps.google.com',
  instagram: 'https://instagram.com',
  facebook: '',
  tiktok: '',
  gym_opening_hours: 'يوميًا من 6:00 صباحًا إلى 12:00 منتصف الليل',
  gym_services: JSON.stringify([
    { title: 'منطقة الأوزان الحرة', description: 'تجهيزات متنوعة للقوة وبناء العضلات.' },
    { title: 'كارديو ولياقة', description: 'أجهزة حديثة لرفع اللياقة وتحسين التحمل.' },
    { title: 'تدريب شخصي', description: 'برنامج فردي ومتابعة مستمرة مع مدربك.' },
  ]),
  gym_plans: JSON.stringify([
    { name: 'العضوية الشهرية', price: '1,200 جنيه', period: 'شهريًا', features: 'دخول مفتوح، تقييم لياقة، غرفة تغيير' },
    { name: 'عضوية 3 شهور', price: '3,000 جنيه', period: 'كل 3 شهور', features: 'دخول مفتوح، تقييم ومتابعة، خصم على التدريب الشخصي' },
  ]),
  gym_trainers: JSON.stringify([
    { name: 'كابتن كريم', specialty: 'قوة ولياقة', bio: 'خبرة في بناء البرامج التدريبية للمبتدئين والمحترفين.' },
    { name: 'كابتن سارة', specialty: 'لياقة وحركة', bio: 'تساعدك على تطوير الحركة والمرونة بأمان.' },
  ]),
  gym_classes: JSON.stringify([
    { name: 'HIIT', schedule: 'السبت والاثنين · 7 مساءً', trainer: 'كابتن سارة' },
    { name: 'قوة وتحمل', schedule: 'الأحد والثلاثاء · 8 مساءً', trainer: 'كابتن كريم' },
  ]),
};

export const GymTemplatePreviewPage: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, string>>(initialValues);
  const [showEditor, setShowEditor] = useState(true);
  const updateData = (key: string, value: string) => setFormData((current) => ({ ...current, [key]: value }));
  const businessData = useMemo(() => {
    const result: Record<string, unknown> = { ...formData };
    for (const key of ['gym_services', 'gym_plans', 'gym_trainers', 'gym_classes']) {
      try { result[key] = JSON.parse(formData[key] || '[]'); } catch { result[key] = []; }
    }
    return result as BusinessData;
  }, [formData]);
  const previewData: ApiSocialPageResponse = {
    card_code: 'GYM-PREVIEW',
    card_type: 'كارت',
    template: 'gym',
    business_data: businessData,
  };
  const handleLogoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') updateData('logo', reader.result); };
    reader.readAsDataURL(file);
  };
  const handleImageFile = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('تعذر قراءة الصورة'));
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    reader.readAsDataURL(file);
  });

  return (
    <main className="gym-preview-workspace" dir="rtl">
      <style>{`.gym-preview-workspace{min-height:100vh;background:#eff3f4;color:#173044;padding:18px}.gym-preview-bar{max-width:1440px;margin:0 auto 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.gym-preview-brand{display:flex;align-items:center;gap:10px}.gym-preview-brand-mark{width:38px;height:38px;border-radius:12px;background:#c7f36b;color:#142010;display:grid;place-items:center;font-size:18px}.gym-preview-brand h1{font-size:16px;margin:0;font-weight:900}.gym-preview-brand p{margin:2px 0 0;font-size:11px;color:#728390}.gym-preview-actions{display:flex;gap:8px}.gym-preview-actions button{display:inline-flex;align-items:center;gap:7px;border:1px solid #d4dfe4;border-radius:10px;background:#fff;padding:9px 12px;color:#29485b;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.gym-preview-layout{max-width:1440px;margin:0 auto;display:grid;grid-template-columns:minmax(330px,.9fr) minmax(0,1.1fr);align-items:start;gap:16px}.gym-preview-editor{min-width:0}.gym-preview-editor .gym-form-step{box-shadow:0 10px 30px rgba(21,49,66,.06)}.gym-preview-frame{position:sticky;top:12px;min-width:0;border:1px solid #d5dee2;border-radius:20px;background:#fff;padding:8px;box-shadow:0 12px 32px rgba(21,49,66,.08);height:calc(100vh - 95px);overflow:auto}.gym-preview-frame .gym-page{border-radius:14px;min-height:100%}.gym-preview-phone{width:min(100%,430px);margin:0 auto}.gym-preview-note{margin:0 auto 10px;text-align:center;font-size:10px;color:#71818b}@media(max-width:850px){.gym-preview-workspace{padding:11px}.gym-preview-layout{grid-template-columns:1fr}.gym-preview-frame{position:relative;top:auto;order:-1;height:auto;max-height:82vh}.gym-preview-editor{order:1}}`}</style>
      <header className="gym-preview-bar"><div className="gym-preview-brand"><div className="gym-preview-brand-mark">⌁</div><div><h1>معاينة قالب الجيم</h1><p>حرّر أي حقل وشاهد التغيير مباشرة في صفحة العرض.</p></div></div><div className="gym-preview-actions"><button type="button" onClick={() => setFormData(initialValues)}><RotateCcw size={15} /> استعادة المثال</button><button type="button" onClick={() => setShowEditor((shown) => !shown)}><PencilLine size={15} /> {showEditor ? 'إخفاء المحرر' : 'إظهار المحرر'}</button></div></header>
      <div className="gym-preview-layout">
        {showEditor && <section className="gym-preview-editor"><GymTemplateDataStep data={formData} updateData={updateData} onLogoFile={handleLogoFile} onImageFile={handleImageFile} /></section>}
        <section className={`gym-preview-frame${showEditor ? '' : ' gym-preview-phone'}`} aria-label="معاينة صفحة العرض"><p className="gym-preview-note"><Eye size={12} style={{ verticalAlign: 'middle', marginLeft: 4 }} /> معاينة مباشرة — التغييرات تظهر فورًا، ويمكنك تمرير الصفحة لرؤية كل الأقسام</p><GymTemplate data={previewData} preview /></section>
      </div>
    </main>
  );
};
