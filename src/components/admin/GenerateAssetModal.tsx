import React, { useState } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { adminService, qrService } from '../../services';
import { AssetType, UnifiedAsset } from '../../types';
import { useTranslation } from '../../i18n';
import { QrCode, Cpu, CheckCircle2, Download } from 'lucide-react';

export interface GenerateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (asset: UnifiedAsset) => void;
}

export const GenerateAssetModal: React.FC<GenerateAssetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [assetType, setAssetType] = useState<AssetType>('QR');
  const [label, setLabel] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdAsset, setCreatedAsset] = useState<UnifiedAsset | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    try {
      if (assetType === 'NFC') {
        const nfcTag = await adminService.provisionNewNFC(label.trim());
        const asset: UnifiedAsset = {
          id: nfcTag.id,
          type: 'NFC',
          public_code: nfcTag.public_code,
          label: nfcTag.label,
          status: 'UNASSIGNED',
          created_at: nfcTag.created_at,
        };
        setCreatedAsset(asset);
        onSuccess(asset);
      } else {
        const qr = await qrService.createQRCode({
          business_id: '',
          label: label.trim(),
        });
        const asset: UnifiedAsset = {
          id: qr.id,
          type: 'QR',
          public_code: qr.public_code,
          label: qr.label,
          status: 'UNASSIGNED',
          created_at: qr.created_at,
        };
        setCreatedAsset(asset);
        onSuccess(asset);
      }
    } catch (err) {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAssetType('QR');
    setLabel('');
    setCreatedAsset(null);
    onClose();
  };

  const downloadPNG = (publicCode: string) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#ffffff"/>
      <rect x="30" y="30" width="80" height="80" fill="#18181b"/>
      <rect x="50" y="50" width="40" height="40" fill="#ffffff"/>
      <rect x="190" y="30" width="80" height="80" fill="#18181b"/>
      <rect x="210" y="50" width="40" height="40" fill="#ffffff"/>
      <rect x="30" y="190" width="80" height="80" fill="#18181b"/>
      <rect x="50" y="210" width="40" height="40" fill="#ffffff"/>
      <text x="150" y="280" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#18181b">${publicCode}</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASSET-${publicCode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdAsset ? `${t('common.success')}!` : t('modals.generateAsset.title')}
      maxWidth="480px"
    >
      {createdAsset ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xl)', textAlign: 'center' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--success-text)' }} />

          {createdAsset.type === 'QR' ? (
            <div
              style={{
                padding: 'var(--space-md)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <svg width="140" height="140" viewBox="0 0 200 200" fill="none">
                <rect width="200" height="200" fill="#FFFFFF" />
                <rect x="20" y="20" width="50" height="50" fill="#18181B" />
                <rect x="32" y="32" width="26" height="26" fill="#FFFFFF" />
                <rect x="130" y="20" width="50" height="50" fill="#18181B" />
                <rect x="142" y="32" width="26" height="26" fill="#FFFFFF" />
                <rect x="20" y="130" width="50" height="50" fill="#18181B" />
                <rect x="32" y="142" width="26" height="26" fill="#FFFFFF" />
              </svg>
            </div>
          ) : (
            <div
              style={{
                padding: 'var(--space-xl)',
                backgroundColor: 'var(--warning-bg)',
                borderRadius: 'var(--radius-xl)',
                color: 'var(--warning-text)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-sm)',
              }}
            >
              <Cpu size={36} />
              <span className="text-body-medium">{t('common.nfcTag')}</span>
            </div>
          )}

          <div>
            <h4 className="text-section">{createdAsset.label}</h4>
            <span className="text-caption">Code: <strong>{createdAsset.public_code}</strong></span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', width: '100%' }}>
            {createdAsset.type === 'QR' && (
              <Button variant="outline" fullWidth onClick={() => downloadPNG(createdAsset.public_code)}>
                <Download size={16} /> {t('common.download')}
              </Button>
            )}
            <Button variant="primary" fullWidth onClick={handleClose}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <Select
            label={`${t('modals.generateAsset.type')} *`}
            value={assetType}
            onChange={(e) => setAssetType(e.target.value as AssetType)}
            options={[
              { value: 'QR', label: t('common.qrTag') },
              { value: 'NFC', label: t('common.nfcTag') },
            ]}
          />

          <Input
            label={`${t('modals.generateAsset.label')} *`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={assetType === 'QR' ? 'e.g. Counter Acrylic Stand #104' : 'e.g. NTAG213 Door Decal Chip'}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <Button type="button" variant="secondary" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {assetType === 'QR' ? <QrCode size={16} /> : <Cpu size={16} />} {t('modals.generateAsset.submit')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
