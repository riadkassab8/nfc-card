/* ==========================================================================
   MERCHANT CARDS PAGE  /merchant/cards
   Store owner cards management:
   - View assigned cards
   - Download print-ready QR codes
   - Copy & test public links
   - Edit business profile, social links, and Google Review Gate
   - Edit Payment Shifts (InstaPay & Vodafone Cash per shift/cashier)
   - Edit Smart Redirect Rules (Device target, time window, direct URLs)
   - Read-only subscriptions, no deletion, zero partner exposure
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Edit2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  X,
  Save,
  RefreshCw,
  Star,
  Clock,
  Plus,
  Trash2,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cardsApi } from '../../services';
import {
  ApiCard,
  BusinessData,
  PaymentShift,
  RedirectRule,
  fmtDate,
  isSubscriptionExpired,
} from '../../types';
import QRCode from 'qrcode';

type ModalTab = 'business' | 'shifts' | 'rules';

export const MerchantCardsPage: React.FC = () => {
  const { admin } = useAuth();
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingCard, setEditingCard] = useState<ApiCard | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('business');
  const [editForm, setEditForm] = useState<BusinessData>({});
  const [shifts, setShifts] = useState<PaymentShift[]>([]);
  const [rules, setRules] = useState<RedirectRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await cardsApi.getCards({ limit: 50 });
      setCards(res.data || []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const openEditModal = (card: ApiCard) => {
    setEditingCard(card);
    setActiveTab('business');
    setEditForm({ ...(card.business_data || {}) });
    setShifts(
      card.payment_shifts && card.payment_shifts.length > 0
        ? [...card.payment_shifts]
        : []
    );
    setRules(
      card.redirect_rules && card.redirect_rules.length > 0
        ? [...card.redirect_rules]
        : []
    );
  };

  /* ── Shifts operations ─────────────────────────────────────────────── */
  const addShift = () => {
    setShifts(prev => [
      ...prev,
      {
        label: `وردية ${prev.length + 1}`,
        cashier_name: '',
        hour_from: 10,
        period_from: 'am',
        hour_to: 6,
        period_to: 'pm',
        instapay: '',
        vodafone_cash: '',
        is_active: true,
      },
    ]);
  };

  const updateShift = (index: number, field: keyof PaymentShift, value: any) => {
    setShifts(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeShift = (index: number) => {
    setShifts(prev => prev.filter((_, i) => i !== index));
  };

  /* ── Redirect Rules operations ─────────────────────────────────────── */
  const addRule = () => {
    setRules(prev => [
      ...prev,
      {
        label: `قاعدة ${prev.length + 1}`,
        device_target: 'any',
        redirect_url: '',
        priority: prev.length + 1,
        is_active: true,
      },
    ]);
  };

  const updateRule = (index: number, field: keyof RedirectRule, value: any) => {
    setRules(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  /* ── Save all changes ──────────────────────────────────────────────── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    setSaving(true);
    try {
      const cleanForm: BusinessData = Object.fromEntries(
        Object.entries(editForm).map(([k, v]) => [
          k,
          typeof v === 'boolean' ? v : (v as string)?.trim() || undefined,
        ])
      ) as BusinessData;

      // Clean shifts
      const cleanShifts: PaymentShift[] = shifts.map((s, idx) => ({
        label: s.label?.trim() || `وردية ${idx + 1}`,
        cashier_name: s.cashier_name?.trim() || undefined,
        hour_from: s.hour_from ? Number(s.hour_from) : undefined,
        period_from: s.period_from || 'am',
        hour_to: s.hour_to ? Number(s.hour_to) : undefined,
        period_to: s.period_to || 'pm',
        instapay: s.instapay?.trim() || undefined,
        vodafone_cash: s.vodafone_cash?.trim() || undefined,
        is_active: s.is_active !== false,
      }));

      // Clean rules
      const cleanRules: RedirectRule[] = rules
        .filter(r => r.redirect_url && r.redirect_url.trim())
        .map((r, idx) => ({
          label: r.label?.trim() || `قاعدة ${idx + 1}`,
          device_target: r.device_target || 'any',
          redirect_url: r.redirect_url.trim(),
          priority: idx + 1,
          hour_from: r.hour_from ? Number(r.hour_from) : undefined,
          period_from: r.period_from || undefined,
          hour_to: r.hour_to ? Number(r.hour_to) : undefined,
          period_to: r.period_to || undefined,
          is_active: r.is_active !== false,
        }));

      // 1. Update Card main data & shifts
      await cardsApi.updateCard(editingCard._id, {
        business_data: cleanForm,
        payment_shifts: cleanShifts,
        redirect_rules: cleanRules,
      });

      // 2. Also ensure rules endpoint is explicitly synced
      try {
        await cardsApi.updateRedirectRules(editingCard._id, {
          rules: cleanRules,
        });
      } catch (err) {
        console.warn('Redirect rules sync error:', err);
      }

      showToast('تم حفظ بيانات وروابط وورديات وقواعد البطاقة بنجاح! ✓', 'success');
      setEditingCard(null);
      loadCards();
    } catch (err: any) {
      showToast(err?.message || 'فشل حفظ التعديلات', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = (card: ApiCard) => {
    const url = `${window.location.origin}/social/${card.custom_slug || card.card_code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(card._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = async (card: ApiCard) => {
    try {
      const liveUrl = `${window.location.origin}/r/${card.card_code}`;
      const dataUrl = await QRCode.toDataURL(liveUrl, { width: 600, margin: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QR-${card.card_code}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
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
          fontSize: '0.9rem',
          fontWeight: 700,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--txt-heading)' }}>
            بطاقاتي الذكية المسندة
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--txt-muted)', fontSize: '0.85rem' }}>
            يمكنك تخصيص بيانات المتجر، ورديات الدفع، وقواعد التحويل المباشر لكل بطاقة.
          </p>
        </div>

        <button
          onClick={loadCards}
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          تحديث القائمة
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--txt-muted)' }}>
          جاري تحميل بيانات البطاقات...
        </div>
      ) : cards.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: '20px',
          border: '1px solid var(--bdr-light)',
          color: 'var(--txt-muted)',
        }}>
          <CreditCard size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '17px', color: 'var(--txt-heading)' }}>
            لا توجد بطاقات مسندة لهذا المتجر حالياً
          </h3>
          <p style={{ margin: 0, fontSize: '13.5px' }}>
            يرجى مراجعة إدارة المنصة لربط بطاقات جديدة بمتجرك.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px',
        }}>
          {cards.map((card) => {
            const expired = isSubscriptionExpired(card);
            const liveUrl = `${window.location.origin}/social/${card.custom_slug || card.card_code}`;
            const b = card.business_data || {};
            const bizName = b.business_name || admin?.store_name || card.card_code;

            return (
              <div
                key={card._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid var(--bdr-light)',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)',
                  gap: '18px',
                }}
              >
                <div>
                  {/* Top: Card code & status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '15px',
                        color: 'var(--clr-primary-700)',
                        backgroundColor: '#eff6ff',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #bfdbfe',
                      }}>
                        {card.card_code}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--txt-muted)', fontWeight: 600 }}>
                        {card.card_type}
                      </span>
                    </div>

                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      backgroundColor: expired ? '#fef2f2' : '#f0fdf4',
                      color: expired ? '#dc2626' : '#16a34a',
                      border: `1px solid ${expired ? '#fecaca' : '#bbf7d0'}`,
                    }}>
                      {expired ? 'منتهية' : 'نشطة ✓'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    {bizName}
                  </h3>

                  {/* Badges preview: Shifts & Rules & Links */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {card.payment_shifts && card.payment_shifts.length > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#f5f3ff',
                        color: '#7c3aed',
                        border: '1px solid #ddd6fe',
                      }}>
                        <Clock size={12} /> {card.payment_shifts.length} ورديات دفع
                      </span>
                    )}

                    {card.redirect_rules && card.redirect_rules.length > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#ecfeff',
                        color: '#0891b2',
                        border: '1px solid #a5f3fc',
                      }}>
                        <ArrowRightLeft size={12} /> {card.redirect_rules.length} قواعد تحويل
                      </span>
                    )}

                    {b.google_review_url && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#fefce8',
                        color: '#ca8a04',
                        border: '1px solid #fef08a',
                      }}>
                        <Star size={11} fill="#ca8a04" /> بوابة التقييمات
                      </span>
                    )}
                  </div>

                  {/* Read-Only Subscription Info */}
                  <div style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '12px',
                    color: 'var(--txt-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt-heading)', fontWeight: 700 }}>
                      <Calendar size={14} color="#059669" />
                      معلومات الاشتراك (قراءة فقط):
                    </div>
                    <div>
                      {card.requires_subscription ? (
                        <>
                          صالحة حتى: <strong style={{ color: expired ? '#dc2626' : '#16a34a' }}>{fmtDate(card.subscription_end_date)}</strong>
                        </>
                      ) : (
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>اشتراك دائم مدى الحياة</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--bdr-light)' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(card)}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '0.82rem',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#059669',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={15} />
                    <span>تعديل البطاقة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyUrl(card)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: copiedId === card._id ? '#f0fdf4' : 'var(--bg-subtle)',
                      border: `1px solid ${copiedId === card._id ? '#bbf7d0' : 'var(--bdr-light)'}`,
                      color: copiedId === card._id ? '#16a34a' : 'var(--txt-secondary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title="نسخ رابط الصفحة الذكية"
                  >
                    {copiedId === card._id ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                    <span>{copiedId === card._id ? 'تم' : 'نسخ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadQR(card)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="تحميل كود الـ QR للطباعة بجودة عالية"
                  >
                    <Download size={16} />
                  </button>

                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--bdr-light)',
                      color: 'var(--txt-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                    }}
                    title="معاينة الصفحة العامة كما يراها الزبون"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Edit Modal */}
      {editingCard && (
        <div className="modal-overlay" onClick={() => setEditingCard(null)}>
          <div
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            style={{ maxWidth: '780px', width: '94%' }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ paddingBottom: '12px' }}>
              <div>
                <h2 className="modal-title" style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                  إدارة وتعديل البطاقة
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)', fontFamily: 'monospace' }}>
                  كود البطاقة: {editingCard.card_code}
                </span>
              </div>
              <button className="modal-close" onClick={() => setEditingCard(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '0 20px 14px',
              borderBottom: '1px solid var(--bdr-light)',
              overflowX: 'auto',
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('business')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'business' ? '#ecfdf5' : 'transparent',
                  color: activeTab === 'business' ? '#065f46' : 'var(--txt-muted)',
                }}
              >
                <Layers size={15} />
                بيانات وروابط المتجر
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('shifts')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'shifts' ? '#f5f3ff' : 'transparent',
                  color: activeTab === 'shifts' ? '#6d28d9' : 'var(--txt-muted)',
                }}
              >
                <Clock size={15} />
                ورديات وطرق الدفع ({shifts.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'rules' ? '#ecfeff' : 'transparent',
                  color: activeTab === 'rules' ? '#0e7490' : 'var(--txt-muted)',
                }}
              >
                <ArrowRightLeft size={15} />
                قواعد التحويل الذكية ({rules.length})
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '64vh', overflowY: 'auto', padding: '20px' }}>
                {/* ── TAB 1: Business Profile & Social ── */}
                {activeTab === 'business' && (
                  <>
                    {/* Basic Info */}
                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)' }}>
                        المعلومات الأساسية للنشاط
                      </div>

                      <div className="form-group">
                        <label className="form-label">اسم النشاط التجاري</label>
                        <input
                          className="form-input"
                          value={editForm.business_name || ''}
                          onChange={(e) => setEditForm(p => ({ ...p, business_name: e.target.value }))}
                          placeholder="مثال: مطعم وسناك البرنس"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">نبذة أو وصف مختصر</label>
                        <textarea
                          className="form-input"
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                          placeholder="أشهى الأطباق والوجبات السريعة..."
                          rows={2}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">رابط شعار المحل (Logo URL)</label>
                        <input
                          className="form-input"
                          value={editForm.logo || ''}
                          onChange={(e) => setEditForm(p => ({ ...p, logo: e.target.value }))}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>

                    {/* Direct Contact & Location */}
                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)' }}>
                        التواصل المباشر والموقع الجغرافي
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                        <div className="form-group">
                          <label className="form-label">رابط الواتساب (WhatsApp)</label>
                          <input
                            className="form-input"
                            value={editForm.whatsapp || ''}
                            onChange={(e) => setEditForm(p => ({ ...p, whatsapp: e.target.value }))}
                            placeholder="https://wa.me/2010..."
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">رقم الهاتف للاتصال</label>
                          <input
                            className="form-input"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                            placeholder="010xxxxxxxx"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">رابط الموقع على خرائط جوجل (Google Maps)</label>
                        <input
                          className="form-input"
                          value={editForm.google_maps || ''}
                          onChange={(e) => setEditForm(p => ({ ...p, google_maps: e.target.value }))}
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                    </div>

                    {/* Google Reviews Smart Gate */}
                    <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Star size={18} color="#ca8a04" fill="#ca8a04" />
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#854d0e' }}>
                            بوابة تقييمات جوجل الذكية (Review Gate)
                          </span>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#854d0e' }}>
                          <input
                            type="checkbox"
                            checked={!!editForm.enable_review_gate}
                            onChange={(e) => setEditForm(p => ({ ...p, enable_review_gate: e.target.checked }))}
                          />
                          تفعيل البوابة
                        </label>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ color: '#854d0e' }}>
                          رابط صفحة تقييم جوجل (Google Review Link)
                        </label>
                        <input
                          className="form-input"
                          value={editForm.google_review_url || ''}
                          onChange={(e) => setEditForm(p => ({ ...p, google_review_url: e.target.value }))}
                          placeholder="https://g.page/r/your-business/review"
                        />
                      </div>
                    </div>

                    {/* Social Media & Websites */}
                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)' }}>
                        حسابات السوشيال ميديا والموقع
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                        <div className="form-group">
                          <label className="form-label">انستغرام (Instagram)</label>
                          <input
                            className="form-input"
                            value={editForm.instagram || ''}
                            onChange={(e) => setEditForm(p => ({ ...p, instagram: e.target.value }))}
                            placeholder="https://instagram.com/..."
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">فيسبوك (Facebook)</label>
                          <input
                            className="form-input"
                            value={editForm.facebook || ''}
                            onChange={(e) => setEditForm(p => ({ ...p, facebook: e.target.value }))}
                            placeholder="https://facebook.com/..."
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">تيك توك (TikTok)</label>
                          <input
                            className="form-input"
                            value={editForm.tiktok || ''}
                            onChange={(e) => setEditForm(p => ({ ...p, tiktok: e.target.value }))}
                            placeholder="https://tiktok.com/@..."
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">الموقع الإلكتروني (Website)</label>
                          <input
                            className="form-input"
                            value={editForm.website || ''}
                            onChange={(e) => setEditForm(p => ({ ...p, website: e.target.value }))}
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── TAB 2: Payment Shifts ── */}
                {activeTab === 'shifts' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      backgroundColor: '#f5f3ff',
                      border: '1px solid #ddd6fe',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#5b21b6' }}>
                          ورديات العمل وطرق الدفع المتغيرة
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6d28d9' }}>
                          حدد حسابات إنستاباي وفودافون كاش لكل كاشير/وردية لتبديلها تلقائياً حسب الوقت.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addShift}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#7c3aed',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={15} />
                        إضافة وردية جديدة
                      </button>
                    </div>

                    {shifts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--txt-muted)' }}>
                        لا توجد ورديات محددة حالياً. انقر على "إضافة وردية جديدة" لضبط طرق الدفع حسب الوقت.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {shifts.map((shift, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#ffffff',
                              borderRadius: '14px',
                              border: '1px solid var(--bdr-light)',
                              padding: '16px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '8px',
                                  backgroundColor: '#f5f3ff',
                                  color: '#7c3aed',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                }}>
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={shift.label}
                                  onChange={(e) => updateShift(idx, 'label', e.target.value)}
                                  placeholder="اسم الوردية (مثلاً: وردية الصباح)"
                                  style={{
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    border: '1px solid transparent',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    outline: 'none',
                                    backgroundColor: 'var(--bg-subtle)',
                                  }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={shift.is_active !== false}
                                    onChange={(e) => updateShift(idx, 'is_active', e.target.checked)}
                                  />
                                  مفعلة
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeShift(idx)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px',
                                  }}
                                  title="حذف الوردية"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Shift Details Form Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                              <div className="form-group">
                                <label className="form-label">اسم المسؤول / الكاشير</label>
                                <input
                                  className="form-input"
                                  value={shift.cashier_name || ''}
                                  onChange={(e) => updateShift(idx, 'cashier_name', e.target.value)}
                                  placeholder="مثال: أحمد محمود"
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">إنستاباي (InstaPay Username/Link)</label>
                                <input
                                  className="form-input"
                                  value={shift.instapay || ''}
                                  onChange={(e) => updateShift(idx, 'instapay', e.target.value)}
                                  placeholder="username@instapay"
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">فودافون كاش (Vodafone Cash Number)</label>
                                <input
                                  className="form-input"
                                  value={shift.vodafone_cash || ''}
                                  onChange={(e) => updateShift(idx, 'vodafone_cash', e.target.value)}
                                  placeholder="010xxxxxxxx"
                                />
                              </div>
                            </div>

                            {/* Time Window */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              backgroundColor: 'var(--bg-subtle)',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              flexWrap: 'wrap',
                            }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--txt-heading)' }}>
                                فترة الوردية:
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.78rem' }}>من الساعة</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={shift.hour_from ?? ''}
                                  onChange={(e) => updateShift(idx, 'hour_from', e.target.value ? Number(e.target.value) : undefined)}
                                  style={{ width: '54px', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                                />
                                <select
                                  value={shift.period_from || 'am'}
                                  onChange={(e) => updateShift(idx, 'period_from', e.target.value)}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                >
                                  <option value="am">صباحاً (AM)</option>
                                  <option value="pm">مساءً (PM)</option>
                                </select>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.78rem' }}>إلى الساعة</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={shift.hour_to ?? ''}
                                  onChange={(e) => updateShift(idx, 'hour_to', e.target.value ? Number(e.target.value) : undefined)}
                                  style={{ width: '54px', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                                />
                                <select
                                  value={shift.period_to || 'pm'}
                                  onChange={(e) => updateShift(idx, 'period_to', e.target.value)}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                >
                                  <option value="am">صباحاً (AM)</option>
                                  <option value="pm">مساءً (PM)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 3: Smart Redirect Rules ── */}
                {activeTab === 'rules' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      backgroundColor: '#ecfeff',
                      border: '1px solid #a5f3fc',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0e7490' }}>
                          قواعد إعادة التوجيه الذكية (Redirect Rules)
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#155e75' }}>
                          وجه زوارك إلى روابط مخصصة حسب نوع أجهزتهم (هواتف، أجهزة لوحية، كمبيوتر) أو أوقات معينة.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addRule}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#0891b2',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={15} />
                        إضافة قاعدة تحويل
                      </button>
                    </div>

                    {rules.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--txt-muted)' }}>
                        لا توجد قواعد مخصصة. سيتم تحويل الزائر مباشرةً لصفحة النشاط الأساسية.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {rules.map((rule, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#ffffff',
                              borderRadius: '14px',
                              border: '1px solid var(--bdr-light)',
                              padding: '16px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '8px',
                                  backgroundColor: '#ecfeff',
                                  color: '#0891b2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                }}>
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={rule.label || ''}
                                  onChange={(e) => updateRule(idx, 'label', e.target.value)}
                                  placeholder="وصف القاعدة (مثال: مستخدمي الهواتف)"
                                  style={{
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    border: '1px solid transparent',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    outline: 'none',
                                    backgroundColor: 'var(--bg-subtle)',
                                  }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={rule.is_active !== false}
                                    onChange={(e) => updateRule(idx, 'is_active', e.target.checked)}
                                  />
                                  مفعلة
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeRule(idx)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px',
                                  }}
                                  title="حذف القاعدة"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Target Device & Redirect URL */}
                            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px' }}>
                              <div className="form-group">
                                <label className="form-label">الجهاز المستهدف</label>
                                <select
                                  className="form-input"
                                  value={rule.device_target}
                                  onChange={(e) => updateRule(idx, 'device_target', e.target.value)}
                                >
                                  <option value="any">جميع الأجهزة (Any)</option>
                                  <option value="mobile">الهواتف الذكية (Mobile)</option>
                                  <option value="tablet">الأجهزة اللوحية (Tablet)</option>
                                  <option value="desktop">الكمبيوتر المكتبي (Desktop)</option>
                                </select>
                              </div>

                              <div className="form-group">
                                <label className="form-label">رابط التحويل المباشر (Redirect URL)</label>
                                <input
                                  className="form-input"
                                  value={rule.redirect_url}
                                  onChange={(e) => updateRule(idx, 'redirect_url', e.target.value)}
                                  placeholder="https://menu.example.com أو https://wa.me/..."
                                  required
                                />
                              </div>
                            </div>

                            {/* Optional Time Window */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              backgroundColor: 'var(--bg-subtle)',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              flexWrap: 'wrap',
                            }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--txt-heading)' }}>
                                توقيت العمل (اختياري):
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.78rem' }}>من</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={rule.hour_from ?? ''}
                                  onChange={(e) => updateRule(idx, 'hour_from', e.target.value ? Number(e.target.value) : undefined)}
                                  placeholder="—"
                                  style={{ width: '48px', padding: '3px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                                />
                                <select
                                  value={rule.period_from || 'am'}
                                  onChange={(e) => updateRule(idx, 'period_from', e.target.value)}
                                  style={{ padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                >
                                  <option value="am">ص</option>
                                  <option value="pm">م</option>
                                </select>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.78rem' }}>إلى</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={rule.hour_to ?? ''}
                                  onChange={(e) => updateRule(idx, 'hour_to', e.target.value ? Number(e.target.value) : undefined)}
                                  placeholder="—"
                                  style={{ width: '48px', padding: '3px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                                />
                                <select
                                  value={rule.period_to || 'pm'}
                                  onChange={(e) => updateRule(idx, 'period_to', e.target.value)}
                                  style={{ padding: '3px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                >
                                  <option value="am">ص</option>
                                  <option value="pm">م</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--bdr-light)' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingCard(null)}
                  disabled={saving}
                  style={{ padding: '8px 16px', borderRadius: '10px' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                  }}
                >
                  {saving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ جميع التعديلات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MerchantCardsPage;
