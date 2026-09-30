import React, { useState } from 'react';
import { Modal, Input, Button } from '../ui';
import { qrService } from '../../services';
import { QRCode } from '../../types';
import { QrCode as QrIcon, Download, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface CreateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess: (newQR: QRCode) => void;
}

export const CreateQRModal: React.FC<CreateQRModalProps> = ({
  isOpen,
  onClose,
  businessId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [label, setLabel] = useState<string>('');
  const [placement, setPlacement] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdQR, setCreatedQR] = useState<QRCode | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    try {
      const newQR = await qrService.createQRCode({
        business_id: businessId,
        label: label.trim(),
        placement: placement.trim(),
      });
      setCreatedQR(newQR);
      onSuccess(newQR);
    } catch (err) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setLabel('');
    setPlacement('');
    setCreatedQR(null);
    onClose();
  };

  const downloadPNG = (publicCode: string) => {
    // Generate simple SVG data URL for PNG download trigger
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#ffffff"/>
      <rect x="30" y="30" width="80" height="80" fill="#18181b"/>
      <rect x="50" y="50" width="40" height="40" fill="#ffffff"/>
      <rect x="190" y="30" width="80" height="80" fill="#18181b"/>
      <rect x="210" y="50" width="40" height="40" fill="#ffffff"/>
      <rect x="30" y="190" width="80" height="80" fill="#18181b"/>
      <rect x="50" y="210" width="40" height="40" fill="#ffffff"/>
      <rect x="140" y="140" width="20" height="20" fill="#18181b"/>
      <rect x="180" y="180" width="40" height="40" fill="#18181b"/>
      <rect x="140" y="200" width="30" height="30" fill="#18181b"/>
      <text x="150" y="280" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#18181b">${publicCode}</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${publicCode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={createdQR ? t('common.success') : t('dashboard.qrCodes.createQR')}
      maxWidth="480px"
    >
      {createdQR ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xl)', textAlign: 'center' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--success-text)' }} />

          {/* QR Code SVG Visual Spec */}
          <div
            style={{
              padding: 'var(--space-md)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <svg width="160" height="160" viewBox="0 0 200 200" fill="none">
              <rect width="200" height="200" fill="#FFFFFF" />
              <rect x="20" y="20" width="50" height="50" fill="#18181B" />
              <rect x="32" y="32" width="26" height="26" fill="#FFFFFF" />
              <rect x="130" y="20" width="50" height="50" fill="#18181B" />
              <rect x="142" y="32" width="26" height="26" fill="#FFFFFF" />
              <rect x="20" y="130" width="50" height="50" fill="#18181B" />
              <rect x="32" y="142" width="26" height="26" fill="#FFFFFF" />
              <rect x="90" y="90" width="20" height="20" fill="#18181B" />
              <rect x="120" y="120" width="30" height="30" fill="#18181B" />
              <rect x="90" y="140" width="20" height="20" fill="#18181B" />
            </svg>
          </div>

          <div>
            <h4 className="text-section">{createdQR.label}</h4>
            <span className="text-caption">{t('dashboard.qrCodes.publicCode')}: <strong>{createdQR.public_code}</strong></span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', width: '100%' }}>
            <Button
              variant="outline"
              fullWidth
              onClick={() => downloadPNG(createdQR.public_code)}
            >
              <Download size={16} /> {t('common.download')}
            </Button>
            <Button variant="primary" fullWidth onClick={handleResetAndClose}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <Input
            label={`${t('dashboard.qrCodes.placement')} *`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t('dashboard.qrCodes.labelPlaceholder')}
            required
          />

          <Input
            label={t('dashboard.qrCodes.placement')}
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            placeholder="e.g. Next to payment register"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <Button type="button" variant="secondary" onClick={handleResetAndClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              <QrIcon size={16} /> {t('dashboard.qrCodes.createQR')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
