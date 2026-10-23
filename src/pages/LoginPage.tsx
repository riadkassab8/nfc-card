import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Zap,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error: sessionError, clearError } = useAuth();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const successMessage = (location.state as any)?.successMessage as string | undefined;

  // Show "session expired" etc. once, then clear it from context
  useEffect(() => {
    if (sessionError) {
      setError(sessionError);
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionError]);

  const fail = (msg: string) => {
    setError(msg);
    setShakeKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!username.trim() || !password.trim()) {
      fail('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      fail(err?.message || 'بيانات الدخول غير صحيحة');
      setSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(at top center, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
        position: 'relative',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              boxShadow: '0 10px 24px -6px rgba(79, 70, 229, 0.35)',
              marginBottom: '16px',
            }}
          >
            <Zap size={28} color="#ffffff" />
          </div>

          <h1
            style={{
              fontSize: '1.55rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            تسجيل الدخول
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            أهلاً بك، أدخل بياناتك للمتابعة إلى لوحة التحكم
          </p>
        </div>

        {/* Clean Login Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.03)',
            padding: '32px 28px',
          }}
        >
          {/* Alerts */}
          {successMessage && !error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                fontSize: '0.86rem',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div
              key={shakeKey}
              className="shake"
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.86rem',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                htmlFor="login-username"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '8px',
                }}
              >
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="ادخل اسم المستخدم أو البريد"
                  autoComplete="username"
                  autoFocus
                  disabled={submitting}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 42px 0 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.92rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#334155',
                  }}
                >
                  كلمة المرور
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#4f46e5',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = 'underline')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = 'none')}
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 42px 0 42px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.92rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                height: '46px',
                marginTop: '6px',
                borderRadius: '12px',
                border: 'none',
                background: submitting
                  ? '#818cf8'
                  : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff',
                fontSize: '0.94rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  جاري الدخول...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security badge & Footer */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#64748b',
              fontSize: '0.78rem',
            }}
          >
            <Shield size={14} style={{ color: '#10b981' }} />
            <span>نظام آمن ومشفّر بالكامل</span>
          </div>

          <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8' }}>
            © {new Date().getFullYear()} k2rty — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
