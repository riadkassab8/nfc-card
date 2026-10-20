import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cardsApi } from '../../services';
import { ApiCard } from '../../types';
import {
  ArrowDownUp, ClipboardList, Download, Edit3, Eye, Filter, MapPin,
  PackageCheck, Plus, RefreshCw, Search, ShoppingBag, Trash2, X,
} from 'lucide-react';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface StoreOrder {
  id: string;
  customerName: string;
  phone: string;
  items: string;
  cards: ApiCard[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'nfc_store_orders_v1';
const CHANGE_EVENT = 'nfc-store-orders-changed';
const PAGE_SIZE = 8;
const CARD_UNIT_PRICE = 500;
const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'جديد', processing: 'قيد التجهيز', shipped: 'تم الشحن', completed: 'مكتمل', cancelled: 'ملغي',
};
const PAYMENT_LABELS: Record<PaymentStatus, string> = { unpaid: 'غير مدفوع', partial: 'مدفوع جزئيًا', paid: 'مدفوع بالكامل', refunded: 'مسترد' };
const STATUS_COLORS: Record<OrderStatus, { color: string; bg: string; dot: string }> = {
  new: { color: '#1d4ed8', bg: '#eff6ff', dot: '#3b82f6' },
  processing: { color: '#a16207', bg: '#fefce8', dot: '#eab308' },
  shipped: { color: '#6d28d9', bg: '#f5f3ff', dot: '#8b5cf6' },
  completed: { color: '#047857', bg: '#ecfdf5', dot: '#10b981' },
  cancelled: { color: '#b91c1c', bg: '#fef2f2', dot: '#ef4444' },
};

const readOrders = (): StoreOrder[] => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.map((order) => ({
      ...order,
      cards: Array.isArray(order.cards) ? order.cards : [],
      paidAmount: typeof order.paidAmount === 'number' ? order.paidAmount : order.paymentStatus === 'paid' ? Number(order.total || 0) : 0,
    })) : [];
  } catch { return []; }
};

const persistOrders = (orders: StoreOrder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

const makeId = () => {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8).toUpperCase()
    : Math.random().toString(36).slice(2, 10).toUpperCase();
  return `ORD-${suffix}`;
};

const formatMoney = (value: number) => new Intl.NumberFormat('ar-EG-u-nu-latn', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 2,
}).format(value || 0);

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
};

const getPaidAmount = (order: Pick<StoreOrder, 'paymentStatus' | 'paidAmount' | 'total'>) =>
  order.paymentStatus === 'refunded' ? 0 : order.paidAmount ?? (order.paymentStatus === 'paid' ? order.total : 0);
const getRemainingAmount = (order: Pick<StoreOrder, 'paymentStatus' | 'paidAmount' | 'total'>) =>
  order.paymentStatus === 'refunded' ? 0 : Math.max(0, order.total - getPaidAmount(order));

type OrderForm = Pick<StoreOrder, 'customerName' | 'phone' | 'cards' | 'total' | 'status' | 'paymentStatus' | 'paidAmount' | 'address' | 'notes'>;
const EMPTY_FORM: OrderForm = {
  customerName: '', phone: '', cards: [], total: 0, status: 'new', paymentStatus: 'unpaid', paidAmount: 0, address: '', notes: '',
};

const fieldStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #dbe3ef', borderRadius: 10,
  padding: '10px 12px', color: '#172033', background: '#fff', font: 'inherit', outline: 'none',
};
const labelStyle: React.CSSProperties = { display: 'grid', gap: 7, color: '#475569', fontSize: 13, fontWeight: 700 };
const buttonStyle: React.CSSProperties = {
  border: '1px solid #dbe3ef', borderRadius: 10, background: '#fff', color: '#334155',
  padding: '9px 12px', font: 'inherit', fontSize: 13, fontWeight: 700, display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', whiteSpace: 'nowrap',
};

