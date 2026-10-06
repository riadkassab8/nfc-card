import React, { useState } from 'react';
import { customersApi } from '../../services';
import { ApiCustomer, ApiCreateCustomerDto, ApiUpdateCustomerDto } from '../../types';
import { X, Save, RefreshCw, User, Phone } from 'lucide-react';


interface CustomerModalProps {
  customer?: ApiCustomer | null;
  onClose: () => void;
  onSuccess: (savedCustomer?: ApiCustomer) => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  onClose,
  onSuccess,
  onToast,
}) => {
  const isEdit = !!customer;

  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [city, setCity] = useState(customer?.city || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [notes, setNotes] = useState(customer?.notes || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('اسم العميل أو النشاط مطلوب');
      return;
    }
    if (!trimmedPhone) {
      setError('رقم الهاتف مطلوب');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && customer) {
        const dto: ApiUpdateCustomerDto = {
          name: trimmedName,
          phone: trimmedPhone,
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        };
        const updated = await customersApi.updateCustomer(customer._id, dto);
        onToast('تم تحديث بيانات العميل بنجاح ✓', 'success');
        onSuccess(updated);
        onClose();
      } else {
        const dto: ApiCreateCustomerDto = {
          name: trimmedName,
          phone: trimmedPhone,
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        };
        const created = await customersApi.createCustomer(dto);
        onToast('تمت إضافة العميل الجديد بنجاح ✓', 'success');
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء حفظ بيانات العميل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="modal-panel"
        dir="rtl"
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--r-2xl)',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalIn 220ms var(--ease-out) both',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--bdr-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--clr-primary-50)',
                color: 'var(--clr-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: 'var(--fs-md)', fontWeight: 800, margin: 0 }}>
                {isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </h2>
              <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>
                {isEdit ? 'تحديث معلومات الاتصال والعنوان' : 'تسجيل عميل جديد لربطه بالبطاقات الذكية'}
              </p>
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--txt-muted)',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: 'var(--r-md)',
                backgroundColor: 'var(--clr-error-bg)',
                border: '1px solid var(--clr-error-bdr)',
                color: 'var(--clr-error)',
                fontWeight: 600,
                fontSize: 'var(--fs-sm)',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <form id="customer-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '6px', display: 'block' }}>
                اسم العميل أو النشاط التجاري <span style={{ color: 'var(--clr-error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: د. أحمد علي / مطعم الشرق"
                  required
                  style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '6px', display: 'block' }}>
                رقم الهاتف / الواتساب <span style={{ color: 'var(--clr-error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--txt-muted)',
                  }}
                />
                <input
                  type="text"
                  dir="ltr"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  required
                  style={{ width: '100%', height: '42px', borderRadius: '10px', textAlign: 'right', paddingLeft: '36px' }}
                />
              </div>
            </div>

            {/* Email & City row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '6px', display: 'block' }}>
                  البريد الإلكتروني (اختياري)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    dir="ltr"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@example.com"
                    style={{ width: '100%', height: '42px', borderRadius: '10px', textAlign: 'right' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '6px', display: 'block' }}>
                  المحافظة / المدينة (اختياري)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: القاهرة / الإسكندرية"
                  style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '6px', display: 'block' }}>
                العنوان التفصيلي للشحن (اختياري)
              </label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: مدينة نصر - عيادة النور - الدور الثالث"
                style={{ width: '100%', height: '42px', borderRadius: '10px' }}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '6px', display: 'block' }}>
                ملاحظات خاصة بالاتفاق أو التصميم (اختياري)
              </label>
              <textarea
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات حول الكروت، تفاصيل الاستلام، أو الاتفاق..."
                rows={3}
                style={{ width: '100%', borderRadius: '10px', resize: 'vertical', minHeight: '75px', padding: '10px' }}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid var(--bdr-light)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <button type="button" onClick={onClose} className="btn-outline" disabled={saving} style={{ padding: '8px 18px', borderRadius: '10px' }}>
            إلغاء
          </button>
          <button
            type="submit"
            form="customer-form"
            className="btn-primary"
            disabled={saving}
            style={{
              padding: '8px 22px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontWeight: 700,
            }}
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="spin" /> جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={15} /> {isEdit ? 'حفظ التعديلات' : 'إضافة العميل'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
