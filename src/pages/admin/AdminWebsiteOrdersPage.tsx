import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { websiteApi } from '../../services';
import {
  WebsiteOrder,
  OrderStatus,
  OrderStats,
} from '../../services/api/websiteApi';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'قيد الانتظار', color: '#b45309', bg: '#fef3c7' },
  confirmed: { label: 'تم التأكيد', color: '#1d4ed8', bg: '#dbeafe' },
  processing: { label: 'جاري التجهيز', color: '#6d28d9', bg: '#ede9fe' },
  shipped: { label: 'تم الشحن', color: '#0369a1', bg: '#e0f2fe' },
  delivered: { label: 'تم التوصيل', color: '#15803d', bg: '#dcfce7' },
  cancelled: { label: 'ملغي', color: '#b91c1c', bg: '#fee2e2' },
};

export const AdminWebsiteOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        websiteApi.getOrders({
          search: search || undefined,
          status: statusFilter || undefined,
          limit: 50,
        }),
        websiteApi.getOrderStats(),
      ]);
      setOrders(ordersRes.orders || []);
      setStats(statsRes);
    } catch (err: any) {
      showToast('تعذر تحميل الطلبات: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      await websiteApi.updateOrderStatus(orderId, newStatus);
      showToast('تم تحديث حالة الطلب بنجاح', 'success');
      loadData();
    } catch (err: any) {
      showToast('تعذر تحديث الحالة: ' + err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الطلب ${orderId} نهائياً؟`)) {
      return;
    }
    try {
      await websiteApi.deleteOrder(orderId);
      showToast('تم حذف الطلب بنجاح', 'success');
      loadData();
    } catch (err: any) {
      showToast('تعذر حذف الطلب: ' + err.message, 'error');
    }
  };

  const getCleanPhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '2' + cleaned;
    }
    return cleaned;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
            borderRight: toast.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444',
            direction: 'rtl',
            fontFamily: 'inherit',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} color="#10b981" /> : <AlertCircle size={20} color="#ef4444" />}
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'linear-gradient(135deg, #092c3e 0%, #0369a1 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px -10px rgba(3, 105, 161, 0.4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={28} style={{ color: '#7dd3fc' }} />
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              طلبات الشراء والمبيعات
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.92rem', opacity: 0.9, color: '#e0f2fe' }}>
            متابعة فورية لطلبات العملاء من الموقع، التواصل عبر الواتساب بنقرة واحدة، وتحديث حالات الشحن.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>إجمالي الطلبات</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{stats.totalOrders}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>قيد الانتظار</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>{stats.pending}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1' }}>تم الشحن</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0369a1', marginTop: '4px' }}>{stats.shipped}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>تم التوصيل</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>{stats.delivered}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f766e' }}>إجمالي الإيرادات</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
              {stats.totalRevenue.toLocaleString()} جنيه
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', background: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، رقم الهاتف، كود الطلب، أو المدينة..."
              style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
          >
            بحث
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} style={{ color: '#64748b' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', fontWeight: 600 }}
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">تم التأكيد</option>
            <option value="processing">جاري التجهيز</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التوصيل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
          <Loader2 size={32} className="spin" style={{ color: '#0284c7' }} />
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>جاري تحميل الطلبات...</span>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <ShoppingCart size={48} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: 0 }}>لا توجد طلبات مطابقة</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>لم يتم العثور على أي طلب في الوقت الحالي.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const statusConfig = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
            const cleanPhone = getCleanPhone(order.customer.phone);
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `مرحباً ${order.customer.name}، بخصوص طلبك رقم ${order.orderId} من موقع K2rty...`
            )}`;

            return (
              <div
                key={order.orderId}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                }}
              >
                {/* Top Row: Order ID, Date, Status */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                      #{order.orderId}
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: statusConfig.bg,
                        color: statusConfig.color,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleString('ar-EG')}
                    </div>

                    <select
                      value={order.status}
                      disabled={updatingId === order.orderId}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        background: '#f8fafc',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">تم التأكيد</option>
                      <option value="processing">جاري التجهيز</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغي</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.orderId)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="حذف الطلب"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Middle: Customer details & Items */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Customer info */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      👤 {order.customer.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} style={{ color: '#64748b' }} />
                      <span style={{ fontSize: '0.88rem', color: '#334155', direction: 'ltr' }}>
                        {order.customer.phone}
                      </span>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#22c55e',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <MessageCircle size={13} />
                        مراسلة عبر واتساب
                      </a>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                      <MapPin size={14} style={{ color: '#64748b' }} />
                      <span>{order.customer.city} - {order.customer.address || 'العنوان غير محدد'}</span>
                    </div>

                    {order.notes && (
                      <div style={{ fontSize: '0.82rem', color: '#64748b', background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                        <strong>ملاحظة العميل:</strong> {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Items info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>عناصر الطلب:</div>
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                            {item.productName} <span style={{ color: '#0284c7' }}>(x{item.quantity})</span>
                          </div>
                          {item.options && Object.keys(item.options).length > 0 && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                              {Object.entries(item.options).map(([k, v]) => `${k === 'customName' ? 'الاسم' : k}: ${v}`).join(' | ')}
                            </div>
                          )}
                        </div>

                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                          {((item.price && item.price > 0 ? item.price : 450) * (item.quantity || 1))} جنيه
                        </div>
                      </div>
                    ))}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>المجموع الكلي:</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f766e' }}>
                        {order.totalAmount && order.totalAmount > 0
                          ? order.totalAmount
                          : (order.items || []).reduce((sum, it) => sum + ((it.price && it.price > 0 ? it.price : 450) * (it.quantity || 1)), 0)} جنيه
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
