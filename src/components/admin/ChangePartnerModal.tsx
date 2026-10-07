import React, { useState } from 'react';
import { customersApi } from '../../services';
import { ApiCustomer } from '../../types';
import { UserCheck, RefreshCw, X, ArrowRightLeft } from 'lucide-react';

interface ChangePartnerModalProps {
  customer: ApiCustomer;
  onClose: () => void;
  onSuccess: (updatedCustomer?: ApiCustomer) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ChangePartnerModal: React.FC<ChangePartnerModalProps> = ({
  customer,
  onClose,
  onSuccess,
  onToast,
}) => {
  const [partner, setPartner] = useState(customer?.partner && customer.partner !== 'عام' ? customer.partner : 'Eng / Riad kassab');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPartner = partner.trim() || 'Eng / Riad kassab';

    if (targetPartner === (customer.partner || 'Eng / Riad kassab')) {
      onToast('العميل مخصص بالفعل لهذا الشريك.', 'info');
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await customersApi.changePartner(customer._id, targetPartner);
      const msg = res.message || `تم تعيين العميل "${customer.name}" للشريك "${targetPartner}" بنجاح.`;
      onToast(msg, 'success');
      onSuccess(res.customer);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل تحديث الشريك المسؤول');
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
          background: '#fff',
          borderRadius: 'var(--r-2xl)',
          padding: '28px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalIn 220ms var(--ease-out) both',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowRightLeft size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                نقل / تغيير الشريك المسؤول
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                تعيين عميل إلى شريك أو مدير حسابات آخر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--txt-muted)',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Target customer card */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '18px',
            border: '1px solid var(--bdr-light)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginBottom: '4px' }}>
            العميل المختار:
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--txt-heading)', marginBottom: '4px' }}>
            {customer.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
            <span style={{ color: 'var(--txt-muted)' }}>الشريك الحالي:</span>
            <span
              style={{
                fontWeight: 700,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
              }}
            >
              {customer.partner || 'عام'}
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--clr-error-bg)',
              border: '1px solid var(--clr-error-bdr)',
              color: 'var(--clr-error)',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--txt-heading)' }}>
              اختر أو اكتب الشريك الجديد <span style={{ color: 'var(--clr-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
                <select
                  className="form-input"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                >
                  <option value="Eng / Riad kassab">Eng / Riad kassab</option>
                  <option value="Eng / Abdullah rabeh">Eng / Abdullah rabeh</option>
                  {customer?.partner && customer.partner !== 'Eng / Riad kassab' && customer.partner !== 'Eng / Abdullah rabeh' && customer.partner !== 'عام' && (
                    <option value={customer.partner}>{customer.partner}</option>
                  )}
                </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-outline"
              style={{ flex: 1, height: '42px', borderRadius: '10px', fontWeight: 700 }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '10px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {saving ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>تأكيد النقل</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
