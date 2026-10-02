import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { CommandPaletteModal } from './CommandPaletteModal';
import { Drawer } from '../ui';

export interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ title, children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-app)' }}>
        {/* Desktop Sidebar */}
        <div className="admin-desktop-sidebar-container" style={{ height: '100vh', position: 'sticky', top: 0, zIndex: 90 }}>
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          isOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
          title="القائمة الرئيسية"
          width="272px"
          closeOnOverlayClick
        >
          <AdminSidebar onLinkClick={() => setIsMobileOpen(false)} />
        </Drawer>

        {/* Command Palette */}
        <CommandPaletteModal
          isOpen={isCmdPaletteOpen}
          onClose={() => setIsCmdPaletteOpen(false)}
        />

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <AdminHeader
            title={title}
            onOpenMobileMenu={() => setIsMobileOpen(true)}
            onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
          />

          <main className="admin-main-content">
            {children}
          </main>
        </div>
      </div>

      <style>{`
        /* ── Sidebar hide on mobile ── */
        @media (max-width: 992px) {
          .admin-desktop-sidebar-container {
            display: none !important;
          }
          .admin-mobile-menu-trigger {
            display: flex !important;
          }
        }

        /* ── Main content padding ── */
        .admin-main-content {
          flex: 1;
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .admin-main-content {
            padding: 14px 12px;
            gap: 14px;
          }
        }

        @media (max-width: 480px) {
          .admin-main-content {
            padding: 10px 8px;
          }
        }

        /* ── Hero section ── */
        @media (max-width: 640px) {
          .admin-hero-section {
            flex-direction: column !important;
            padding: 18px 16px !important;
          }
          .hero-btn-wrap {
            width: 100% !important;
          }
          .hero-btn-wrap button {
            width: 100% !important;
          }
          .hero-desc {
            display: none !important;
          }
        }

        /* ── Stat cards grid ── */
        @media (max-width: 768px) {
          .admin-stat-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 400px) {
          .admin-stat-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        /* ── Bulk action bar ── */
        @media (max-width: 640px) {
          .admin-bulk-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 12px 14px !important;
          }
          .admin-bulk-bar-actions {
            width: 100% !important;
          }
        }

        /* ── Filter row ── */
        @media (max-width: 640px) {
          .admin-filter-row {
            flex-direction: column !important;
          }
          .admin-filter-row > * {
            width: 100% !important;
            min-width: unset !important;
          }
        }

        /* ── Table horizontal scroll ── */
        .admin-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        @media (max-width: 768px) {
          /* hide less important table columns on mobile */
          .col-qr   { display: none !important; }
          .col-nfc  { display: none !important; }

          /* compact table rows on mobile */
          .admin-table-wrapper td,
          .admin-table-wrapper th {
            padding: 10px 10px !important;
          }

          /* hide hero description on mobile */
          .hero-desc { display: none !important; }
        }

        @media (max-width: 480px) {
          .col-business { display: none !important; }
          .col-dates    { display: none !important; }

          /* show short category labels on tiny screens */
          .cat-full  { display: none !important; }
          .cat-short { display: inline !important; }

          /* make table rows even more compact */
          .admin-table-wrapper td,
          .admin-table-wrapper th {
            padding: 8px 8px !important;
          }
        }
      `}</style>

    </>
  );
};
