import React from 'react';
import { Menu, Store, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface MerchantHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

export const MerchantHeader: React.FC<MerchantHeaderProps> = ({ title, onOpenMobileMenu }) => {
  const { admin, logout } = useAuth();
  const storeTitle = admin?.store_name || admin?.name || 'متجري الذكي';

  return (
    <header className="merchant-header" dir="rtl" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--bdr-light)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Start: mobile menu + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="hdr-icon-btn hdr-hamburger"
          aria-label="القائمة"
          style={{ display: 'none' }}
        >
          <Menu size={20} />
        </button>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600 }}>
            مرحباً بك في بوابة التاجر 👋
          </div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--txt-heading)' }}>
            {title}
          </h1>
        </div>
      </div>

      {/* End: Store badge + Profile + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
        }}>
          <Store size={15} style={{ color: '#1d4ed8' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8' }}>
            {storeTitle}
          </span>
        </div>

        <Link
          to="/merchant/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--txt-secondary)',
            border: '1px solid var(--bdr-light)',
            textDecoration: 'none',
          }}
          title="الملف الشخصي وإعدادات الحساب"
        >
          <User size={18} />
        </Link>

        <button
          type="button"
          onClick={logout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--clr-error-bg)',
            color: 'var(--clr-error)',
            border: '1px solid var(--clr-error-bdr)',
            cursor: 'pointer',
          }}
          title="تسجيل الخروج"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
};
