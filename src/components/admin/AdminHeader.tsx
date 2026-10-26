import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  LogOut,
  X,
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ExternalLink,
  ShoppingCart,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services';
import { ApiNotification } from '../../types';


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

const formatTimeAgo = (dateStr: string) => {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return new Date(dateStr).toLocaleDateString('ar-EG-u-nu-latn');
  } catch {
    return '';
  }
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onOpenMobileMenu }) => {
  const { admin, logout, canAccessPage } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const hasNotifAccess = canAccessPage('notifications');

  // Notification states
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return window.localStorage.getItem('admin-notification-sound') !== 'off'; } catch { return true; }
  });
  const [activeAlert, setActiveAlert] = useState<ApiNotification | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const knownNotificationIdsRef = useRef<Set<string> | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);

  const displayName = admin?.name || admin?.username || 'admin';
  const initial = displayName.trim().charAt(0).toUpperCase();

  const fetchNotifications = async () => {
    if (!hasNotifAccess) return;
    try {
      const res = await notificationsApi.getNotifications(30);
      const latestNotifications = res.notifications || [];
      const knownIds = knownNotificationIdsRef.current;
      if (knownIds) {
        const arriving = latestNotifications.filter((notification) => !knownIds.has(notification._id) && !notification.is_read);
        if (arriving.length > 0) {
          const newest = arriving[0];
          setActiveAlert(newest);
          if (alertTimeoutRef.current !== null) window.clearTimeout(alertTimeoutRef.current);
          alertTimeoutRef.current = window.setTimeout(() => setActiveAlert(null), 12000);
          playNotificationSound();
        }
        latestNotifications.forEach((notification) => knownIds.add(notification._id));
        knownNotificationIdsRef.current = new Set(latestNotifications.map((notification) => notification._id));
      } else {
        // Establish a baseline on first load; do not sound for old notifications.
        knownNotificationIdsRef.current = new Set(latestNotifications.map((notification) => notification._id));
      }
      setNotifications(latestNotifications);
      setUnreadCount(res.unread_count || 0);
    } catch {
      // silently ignore if offline
    }
  };

  const playNotificationSound = (force = false) => {
    if (!force && !soundEnabledRef.current) return;
    try {
      const AudioContextConstructor = window.AudioContext;
      if (!AudioContextConstructor) return;
      const context = audioContextRef.current || new AudioContextConstructor();
      audioContextRef.current = context;
      if (context.state === 'suspended') void context.resume();

      // A short, two-part alert: assertive enough to notice without being continuous.
      const notes = [880, 1175, 988, 784];
      const startAt = context.currentTime + 0.04;
      notes.forEach((frequency, index) => {
        const start = startAt + index * 0.2;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.32, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.17);
      });
    } catch (error) {
      console.warn('Notification audio is unavailable in this browser:', error);
    }
  };

  const toggleNotificationSound = () => {
    const nextEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = nextEnabled;
    setSoundEnabled(nextEnabled);
    try { window.localStorage.setItem('admin-notification-sound', nextEnabled ? 'on' : 'off'); } catch { /* storage is optional */ }
    if (nextEnabled) playNotificationSound(true);
  };

  useEffect(() => {
    if (!hasNotifAccess) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [hasNotifAccess]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const unlockAudio = () => {
      if (!soundEnabledRef.current || !window.AudioContext) return;
      try {
        const context = audioContextRef.current || new window.AudioContext();
        audioContextRef.current = context;
        if (context.state === 'suspended') void context.resume();
      } catch { /* browser may not support Web Audio */ }
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      if (alertTimeoutRef.current !== null) window.clearTimeout(alertTimeoutRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') void audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: ApiNotification) => {
    if (!notif.is_read) {
      try {
        await notificationsApi.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setNotifOpen(false);

    let targetLink = notif.link;
    if (notif.card_id) {
      if (!targetLink || !targetLink.startsWith('/admin/cards')) {
        targetLink = `/admin/cards?cardId=${notif.card_id}`;
      } else if (!targetLink.includes('cardId=')) {
        const sep = targetLink.includes('?') ? '&' : '?';
        targetLink = `${targetLink}${sep}cardId=${notif.card_id}`;
      }
    } else {
      const cardMatch =
        (notif.message || notif.title || '').match(/\b(CARD-[A-Za-z0-9_-]+)\b/i) ||
        (notif.message || notif.title || '').match(/\(([A-Za-z0-9_-]+)\)/);
      if (
        cardMatch &&
        cardMatch[1] &&
        (!targetLink || targetLink.includes('/admin/cards') || !targetLink.startsWith('/admin/users'))
      ) {
        targetLink = `/admin/cards?search=${encodeURIComponent(cardMatch[1])}`;
      }
    }

    if (targetLink) {
      navigate(targetLink);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const renderNotifIcon = (type: string, link?: string | null) => {
    if (link?.includes('/admin/orders')) {
      return <ShoppingCart size={18} style={{ color: '#10b981' }} />;
    }
    switch (type) {
      case 'danger':
        return <AlertCircle size={18} style={{ color: '#ef4444' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: '#f59e0b' }} />;
      case 'success':
        return <CheckCircle2 size={18} style={{ color: '#10b981' }} />;
      default:
        return <Info size={18} style={{ color: '#3b82f6' }} />;
    }
  };

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

        {/* End: notifications + user + logout */}
        <div className="hdr-end">
          {/* ── Notification Bell Dropdown ── */}
          {hasNotifAccess && (
            <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen(!notifOpen);
                if (!notifOpen) fetchNotifications();
              }}
              className="hdr-icon-btn"
              title="الإشعارات"
              aria-label="الإشعارات"
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    minWidth: '17px',
                    height: '17px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 0 0 2px var(--bg-card, #ffffff)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Backdrop on mobile */}
            {notifOpen && (
              <div
                className="hdr-notif-backdrop"
                onClick={() => setNotifOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Dropdown Panel */}
            {notifOpen && (
              <div
                dir="rtl"
                className="hdr-notif-dropdown"
              >
                {/* Header */}
                <div
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--bdr-light, #e2e8f0)',
                    backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} style={{ color: 'var(--clr-primary-600, #3b82f6)' }} />
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--txt-heading, #0f172a)' }}>
                      الإشعارات
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {unreadCount} جديدة
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={toggleNotificationSound}
                      aria-pressed={soundEnabled}
                      title={soundEnabled ? 'إيقاف صوت الإشعارات' : 'تفعيل صوت الإشعارات'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 8px', border: '1px solid var(--bdr-light, #e2e8f0)', borderRadius: '8px', background: soundEnabled ? '#ecfdf5' : '#fff', color: soundEnabled ? '#047857' : '#64748b', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                      {soundEnabled ? 'الصوت مفعّل' : 'تفعيل الصوت'}
                    </button>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--clr-primary-600, #3b82f6)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                        }}
                        title="تحديد الكل كمقروء"
                      >
                        <CheckCheck size={14} />
                        تحديد الكل كمقروء
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="hdr-notif-close-mobile"
                      title="إغلاق"
                      aria-label="إغلاق الإشعارات"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div
                  style={{
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '13.5px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <Bell size={32} style={{ opacity: 0.3 }} />
                      <span>لا توجد إشعارات حالياً</span>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        style={{
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          cursor: 'pointer',
                          backgroundColor: notif.is_read
                            ? 'transparent'
                            : 'rgba(59, 130, 246, 0.05)',
                          borderBottom: '1px solid var(--bdr-light, #f1f5f9)',
                          transition: 'background-color 0.15s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-subtle, #f8fafc)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = notif.is_read
                            ? 'transparent'
                            : 'rgba(59, 130, 246, 0.05)';
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            marginTop: '2px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            backgroundColor:
                              notif.type === 'danger'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : notif.type === 'warning'
                                ? 'rgba(245, 158, 11, 0.1)'
                                : 'rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {renderNotifIcon(notif.type, notif.link)}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '2px',
                            }}
                          >
                            <h4
                              style={{
                                fontSize: '13px',
                                fontWeight: notif.is_read ? 600 : 800,
                                color: 'var(--txt-heading, #0f172a)',
                                margin: 0,
                              }}
                            >
                              {notif.title}
                            </h4>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>

                          <p
                            style={{
                              fontSize: '12px',
                              color: 'var(--txt-body, #64748b)',
                              margin: '0 0 6px',
                              lineHeight: 1.5,
                            }}
                          >
                            {notif.message}
                          </p>

                          {notif.link && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                color: 'var(--clr-primary-600, #3b82f6)',
                                fontWeight: 700,
                              }}
                            >
                              عرض التفاصيل <ExternalLink size={10} />
                            </span>
                          )}
                        </div>

                        {/* Unread dot / Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!notif.is_read && (
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#3b82f6',
                              }}
                            />
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(e, notif._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                            }}
                            title="حذف"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer: View all notifications */}
                <div
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    borderTop: '1px solid var(--bdr-light, #e2e8f0)',
                    backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  }}
                >
                  <Link
                    to="/admin/notifications"
                    onClick={() => setNotifOpen(false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--clr-primary-600, #3b82f6)',
                      textDecoration: 'none',
                    }}
                  >
                    عرض جميع الإشعارات ({notifications.length}) <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User profile link */}
        <Link to="/admin/profile" className="hdr-user" title="الملف الشخصي والإعدادات">
          <div className="hdr-user-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="hdr-user-name">{displayName}</span>
            <span className="hdr-user-role">
              {admin?.role === 'super_admin'
                ? 'المدير العام'
                : admin?.role === 'merchant'
                ? 'تاجر / متجر'
                : admin?.role === 'staff'
                ? 'موظف'
                : 'مدير النظام'}
            </span>
          </div>
            <div className="hdr-avatar">
              {admin?.avatar && !avatarFailed ? (
                <img src={admin.avatar} alt="" onError={() => setAvatarFailed(true)} />
              ) : (
                initial
              )}
            </div>
          </Link>

          {/* Logout button */}
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

      {activeAlert && createPortal(
        <div
          role="alert"
          aria-live="assertive"
          dir="rtl"
          style={{ position: 'fixed', zIndex: 10050, bottom: 24, left: 20, width: 'min(420px, calc(100vw - 40px))', padding: '16px', borderRadius: '16px', border: '1px solid #fca5a5', background: 'linear-gradient(135deg, #fff 0%, #fff7ed 100%)', boxShadow: '0 18px 55px rgba(127, 29, 29, .24)', fontFamily: 'inherit', animation: 'admin-notif-enter .28s ease-out' }}
        >
          <style>{`@keyframes admin-notif-enter{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes admin-notif-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.32)}50%{box-shadow:0 0 0 7px rgba(239,68,68,0)}}`}</style>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 13, display: 'grid', placeItems: 'center', color: '#fff', background: activeAlert.type === 'danger' ? '#dc2626' : activeAlert.type === 'warning' ? '#d97706' : '#2563eb', animation: 'admin-notif-pulse 1.5s ease-out 2' }}>
              <Bell size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#991b1b', fontSize: 11, fontWeight: 900, marginBottom: 4 }}>تنبيه جديد</div>
              <div style={{ color: '#172033', fontSize: 14, fontWeight: 900, lineHeight: 1.5 }}>{activeAlert.title}</div>
              <div style={{ color: '#475569', fontSize: 12, lineHeight: 1.6, marginTop: 3 }}>{activeAlert.message}</div>
              <button type="button" onClick={() => { const selected = activeAlert; setActiveAlert(null); if (alertTimeoutRef.current !== null) window.clearTimeout(alertTimeoutRef.current); void handleNotificationClick(selected); }} style={{ marginTop: 11, border: 0, borderRadius: 9, padding: '8px 12px', color: '#fff', background: '#b91c1c', font: 'inherit', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                فتح الإشعار والتفاصيل
              </button>
            </div>
            <button type="button" onClick={() => { setActiveAlert(null); if (alertTimeoutRef.current !== null) window.clearTimeout(alertTimeoutRef.current); }} aria-label="إغلاق التنبيه" style={{ border: 0, background: 'transparent', color: '#64748b', padding: 3, cursor: 'pointer' }}>
              <X size={17} />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Logout confirmation — portalled */}
      {confirmOpen && createPortal(
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="modal-header">
              <h2 className="modal-title">تسجيل الخروج</h2>
              <button type="button" className="modal-close" onClick={() => setConfirmOpen(false)} aria-label="إغلاق">
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: '0 0 8px', color: 'var(--txt-body)' }}>
                هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة التحكم؟
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>
                إلغاء
              </button>
              <button type="button" className="btn-danger" onClick={logout}>
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
