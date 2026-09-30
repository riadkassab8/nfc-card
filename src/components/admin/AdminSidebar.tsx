import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Scan, BarChart3, Settings, Sparkles } from 'lucide-react';
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
        width: '260px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 'var(--space-xl) var(--space-md)',
        boxSizing: 'border-box',
        boxShadow: '4px 0 24px rgba(15, 23, 42, 0.12)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          padding: 'var(--space-xs) var(--space-md)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Sparkles size={22} />
        </div>
        <div>
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              display: 'block',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              fontFamily: 'var(--font-family-arabic)',
            }}
          >
            DynamicQR Pro
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
            {t('common.adminDashboard')}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <div style={{ padding: '0 12px 6px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          القائمة الرئيسية
        </div>
        {adminSidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onLinkClick}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: isActive ? '#ffffff' : '#94a3b8',
              borderInlineStart: isActive ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            })}
          >
            <span style={{ display: 'inline-flex', opacity: 0.9 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Workspace Footer Card */}
      <div
        style={{
          padding: '14px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>النظام يعمل بنجاح</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
          إصدار المنصة: 2.5.0 HD
        </span>
      </div>
    </aside>
  );
};
