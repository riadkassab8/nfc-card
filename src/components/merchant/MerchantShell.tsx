import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Clock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MerchantSidebar } from './MerchantSidebar';
import { MerchantHeader } from './MerchantHeader';

export interface MerchantShellProps {
  title: string;
  children: React.ReactNode;
}

export const MerchantShell: React.FC<MerchantShellProps> = ({ title, children }) => {
  const location = useLocation();
  const { admin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  // حساب حالة اشتراك المتجر
  let subWarning: { type: 'expired' | 'urgent' | 'warning'; daysLeft: number; endDateStr: string } | null = null;
  if (admin && admin.requires_subscription && admin.subscription_type !== 'permanent' && admin.subscription_end_date) {
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-layout merchant-portal-layout">
      {/* Desktop Sidebar */}
      <div className="admin-sidebar-desktop" style={{ width: '260px', flexShrink: 0 }}>
        <MerchantSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="sb-mobile-overlay"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        >
          <div
            className="sb-mobile-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '280px' }}
          >
            <MerchantSidebar
              onLinkClick={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="admin-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <MerchantHeader
          title={title}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

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
                  ? `⚠️ تنبيه هام: انتهت فترة اشتراك حساب متجرك في النظام بتاريخ ${subWarning.endDateStr}. يرجى التواصل مع إدارة المنصة فوراً لتجديد الاشتراك لتفادي توقف الخدمة.`
                  : subWarning.type === 'urgent'
                  ? `⏳ تنبيه عاجل: متبقي ${subWarning.daysLeft} ${subWarning.daysLeft === 1 ? 'يوم' : 'أيام'} فقط على انتهاء اشتراك حساب متجرك (ينتهي في ${subWarning.endDateStr}). يرجى المبادرة بتجديد الاشتراك.`
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

        <main className="admin-main page-transition" style={{ flex: 1, padding: '24px', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
