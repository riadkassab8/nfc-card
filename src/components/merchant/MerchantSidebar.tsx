import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import {
  LogOut,
  X,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  normalizeMerchantSidebarItems,
  ICON_MAP,
  SidebarNavItemConfig,
} from '../../utils/sidebarConfig';

export interface MerchantSidebarProps {
  onLinkClick?: () => void;
  onClose?: () => void;
}

export const MerchantSidebar: React.FC<MerchantSidebarProps> = ({
  onLinkClick,
  onClose,
}) => {
  const { admin, logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const storeTitle = admin?.store_name || admin?.name || 'متجري الذكي';

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmOpen]);

  // حساب تفاصيل الاشتراك
  const isPermanent = !admin?.requires_subscription || admin?.subscription_type === 'permanent';
  const subEndDate = admin?.subscription_end_date ? new Date(admin.subscription_end_date) : null;
  const now = new Date();
  const diffDays = subEndDate ? Math.ceil((subEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const endDateFormatted = subEndDate ? subEndDate.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  // جلب روابط القائمة الجانبية المخصصة للمتجر حصراً
  const [navItems, setNavItems] = useState<SidebarNavItemConfig[]>(() => {
    return normalizeMerchantSidebarItems(admin?.sidebar_menu);
  });

  useEffect(() => {
    setNavItems(normalizeMerchantSidebarItems(admin?.sidebar_menu));
  }, [admin?.sidebar_menu]);

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
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.iconName] || Store;
          const isExact = item.path === '/merchant';
          return (
            <NavLink
              key={item.id || item.path}
              to={item.path}
              end={isExact}
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
        {/* Store Subscription Card */}
        <div style={{
          padding: '12px 14px',
          borderRadius: '12px',
          backgroundColor: isPermanent ? '#ecfdf5' : diffDays !== null && diffDays <= 15 ? '#fffbeb' : '#f8fafc',
          border: `1px solid ${isPermanent ? '#a7f3d0' : diffDays !== null && diffDays <= 15 ? '#fef08a' : '#e2e8f0'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} color="#2563eb" /> اشتراك المتجر
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: isPermanent ? '#d1fae5' : diffDays !== null && diffDays <= 15 ? '#fef08a' : '#eff6ff',
              color: isPermanent ? '#065f46' : diffDays !== null && diffDays <= 15 ? '#854d0e' : '#1d4ed8',
            }}>
              {admin?.subscription_type === 'yearly' ? 'سنوي' : admin?.subscription_type === 'custom' ? 'مخصص' : 'دائم'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 800,
              color: isPermanent ? '#047857' : diffDays !== null && diffDays <= 0 ? '#dc2626' : diffDays !== null && diffDays <= 15 ? '#b45309' : '#0f172a',
            }}>
              {isPermanent ? (
                'مدى الحياة (مفتوح)'
              ) : diffDays !== null && diffDays <= 0 ? (
                '⚠️ منتهي الصلاحية'
              ) : diffDays !== null ? (
                `متبقي ${diffDays} يوم`
              ) : (
                'غير محدد'
              )}
            </span>
          </div>

          {!isPermanent && endDateFormatted && (
            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
              ينتهي في: {endDateFormatted}
            </span>
          )}
        </div>

        <button
          onClick={() => setConfirmOpen(true)}
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

      {/* Logout confirmation — portalled */}
      {confirmOpen && createPortal(
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="modal-header">
              <h2 className="modal-title">تسجيل الخروج</h2>
              <button type="button" className="modal-close" onClick={() => setConfirmOpen(false)} aria-label="إغلاق">
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: '0 0 8px', color: 'var(--txt-body)' }}>
                هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة تحكم المتجر؟
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>
                إلغاء
              </button>
              <button type="button" className="btn-danger" onClick={logout}>
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};
