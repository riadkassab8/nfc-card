import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Drawer } from '../ui';

export interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ title, children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-app)' }}>
      {/* Desktop Sidebar (260px) */}
      <div className="admin-desktop-sidebar-container" style={{ height: '100vh', position: 'sticky', top: 0, zIndex: 90 }}>
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        title="القائمة الرئيسية"
        width="280px"
      >
        <AdminSidebar onLinkClick={() => setIsMobileOpen(false)} />
      </Drawer>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader title={title} onOpenMobileMenu={() => setIsMobileOpen(true)} />

        <main
          style={{
            flex: 1,
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: 'var(--space-2xl)',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .admin-desktop-sidebar-container {
            display: none !important;
          }
          .admin-mobile-menu-trigger {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
