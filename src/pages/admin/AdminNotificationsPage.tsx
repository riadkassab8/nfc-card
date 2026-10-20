import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { notificationsApi } from '../../services';
import { ApiNotification } from '../../types';

export const AdminNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all'); // all | unread | warning | danger | info

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getNotifications(100);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (notif: ApiNotification) => {
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG-u-nu-latn', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'unread') return !n.is_read;
    if (filterType === 'warning') return n.type === 'warning';
    if (filterType === 'danger') return n.type === 'danger';
    if (filterType === 'info') return n.type === 'info' || n.type === 'success';
    return true;
  });

  const renderIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={20} style={{ color: '#ef4444' }} />;
      case 'warning':
        return <AlertTriangle size={20} style={{ color: '#f59e0b' }} />;
      case 'success':
        return <CheckCircle2 size={20} style={{ color: '#10b981' }} />;
      default:
        return <Info size={20} style={{ color: '#3b82f6' }} />;
    }
  };

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div
        className="responsive-hero-banner"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'var(--bg-card, #ffffff)',
          padding: '20px 24px',
          borderRadius: '20px',
          border: '1px solid var(--bdr-light, #e2e8f0)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--clr-primary-600, #3b82f6)',
            }}
          >
            <Bell size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--txt-heading, #0f172a)', margin: 0 }}>
              مركز الإشعارات والتنبيهات
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--txt-body, #64748b)', margin: '4px 0 0' }}>
              متابعة تنبيهات انتهاء الاشتراكات، تعطيل الكروت، والأحداث الهامة
            </p>
          </div>
        </div>

        <div className="responsive-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 700,
                padding: '10px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <CheckCheck size={16} />
              تحديد الكل كمقروء ({unreadCount})
            </button>
          )}

          <button
            type="button"
            onClick={loadNotifications}
            className="hdr-icon-btn"
            style={{ width: '40px', height: '40px' }}
            title="تحديث الإشعارات"
          >
            <RefreshCw size={17} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Filters Bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, marginLeft: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={14} /> تصفية:
        </span>

        {[
          { id: 'all', label: `الكل (${notifications.length})` },
          { id: 'unread', label: `غير المقروءة (${unreadCount})` },
          { id: 'danger', label: 'انتهاء وتعطيل ❌' },
          { id: 'warning', label: 'اقتراب الانتهاء ⏳' },
          { id: 'info', label: 'معلومات وتنبيهات ℹ️' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: filterType === tab.id ? '2px solid var(--clr-primary-500, #3b82f6)' : '1px solid var(--bdr-light, #e2e8f0)',
              backgroundColor: filterType === tab.id ? 'var(--clr-primary-50, #eff6ff)' : 'var(--bg-card, #ffffff)',
              color: filterType === tab.id ? 'var(--clr-primary-900, #1e3a8a)' : 'var(--txt-heading, #334155)',
              fontWeight: filterType === tab.id ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Notifications List ───────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '20px',
          border: '1px solid var(--bdr-light, #e2e8f0)',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>جاري تحميل الإشعارات...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '70px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <Bell size={42} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 6px', color: '#334155', fontWeight: 800, fontSize: '1.1rem' }}>
              لا توجد إشعارات تطابق التصفية
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              جميع الأمور تسير على ما يرام، ولا توجد تنبيهات حالياً في هذا القسم.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((notif, idx) => (
              <div
                key={notif._id}
                onClick={() => handleItemClick(notif)}
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  cursor: 'pointer',
                  backgroundColor: notif.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                  borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--bdr-light, #f1f5f9)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-subtle, #f8fafc)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notif.is_read
                    ? 'transparent'
                    : 'rgba(59, 130, 246, 0.04)';
                }}
              >
                {/* Type Icon Container */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
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
                    marginTop: '2px',
                  }}
                >
                  {renderIcon(notif.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '14.5px',
                          fontWeight: notif.is_read ? 700 : 900,
                          color: 'var(--txt-heading, #0f172a)',
                        }}
                      >
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '13.5px',
                      color: 'var(--txt-body, #475569)',
                      lineHeight: 1.6,
                    }}
                  >
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {notif.link && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: 'var(--clr-primary-600, #3b82f6)',
                        }}
                      >
                        عرض البطاقة المستهدفة <ExternalLink size={13} />
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor:
                          notif.type === 'danger'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : notif.type === 'warning'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(59, 130, 246, 0.1)',
                        color:
                          notif.type === 'danger'
                            ? '#dc2626'
                            : notif.type === 'warning'
                            ? '#d97706'
                            : '#2563eb',
                      }}
                    >
                      {notif.type === 'danger'
                        ? 'انتهاء'
                        : notif.type === 'warning'
                        ? 'تنبيه سنوي'
                        : 'معلومات'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, notif._id)}
                  className="hdr-icon-btn danger"
                  style={{ width: '34px', height: '34px' }}
                  title="حذف الإشعار"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
