import React, { useState } from 'react';
import { customersApi } from '../../services';
import { ApiCustomer, ApiCreateCustomerDto, ApiUpdateCustomerDto, ApiCard } from '../../types';
import { X, Save, RefreshCw, User, Phone, CreditCard, Plus, UserCheck } from 'lucide-react';
import { SelectCardsModal } from './SelectCardsModal';


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
  const [partner, setPartner] = useState(customer?.partner || 'عام');
  const [partnersList, setPartnersList] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardsModalOpen, setCardsModalOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState<ApiCard[]>([]);
  const [initialCardIds, setInitialCardIds] = useState<Set<string>>(new Set());
  const [loadingCards, setLoadingCards] = useState(isEdit);

  React.useEffect(() => {
    customersApi.getPartnersList()
      .then((list) => {
        if (Array.isArray(list)) {
          setPartnersList(list);
        }
      })
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    if (isEdit && customer) {
      customersApi.getCustomerById(customer._id)
        .then((res) => {
          // Cast ApiCustomerDetailCard to ApiCard for compatibility in state, or just fetch full cards.
          // Since SelectCardsModal uses ApiCard, we might need full cards. But we only need _id, card_code, business_data.
          const mappedCards = res.cards.map(c => ({
            _id: c._id,
            card_code: c.card_code,
            business_data: { business_name: c.custom_slug || '' }
          } as ApiCard));
          setSelectedCards(mappedCards);
          setInitialCardIds(new Set(mappedCards.map(c => c._id)));
        })
        .catch(console.error)
        .finally(() => setLoadingCards(false));
    }
  }, [isEdit, customer]);

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
          partner: partner.trim() || 'عام',
        };
        const updated = await customersApi.updateCustomer(customer._id, dto);
        
        // Handle cards diff
        const currentCardIds = new Set(selectedCards.map(c => c._id));
        
        // unassign removed cards
        for (const oldId of initialCardIds) {
          if (!currentCardIds.has(oldId)) {
            await customersApi.unassignCard(updated._id, oldId).catch(console.error);
          }
        }
        
        // assign new cards
        const toAssign = Array.from(currentCardIds).filter(id => !initialCardIds.has(id));
        if (toAssign.length > 0) {
          await customersApi.assignCards(updated._id, { card_ids: toAssign }).catch(console.error);
        }

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
          partner: partner.trim() || 'عام',
        };
        const created = await customersApi.createCustomer(dto);

        if (selectedCards.length > 0) {
          await customersApi.assignCards(created._id, { card_ids: selectedCards.map(c => c._id) }).catch(console.error);
        }

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

            {/* Partner */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={15} style={{ color: 'var(--clr-primary-600)' }} />
                  الشريك المسؤول (Account Manager / Partner)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--txt-muted)', fontWeight: 500 }}>
                  افتراضياً: عام
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  list="partners-suggestions"
                  className="form-input"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  placeholder="اختر أو اكتب اسم الشريك (مثال: عبدالله / أحمد / عام)"
                  style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                />
                <datalist id="partners-suggestions">
                  {partnersList.map((p) => (
                    <option key={p} value={p} />
                  ))}
                  {!partnersList.includes('عام') && <option value="عام" />}
                </datalist>
              </div>
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

          {/* Cards Assignment Section */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--bdr-light)', paddingTop: '16px' }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={15} style={{ color: 'var(--clr-primary-500)' }} />
              ربط الكروت بالعميل
            </label>
            
            {loadingCards ? (
              <div style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>جاري تحميل الكروت...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedCards.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCards.map(c => (
                      <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--clr-primary-200)', backgroundColor: 'var(--clr-primary-50)' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--clr-primary-800)', fontSize: '13.5px', fontFamily: 'monospace' }}>
                            {c.card_code}
                          </div>
                        </div>
                        <button type="button" onClick={() => setSelectedCards(prev => prev.filter(sc => sc._id !== c._id))} style={{ background: 'none', border: 'none', color: 'var(--clr-error)', cursor: 'pointer', padding: '4px' }}>
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCardsModalOpen(true)}
                      className="btn-outline"
                      style={{ padding: '8px', fontSize: '12.5px', borderRadius: '8px', marginTop: '4px' }}
                    >
                      + تعديل / إضافة كروت أخرى
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCardsModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px dashed var(--clr-primary-300)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--clr-primary-600)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Plus size={15} /> اختيار كروت للربط
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {cardsModalOpen && (
          <SelectCardsModal
            onClose={() => setCardsModalOpen(false)}
            onSelect={(cards) => setSelectedCards(cards)}
            initialSelectedCards={selectedCards}
          />
        )}

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
