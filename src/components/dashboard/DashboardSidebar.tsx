import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, QrCode, Settings } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface DashboardSidebarProps {
  onLinkClick?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onLinkClick }) => {
  const { t } = useTranslation();

  const sidebarItems = [
    { path: '/dashboard', label: t('dashboard.nav.overview'), icon: <LayoutDashboard size={18} /> },
    { path: '/dashboard/business', label: t('dashboard.nav.businessProfile'), icon: <Store size={18} /> },
    { path: '/dashboard/qr-codes', label: t('dashboard.nav.qrCodes'), icon: <QrCode size={18} /> },
    { path: '/dashboard/settings', label: t('dashboard.nav.settings'), icon: <Settings size={18} /> },
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
      {/* Sidebar Header Brand Logo */}
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
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--text-on-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <QrCode size={18} />
        </div>
        <span className="text-section" style={{ fontSize: '1rem' }}>
          DynamicQR
        </span>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', flex: 1 }}>
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={onLinkClick}
            className={({ isActive }) => (isActive ? 'active-nav-link' : 'nav-link')}
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

      {/* Workspace Footer Info */}
      <div
        style={{
          padding: 'var(--space-md)',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 'auto',
        }}
      >
        <p className="text-caption" style={{ color: 'var(--text-muted)' }}>
          {t('common.businessDashboard')}
        </p>
      </div>
    </aside>
  );
};
