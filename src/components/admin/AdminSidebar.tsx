import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Tags, Scan, Zap } from 'lucide-react';

export interface AdminSidebarProps {
  onLinkClick?: () => void;
}

const NAV = [
  { path: '/admin',            label: 'نظرة عامة',      icon: LayoutDashboard, exact: true },
  { path: '/admin/cards',      label: 'إدارة البطاقات',  icon: CreditCard },
  { path: '/admin/categories', label: 'التصنيفات',       icon: Tags },
  { path: '/admin/scan',       label: 'فحص وتجهيز',      icon: Scan },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLinkClick }) => (
  <aside style={{
    width: '248px',
    height: '100%',
    backgroundColor: 'var(--bg-white)',
    borderInlineStart: '1px solid var(--bdr-light)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
  }}>

    {/* Brand */}
    <div style={{
      padding: '20px 18px 16px',
      borderBottom: '1px solid var(--bdr-light)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{
        width: '38px', height: '38px',
        borderRadius: 'var(--r-lg)',
        backgroundColor: 'var(--clr-primary-500)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'var(--shadow-blue)',
      }}>
        <Zap size={20} color="#fff" />
      </div>
      <div>
        <div style={{
          fontSize: 'var(--fs-base)',
          fontWeight: 800,
          color: 'var(--txt-heading)',
          lineHeight: 1.2,
        }}>
          NFC Smart
        </div>
        <div style={{
          fontSize: 'var(--fs-xs)',
          color: 'var(--txt-muted)',
          fontWeight: 500,
          marginTop: '1px',
        }}>
          لوحة الإدارة
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{
      flex: 1,
      padding: '12px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      overflowY: 'auto',
    }}>
      <div style={{
        padding: '4px 8px 8px',
        fontSize: '0.68rem',
        fontWeight: 700,
        color: 'var(--txt-muted)',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
      }}>
        القائمة
      </div>

      {NAV.map(({ path, label, icon: Icon, exact }) => (
        <NavLink
          key={path}
          to={path}
          end={exact}
          onClick={onLinkClick}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: 'var(--r-md)',
            textDecoration: 'none',
            fontSize: 'var(--fs-base)',
            fontWeight: isActive ? 700 : 500,
            color: isActive ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
            backgroundColor: isActive ? 'var(--clr-primary-50)' : 'transparent',
            borderInlineStart: `3px solid ${isActive ? 'var(--clr-primary-500)' : 'transparent'}`,
            transition: 'all 150ms var(--ease)',
          })}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            if (!el.style.backgroundColor.includes('50')) {
              el.style.backgroundColor = 'var(--bg-hover)';
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            if (!el.style.backgroundColor.includes('50')) {
              el.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Icon size={17} style={{ flexShrink: 0 }} />
          {label}
        </NavLink>
      ))}
    </nav>

    {/* Footer */}
    <div style={{
      padding: '14px 18px',
      borderTop: '1px solid var(--bdr-light)',
      backgroundColor: 'var(--bg-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{
          width: '7px', height: '7px',
          borderRadius: '50%',
          backgroundColor: '#22c55e',
          flexShrink: 0,
          boxShadow: '0 0 0 2px #dcfce7',
        }} />
        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--txt-secondary)' }}>
          متصل بالسيرفر
        </span>
      </div>
      <div style={{
        fontSize: '0.68rem',
        color: 'var(--txt-muted)',
        marginTop: '3px',
        fontFamily: 'monospace',
      }}>
        smart-card-qr-api.koyeb.app
      </div>
    </div>
  </aside>
);
