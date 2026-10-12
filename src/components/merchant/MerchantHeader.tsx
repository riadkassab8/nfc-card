import React from 'react';
import { Menu, Store, LogOut, User, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface MerchantHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

export const MerchantHeader: React.FC<MerchantHeaderProps> = ({ title, onOpenMobileMenu }) => {
  const { admin, logout } = useAuth();
  const storeTitle = admin?.store_name || admin?.name || 'متجري الذكي';

  // حساب تفاصيل الاشتراك
  const isPermanent = !admin?.requires_subscription || admin?.subscription_type === 'permanent';
  const subEndDate = admin?.subscription_end_date ? new Date(admin.subscription_end_date) : null;
  const now = new Date();
  const diffDays = subEndDate ? Math.ceil((subEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const endDateFormatted = subEndDate ? subEndDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

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
        >
          <Menu size={22} />
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

      {/* End: Store badge + Subscription badge + Profile + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Store Title Badge */}
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

        {/* Subscription Status Badge */}
        {isPermanent ? (
          <div
            title="اشتراكك في النظام دائم ومفتوح مدى الحياة"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '12.5px',
              fontWeight: 800,
            }}
          >
            <Sparkles size={14} color="#059669" />
            <span>اشتراك دائم (مفتوح)</span>
          </div>
        ) : diffDays !== null && diffDays <= 0 ? (
          <div
            title={`انتهى الاشتراك بتاريخ ${endDateFormatted}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '12.5px',
              fontWeight: 800,
            }}
          >
            <AlertCircle size={14} color="#ef4444" />
            <span>الاشتراك منتهي ⚠️</span>
          </div>
        ) : diffDays !== null ? (
          <div
            title={`ينتهي الاشتراك بتاريخ ${endDateFormatted}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: diffDays <= 15 ? '#fefce8' : '#f0fdf4',
              border: `1px solid ${diffDays <= 15 ? '#fef08a' : '#bbf7d0'}`,
              color: diffDays <= 15 ? '#a16207' : '#15803d',
              fontSize: '12.5px',
              fontWeight: 800,
            }}
          >
            <Clock size={14} color={diffDays <= 15 ? '#ca8a04' : '#16a34a'} />
            <span>متبقي على الاشتراك: {diffDays} يوم</span>
          </div>
        ) : null}

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
