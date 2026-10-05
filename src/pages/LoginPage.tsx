import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, Zap, ShieldCheck, RefreshCw } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';
  const busy = submitting || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setSubmitting(true); setError(null);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(e?.message || 'بيانات الدخول غير صحيحة');
    } finally { setSubmitting(false); }
  };

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
      {/* Subtle background pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(circle at 30% 20%, var(--clr-primary-100) 0%, transparent 50%),
                          radial-gradient(circle at 70% 80%, var(--clr-primary-50)  0%, transparent 50%)`,
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: 'var(--r-xl)',
            backgroundColor: 'var(--clr-primary-500)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-blue)',
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1 style={{
            fontSize: 'var(--fs-2xl)', fontWeight: 800,
            color: 'var(--txt-heading)', margin: '0 0 6px',
            letterSpacing: '-0.01em',
          }}>
            لوحة الإدارة
          </h1>
          
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px' }}>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '18px', padding: '11px 14px',
              borderRadius: 'var(--r-md)',
              backgroundColor: 'var(--clr-error-bg)',
              border: '1px solid var(--clr-error-bdr)',
              color: 'var(--clr-error)',
              fontSize: 'var(--fs-sm)', fontWeight: 700,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Username */}
            <div className="form-group">
              <label className="form-label">اسم المستخدم</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--txt-muted)',
                  pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ادخل اسم المستخدم"
                  autoFocus
                  required
                  disabled={busy}
                  style={{ paddingRight: '38px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--txt-muted)',
                  pointerEvents: 'none',
                }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={busy}
                  style={{ paddingRight: '38px', paddingLeft: '38px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: showPw ? 'var(--clr-primary-500)' : 'var(--txt-muted)',
                    display: 'flex', padding: '2px',
                    transition: 'color 140ms',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="btn-primary"
              style={{
                width: '100%', justifyContent: 'center',
                padding: '12px', fontSize: 'var(--fs-base)',
                marginTop: '4px',
              }}
            >
              {busy
                ? <><RefreshCw size={17} className="spin" /> جاري الدخول...</>
                : <><ShieldCheck size={17} /> تسجيل الدخول</>}
            </button>
          </form>

          {/* Server info */}
          <div style={{
            marginTop: '20px', paddingTop: '16px',
            borderTop: '1px solid var(--bdr-light)',
            textAlign: 'center',
          }}>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
