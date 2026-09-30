import React from 'react';
import { Drawer, Badge, Button } from '../ui';
import { Business } from '../../types';
import { Building2, MapPin, Phone, MessageCircle, Globe, PauseCircle, PlayCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface AdminBusinessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  onToggleStatus: (bizId: string, currentStatus: string) => void;
}

export const AdminBusinessDrawer: React.FC<AdminBusinessDrawerProps> = ({
  isOpen,
  onClose,
  business,
  onToggleStatus,
}) => {
  const { t } = useTranslation();
  if (!business) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={t('modals.bizDrawer.title')} width="420px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
        {/* Business Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Building2 size={24} style={{ color: 'var(--text-primary)' }} />
          </div>
          <div>
            <h3 className="text-section">{business.name}</h3>
            <Badge variant={business.status === 'ACTIVE' ? 'active' : 'disabled'}>
              {business.status}
            </Badge>
          </div>
        </div>

        {/* Contact Info List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {business.description && (
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {business.description}
            </p>
          )}

          {business.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-body">{business.address}</span>
            </div>
          )}

          {business.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-body">{business.phone}</span>
            </div>
          )}

          {business.whatsapp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <MessageCircle size={16} style={{ color: 'var(--success-text)' }} />
              <span className="text-body">WhatsApp: {business.whatsapp}</span>
            </div>
          )}

          {business.website_url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
              <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="text-body" style={{ color: 'var(--text-primary)' }}>
                {business.website_url}
              </a>
            </div>
          )}
        </div>

        {/* Status Toggle Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'auto' }}>
          <Button
            variant={business.status === 'ACTIVE' ? 'danger' : 'primary'}
            fullWidth
            onClick={() => onToggleStatus(business.id, business.status)}
          >
            {business.status === 'ACTIVE' ? (
              <>
                <PauseCircle size={16} /> {t('admin.businesses.disable')}
              </>
            ) : (
              <>
                <PlayCircle size={16} /> {t('admin.businesses.activate')}
              </>
            )}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
