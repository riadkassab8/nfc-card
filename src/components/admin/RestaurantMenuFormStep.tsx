import React from 'react';
import { Instagram, MapPin, Phone, Plus, Star, Trash2, Utensils, Video, UploadCloud } from 'lucide-react';

export interface RestaurantLocationFormItem {
  id: string;
  name: string;
  google_maps_url: string;
}

interface Props {
  data: Record<string, string>;
  updateData: (key: string, value: string) => void;
  locations: RestaurantLocationFormItem[];
  updateLocation: (id: string, field: 'name' | 'google_maps_url', value: string) => void;
  addLocation: () => void;
  removeLocation: (id: string) => void;
  onLogoFile: (file: File) => void;
}

const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 12px', border: '1px solid #dfe7e1', borderRadius: 11, background: '#fff', color: '#304039', fontFamily: 'inherit', fontSize: 13, outline: 'none' };

export const RestaurantMenuFormStep: React.FC<Props> = ({ data, updateData, locations, updateLocation, addLocation, removeLocation, onLogoFile }) => (
  <section dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 18, background: '#fff', border: '1px solid #dfe7e1', borderRadius: 20, padding: '22px 24px', boxShadow: '0 8px 24px rgba(54,77,65,.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #eef2ef' }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: '#e5efe8', color: '#527462', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Utensils size={21} /></div>
      <div><h2 style={{ margin: 0, fontSize: 18, color: '#304039', fontWeight: 900 }}>بيانات المطعم والمنيو</h2><p style={{ margin: '4px 0 0', fontSize: 12, color: '#81958b' }}>املأ البيانات التي ستظهر للعميل في قالب المطعم والكافيه فقط.</p></div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
      <label style={fieldStyle}><span style={{ fontWeight: 800, fontSize: 12.5 }}>اسم المطعم أو الكافيه *</span><input style={inputStyle} value={data.business_name || ''} onChange={(e) => updateData('business_name', e.target.value)} placeholder="مثال: صُحبة كافيه" /></label>
      <div style={fieldStyle}>
        <span style={{ fontWeight: 800, fontSize: 12.5 }}>شعار المطعم أو الكافيه</span>
        <label style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 44, boxSizing: 'border-box' }}>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => { if (e.target.files?.[0]) onLogoFile(e.target.files[0]); }} style={{ display: 'none' }} />
          {data.logo ? <img src={data.logo} alt="معاينة الشعار" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} /> : <UploadCloud size={20} color="#668878" />}
          <span style={{ color: '#668878', fontSize: 12 }}>{data.logo ? 'تغيير صورة الشعار' : 'اضغط لاختيار صورة الشعار'}</span>
        </label>
      </div>
      <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}><span style={{ fontWeight: 800, fontSize: 12.5 }}>الوصف المختصر</span><textarea style={{ ...inputStyle, minHeight: 76, resize: 'vertical' }} value={data.description || ''} onChange={(e) => updateData('description', e.target.value)} placeholder="اكتب وصفًا قصيرًا يعبّر عن تجربة المكان والطعام..." /></label>
    </div>

    <div style={{ background: '#f7faf8', border: '1px solid #e3ece6', borderRadius: 15, padding: 15 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#40594d', display: 'flex', alignItems: 'center', gap: 7 }}><Utensils size={16} /> المنيو والطلبات</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
        <label style={fieldStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>رابط المنيو أو العروض</span><input dir="ltr" style={inputStyle} value={data.offers_url || ''} onChange={(e) => updateData('offers_url', e.target.value)} placeholder="https://.../menu" /></label>
        <label style={fieldStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>رابط الطلب أونلاين</span><input dir="ltr" style={inputStyle} value={data.website || ''} onChange={(e) => updateData('website', e.target.value)} placeholder="https://..." /></label>
      </div>
    </div>

    <div style={{ background: '#f7faf8', border: '1px solid #e3ece6', borderRadius: 15, padding: 15 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#40594d', display: 'flex', alignItems: 'center', gap: 7 }}><Phone size={16} /> الحجز والتواصل</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <label style={fieldStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>رقم الحجز والاتصال</span><input dir="ltr" style={inputStyle} value={data.phone || ''} onChange={(e) => updateData('phone', e.target.value)} placeholder="01000000000" /></label>
        <label style={fieldStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>رابط واتساب الحجز</span><input dir="ltr" style={inputStyle} value={data.whatsapp || ''} onChange={(e) => updateData('whatsapp', e.target.value)} placeholder="https://wa.me/201..." /></label>
        <label style={fieldStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>الموقع على الخريطة</span><input dir="ltr" style={inputStyle} value={data.google_maps || ''} onChange={(e) => updateData('google_maps', e.target.value)} placeholder="https://maps.app.goo.gl/..." /></label>
        <label style={fieldStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>رابط تقييم Google</span><input dir="ltr" style={inputStyle} value={data.google_review_url || ''} onChange={(e) => updateData('google_review_url', e.target.value)} placeholder="https://g.page/r/.../review" /></label>
      </div>
    </div>

    <div style={{ background: '#f7faf8', border: '1px solid #e3ece6', borderRadius: 15, padding: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}><h3 style={{ margin: 0, fontSize: 14, color: '#40594d', display: 'flex', alignItems: 'center', gap: 7 }}><MapPin size={16} /> الفروع والمواقع</h3><button type="button" onClick={addLocation} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', borderRadius: 9, padding: '8px 11px', background: '#dce9df', color: '#40594d', fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer', fontSize: 11.5 }}><Plus size={14} /> إضافة فرع</button></div>
      {locations.length === 0 && <p style={{ margin: 0, color: '#81958b', fontSize: 12 }}>أضف الفروع إذا كان لديك أكثر من موقع.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{locations.map((location, index) => <div key={location.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(130px,.7fr) minmax(180px,1.3fr) auto', gap: 8, alignItems: 'center' }}><input style={inputStyle} value={location.name} onChange={(e) => updateLocation(location.id, 'name', e.target.value)} placeholder={`اسم الفرع ${index + 1}`} /><input dir="ltr" style={inputStyle} value={location.google_maps_url} onChange={(e) => updateLocation(location.id, 'google_maps_url', e.target.value)} placeholder="رابط Google Maps" /><button type="button" onClick={() => removeLocation(location.id)} aria-label="حذف الفرع" style={{ width: 36, height: 36, border: '1px solid #f0d8d5', borderRadius: 9, background: '#fff7f6', color: '#b86b62', cursor: 'pointer' }}><Trash2 size={15} /></button></div>)}</div>
    </div>

    <div style={{ background: '#f7faf8', border: '1px solid #e3ece6', borderRadius: 15, padding: 15 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#40594d', display: 'flex', alignItems: 'center', gap: 7 }}><Star size={16} /> روابط السوشيال</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {([['instagram', 'Instagram', <Instagram size={15} />], ['facebook', 'Facebook', <span style={{ fontWeight: 900 }}>f</span>], ['tiktok', 'TikTok', <Video size={15} />]] as const).map(([key, label, icon]) => <label style={fieldStyle} key={key}><span style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>{icon}{label}</span><input dir="ltr" style={inputStyle} value={data[key] || ''} onChange={(e) => updateData(key, e.target.value)} placeholder={`https://${label.toLowerCase()}.com/...`} /></label>)}
      </div>
    </div>
  </section>
);
