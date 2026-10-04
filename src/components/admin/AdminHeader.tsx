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
        height: '58px',
        backgroundColor: 'var(--bg-white)',
        borderBottom: '1px solid var(--bdr-light)',
        padding: '0 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 80,
        gap: '12px',
        boxShadow: 'var(--shadow-xs)',
      }}>

        {/* Right side: hamburger + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="admin-hamburger"
            aria-label="القائمة"
            style={{
              display: 'none',
              width: '34px', height: '34px',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--bdr-light)',
              backgroundColor: 'var(--bg-subtle)',
              cursor: 'pointer',
              color: 'var(--txt-secondary)',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Menu size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <h1 style={{
              fontSize: 'var(--fs-base)',
              fontWeight: 700,
              color: 'var(--txt-heading)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}>
              {title}
            </h1>
            <span className="admin-header-badge" style={{
              padding: '2px 9px',
              borderRadius: 'var(--r-full)',
              fontSize: 'var(--fs-xs)',
              fontWeight: 700,
              backgroundColor: 'var(--clr-primary-50)',
              color: 'var(--clr-primary-700)',
              border: '1px solid var(--clr-primary-200)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              الإدارة
            </span>
          </div>
        </div>

        {/* Left side: user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* User pill */}
          <div className="admin-user-pill" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '6px 12px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--bdr-light)',
            backgroundColor: 'var(--bg-subtle)',
          }}>
            <div style={{
              width: '26px', height: '26px',
              borderRadius: '50%',
              backgroundColor: 'var(--clr-primary-100)',
              color: 'var(--clr-primary-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={14} />
            </div>
            <span style={{
              fontSize: 'var(--fs-sm)',
              fontWeight: 600,
              color: 'var(--txt-body)',
            }}>
              {admin?.username || 'admin'}
            </span>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            title="تسجيل الخروج"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '34px', height: '34px',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--clr-error-bdr)',
              backgroundColor: 'var(--clr-error-bg)',
              color: 'var(--clr-error)',
              cursor: 'pointer',
              transition: 'all 150ms var(--ease)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--clr-error-bg)';
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <style>{`
        @media (max-width: 992px) {
          .admin-hamburger { display: flex !important; }
        }
        @media (max-width: 560px) {
          .admin-user-pill    { display: none !important; }
          .admin-header-badge { display: none !important; }
        }
      `}</style>
    </>
  );
};
