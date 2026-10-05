import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ title, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f4f6fa' }}>
        {/* Desktop sidebar */}
        <div className="admin-sidebar-desktop" style={{ height: '100vh', position: 'sticky', top: 0, zIndex: 90, flexShrink: 0 }}>
          <AdminSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div
            className="mobile-sidebar-overlay"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="mobile-sidebar-content"
              onClick={(e) => e.stopPropagation()}
            >
              <AdminSidebar onLinkClick={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <AdminHeader title={title} onOpenMobileMenu={() => setMobileOpen(true)} />
          <main style={{ flex: 1, padding: '24px', boxSizing: 'border-box', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
            <div key={location.pathname} className="page-transition">
              {children}
            </div>
          </main>
        </div>
      </div>

      <style>{`
        /* Page Transitions */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-transition {
          animation: fadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Mobile Sidebar Animations */
        .mobile-sidebar-overlay {
          position: fixed; inset: 0; zIndex: 200;
          background-color: rgba(15,23,42,0.55);
          display: flex;
          animation: fadeInOverlay 0.3s ease;
        }
        
        .mobile-sidebar-content {
          height: 100%;
          flex-shrink: 0;
          animation: slideInSidebar 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInSidebar {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        [dir="ltr"] .mobile-sidebar-content {
          animation: slideInSidebarLtr 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideInSidebarLtr {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 992px) {
          .admin-sidebar-desktop { display: none !important; }
        }
        @media (max-width: 768px) {
          main { padding: 14px 12px !important; }
        }
        @media (max-width: 480px) {
          main { padding: 10px 8px !important; }
        }
      `}</style>
    </>
  );
};
