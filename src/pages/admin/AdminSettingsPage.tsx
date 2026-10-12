import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services';
import { fmtDate } from '../../types';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Key,
  Sliders,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  LayoutDashboard,
} from 'lucide-react';
import {
  getSidebarConfig,
  fetchSidebarConfigFromApi,
  saveSidebarConfigToApi,
  resetSidebarConfigToApi,
  SidebarNavItemConfig,
  ICON_MAP,
} from '../../utils/sidebarConfig';

/* ── Modern Executive Toast Notification ────────────────────────── */
interface ToastInfo {
  msg: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<{
  info: ToastInfo;
  onClose: () => void;
}> = ({ info, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = info.type === 'success';
  const isError = info.type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        top: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: '#ffffff',
        color: '#0f172a',
        padding: '12px 20px',
        borderRadius: '16px',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.08)',
        borderRight: isSuccess ? '4px solid #10b981' : isError ? '4px solid #ef4444' : '4px solid #3b82f6',
        maxWidth: '90vw',
        minWidth: '320px',
        fontFamily: "'Tajawal', sans-serif",
        direction: 'rtl',
        animation: 'toastPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: isSuccess ? '#dcfce7' : isError ? '#fee2e2' : '#dbeafe',
          color: isSuccess ? '#15803d' : isError ? '#b91c1c' : '#1d4ed8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isSuccess && <CheckCircle2 size={20} />}
        {isError && <AlertCircle size={20} />}
        {!isSuccess && !isError && <RefreshCw size={18} className="spin" />}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
          {isSuccess ? 'عملية ناجحة' : isError ? 'تنبيه' : 'إشعار'}
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#475569', marginTop: '2px' }}>
          {info.msg}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          background: '#f1f5f9',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          width: '26px',
          height: '26px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e2e8f0';
          e.currentTarget.style.color = '#0f172a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
          e.currentTarget.style.color = '#64748b';
        }}
      >
        ✕
      </button>
    </div>
  );
};

export interface AdminSettingsPageProps {
  initialTab?: 'profile' | 'security' | 'menu';
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  initialTab = 'profile',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { admin, updateAdmin, refreshProfile, isSuperAdmin } = useAuth();

  // Active tab state: url query param has precedence, then initialTab
  const queryTab = searchParams.get('tab') as 'profile' | 'security' | 'menu' | null;
  const initialActive =
    (queryTab === 'security' || queryTab === 'profile' || (queryTab === 'menu' && isSuperAdmin))
      ? queryTab
      : initialTab === 'menu' && !isSuperAdmin
      ? 'profile'
      : initialTab;
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'menu'>(initialActive);

