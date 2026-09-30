import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { Drawer } from '../ui';
import { businessService } from '../../services';
import { Business } from '../../types';

export interface DashboardShellProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ title, children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    let isMounted = true;
    businessService.getCurrentBusiness().then((data) => {
      if (isMounted) setBusiness(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-app)' }}>
      {/* Desktop Sidebar (Fixed 240px) */}
      <div className="desktop-sidebar-container" style={{ height: '100vh', position: 'sticky', top: 0 }}>
        <DashboardSidebar />
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        title="Navigation"
        width="280px"
      >
        <DashboardSidebar onLinkClick={() => setIsMobileOpen(false)} />
      </Drawer>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <DashboardHeader
          title={title}
          business={business}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

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

      {/* Responsive Layout CSS helper */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar-container {
            display: none !important;
          }
          .mobile-menu-trigger {
            display: flex !important;
          }
          .business-name-preview {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
