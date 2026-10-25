import React, { useRef, useState } from 'react';
import { Activity, Clock3, Dumbbell, Instagram, MapPin, Phone, Plus, Trash2, UploadCloud, Users, Wallet } from 'lucide-react';

export interface GymFormData {
  business_name: string;
  logo: string;
  description: string;
  gym_tagline: string;
  gym_cover_image: string;
  phone: string;
  whatsapp: string;
  website: string;
  google_maps: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  gym_opening_hours: string;
  gym_services: string;
  gym_plans: string;
  gym_trainers: string;
  gym_classes: string;
}

interface Props {
  data: Record<string, string>;
  updateData: (key: string, value: string) => void;
  onLogoFile?: (file: File) => void;
  onImageFile?: (file: File) => Promise<string>;
  onImageUploadStateChange?: (uploading: boolean) => void;
}

const inputStyle: React.CSSProperties = { width: '100%', minHeight: 42, padding: '10px 12px', border: '1px solid #d7e0e7', borderRadius: 11, background: '#fff', color: '#172b3b', font: 'inherit', fontSize: 13, outline: 'none' };
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 };
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type ListKey = 'gym_services' | 'gym_plans' | 'gym_trainers' | 'gym_classes';
type ListItem = Record<string, string>;
const listConfig: Array<{ key: ListKey; title: string; icon: React.ReactNode; fields: Array<{ key: string; label: string; placeholder: string; multiline?: boolean; imageUpload?: boolean }> }> = [
  { key: 'gym_services', title: 'الخدمات والتجهيزات', icon: <Dumbbell size={17} />, fields: [{ key: 'title', label: 'الخدمة', placeholder: 'مثال: منطقة أوزان حرة' }, { key: 'description', label: 'تفاصيل مختصرة', placeholder: 'اكتب ما يميز الخدمة' }] },
  { key: 'gym_plans', title: 'العضويات والباقات', icon: <Wallet size={17} />, fields: [{ key: 'name', label: 'اسم الباقة', placeholder: 'مثال: اشتراك شهري' }, { key: 'price', label: 'السعر', placeholder: 'مثال: 1200 جنيه' }, { key: 'period', label: 'المدة', placeholder: 'مثال: شهر' }, { key: 'features', label: 'ما تتضمنه الباقة', placeholder: 'دخول مفتوح، حصة تقييم، متابعة مدرب', multiline: true }] },
  { key: 'gym_trainers', title: 'المدربون', icon: <Users size={17} />, fields: [{ key: 'name', label: 'اسم المدرب', placeholder: 'الاسم' }, { key: 'specialty', label: 'التخصص', placeholder: 'مثال: قوة ولياقة' }, { key: 'bio', label: 'نبذة', placeholder: 'خبرة أو إنجازات' }, { key: 'photo_url', label: 'صورة المدرب', placeholder: '', imageUpload: true }] },
  { key: 'gym_classes', title: 'الحصص الجماعية', icon: <Activity size={17} />, fields: [{ key: 'name', label: 'اسم الحصة', placeholder: 'مثال: HIIT' }, { key: 'schedule', label: 'الموعد', placeholder: 'مثال: السبت والاثنين - 7 مساءً' }, { key: 'trainer', label: 'المدرب', placeholder: 'اسم المدرب' }] },
];

const readItems = (value?: string): ListItem[] => {
  if (!value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};

const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('تعذر قراءة الصورة'));
  reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
  reader.readAsDataURL(file);
});

const validateImage = (file: File): string | null => {
  if (!file.type.startsWith('image/')) return 'اختَر ملف صورة صالحًا.';
  if (file.size > MAX_IMAGE_SIZE) return 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.';
  return null;
};

