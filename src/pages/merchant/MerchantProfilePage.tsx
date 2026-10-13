/* ==========================================================================
   MERCHANT PROFILE PAGE  /merchant/profile
   Profile management & password reset for store owners.
   ========================================================================== */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services';
import {
  User, Lock, Store, Mail, Phone, ShieldCheck, CheckCircle2,
  AlertCircle, Eye, EyeOff, Save, RefreshCw, KeyRound, Clock, Sparkles
} from 'lucide-react';

export const MerchantProfilePage: React.FC = () => {
  const { admin, updateAdmin } = useAuth();

  // تفاصيل اشتراك المتجر
  const isPermanent = !admin?.requires_subscription || admin?.subscription_type === 'permanent';
  const subStartDate = admin?.subscription_start_date ? new Date(admin.subscription_start_date) : null;
  const subEndDate = admin?.subscription_end_date ? new Date(admin.subscription_end_date) : null;
  const now = new Date();
  const diffDays = subEndDate ? Math.ceil((subEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const startDateFormatted = subStartDate ? subStartDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const endDateFormatted = subEndDate ? subEndDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  // Profile Form state
  const [name, setName] = useState(admin?.name || '');
  const [storeName, setStoreName] = useState(admin?.store_name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [phone, setPhone] = useState(admin?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Submit Profile
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updated = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        store_name: storeName.trim(),
      });
      updateAdmin(updated);
      showToast('تم حفظ وتحديث بيانات المتجر بنجاح!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'فشل تحديث البيانات الشخصية', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('يرجى إدخال كلمة المرور الحالية', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast(res.message || 'تم تحديث كلمة المرور بنجاح', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err?.message || 'تعذر تغيير كلمة المرور، تأكد من صحة الحالية', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="merchant-profile-container">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#065f46' : '#991b1b',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className="merchant-profile-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div
          className="merchant-profile-header-avatar"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: '#ecfdf5',
            border: '2px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            flexShrink: 0,
          }}
        >
          <Store size={30} />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
              {admin?.store_name || admin?.name || 'الملف الشخصي'}
            </h1>
            <span
              style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={13} />
              حساب صاحب متجر
            </span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
            اسم المستخدم للدخول: <span style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>@{admin?.username}</span>
          </p>
        </div>
      </div>

      {/* Store Subscription Details Card */}
      <div
        className="merchant-profile-card"
        style={{
          border: `1.5px solid ${isPermanent ? '#a7f3d0' : diffDays !== null && diffDays <= 15 ? '#fef08a' : '#e2e8f0'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: isPermanent ? '#ecfdf5' : '#eff6ff',
                color: isPermanent ? '#059669' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isPermanent ? <Sparkles size={20} /> : <Clock size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                تفاصيل اشتراك المتجر وصلاحية النظام
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                مدة ونوع اشتراك حساب متجرك في منصة الكروت الذكية
              </p>
            </div>
          </div>

          <span
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              backgroundColor: isPermanent ? '#d1fae5' : diffDays !== null && diffDays <= 0 ? '#fee2e2' : diffDays !== null && diffDays <= 15 ? '#fef08a' : '#eff6ff',
              color: isPermanent ? '#065f46' : diffDays !== null && diffDays <= 0 ? '#b91c1c' : diffDays !== null && diffDays <= 15 ? '#854d0e' : '#1d4ed8',
              border: `1px solid ${isPermanent ? '#a7f3d0' : diffDays !== null && diffDays <= 0 ? '#fecaca' : diffDays !== null && diffDays <= 15 ? '#fde047' : '#bfdbfe'}`,
            }}
          >
            {isPermanent
              ? 'اشتراك دائم (مفتوح)'
              : diffDays !== null && diffDays <= 0
              ? '⚠️ الاشتراك منتهي'
              : `متبقي: ${diffDays} يوم`}
          </span>
        </div>

        {/* 4 Detail Grid Blocks */}
        <div className="merchant-subscription-grid">
          {/* Block 1: Type */}
          <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>نوع الاشتراك</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
              {admin?.subscription_type === 'yearly' ? 'اشتراك سنوي' : admin?.subscription_type === 'custom' ? 'اشتراك مخصص' : 'اشتراك دائم'}
            </span>
          </div>

          {/* Block 2: Start Date */}
          <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>تاريخ البدء</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
              {startDateFormatted}
            </span>
          </div>

          {/* Block 3: End Date */}
          <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>تاريخ الانتهاء</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
              {isPermanent ? 'بدون تاريخ انتهاء' : endDateFormatted}
            </span>
          </div>

          {/* Block 4: Remaining Time */}
          <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: isPermanent ? '#ecfdf5' : diffDays !== null && diffDays <= 15 ? '#fffbeb' : '#f0fdf4', border: `1px solid ${isPermanent ? '#a7f3d0' : diffDays !== null && diffDays <= 15 ? '#fef08a' : '#bbf7d0'}`, boxSizing: 'border-box' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>المدة المتبقية</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isPermanent ? '#047857' : diffDays !== null && diffDays <= 0 ? '#dc2626' : diffDays !== null && diffDays <= 15 ? '#b45309' : '#15803d' }}>
              {isPermanent
                ? 'مفتوح مدى الحياة'
                : diffDays !== null && diffDays <= 0
                ? 'انتهى الاشتراك'
                : diffDays !== null
                ? `${diffDays} يوماً`
                : 'غير محدد'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Store Info & Password Security */}
      <div className="merchant-profile-grid">
        {/* Card 1: Store & Contact Info */}
        <div className="merchant-profile-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <User size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              بيانات الحساب والمتجر
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                اسم المتجر / النشاط التجاري
              </label>
              <div style={{ position: 'relative' }}>
                <Store size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="مثال: مطعم وسناك البرنس"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingRight: '38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                اسم صاحب المحل / المسؤول
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="اسمك الشخصي"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingRight: '38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@store.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingRight: '38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    direction: 'ltr',
                    textAlign: 'right',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                رقم الهاتف / الواتساب
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingRight: '38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    direction: 'ltr',
                    textAlign: 'right',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="merchant-profile-submit-btn"
              style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '12px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: profileLoading ? 'not-allowed' : 'pointer',
                opacity: profileLoading ? 0.75 : 1,
              }}
            >
              {profileLoading ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
              حفظ التعديلات
            </button>
          </form>
        </div>

        {/* Card 2: Password Security */}
        <div className="merchant-profile-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <KeyRound size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              تغيير كلمة المرور
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                كلمة المرور الحالية *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingLeft: '40px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    direction: 'ltr',
                    textAlign: 'right',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                كلمة المرور الجديدة *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="لا تقل عن 6 أحرف"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingLeft: '40px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    direction: 'ltr',
                    textAlign: 'right',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                تأكيد كلمة المرور الجديدة *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="إعادة إدخال الجديدة"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingLeft: '40px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    direction: 'ltr',
                    textAlign: 'right',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="merchant-profile-submit-btn"
              style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '12px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: passwordLoading ? 'not-allowed' : 'pointer',
                opacity: passwordLoading ? 0.75 : 1,
              }}
            >
              {passwordLoading ? <RefreshCw size={16} className="spin" /> : <Lock size={16} />}
              تحديث كلمة المرور
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
