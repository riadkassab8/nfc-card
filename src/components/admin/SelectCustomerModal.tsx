import React, { useState, useEffect } from 'react';
import { customersApi } from '../../services';
import { ApiCustomer } from '../../types';
import { X, Search, User, CheckCircle2 } from 'lucide-react';

interface SelectCustomerModalProps {
  onClose: () => void;
  onSelect: (customer: ApiCustomer) => void;
  selectedCustomerId?: string | null;
}

export const SelectCustomerModal: React.FC<SelectCustomerModalProps> = ({
  onClose,
  onSelect,
  selectedCustomerId,
}) => {
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await customersApi.getCustomers({ limit: 1000, search: search.trim() || undefined });
        setCustomers(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    // Debounce search
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="modal-overlay" style={{ zIndex: 1300 }}>
      <div
        className="modal-panel"
        dir="rtl"
        style={{
          maxWidth: '450px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          backgroundColor: '#fff',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalIn 220ms ease-out both',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bdr-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--clr-primary-600)' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>اختيار عميل للربط</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--txt-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--bdr-light)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم العميل أو رقم الهاتف..."
              className="form-input"
              style={{ width: '100%', paddingRight: '36px', height: '40px', borderRadius: '10px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--txt-muted)', padding: '20px' }}>جاري التحميل...</div>
          ) : customers.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--txt-muted)', padding: '20px' }}>لم يتم العثور على عملاء</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {customers.map((c) => {
                const isSelected = c._id === selectedCustomerId;
                return (
                  <div
                    key={c._id}
                    onClick={() => onSelect(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? 'var(--clr-primary-500)' : 'var(--bdr-light)'}`,
                      backgroundColor: isSelected ? 'var(--clr-primary-50)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--clr-primary-800)' : 'var(--txt-heading)' }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '2px' }}>
                        {c.phone} {c.city ? `- ${c.city}` : ''}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} style={{ color: 'var(--clr-primary-500)' }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
