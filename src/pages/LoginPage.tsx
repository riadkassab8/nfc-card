/* ==========================================================================
   ADMIN LOGIN PAGE (src/pages/LoginPage.tsx)
   Authenticates Admin via POST /api/auth/login
   ========================================================================== */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Button, Toast } from '../components/ui';
import { ShieldCheck, Lock, User, Sparkles, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || loading) return;

    if (!username.trim() || !password.trim()) {
      setLocalError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setSubmitting(true);
    setLocalError(null);
    clearError();

    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setLocalError(err?.message || 'خطأ في عملية تسجيل الدخول');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Ambient Background Orbs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {(error || localError) && (
        <div style={{ position: 'fixed', top: '24px', insetInlineEnd: '24px', zIndex: 1100 }}>
          <Toast
            type="error"
            message={localError || error || 'خطأ في المصادقة'}
            onClose={() => { setLocalError(null); clearError(); }}
          />
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '440px', zIndex: 1 }}>
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            تسجيل دخول مسؤول المنصة
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            ادخل بيانات المسؤول للوصول إلى لوحة التحكم الحقيقية
          </p>
        </div>

        {/* Login Form Card */}
        <Card padding="lg" style={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                اسم المستخدم (Username) *
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  style={{ paddingInlineStart: '40px', backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
                />
                <User size={18} style={{ position: 'absolute', insetInlineStart: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                كلمة المرور (Password) *
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    paddingInlineStart: '40px',
                    paddingInlineEnd: '40px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    borderColor: '#334155',
                  }}
                />
                <Lock size={18} style={{ position: 'absolute', insetInlineStart: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  style={{
                    position: 'absolute',
                    insetInlineEnd: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: showPassword ? '#818cf8' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 150ms ease-out',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={submitting || loading}
              style={{ marginTop: '8px' }}
            >
              <ShieldCheck size={18} /> تسجيل الدخول للوحة التحكم
            </Button>
          </form>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              السيرفر المتصل: <code style={{ color: '#818cf8', fontFamily: 'monospace' }}>smart-card-qr-api.koyeb.app</code>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