export const GymTemplateDataStep: React.FC<Props> = ({ data, updateData, onLogoFile, onImageFile, onImageUploadStateChange }) => {
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState('');
  const latestData = useRef(data);
  const activeUploads = useRef(0);
  latestData.current = data;
  const trackUpload = (delta: number) => {
    activeUploads.current = Math.max(0, activeUploads.current + delta);
    onImageUploadStateChange?.(activeUploads.current > 0);
  };
  const updateList = (key: ListKey, updater: (items: ListItem[]) => ListItem[]) => updateData(key, JSON.stringify(updater(readItems(latestData.current[key]))));

  const uploadCover = async (file: File) => {
    const validationError = validateImage(file);
    if (validationError) { setCoverError(validationError); return; }
    setCoverError('');
    setCoverUploading(true);
    trackUpload(1);
    try {
      const imageUrl = onImageFile ? await onImageFile(file) : await fileToDataUrl(file);
      updateData('gym_cover_image', imageUrl);
    } catch (error) {
      console.error('Gym cover upload failed:', error);
      setCoverError('تعذر رفع الصورة. حاول مرة أخرى.');
    } finally {
      setCoverUploading(false);
      trackUpload(-1);
    }
  };

  return (
    <section className="gym-form-step" dir="rtl">
      <style>{`.gym-form-step{display:flex;flex-direction:column;gap:18px;background:#fff;border:1px solid #dce5eb;border-radius:22px;padding:22px;box-shadow:0 12px 35px rgba(17,42,61,.06);color:#173044}.gym-form-head{display:flex;align-items:center;gap:12px;padding-bottom:15px;border-bottom:1px solid #edf1f4}.gym-form-head-icon{width:44px;height:44px;border-radius:14px;background:#e7f8f1;color:#0d9869;display:grid;place-items:center}.gym-form-head h2{margin:0;font-size:18px;font-weight:900}.gym-form-head p{margin:3px 0 0;color:#768898;font-size:12px}.gym-form-block{border:1px solid #e6edf1;border-radius:16px;padding:16px;background:#fbfcfd}.gym-form-block h3{display:flex;align-items:center;gap:8px;margin:0 0 13px;font-size:14px;color:#1b3a50}.gym-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:12px}.gym-form-field label{font-size:12px;font-weight:800;color:#42596a}.gym-form-upload{display:flex;align-items:center;gap:10px;min-height:48px;padding:8px 10px;border:1px dashed #bfccd5;border-radius:11px;background:#fff;cursor:pointer;font-size:12px;color:#218866}.gym-image-upload-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.gym-image-thumb{width:64px;height:48px;object-fit:cover;border-radius:9px;border:1px solid #e1e8ec;background:#f3f6f7}.gym-image-pick{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:8px 11px;border:1px dashed #b9c8d1;border-radius:10px;background:#fff;color:#17865e;font-size:12px;font-weight:800;cursor:pointer}.gym-image-pick:has(input:disabled){opacity:.6;cursor:wait}.gym-image-pick input{display:none}.gym-image-status{font-size:11px;color:#8293a0}.gym-image-error{font-size:11px;color:#b42318}.gym-form-list{display:flex;flex-direction:column;gap:10px}.gym-form-item{background:#fff;border:1px solid #e4ebef;border-radius:13px;padding:12px}.gym-form-item-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr));gap:9px}.gym-form-item input,.gym-form-item textarea{width:100%;padding:9px 10px;border:1px solid #e0e7ec;border-radius:9px;font:inherit;font-size:12px}.gym-form-add{display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border:0;border-radius:10px;background:#e4f5ed;color:#13815c;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.gym-form-remove{width:34px;height:34px;border:1px solid #f2d6d3;border-radius:9px;background:#fff7f6;color:#b9574e;cursor:pointer}.gym-form-hint{margin:8px 0 0;color:#8293a0;font-size:11px;line-height:1.7}@media(max-width:560px){.gym-form-step{padding:14px}.gym-form-block{padding:12px}}`}</style>
      <div className="gym-form-head"><div className="gym-form-head-icon"><Dumbbell size={22} /></div><div><h2>بيانات قالب الجيم</h2><p>كل البيانات الخاصة بصفحة الجيم في خطوة مستقلة، وأي إضافة أو تعديل يظهر مباشرة في المعاينة وصفحة البطاقة.</p></div></div>

      <div className="gym-form-block"><h3><Activity size={17} /> الهوية والواجهة الرئيسية</h3><div className="gym-form-grid">
        <label className="gym-form-field" style={{ ...fieldStyle, gridColumn: '1 / -1' }}><span>اسم الجيم *</span><input style={inputStyle} value={data.business_name || ''} onChange={(e) => updateData('business_name', e.target.value)} placeholder="مثال: أطلس فتنس" maxLength={120} /></label>
        <label className="gym-form-field" style={fieldStyle}><span>الشعار اللفظي</span><input style={inputStyle} value={data.gym_tagline || ''} onChange={(e) => updateData('gym_tagline', e.target.value)} placeholder="قوتك تبدأ من هنا" /></label>
        <div className="gym-form-field" style={fieldStyle}><span>صورة الغلاف</span><div className="gym-image-upload-row">{data.gym_cover_image && <img className="gym-image-thumb" src={data.gym_cover_image} alt="معاينة الغلاف" />}<label className="gym-image-pick"><UploadCloud size={17} /><span>{coverUploading ? 'جارٍ رفع الغلاف…' : data.gym_cover_image ? 'تغيير صورة الغلاف' : 'رفع صورة الغلاف'}</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={coverUploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadCover(file); e.currentTarget.value = ''; }} /></label><span className="gym-image-status">PNG أو JPG أو WEBP · حتى 5 ميجابايت</span></div>{coverError && <span className="gym-image-error">{coverError}</span>}</div>
        <div className="gym-form-field" style={fieldStyle}><span>شعار الجيم</span><label className="gym-form-upload">{data.logo ? <img src={data.logo} alt="شعار الجيم" style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover' }} /> : <UploadCloud size={20} />}<span>{data.logo ? 'تغيير الشعار' : 'اختيار صورة الشعار'}</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => { if (e.target.files?.[0]) onLogoFile?.(e.target.files[0]); }} /></label></div>
        <label className="gym-form-field" style={{ ...fieldStyle, gridColumn: '1 / -1' }}><span>نبذة عن الجيم</span><textarea style={{ ...inputStyle, minHeight: 75, resize: 'vertical' }} value={data.description || ''} onChange={(e) => updateData('description', e.target.value)} placeholder="عرّف الزائر بالمكان، التجهيزات، والفئة التي تخدمها." maxLength={500} /></label>
      </div></div>

      <div className="gym-form-block"><h3><Dumbbell size={17} /> الخدمات والمرافق</h3><ListEditor config={listConfig[0]} value={data.gym_services} updateList={updateList} onImageFile={onImageFile} trackUpload={trackUpload} /></div>
      <div className="gym-form-block"><h3><Wallet size={17} /> باقات العضوية والأسعار</h3><ListEditor config={listConfig[1]} value={data.gym_plans} updateList={updateList} onImageFile={onImageFile} trackUpload={trackUpload} /></div>
      <div className="gym-form-block"><h3><Users size={17} /> فريق التدريب</h3><ListEditor config={listConfig[2]} value={data.gym_trainers} updateList={updateList} onImageFile={onImageFile} trackUpload={trackUpload} /></div>
      <div className="gym-form-block"><h3><Activity size={17} /> الحصص الجماعية</h3><ListEditor config={listConfig[3]} value={data.gym_classes} updateList={updateList} onImageFile={onImageFile} trackUpload={trackUpload} /></div>

      <div className="gym-form-block"><h3><Clock3 size={17} /> المواعيد والتواصل</h3><div className="gym-form-grid">
        <label className="gym-form-field" style={fieldStyle}><span>مواعيد العمل</span><input style={inputStyle} value={data.gym_opening_hours || ''} onChange={(e) => updateData('gym_opening_hours', e.target.value)} placeholder="يوميًا من 6 ص إلى 12 م" /></label>
        <label className="gym-form-field" style={fieldStyle}><span><Phone size={13} /> رقم الهاتف</span><input dir="ltr" style={inputStyle} value={data.phone || ''} onChange={(e) => updateData('phone', e.target.value)} placeholder="01000000000" /></label>
        <label className="gym-form-field" style={fieldStyle}><span>رابط واتساب</span><input dir="ltr" style={inputStyle} value={data.whatsapp || ''} onChange={(e) => updateData('whatsapp', e.target.value)} placeholder="https://wa.me/201..." /></label>
        <label className="gym-form-field" style={fieldStyle}><span><MapPin size={13} /> موقع الجيم على الخريطة</span><input dir="ltr" style={inputStyle} value={data.google_maps || ''} onChange={(e) => updateData('google_maps', e.target.value)} placeholder="https://maps.app.goo.gl/..." /></label>
        <label className="gym-form-field" style={fieldStyle}><span>الموقع الإلكتروني / رابط التسجيل</span><input dir="ltr" style={inputStyle} value={data.website || ''} onChange={(e) => updateData('website', e.target.value)} placeholder="https://..." /></label>
        {(['instagram', 'facebook', 'tiktok'] as const).map((key) => <label className="gym-form-field" style={fieldStyle} key={key}><span><Instagram size={13} /> {key === 'instagram' ? 'إنستجرام' : key === 'facebook' ? 'فيسبوك' : 'تيك توك'}</span><input dir="ltr" style={inputStyle} value={data[key] || ''} onChange={(e) => updateData(key, e.target.value)} placeholder={`https://${key}.com/...`} /></label>)}
      </div><p className="gym-form-hint">الاسم مطلوب. الصور تُرفع كملفات؛ بقية البيانات اختيارية، والأقسام الفارغة لا تظهر في صفحة العرض.</p></div>
    </section>
  );
};

