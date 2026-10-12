import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, Tags, Scan, Zap, BarChart2, Users,
  ChevronsRight, X, UserCog, Bell,
} from 'lucide-react';

export interface AdminSidebarProps {
  onLinkClick?: () => void;
  /** Desktop only — icon-only mode */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Mobile drawer only — shows a close button */
  onClose?: () => void;
}

const NAV = [
  { path: '/admin',               label: 'نظرة عامة',       icon: LayoutDashboard, exact: true },
  { path: '/admin/customers',     label: 'العملاء (CRM)',   icon: Users },
  { path: '/admin/cards',         label: 'إدارة البطاقات',   icon: CreditCard },
  { path: '/admin/notifications', label: 'الإشعارات',       icon: Bell },
  { path: '/admin/analytics',     label: 'الإحصائيات',       icon: BarChart2 },
  { path: '/admin/categories',    label: 'التصنيفات',        icon: Tags },
  { path: '/admin/scan',          label: 'فحص وتجهيز',       icon: Scan },
];

const ACCOUNT_NAV = [
  { path: '/admin/profile', label: 'الملف الشخصي', icon: UserCog },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  onLinkClick, collapsed = false, onToggleCollapse, onClose,
}) => {
  const renderLink = (
    { path, label, icon: Icon, exact }: { path: string; label: string; icon: React.ElementType; exact?: boolean },
    index: number,
  ) => (
    <NavLink
      key={path}
      to={path}
      end={exact}
      onClick={onLinkClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
      style={{ animationDelay: `${80 + index * 45}ms` }}
    >
      <span className="sb-link-icon"><Icon size={18} /></span>
      <span className="sb-label">{label}</span>
    </NavLink>
  );

  return (
    <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-logo"><Zap size={21} color="#fff" /></div>
        <div className="sb-brand-text" style={{ flex: 1 }}>
          <div className="sb-brand-name">k2rty</div>
          <div className="sb-brand-sub">لوحة الإدارة</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="sb-collapse-btn"
            style={{ width: 36, height: 36, padding: 0 }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        <div className="sb-section">القائمة الرئيسية</div>
        {NAV.map((item, i) => renderLink(item, i))}

        <div className="sb-section" style={{ marginTop: 10 }}>الحساب</div>
        {ACCOUNT_NAV.map((item, i) => renderLink(item, NAV.length + i))}
      </nav>

      {/* Collapse toggle (desktop) */}
      {onToggleCollapse && (
        <div className="sb-footer">
          <button
            type="button"
            className="sb-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
            aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            <ChevronsRight size={17} />
            <span className="sb-label">طي القائمة</span>
          </button>
        </div>
      )}
    </aside>
  );
};
