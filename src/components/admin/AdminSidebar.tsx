import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Scan, BarChart3, Settings, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface AdminSidebarProps {
  onLinkClick?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLinkClick }) => {
  const { t } = useTranslation();

  const adminSidebarItems = [
    { path: '/admin', label: t('admin.nav.overview'), icon: <LayoutDashboard size={18} /> },
    { path: '/admin/cards', label: t('admin.nav.cards'), icon: <CreditCard size={18} /> },
    { path: '/admin/scan', label: t('admin.nav.scan'), icon: <Scan size={18} /> },
    { path: '/admin/analytics', label: t('admin.nav.analytics'), icon: <BarChart3 size={18} /> },
    { path: '/admin/settings', label: t('admin.nav.settings'), icon: <Settings size={18} /> },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-surface)',
        borderInlineEnd: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 'var(--space-lg) var(--space-md)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-xs) var(--space-md)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error-text)',
            border: '1px solid var(--error-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldAlert size={18} />
        </div>
        <div>
          <span className="text-section" style={{ fontSize: '1rem', display: 'block' }}>
            DynamicQR
          </span>
          <span className="text-caption" style={{ color: 'var(--error-text)', fontWeight: 600 }}>
            {t('common.adminDashboard')}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', flex: 1 }}>
        {adminSidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onLinkClick}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: 'var(--space-md) var(--space-lg)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: 'var(--font-size-body)',
              fontWeight: isActive ? 600 : 500,
              backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderInlineStart: isActive ? '3px solid var(--primary-bg)' : '3px solid transparent',
              transition: 'all 150ms ease-out',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Workspace Footer */}
      <div
        style={{
          padding: 'var(--space-md)',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 'auto',
        }}
      >
        <span className="text-caption" style={{ color: 'var(--text-muted)' }}>
          {t('common.adminDashboard')}
        </span>
      </div>
    </aside>
  );
};
