import React, { useState } from 'react';
import { cardsApi } from '../../services';
import { ApiCard } from '../../types';
import { Lock, AlertTriangle, RefreshCw, X, Trash2 } from 'lucide-react';

interface BulkDeleteCardsModalProps {
  cards: ApiCard[];
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BulkDeleteCardsModal: React.FC<BulkDeleteCardsModalProps> = ({
  cards,
  onClose,
  onSuccess,
  onToast,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignedCount = cards.filter((c) => !!c.customer_id).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('يرجى إدخال كلمة مرور الأدمن لتأكيد الحذف.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Execute deletion for all selected cards
      const results = await Promise.allSettled(
        cards.map((c) => cardsApi.deleteCard(c._id, password.trim()))
      );

      let successCount = 0;
      let unauthorized = false;
      let assignedBlockedCount = 0;
      let otherFailures = 0;

      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          successCount++;
        } else {
          const err = res.reason;
          if (err?.statusCode === 401) {
            unauthorized = true;
          } else if (err?.statusCode === 400) {
            assignedBlockedCount++;
          } else {
            otherFailures++;
          }
        }
      });

      if (unauthorized) {
        setError('كلمة مرور الأدمن غير صحيحة، تم إلغاء عملية الحذف للحماية.');
        return;
      }

      if (successCount === 0 && assignedBlockedCount > 0) {
        setError(
          `تعذر حذف البطاقات المحددة (${assignedBlockedCount}) لأنها مربوطة بعملاء. يرجى فك ارتباطها أولاً.`
        );
        return;
      }

      if (successCount > 0) {
        if (assignedBlockedCount > 0 || otherFailures > 0) {
          onToast(
            `تم نقل ${successCount} بطاقة إلى سلة المهملات، وتعذر حذف ${assignedBlockedCount + otherFailures} بطاقة (مربوطة بعملاء).`,
            'info'
          );
        } else {
          onToast(
            `تم نقل ${successCount} بطاقة إلى سلة المهملات بنجاح. يمكنك استرجاعها في أي وقت.`,
            'success'
          );
        }
        onSuccess();
        onClose();
      } else {
        setError('فشل حذف البطاقات المحددة. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      if (err?.statusCode === 401) {
        setError('كلمة مرور الأدمن غير صحيحة، تم إلغاء عملية الحذف للحماية.');
      } else {
        setError(err?.message || 'فشل تنفيذ عملية الحذف.');
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
          maxWidth: '480px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalIn 220ms var(--ease-out) both',
          fontFamily: 'var(--font)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
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
                border: '1px solid var(--clr-error-bdr)',
              }}
            >
              <Trash2 size={22} />
            </div>
            <div>
              <h3
                style={{
                  margin: '0 0 4px',
                  fontSize: '17px',
                  fontWeight: 800,
                  color: 'var(--txt-heading)',
                }}
              >
                تأكيد حذف {cards.length} بطاقة (نقل للمهملات)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt-muted)' }}>
                حماية البيانات من الحذف غير المقصود
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

        <div style={{ marginBottom: '16px' }}>
          <p
            style={{
              fontSize: '13.5px',
              color: 'var(--txt-secondary)',
              margin: '0 0 10px',
              lineHeight: 1.6,
            }}
          >
            أنت على وشك نقل <strong>{cards.length} بطاقة</strong> إلى سلة المهملات.
            يمكنك استرجاعها في أي وقت من زر سلة المهملات.
          </p>

          {/* Cards codes preview */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              maxHeight: '80px',
              overflowY: 'auto',
              padding: '8px 10px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '10px',
              border: '1px solid var(--bdr-light)',
            }}
          >
            {cards.slice(0, 8).map((c) => (
              <span
                key={c._id}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  border: '1px solid var(--bdr-light)',
                  color: 'var(--txt-heading)',
                }}
              >
                {c.card_code}
              </span>
            ))}
            {cards.length > 8 && (
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--clr-primary-50)',
                  color: 'var(--clr-primary-700)',
                }}
              >
                +{cards.length - 8} أخرى
              </span>
            )}
          </div>

          {assignedCount > 0 && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--clr-warning-bg)',
                border: '1px solid var(--clr-warning-bdr)',
                color: 'var(--clr-warning)',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>
                تنبيه: {assignedCount} بطاقة مربوطة بعملاء، سيمنع النظام حذفها قبل فك الارتباط.
              </span>
            </div>
          )}
        </div>

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
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--txt-body)',
                marginBottom: '6px',
              }}
            >
              كلمة مرور الأدمن لتأكيد العملية <span style={{ color: 'var(--clr-error)' }}>*</span>
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
                placeholder="أدخل كلمة مرور الأدمن الحالية"
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
                padding: '9px 22px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--clr-error)',
                color: '#fff',
                cursor: loading || !password.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '13.5px',
                opacity: loading || !password.trim() ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="spin" /> جاري التحقق والحذف...
                </>
              ) : (
                <>
                  <Trash2 size={15} /> تأكيد نقل {cards.length} بطاقة
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
