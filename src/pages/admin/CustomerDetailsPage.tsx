import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApi } from '../../services';
import { ApiCustomerDetailResponse, fmtDate } from '../../types';
import { AssignCardsModal } from '../../components/admin/AssignCardsModal';
import { CustomerModal } from '../../components/admin/CustomerModal';
import { CustomerHistorySection } from '../../components/admin/CustomerHistorySection';
import {
  User, Phone, Mail, MapPin, CreditCard,
  Unlink, Plus, ArrowRight, RefreshCw, AlertTriangle, Edit2, History
} from 'lucide-react';


type ToastType = 'success' | 'error' | 'info';

const Toast: React.FC<{ msg: string; type: ToastType; onClose: () => void }> = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const cls = type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info';
  return (
    <div className={`toast ${cls}`}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem', padding: '0 2px' }}
      >
        ✕
      </button>
    </div>
  );
};

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ApiCustomerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'cards' | 'history'>('cards');
  const [historyCount, setHistoryCount] = useState<number | null>(null);

  // Modals & Actions
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<{ id: string; code: string } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => setToast({ msg, type });

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await customersApi.getCustomerById(id);
      setData(res);
      // Fetch history count silently
      customersApi
        .getCustomerHistory(id)
        .then((h) => {
          const items = Array.isArray(h) ? h : (h as any)?.data || [];
          setHistoryCount(items.length);
        })
        .catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل بيانات العميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUnassign = async () => {
    if (!id || !unassignTarget) return;
    setUnassignLoading(true);
    try {
      await customersApi.unassignCard(id, unassignTarget.id);
      showToast(`تم فك ارتباط الكارت ${unassignTarget.code} بالعميل بنجاح ✓`, 'success');
      setUnassignTarget(null);
      fetchDetails();
    } catch (err: any) {
      showToast(err?.message || 'فشل فك ارتباط الكارت', 'error');
    } finally {
      setUnassignLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
        <div className="shimmer" style={{ height: '50px', borderRadius: '16px' }} />
        <div className="shimmer" style={{ height: '220px', borderRadius: '20px' }} />
        <div className="shimmer" style={{ height: '350px', borderRadius: '20px' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: '450px',
            margin: '40px auto',
            padding: '30px',
            backgroundColor: '#fff',
            borderRadius: '20px',
            border: '1px solid var(--bdr-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <AlertTriangle size={42} style={{ color: 'var(--clr-error)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>خطأ في تحميل العميل</h2>
          <p style={{ color: 'var(--txt-muted)', fontSize: '14px', marginBottom: '20px' }}>{error || 'لم يتم العثور على العميل'}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/admin/customers')} className="btn-outline">
              الرجوع لقائمة العملاء
            </button>
            <button onClick={fetchDetails} className="btn-primary">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { customer, summary, cards } = data;
  const existingCardIds = (cards || []).map((c) => c._id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Unassign Confirm Modal */}
      {unassignTarget && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--r-2xl)',
              padding: '28px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              animation: 'modalIn 220ms var(--ease-out) both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--clr-warning-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Unlink size={20} style={{ color: 'var(--clr-warning)' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                  فك ارتباط الكارت
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--txt-secondary)', margin: 0, lineHeight: 1.5 }}>
                  هل أنت متأكد من فك ارتباط الكارت <strong>{unassignTarget.code}</strong> من العميل <strong>{customer.name}</strong>؟
                  <br />
                  <span style={{ fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                    سيصبح الكارت حراً في المخزن دون حذفه من النظام.
                  </span>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setUnassignTarget(null)} className="btn-outline" disabled={unassignLoading}>
                إلغاء
              </button>
              <button
                onClick={handleUnassign}
                disabled={unassignLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '9px 18px',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  backgroundColor: 'var(--clr-warning)',
                  color: '#fff',
                  cursor: unassignLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 'var(--fs-base)',
                  opacity: unassignLoading ? 0.7 : 1,
                }}
              >
                {unassignLoading ? <><RefreshCw size={14} className="spin" /> فك الارتباط...</> : 'تأكيد فك الارتباط'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editCustomerOpen && (
        <CustomerModal
          customer={customer}
          onClose={() => setEditCustomerOpen(false)}
          onSuccess={() => {
            fetchDetails();
          }}
          onToast={showToast}
        />
      )}

      {/* Assign Cards Modal */}
      {assignModalOpen && (
        <AssignCardsModal
          customerId={customer._id}
          customerName={customer.name}
          existingCardIds={existingCardIds}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={() => {
            fetchDetails();
          }}
          onToast={showToast}
        />
      )}

      {/* Back link & Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => navigate('/admin/customers')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--clr-primary-600)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
          }}
        >
          <ArrowRight size={16} /> العودة لقائمة العملاء
        </button>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab(activeTab === 'history' ? 'cards' : 'history')}
            className="btn-outline"
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: activeTab === 'history' ? 'var(--clr-primary-500)' : undefined,
              backgroundColor: activeTab === 'history' ? 'var(--clr-primary-50)' : undefined,
              color: activeTab === 'history' ? 'var(--clr-primary-700)' : undefined,
            }}
          >
            <History size={15} />
            <span>{activeTab === 'history' ? 'عرض البطاقات' : 'سجل العمليات'}</span>
            {historyCount !== null && (
              <span
                style={{
                  backgroundColor: activeTab === 'history' ? 'var(--clr-primary-600)' : 'var(--bg-subtle)',
                  color: activeTab === 'history' ? '#fff' : 'var(--txt-secondary)',
                  borderRadius: '12px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {historyCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setEditCustomerOpen(true)}
            className="btn-outline"
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Edit2 size={15} /> تعديل بيانات العميل
          </button>
          <button
            onClick={() => setAssignModalOpen(true)}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} /> ربط كروت جديدة
          </button>
        </div>
      </div>

      {/* Customer Info Card Header */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          border: '1px solid var(--bdr-light)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--clr-primary-50)',
                color: 'var(--clr-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--clr-primary-200)',
              }}
            >
              <User size={28} />
            </div>
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                {customer.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={`tel:${customer.phone}`}
                  dir="ltr"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--clr-primary-600)',
                  }}
                >
                  <Phone size={14} /> {customer.phone}
                </a>
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    dir="ltr"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '13.5px',
                      color: 'var(--txt-secondary)',
                    }}
                  >
                    <Mail size={14} /> {customer.email}
                  </a>
                )}
                {customer.city && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: 'var(--txt-secondary)',
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '3px 10px',
                      borderRadius: '8px',
                    }}
                  >
                    <MapPin size={13} style={{ color: 'var(--txt-muted)' }} /> {customer.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Badges Summary */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: 'var(--clr-primary-50)',
                border: '1px solid var(--clr-primary-200)',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--clr-primary-700)', marginBottom: '2px' }}>
                إجمالي الكروت
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--clr-primary-800)' }}>
                {summary?.total_cards ?? cards.length}
              </div>
            </div>

            <div
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: 'var(--clr-success-bg)',
                border: '1px solid var(--clr-success-bdr)',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--clr-success)', marginBottom: '2px' }}>
                الكروت النشطة
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--clr-success)' }}>
                {summary?.active_cards ?? cards.filter((c) => c.status === 'active').length}
              </div>
            </div>

            <div
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: summary?.inactive_cards > 0 ? 'var(--clr-error-bg)' : 'var(--bg-subtle)',
                border: `1px solid ${summary?.inactive_cards > 0 ? 'var(--clr-error-bdr)' : 'var(--bdr-light)'}`,
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: summary?.inactive_cards > 0 ? 'var(--clr-error)' : 'var(--txt-muted)',
                  marginBottom: '2px',
                }}
              >
                غير النشطة
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: summary?.inactive_cards > 0 ? 'var(--clr-error)' : 'var(--txt-secondary)',
                }}
              >
                {summary?.inactive_cards ?? cards.filter((c) => c.status === 'inactive').length}
              </div>
            </div>

            <div
              onClick={() => setActiveTab('history')}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: activeTab === 'history' ? 'var(--clr-primary-100)' : 'var(--bg-subtle)',
                border: `1px solid ${activeTab === 'history' ? 'var(--clr-primary-300)' : 'var(--bdr-light)'}`,
                textAlign: 'center',
                minWidth: '100px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="اضغط للانتقال لسجل الحركات"
            >
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: activeTab === 'history' ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <History size={12} /> سجل الحركات
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: activeTab === 'history' ? 'var(--clr-primary-800)' : 'var(--clr-primary-600)',
                }}
              >
                {historyCount !== null ? historyCount : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Address and Notes row */}
        {(customer.address || customer.notes) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: customer.address && customer.notes ? '1fr 1fr' : '1fr',
              gap: '14px',
              backgroundColor: 'var(--bg-subtle)',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid var(--bdr-light)',
            }}
          >
            {customer.address && (
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt-muted)', display: 'block', marginBottom: '2px' }}>
                  العنوان التفصيلي:
                </span>
                <span style={{ fontSize: '13.5px', color: 'var(--txt-body)', fontWeight: 600 }}>{customer.address}</span>
              </div>
            )}
            {customer.notes && (
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt-muted)', display: 'block', marginBottom: '2px' }}>
                  ملاحظات الاتفاق:
                </span>
                <span style={{ fontSize: '13.5px', color: 'var(--txt-body)', fontWeight: 500 }}>{customer.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid var(--bdr-light)',
          paddingBottom: '0',
          marginTop: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            border: 'none',
            borderBottom: activeTab === 'cards' ? '3px solid var(--clr-primary-600)' : '3px solid transparent',
            marginBottom: '-2px',
            backgroundColor: 'transparent',
            color: activeTab === 'cards' ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
            fontWeight: activeTab === 'cards' ? 800 : 600,
            fontSize: '14.5px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <CreditCard size={18} />
          <span>البطاقات المربوطة ({cards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid var(--clr-primary-600)' : '3px solid transparent',
            marginBottom: '-2px',
            backgroundColor: 'transparent',
            color: activeTab === 'history' ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
            fontWeight: activeTab === 'history' ? 800 : 600,
            fontSize: '14.5px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <History size={18} />
          <span>سجل العمليات (Activity Log)</span>
          {historyCount !== null && (
            <span
              style={{
                backgroundColor: activeTab === 'history' ? 'var(--clr-primary-100)' : 'var(--bg-subtle)',
                color: activeTab === 'history' ? 'var(--clr-primary-800)' : 'var(--txt-muted)',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              {historyCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'cards' ? (
        /* Cards Table Section */
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            border: '1px solid var(--bdr-light)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--bdr-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={20} style={{ color: 'var(--clr-primary-600)' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--txt-heading)' }}>
              البطاقات المربوطة بهذا العميل ({cards.length})
            </h2>
          </div>

          <button
            onClick={() => setAssignModalOpen(true)}
            className="btn-primary"
            style={{
              padding: '7px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} /> + ربط كروت بهذا العميل
          </button>
        </div>

        {cards.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
            <CreditCard size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: 'var(--txt-secondary)' }}>
              لا توجد كروت مربوطة بهذا العميل حتى الآن
            </p>
            <p style={{ fontSize: '13px', margin: '0 0 18px', color: 'var(--txt-muted)' }}>
              يمكنك ربط البطاقات المجهزة أو المتوفرة في المخزن بالضغط على الزر أدناه
            </p>
            <button onClick={() => setAssignModalOpen(true)} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '10px' }}>
              <Plus size={15} /> ربط كروت الآن
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--bdr-light)' }}>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>كود البطاقة</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>الرابط المخصص</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>نوع الكارت</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>الحالة</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>الاشتراك</th>
                  <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '12.5px', fontWeight: 800 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => {
                  const isExpired =
                    card.requires_subscription &&
                    card.subscription_end_date &&
                    new Date(card.subscription_end_date) < new Date();

                  return (
                    <tr
                      key={card._id}
                      style={{
                        borderBottom: '1px solid var(--bdr-light)',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '14px', color: 'var(--txt-heading)' }}>
                          {card.card_code}
                        </span>
                      </td>

                      <td style={{ padding: '12px 18px' }}>
                        {card.custom_slug ? (
                          <span style={{ fontFamily: 'monospace', color: 'var(--clr-primary-700)', fontWeight: 700, fontSize: '13px' }}>
                            /{card.custom_slug}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--txt-muted)', fontSize: '13px' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--txt-secondary)',
                            border: '1px solid var(--bdr-light)',
                          }}
                        >
                          {card.card_type}
                        </span>
                      </td>

                      <td style={{ padding: '12px 18px' }}>
                        <span
                          className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-error'}`}
                          style={{ fontSize: '11px', padding: '3px 9px' }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: 'currentColor',
                              display: 'inline-block',
                              marginLeft: '5px',
                            }}
                          />
                          {card.status === 'active' ? 'نشطة' : 'معطلة'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 18px', fontSize: '12.5px' }}>
                        {!card.requires_subscription ? (
                          <span
                            style={{
                              color: 'var(--clr-success)',
                              fontWeight: 800,
                              fontSize: '11px',
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              padding: '3px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            دائم ♾
                          </span>
                        ) : isExpired ? (
                          <span style={{ color: 'var(--clr-error)', fontWeight: 700 }}>
                            منتهي ({fmtDate(card.subscription_end_date)})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--txt-secondary)' }}>
                            {card.subscription_end_date ? fmtDate(card.subscription_end_date) : 'ساري'}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                        <button
                          onClick={() => setUnassignTarget({ id: card._id, code: card.card_code })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--clr-warning-bdr)',
                            backgroundColor: 'var(--clr-warning-bg)',
                            color: 'var(--clr-warning)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 700,
                            fontFamily: 'var(--font)',
                            transition: 'all 0.15s ease',
                          }}
                          title="فك ارتباط الكارت من العميل ليعود حراً"
                        >
                          <Unlink size={13} />
                          <span>فك الارتباط</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : (
        <CustomerHistorySection
          customerId={customer._id}
          customerName={customer.name}
          onCountUpdate={(cnt) => setHistoryCount(cnt)}
        />
      )}
    </div>
  );
};

export default CustomerDetailsPage;
