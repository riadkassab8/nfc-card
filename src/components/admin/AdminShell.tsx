import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Clock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

const COLLAPSE_KEY = 'nfc_sidebar_collapsed';

const readCollapsed = (): boolean => {
  try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
};

export const AdminShell: React.FC<AdminShellProps> = ({ title, children }) => {
  const location = useLocation();
  const { admin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [dismissBanner, setDismissBanner] = useState(false);

  // حساب أيام الاشتراك المتبقية إذا كان الحساب يخضع للاشتراك
  let subWarning: { type: 'expired' | 'urgent' | 'warning'; daysLeft: number; endDateStr: string } | null = null;
  if (admin && admin.role !== 'super_admin' && admin.requires_subscription && admin.subscription_end_date) {
    const end = new Date(admin.subscription_end_date);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const endDateStr = end.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    if (diffDays <= 0) {
      subWarning = { type: 'expired', daysLeft: 0, endDateStr };
    } else if (diffDays <= 7) {
      subWarning = { type: 'urgent', daysLeft: diffDays, endDateStr };
    } else if (diffDays <= 15) {
      subWarning = { type: 'warning', daysLeft: diffDays, endDateStr };
    }
  }

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  // Play the exit animation before unmounting the mobile drawer
  const closeMobile = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setMobileOpen(false);
      setClosing(false);
    }, 210);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setClosing(false);
  }, [location.pathname]);

  // Esc closes the drawer + lock body scroll while it is open
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMobile(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, closeMobile]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">
        <AdminSidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div
          className={`sb-mobile-overlay${closing ? ' closing' : ''}`}
          onClick={closeMobile}
          role="presentation"
        >
          <div className="sb-mobile-panel" onClick={(e) => e.stopPropagation()}>
            <AdminSidebar onLinkClick={closeMobile} onClose={closeMobile} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="admin-content">
        <AdminHeader title={title} onOpenMobileMenu={() => setMobileOpen(true)} />

        {/* ── Subscription Warning Banner ── */}
        {subWarning && !dismissBanner && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor:
                subWarning.type === 'expired'
                  ? '#fef2f2'
                  : subWarning.type === 'urgent'
                  ? '#fff7ed'
                  : '#fefce8',
              borderBottom: `1px solid ${
                subWarning.type === 'expired'
                  ? '#fecaca'
                  : subWarning.type === 'urgent'
                  ? '#ffedd5'
                  : '#fef08a'
              }`,
              color:
                subWarning.type === 'expired'
                  ? '#991b1b'
                  : subWarning.type === 'urgent'
                  ? '#9a3412'
                  : '#854d0e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              direction: 'rtl',
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700 }}>
              {subWarning.type === 'expired' ? (
                <AlertCircle size={20} color="#dc2626" />
              ) : subWarning.type === 'urgent' ? (
                <AlertTriangle size={20} color="#ea580c" />
              ) : (
                <Clock size={20} color="#ca8a04" />
              )}
              <span>
                {subWarning.type === 'expired'
                  ? `⚠️ تنبيه هام: انتهت فترة اشتراك حسابك في النظام بتاريخ ${subWarning.endDateStr}. يرجى التواصل مع إدارة النظام فوراً لتجديد الاشتراك لتفادي إيقاف الحساب.`
                  : subWarning.type === 'urgent'
                  ? `⏳ تنبيه عاجل: متبقي ${subWarning.daysLeft} ${subWarning.daysLeft === 1 ? 'يوم' : 'أيام'} فقط على انتهاء اشتراك حسابك (ينتهي في ${subWarning.endDateStr}). يرجى المبادرة بتجديد الاشتراك لتفادي انقطاع الخدمة.`
                  : `🔔 تذكير باقتراب موعد التجديد: سينتهي اشتراك حسابك بعد ${subWarning.daysLeft} يوماً (بتاريخ ${subWarning.endDateStr}).`}
              </span>
            </div>

            {subWarning.type !== 'expired' && (
              <button
                type="button"
                onClick={() => setDismissBanner(true)}
                title="إغلاق التنبيه مؤقتاً"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.7,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <main key={location.pathname} className="admin-main page-transition">
          {children}
        </main>
      </div>
    </div>
  );
};
