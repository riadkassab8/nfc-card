import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, Store, LogOut, User, Clock, Sparkles, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface MerchantHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

export const MerchantHeader: React.FC<MerchantHeaderProps> = ({ title, onOpenMobileMenu }) => {
  const { admin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const storeTitle = admin?.store_name || admin?.name || 'متجري الذكي';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
  const endDateFormatted = subEndDate ? subEndDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  return (
    <header className={`merchant-header${scrolled ? ' scrolled' : ''}`} dir="rtl">
      {/* Start: mobile menu + title */}
      <div className="hdr-start">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="hdr-icon-btn hdr-hamburger"
          aria-label="القائمة"
        >
          <Menu size={20} />
        </button>

        <div className="hdr-title-wrap">
          <span className="hdr-crumb">مرحباً بك في بوابة المتجر 👋</span>
          <h1 key={title} className="hdr-title">
            {title}
          </h1>
        </div>
      </div>

      {/* End: Store badge + Subscription badge + Profile + Logout */}
      <div className="hdr-end">
        {/* Store Title Badge (Desktop Only) */}
        <div className="merchant-store-badge" title={storeTitle}>
          <Store size={14} />
          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {storeTitle}
          </span>
        </div>

        {/* Subscription Status Badge (Desktop & Tablet Only) */}
        {isPermanent ? (
          <div
            className="merchant-sub-badge"
            title="اشتراكك في النظام دائم ومفتوح مدى الحياة"
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
            }}
          >
            <Sparkles size={14} color="#059669" />
            <span>اشتراك دائم</span>
          </div>
        ) : diffDays !== null && diffDays <= 0 ? (
          <div
            className="merchant-sub-badge"
            title={`انتهى الاشتراك بتاريخ ${endDateFormatted}`}
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
            }}
          >
            <AlertCircle size={14} color="#ef4444" />
            <span>الاشتراك منتهي ⚠️</span>
          </div>
        ) : diffDays !== null ? (
          <div
            className="merchant-sub-badge"
            title={`ينتهي الاشتراك بتاريخ ${endDateFormatted}`}
            style={{
              backgroundColor: diffDays <= 15 ? '#fefce8' : '#f0fdf4',
              border: `1px solid ${diffDays <= 15 ? '#fef08a' : '#bbf7d0'}`,
              color: diffDays <= 15 ? '#a16207' : '#15803d',
            }}
          >
            <Clock size={14} color={diffDays <= 15 ? '#ca8a04' : '#16a34a'} />
            <span>متبقي: {diffDays} يوم</span>
          </div>
        ) : null}

        {/* Profile Link Button */}
        <Link
          to="/merchant/profile"
          className="hdr-icon-btn"
          title="الملف الشخصي وإعدادات الحساب"
          aria-label="الملف الشخصي"
        >
          <User size={18} />
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="hdr-icon-btn danger"
          title="تسجيل الخروج"
          aria-label="تسجيل الخروج"
        >
          <LogOut size={17} />
        </button>
      </div>

      {/* Logout confirmation — portalled */}
      {confirmOpen && createPortal(
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-panel responsive-modal-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="modal-header responsive-modal-header">
              <h2 className="modal-title">تسجيل الخروج</h2>
              <button type="button" className="modal-close" onClick={() => setConfirmOpen(false)} aria-label="إغلاق">
                <X size={17} />
              </button>
            </div>
            <div className="modal-body responsive-modal-body">
              <p style={{ margin: '0 0 8px', color: 'var(--txt-body)' }}>
                هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة تحكم المتجر؟
              </p>
            </div>
            <div className="modal-footer responsive-modal-footer">
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
    </header>
  );
};
