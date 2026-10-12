import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MerchantSidebar } from './MerchantSidebar';
import { MerchantHeader } from './MerchantHeader';

export interface MerchantShellProps {
  title: string;
  children: React.ReactNode;
}

export const MerchantShell: React.FC<MerchantShellProps> = ({ title, children }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <main className="admin-main page-transition" style={{ flex: 1, padding: '24px', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