export const AdminOrdersPage: React.FC = () => {
  const { can } = useAuth();
  const [orders, setOrders] = useState<StoreOrder[]>(readOrders);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [sortKey, setSortKey] = useState<'createdAt' | 'customerName' | 'total'>('createdAt');
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [inventoryCards, setInventoryCards] = useState<ApiCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState('');
  const [cardSearch, setCardSearch] = useState('');
  const [editing, setEditing] = useState<StoreOrder | null>(null);
  const [viewing, setViewing] = useState<StoreOrder | null>(null);
  const [deleting, setDeleting] = useState<StoreOrder | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const sync = () => setOrders(readOrders());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    let active = true;
    cardsApi.getAllCardsForStats()
      .then((cards) => { if (active) setInventoryCards(cards); })
      .catch((error: any) => { if (active) setCardsError(error?.message || 'تعذر تحميل البطاقات من المخزون.'); })
      .finally(() => { if (active) setCardsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const counts = useMemo(() => ({
    all: orders.length,
    new: orders.filter((order) => order.status === 'new').length,
    processing: orders.filter((order) => order.status === 'processing').length,
    completed: orders.filter((order) => order.status === 'completed').length,
    revenue: orders.filter((order) => order.paymentStatus !== 'refunded' && order.status !== 'cancelled')
      .reduce((sum, order) => sum + getPaidAmount(order), 0),
  }), [orders]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ar');
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const haystack = `${order.id} ${order.customerName} ${order.phone} ${order.items}`.toLocaleLowerCase('ar');
      return matchesStatus && (!normalized || haystack.includes(normalized));
    }).sort((a, b) => {
      let result = 0;
      if (sortKey === 'total') result = Number(a.total) - Number(b.total);
      else if (sortKey === 'customerName') result = a.customerName.localeCompare(b.customerName, 'ar');
      else result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return ascending ? result : -result;
    });
  }, [orders, query, statusFilter, sortKey, ascending]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleOrders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const matchingCards = useMemo(() => {
    const term = cardSearch.trim().toLocaleLowerCase('ar');
    return inventoryCards.filter((card) => {
      const customerName = typeof card.customer_id === 'object' && card.customer_id ? card.customer_id.name : '';
      const text = `${card.card_code} ${card.custom_slug || ''} ${card.card_type} ${card.business_data?.business_name || ''} ${customerName}`.toLocaleLowerCase('ar');
      return !term || text.includes(term);
    });
  }, [inventoryCards, cardSearch]);
  const reservedCards = useMemo(() => {
    const reserved = new Map<string, StoreOrder>();
    orders.forEach((order) => {
      if (order.status === 'cancelled' || order.id === editing?.id) return;
      (order.cards || []).forEach((card) => reserved.set(card._id, order));
    });
    return reserved;
  }, [orders, editing]);
  const availableCardsCount = inventoryCards.filter((card) => {
    const alreadyInThisOrder = editing?.cards?.some((item) => item._id === card._id);
    return !reservedCards.has(card._id) && (alreadyInThisOrder || (!card.customer_id && !card.customer));
  }).length;

  useEffect(() => { setPage(1); }, [query, statusFilter]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const persist = (next: StoreOrder[]) => {
    persistOrders(next);
    setOrders(next);
  };

  const startCreate = () => { setEditing(null); setForm(EMPTY_FORM); setViewing(null); };
  const startEdit = (order: StoreOrder) => {
    setViewing(null);
    setEditing(order);
    setForm({
      customerName: order.customerName, phone: order.phone, cards: order.cards || [], total: order.total,
      status: order.status, paymentStatus: order.paymentStatus, paidAmount: getPaidAmount(order), address: order.address, notes: order.notes,
    });
  };

  const toggleOrderCard = (card: ApiCard) => {
    setForm((current) => {
      const alreadySelected = current.cards.some((selected) => selected._id === card._id);
      const cards = alreadySelected
        ? current.cards.filter((selected) => selected._id !== card._id)
        : [...current.cards, card];
      const total = cards.length * CARD_UNIT_PRICE;
      const paidAmount = current.paymentStatus === 'paid' ? total : Math.min(current.paidAmount, total);
      const customer = typeof card.customer_id === 'object' && card.customer_id ? card.customer_id : null;
      return {
        ...current,
        cards,
        total,
        paidAmount,
        paymentStatus: current.paymentStatus === 'partial' && total > 0 && paidAmount >= total ? 'paid' : current.paymentStatus,
        customerName: !alreadySelected && !current.customerName.trim()
          ? customer?.name || card.business_data?.business_name || current.customerName
          : current.customerName,
        phone: !alreadySelected && !current.phone.trim()
          ? customer?.phone || card.business_data?.phone || current.phone
          : current.phone,
      };
    });
  };

  const updatePaymentStatus = (paymentStatus: PaymentStatus) => {
    setForm((current) => {
      let paidAmount = current.paidAmount;
      if (paymentStatus === 'paid') paidAmount = current.total;
      else if (paymentStatus === 'unpaid' || paymentStatus === 'refunded') paidAmount = 0;
      else if (current.paymentStatus === 'paid') paidAmount = 0;
      else paidAmount = Math.min(paidAmount, Math.max(0, current.total - 0.01));
      return { ...current, paymentStatus, paidAmount };
    });
  };

  const saveOrder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.customerName.trim() || !form.phone.trim() || form.cards.length === 0) {
      setToast('أكمل اسم العميل ورقم الهاتف واختر بطاقة واحدة على الأقل.');
      return;
    }
    if (form.paymentStatus === 'partial' && (form.paidAmount <= 0 || form.paidAmount >= form.total)) {
      setToast('أدخل مبلغًا مدفوعًا أكبر من صفر وأقل من إجمالي الطلب.');
      return;
    }
    const freshReservations = new Map<string, StoreOrder>();
    readOrders().forEach((order) => {
      if (order.status === 'cancelled' || order.id === editing?.id) return;
      (order.cards || []).forEach((card) => freshReservations.set(card._id, order));
    });
    const unavailableCard = form.cards.find((card) => {
      const reservedBy = freshReservations.get(card._id);
      const inventoryCard = inventoryCards.find((item) => item._id === card._id) || card;
      const alreadyInThisOrder = editing?.cards?.some((item) => item._id === card._id);
      return !!reservedBy || (!alreadyInThisOrder && (!!inventoryCard.customer_id || !!inventoryCard.customer));
    });
    if (unavailableCard) {
      const reservedBy = freshReservations.get(unavailableCard._id);
      setToast(reservedBy
        ? `البطاقة ${unavailableCard.card_code} محجوزة بالفعل في الطلب ${reservedBy.id}.`
        : `البطاقة ${unavailableCard.card_code} مرتبطة بعميل ولا يمكن بيعها مرة أخرى.`);
      return;
    }
    const now = new Date().toISOString();
    const items = form.cards.map((card) => `${card.card_code} — ${card.business_data?.business_name || card.card_type}`).join('، ');
    const total = form.cards.length * CARD_UNIT_PRICE;
    const paidAmount = form.paymentStatus === 'paid' ? total : form.paymentStatus === 'partial' ? form.paidAmount : 0;
    if (editing) {
      persist(orders.map((order) => order.id === editing.id
        ? { ...order, ...form, cards: form.cards, items, total, paidAmount, customerName: form.customerName.trim(), phone: form.phone.trim(), updatedAt: now }
        : order));
      setToast(`تم تحديث الطلب ${editing.id}`);
    } else {
      const created: StoreOrder = {
        ...form, id: makeId(), cards: form.cards, total, paidAmount, customerName: form.customerName.trim(),
        phone: form.phone.trim(), items, createdAt: now, updatedAt: now,
      };
      persist([created, ...orders]);
      setToast(`تم إنشاء الطلب ${created.id}`);
      setPage(1);
    }
    setEditing(null);
    setFormOpen(false);
  };

  const deleteOrder = () => {
    if (!deleting) return;
    persist(orders.filter((order) => order.id !== deleting.id));
    setToast(`تم حذف الطلب ${deleting.id}`);
    setDeleting(null);
    if (viewing?.id === deleting.id) setViewing(null);
  };

  const changeStatus = (order: StoreOrder, status: OrderStatus) => {
    persist(orders.map((item) => item.id === order.id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
    if (viewing?.id === order.id) setViewing({ ...order, status, updatedAt: new Date().toISOString() });
    setToast(`تم تحديث حالة ${order.id} إلى «${STATUS_LABELS[status]}»`);
  };

  const exportCsv = () => {
    const rows = [
      ['رقم الطلب', 'العميل', 'الهاتف', 'المنتجات', 'الإجمالي', 'حالة الطلب', 'حالة الدفع', 'المدفوع', 'المتبقي', 'العنوان', 'تاريخ الإنشاء'],
      ...filtered.map((order) => [order.id, order.customerName, order.phone, order.items, String(order.total), STATUS_LABELS[order.status], PAYMENT_LABELS[order.paymentStatus], String(getPaidAmount(order)), String(getRemainingAmount(order)), order.address, formatDate(order.createdAt)]),
    ];
    const csv = '\uFEFF' + rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sortBy = (key: typeof sortKey) => {
    if (key === sortKey) setAscending((value) => !value);
    else { setSortKey(key); setAscending(key !== 'createdAt'); }
  };

  // Explicit modal flag avoids coupling form visibility to field equality.
  const [formOpen, setFormOpen] = useState(false);
  const showCreate = () => { startCreate(); setCardSearch(''); setFormOpen(true); };
  const showEdit = (order: StoreOrder) => { startEdit(order); setCardSearch(''); setFormOpen(true); };

  const statusBadge = (status: OrderStatus) => {
    const color = STATUS_COLORS[status];
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, background: color.bg, color: color.color, padding: '5px 10px', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: color.dot }} />{STATUS_LABELS[status]}</span>;
  };

  const statCard = (label: string, value: React.ReactNode, icon: React.ReactNode, tint: string) => (
    <div style={{ minWidth: 145, flex: '1 1 150px', background: '#fff', border: '1px solid #e7edf5', borderRadius: 16, padding: '17px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 3px 12px rgba(15,23,42,.035)' }}>
      <span style={{ width: 42, height: 42, borderRadius: 13, display: 'grid', placeItems: 'center', color: tint, background: `${tint}14` }}>{icon}</span>
      <span><span style={{ display: 'block', color: '#78859a', fontSize: 12, fontWeight: 700 }}>{label}</span><strong style={{ display: 'block', marginTop: 4, color: '#182338', fontSize: 19 }}>{value}</strong></span>
    </div>
  );

  return (
    <div dir="rtl" style={{ display: 'grid', gap: 20, color: '#172033' }}>
      {toast && <div role="status" style={{ position: 'fixed', zIndex: 1500, top: 20, left: 20, maxWidth: 360, padding: '13px 17px', borderRadius: 12, color: '#fff', background: '#172033', boxShadow: '0 12px 35px #0f172a33', fontSize: 13, fontWeight: 700 }}>{toast}</div>}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '24px 26px', borderRadius: 18, color: '#fff', background: 'linear-gradient(125deg,#111c32,#243b67 65%,#3158a5)', boxShadow: '0 14px 30px #17255422' }}>
        <div>
          <div style={{ display: 'inline-flex', gap: 7, alignItems: 'center', color: '#c7d8ff', fontSize: 12, fontWeight: 800 }}><ShoppingBag size={15} /> مركز عمليات المتجر</div>
          <h1 style={{ margin: '8px 0 5px', fontSize: 25, fontWeight: 900 }}>إدارة الطلبات</h1>
          <p style={{ margin: 0, color: '#d0d9e8', fontSize: 13 }}>استقبل الطلبات وسجّل بيانات العملاء وتابع حالة التنفيذ والدفع.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          <button type="button" onClick={exportCsv} style={{ ...buttonStyle, color: '#fff', borderColor: '#ffffff45', background: '#ffffff12' }}><Download size={16} /> تصدير النتائج</button>
          {can('orders:create') && <button type="button" onClick={showCreate} style={{ ...buttonStyle, color: '#15213a', borderColor: '#fff', background: '#fff', padding: '10px 15px' }}><Plus size={17} /> طلب جديد</button>}
        </div>
      </header>

      <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {statCard('كل الطلبات', counts.all, <ClipboardList size={20} />, '#4f46e5')}
        {statCard('طلبات جديدة', counts.new, <ShoppingBag size={20} />, '#2563eb')}
        {statCard('قيد التجهيز', counts.processing, <RefreshCw size={20} />, '#ca8a04')}
        {statCard('طلبات مكتملة', counts.completed, <PackageCheck size={20} />, '#059669')}
        {statCard('المبالغ المحصلة', formatMoney(counts.revenue), <span style={{ fontSize: 18, fontWeight: 900 }}>ج</span>, '#7c3aed')}
      </section>

      <section style={{ overflow: 'hidden', border: '1px solid #e6ecf4', borderRadius: 16, background: '#fff', boxShadow: '0 5px 20px rgba(15,23,42,.035)' }}>
        <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid #edf1f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: '1 1 300px', maxWidth: 490, border: '1px solid #dbe3ef', borderRadius: 10, padding: '0 11px', color: '#94a3b8' }}>
            <Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث برقم الطلب أو العميل أو الهاتف..." aria-label="البحث في الطلبات" style={{ ...fieldStyle, border: 0, paddingRight: 0 }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13, fontWeight: 700 }}><Filter size={16} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)} style={{ ...fieldStyle, width: 'auto', minWidth: 145, padding: '9px 10px' }}><option value="all">كل الحالات</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>

        {visibleOrders.length === 0 ? (
          <div style={{ padding: '54px 20px', textAlign: 'center' }}>
            <span style={{ width: 58, height: 58, display: 'grid', placeItems: 'center', margin: '0 auto 12px', borderRadius: 18, background: '#f1f5f9', color: '#64748b' }}><ShoppingBag size={26} /></span>
            <h2 style={{ margin: '0 0 6px', fontSize: 17, color: '#1e293b' }}>{orders.length ? 'لا توجد نتائج مطابقة' : 'لا توجد طلبات بعد'}</h2>
            <p style={{ margin: '0 auto 18px', maxWidth: 420, color: '#718096', fontSize: 13, lineHeight: 1.8 }}>{orders.length ? 'جرّب تغيير عبارة البحث أو حالة الطلب المحددة.' : 'أنشئ طلبًا يدويًا لتسجيل عملية بيع ومتابعة تجهيزها ودفعها.'}</p>
            {!orders.length && can('orders:create') && <button type="button" onClick={showCreate} style={{ ...buttonStyle, color: '#fff', background: '#2563eb', borderColor: '#2563eb', padding: '10px 15px', boxShadow: '0 4px 12px rgba(37,99,235,.22)' }}><Plus size={16} /> إنشاء أول طلب</button>}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 870, borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead><tr style={{ color: '#738197', background: '#f8fafc', fontSize: 12 }}>
                  <th style={thStyle}>رقم الطلب</th>
                  <th style={thStyle}><button type="button" onClick={() => sortBy('customerName')} style={sortButtonStyle}>العميل <ArrowDownUp size={13} /></button></th>
                  <th style={thStyle}>المنتجات</th>
                  <th style={thStyle}><button type="button" onClick={() => sortBy('total')} style={sortButtonStyle}>الإجمالي <ArrowDownUp size={13} /></button></th>
                  <th style={thStyle}>الحالة</th><th style={thStyle}>الدفع</th>
                  <th style={thStyle}><button type="button" onClick={() => sortBy('createdAt')} style={sortButtonStyle}>تاريخ الطلب <ArrowDownUp size={13} /></button></th><th style={thStyle}>الإجراءات</th>
                </tr></thead>
                <tbody>{visibleOrders.map((order) => (
                  <tr key={order.id} style={{ borderTop: '1px solid #edf1f6' }}>
                    <td style={tdStyle}><strong style={{ color: '#344a75', fontSize: 12 }}>{order.id}</strong></td>
                    <td style={tdStyle}><strong style={{ display: 'block', fontSize: 13 }}>{order.customerName}</strong><span style={{ color: '#8491a5', fontSize: 12, direction: 'ltr', display: 'inline-block', marginTop: 3 }}>{order.phone}</span></td>
                    <td style={{ ...tdStyle, maxWidth: 190 }}><span title={order.items} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#526075', fontSize: 12 }}>{order.items}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 800, whiteSpace: 'nowrap' }}>{formatMoney(order.total)}</td>
                    <td style={tdStyle}>{can('orders:edit') ? <select aria-label={`حالة ${order.id}`} value={order.status} onChange={(event) => changeStatus(order, event.target.value as OrderStatus)} style={{ border: '1px solid #e5eaf1', borderRadius: 999, background: STATUS_COLORS[order.status].bg, color: STATUS_COLORS[order.status].color, padding: '6px 8px', font: 'inherit', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : statusBadge(order.status)}</td>
                    <td style={tdStyle}><span style={{ color: order.paymentStatus === 'paid' ? '#047857' : order.paymentStatus === 'partial' ? '#1d4ed8' : order.paymentStatus === 'refunded' ? '#b91c1c' : '#a16207', fontSize: 12, fontWeight: 800 }}>{PAYMENT_LABELS[order.paymentStatus]}</span>{order.paymentStatus === 'partial' && <small style={{ display: 'block', marginTop: 4, color: '#718096', whiteSpace: 'nowrap' }}>دُفع {formatMoney(getPaidAmount(order))} · متبقٍ {formatMoney(getRemainingAmount(order))}</small>}</td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#718096', fontSize: 12 }}>{formatDate(order.createdAt)}</td>
                    <td style={tdStyle}><div style={{ display: 'flex', gap: 5 }}>
                      {can('orders:view') && <button type="button" title="عرض التفاصيل" aria-label={`عرض ${order.id}`} onClick={() => setViewing(order)} style={iconButtonStyle}><Eye size={15} /></button>}
                      {can('orders:edit') && <button type="button" title="تعديل الطلب" aria-label={`تعديل ${order.id}`} onClick={() => showEdit(order)} style={iconButtonStyle}><Edit3 size={15} /></button>}
                      {can('orders:delete') && <button type="button" title="حذف الطلب" aria-label={`حذف ${order.id}`} onClick={() => setDeleting(order)} style={{ ...iconButtonStyle, color: '#dc2626' }}><Trash2 size={15} /></button>}
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <footer style={{ padding: '13px 18px', borderTop: '1px solid #edf1f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: '#77849a', fontSize: 12, flexWrap: 'wrap' }}>
              <span>عرض {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length} طلب</span>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} style={{ ...buttonStyle, padding: '6px 10px' }}>السابق</button><span>{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} style={{ ...buttonStyle, padding: '6px 10px' }}>التالي</button></div>
            </footer>
          </>
        )}
      </section>

      {formOpen && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }} style={overlayStyle}>
        <form onSubmit={saveOrder} role="dialog" aria-modal="true" aria-labelledby="order-form-title" style={modalStyle}>
          <div style={modalHeaderStyle}><div><h2 id="order-form-title" style={{ margin: 0, fontSize: 18 }}>{editing ? `تعديل الطلب ${editing.id}` : 'إضافة طلب جديد'}</h2><p style={{ margin: '5px 0 0', color: '#718096', fontSize: 12 }}>أدخل بيانات العميل والمنتجات لتسجيل الطلب.</p></div><button type="button" onClick={() => setFormOpen(false)} aria-label="إغلاق" style={iconButtonStyle}><X size={18} /></button></div>
          <div style={{ padding: 20, display: 'grid', gap: 14, overflowY: 'auto' }}>
            <div style={formGridStyle}>
              <label style={labelStyle}>اسم العميل *<input required autoFocus value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} style={fieldStyle} placeholder="الاسم بالكامل" /></label>
              <label style={labelStyle}>رقم الهاتف *<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} style={fieldStyle} placeholder="01xxxxxxxxx" dir="ltr" /></label>
            </div>
            <section style={{ display: 'grid', gap: 10, padding: 13, border: '1px solid #dbe3ef', borderRadius: 12, background: '#fbfdff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ color: '#334155', fontSize: 13 }}>اختيار البطاقات من المخزون *</strong>
                <span style={{ padding: '5px 9px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 800 }}>سعر البطاقة: {formatMoney(CARD_UNIT_PRICE)}</span>
              </div>
              <div style={{ color: '#718096', fontSize: 11 }}>المتاح للاختيار الآن: <strong style={{ color: '#047857' }}>{availableCardsCount}</strong> من {inventoryCards.length} بطاقة. البطاقة المرتبطة بعميل أو بطلب قائم لا يمكن تكرار بيعها.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #dbe3ef', borderRadius: 9, padding: '0 10px', background: '#fff', color: '#94a3b8' }}><Search size={16} /><input value={cardSearch} onChange={(event) => setCardSearch(event.target.value)} placeholder="ابحث بكود البطاقة أو اسم النشاط..." aria-label="البحث في بطاقات المخزون" style={{ ...fieldStyle, border: 0, paddingRight: 0 }} /></div>
              {cardsLoading ? <div style={{ padding: 18, textAlign: 'center', color: '#64748b', fontSize: 13 }}>جارٍ تحميل البطاقات من المخزون...</div> : cardsError ? <div role="alert" style={{ padding: 12, borderRadius: 9, background: '#fef2f2', color: '#b91c1c', fontSize: 12 }}>{cardsError} <button type="button" onClick={() => { setCardsLoading(true); setCardsError(''); cardsApi.getAllCardsForStats().then(setInventoryCards).catch((error: any) => setCardsError(error?.message || 'تعذر تحميل البطاقات.')).finally(() => setCardsLoading(false)); }} style={{ ...buttonStyle, marginRight: 8, padding: '5px 9px' }}>إعادة المحاولة</button></div> : (
                <div style={{ display: 'grid', gap: 7, maxHeight: 205, overflowY: 'auto', paddingLeft: 2 }}>
                  {matchingCards.length ? matchingCards.map((card) => {
                    const selected = form.cards.some((item) => item._id === card._id);
                    const linkedToCustomer = !!card.customer_id || !!card.customer;
                    const reservation = reservedCards.get(card._id);
                    const unavailableReason = reservation ? `محجوز في ${reservation.id}` : linkedToCustomer ? 'مرتبطة بعميل' : '';
                    const disabled = !selected && !!unavailableReason;
                    return <button key={card._id} type="button" disabled={disabled} aria-pressed={selected} onClick={() => toggleOrderCard(card)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 11px', borderRadius: 10, border: `1px solid ${selected ? '#60a5fa' : disabled ? '#e5e7eb' : '#e2e8f0'}`, background: selected ? '#eff6ff' : disabled ? '#f8fafc' : '#fff', color: disabled ? '#94a3b8' : '#24334a', textAlign: 'right', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .72 : 1, font: 'inherit' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}><span style={{ width: 18, height: 18, display: 'grid', placeItems: 'center', flexShrink: 0, borderRadius: 5, border: `1px solid ${selected ? '#2563eb' : '#cbd5e1'}`, background: selected ? '#2563eb' : '#fff', color: '#fff', fontSize: 12 }}>{selected ? '✓' : ''}</span><span style={{ minWidth: 0 }}><strong style={{ display: 'block', fontSize: 12 }}>{card.card_code}</strong><span style={{ display: 'block', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: disabled ? '#94a3b8' : '#738197', fontSize: 11 }}>{card.business_data?.business_name || card.card_type} · {card.card_type}</span></span></span>
                      <span style={{ flexShrink: 0, color: selected ? '#1d4ed8' : disabled ? '#9ca3af' : '#64748b', fontSize: 11, fontWeight: 800 }}>{selected ? 'تم الاختيار' : unavailableReason || `${CARD_UNIT_PRICE} ج`}</span>
                    </button>;
                  }) : <div style={{ padding: 17, textAlign: 'center', color: '#78859a', fontSize: 12 }}>{inventoryCards.length ? 'لا توجد بطاقة تطابق البحث.' : 'لا توجد بطاقات في المخزون بعد.'}</div>}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', borderTop: '1px solid #e8edf4', paddingTop: 10 }}>
                <span style={{ color: '#64748b', fontSize: 12 }}>البطاقات المختارة: <strong style={{ color: '#26364f' }}>{form.cards.length}</strong> × {formatMoney(CARD_UNIT_PRICE)}</span>
                <strong style={{ color: '#172554', fontSize: 16 }}>الإجمالي: {formatMoney(form.cards.length * CARD_UNIT_PRICE)}</strong>
              </div>
            </section>
            <div style={formGridStyle}>
              <label style={labelStyle}>حالة الطلب<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as OrderStatus })} style={fieldStyle}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label style={labelStyle}>حالة الدفع<select value={form.paymentStatus} onChange={(event) => updatePaymentStatus(event.target.value as PaymentStatus)} style={fieldStyle}>{Object.entries(PAYMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
            {form.paymentStatus === 'partial' && <div style={formGridStyle}>
              <label style={labelStyle}>المبلغ المدفوع حتى الآن *<div style={{ position: 'relative' }}><input required type="number" min="0.01" max={form.total} step="0.01" value={form.paidAmount || ''} onChange={(event) => { const paidAmount = Number(event.target.value); setForm((current) => ({ ...current, paidAmount, paymentStatus: current.total > 0 && paidAmount >= current.total ? 'paid' : 'partial' })); }} style={{ ...fieldStyle, paddingLeft: 48 }} placeholder="مثال: 250" /><span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#78859a', fontSize: 12 }}>جنيه</span></div></label>
              <div style={{ display: 'grid', alignContent: 'center', gap: 6, padding: '10px 13px', border: '1px solid #bfdbfe', borderRadius: 10, background: '#eff6ff' }}><span style={{ color: '#526b9d', fontSize: 12, fontWeight: 700 }}>المتبقي على العميل</span><strong style={{ color: '#1d4ed8', fontSize: 18 }}>{formatMoney(Math.max(0, form.total - form.paidAmount))}</strong></div>
            </div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 9, padding: '11px 13px', border: '1px solid #e6ecf4', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>إجمالي الطلب: <strong style={{ color: '#26364f' }}>{formatMoney(form.total)}</strong></span>
              <span style={{ color: '#64748b' }}>المدفوع: <strong style={{ color: '#047857' }}>{formatMoney(getPaidAmount(form))}</strong></span>
              <span style={{ color: '#64748b' }}>المتبقي: <strong style={{ color: '#b45309' }}>{form.paymentStatus === 'refunded' ? 'تم الاسترداد' : formatMoney(getRemainingAmount(form))}</strong></span>
            </div>
            <label style={labelStyle}>عنوان التوصيل<textarea rows={2} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} style={{ ...fieldStyle, resize: 'vertical' }} placeholder="المحافظة، المدينة، الشارع، تفاصيل إضافية" /></label>
            <label style={labelStyle}>ملاحظات داخلية<textarea rows={2} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} style={{ ...fieldStyle, resize: 'vertical' }} placeholder="تعليمات أو ملاحظات حول الطلب" /></label>
          </div>
          <div style={{ padding: '14px 20px', borderTop: '1px solid #edf1f6', display: 'flex', justifyContent: 'flex-start', gap: 8 }}><button type="button" onClick={() => setFormOpen(false)} style={buttonStyle}>إلغاء</button><button type="submit" style={{ ...buttonStyle, color: '#fff', background: '#2563eb', borderColor: '#2563eb', padding: '10px 15px', boxShadow: '0 4px 12px rgba(37,99,235,.22)' }}><Plus size={16} />{editing ? 'حفظ التعديلات' : 'إنشاء الطلب'}</button></div>
        </form>
      </div>}

      {viewing && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewing(null); }} style={overlayStyle}><section role="dialog" aria-modal="true" aria-labelledby="order-details-title" style={{ ...modalStyle, maxWidth: 570 }}>
        <div style={modalHeaderStyle}><div><div style={{ color: '#526b9d', fontSize: 12, fontWeight: 800 }}>{viewing.id}</div><h2 id="order-details-title" style={{ margin: '5px 0 0', fontSize: 19 }}>تفاصيل الطلب</h2></div><button type="button" onClick={() => setViewing(null)} aria-label="إغلاق" style={iconButtonStyle}><X size={18} /></button></div>
        <div style={{ padding: 21, display: 'grid', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{statusBadge(viewing.status)}<strong style={{ fontSize: 18 }}>{formatMoney(viewing.total)}</strong></div>
          <div style={detailsGridStyle}><Detail label="اسم العميل" value={viewing.customerName} /><Detail label="رقم الهاتف" value={viewing.phone} /><Detail label="حالة الدفع" value={PAYMENT_LABELS[viewing.paymentStatus]} /><Detail label="المبلغ المدفوع" value={formatMoney(getPaidAmount(viewing))} /><Detail label="المبلغ المتبقي" value={viewing.paymentStatus === 'refunded' ? 'تم استرداد المبلغ' : formatMoney(getRemainingAmount(viewing))} /><Detail label="تاريخ الإنشاء" value={formatDate(viewing.createdAt)} /></div>
          <div style={{ display: 'grid', gap: 8 }}><strong style={{ color: '#8390a3', fontSize: 11 }}>البطاقات المرتبطة بالطلب</strong>{viewing.cards?.length ? viewing.cards.map((card) => <div key={card._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #e7edf5', borderRadius: 10 }}><span><strong style={{ display: 'block', color: '#26364f', fontSize: 12 }}>{card.card_code}</strong><span style={{ display: 'block', marginTop: 3, color: '#718096', fontSize: 11 }}>{card.business_data?.business_name || card.card_type} · {card.card_type}</span></span><span style={{ whiteSpace: 'nowrap', color: '#475569', fontSize: 12 }}>{formatMoney(CARD_UNIT_PRICE)}</span></div>) : <Detail label="تفاصيل الطلب" value={viewing.items || 'لا توجد بطاقات مرتبطة'} />}</div>
          <Detail label="عنوان التوصيل" value={viewing.address || 'لم يحدد عنوان'} icon={<MapPin size={15} />} /><Detail label="ملاحظات" value={viewing.notes || 'لا توجد ملاحظات'} />
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid #edf1f6', display: 'flex', justifyContent: 'flex-start', gap: 8 }}>{can('orders:edit') && <button type="button" onClick={() => showEdit(viewing)} style={buttonStyle}><Edit3 size={15} /> تعديل الطلب</button>}<button type="button" onClick={() => setViewing(null)} style={buttonStyle}>إغلاق</button></div>
      </section></div>}

      {deleting && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleting(null); }} style={overlayStyle}><section role="dialog" aria-modal="true" aria-labelledby="delete-order-title" style={{ ...modalStyle, maxWidth: 420, padding: 22 }}><button type="button" onClick={() => setDeleting(null)} aria-label="إغلاق" style={{ ...iconButtonStyle, float: 'left' }}><X size={18} /></button><span style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 14, background: '#fef2f2', color: '#dc2626' }}><Trash2 size={21} /></span><h2 id="delete-order-title" style={{ margin: '15px 0 7px', fontSize: 18 }}>حذف الطلب؟</h2><p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 13 }}>سيتم حذف الطلب <strong>{deleting.id}</strong> نهائيًا من هذا المتصفح.</p><div style={{ display: 'flex', gap: 8, marginTop: 18 }}><button type="button" onClick={() => setDeleting(null)} style={buttonStyle}>إلغاء</button><button type="button" onClick={deleteOrder} style={{ ...buttonStyle, color: '#fff', borderColor: '#dc2626', background: '#dc2626' }}><Trash2 size={15} /> حذف نهائي</button></div></section></div>}

      <div style={{ color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>تُحفظ الطلبات محليًا في هذا المتصفح. لتمكين استقبال الطلبات من العملاء ومزامنتها بين الأجهزة، يلزم ربط واجهة خلفية للطلبات.</div>
    </div>
  );
};

const thStyle: React.CSSProperties = { padding: '12px 14px', fontWeight: 800, whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '13px 14px', verticalAlign: 'middle' };
const sortButtonStyle: React.CSSProperties = { border: 0, padding: 0, color: 'inherit', background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 5, font: 'inherit', cursor: 'pointer' };
const iconButtonStyle: React.CSSProperties = { width: 32, height: 32, padding: 0, borderRadius: 9, border: '1px solid #e4eaf2', background: '#fff', color: '#59677d', display: 'grid', placeItems: 'center', cursor: 'pointer' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 1400, background: 'rgba(15,23,42,.48)', backdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center', padding: 16 };
const modalStyle: React.CSSProperties = { width: '100%', maxWidth: 620, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 17, background: '#fff', boxShadow: '0 24px 70px #0f172a44' };
const modalHeaderStyle: React.CSSProperties = { padding: '17px 20px', borderBottom: '1px solid #edf1f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 };
const formGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 };
const detailsGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, padding: 14, borderRadius: 12, background: '#f8fafc' };

const Detail: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div style={{ display: 'grid', gap: 5 }}><span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#8390a3', fontSize: 11, fontWeight: 700 }}>{icon}{label}</span><span style={{ color: '#26364f', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{value}</span></div>
);