  // Redirect away from menu tab if not super admin
  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'menu') {
      setActiveTab('profile');
      setSearchParams({ tab: 'profile' });
    }
  }, [isSuperAdmin, activeTab, setSearchParams]);

  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Tab 1: Profile Form State
  const [profileName, setProfileName] = useState(admin?.name || '');
  const [profileUsername, setProfileUsername] = useState(admin?.username || '');
  const [profileEmail, setProfileEmail] = useState(admin?.email || '');
  const [profileAvatar, setProfileAvatar] = useState(admin?.avatar || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Tab 2: Security & Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Tab 3: Dynamic Sidebar Menu State
  const [sidebarItems, setSidebarItems] = useState<SidebarNavItemConfig[]>(() => getSidebarConfig());
  const [hasMenuChanges, setHasMenuChanges] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuFetching, setMenuFetching] = useState(false);

  // Sync profile fields if admin object loads or updates
  useEffect(() => {
    if (admin) {
      setProfileName(admin.name || '');
      setProfileUsername(admin.username || '');
      setProfileEmail(admin.email || '');
      setProfileAvatar(admin.avatar || '');
    }
  }, [admin]);

  // Fetch latest menu settings from API when switching to the menu tab
  useEffect(() => {
    if (activeTab === 'menu') {
      setMenuFetching(true);
      fetchSidebarConfigFromApi()
        .then((items) => {
          setSidebarItems(items);
        })
        .finally(() => {
          setMenuFetching(false);
        });
    }
  }, [activeTab]);

  const handleTabChange = (tab: 'profile' | 'security' | 'menu') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  /* ── 3. Menu Reorder & Visibility Handlers (API Driven) ───────── */
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sidebarItems.length) return;

    const updated = [...sidebarItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setSidebarItems(updated);
    setHasMenuChanges(true);
  };

  const handleMoveToExtremity = (index: number, position: 'top' | 'bottom') => {
    if (position === 'top' && index === 0) return;
    if (position === 'bottom' && index === sidebarItems.length - 1) return;

    const updated = [...sidebarItems];
    const [moved] = updated.splice(index, 1);
    if (position === 'top') {
      updated.unshift(moved);
    } else {
      updated.push(moved);
    }

    setSidebarItems(updated);
    setHasMenuChanges(true);
  };

  const handleToggleVisibility = (index: number) => {
    const updated = [...sidebarItems];
    const current = updated[index];
    const newVisible = !current.visible;

    // At least one item must remain visible
    const visibleCount = updated.filter((item, i) => i === index ? newVisible : item.visible).length;
    if (visibleCount === 0) {
      setToast({ msg: 'يجب أن يبقى عنصر واحد على الأقل ظاهراً في القائمة الجانبية', type: 'error' });
      return;
    }

    updated[index] = { ...current, visible: newVisible };
    setSidebarItems(updated);
    setHasMenuChanges(true);
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    const updated = [...sidebarItems];
    updated[index] = { ...updated[index], label: newLabel };
    setSidebarItems(updated);
    setHasMenuChanges(true);
  };

  const handleSaveMenuConfig = async () => {
    setMenuLoading(true);
    try {
      const saved = await saveSidebarConfigToApi(sidebarItems);
      setSidebarItems(saved);
      setHasMenuChanges(false);
      setToast({ msg: 'تم حفظ وتطبيق إعدادات وترتيب القائمة عبر الـ API بنجاح!', type: 'success' });
    } catch (err: any) {
      setToast({ msg: err?.message || 'حدث خطأ أثناء حفظ القائمة على الخادم', type: 'error' });
    } finally {
      setMenuLoading(false);
    }
  };

  const handleResetMenuConfig = async () => {
    setMenuLoading(true);
    try {
      const def = await resetSidebarConfigToApi();
      setSidebarItems(def);
      setHasMenuChanges(false);
      setToast({ msg: 'تمت استعادة الترتيب الافتراضي للقائمة وتحديثه على الخادم بنجاح', type: 'info' });
    } catch (err: any) {
      setToast({ msg: err?.message || 'حدث خطأ أثناء استعادة الترتيب الافتراضي', type: 'error' });
    } finally {
      setMenuLoading(false);
    }
  };

  /* ── 1. Submit Profile ────────────────────────────────────────── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUsername.trim()) {
      setToast({ msg: 'اسم المستخدم مطلوب', type: 'error' });
      return;
    }
    if (profileUsername.trim().length < 3) {
      setToast({ msg: 'اسم المستخدم يجب ألا يقل عن 3 أحرف', type: 'error' });
      return;
    }

    setProfileLoading(true);
    try {
      const updated = await authApi.updateProfile({
        name: profileName.trim(),
        username: profileUsername.trim(),
        email: profileEmail.trim(),
        avatar: profileAvatar.trim(),
      });
      updateAdmin(updated);
      setToast({ msg: 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح', type: 'success' });
    } catch (err: any) {
      setToast({
        msg: err?.message || 'حدث خطأ أثناء حفظ التعديلات',
        type: 'error',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── 2. Submit Change Password ───────────────────────────────── */
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setToast({ msg: 'يرجى إدخال كلمة المرور الحالية', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({
        msg: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف',
        type: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({
        msg: 'كلمة المرور الجديدة وتأكيدها غير متطابقين',
        type: 'error',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setToast({
        msg: res.message || 'تم تحديث كلمة المرور بنجاح',
        type: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setToast({
        msg: err?.message || 'تعذر تغيير كلمة المرور',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      {toast && <Toast info={toast} onClose={() => setToast(null)} />}

      {/* ── Executive Hero Profile Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', position: 'relative', zIndex: 1 }}>
          {/* Avatar with luxury ring & active badge */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                padding: '3px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt="Avatar"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={38} color="#94a3b8" />
                )}
              </div>
            </div>
            {/* Live active dot */}
            <span
              title="الحساب متصل ونشط"
              style={{
                position: 'absolute',
                bottom: '2px',
                left: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '3px solid #0f172a',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.3px',
                }}
              >
                {admin?.name || admin?.username || 'مدير النظام'}
              </h2>
              <span
                style={{
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(99, 102, 241, 0.25)',
                  border: '1px solid rgba(129, 140, 248, 0.35)',
                  color: '#c7d2fe',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <ShieldCheck size={13} color="#818cf8" />
                مسؤول رئيسي
              </span>
            </div>

            <p
              style={{
                margin: '6px 0 0',
                fontSize: '0.875rem',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>@{admin?.username || 'admin'}</span>
              {admin?.email && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={13} color="#64748b" />
                  {admin.email}
                </span>
              )}
              {admin?.createdAt && (
                <span style={{ color: '#64748b' }}>
                  عضو منذ {fmtDate(admin.createdAt)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={() => {
              refreshProfile();
              setToast({ msg: 'تم تحديث بيانات البروفايل من الخادم', type: 'info' });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            }}
          >
            <RefreshCw size={15} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* ── Segmented Tab Switcher (Profile & Security only) ── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: '#f1f5f9',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'profile' ? 700 : 600,
            color: activeTab === 'profile' ? '#4338ca' : '#64748b',
            backgroundColor: activeTab === 'profile' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'profile' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.2s ease',
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          <User size={17} color={activeTab === 'profile' ? '#4f46e5' : '#64748b'} />
          <span>الملف الشخصي</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'security' ? 700 : 600,
            color: activeTab === 'security' ? '#4338ca' : '#64748b',
            backgroundColor: activeTab === 'security' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'security' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.2s ease',
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          <Lock size={17} color={activeTab === 'security' ? '#4f46e5' : '#64748b'} />
          <span>كلمة المرور والأمان</span>
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => handleTabChange('menu')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'menu' ? 700 : 600,
              color: activeTab === 'menu' ? '#4338ca' : '#64748b',
              backgroundColor: activeTab === 'menu' ? '#ffffff' : 'transparent',
              boxShadow: activeTab === 'menu' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease',
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            <Sliders size={17} color={activeTab === 'menu' ? '#4f46e5' : '#64748b'} />
            <span>إعدادات القائمة</span>
          </button>
        )}
      </div>

      {/* ── Tab 1: Profile ── */}
      {activeTab === 'profile' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#eef2ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
              }}
            >
              <User size={22} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                بيانات الحساب الشخصي
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                تعديل اسمك، اسم الدخول، بريدك الإلكتروني والصورة الرمزية الحسابية.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Full Name */}
              <div>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  className="input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="مثال: عبد الله رابح"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                />
              </div>

              {/* Username */}
              <div>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  اسم المستخدم (تسجيل الدخول) *
                </label>
                <input
                  type="text"
                  className="input"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  placeholder="admin"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    direction: 'ltr',
                    textAlign: 'right',
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className="input"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="admin@smartcard.com"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    direction: 'ltr',
                    textAlign: 'right',
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  رابط الصورة الرمزية (Avatar URL)
                </label>
                <input
                  type="url"
                  className="input"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    direction: 'ltr',
                    textAlign: 'right',
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Avatar live preview box */}
            {profileAvatar && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 18px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <img
                  src={profileAvatar}
                  alt="Avatar Preview"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #818cf8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>
                    معاينة الصورة المختارة
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    تأكد من ظهور الصورة بشكل لائق وواضح في الدائرة.
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={profileLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minWidth: '150px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: profileLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Tajawal', sans-serif",
                  opacity: profileLoading ? 0.75 : 1,
                }}
              >
                {profileLoading ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>حفظ التعديلات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab 2: Security & Password ── */}
      {activeTab === 'security' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <Key size={22} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                تغيير كلمة المرور
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                احرص على استخدام كلمة مرور قوية تحتوي على أحرف وأرقام لحماية حساب الإدارة.
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>
            {/* Current password */}
            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                كلمة المرور الحالية *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    paddingLeft: '44px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    direction: 'ltr',
                    textAlign: 'right',
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                كلمة المرور الجديدة *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="لا تقل عن 6 أحرف"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    paddingLeft: '44px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    direction: 'ltr',
                    textAlign: 'right',
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                تأكيد كلمة المرور الجديدة *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="إعادة إدخال كلمة المرور"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    paddingLeft: '44px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    direction: 'ltr',
                    textAlign: 'right',
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: '#eff6ff',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                fontSize: '0.85rem',
                color: '#1e40af',
              }}
            >
              <ShieldAlert size={20} style={{ flexShrink: 0, color: '#2563eb' }} />
              <span>عند تغيير كلمة المرور بنجاح، ستستمر جلستك الحالية دون انقطاع، وسيتم استخدام كلمة المرور الجديدة عند الدخول لاحقاً.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minWidth: '160px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Tajawal', sans-serif",
                  opacity: passwordLoading ? 0.75 : 1,
                }}
              >
                {passwordLoading ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>تحديث كلمة المرور</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab 3: Dynamic Menu Settings ── */}
      {isSuperAdmin && activeTab === 'menu' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sliders size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  تخصيص القائمة الجانبية (Sidebar)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                  تحكّم في العناصر التي تظهر في الشريط الجانبي، غيّر ترتيبها (الأول، الثاني، الأخير...)، أو قم بإخفاء أي عنصر.
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleResetMenuConfig}
                disabled={menuLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: menuLoading ? 'not-allowed' : 'pointer',
                  opacity: menuLoading ? 0.6 : 1,
                  transition: 'all 0.15s ease',
                  fontFamily: "'Tajawal', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (!menuLoading) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!menuLoading) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
              >
                <RotateCcw size={15} />
                <span>استعادة الافتراضي</span>
              </button>

              <button
                type="button"
                onClick={handleSaveMenuConfig}
                disabled={menuLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: menuLoading ? 'not-allowed' : 'pointer',
                  opacity: menuLoading ? 0.75 : 1,
                  boxShadow: hasMenuChanges ? '0 4px 14px rgba(79, 70, 229, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                  fontFamily: "'Tajawal', sans-serif",
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!menuLoading) e.currentTarget.style.backgroundColor = '#4338ca';
                }}
                onMouseLeave={(e) => {
                  if (!menuLoading) e.currentTarget.style.backgroundColor = '#4f46e5';
                }}
              >
                {menuLoading ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
                <span>{menuLoading ? 'جاري الحفظ بالخادم...' : 'حفظ الترتيب (API)'}</span>
                {hasMenuChanges && !menuLoading && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#38bdf8',
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                    }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Info & Stats Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
              {menuFetching ? (
                <>
                  <RefreshCw size={18} className="spin" color="#6366f1" />
                  <span>جاري مزامنة أحدث إعدادات القائمة من الخادم (API)...</span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} color="#6366f1" />
                  <span>
                    التعديلات تُحفظ وتتزامن سحابياً عبر الـ API بمجرد الضغط على <strong>حفظ الترتيب (API)</strong>.
                  </span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                <Check size={13} />
                الظاهرة: {sidebarItems.filter((i) => i.visible).length}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                <EyeOff size={13} />
                المخفية: {sidebarItems.filter((i) => !i.visible).length}
              </span>
            </div>
          </div>

          {/* Menu Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sidebarItems.map((item, index) => {
              const IconComp = ICON_MAP[item.iconName] || LayoutDashboard;
              const isFirst = index === 0;
              const isLast = index === sidebarItems.length - 1;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    backgroundColor: item.visible ? '#ffffff' : '#f8fafc',
                    border: item.visible ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                    boxShadow: item.visible ? '0 2px 6px rgba(15, 23, 42, 0.03)' : 'none',
                    opacity: item.visible ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Left (RTL Start): Order Badge & Icon & Title/Path */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                    {/* Position Badge */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: item.visible ? '#e0e7ff' : '#e2e8f0',
                        color: item.visible ? '#4338ca' : '#64748b',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Icon Box */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: item.visible ? '#f1f5f9' : '#e2e8f0',
                        color: item.visible ? '#0f172a' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {IconComp && <IconComp size={20} />}
                    </div>

                    {/* Item Name Input & Path */}
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleLabelChange(index, e.target.value)}
                          placeholder={item.defaultLabel}
                          style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            backgroundColor: '#ffffff',
                            width: '100%',
                            maxWidth: '220px',
                            fontFamily: "'Tajawal', sans-serif",
                          }}
                        />
                        {item.label !== item.defaultLabel && (
                          <span
                            title={`الاسم الأصلي: ${item.defaultLabel}`}
                            style={{
                              fontSize: '0.72rem',
                              color: '#64748b',
                              backgroundColor: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            معدل
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', direction: 'ltr', display: 'inline-block' }}>
                        {item.path}
                      </span>
                    </div>
                  </div>

                  {/* Right (RTL End): Controls (Ordering & Visibility) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(index)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        border: item.visible ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        backgroundColor: item.visible ? '#f0fdf4' : '#f1f5f9',
                        color: item.visible ? '#166534' : '#64748b',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontFamily: "'Tajawal', sans-serif",
                      }}
                      title={item.visible ? 'إخفاء من القائمة' : 'إظهار في القائمة'}
                    >
                      {item.visible ? (
                        <>
                          <Eye size={15} color="#16a34a" />
                          <span>ظاهر</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={15} color="#94a3b8" />
                          <span>مخفي</span>
                        </>
                      )}
                    </button>

                    {/* Order Control Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f1f5f9',
                        padding: '3px',
                        borderRadius: '9px',
                        gap: '3px',
                      }}
                    >
                      {/* Move to Top */}
                      <button
                        type="button"
                        onClick={() => handleMoveToExtremity(index, 'top')}
                        disabled={isFirst}
                        title="جعله أول عنصر"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isFirst ? 'transparent' : '#ffffff',
                          color: isFirst ? '#cbd5e1' : '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: isFirst ? 'not-allowed' : 'pointer',
                          boxShadow: isFirst ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                          fontFamily: "'Tajawal', sans-serif",
                          transition: 'all 0.1s ease',
                        }}
                      >
                        الأول
                      </button>

                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, 'up')}
                        disabled={isFirst}
                        title="تحريك لأعلى"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '30px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isFirst ? 'transparent' : '#ffffff',
                          color: isFirst ? '#cbd5e1' : '#334155',
                          cursor: isFirst ? 'not-allowed' : 'pointer',
                          boxShadow: isFirst ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        <ArrowUp size={15} />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, 'down')}
                        disabled={isLast}
                        title="تحريك لأسفل"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '30px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isLast ? 'transparent' : '#ffffff',
                          color: isLast ? '#cbd5e1' : '#334155',
                          cursor: isLast ? 'not-allowed' : 'pointer',
                          boxShadow: isLast ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        <ArrowDown size={15} />
                      </button>

                      {/* Move to Bottom */}
                      <button
                        type="button"
                        onClick={() => handleMoveToExtremity(index, 'bottom')}
                        disabled={isLast}
                        title="جعله آخر عنصر"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isLast ? 'transparent' : '#ffffff',
                          color: isLast ? '#cbd5e1' : '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: isLast ? 'not-allowed' : 'pointer',
                          boxShadow: isLast ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                          fontFamily: "'Tajawal', sans-serif",
                          transition: 'all 0.1s ease',
                        }}
                      >
                        الأخير
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Save Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid #f1f5f9',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: hasMenuChanges ? '#b45309' : '#64748b', fontWeight: 600 }}>
              {hasMenuChanges ? '⚠️ لديك تعديلات غير محفوظة في ترتيب القائمة' : '✓ كافة الإعدادات والترتيبات محفوظة حالياً'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleResetMenuConfig}
                disabled={menuLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: menuLoading ? 'not-allowed' : 'pointer',
                  opacity: menuLoading ? 0.6 : 1,
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                <RotateCcw size={16} />
                <span>استعادة الافتراضي</span>
              </button>

              <button
                type="button"
                onClick={handleSaveMenuConfig}
                disabled={menuLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: menuLoading ? 'not-allowed' : 'pointer',
                  opacity: menuLoading ? 0.75 : 1,
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                {menuLoading ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                <span>{menuLoading ? 'جاري الحفظ على الخادم...' : 'حفظ إعدادات القائمة (API)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

