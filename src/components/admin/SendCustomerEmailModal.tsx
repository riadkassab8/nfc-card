import React, { useState } from 'react';
import { customersApi } from '../../services';
import { ApiCustomer, SendCustomerEmailDto, SendCustomerEmailResponse } from '../../types';
import { X, Send, RefreshCw, Mail, ExternalLink, Sparkles, AlertCircle, Eye, Edit3 } from 'lucide-react';

interface SendCustomerEmailModalProps {
  customer: ApiCustomer;
  onClose: () => void;
  onSuccess?: (resp: SendCustomerEmailResponse) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onEditCustomer?: () => void;
}

const EMAIL_TEMPLATES = [
  {
    id: 'subscription_reminder',
    name: 'تنبيه: اقتراب انتهاء الاشتراك',
    badge: 'تنبيه اشتراك',
    subject: 'تنبيه: اقتراب موعد انتهاء باقة كروت الـ NFC',
    message: 'عزيزنا العميل، نود إحاطتك علماً بأن اشتراك بطاقتك ينتهي خلال 3 أيام.\nيرجى تجديد الاشتراك لضمان استمرار عمل الروابط دون انقطاع.',
    button_text: 'تجديد الباقة الآن',
    button_url: typeof window !== 'undefined' ? `${window.location.origin}/renew` : 'https://k2rty.vercel.app/renew',
  },
  {
    id: 'card_updated',
    name: 'إشعار: تحديث بيانات البطاقة',
    badge: 'تحديث بيانات',
    subject: 'تم تحديث بيانات بطاقتك الذكية بنجاح',
    message: 'مرحباً، يسعدنا إعلامك بأنه تم تحديث بيانات بطاقتك الذكية بنجاح.\nيمكنك معاينة صفحتك الشخصية للتأكد من صحة الروابط والمعلومات.',
    button_text: 'معاينة البطاقة',
    button_url: typeof window !== 'undefined' ? window.location.origin : 'https://k2rty.vercel.app',
  },
  {
    id: 'welcome',
    name: 'رسالة ترحيبية / تفعيل البطاقة',
    badge: 'أهلاً بك',
    subject: 'مرحباً بك في منصة البطاقات الذكية NFC',
    message: 'يسعدنا انضمامك إلينا! بطاقتك الذكية جاهزة للاستخدام الآن لمشاركة بياناتك بسهولة واحترافية بنقرة واحدة.',
    button_text: 'استعراض الحساب',
    button_url: typeof window !== 'undefined' ? window.location.origin : 'https://k2rty.vercel.app',
  },
];

