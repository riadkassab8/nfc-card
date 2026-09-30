import React from 'react';
import { Drawer, Badge, Button } from '../ui';
import { QRCode } from '../../types';
import { Download, ExternalLink, PauseCircle, PlayCircle, Archive } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface QRDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  qr: QRCode | null;
  onToggleStatus: (qrId: string, currentStatus: string) => void;
  onArchive: (qrId: string) => void;
}

export const QRDetailsDrawer: React.FC<QRDetailsDrawerProps> = ({
  isOpen,
  onClose,
  qr,
  onToggleStatus,
  onArchive,
}) => {
  const { t, formatNumber } = useTranslation();
  if (!qr) return null;

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
    a.download = `QR-${publicCode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={t('dashboard.qrCodes.title')} width="400px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
        {/* QR Visual Canvas Spec */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div
            style={{
              padding: 'var(--space-md)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-subtle)',
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
              <rect x="90" y="90" width="20" height="20" fill="#18181B" />
              <rect x="120" y="120" width="30" height="30" fill="#18181B" />
            </svg>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 className="text-section">{qr.label}</h3>
            <span className="text-caption">{t('dashboard.qrCodes.publicCode')}: <strong>{qr.public_code}</strong></span>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-sm)' }}>
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('common.status')}</span>
            <Badge variant={qr.status === 'ACTIVE' ? 'active' : qr.status === 'DISABLED' ? 'disabled' : 'archived'}>
              {qr.status}
            </Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-sm)' }}>
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.qrCodes.placement')}</span>
            <span className="text-body">{qr.placement || '-'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-sm)' }}>
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.qrCodes.scansCount')}</span>
            <span className="text-body-medium">{formatNumber(qr.scans_count || 0)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-sm)' }}>
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>Target URL</span>
            <a
              href={`/q/${qr.public_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption"
              style={{ color: 'var(--text-primary)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              /q/{qr.public_code} <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <Button variant="outline" fullWidth onClick={() => downloadPNG(qr.public_code)}>
            <Download size={16} /> {t('common.download')}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => onToggleStatus(qr.id, qr.status)}
          >
            {qr.status === 'ACTIVE' ? (
              <>
                <PauseCircle size={16} /> Pause QR
              </>
            ) : (
              <>
                <PlayCircle size={16} /> Activate QR
              </>
            )}
          </Button>

          <Button
            variant="danger"
            fullWidth
            onClick={() => onArchive(qr.id)}
          >
            <Archive size={16} /> Archive QR Code
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
