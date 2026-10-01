import React from 'react';
import { Menu, Search, Bell, LogOut, User } from 'lucide-react';
import { LanguageSwitcher, Button } from '../ui';
import { useAuth } from '../../context/AuthContext';

export interface AdminHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onOpenMobileMenu, onOpenCommandPalette }) => {
  const { admin, logout } = useAuth();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 80,
      }}
    >
      {/* Title & Mobile Drawer Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open admin menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#0f172a',
            padding: '4px',
          }}
          className="admin-mobile-menu-trigger"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
            {title}
          </h1>
          <span style={{ backgroundColor: '#eff6ff', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
            لوحة الإدارة الفائقة
          </span>
        </div>
      </div>

      {/* Quick Search & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick Search Pill */}
        <div
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '0.8125rem',
            color: '#64748b',
            cursor: 'pointer',
            minWidth: '220px',
            transition: 'all 150ms ease-out',
          }}
        >
          <Search size={15} style={{ color: '#6366f1' }} />
          <span>بحث سريع بالأوامر...</span>
          <span style={{ marginInlineStart: 'auto', backgroundColor: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
            ⌘K
          </span>
        </div>

        {/* Notifications Icon */}
        <button
          type="button"
          style={{
            position: 'relative',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="الإشعارات"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid #ffffff',
            }}
          />
        </button>

        {/* Admin Profile Pill & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '10px' }}>
          <User size={15} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
            {admin?.username || 'admin'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="تسجيل الخروج"
            style={{ padding: '4px', minWidth: 'auto', color: '#ef4444' }}
          >
            <LogOut size={16} />
          </Button>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher variant="outline" size="sm" />
      </div>
    </header>
  );
};
