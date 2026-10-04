/* ==========================================================================
   ADMIN LOGIN PAGE (src/pages/LoginPage.tsx)
   POST /api/auth/login  →  stores token  →  redirects to /admin
   ========================================================================== */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || loading) return;
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || loading;

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Cairo, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ambient orbs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-120px', left: '-120px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', zIndex: 1 }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(99,102,241,0.38)', marginBottom: '18px',
          }}>
            <Sparkles size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            لوحة تحكم المسؤول
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            أدخل بيانات المسؤول للوصول إلى نظام إدارة البطاقات
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {/* Error banner */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2', color: '#991b1b',
              border: '1px solid #fca5a5', borderRadius: '10px',
              padding: '12px 16px', fontSize: '0.875rem', fontWeight: 700,
              marginBottom: '20px',
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                اسم المستخدم
              </label>
              <div style={{ position: 'relative' }}>
                <User size={17} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoFocus
                  required
                  disabled={busy}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 42px 11px 14px',
                    backgroundColor: '#0f172a', color: '#f1f5f9',
                    border: '1.5px solid #334155', borderRadius: '10px',
                    fontSize: '0.9375rem', fontFamily: 'Cairo, sans-serif',
                    outline: 'none', transition: 'border-color 150ms',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = '#334155')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={busy}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 42px',
                    backgroundColor: '#0f172a', color: '#f1f5f9',
                    border: '1.5px solid #334155', borderRadius: '10px',
                    fontSize: '0.9375rem', fontFamily: 'Cairo, sans-serif',
                    outline: 'none', transition: 'border-color 150ms',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = '#334155')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  style={{
                    position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: showPw ? '#818cf8' : '#64748b', display: 'flex', padding: '2px',
                  }}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '13px', borderRadius: '12px', border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
                background: busy ? '#4b5563' : 'linear-gradient(135deg,#6366f1,#a855f7)',
                color: '#fff', fontSize: '1rem', fontWeight: 800,
                fontFamily: 'Cairo, sans-serif', marginTop: '4px',
                boxShadow: busy ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                transition: 'all 200ms',
              }}
            >
              {busy
                ? <><Loader2 size={19} className="spin" /> جاري تسجيل الدخول...</>
                : <><ShieldCheck size={19} /> تسجيل الدخول</>}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>
              السيرفر:{' '}
              <code style={{ color: '#818cf8', fontFamily: 'monospace' }}>
                smart-card-qr-api.koyeb.app
              </code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
