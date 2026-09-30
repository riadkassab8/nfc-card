import React from 'react';
import { Menu, ExternalLink, Store } from 'lucide-react';
import { Button, LanguageSwitcher } from '../ui';
import { Business } from '../../types';
import { useTranslation } from '../../i18n';

export interface DashboardHeaderProps {
  title: string;
  business: Business | null;
  onOpenMobileMenu: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  business,
  onOpenMobileMenu,
}) => {
  const { t } = useTranslation();

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 var(--space-2xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: Mobile Drawer Trigger & Screen Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            padding: 'var(--space-xs)',
          }}
          className="mobile-menu-trigger"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-section" style={{ fontSize: '1.125rem' }}>
          {title}
        </h1>
      </div>

      {/* Right: Business Quick Public Preview Link & Language Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {business && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-label)',
              fontWeight: 500,
            }}
          >
            <Store size={16} />
            <span className="business-name-preview">{business.name}</span>
          </div>
        )}

        {business && (
          <a
            href="/q/7FJ2K9"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="outline" size="sm">
              <ExternalLink size={14} /> {t('common.publicView')}
            </Button>
          </a>
        )}

        <LanguageSwitcher variant="outline" size="sm" />
      </div>
    </header>
  );
};