export const SendCustomerEmailModal: React.FC<SendCustomerEmailModalProps> = ({
  customer,
  onClose,
  onSuccess,
  onToast,
  onEditCustomer,
}) => {
  const [subject, setSubject] = useState('تنبيه: اقتراب موعد انتهاء باقة كروت الـ NFC');
  const [message, setMessage] = useState('عزيزنا العميل، نود إحاطتك علماً بأن اشتراك بطاقتك ينتهي خلال 3 أيام.\nيرجى تجديد الاشتراك لضمان استمرار عمل الروابط دون انقطاع.');
  const [badge, setBadge] = useState('تنبيه اشتراك');
  const [buttonText, setButtonText] = useState('تجديد الباقة الآن');
  const [buttonUrl, setButtonUrl] = useState(
    typeof window !== 'undefined' ? `${window.location.origin}/renew` : 'https://k2rty.vercel.app/renew'
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEmail = Boolean(customer.email && customer.email.trim());

  const applyTemplate = (tmpl: typeof EMAIL_TEMPLATES[0]) => {
    setSubject(tmpl.subject);
    setMessage(tmpl.message);
    setBadge(tmpl.badge);
    setButtonText(tmpl.button_text);
    setButtonUrl(tmpl.button_url);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEmail) {
      setError(`العميل "${customer.name}" ليس لديه بريد إلكتروني مسجل. يرجى إضافة بريده أولاً.`);
      return;
    }

    if (!subject.trim()) {
      setError('يرجى إدخال عنوان البريد الإلكتروني.');
      return;
    }

    if (!message.trim()) {
      setError('يرجى إدخال نص الرسالة.');
      return;
    }

    if (buttonText.trim() && !buttonUrl.trim()) {
      setError('يرجى إدخال رابط الزر التفاعلي أو ترك نص الزر فارغاً.');
      return;
    }

    setSending(true);
    setError(null);

    const dto: SendCustomerEmailDto = {
      subject: subject.trim(),
      message: message.trim(),
      badge: badge.trim() || undefined,
      button_text: buttonText.trim() || undefined,
      button_url: buttonUrl.trim() || undefined,
    };

    try {
      const res = await customersApi.sendCustomerEmail(customer._id, dto);
      onToast(res.message || `تم إرسال البريد الإلكتروني إلى ${customer.name} بنجاح ✓`, 'success');
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err: any) {
      const errMsg = err?.message || 'فشل إرسال البريد الإلكتروني للعميل.';
      setError(errMsg);
      onToast(errMsg, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !sending) onClose();
      }}
    >
      <div
        className="modal-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--bdr-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--clr-primary-50)',
                color: 'var(--clr-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--clr-primary-200)',
              }}
            >
              <Mail size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                إرسال بريد إلكتروني للعميل
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '13px', color: 'var(--txt-muted)' }}>
                <span style={{ fontWeight: 700, color: 'var(--txt-body)' }}>{customer.name}</span>
                {customer.email ? (
                  <span dir="ltr" style={{ color: 'var(--clr-primary-700)' }}>({customer.email})</span>
                ) : (
                  <span style={{ color: 'var(--clr-error)', fontWeight: 600 }}>(لا يوجد بريد مسجل)</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', backgroundColor: '#e2e8f0', borderRadius: '10px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'editor' ? '#ffffff' : 'transparent',
                  color: activeTab === 'editor' ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
                  boxShadow: activeTab === 'editor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Edit3 size={13} /> التحرير
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'preview' ? '#ffffff' : 'transparent',
                  color: activeTab === 'preview' ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
                  boxShadow: activeTab === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Eye size={13} /> معاينة
              </button>
            </div>

            <button
              onClick={onClose}
              disabled={sending}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--txt-muted)',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Missing Email Alert */}
        {!hasEmail && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '13px', fontWeight: 600 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>العميل ليس لديه بريد إلكتروني مسجل. لن تتمكن من الإرسال حتى إضافة بريده.</span>
            </div>
            {onEditCustomer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditCustomer();
                }}
                className="btn-outline"
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  borderColor: '#fca5a5',
                  backgroundColor: '#ffffff',
                  color: '#b91c1c',
                  fontWeight: 700,
                }}
              >
                تعديل البريد الآن
              </button>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              margin: '16px 24px 0',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--clr-error-bg)',
              border: '1px solid var(--clr-error-bdr)',
              color: 'var(--clr-error)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'editor' ? (
            <form id="send-customer-email-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Templates */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--txt-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: 'var(--clr-primary-600)' }} /> قوالب جاهزة سريعة:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {EMAIL_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--bdr-light)',
                        backgroundColor: 'var(--bg-subtle)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: 'var(--txt-heading)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--clr-primary-400)';
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--clr-primary-50)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr-light)';
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-subtle)';
                      }}
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px', display: 'block' }}>
                  عنوان البريد الإلكتروني (Subject) <span style={{ color: 'var(--clr-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: تنبيه: اقتراب موعد انتهاء باقة كروت الـ NFC"
                  required
                  style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                />
              </div>

              {/* Badge */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>الشارة التنبيهية (Badge)</span>
                  <span style={{ fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 400 }}>اختياري</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="مثال: تنبيه اشتراك، إشعار خاص، عرض حصري"
                  style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px', display: 'block' }}>
                  نص الرسالة (Message) <span style={{ color: 'var(--clr-error)' }}>*</span>
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب نص الرسالة التي ستظهر للعميل في جسم البريد الإلكتروني..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    lineHeight: 1.6,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Button Action */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  border: '1px solid var(--bdr-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt-heading)' }}>
                    زر الإجراء السريع (Call to Action)
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)' }}>اختياري</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt-secondary)', marginBottom: '4px', display: 'block' }}>
                      نص الزر (Button Text)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="مثال: تجديد الباقة الآن"
                      style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt-secondary)', marginBottom: '4px', display: 'block' }}>
                      رابط الزر (Button URL)
                    </label>
                    <input
                      type="url"
                      dir="ltr"
                      className="form-input"
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="https://..."
                      style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Live Email Preview */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid var(--bdr-light)',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--txt-muted)', fontWeight: 600 }}>إلى:</span>
                  <span style={{ fontWeight: 700, color: 'var(--txt-body)' }}>{customer.name}</span>
                  <span dir="ltr" style={{ color: 'var(--txt-secondary)' }}>&lt;{customer.email || 'no-email@example.com'}&gt;</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ color: 'var(--txt-muted)', fontWeight: 600 }}>الموضوع:</span>
                  <span style={{ fontWeight: 700, color: 'var(--txt-heading)' }}>{subject || '(بدون عنوان)'}</span>
                </div>
              </div>

              {/* Email Mockup Card */}
              <div
                style={{
                  border: '1px solid var(--bdr-light)',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}
              >
                {/* Email Header */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    padding: '24px 20px',
                    textAlign: 'center',
                    color: '#ffffff',
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    بطاقات NFC الذكية
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    نظام إدارة وتخصيص البطاقات الذكية
                  </div>
                </div>

                {/* Email Body Preview */}
                <div style={{ padding: '28px 24px' }}>
                  {badge && (
                    <div style={{ marginBottom: '16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#f1f5f9',
                          color: 'var(--clr-primary-700)',
                          border: '1px solid var(--clr-primary-200)',
                          padding: '4px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        {badge}
                      </span>
                    </div>
                  )}

                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                    {subject || 'عنوان البريد الإلكتروني'}
                  </h2>

                  <div
                    style={{
                      fontSize: '14.5px',
                      lineHeight: 1.7,
                      color: '#334155',
                      whiteSpace: 'pre-line',
                      marginBottom: buttonText ? '28px' : '10px',
                    }}
                  >
                    {message || 'نص الرسالة سيظهر هنا...'}
                  </div>

                  {buttonText && (
                    <div style={{ textAlign: 'center', margin: '20px 0 10px' }}>
                      <a
                        href={buttonUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.preventDefault()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: 'var(--clr-primary-600)',
                          color: '#ffffff',
                          padding: '12px 28px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '14px',
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                        }}
                      >
                        <span>{buttonText}</span>
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Email Footer */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '14px 20px',
                    borderTop: '1px solid #e2e8f0',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                >
                  هذه الرسالة مرسلة تلقائياً عبر منصة إدارة البطاقات الذكية.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--bdr-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
            المسار: <code dir="ltr" style={{ fontSize: '11px', color: 'var(--clr-primary-700)' }}>POST /api/customers/:id/send-email</code>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={sending}
              style={{ padding: '8px 18px', borderRadius: '10px' }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="send-customer-email-form"
              className="btn-primary"
              disabled={sending || !hasEmail}
              style={{
                padding: '8px 22px',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                opacity: !hasEmail ? 0.6 : 1,
              }}
            >
              {sending ? (
                <>
                  <RefreshCw size={15} className="spin" /> جاري الإرسال...
                </>
              ) : (
                <>
                  <Send size={15} /> إرسال البريد الإلكتروني
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
