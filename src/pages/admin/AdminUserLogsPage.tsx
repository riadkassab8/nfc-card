import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  Search,
  RefreshCw,
  Download,
  Clock,
  User,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { userLogsApi } from '../../services';
import { ApiUserLog, ApiUserLogsStats } from '../../types';

export const AdminUserLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ApiUserLog[]>([]);
  const [stats, setStats] = useState<ApiUserLogsStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedActionType, setSelectedActionType] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // all | today | 7d | 30d

  // Inspect Modal
  const [selectedLog, setSelectedLog] = useState<ApiUserLog | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper date calculations
  const getDateRangeParams = useCallback(() => {
    if (dateRange === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      return { from_date: today, to_date: today };
    }
    if (dateRange === '7d') {
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const to = new Date().toISOString().slice(0, 10);
      return { from_date: from, to_date: to };
    }
    if (dateRange === '30d') {
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const to = new Date().toISOString().slice(0, 10);
      return { from_date: from, to_date: to };
    }
    return {};
  }, [dateRange]);

  // Load logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const dateParams = getDateRangeParams();
      const res = await userLogsApi.getLogs({
        page,
        limit: 25,
        search: search.trim() || undefined,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        action_type: selectedActionType !== 'all' ? selectedActionType : undefined,
        ...dateParams,
      });

      setLogs(res.logs || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحميل سجلات المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedRole, selectedActionType, getDateRangeParams]);

  // Load stats
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await userLogsApi.getStats();
      setStats(res);
    } catch {
      // stats error fallback
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, []);

  // Format seconds to Arabic duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return 'أقل من ثانية';
    if (seconds < 60) return `${seconds} ثانية`;
    const minutes = Math.floor(seconds / 60);
    const remainingSec = seconds % 60;
    if (minutes < 60) {
      return remainingSec > 0 ? `${minutes} د و ${remainingSec} ث` : `${minutes} دقيقة`;
    }
    const hours = Math.floor(minutes / 60);
    const remMin = minutes % 60;
    return `${hours} س و ${remMin} د`;
  };

  // Format date
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Render role badge
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span style={{ padding: '3px 9px', borderRadius: '6px', backgroundColor: '#eef2ff', color: '#4338ca', fontSize: '0.74rem', fontWeight: 800 }}>
            مدير رئيسي
          </span>
        );
      case 'merchant':
        return (
          <span style={{ padding: '3px 9px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#047857', fontSize: '0.74rem', fontWeight: 800 }}>
            صاحب محل
          </span>
        );
      default:
        return (
          <span style={{ padding: '3px 9px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.74rem', fontWeight: 800 }}>
            موظف
          </span>
        );
    }
  };

  // Render action badge
  const renderActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#059669', fontSize: '0.74rem', fontWeight: 800 }}>تسجيل دخول</span>;
      case 'logout':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.74rem', fontWeight: 800 }}>تسجيل خروج</span>;
      case 'create':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '0.74rem', fontWeight: 800 }}>إنشاء عنصر</span>;
      case 'update':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#fefce8', color: '#ca8a04', fontSize: '0.74rem', fontWeight: 800 }}>تعديل بيانات</span>;
      case 'delete':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '0.74rem', fontWeight: 800 }}>حذف عنصر</span>;
      case 'export':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '0.74rem', fontWeight: 800 }}>تصدير إكسيل</span>;
      case 'page_stay':
      case 'page_view':
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.74rem', fontWeight: 800 }}>تصفح صفحة</span>;
    }
  };

  // Export CSV for Excel with UTF-8 BOM
  const handleExportCSV = () => {
    if (logs.length === 0) {
      showToast('لا توجد سجلات لتصديرها حالياً', 'info');
      return;
    }

    const headers = [
      'اسم المستخدم',
      'الاسم الكامل',
      'الدور',
      'نوع الأكشن',
      'الإجراء المنفذ',
      'الصفحة المزارة',
      'الرابط',
      'المدة المستغرقة',
      'عنوان IP',
      'التاريخ والوقت',
    ];

    const rows = logs.map((log) => [
      `"${log.username}"`,
      `"${log.user_name || ''}"`,
      `"${log.role}"`,
      `"${log.action_type}"`,
      `"${log.action_name.replace(/"/g, '""')}"`,
      `"${(log.page_title || '').replace(/"/g, '""')}"`,
      `"${log.page_url}"`,
      `"${formatDuration(log.duration_seconds)}"`,
      `"${log.ip_address || ''}"`,
      `"${formatDateTime(log.createdAt)}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('تم تصدير سجل المستخدمين بنجاح!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Tajawal', sans-serif" }} dir="rtl">
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#ffffff',
            color: '#0f172a',
            padding: '12px 22px',
            borderRadius: '16px',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            borderRight: toast.type === 'success' ? '4px solid #10b981' : toast.type === 'error' ? '4px solid #ef4444' : '4px solid #3b82f6',
            direction: 'rtl',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
          {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
          {toast.type === 'info' && <RefreshCw size={18} color="#3b82f6" />}
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{toast.msg}</span>
        </div>
      )}

      {/* ── Header Banner ── */}
      <div
        className="responsive-hero-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
            }}
          >
            <Activity size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
                سجل نشاط وتتبع المستخدمين
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 9px',
                  borderRadius: '999px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontWeight: 800,
                  border: '1px solid #fecaca',
                }}
              >
                خاص بالمدير الرئيسي فقط
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
              تتبع شامل لتحركات المستخدمين، الصفحات المفتوحة، الوقت المستغرق في كل صفحة والإجراءات المنفذة لحظة بلحظة.
            </p>
          </div>
        </div>

        <div className="responsive-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1.5px solid #bbf7d0',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={16} />
            <span>تصدير إلى Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadLogs();
              loadStats();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1.5px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '16px' }}>
        {/* Card 1: Today Actions */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px 22px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>حركات اليوم</span>
            <h3 style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {statsLoading ? '—' : stats?.total_today || 0}
            </h3>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px 22px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>المستخدمين النشطين اليوم</span>
            <h3 style={{ margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
              {statsLoading ? '—' : stats?.active_users_today || 0}
            </h3>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={22} />
          </div>
        </div>

        {/* Card 3: Average Duration */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px 22px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>متوسط وقت البقاء بالصفحة</span>
            <h3 style={{ margin: '6px 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#d97706' }}>
              {statsLoading ? '—' : formatDuration(stats?.avg_duration_today_seconds)}
            </h3>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Card 4: Most Visited Page */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px 22px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>أكثر صفحة زيارة اليوم</span>
            <h4 style={{ margin: '6px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#2563eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {statsLoading ? '—' : stats?.top_page_today?.page_title || '—'}
            </h4>
            {stats?.top_page_today?.count ? (
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>({stats.top_page_today.count} زيارة)</span>
            ) : null}
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search & Filters ── */}
      <div
        className="responsive-filter-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div className="responsive-filter-search" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="بحث بالاسم، اسم المستخدم، الصفحة، الإجراء، أو IP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                paddingRight: '40px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                fontFamily: "'Tajawal', sans-serif",
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div className="responsive-filter-pills" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>الدور:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                fontFamily: "'Tajawal', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="all">جميع الأدوار</option>
              <option value="super_admin">مدير رئيسي</option>
              <option value="staff">موظف</option>
              <option value="merchant">صاحب محل</option>
            </select>
          </div>

          {/* Action Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>نوع الإجراء:</span>
            <select
              value={selectedActionType}
              onChange={(e) => {
                setSelectedActionType(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                fontFamily: "'Tajawal', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="all">جميع الإجراءات</option>
              <option value="page_view">تصفح الصفحات</option>
              <option value="login">تسجيل الدخول</option>
              <option value="logout">تسجيل الخروج</option>
              <option value="create">إنشاء عنصر</option>
              <option value="update">تعديل بيانات</option>
              <option value="delete">حذف عنصر</option>
              <option value="export">تصدير إكسيل</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>الفترة:</span>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                fontFamily: "'Tajawal', sans-serif",
                cursor: 'pointer',
              }}
            >
              <option value="all">كل الفترات</option>
              <option value="today">اليوم فقط</option>
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوماً</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Activity Table ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div className="data-table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>المستخدم</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>الإجراء المنفذ</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>الصفحة المزارة</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>المدة المستغرقة</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>عنوان IP / المتصفح</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>التاريخ والوقت</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', color: '#4f46e5' }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>جاري جلب سجلات النشاط...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Activity size={40} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#64748b' }}>
                      لا توجد سجلات نشاط مطابقة للبحث أو الفلتر
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isLongStay = log.duration_seconds >= 60;
                  return (
                    <tr
                      key={log._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fbff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      {/* User Info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              backgroundColor: '#e0e7ff',
                              color: '#4338ca',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              flexShrink: 0,
                            }}
                          >
                            {(log.user_name || log.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              {log.user_name || log.username}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.76rem', color: '#64748b', direction: 'ltr', display: 'inline-block' }}>
                                @{log.username}
                              </span>
                              {renderRoleBadge(log.role)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem' }}>
                            {log.action_name}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            {renderActionBadge(log.action_type)}
                          </div>
                        </div>
                      </td>

                      {/* Visited Page */}
                      <td style={{ padding: '16px 20px' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', display: 'block' }}>
                            {log.page_title || 'صفحة النظام'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              color: '#6366f1',
                              direction: 'ltr',
                              display: 'inline-block',
                              fontFamily: 'monospace',
                              backgroundColor: '#f5f3ff',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              marginTop: '2px',
                            }}
                          >
                            {log.page_url}
                          </span>
                        </div>
                      </td>

                      {/* Duration Time Spent */}
                      <td style={{ padding: '16px 20px' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            backgroundColor: isLongStay ? '#eff6ff' : '#f8fafc',
                            border: isLongStay ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            color: isLongStay ? '#1d4ed8' : '#64748b',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                          }}
                        >
                          <Clock size={12} color={isLongStay ? '#2563eb' : '#94a3b8'} />
                          <span>{formatDuration(log.duration_seconds)}</span>
                        </div>
                      </td>

                      {/* IP / Device */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 700, direction: 'ltr', display: 'inline-block' }}>
                            {log.ip_address || '—'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#94a3b8',
                              maxWidth: '180px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              direction: 'ltr',
                            }}
                            title={log.user_agent}
                          >
                            {log.user_agent || 'المتصفح غير مسجل'}
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#64748b' }}>
                        {formatDateTime(log.createdAt)}
                      </td>

                      {/* Inspect Details Button */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          title="عرض التفاصيل الكاملة"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#4f46e5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              عرض الصفحة {page} من {totalPages} (إجمالي {total} نشاط مسجل)
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: page <= 1 ? '#f1f5f9' : '#ffffff',
                  color: page <= 1 ? '#94a3b8' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ChevronRight size={14} /> السابق
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: page >= totalPages ? '#f1f5f9' : '#ffffff',
                  color: page >= totalPages ? '#94a3b8' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                التالي <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Log Details Inspect Modal ── */}
      {selectedLog &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '16px',
            }}
            onClick={() => setSelectedLog(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '620px',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
                fontFamily: "'Tajawal', sans-serif",
                direction: 'rtl',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      تفاصيل النشاط المسجل
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {formatDateTime(selectedLog.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
                {/* User Block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>المستخدم</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginTop: '2px' }}>
                      {selectedLog.user_name || selectedLog.username} (@{selectedLog.username})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>الدور الصلاحيات</span>
                    <div style={{ marginTop: '2px' }}>{renderRoleBadge(selectedLog.role)}</div>
                  </div>
                </div>

                {/* Action Block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>الإجراء المنفذ</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginTop: '2px' }}>
                      {selectedLog.action_name}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>نوع الحركة</span>
                    <div style={{ marginTop: '2px' }}>{renderActionBadge(selectedLog.action_type)}</div>
                  </div>
                </div>

                {/* Page & Duration Block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>الصفحة والرابط</span>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', marginTop: '2px' }}>
                      {selectedLog.page_title || '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6366f1', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right' }}>
                      {selectedLog.page_url}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>مدة البقاء في الصفحة</span>
                    <div style={{ fontWeight: 800, color: '#d97706', fontSize: '0.95rem', marginTop: '2px' }}>
                      {formatDuration(selectedLog.duration_seconds)}
                    </div>
                  </div>
                </div>

                {/* Tech Info */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>عنوان IP: </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', direction: 'ltr', display: 'inline-block' }}>
                      {selectedLog.ip_address || 'غير متوفر'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>المتصفح والجهاز: </span>
                    <span style={{ fontSize: '0.78rem', color: '#334155', direction: 'ltr', display: 'inline-block' }}>
                      {selectedLog.user_agent || 'غير متوفر'}
                    </span>
                  </div>
                </div>

                {/* Details Payload */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      بيانات إضافية (Metadata Payload):
                    </span>
                    <pre
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#38bdf8',
                        padding: '12px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        overflowX: 'auto',
                        direction: 'ltr',
                        margin: 0,
                      }}
                    >
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '10px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AdminUserLogsPage;
