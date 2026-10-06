import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api/authApi';
import { ForgotPasswordResponse } from '../types';
import {
  KeyRound, User, ArrowRight, RefreshCw,
  CheckCircle2, Copy, Check, ShieldAlert, MailCheck, AlertCircle
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Result from POST /api/auth/forgot-password */
  const [result, setResult] = useState<ForgotPasswordResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await authApi.forgotPassword(identifier.trim());
      setResult(res);
    } catch (e: any) {
      setError(e?.message || 'تعذر العثور على الحساب أو حدث خطأ أثناء إرسال البريد الإلكتروني');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyToken = () => {
    if (!result?.reset_token) return;
    navigator.clipboard.writeText(result.reset_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToReset = () => {
    navigate('/reset-password', {
      state: {
        token: result?.reset_token || '',
        identifier: identifier.trim(),
        email: result?.email || '',
      },
    });
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
      {/* Subtle background glow */}
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

        {/* Brand / Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--r-xl)',
              backgroundColor: result ? '#16a34a' : 'var(--clr-primary-500)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: result ? '0 8px 20px -4px rgba(22, 163, 74, 0.4)' : 'var(--shadow-blue)',
              transition: 'all 0.3s ease',
            }}
          >
            {result ? <MailCheck size={28} color="#fff" /> : <KeyRound size={28} color="#fff" />}
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
            {result ? 'تم إرسال رابط التعيين' : 'استرجاع كلمة المرور'}
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--txt-muted)' }}>
            {result
              ? 'يرجى مراجعة بريدك الإلكتروني لإتمام العملية'
              : 'أدخل اسم المستخدم أو البريد الإلكتروني لاستلام رابط ورمز إعادة التعيين'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px' }}>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                marginBottom: '18px',
                padding: '11px 14px',
                borderRadius: 'var(--r-md)',
                backgroundColor: 'var(--clr-error-bg)',
                border: '1px solid var(--clr-error-bdr)',
                color: 'var(--clr-error)',
                fontSize: 'var(--fs-sm)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldAlert size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            /* ── Step 1 Form: Request Email Link / Token ── */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  اسم المستخدم أو البريد الإلكتروني
                </label>
                <div style={{ position: 'relative' }}>
                  <User
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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin أو admin@example.com"
                    autoFocus
                    required
                    disabled={submitting}
                    style={{ paddingRight: '38px', fontSize: '14px' }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)', marginTop: '4px', display: 'block' }}>
                  سيتم إرسال رابط مباشر ورمز تحقق إلى بريدك الإلكتروني المرتبط بالحساب
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting || !identifier.trim()}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: 'var(--fs-base)',
                  fontWeight: 800,
                  marginTop: '4px',
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={17} className="spin" /> جاري إرسال البريد...
                  </>
                ) : (
                  <>
                    <KeyRound size={17} /> إرسال رابط إعادة التعيين
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── Step 1 Success: Email Sent Confirmation ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  color: '#15803d',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14.5px', marginBottom: '6px' }}>
                  <CheckCircle2 size={19} />
                  <span>تم إرسال البريد بنجاح!</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#166534', lineHeight: 1.6 }}>
                  تم إرسال رابط ورمز التعيين إلى بريدك الإلكتروني{' '}
                  {result.email ? (
                    <strong dir="ltr" style={{ color: '#0f766e', fontWeight: 800, padding: '1px 6px', backgroundColor: '#e6fffa', borderRadius: '4px' }}>
                      {result.email}
                    </strong>
                  ) : null}
                  ، يرجى فحص صندوق الوارد أو البريد غير الهام (Spam).
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e40af',
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  الرمز والرابط صالحان لمدة <strong>{result.expires_in || '15 دقيقة'}</strong>. يمكنك الضغط على الرابط في البريد مباشرة، أو إدخال الرمز يدوياً.
                </span>
              </div>

              {/* Optional Token Display Box (if returned by backend) */}
              {result.reset_token && (
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    رمز التحقق (Reset Token):
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1.5px dashed var(--clr-primary-300)',
                    }}
                  >
                    <code
                      style={{
                        flex: 1,
                        fontFamily: 'monospace',
                        fontSize: '12.5px',
                        color: 'var(--clr-primary-800)',
                        fontWeight: 700,
                        wordBreak: 'break-all',
                        userSelect: 'all',
                      }}
                    >
                      {result.reset_token}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--bdr-light)',
                        backgroundColor: '#fff',
                        color: copied ? '#16a34a' : 'var(--txt-secondary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleProceedToReset}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: 'var(--fs-base)',
                  fontWeight: 800,
                }}
              >
                <span>المتابعة لإدخال رمز التحقق وكلمة المرور</span>
                <ArrowRight size={17} style={{ transform: 'scaleX(-1)' }} />
              </button>

              <button
                type="button"
                onClick={() => { setResult(null); setError(null); }}
                className="btn-outline"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '9px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                لم يصلك البريد؟ إعادة المحاولة
              </button>
            </div>
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

export default ForgotPasswordPage;
