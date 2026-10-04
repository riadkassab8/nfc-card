import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Tags, Scan, Settings, Sparkles } from 'lucide-react';

export interface AdminSidebarProps {
  onLinkClick?: () => void;
}

const NAV = [
  { path: '/admin',            label: 'نظرة عامة',    icon: <LayoutDashboard size={18} />, exact: true },
  { path: '/admin/cards',      label: 'إدارة البطاقات', icon: <CreditCard size={18} /> },
  { path: '/admin/categories', label: 'التصنيفات',     icon: <Tags size={18} /> },
  { path: '/admin/scan',       label: 'فحص وتجهيز',    icon: <Scan size={18} /> },
  { path: '/admin/settings',   label: 'الإعدادات',     icon: <Settings size={18} /> },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLinkClick }) => (
  <aside style={{
    width: '256px',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '20px 12px',
    boxSizing: 'border-box',
    boxShadow: '4px 0 24px rgba(15,23,42,0.18)',
  }}>
    {/* Brand */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px', marginBottom: '28px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
      }}>
        <Sparkles size={22} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'Cairo, sans-serif' }}>
          NFC Smart Cards
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>لوحة الإدارة</div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      <div style={{ padding: '0 10px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        القائمة الرئيسية
      </div>
      {NAV.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          onClick={onLinkClick}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '11px',
            padding: '10px 12px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif',
            fontWeight: isActive ? 700 : 500,
            backgroundColor: isActive ? 'rgba(99,102,241,0.16)' : 'transparent',
            color: isActive ? '#e0e7ff' : '#94a3b8',
            borderInlineStart: `3px solid ${isActive ? '#6366f1' : 'transparent'}`,
            transition: 'all 150ms ease',
          })}
        >
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>

    {/* Footer status */}
    <div style={{
      padding: '12px 14px', borderRadius: '10px',
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>النظام يعمل</span>
      </div>
      <span style={{ fontSize: '0.68rem', color: '#475569' }}>v3.0 — smart-card-qr-api.koyeb.app</span>
    </div>
  </aside>
);