const ListEditor: React.FC<{ config: (typeof listConfig)[number]; value?: string; updateList: (key: ListKey, updater: (items: ListItem[]) => ListItem[]) => void; onImageFile?: (file: File) => Promise<string>; trackUpload: (delta: number) => void }> = ({ config, value, updateList, onImageFile, trackUpload }) => {
  const items = readItems(value);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, string>>({});
  const uploadTrainerPhoto = async (index: number, file: File) => {
    const validationError = validateImage(file);
    if (validationError) { setImageErrors((errors) => ({ ...errors, [index]: validationError })); return; }
    setImageErrors((errors) => { const next = { ...errors }; delete next[index]; return next; });
    setUploadingIndex(index);
    trackUpload(1);
    try {
      const imageUrl = onImageFile ? await onImageFile(file) : await fileToDataUrl(file);
      updateList('gym_trainers', (rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, photo_url: imageUrl } : row));
    } catch (error) {
      console.error('Gym trainer photo upload failed:', error);
      setImageErrors((errors) => ({ ...errors, [index]: 'تعذر رفع الصورة. حاول مرة أخرى.' }));
    } finally {
      setUploadingIndex(null);
      trackUpload(-1);
    }
  };

  return <div className="gym-form-list">{items.map((item, index) => <div className="gym-form-item" key={`${config.key}-${index}`}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><strong style={{ fontSize: 12, color: '#486274' }}>{config.title} {index + 1}</strong><button className="gym-form-remove" type="button" aria-label="حذف" onClick={() => updateList(config.key, (rows) => rows.filter((_, i) => i !== index))}><Trash2 size={15} /></button></div><div className="gym-form-item-grid">{config.fields.map((field) => <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: field.multiline || field.imageUpload ? '1 / -1' : undefined }}><span style={{ fontSize: 11, fontWeight: 700, color: '#657b8a' }}>{field.label}</span>{field.imageUpload ? <><div className="gym-image-upload-row">{item.photo_url && <img className="gym-image-thumb" src={item.photo_url} alt={`صورة ${item.name || 'المدرب'}`} />}<label className="gym-image-pick"><UploadCloud size={17} /><span>{uploadingIndex === index ? 'جارٍ رفع الصورة…' : item.photo_url ? 'تغيير صورة المدرب' : 'رفع صورة المدرب'}</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingIndex === index} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadTrainerPhoto(index, file); e.currentTarget.value = ''; }} /></label><span className="gym-image-status">PNG أو JPG أو WEBP · حتى 5 ميجابايت</span></div>{imageErrors[index] && <span className="gym-image-error">{imageErrors[index]}</span>}</> : field.multiline ? <textarea rows={2} value={item[field.key] || ''} placeholder={field.placeholder} onChange={(e) => updateList(config.key, (rows) => rows.map((row, i) => i === index ? { ...row, [field.key]: e.target.value } : row))} /> : <input dir={field.key.includes('url') ? 'ltr' : undefined} value={item[field.key] || ''} placeholder={field.placeholder} onChange={(e) => updateList(config.key, (rows) => rows.map((row, i) => i === index ? { ...row, [field.key]: e.target.value } : row))} />}</label>)}</div></div>)}<button type="button" className="gym-form-add" onClick={() => updateList(config.key, (rows) => [...rows, Object.fromEntries(config.fields.filter((field) => !field.imageUpload).map((field) => [field.key, '']))])}><Plus size={15} /> إضافة {config.title.replace(/والتجهيزات|والأسعار|فريق التدريب|الجماعية/g, '').trim() || 'عنصر'}</button></div>;
};
