import React from 'react';
import { Drawer, Badge, Button } from '../ui';
import { CardItem } from '../../types';
import { Download, QrCode, Cpu, Building2, Calendar, Edit } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface CardDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardItem | null;
  onAssignRequest?: (card: CardItem) => void;
}

export const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({
  isOpen,
  onClose,
  card,
  onAssignRequest,
}) => {
  const { t } = useTranslation();
  if (!card) return null;

  const isActive = card.status === 'ACTIVE';
  const bizName = card.business_data?.name || card.business_name;

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
    a.download = `CARD-${publicCode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={t('cards.drawer.title')} width="440px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
        {/* Card Identity Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-lg)' }}>
          <div>
            <span className="text-caption" style={{ fontFamily: 'monospace' }}>ID: {card.id}</span>
            <h3 className="text-section" style={{ fontSize: '1.25rem' }}>{card.card_code}</h3>
            <span className="text-caption" style={{ fontFamily: 'monospace' }}>
              Public Code: <strong>{card.public_code}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>{isActive ? '🟢' : '🔴'}</span>
              <Badge variant={isActive ? 'active' : 'warning'}>
                {isActive ? t('cards.statusActive') : t('cards.statusInactive')}
              </Badge>
            </div>
            <Badge variant="neutral">
              <span>{
                {
                  GOOGLE_REVIEW: '🌟 Google Review',
                  INSTAPAY: '💳 InstaPay',
                  UNIFIED_SOCIAL: '🌐 السوشيال الموحدة',
                }[card.card_type || 'GOOGLE_REVIEW'] || '🌐 السوشيال الموحدة'
              }</span>
            </Badge>
          </div>
        </div>

        {/* Assigned Business Box */}
        <div
          style={{
            padding: 'var(--space-md)',
            backgroundColor: 'var(--bg-surface-hover)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
            <Building2 size={16} />
            <span className="text-label">{t('cards.drawer.assignedBiz')}</span>
          </div>
          <span className="text-body-medium" style={{ fontSize: '1rem' }}>
            {isActive && bizName ? bizName : t('cards.drawer.notAssigned')}
          </span>
          {card.updated_at && (
            <span className="text-caption" style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> {t('cards.drawer.assignedDate')}: {new Date(card.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Paired Assets Breakdown (1 QR + 1 NFC) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
            {t('cards.subtitle')}
          </span>

          {/* QR Asset Specs */}
          <div style={{ padding: 'var(--space-md)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{ padding: 'var(--space-xs)', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <QrCode size={28} style={{ color: 'var(--primary-bg)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-body-medium">{t('cards.drawer.qrHeader')}</span>
                <span className="text-caption" style={{ fontFamily: 'monospace' }}>ID: {card.qr.id}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadPNG(card.public_code)}>
              <Download size={14} />
            </Button>
          </div>

          {/* NFC Asset Specs */}
          <div style={{ padding: 'var(--space-md)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)' }}>
              <Cpu size={24} style={{ color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="text-body-medium">{t('cards.drawer.nfcHeader')}</span>
              <span className="text-caption" style={{ fontFamily: 'monospace' }}>Identifier: {card.nfc.identifier}</span>
            </div>
          </div>
        </div>

        {/* Created At Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)', marginTop: 'auto' }}>
          <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>{t('cards.drawer.createdDate')}</span>
          <span className="text-caption">{new Date(card.created_at).toLocaleString()}</span>
        </div>

        {onAssignRequest && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              onClose();
              onAssignRequest(card);
            }}
          >
            <Edit size={16} /> {t('cards.assignCard')}
          </Button>
        )}
      </div>
    </Drawer>
  );
};
