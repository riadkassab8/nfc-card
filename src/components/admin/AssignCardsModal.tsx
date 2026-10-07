import React, { useState, useEffect } from 'react';
import { cardsApi, customersApi } from '../../services';
import { ApiCard } from '../../types';
import { X, Search, Check, RefreshCw, CreditCard, Link2, AlertCircle } from 'lucide-react';

interface AssignCardsModalProps {
  customerId: string;
  customerName: string;
  existingCardIds?: string[];
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AssignCardsModal: React.FC<AssignCardsModalProps> = ({
  customerId,
  customerName,
  existingCardIds = [],
  onClose,
  onSuccess,
  onToast,
}) => {
  const [availableCards, setAvailableCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch up to 100 cards to pick from
      const res = await cardsApi.getCards({ limit: 100 });
      const cardsList = res.data || [];
      // إخفاء الكروت المربوطة مسبقاً بأي عميل آخر (أو نفس العميل)
      const filtered = cardsList.filter((c) => {
        const isAssigned = !!(c.customer_id || c.customer);
        return !isAssigned && !existingCardIds.includes(c._id);
      });
      setAvailableCards(filtered);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل قائمة الكروت');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredCards.forEach((c) => next.add(c._id));
    setSelectedIds(next);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) {
      setError('يرجى اختيار كارت واحد على الأقل لربطه بالعميل');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await customersApi.assignCards(customerId, {
        card_ids: Array.from(selectedIds),
      });
      onToast(`تم ربط ${selectedIds.size} كارت بالعميل بنجاح ✓`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل ربط الكروت بالعميل');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCards = availableCards.filter((c) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      c.card_code.toLowerCase().includes(s) ||
      (c.custom_slug && c.custom_slug.toLowerCase().includes(s)) ||
      c.card_type.toLowerCase().includes(s)
    );
  });

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="modal-panel"
        dir="rtl"
        style={{
          maxWidth: '560px',
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
              <Link2 size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: 'var(--fs-md)', fontWeight: 800, margin: 0 }}>
                ربط كروت بالعميل
              </h2>
              <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>
                العميل: <strong style={{ color: 'var(--txt-heading)' }}>{customerName}</strong>
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

          {/* Search box & Selection controls */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
                placeholder="ابحث بكود الكارت أو الرابط..."
                style={{ width: '100%', height: '40px', borderRadius: '10px', paddingRight: '36px', fontSize: '13.5px' }}
              />
            </div>
            {filteredCards.length > 0 && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="btn-outline"
                  style={{ fontSize: '12px', padding: '6px 12px', height: '40px', borderRadius: '10px' }}
                >
                  تحديد الكل
                </button>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="btn-outline"
                    style={{ fontSize: '12px', padding: '6px 10px', height: '40px', borderRadius: '10px', color: 'var(--txt-muted)' }}
                  >
                    إلغاء التحديد
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cards List Selection */}
          <div
            style={{
              border: '1px solid var(--bdr-light)',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-subtle)',
              maxHeight: '320px',
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
                <span>جاري تحميل الكروت المتاحة...</span>
              </div>
            ) : filteredCards.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--txt-muted)' }}>
                <CreditCard size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
                  {search ? 'لا توجد كروت مطابقة للبحث' : 'لا توجد كروت متاحة حالياً للربط'}
                </p>
              </div>
            ) : (
              filteredCards.map((card) => {
                const isSelected = selectedIds.has(card._id);
                return (
                  <div
                    key={card._id}
                    onClick={() => toggleSelect(card._id)}
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
                          borderRadius: '6px',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '14px', color: 'var(--txt-heading)' }}>
                            {card.card_code}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--txt-secondary)',
                            }}
                          >
                            {card.card_type}
                          </span>
                        </div>
                        {card.custom_slug && (
                          <div style={{ fontSize: '12px', color: 'var(--clr-primary-700)', fontFamily: 'monospace', marginTop: '2px' }}>
                            /{card.custom_slug}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-error'}`}
                        style={{ fontSize: '11px' }}
                      >
                        {card.status === 'active' ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--txt-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} style={{ color: 'var(--clr-primary-500)' }} />
            <span>
              تم اختيار <strong>{selectedIds.size}</strong> كارت لربطهم بهذا العميل
            </span>
          </div>
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
            onClick={handleSubmit}
            className="btn-primary"
            disabled={submitting || selectedIds.size === 0}
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
                <RefreshCw size={15} className="spin" /> جاري الربط...
              </>
            ) : (
              <>
                <Link2 size={16} /> تأكيد ربط الكروت ({selectedIds.size})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
