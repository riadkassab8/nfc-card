import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Menu, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AdminHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 18) return 'مساء الخير';
  return 'مساء النور';
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onOpenMobileMenu }) => {
  const { admin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const displayName = admin?.name || admin?.username || 'admin';
  const initial = displayName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setAvatarFailed(false); }, [admin?.avatar]);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setConfirmOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmOpen]);

  return (
    <>
      <header className={`admin-header${scrolled ? ' scrolled' : ''}`}>
        {/* Start: hamburger + title */}
        <div className="hdr-start">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="hdr-icon-btn hdr-hamburger"
            aria-label="القائمة"
          >
            <Menu size={19} />
          </button>

          <div className="hdr-title-wrap">
            <span className="hdr-crumb">{greeting()}، {displayName} 👋</span>
            <h1 key={title} className="hdr-title">{title}</h1>
          </div>
        </div>

        {/* End: user + logout */}
        <div className="hdr-end">
          <Link to="/admin/profile" className="hdr-user" title="الملف الشخصي والإعدادات">
            <div className="hdr-user-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span className="hdr-user-name">{displayName}</span>
              <span className="hdr-user-role">مدير النظام</span>
            </div>
            <div className="hdr-avatar">
              {admin?.avatar && !avatarFailed ? (
                <img src={admin.avatar} alt="" onError={() => setAvatarFailed(true)} />
              ) : (
                initial
              )}
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
            className="hdr-icon-btn danger"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Logout confirmation — portalled because the header's backdrop-filter
          would otherwise trap position:fixed children */}
      {confirmOpen && createPortal(
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="modal-header">
              <h2 className="modal-title">تسجيل الخروج</h2>
              <button type="button" className="modal-close" onClick={() => setConfirmOpen(false)} aria-label="إغلاق">
                <X size={17} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: 'var(--clr-error-bg)', color: 'var(--clr-error)',
                border: '1px solid var(--clr-error-bdr)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LogOut size={20} />
              </div>
              <p style={{ color: 'var(--txt-secondary)', fontWeight: 500 }}>
                هل أنت متأكد أنك تريد تسجيل الخروج من لوحة الإدارة؟
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => setConfirmOpen(false)} autoFocus>
                إلغاء
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 6px 16px -6px rgba(220,38,38,0.6)' }}
                onClick={() => { setConfirmOpen(false); logout(); }}
              >
                <LogOut size={16} /> تسجيل الخروج
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
