import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ title, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              backgroundColor: 'rgba(15,23,42,0.55)',
              display: 'flex',
            }}
            onClick={() => setMobileOpen(false)}
          >
            <div
              style={{ height: '100%', flexShrink: 0 }}
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
            {children}
          </main>
        </div>
      </div>

      <style>{`
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
