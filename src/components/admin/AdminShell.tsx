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
      {/* Desktop Sidebar (240px) */}
      <div className="admin-desktop-sidebar-container" style={{ height: '100vh', position: 'sticky', top: 0 }}>
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        title="Admin Navigation"
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
            maxWidth: '1200px',
            margin: '0 auto',
            padding: 'var(--space-3xl) var(--space-2xl)',
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
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
