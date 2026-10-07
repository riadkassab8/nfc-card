import React, { useState, useEffect } from 'react';
import { cardsApi } from '../../services';
import { ApiCard } from '../../types';
import { X, Search, CreditCard, CheckCircle2 } from 'lucide-react';

interface SelectCardsModalProps {
  onClose: () => void;
  onSelect: (selectedCards: ApiCard[]) => void;
  initialSelectedCards?: ApiCard[];
}

export const SelectCardsModal: React.FC<SelectCardsModalProps> = ({
  onClose,
  onSelect,
  initialSelectedCards = [],
}) => {
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedCards, setSelectedCards] = useState<ApiCard[]>(initialSelectedCards);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await cardsApi.getCards({ limit: 1000, search: search.trim() || undefined });
        const allCards = res.data || [];
        // إخفاء الكروت المربوطة بعملاء آخرين (إظهار الكروت غير المربوطة أو الكروت المربوطة بالعميل الحالي فقط)
        const filteredCards = allCards.filter(
          (c) => !(c.customer_id || c.customer) || initialSelectedCards.some((selected) => selected._id === c._id)
        );
        setCards(filteredCards);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchCards, 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggleSelection = (card: ApiCard) => {
    const isSelected = selectedCards.some(c => c._id === card._id);
    if (isSelected) {
      setSelectedCards(prev => prev.filter(c => c._id !== card._id));
    } else {
      setSelectedCards(prev => [...prev, card]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedCards);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1300 }}>
      <div
        className="modal-panel"
        dir="rtl"
        style={{
          maxWidth: '500px',
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
            <CreditCard size={18} style={{ color: 'var(--clr-primary-600)' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>اختيار كروت للربط</h3>
            <span style={{ fontSize: '12px', color: 'var(--txt-secondary)', backgroundColor: '#fff', padding: '2px 6px', borderRadius: '8px', border: '1px solid var(--bdr-light)' }}>
              تم اختيار {selectedCards.length}
            </span>
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
              placeholder="ابحث بكود الكارت أو النشاط التجاري..."
              className="form-input"
              style={{ width: '100%', paddingRight: '36px', height: '40px', borderRadius: '10px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--txt-muted)', padding: '20px' }}>جاري التحميل...</div>
          ) : cards.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--txt-muted)', padding: '20px' }}>لم يتم العثور على كروت</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {cards.map((card) => {
                const isSelected = selectedCards.some(c => c._id === card._id);
                return (
                  <div
                    key={card._id}
                    onClick={() => toggleSelection(card)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
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
                      <div style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'monospace', color: isSelected ? 'var(--clr-primary-800)' : 'var(--txt-heading)' }}>
                        {card.card_code}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '4px' }}>
                        {card.business_data?.business_name || 'بدون اسم نشاط'}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} style={{ color: 'var(--clr-primary-500)' }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--bdr-light)', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: 'var(--bg-subtle)' }}>
          <button type="button" onClick={onClose} className="btn-outline" style={{ padding: '8px 18px', borderRadius: '10px' }}>
            إلغاء
          </button>
          <button type="button" onClick={handleConfirm} className="btn-primary" style={{ padding: '8px 22px', borderRadius: '10px' }}>
            تأكيد الاختيار
          </button>
        </div>
      </div>
    </div>
  );
};
