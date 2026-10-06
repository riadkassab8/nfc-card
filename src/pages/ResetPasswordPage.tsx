import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../services/api/authApi';
import {
  Lock, Key, Eye, EyeOff, CheckCircle2,
  ShieldCheck, RefreshCw, ArrowRight, AlertTriangle, AlertCircle
} from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Initial token from navigation state or URL query parameter
  const initialToken = (location.state as any)?.token || searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Auto-redirect countdown on success
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login', {
            replace: true,
            state: { successMessage: success },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (!token.trim()) {
      setError('يرجى إدخال رمز التحقق (Reset Token)');
      return;
    }
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب ألا تقل عن 6 أحرف');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين، يرجى التأكد من التطابق');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authApi.resetPassword(token.trim(), newPassword);
      const msg = res?.message || 'تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.';
      setSuccess(msg);
    } catch (e: any) {
      let errMsg = e?.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور';
      if (/400/i.test(errMsg) || /invalid/i.test(errMsg) || /expired/i.test(errMsg) || /غير صالح/i.test(errMsg)) {
        errMsg = 'رمز إعادة التعيين غير صالح أو انتهت صلاحيته (المدة 15 دقيقة).';
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font)',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `radial-gradient(circle at 30% 20%, var(--clr-primary-100) 0%, transparent 50%),
                            radial-gradient(circle at 70% 80%, var(--clr-primary-50) 0%, transparent 50%)`,
        }}
      />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--r-xl)',
              backgroundColor: success ? '#16a34a' : 'var(--clr-primary-500)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: success ? '0 8px 20px -4px rgba(22, 163, 74, 0.4)' : 'var(--shadow-blue)',
              transition: 'all 0.3s ease',
            }}
          >
            {success ? <ShieldCheck size={28} color="#fff" /> : <Lock size={28} color="#fff" />}
          </div>
          <h1
            style={{
              fontSize: 'var(--fs-2xl)',
              fontWeight: 800,
              color: 'var(--txt-heading)',
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}
          >
            {success ? 'تم تغيير كلمة المرور' : 'تعيين كلمة المرور الجديدة'}
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--txt-muted)' }}>
            {success
              ? 'تم تحديث أمان الحساب بنجاح، جاري تحويلك...'
              : 'أدخل رمز التحقق وكلمة المرور الجديدة لحسابك'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px' }}>

          {/* Success Banner */}
          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  color: '#15803d',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, fontSize: '15px', marginBottom: '6px' }}>
                  <CheckCircle2 size={20} />
                  <span>تم التعيين بنجاح!</span>
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#166534', lineHeight: 1.5 }}>
                  {success}
                </p>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--txt-secondary)' }}>
                سيتم تحويلك تلقائياً لصفحة الدخول خلال <strong style={{ color: 'var(--clr-primary-600)', fontSize: '15px' }}>{countdown}</strong> ثوانٍ...
              </div>

              <button
                type="button"
                onClick={() => navigate('/login', { replace: true, state: { successMessage: success } })}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: 'var(--fs-base)',
                  fontWeight: 800,
                }}
              >
                <span>تسجيل الدخول الآن</span>
                <ArrowRight size={17} style={{ transform: 'scaleX(-1)' }} />
              </button>
            </div>
          ) : (
            <>
              {/* Error Banner */}
              {error && (
                <div
                  style={{
                    marginBottom: '18px',
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'var(--clr-error-bg)',
                    border: '1px solid var(--clr-error-bdr)',
                    color: 'var(--clr-error)',
                    fontSize: 'var(--fs-sm)',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={17} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                  {error.includes('15 دقيقة') && (
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: '12px',
                        color: 'var(--clr-primary-600)',
                        textDecoration: 'underline',
                        fontWeight: 700,
                        marginRight: '25px',
                      }}
                    >
                      طلب رمز تحقق جديد من هنا
                    </Link>
                  )}
                </div>
              )}

              {searchParams.get('token') && (
                <div style={{ padding: '9px 12px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                  <span>تم استلام رمز التحقق تلقائياً من رابط البريد الإلكتروني ✓</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Reset Token Input */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    رمز التحقق (Reset Token) <span style={{ color: 'var(--clr-error)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key
                      size={16}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--txt-muted)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="الصق رمز التحقق المستلم (15 دقيقة)"
                      required
                      disabled={submitting}
                      style={{
                        paddingRight: '38px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)', marginTop: '3px', display: 'block' }}>
                    الرمز المستلم من خطوة استرجاع كلمة المرور
                  </span>
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    كلمة المرور الجديدة <span style={{ color: 'var(--clr-error)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--txt-muted)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="6 أحرف أو أكثر"
                      required
                      minLength={6}
                      disabled={submitting}
                      style={{ paddingRight: '38px', paddingLeft: '38px', fontSize: '14px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      aria-label={showNewPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: showNewPw ? 'var(--clr-primary-500)' : 'var(--txt-muted)',
                        display: 'flex',
                        padding: '2px',
                      }}
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    تأكيد كلمة المرور الجديدة <span style={{ color: 'var(--clr-error)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--txt-muted)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور"
                      required
                      minLength={6}
                      disabled={submitting}
                      style={{
                        paddingRight: '38px',
                        paddingLeft: '38px',
                        fontSize: '14px',
                        borderColor: passwordsMismatch ? 'var(--clr-error)' : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      aria-label={showConfirmPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: showConfirmPw ? 'var(--clr-primary-500)' : 'var(--txt-muted)',
                        display: 'flex',
                        padding: '2px',
                      }}
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password match feedback */}
                  {passwordsMatch && (
                    <span style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> كلمتا المرور متطابقتان ✓
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span style={{ fontSize: '11.5px', color: 'var(--clr-error)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={13} /> كلمتا المرور غير متطابقتين
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || !token.trim() || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    fontSize: 'var(--fs-base)',
                    fontWeight: 800,
                    marginTop: '6px',
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={17} className="spin" /> جاري التحديث...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} /> إعادة تعيين كلمة المرور
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to Login link */}
          <div
            style={{
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid var(--bdr-light)',
              textAlign: 'center',
            }}
          >
            <Link
              to="/login"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--txt-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 140ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--clr-primary-600)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--txt-secondary)')}
            >
              <ArrowRight size={15} />
              <span>العودة لشاشة تسجيل الدخول</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
