import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AdminHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onOpenMobileMenu }) => {
  const { admin, logout } = useAuth();

  return (
    <>
      <header style={{
        height: '60px',
        backgroundColor: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 80, gap: '12px',
        fontFamily: 'Cairo, sans-serif',
      }}>
        {/* Left: hamburger + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="فتح القائمة"
            className="admin-hamburger"
            style={{
              display: 'none', background: '#f1f5f9', border: 'none',
              cursor: 'pointer', color: '#0f172a', padding: '8px',
              borderRadius: '9px', flexShrink: 0,
            }}
          >
            <Menu size={20} />
          </button>

          <h1 style={{
            fontSize: '1.0625rem', fontWeight: 800, color: '#0f172a',
            letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', margin: 0,
          }}>
            {title}
          </h1>
          <span className="admin-header-badge" style={{
            backgroundColor: '#eff6ff', color: '#3b82f6',
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px',
            borderRadius: '9999px', border: '1px solid #bfdbfe',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            لوحة الإدارة
          </span>
        </div>

        {/* Right: user pill + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div className="admin-user-pill" style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '10px',
          }}>
            <User size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
              {admin?.username || 'admin'}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            title="تسجيل الخروج"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff0f0', border: '1px solid #fecaca',
              borderRadius: '9px', padding: '8px', cursor: 'pointer',
              color: '#ef4444', transition: 'background 150ms',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fff0f0')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <style>{`
        @media (max-width: 992px) {
          .admin-hamburger { display: flex !important; }
        }
        @media (max-width: 580px) {
          .admin-user-pill    { display: none !important; }
          .admin-header-badge { display: none !important; }
        }
      `}</style>
    </>
  );
};
