import React from 'react';
import { Menu } from 'lucide-react';
import { LanguageSwitcher } from '../ui';

export interface AdminHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onOpenMobileMenu }) => {
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
      {/* Title & Mobile Drawer Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open admin menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            padding: 'var(--space-xs)',
          }}
          className="admin-mobile-menu-trigger"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-section" style={{ fontSize: '1.125rem' }}>
          {title}
        </h1>
      </div>

      {/* Language Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <LanguageSwitcher variant="outline" size="sm" />
      </div>
    </header>
  );
};
