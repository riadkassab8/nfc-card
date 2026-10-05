import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services';
import { fmtDate, AdminSettings } from '../../types';
import {
  User,
  Lock,
  Settings,
  Bell,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  Key,
  Sparkles,
  Check,
} from 'lucide-react';

/* ── Toast notification ────────────────────────────────────────── */
interface ToastInfo {
  msg: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<{
  info: ToastInfo;
  onClose: () => void;
}> = ({ info, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const cls =
    info.type === 'success'
      ? 'toast-success'
      : info.type === 'error'
      ? 'toast-error'
      : 'toast-info';

  return (
    <div
      className={`toast ${cls}`}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
        padding: '14px 20px',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: 600,
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      {info.type === 'success' && <CheckCircle2 size={18} />}
      {info.type === 'error' && <AlertCircle size={18} />}
      {info.type === 'info' && <RefreshCw size={18} />}
      <span style={{ flex: 1 }}>{info.msg}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          fontSize: '1rem',
          padding: '0 4px',
        }}
      >
        ✕
      </button>
    </div>
  );
};

export interface AdminSettingsPageProps {
  initialTab?: 'profile' | 'security' | 'platform';
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  initialTab = 'profile',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { admin, updateAdmin, refreshProfile } = useAuth();

  // Active tab state: url query param has precedence, then initialTab
  const queryTab = searchParams.get('tab') as 'profile' | 'security' | 'platform' | null;
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'platform'>(
    queryTab || initialTab
  );

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

  // Tab 3: Platform Settings State
  const [platformSettings, setPlatformSettings] = useState<AdminSettings>({
    platform_name: 'Smart Card QR',
    support_email: '',
    support_phone: '',
    default_redirect_base_url: '',
    enable_email_alerts: true,
  });
  const [settingsFetching, setSettingsFetching] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Sync profile fields if admin object loads or updates
  useEffect(() => {
    if (admin) {
      setProfileName(admin.name || '');
      setProfileUsername(admin.username || '');
      setProfileEmail(admin.email || '');
      setProfileAvatar(admin.avatar || '');
    }
  }, [admin]);

  // Load platform settings on mount or when switching to platform tab
  const fetchSettings = async () => {
    setSettingsFetching(true);
    try {
      const data = await authApi.getSettings();
      if (data) {
        setPlatformSettings({
          platform_name: data.platform_name || 'Smart Card QR',
          support_email: data.support_email || '',
          support_phone: data.support_phone || '',
          default_redirect_base_url: data.default_redirect_base_url || '',
          enable_email_alerts: data.enable_email_alerts ?? true,
        });
      }
    } catch {
      setToast({ msg: 'تعذر جلب إعدادات المنصة', type: 'error' });
    } finally {
      setSettingsFetching(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTabChange = (tab: 'profile' | 'security' | 'platform') => {
    setActiveTab(tab);
    setSearchParams({ tab });
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
      setToast({ msg: 'تم تحديث بيانات الملف الشخصي بنجاح', type: 'success' });
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
        msg: res.message || 'تم تغيير كلمة المرور بنجاح',
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

  /* ── 3. Submit Platform Settings ─────────────────────────────── */
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      const updated = await authApi.updateSettings({
        platform_name: platformSettings.platform_name?.trim(),
        support_email: platformSettings.support_email?.trim(),
        support_phone: platformSettings.support_phone?.trim(),
        default_redirect_base_url: platformSettings.default_redirect_base_url?.trim(),
        enable_email_alerts: platformSettings.enable_email_alerts,
      });
      setPlatformSettings(updated);
      setToast({ msg: 'تم حفظ إعدادات المنصة بنجاح', type: 'success' });
    } catch (err: any) {
      setToast({
        msg: err?.message || 'حدث خطأ أثناء حفظ الإعدادات',
        type: 'error',
      });
    } finally {
      setSettingsLoading(false);
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
              fetchSettings();
              setToast({ msg: 'تم تحديث البيانات من الخادم فوراً', type: 'info' });
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

      {/* ── Segmented Tab Switcher ── */}
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

        <button
          type="button"
          onClick={() => handleTabChange('platform')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'platform' ? 700 : 600,
            color: activeTab === 'platform' ? '#4338ca' : '#64748b',
            backgroundColor: activeTab === 'platform' ? '#ffffff' : 'transparent',
            boxShadow: activeTab === 'platform' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.2s ease',
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          <Settings size={17} color={activeTab === 'platform' ? '#4f46e5' : '#64748b'} />
          <span>إعدادات المنصة</span>
        </button>
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

      {/* ── Tab 3: Platform Settings ── */}
      {activeTab === 'platform' && (
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
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <Settings size={22} />
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
                إعدادات المنصة العامة
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                التحكم في اسم المنصة، معلومات الدعم، التوجيه الافتراضي وتنبيهات النظام.
              </p>
            </div>
          </div>

          {settingsFetching ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={28} className="spin" style={{ margin: '0 auto 14px', color: '#4f46e5' }} />
              <div style={{ fontWeight: 600 }}>جاري تحميل إعدادات المنصة...</div>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Platform Name */}
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                    اسم المنصة
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={platformSettings.platform_name || ''}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({ ...prev, platform_name: e.target.value }))
                    }
                    placeholder="Smart Card QR"
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

                {/* Support Email */}
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                    بريد الدعم الفني
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={platformSettings.support_email || ''}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({ ...prev, support_email: e.target.value }))
                    }
                    placeholder="support@smartcard.com"
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

                {/* Support Phone */}
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                    رقم هاتف / واتساب الدعم
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={platformSettings.support_phone || ''}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({ ...prev, support_phone: e.target.value }))
                    }
                    placeholder="+201000000000"
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

                {/* Default Base URL */}
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#334155' }}>
                    الرابط الافتراضي للتحويل (Default Base URL)
                  </label>
                  <input
                    type="url"
                    className="input"
                    value={platformSettings.default_redirect_base_url || ''}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        default_redirect_base_url: e.target.value,
                      }))
                    }
                    placeholder="https://mysmartcard.com"
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

              {/* Email Alerts Toggle Switch Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: platformSettings.enable_email_alerts ? '#eff6ff' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: platformSettings.enable_email_alerts ? '#3b82f6' : '#94a3b8',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Bell size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      تفعيل التنبيهات البريدية
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      استلام إشعارات فورية عبر البريد عند حدوث عمليات هامة أو انتهاء فترات اشتراكات البطاقات.
                    </div>
                  </div>
                </div>

                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '52px',
                    height: '28px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={platformSettings.enable_email_alerts ?? true}
                    onChange={(e) =>
                      setPlatformSettings((prev) => ({
                        ...prev,
                        enable_email_alerts: e.target.checked,
                      }))
                    }
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: platformSettings.enable_email_alerts
                        ? '#4f46e5'
                        : '#cbd5e1',
                      borderRadius: '34px',
                      transition: '0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: '22px',
                        width: '22px',
                        left: platformSettings.enable_email_alerts ? '27px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        transition: '0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={settingsLoading}
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
                    cursor: settingsLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Tajawal', sans-serif",
                    opacity: settingsLoading ? 0.75 : 1,
                  }}
                >
                  {settingsLoading ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>حفظ إعدادات المنصة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

