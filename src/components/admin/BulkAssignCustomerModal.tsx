import React, { useState, useEffect } from 'react';
import { customersApi } from '../../services';
import { ApiCustomer } from '../../types';
import { X, Search, Check, RefreshCw, UserCheck, Users, AlertCircle } from 'lucide-react';


interface BulkAssignCustomerModalProps {
  cardIds: string[];
  cardCodes?: string[];
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const BulkAssignCustomerModal: React.FC<BulkAssignCustomerModalProps> = ({
  cardIds,
  cardCodes = [],
  onClose,
  onSuccess,
  onToast,
}) => {
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customersApi.getCustomers({ limit: 100 });
      setCustomers(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل قائمة العملاء');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('يرجى اختيار العميل أولاً');
      return;
    }

    const customer = customers.find((c) => c._id === selectedCustomerId);
    setSubmitting(true);
    setError(null);
    try {
      await customersApi.assignCards(selectedCustomerId, {
        card_ids: cardIds,
      });
      onToast(`تم تعيين وربط ${cardIds.length} كارت بالعميل "${customer?.name || ''}" بنجاح ✓`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل تعيين الكروت للعميل');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      c.name.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s) ||
      (c.city && c.city.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s))
    );
  });

  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

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
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: 'var(--fs-md)', fontWeight: 800, margin: 0 }}>
                تعيين وربط البطاقات بعميل (Assign Cards)
              </h2>
              <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>
                تم تحديد <strong style={{ color: 'var(--clr-primary-700)' }}>{cardIds.length}</strong> بطاقة
              </p>
            </div>
          </div>
          <button
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

        {/* Content */}
        <div style={{ padding: '20px 22px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--r-md)',
                backgroundColor: 'var(--clr-error-bg)',
                border: '1px solid var(--clr-error-bdr)',
                color: 'var(--clr-error)',
                fontWeight: 600,
                fontSize: 'var(--fs-sm)',
              }}
            >
              {error}
            </div>
          )}

          {/* Cards preview badge list */}
          {cardCodes.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--clr-primary-50)',
                border: '1px solid var(--clr-primary-200)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                alignItems: 'center',
                maxHeight: '80px',
                overflowY: 'auto',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-primary-800)', marginInlineEnd: '4px' }}>
                الكروت المختارة:
              </span>
              {cardCodes.map((code) => (
                <span
                  key={code}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    backgroundColor: '#fff',
                    color: 'var(--clr-primary-700)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--clr-primary-200)',
                  }}
                >
                  {code}
                </span>
              ))}
            </div>
          )}

          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--txt-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم العميل أو رقم الهاتف..."
              style={{ width: '100%', height: '40px', borderRadius: '10px', paddingRight: '36px', fontSize: '13.5px' }}
            />
          </div>

          {/* Customers List Selection */}
          <div
            style={{
              border: '1px solid var(--bdr-light)',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-subtle)',
              maxHeight: '280px',
              overflowY: 'auto',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--txt-muted)' }}>
                <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                <span>جاري تحميل قائمة العملاء...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--txt-muted)' }}>
                <Users size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
                  {search ? 'لا يوجد عملاء مطابقين للبحث' : 'لا يوجد عملاء مسجلين بالنظام حالياً'}
                </p>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomerId === cust._id;
                return (
                  <div
                    key={cust._id}
                    onClick={() => setSelectedCustomerId(cust._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'var(--clr-primary-50)' : '#fff',
                      border: `1.5px solid ${isSelected ? 'var(--clr-primary-500)' : 'var(--bdr-light)'}`,
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--clr-primary-500)' : 'var(--bdr-medium)'}`,
                          backgroundColor: isSelected ? 'var(--clr-primary-500)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          transition: 'all 120ms ease',
                        }}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--txt-heading)' }}>
                          {cust.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--txt-muted)', direction: 'ltr', textAlign: 'right' }}>
                          {cust.phone} {cust.city ? `• ${cust.city}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--txt-secondary)' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      >
                        {cust.total_cards || 0} كروت سابقة
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedCustomer && (
            <div style={{ fontSize: '13px', color: 'var(--clr-primary-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} />
              <span>
                سيتم ربط البطاقات بالعميل: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone})
              </span>
            </div>
          )}
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
          <button type="button" onClick={onClose} className="btn-outline" disabled={submitting} style={{ padding: '8px 18px', borderRadius: '10px' }}>
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleAssign}
            className="btn-primary"
            disabled={submitting || !selectedCustomerId}
            style={{
              padding: '8px 22px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontWeight: 700,
            }}
          >
            {submitting ? (
              <>
                <RefreshCw size={15} className="spin" /> جاري التعيين...
              </>
            ) : (
              <>
                <UserCheck size={16} /> تأكيد التعيين للعميل
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
