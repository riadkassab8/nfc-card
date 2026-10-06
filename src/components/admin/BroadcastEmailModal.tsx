import React, { useState } from 'react';
import { customersApi } from '../../services';
import { ApiCustomer, BroadcastEmailDto, BroadcastEmailResponse } from '../../types';
import {
  X, Send, RefreshCw, Megaphone, ExternalLink, Sparkles,
  Users, CheckCircle2, Eye, Edit3
} from 'lucide-react';

interface BroadcastEmailModalProps {
  totalCustomersCount: number;
  selectedCustomers?: ApiCustomer[];
  onClose: () => void;
  onSuccess?: (resp: BroadcastEmailResponse) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const BROADCAST_TEMPLATES = [
  {
    id: 'discount_promo',
    name: '🔥 عرض خاص وخصم',
    badge: 'عرض خاص لفترة محدودة',
    subject: '🔥 خصم خاص 30% على ترقية باقات كروت NFC',
    message: 'يسعدنا إعلامك ببدء عرض التخفيضات لهذا الشهر!\nاحصل على ترقية اشتراكك السنوي بخصم حصري ومميزات إضافية لفترة محدودة.',
    button_text: 'استعراض العرض والتجديد',
    button_url: typeof window !== 'undefined' ? `${window.location.origin}/offers` : 'https://k2rty.vercel.app/offers',
  },
  {
    id: 'system_updates',
    name: '📢 تحديثات وميزات جديدة',
    badge: 'تحديث المنصة',
    subject: '📢 ميزات جديدة وتحسينات متقدمة لبطاقات NFC الذكية',
    message: 'أهلاً بك، قمنا بإطلاق تحديثات جديدة لتحسين تجربة مشاركة بطاقتك ولوحة التحكم وإحصائيات المسح.\nقم بزيارة حسابك لاستكشاف الميزات الجديدة.',
    button_text: 'تسجيل الدخول للمنصة',
    button_url: typeof window !== 'undefined' ? window.location.origin : 'https://k2rty.vercel.app',
  },
  {
    id: 'subscription_renewal',
    name: '⏰ تنبيه جماعي لتجديد الباقات',
    badge: 'تجديد الاشتراك',
    subject: 'تنبيه: اقتراب موعد تجديد باقات كروت الـ NFC',
    message: 'عزيزنا المشترك، نود تذكيرك بالتحقق من حالة اشتراك بطاقتك الذكية لضمان بقائها نشطة ومتاحة دائماً للعملاء دون انقطاع.',
    button_text: 'تجديد الباقة الآن',
    button_url: typeof window !== 'undefined' ? `${window.location.origin}/renew` : 'https://k2rty.vercel.app/renew',
  },
];

export const BroadcastEmailModal: React.FC<BroadcastEmailModalProps> = ({
  totalCustomersCount,
  selectedCustomers = [],
  onClose,
  onSuccess,
  onToast,
}) => {
  const [targetMode, setTargetMode] = useState<'all' | 'selected'>(
    selectedCustomers.length > 0 ? 'selected' : 'all'
  );

  const [subject, setSubject] = useState('🔥 خصم خاص 30% على ترقية باقات كروت NFC');
  const [message, setMessage] = useState(
    'يسعدنا إعلامك ببدء عرض التخفيضات لهذا الشهر!\nاحصل على ترقية اشتراكك السنوي بخصم حصري ومميزات إضافية لفترة محدودة.'
  );
  const [badge, setBadge] = useState('عرض خاص لفترة محدودة');
  const [buttonText, setButtonText] = useState('استعراض العرض والتجديد');
  const [buttonUrl, setButtonUrl] = useState(
    typeof window !== 'undefined' ? `${window.location.origin}/offers` : 'https://k2rty.vercel.app/offers'
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BroadcastEmailResponse | null>(null);

  const applyTemplate = (tmpl: typeof BROADCAST_TEMPLATES[0]) => {
    setSubject(tmpl.subject);
    setMessage(tmpl.message);
    setBadge(tmpl.badge);
    setButtonText(tmpl.button_text);
    setButtonUrl(tmpl.button_url);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const dto: BroadcastEmailDto = {
      subject: subject.trim(),
      message: message.trim(),
      badge: badge.trim() || undefined,
      button_text: buttonText.trim() || undefined,
      button_url: buttonUrl.trim() || undefined,
      customer_ids:
        targetMode === 'selected' && selectedCustomers.length > 0
          ? selectedCustomers.map((c) => c._id)
          : undefined, // undefined sends to all active customers with email automatically
    };

    try {
      const res = await customersApi.broadcastEmail(dto);
      setResult(res);
      onToast(res.message || `تم إرسال الحملة البريدية بنجاح ✓`, 'success');
      if (onSuccess) onSuccess(res);
    } catch (err: any) {
      const errMsg = err?.message || 'فشل إرسال الحملة البريدية.';
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
          maxWidth: '720px',
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
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(234, 88, 12, 0.2)',
              }}
            >
              <Megaphone size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                إرسال بريد جماعي (حملة تسويقية / عروض)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                إرسال إشعار ترويجي أو خصم على باقات NFC لجميع العملاء أو المحددين
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!result && (
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
            )}

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

        {/* Results Banner if Completed */}
        {result ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                {result.message || 'تم إرسال الحملة البريدية بنجاح!'}
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--txt-muted)' }}>
                تم استهداف العملاء وإرسال الرسائل عبر خادم البريد.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                width: '100%',
                maxWidth: '460px',
                marginTop: '10px',
              }}
            >
              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '12px', padding: '14px', border: '1px solid var(--bdr-light)' }}>
                <div style={{ fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600 }}>المستهدفين</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--txt-heading)', marginTop: '4px' }}>
                  {result.total_targeted}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>تم الإرسال بنجاح</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                  {result.sent_count}
                </div>
              </div>

              <div style={{ backgroundColor: (result.failed_count || 0) > 0 ? '#fef2f2' : 'var(--bg-subtle)', borderRadius: '12px', padding: '14px', border: `1px solid ${(result.failed_count || 0) > 0 ? '#fecaca' : 'var(--bdr-light)'}` }}>
                <div style={{ fontSize: '12px', color: (result.failed_count || 0) > 0 ? '#dc2626' : 'var(--txt-muted)', fontWeight: 600 }}>المتعثرين</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: (result.failed_count || 0) > 0 ? '#dc2626' : 'var(--txt-muted)', marginTop: '4px' }}>
                  {result.failed_count ?? 0}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ marginTop: '16px', padding: '10px 32px', borderRadius: '10px', fontWeight: 700 }}
            >
              إغلاق النافذة
            </button>
          </div>
        ) : (
          <>
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
                <form id="broadcast-email-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Target Audience Selector */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      border: '1px solid var(--bdr-light)',
                    }}
                  >
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--txt-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={15} style={{ color: 'var(--clr-primary-600)' }} /> الجمهور المستهدف بالحملة:
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: targetMode === 'all' ? '#ffffff' : 'transparent',
                          border: `1px solid ${targetMode === 'all' ? 'var(--clr-primary-400)' : 'transparent'}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="targetMode"
                          checked={targetMode === 'all'}
                          onChange={() => setTargetMode('all')}
                          style={{ accentColor: 'var(--clr-primary-600)' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt-heading)' }}>
                            جميع العملاء النشطين المسجل لديهم بريد إلكتروني
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)' }}>
                            سيتم الإرسال تلقائياً لكافة العملاء المسجلين (إجمالي العملاء: {totalCustomersCount})
                          </span>
                        </div>
                      </label>

                      {selectedCustomers.length > 0 && (
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: targetMode === 'selected' ? '#ffffff' : 'transparent',
                            border: `1px solid ${targetMode === 'selected' ? 'var(--clr-primary-400)' : 'transparent'}`,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="radio"
                            name="targetMode"
                            checked={targetMode === 'selected'}
                            onChange={() => setTargetMode('selected')}
                            style={{ accentColor: 'var(--clr-primary-600)' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt-heading)' }}>
                              العملاء المحددين فقط من الجدول ({selectedCustomers.length} عميل)
                            </span>
                            <span style={{ fontSize: '11.5px', color: 'var(--txt-muted)' }}>
                              سيتم حصر الإرسال على العملاء الذين قمت بتحديدهم مسبقاً
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Templates */}
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--txt-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} style={{ color: '#ea580c' }} /> نماذج حملات تسويقية جاهزة:
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {BROADCAST_TEMPLATES.map((tmpl) => (
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
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(234, 88, 12, 0.4)';
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(234, 88, 12, 0.05)';
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
                      عنوان الحملة البريدية (Subject) <span style={{ color: 'var(--clr-error)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="مثال: 🔥 خصم خاص 30% على ترقية باقات كروت NFC"
                      required
                      style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                    />
                  </div>

                  {/* Badge */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>الشارة الترويجية (Badge)</span>
                      <span style={{ fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 400 }}>اختياري</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="مثال: عرض خاص لفترة محدودة، خصم 30%"
                      style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                    />
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: '6px', display: 'block' }}>
                      محتوى الرسالة التسويقية (Message) <span style={{ color: 'var(--clr-error)' }}>*</span>
                    </label>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب العرض أو الرسالة بوضوح للعملاء..."
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
                        زر الانتقال والتفاعل (Call to Action)
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
                          placeholder="مثال: استعراض العرض والتجديد"
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
                /* Email Preview */
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
                      <span style={{ color: 'var(--txt-muted)', fontWeight: 600 }}>المستلمون:</span>
                      <span style={{ fontWeight: 700, color: 'var(--txt-body)' }}>
                        {targetMode === 'selected'
                          ? `${selectedCustomers.length} عميل محدد`
                          : `كافة العملاء النشطين المسجلين (${totalCustomersCount} عميل)`}
                      </span>
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

                    <div style={{ padding: '28px 24px' }}>
                      {badge && (
                        <div style={{ marginBottom: '16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: 'rgba(234, 88, 12, 0.1)',
                              color: '#ea580c',
                              border: '1px solid rgba(234, 88, 12, 0.25)',
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
                        {subject || 'عنوان الحملة البريدية'}
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
                              backgroundColor: '#ea580c',
                              color: '#ffffff',
                              padding: '12px 28px',
                              borderRadius: '10px',
                              fontWeight: 700,
                              fontSize: '14px',
                              textDecoration: 'none',
                              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                            }}
                          >
                            <span>{buttonText}</span>
                            <ExternalLink size={15} />
                          </a>
                        </div>
                      )}
                    </div>

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
                المسار: <code dir="ltr" style={{ fontSize: '11px', color: 'var(--clr-primary-700)' }}>POST /api/customers/broadcast-email</code>
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
                  form="broadcast-email-form"
                  className="btn-primary"
                  disabled={sending}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    backgroundColor: '#ea580c',
                    borderColor: '#ea580c',
                  }}
                >
                  {sending ? (
                    <>
                      <RefreshCw size={15} className="spin" /> جاري إرسال الحملة...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> إرسال الحملة البريدية
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
