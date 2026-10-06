import React, { useState } from 'react';
import { customersApi } from '../../services';
import { ApiCustomer } from '../../types';
import { Lock, AlertTriangle, RefreshCw, X, Trash2 } from 'lucide-react';

interface DeleteCustomerModalProps {
  customer: ApiCustomer;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
  customer,
  onClose,
  onSuccess,
  onToast,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('يرجى إدخال كلمة مرور الأدمن لتأكيد الحذف');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await customersApi.deleteCustomer(customer._id, password.trim());
      const msg = res.message || `تم نقل العميل "${customer.name}" إلى سلة المهملات بنجاح. يمكنك استرجاعه في أي وقت.`;
      onToast(msg, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.statusCode === 401) {
        setError('كلمة مرور الأدمن غير صحيحة، تم إلغاء عملية الحذف للحماية.');
      } else {
        setError(err?.message || 'فشل حذف العميل. تأكد من كلمة المرور وحاول ثانية.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="modal-panel"
        dir="rtl"
        style={{
          background: '#fff',
          borderRadius: 'var(--r-2xl)',
          padding: '28px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalIn 220ms var(--ease-out) both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--clr-error-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--clr-error)',
              }}
            >
              <Trash2 size={22} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                تأكيد حذف العميل (نقل للمهملات)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt-muted)' }}>
                حماية البيانات من الحذف الخاطئ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--txt-muted)',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--txt-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
          هل أنت متأكد من حذف العميل <strong>"{customer.name}"</strong>؟
          <br />
          <span style={{ fontSize: '12.5px', color: 'var(--txt-muted)' }}>
            سيتم نقل العميل إلى <strong>سلة المهملات</strong> مع إمكانية استرجاعه في أي وقت.
          </span>
        </p>

        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              borderRadius: 'var(--r-md)',
              backgroundColor: 'var(--clr-error-bg)',
              border: '1px solid var(--clr-error-bdr)',
              color: 'var(--clr-error)',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              lineHeight: 1.5,
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--txt-body)', marginBottom: '6px' }}>
              كلمة مرور الأدمن للتأكيد <span style={{ color: 'var(--clr-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--txt-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة مرور الأدمن الحالي"
                autoFocus
                required
                className="form-input"
                style={{
                  width: '100%',
                  height: '42px',
                  paddingRight: '36px',
                  borderRadius: '10px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
              style={{ padding: '8px 18px', borderRadius: '10px' }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--clr-error)',
                color: '#fff',
                cursor: loading || !password.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '13.5px',
                opacity: loading || !password.trim() ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="spin" /> جاري التحقق والحذف...
                </>
              ) : (
                <>
                  <Trash2 size={15} /> تأكيد الحذف والنقل للمهملات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
