import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  BarChart2,
  Store,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface MerchantSidebarProps {
  onLinkClick?: () => void;
  onClose?: () => void;
}

export const MerchantSidebar: React.FC<MerchantSidebarProps> = ({
  onLinkClick,
  onClose,
}) => {
  const { admin, logout } = useAuth();
  const storeTitle = admin?.store_name || admin?.name || 'متجري الذكي';

  const navLinks = [
    { to: '/merchant', label: 'الرئيسية للمتجر', icon: LayoutDashboard, end: true },
    { to: '/merchant/cards', label: 'بطاقاتي الذكية', icon: CreditCard, end: false },
    { to: '/merchant/analytics', label: 'إحصائيات وزوار المحل', icon: BarChart2, end: false },
    { to: '/merchant/profile', label: 'إعدادات المتجر', icon: Store, end: false },
  ];

  return (
    <aside className="merchant-sidebar" dir="rtl" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid var(--bdr-light)',
      padding: '20px 14px',
      boxSizing: 'border-box',
    }}>
      {/* Brand / Store Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--bdr-light)',
        marginBottom: '18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          }}>
            <Store size={22} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--txt-heading)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {storeTitle}
            </h2>
            <span style={{
              fontSize: '11.5px',
              color: '#2563eb',
              fontWeight: 700,
              backgroundColor: '#eff6ff',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'inline-block',
              marginTop: '2px',
            }}>
              بوابة التاجر المعتمد
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--txt-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onLinkClick}
              className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 700,
                textDecoration: 'none',
                color: 'var(--txt-body)',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid var(--bdr-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{
          padding: '10px 12px',
          borderRadius: '10px',
          backgroundColor: 'var(--bg-subtle)',
          fontSize: '11.5px',
          color: 'var(--txt-muted)',
          lineHeight: 1.5,
        }}>
          💡 للتواصل مع الدعم الفني أو تجديد اشتراك متجرك، يرجى مراجعة إدارة المنصة.
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid var(--clr-error-bdr)',
            backgroundColor: 'var(--clr-error-bg)',
            color: 'var(--clr-error)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};
