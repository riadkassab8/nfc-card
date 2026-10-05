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
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f4f6fa', overflow: 'hidden' }}>
        {/* Desktop sidebar */}
        <div className="admin-sidebar-desktop" style={{ height: '100vh', position: 'sticky', top: 0, zIndex: 90, flexShrink: 0 }}>
          <AdminSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        <div
          className={`mobile-sidebar-overlay ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className={`mobile-sidebar-content ${mobileOpen ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar onLinkClick={() => setMobileOpen(false)} />
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
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
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .mobile-sidebar-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        
        .mobile-sidebar-content {
          height: 100%;
          flex-shrink: 0;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transform: translateX(100%); 
        }
        [dir="ltr"] .mobile-sidebar-content {
          transform: translateX(-100%);
        }
        
        .mobile-sidebar-content.open {
          transform: translateX(0) !important;
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
