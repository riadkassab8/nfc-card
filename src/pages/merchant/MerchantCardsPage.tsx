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
  Phone,
  MessageCircle,
  MapPin,
  Instagram,
  Facebook,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cardsApi } from '../../services';
import { ApiCard, BusinessData, fmtDate, isSubscriptionExpired } from '../../types';
import QRCode from 'qrcode';

export const MerchantCardsPage: React.FC = () => {
  const { admin } = useAuth();
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit modal
  const [editingCard, setEditingCard] = useState<ApiCard | null>(null);
  const [editForm, setEditForm] = useState<BusinessData>({});
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
    setEditForm({ ...(card.business_data || {}) });
  };

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

      // Note: backend automatically ignores subscription dates/system fields for merchant
      await cardsApi.updateCard(editingCard._id, {
        business_data: cleanForm,
      });

      showToast('تم حفظ وتحديث بيانات وروابط المتجر بنجاح! ✓', 'success');
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
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#16a34a' : '#dc2626',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '14px',
          zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--txt-heading)' }}>
            إدارة بطاقات وروابط المتجر
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--txt-muted)' }}>
            يمكنك من هنا تعديل روابط التواصل، الواتساب، التقييمات، والمنيو لكل بطاقة من بطاقاتك.
          </p>
        </div>

        <button
          onClick={loadCards}
          className="btn-outline"
          style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '10px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> تحديث القائمة
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--txt-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
          <span>جاري تحميل بطاقات المتجر...</span>
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

                  {/* Active links badges preview */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {b.whatsapp && <span style={pillStyle}><MessageCircle size={12} color="#16a34a" /> واتساب</span>}
                    {b.phone && <span style={pillStyle}><Phone size={12} color="#2563eb" /> هاتف</span>}
                    {b.google_maps && <span style={pillStyle}><MapPin size={12} color="#ea580c" /> الموقع</span>}
                    {b.google_review_url && <span style={pillStyle}><Star size={12} color="#eab308" /> تقييم جوجل</span>}
                    {b.instagram && <span style={pillStyle}><Instagram size={12} color="#d946ef" /> انستجرام</span>}
                    {b.facebook && <span style={pillStyle}><Facebook size={12} color="#1d4ed8" /> فيسبوك</span>}
                    {b.website && <span style={pillStyle}><Globe size={12} color="#0284c7" /> موقع</span>}
                  </div>

                  {/* Subscription details (Read only) */}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '12px',
                    color: 'var(--txt-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <Calendar size={13} />
                    <span>
                      {!card.requires_subscription
                        ? 'اشتراك دائم مفتوح'
                        : card.subscription_end_date
                        ? `ينتهي الاشتراك بتاريخ: ${fmtDate(card.subscription_end_date)}`
                        : 'اشتراك سارٍ'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--bdr-light)',
                  flexWrap: 'wrap',
                }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(card)}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      fontSize: '13px',
                      padding: '9px 14px',
                      borderRadius: '10px',
                      justifyContent: 'center',
                    }}
                  >
                    <Edit2 size={14} />
                    <span>تعديل الروابط والبيانات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyUrl(card)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--bdr-light)',
                      color: 'var(--txt-secondary)',
                      fontSize: '13px',
                      fontWeight: 700,
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

      {/* Edit Business Data Modal */}
      {editingCard && (
        <div className="modal-overlay" onClick={() => setEditingCard(null)}>
          <div
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            style={{ maxWidth: '640px', width: '92%' }}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">تعديل بيانات وروابط البطاقة</h2>
                <span style={{ fontSize: '12px', color: 'var(--txt-muted)', fontFamily: 'monospace' }}>
                  كود البطاقة: {editingCard.card_code}
                </span>
              </div>
              <button className="modal-close" onClick={() => setEditingCard(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '68vh', overflowY: 'auto' }}>
                {/* 1. Basic Info */}
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)' }}>
                    المعلومات الأساسية للمحل
                  </div>

                  <div className="form-group">
                    <label className="form-label">اسم النشاط التجاري</label>
                    <input
                      className="form-input"
                      value={editForm.business_name || ''}
                      onChange={(e) => setEditForm(p => ({ ...p, business_name: e.target.value }))}
                      placeholder="مثال: مطعم وكافيه الأندلس"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">وصف النشاط</label>
                    <textarea
                      className="form-input"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="أشهى المأكولات والمشروبات..."
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

                {/* 2. Direct Contact & Location */}
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)' }}>
                    التواصل المباشر والموقع
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                        placeholder="01012345678"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">رابط خرائط جوجل (Google Maps)</label>
                    <input
                      className="form-input"
                      value={editForm.google_maps || ''}
                      onChange={(e) => setEditForm(p => ({ ...p, google_maps: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الموقع الإلكتروني أو رابط المنيو</label>
                    <input
                      className="form-input"
                      value={editForm.website || ''}
                      onChange={(e) => setEditForm(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://yourstore.com"
                    />
                  </div>
                </div>

                {/* 3. Google Reviews Gate */}
                <div style={{
                  backgroundColor: '#fefce8',
                  border: '1px solid #fef08a',
                  padding: '14px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13.5px', color: '#854d0e' }}>
                    <Star size={16} color="#ca8a04" />
                    <span>تقييمات العملاء (Google Review)</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">رابط تقييم جوجل المباشر للمحل</label>
                    <input
                      className="form-input"
                      value={editForm.google_review_url || ''}
                      onChange={(e) => setEditForm(p => ({ ...p, google_review_url: e.target.value }))}
                      placeholder="https://g.page/r/your-review-link"
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      checked={!!editForm.enable_review_gate}
                      onChange={(e) => setEditForm(p => ({ ...p, enable_review_gate: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#ca8a04' }}
                    />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#854d0e' }}>
                      تفعيل الفلترة الذكية (توجيه 5 نجوم لخرائط جوجل والشكاوى إلى واتساب المحل)
                    </span>
                  </label>
                </div>

                {/* 4. Social Media & Payments */}
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt-heading)' }}>
                    السوشيال ميديا والدفع
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">إنستجرام (Instagram)</label>
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
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">حساب إنستاباي (InstaPay)</label>
                      <input
                        className="form-input"
                        value={editForm.instapay || ''}
                        onChange={(e) => setEditForm(p => ({ ...p, instapay: e.target.value }))}
                        placeholder="username@instapay"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">محفظة فودافون كاش</label>
                      <input
                        className="form-input"
                        value={editForm.vodafone_cash || ''}
                        onChange={(e) => setEditForm(p => ({ ...p, vodafone_cash: e.target.value }))}
                        placeholder="01012345678"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditingCard(null)}
                  disabled={saving}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{ minWidth: '130px', justifyContent: 'center' }}
                >
                  {saving ? (
                    <><RefreshCw size={15} className="spin" /> جاري الحفظ...</>
                  ) : (
                    <><Save size={15} /> حفظ البيانات</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  border: '1px solid var(--bdr-light)',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--txt-secondary)',
};
