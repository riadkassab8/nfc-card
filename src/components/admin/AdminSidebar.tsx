import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Zap,
  ChevronsRight,
  X,
  UserCog,
} from 'lucide-react';
import {
  getSidebarConfig,
  fetchSidebarConfigFromApi,
  SIDEBAR_CONFIG_EVENT,
  ICON_MAP,
  SidebarNavItemConfig,
} from '../../utils/sidebarConfig';

export interface AdminSidebarProps {
  onLinkClick?: () => void;
  /** Desktop only — icon-only mode */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Mobile drawer only — shows a close button */
  onClose?: () => void;
}

const ACCOUNT_NAV = [
  { path: '/admin/profile', label: 'الملف الشخصي', icon: UserCog },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  onLinkClick,
  collapsed = false,
  onToggleCollapse,
  onClose,
}) => {
  const [navItems, setNavItems] = useState<SidebarNavItemConfig[]>(() => {
    return getSidebarConfig().filter((i) => i.visible);
  });

  useEffect(() => {
    // مزامنة القائمة من الـ Backend API في الخلفية
    fetchSidebarConfigFromApi()
      .then((items) => {
        setNavItems(items.filter((i) => i.visible));
      })
      .catch(() => {});

    const handleConfigChange = () => {
      setNavItems(getSidebarConfig().filter((i) => i.visible));
    };

    window.addEventListener(SIDEBAR_CONFIG_EVENT, handleConfigChange);
    window.addEventListener('storage', handleConfigChange);
    return () => {
      window.removeEventListener(SIDEBAR_CONFIG_EVENT, handleConfigChange);
      window.removeEventListener('storage', handleConfigChange);
    };
  }, []);

  const renderDynamicLink = (item: SidebarNavItemConfig, index: number) => {
    const Icon = ICON_MAP[item.iconName] || Zap;
    const isExact = item.path === '/admin';
    return (
      <NavLink
        key={item.id}
        to={item.path}
        end={isExact}
        onClick={onLinkClick}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
        style={{ animationDelay: `${80 + index * 45}ms` }}
      >
        <span className="sb-link-icon">
          <Icon size={18} />
        </span>
        <span className="sb-label">{item.label}</span>
      </NavLink>
    );
  };

  const renderAccountLink = (
    { path, label, icon: Icon }: { path: string; label: string; icon: React.ElementType },
    index: number,
  ) => (
    <NavLink
      key={path}
      to={path}
      onClick={onLinkClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
      style={{ animationDelay: `${80 + index * 45}ms` }}
    >
      <span className="sb-link-icon">
        <Icon size={18} />
      </span>
      <span className="sb-label">{label}</span>
    </NavLink>
  );

  return (
    <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-logo">
          <Zap size={21} color="#fff" />
        </div>
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
        {navItems.map((item, i) => renderDynamicLink(item, i))}

        <div className="sb-section" style={{ marginTop: '16px' }}>الحساب</div>
        {ACCOUNT_NAV.map((item, i) => renderAccountLink(item, i))}
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
