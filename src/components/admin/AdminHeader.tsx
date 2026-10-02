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
    <>
      <header
        style={{
          height: '60px',
          backgroundColor: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 80,
          gap: '12px',
        }}
      >
        {/* Left: hamburger + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open admin menu"
            className="admin-mobile-menu-trigger"
            style={{
              display: 'none',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#0f172a',
              padding: '7px',
              borderRadius: '9px',
              flexShrink: 0,
            }}
          >
            <Menu size={20} />
          </button>

          <div className="admin-header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <h1 style={{
              fontSize: '1.125rem', fontWeight: 800, color: '#0f172a',
              letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              fontFamily: 'Cairo, sans-serif',
            }}>
              {title}
            </h1>
            <span className="admin-header-badge" style={{
              backgroundColor: '#eff6ff', color: '#3b82f6',
              fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: '9999px', border: '1px solid #bfdbfe',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              لوحة الإدارة
            </span>
          </div>
        </div>

        {/* Right: search + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Search — hidden on small mobile */}
          <div
            className="admin-search-bar"
            onClick={onOpenCommandPalette}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '10px', padding: '6px 12px',
              fontSize: '0.8125rem', color: '#64748b',
              cursor: 'pointer', minWidth: '180px',
              transition: 'all 150ms ease',
            }}
          >
            <Search size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>بحث سريع...</span>
            <span style={{
              marginInlineStart: 'auto', backgroundColor: '#e2e8f0',
              padding: '1px 5px', borderRadius: '4px',
              fontSize: '0.68rem', fontWeight: 700, color: '#475569', flexShrink: 0,
            }}>⌘K</span>
          </div>

          {/* Search icon (mobile only) */}
          <button
            type="button"
            className="admin-search-icon"
            onClick={onOpenCommandPalette}
            style={{
              display: 'none',
              background: '#f1f5f9', border: 'none', cursor: 'pointer',
              color: '#475569', padding: '7px', borderRadius: '9px',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Search size={18} />
          </button>

          {/* Bell */}
          <button
            type="button"
            style={{
              position: 'relative', background: '#f8fafc',
              border: '1px solid #e2e8f0', borderRadius: '9px',
              padding: '7px', cursor: 'pointer', color: '#475569',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="الإشعارات"
          >
            <Bell size={17} />
            <span style={{
              position: 'absolute', top: '5px', right: '5px',
              width: '7px', height: '7px',
              backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #fff',
            }} />
          </button>

          {/* Admin name — hidden on mobile */}
          <div
            className="admin-user-pill"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '9px',
            }}
          >
            <User size={14} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', fontFamily: 'Cairo, sans-serif' }}>
              {admin?.username || 'admin'}
            </span>
            <Button
              variant="ghost" size="sm"
              onClick={logout}
              title="تسجيل الخروج"
              style={{ padding: '3px', minWidth: 'auto', color: '#ef4444' }}
            >
              <LogOut size={15} />
            </Button>
          </div>

          {/* Logout icon only (mobile) */}
          <button
            type="button"
            className="admin-logout-icon"
            onClick={logout}
            style={{
              display: 'none',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#ef4444', padding: '6px',
              alignItems: 'center', justifyContent: 'center',
            }}
            title="تسجيل الخروج"
          >
            <LogOut size={18} />
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher variant="outline" size="sm" />
        </div>
      </header>

      <style>{`
        @media (max-width: 640px) {
          .admin-search-bar   { display: none !important; }
          .admin-search-icon  { display: flex !important; }
          .admin-user-pill    { display: none !important; }
          .admin-logout-icon  { display: flex !important; }
          .admin-header-badge { display: none !important; }
        }
      `}</style>
    </>
  );
};
