import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, Lock, User, Zap, ShieldCheck, RefreshCw, CheckCircle2,
  AlertCircle, Nfc, QrCode, BarChart3,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error: sessionError, clearError } = useAuth();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

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
      // On success the auth state flips and <GuestRoute> redirects to the dashboard
      // (or to the admin page the user originally requested).
      await login(username.trim(), password);
    } catch (err: any) {
      fail(err?.message || 'بيانات الدخول غير صحيحة');
      setSubmitting(false);
    }
  };

  // Subtle 3D tilt for the showcase card
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg)`;
  };
  const resetTilt = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  return (
    <div dir="rtl" className="auth-page">
      <div className="auth-bg" aria-hidden>
        <div className="auth-blob b1" />
        <div className="auth-blob b2" />
        <div className="auth-blob b3" />
        <div className="auth-grid" />
      </div>

      <div className="login-shell">
        {/* ── Form side ── */}
        <div className="login-form-side">
          <div style={{ marginBottom: 28 }}>
            <div className="auth-brand-logo" style={{ marginBottom: 18 }}>
              <Zap size={28} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--txt-heading)', lineHeight: 1.25 }}>
              مرحباً بعودتك
            </h1>
            <p style={{ color: 'var(--txt-secondary)', fontSize: 'var(--fs-sm)', marginTop: 6 }}>
              سجّل الدخول للوصول إلى لوحة إدارة k2rty
            </p>
          </div>

          <div>
            {successMessage && !error && (
              <div className="auth-alert success">
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}
            {error && (
              <div key={shakeKey} className="auth-alert error shake" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">اسم المستخدم</label>
              <div className="input-icon-wrap">
                <User size={18} className="input-icon" />
                <input
                  id="login-username"
                  type="text"
                  className="form-input auth-input"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (error) setError(null); }}
                  placeholder="ادخل اسم المستخدم"
                  autoComplete="username"
                  autoFocus
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label" htmlFor="login-password">كلمة المرور</label>
                <Link to="/forgot-password" className="auth-link">نسيت كلمة المرور؟</Link>
              </div>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input auth-input"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={submitting}
                  style={{ paddingLeft: 48 }}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary auth-submit" style={{ marginTop: 6 }}>
              {submitting
                ? <><RefreshCw size={18} className="spin" /> جاري الدخول...</>
                : <><ShieldCheck size={18} /> تسجيل الدخول</>}
            </button>
          </form>

          <p style={{ marginTop: 28, textAlign: 'center', fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
            © {new Date().getFullYear()} k2rty — جميع الحقوق محفوظة
          </p>
        </div>

        {/* ── Visual side ── */}
        <div className="login-visual-side" onMouseMove={handleTilt} onMouseLeave={resetTilt} aria-hidden>
          <div className="login-orb o1" />
          <div className="login-orb o2" />

          <div>
            <span className="login-chip"><span className="login-chip-dot" /> نظام البطاقات الذكية</span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.3, marginTop: 18 }}>
              أدِر بطاقات NFC و QR<br />من مكان واحد
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', marginTop: 10, fontSize: '0.95rem', maxWidth: 380 }}>
              تحكّم كامل في البطاقات والعملاء والإحصائيات بسرعة وسهولة.
            </p>
          </div>

          <div className="nfc-stage">
            <div className="nfc-card-float">
              <div className="nfc-card-3d" ref={cardRef}>
                <div className="nfc-card-top">
                  <div className="nfc-card-chip" />
                  <div className="nfc-waves"><span /><span /><span /></div>
                </div>
                <div className="nfc-card-number">K2R • 2026 • NFC</div>
                <div className="nfc-card-bottom">
                  <span>Smart Card</span>
                  <span className="nfc-card-brand">k2rty</span>
                </div>
              </div>
            </div>
          </div>

          <div className="login-features">
            {[
              { icon: Nfc,       text: 'برمجة وتجهيز بطاقات NFC فوراً' },
              { icon: QrCode,    text: 'روابط QR ديناميكية قابلة للتعديل' },
              { icon: BarChart3, text: 'إحصائيات دقيقة لكل عملية مسح' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={text} className="login-feature" style={{ animationDelay: `${450 + i * 110}ms` }}>
                <span className="login-feature-icon"><Icon size={17} /></span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
