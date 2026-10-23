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
  Edit2,
  Loader2,
  AlertCircle,
  CreditCard,
  Eye,
  ExternalLink,
  X,
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
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [editingOrder, setEditingOrder] = useState<WebsiteOrder | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handleOpenEdit = (order: WebsiteOrder) => {
    setEditingOrder(order);
    setEditFormData({
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerCity: order.customer.city,
      customerAddress: order.customer.address || '',
      notes: order.notes || '',
      totalAmount: order.totalAmount,
      status: order.status,
      customPrintText: order.customPrint?.text || '',
      customPrintNotes: order.customPrint?.notes || '',
      customPrintImageUrl: order.customPrint?.imageUrl || '',
      items: (order.items || []).map((it) => ({
        ...it,
        options: { ...(it.options || {}) },
      })),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      setSavingEdit(true);
      const payload: Partial<WebsiteOrder> = {
        customer: {
          name: editFormData.customerName,
          phone: editFormData.customerPhone,
          city: editFormData.customerCity,
          address: editFormData.customerAddress,
        },
        notes: editFormData.notes,
        totalAmount: Number(editFormData.totalAmount) || editingOrder.totalAmount,
        status: editFormData.status,
        items: editFormData.items,
        customPrint: editFormData.customPrintText
          ? {
              text: editFormData.customPrintText,
              notes: editFormData.customPrintNotes || '',
              imageUrl: editFormData.customPrintImageUrl || '',
            }
          : undefined,
      };

      await websiteApi.updateOrder(editingOrder.orderId, payload);
      showToast('تم تحديث بيانات الطلب بنجاح', 'success');
      setEditingOrder(null);
      loadData();
    } catch (err: any) {
      showToast('تعذر تحديث الطلب: ' + (err.message || 'خطأ'), 'error');
    } finally {
      setSavingEdit(false);
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
                      onClick={() => handleOpenEdit(order)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f0f9ff',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="تعديل بيانات الطلب"
                    >
                      <Edit2 size={13} />
                      تعديل
                    </button>

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

                    {/* Custom Print Details */}
                    {order.customPrint && (
                      <div
                        style={{
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          borderRadius: '10px',
                          padding: '12px',
                          marginTop: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1' }}>
                            🎨 طلب طباعة مخصصة
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                            +150 ج
                          </span>
                        </div>
                        <div style={{ fontSize: '0.86rem', color: '#0f172a' }}>
                          <strong>النص المطلوب:</strong> {order.customPrint.text}
                        </div>
                        {order.customPrint.notes && (
                          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                            <strong>ملاحظات:</strong> {order.customPrint.notes}
                          </div>
                        )}
                        {order.customPrint.imageUrl && (
                          <div style={{ marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(order.customPrint!.imageUrl!)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#ffffff',
                                color: '#0284c7',
                                border: '1px solid #0284c7',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <Eye size={13} />
                              عرض صورة الشعار/التصميم 🖼️
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Method & Transfer Receipt */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                      {order.paymentMethod && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}
                        >
                          <CreditCard size={13} style={{ color: '#0284c7' }} />
                          {order.paymentMethod === 'vodafone_cash'
                            ? 'فودافون كاش'
                            : order.paymentMethod === 'instapay'
                            ? 'إنستا باي'
                            : order.paymentMethod === 'cod'
                            ? 'الدفع عند الاستلام'
                            : order.paymentMethod}
                        </span>
                      )}

                      {order.receiptUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(order.receiptUrl!)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#e0f2fe',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={13} />
                            عرض إيصال التحويل 🧾
                          </button>
                          <a
                            href={order.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#64748b',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            title="فتح الرابط في نافذة جديدة"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          بدون إيصال مرفق
                        </span>
                      )}
                    </div>
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
                              {Object.entries(item.options).map(([k, v]) => {
                                const isCp = k === 'custom_print';
                                const isYes = v === 'yes';
                                const label = isCp ? (isYes ? '🎨 طباعة مخصصة (+150 ج)' : 'تصميم افتراضي') : `${k === 'color' ? 'اللون' : k}: ${v}`;
                                return label;
                              }).join(' | ')}
                            </div>
                          )}
                        </div>

                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                          {((item.price && item.price > 0 ? item.price : 650) * (item.quantity || 1))} جنيه
                        </div>
                      </div>
                    ))}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>المجموع الكلي:</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f766e' }}>
                        {order.totalAmount && order.totalAmount > 0
                          ? order.totalAmount
                          : (order.items || []).reduce((sum, it) => sum + ((it.price && it.price > 0 ? it.price : 650) * (it.quantity || 1)), 0)} جنيه
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div
          onClick={() => setEditingOrder(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 999998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
            direction: 'rtl',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '26px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: '#0284c7' }} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  تعديل بيانات الطلب #{editingOrder.orderId}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.customerName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.customerPhone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    المدينة / المحافظة
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.customerCity || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customerCity: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    العنوان بالتفصيل
                  </label>
                  <input
                    type="text"
                    value={editFormData.customerAddress || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customerAddress: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    إجمالي المبلغ (جنيه)
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.totalAmount || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, totalAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    حالة الطلب
                  </label>
                  <select
                    value={editFormData.status || 'pending'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff', fontWeight: 600 }}
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">تم التأكيد</option>
                    <option value="processing">جاري التجهيز</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              {/* Items editing (Quantity & Custom Print Option) */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                  📦 عناصر الطلب والطباعة المخصصة:
                </div>
                {(editFormData.items || []).map((it: any, i: number) => {
                  const cpVal = it.options?.custom_print || 'no';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{it.productName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>نوع الطباعة:</span>
                          <select
                            value={cpVal}
                            onChange={(e) => {
                              const newItems = [...editFormData.items];
                              newItems[i].options = { ...(newItems[i].options || {}), custom_print: e.target.value };
                              setEditFormData({ ...editFormData, items: newItems });
                            }}
                            style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                          >
                            <option value="no">تصميم افتراضي (650 ج)</option>
                            <option value="yes">طباعة مخصصة (800 ج)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <label style={{ fontSize: '0.78rem', color: '#64748b' }}>الكمية:</label>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity || 1}
                          onChange={(e) => {
                            const newItems = [...editFormData.items];
                            newItems[i].quantity = Math.max(1, Number(e.target.value) || 1);
                            setEditFormData({ ...editFormData, items: newItems });
                          }}
                          style={{ width: '55px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', textAlign: 'center', fontWeight: 700 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Print Details Box */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0369a1' }}>
                  🎨 بيانات الطباعة المخصصة
                </span>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>
                    النص المطلوب طباعته
                  </label>
                  <input
                    type="text"
                    value={editFormData.customPrintText || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customPrintText: e.target.value })}
                    placeholder="مثال: اسم المحل أو الشعار"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>
                    ملاحظات الطباعة المخصصة
                  </label>
                  <input
                    type="text"
                    value={editFormData.customPrintNotes || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customPrintNotes: e.target.value })}
                    placeholder="أي ملاحظات خاصة بالتصميم..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>
                    رابط صورة التصميم / الشعار
                  </label>
                  <input
                    type="text"
                    value={editFormData.customPrintImageUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customPrintImageUrl: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  ملاحظات عامة على الطلب
                </label>
                <textarea
                  rows={2}
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ padding: '8px 22px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: 800, cursor: savingEdit ? 'not-allowed' : 'pointer' }}
                >
                  {savingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen Receipt Preview Modal */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  🧾 صورة إيصال التحويل
                </span>
                <a
                  href={selectedReceipt}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: '#0284c7',
                    textDecoration: 'none',
                    fontWeight: 700,
                  }}
                >
                  فتح الصورة بحجمها الأصلي
                  <ExternalLink size={13} />
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image Body */}
            <div
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: 'calc(90vh - 80px)',
                overflow: 'auto',
                background: '#090d16',
              }}
            >
              <img
                src={selectedReceipt}
                alt="إيصال التحويل"
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
