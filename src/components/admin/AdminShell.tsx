import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

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
        <main key={location.pathname} className="admin-main page-transition">
          {children}
        </main>
      </div>
    </div>
  );
};
