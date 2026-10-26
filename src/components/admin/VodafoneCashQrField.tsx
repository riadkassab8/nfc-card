import React, { useRef, useState } from 'react';
import { Upload, Trash2, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { cardsApi } from '../../services/api/cardsApi';

interface VodafoneCashQrFieldProps {
  value?: string | null;
  onChange: (value: string) => void;
}

export const VodafoneCashQrField: React.FC<VodafoneCashQrFieldProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      await Swal.fire({
        icon: 'warning',
        title: 'صيغة الصورة غير مدعومة',
        text: 'ارفع صورة QR بصيغة PNG أو JPG أو WEBP.',
        confirmButtonColor: '#b80000',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire({
        icon: 'warning',
        title: 'حجم الصورة كبير',
        text: 'الحد الأقصى لصورة QR هو 5 ميجابايت.',
        confirmButtonColor: '#b80000',
      });
      return;
    }

    setUploading(true);
    try {
      const result = await cardsApi.uploadLogo(file);
      if (!result?.url) throw new Error('لم يصل رابط الصورة من الخادم');
      onChange(result.url);
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'تعذر رفع صورة QR',
        text: error?.message || 'حاول مرة أخرى أو استخدم صورة أصغر.',
        confirmButtonColor: '#b80000',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: '#fffafa', border: '1px solid #f3d1d1', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
      <div>
        <strong style={{ display: 'block', color: '#7f1d1d', fontSize: '14px' }}>صورة QR للتحويل إلى المحفظة (اختياري)</strong>
        <span style={{ display: 'block', marginTop: '4px', color: '#64748b', fontSize: '12px', lineHeight: 1.6 }}>
          ارفع QR الخاص بالمحفظة؛ سيظهر للعميل مع رقم المحفظة. أدخل الرقم فقط في حقل المحفظة، ولا تضع رابط اتصال.
        </span>
      </div>

      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <img src={value} alt="معاينة QR المحفظة" style={{ width: '116px', height: '116px', objectFit: 'contain', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px' }} />
          <span style={{ color: '#15803d', fontSize: '12px', fontWeight: 700 }}>تم رفع رمز QR</span>
        </div>
      ) : (
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>لم يتم رفع صورة QR بعد.</span>
      )}

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 18px', border: '1px solid #b91c1c', borderRadius: '10px', background: uploading ? '#991b1b' : '#b91c1c', color: '#fff', fontSize: '13px', fontWeight: 800, lineHeight: 1, cursor: uploading ? 'wait' : 'pointer', boxShadow: '0 3px 8px rgba(185, 28, 28, 0.18)', opacity: uploading ? 0.8 : 1, transition: 'background .15s ease, transform .15s ease, box-shadow .15s ease' }}
        >
          {uploading ? <><RefreshCw size={16} className="animate-spin" /> جاري الرفع...</> : <><Upload size={16} /> {value ? 'تغيير صورة QR' : 'رفع صورة QR'}</>}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 16px', border: '1px solid #fecaca', borderRadius: '10px', background: '#fff', color: '#b91c1c', fontSize: '13px', fontWeight: 700, lineHeight: 1, cursor: uploading ? 'not-allowed' : 'pointer', transition: 'background .15s ease, border-color .15s ease' }}
          >
            <Trash2 size={16} /> إزالة الصورة
          </button>
        )}
      </div>
    </div>
  );
};
