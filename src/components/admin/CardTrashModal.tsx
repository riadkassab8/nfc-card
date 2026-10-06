import React, { useState, useEffect } from 'react';
import { cardsApi } from '../../services';
import { ApiTrashCard, fmtDate } from '../../types';
import {
  Trash2, RotateCcw, RefreshCw, X, AlertCircle, Check, CreditCard,
} from 'lucide-react';

interface CardTrashModalProps {
  onClose: () => void;
  onCardRestored: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CardTrashModal: React.FC<CardTrashModalProps> = ({
  onClose,
  onCardRestored,
  onToast,
}) => {
  const [trashList, setTrashList] = useState<ApiTrashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTrash = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cardsApi.getTrash();
      const items = Array.isArray(res) ? res : res?.data || [];
      setTrashList(items);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل سلة مهملات الكروت');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (card: ApiTrashCard) => {
    setRestoringId(card._id);
    try {
      const res = await cardsApi.restoreCard(card._id);
      const msg = res.message || `تم استرجاع الكارت "${card.card_code}" من سلة المهملات بنجاح!`;
      onToast(msg, 'success');
      onCardRestored();
      setTrashList((prev) => prev.filter((c) => c._id !== card._id));
    } catch (err: any) {
      onToast(err?.message || 'فشل استرجاع الكارت', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="modal-panel"
        dir="rtl"
        style={{
          maxWidth: '680px',
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
            padding: '18px 24px',
            borderBottom: '1px solid var(--bdr-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--clr-error-bg)',
                color: 'var(--clr-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: 'var(--fs-md)', fontWeight: 800, margin: 0 }}>
                سلة مهملات البطاقات (Cards Trash)
              </h2>
              <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--txt-muted)' }}>
                البطاقات المنقولة للمهملات مع إمكانية استرجاعها فوراً للعمل
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

        {/* Body */}
        <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--txt-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              <span>جاري تحميل البطاقات المحذوفة...</span>
            </div>
          ) : trashList.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  color: 'var(--clr-success)',
                }}
              >
                <Check size={28} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--txt-heading)' }}>
                سلة مهملات البطاقات فارغة!
              </p>
              <p style={{ fontSize: '13px', margin: 0, color: 'var(--txt-muted)' }}>
                لا توجد أي بطاقات محذوفة في سلة المهملات حالياً.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12.5px', color: 'var(--txt-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} style={{ color: 'var(--clr-primary-500)' }} />
                <span>
                  يوجد <strong>{trashList.length}</strong> بطاقات في سلة المهملات
                </span>
              </div>

              <div
                style={{
                  border: '1px solid var(--bdr-light)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                }}
              >
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--bdr-light)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 800 }}>كود البطاقة</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 800 }}>نوع الكارت</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 800 }}>تاريخ الحذف</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 800 }}>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashList.map((c) => {
                      const deletedAt = c.deleted_at || c.deletedAt || c.updatedAt;
                      const isRestoring = restoringId === c._id;

                      return (
                        <tr
                          key={c._id}
                          style={{
                            borderBottom: '1px solid var(--bdr-light)',
                            transition: 'background-color 150ms ease',
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 800, fontSize: '13.5px', fontFamily: 'monospace', color: 'var(--txt-heading)' }}>
                              {c.card_code}
                            </div>
                            {c.custom_slug && (
                              <div style={{ fontSize: '11.5px', color: 'var(--clr-primary-700)', fontFamily: 'monospace' }}>
                                /{c.custom_slug}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--bg-subtle)',
                                color: 'var(--txt-secondary)',
                                border: '1px solid var(--bdr-light)',
                              }}
                            >
                              {c.card_type}
                            </span>
                          </td>

                          <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--clr-error)' }}>
                            {deletedAt ? fmtDate(deletedAt) : 'محذوف'}
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleRestore(c)}
                              disabled={isRestoring}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--clr-success-bdr)',
                                backgroundColor: 'var(--clr-success-bg)',
                                color: 'var(--clr-success)',
                                cursor: isRestoring ? 'not-allowed' : 'pointer',
                                fontSize: '12.5px',
                                fontWeight: 800,
                                fontFamily: 'var(--font)',
                                transition: 'all 0.15s ease',
                              }}
                              title="استرجاع البطاقة للعمل"
                            >
                              {isRestoring ? (
                                <>
                                  <RefreshCw size={13} className="spin" /> جاري الاسترجاع...
                                </>
                              ) : (
                                <>
                                  <RotateCcw size={13} /> استرجاع
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--bdr-light)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <button onClick={onClose} className="btn-outline" style={{ padding: '8px 20px', borderRadius: '10px' }}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
