import React, { useState } from 'react';
import { Modal, Input, Button, Select } from '../ui';
import { cardService } from '../../services';
import { CardItem, CardProductType } from '../../types';
import { useTranslation } from '../../i18n';
import { Layers, CheckCircle2 } from 'lucide-react';

export interface BatchGenerateCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (generatedCards: CardItem[]) => void;
}

export const BatchGenerateCardsModal: React.FC<BatchGenerateCardsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<string>('10');
  const [cardType, setCardType] = useState<CardProductType>('GOOGLE_REVIEW');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdCount, setCreatedCount] = useState<number | null>(null);

  const numVal = parseInt(quantity, 10);
  const isValidNum = !isNaN(numVal) && numVal >= 1 && numVal <= 500 && String(numVal) === quantity.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidNum) {
      setError(t('cards.batchModal.countHelper'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await cardService.generateCardBatch(numVal, cardType);
      setCreatedCount(numVal);
      onSuccess(result.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setQuantity('10');
    setError(null);
    setCreatedCount(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={createdCount ? t('common.success') : t('cards.batchModal.title')}
      maxWidth="480px"
    >
      {createdCount ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xl)', textAlign: 'center' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--success-text)' }} />

          <div>
            <h3 className="text-title" style={{ fontSize: '1.25rem' }}>
              {t('cards.batchModal.toastSuccess', { count: createdCount })}
            </h3>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
              {t('cards.batchModal.summaryBody', { count: createdCount })}
            </p>
          </div>

          <Button variant="primary" fullWidth onClick={handleResetAndClose}>
            {t('common.close')}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <Select
            label="نوع الكارت / المنتج (Product Category)"
            value={cardType}
            onChange={(e) => setCardType(e.target.value as CardProductType)}
            options={[
              { value: 'GOOGLE_REVIEW', label: '🌟 بطاقة تقييمات جوجل (Google Review Card)' },
              { value: 'INSTAPAY', label: '💳 بطاقة إنستا باي (InstaPay Card)' },
              { value: 'UNIFIED_SOCIAL', label: '🌐 بطاقة السوشيال الموحدة (Unified Social Card)' },
            ]}
          />

          <Input
            label={`${t('cards.batchModal.countLabel')} *`}
            type="number"
            min={1}
            max={500}
            step={1}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError(null);
            }}
            error={error || undefined}
            helperText={t('cards.batchModal.countHelper')}
            required
          />

          {/* Dynamic Summary Preview Box */}
          {isValidNum && (
            <div
              style={{
                padding: 'var(--space-md)',
                backgroundColor: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-xs)',
              }}
            >
              <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
                {t('cards.batchModal.summaryTitle')}
              </span>
              <span className="text-body-medium">
                {t('cards.batchModal.summaryBody', { count: numVal })}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <Button type="button" variant="secondary" onClick={handleResetAndClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!isValidNum}>
              <Layers size={16} /> {t('cards.batchModal.submit')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
