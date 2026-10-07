import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersApi } from '../../services';
import { ApiCustomer, fmtDate, ApiPartnerStatsResponse } from '../../types';
import { CustomerModal } from '../../components/admin/CustomerModal';
import { DeleteCustomerModal } from '../../components/admin/DeleteCustomerModal';
import { CustomerTrashModal } from '../../components/admin/CustomerTrashModal';
import { SendCustomerEmailModal } from '../../components/admin/SendCustomerEmailModal';
import { BroadcastEmailModal } from '../../components/admin/BroadcastEmailModal';
import { ChangePartnerModal } from '../../components/admin/ChangePartnerModal';
import {
  Users, Plus, Search, RefreshCw, Eye, Edit2,
  Trash2, Phone, CreditCard, AlertTriangle,
  ChevronLeft, ChevronRight, Download, Mail, Megaphone,
  UserCheck, ArrowRightLeft, BarChart3, Filter, CheckCircle2, Clock,
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

export const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Partner filter & stats
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [partnersList, setPartnersList] = useState<string[]>([]);
  const [partnerStats, setPartnerStats] = useState<ApiPartnerStatsResponse | null>(null);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [changePartnerTarget, setChangePartnerTarget] = useState<ApiCustomer | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<ApiCustomer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiCustomer | null>(null);
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  // Email messaging states
  const [emailCustomerTarget, setEmailCustomerTarget] = useState<ApiCustomer | null>(null);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const showToast = (msg: string, type: ToastType = 'success') => setToast({ msg, type });

  const toggleSelectCustomer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === customers.length && customers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(customers.map((c) => c._id)));
    }
  };

  const handleDownloadBackup = async () => {
    setDownloadingBackup(true);
    showToast('جاري تجهيز النسخة الاحتياطية...', 'info');
    try {
      const blob = await customersApi.downloadBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `customers-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('تم تحميل النسخة الاحتياطية بنجاح ✓', 'success');
    } catch (err: any) {
      showToast(err?.message || 'فشل تحميل النسخة الاحتياطية', 'error');
    } finally {
      setDownloadingBackup(false);
    }
  };


  const fetchPartnersData = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        customersApi.getPartnersList().catch(() => []),
        customersApi.getPartnerStats().catch(() => null),
      ]);
      if (Array.isArray(listRes)) setPartnersList(listRes);
      if (statsRes) setPartnerStats(statsRes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async (pg: number, currentLimit: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await customersApi.getCustomers({
        page: pg,
        limit: currentLimit,
        search: appliedSearch.trim() || undefined,
        partner: selectedPartner || undefined,
      });
      setCustomers(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل قائمة العملاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedIds(new Set());
    fetchCustomers(page, limit);
  }, [page, limit, appliedSearch, selectedPartner]);

  useEffect(() => {
    fetchPartnersData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete Confirmation with Password Modal */}
      {deleteTarget && (
        <DeleteCustomerModal
          customer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            fetchCustomers(page, limit);
          }}
          onToast={showToast}
        />
      )}

      {/* Customer Trash Modal */}
      {trashModalOpen && (
        <CustomerTrashModal
          onClose={() => setTrashModalOpen(false)}
          onCustomerRestored={() => {
            fetchCustomers(page, limit);
          }}
          onToast={showToast}
        />
      )}

      {/* Send Individual Customer Email Modal */}
      {emailCustomerTarget && (
        <SendCustomerEmailModal
          customer={emailCustomerTarget}
          onClose={() => setEmailCustomerTarget(null)}
          onToast={showToast}
          onEditCustomer={() => {
            const target = emailCustomerTarget;
            setEmailCustomerTarget(null);
            setEditCustomer(target);
          }}
        />
      )}

      {/* Broadcast Email Campaign Modal */}
      {broadcastModalOpen && (
        <BroadcastEmailModal
          totalCustomersCount={total}
          selectedCustomers={customers.filter((c) => selectedIds.has(c._id))}
          onClose={() => setBroadcastModalOpen(false)}
          onToast={showToast}
        />
      )}

      {/* Create / Edit Customer Modal */}
      {(createModalOpen || editCustomer) && (
        <CustomerModal
          customer={editCustomer}
          onClose={() => {
            setCreateModalOpen(false);
            setEditCustomer(null);
          }}
          onSuccess={() => {
            fetchCustomers(page, limit);
            fetchPartnersData();
          }}
          onToast={showToast}
        />
      )}

      {/* Change Partner Modal */}
      {changePartnerTarget && (
        <ChangePartnerModal
          customer={changePartnerTarget}
          onClose={() => setChangePartnerTarget(null)}
          onSuccess={() => {
            fetchCustomers(page, limit);
            fetchPartnersData();
          }}
          onToast={showToast}
        />
      )}

      {/* Hero Header */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
        }}
      >
        <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', right: '25%', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', pointerEvents: 'none' }} />

        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.12)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#93c5fd' }}>
            <Users size={14} /> نظام CRM وإدارة العملاء
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
            قائمة العملاء والشركات
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8', maxWidth: '480px' }}>
            إدارة بيانات العملاء، متابعة بطاقاتهم الذكية وربطها أو فك ارتباطها بسهولة وأمان.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', zIndex: 1, flexWrap: 'wrap' }}>
          <button
            onClick={() => setTrashModalOpen(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            title="عرض العملاء المحذوفين مع إمكانية استرجاعهم"
          >
            <Trash2 size={16} />
            <span> سلة المهملات</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            disabled={downloadingBackup}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: downloadingBackup ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease',
            }}
            title="تحميل ملف JSON كامل ببيانات العملاء وكروتهم"
          >
            {downloadingBackup ? (
              <>
                <RefreshCw size={15} className="spin" />
                <span>جاري التحميل...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span> تحميل نسخة احتياطية (Backup)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setBroadcastModalOpen(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: 'rgba(234, 88, 12, 0.2)',
              color: '#ffedd5',
              border: '1px solid rgba(234, 88, 12, 0.45)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            title="إرسال بريد تسويقي أو عروض لجميع العملاء أو المحددين"
          >
            <Megaphone size={16} />
            <span>حملة بريدية جماعية</span>
          </button>

          <button
            onClick={() => setShowStats((prev) => !prev)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: showStats ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              color: '#bfdbfe',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            title="عرض أو إخفاء إحصائيات ومقارنة أداء الشركاء"
          >
            <BarChart3 size={16} />
            <span>{showStats ? 'إخفاء الإحصائيات' : 'إحصائيات الشركاء'}</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-blue)',
            }}
          >
            <Plus size={18} />  إضافة عميل جديد
          </button>
        </div>
      </div>

      {/* Partner Stats / Performance Comparison Cards */}
      {showStats && partnerStats && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid var(--bdr-light)',
            padding: '22px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Stats Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                  إحصائيات ومقارنة أداء الشركاء (Partners Dashboard)
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                  مقارنة أعداد العملاء والكروت الذكية لكل شريك مع إمكانية الفلترة السريعة
                </p>
              </div>
            </div>

            {/* Quick Summary Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-subtle)', padding: '5px 12px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--txt-body)' }}>
                <span style={{ color: 'var(--txt-muted)' }}>إجمالي الشركاء:</span>
                <span style={{ color: '#2563eb', fontWeight: 800 }}>{partnerStats.total_partners}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-subtle)', padding: '5px 12px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--txt-body)' }}>
                <span style={{ color: 'var(--txt-muted)' }}>إجمالي العملاء:</span>
                <span style={{ color: '#059669', fontWeight: 800 }}>{partnerStats.total_customers}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-subtle)', padding: '5px 12px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--txt-body)' }}>
                <span style={{ color: 'var(--txt-muted)' }}>إجمالي الكروت:</span>
                <span style={{ color: '#7c3aed', fontWeight: 800 }}>{partnerStats.total_cards}</span>
              </div>
            </div>
          </div>

          {/* Partner Comparison Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
            }}
          >
            {partnerStats.stats.map((s) => {
              const isSelected = selectedPartner === s.partner;
              return (
                <div
                  key={s.partner}
                  onClick={() => {
                    setSelectedPartner(isSelected ? '' : s.partner);
                    setPage(1);
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: isSelected ? '#f0f7ff' : '#f8fafc',
                    border: `1.5px solid ${isSelected ? '#3b82f6' : 'var(--bdr-light)'}`,
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(59, 130, 246, 0.15)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                  title={isSelected ? 'انقر لإلغاء الفلترة' : `انقر لفلترة عملاء الشريك "${s.partner}"`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#2563eb' : '#e2e8f0',
                          color: isSelected ? '#ffffff' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '13px',
                        }}
                      >
                        {s.partner.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--txt-heading)' }}>
                        {s.partner}
                      </span>
                    </div>
                    {isSelected ? (
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '12px' }}>
                        فلتر نشط ✓
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--txt-muted)', textDecoration: 'underline' }}>
                        انقر للفلترة
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--bdr-light)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--txt-muted)', marginBottom: '2px' }}>عدد العملاء</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{s.customers_count}</div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--bdr-light)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--txt-muted)', marginBottom: '2px' }}>عدد الكروت</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{s.cards_count}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', paddingTop: '4px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> {s.active_cards} نشط
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: s.expired_cards > 0 ? '#ef4444' : 'var(--txt-muted)', fontWeight: 700 }}>
                      <Clock size={13} /> {s.expired_cards} منتهي
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Multi-selection Bar */}
      {selectedIds.size > 0 && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '14px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e40af' }}>
              تم تحديد {selectedIds.size} من أصل {customers.length} عميل في هذه الصفحة
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '12.5px',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              إلغاء التحديد
            </button>
          </div>

          <button
            onClick={() => setBroadcastModalOpen(true)}
            style={{
              padding: '7px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ea580c',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
            }}
          >
            <Mail size={14} /> إرسال بريد للمحددين ({selectedIds.size})
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--bdr-light)',
          borderRadius: '16px',
          padding: '14px 18px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: '1' }}>
            <Search
              size={15}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAppliedSearch(search);
                  setPage(1);
                }
              }}
              placeholder="بحث بالاسم، رقم التليفون، البريد الإلكتروني، أو المحافظة..."
              className="form-input"
              style={{ paddingRight: '36px', height: '40px', borderRadius: '10px' }}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setAppliedSearch(search);
              setPage(1);
            }}
            style={{ padding: '0 20px', height: '40px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700 }}
          >
            بحث
          </button>
        </div>

        {/* Partner Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={selectedPartner}
            onChange={(e) => {
              setSelectedPartner(e.target.value);
              setPage(1);
            }}
            className="form-input"
            style={{
              height: '40px',
              borderRadius: '10px',
              paddingRight: '12px',
              paddingLeft: '28px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: selectedPartner ? '#eff6ff' : '#fff',
              borderColor: selectedPartner ? '#93c5fd' : 'var(--bdr-light)',
              color: selectedPartner ? '#1d4ed8' : 'var(--txt-body)',
              cursor: 'pointer',
            }}
          >
            <option value="">جميع الشركاء (الكل)</option>
            {partnersList.map((p) => (
              <option key={p} value={p}>
                الشريك: {p}
              </option>
            ))}
          </select>
          {selectedPartner && (
            <button
              onClick={() => {
                setSelectedPartner('');
                setPage(1);
              }}
              className="btn-outline"
              style={{ height: '40px', padding: '0 10px', borderRadius: '10px', fontSize: '12px', color: 'var(--txt-muted)' }}
              title="إلغاء فلتر الشريك وعرض الجميع"
            >
              ✕ مسح
            </button>
          )}
        </div>

        <button
          className="btn-outline"
          onClick={() => {
            fetchCustomers(page, limit);
            fetchPartnersData();
          }}
          style={{ padding: '0 16px', height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> تحديث
        </button>
      </div>

      {/* Customers Table / Card Container */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          border: '1px solid var(--bdr-light)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
            <span>جاري تحميل قائمة العملاء...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-error)' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
            <p>{error}</p>
            <button onClick={() => fetchCustomers(page, limit)} className="btn-outline" style={{ marginTop: '10px' }}>
              إعادة المحاولة
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: 'var(--txt-heading)' }}>
              {appliedSearch ? 'لم يتم العثور على أي نتائج مطابقة للبحث' : 'لا يوجد عملاء مسجلين حتى الآن'}
            </p>
            <p style={{ fontSize: '13.5px', margin: '0 0 20px', color: 'var(--txt-muted)' }}>
              {appliedSearch ? 'جرّب البحث بكلمات أخرى أو امسح خانة البحث' : 'ابدأ بإضافة أول عميل لنظام CRM لربطه بالبطاقات الذكية'}
            </p>
            {!appliedSearch && (
              <button onClick={() => setCreateModalOpen(true)} className="btn-primary" style={{ padding: '8px 22px', borderRadius: '10px' }}>
                <Plus size={16} /> إضافة عميل جديد
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--bdr-light)' }}>
                  <th style={{ padding: '14px 16px', width: '42px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={customers.length > 0 && selectedIds.size === customers.length}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--clr-primary-600)' }}
                      title="تحديد الكل"
                    />
                  </th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>اسم العميل / النشاط</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>الشريك المسؤول</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>الهاتف والتواصل</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>المحافظة / العنوان</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12.5px', fontWeight: 800 }}>عدد الكروت</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>تاريخ الإضافة</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12.5px', fontWeight: 800 }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    style={{
                      borderBottom: '1px solid var(--bdr-light)',
                      backgroundColor: selectedIds.has(c._id) ? 'rgba(37, 99, 235, 0.04)' : undefined,
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedIds.has(c._id)) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedIds.has(c._id)) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {/* Selection Checkbox */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c._id)}
                        onChange={() => toggleSelectCustomer(c._id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--clr-primary-600)' }}
                      />
                    </td>

                    {/* Name */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--clr-primary-50)',
                            color: 'var(--clr-primary-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--txt-heading)' }}>
                            {c.name}
                          </div>
                          {c.email && (
                            <div style={{ fontSize: '12px', color: 'var(--txt-muted)', direction: 'ltr', textAlign: 'right' }}>
                              {c.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Partner */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          <UserCheck size={12} />
                          {c.partner || 'عام'}
                        </span>
                        <button
                          onClick={() => setChangePartnerTarget(c)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#64748b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '4px',
                            transition: 'color 150ms ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                          title="نقل العميل لشريك آخر"
                        >
                          <ArrowRightLeft size={13} />
                        </button>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '14px 20px' }}>
                      <a
                        href={`tel:${c.phone}`}
                        dir="ltr"
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: 'var(--clr-primary-600)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Phone size={13} /> {c.phone}
                      </a>
                    </td>

                    {/* City / Address */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--txt-body)', fontWeight: 600 }}>
                        {c.city || '—'}
                      </div>
                      {c.address && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--txt-muted)',
                            maxWidth: '220px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={c.address}
                        >
                          {c.address}
                        </div>
                      )}
                    </td>

                    {/* Total Cards */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          backgroundColor: (c.total_cards || 0) > 0 ? 'var(--clr-primary-50)' : 'var(--bg-subtle)',
                          color: (c.total_cards || 0) > 0 ? 'var(--clr-primary-700)' : 'var(--txt-muted)',
                          border: `1px solid ${(c.total_cards || 0) > 0 ? 'var(--clr-primary-200)' : 'var(--bdr-light)'}`,
                          fontWeight: 800,
                          fontSize: '13px',
                        }}
                      >
                        <CreditCard size={14} />
                        {c.total_cards ?? 0}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--txt-secondary)' }}>
                      {fmtDate(c.createdAt)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          onClick={() => navigate(`/admin/customers/${c._id}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--clr-primary-200)',
                            backgroundColor: 'var(--clr-primary-50)',
                            color: 'var(--clr-primary-700)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 700,
                            fontFamily: 'var(--font)',
                            transition: 'all 0.15s ease',
                          }}
                          title="عرض تفاصيل العميل والبطاقات"
                        >
                          <Eye size={14} />
                          <span>التفاصيل</span>
                        </button>

                        <button
                          onClick={() => {
                            if (!c.email) {
                              showToast(`العميل "${c.name}" ليس لديه بريد إلكتروني مسجل. يرجى إضافة بريده أولاً.`, 'error');
                            }
                            setEmailCustomerTarget(c);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 11px',
                            borderRadius: '8px',
                            border: '1px solid var(--bdr-light)',
                            backgroundColor: c.email ? '#eff6ff' : 'var(--bg-subtle)',
                            color: c.email ? 'var(--clr-primary-700)' : 'var(--txt-muted)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 700,
                            fontFamily: 'var(--font)',
                            transition: 'all 0.15s ease',
                          }}
                          title={c.email ? `إرسال بريد إلكتروني إلى ${c.email}` : 'العميل ليس لديه بريد إلكتروني مسجل'}
                        >
                          <Mail size={13} />
                          <span>إرسال بريد</span>
                        </button>

                        <button
                          onClick={() => setChangePartnerTarget(c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="نقل / تغيير الشريك المسؤول"
                        >
                          <ArrowRightLeft size={14} />
                        </button>

                        <button
                          onClick={() => setEditCustomer(c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--bdr-light)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--txt-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="تعديل بيانات العميل"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--clr-error-bdr)',
                            backgroundColor: 'var(--clr-error-bg)',
                            color: 'var(--clr-error)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="حذف العميل"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && customers.length > 0 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--bdr-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', fontWeight: 600 }}>
                إجمالي <strong style={{ color: 'var(--txt-body)' }}>{total}</strong> عملاء
              </span>
              <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--bdr-light)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)' }}>الصفوف في الصفحة:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="form-input"
                  style={{ height: '34px', padding: '4px 10px', borderRadius: '8px', width: '70px', fontSize: '13px' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--txt-secondary)', marginInlineEnd: '10px' }}>
                صفحة <strong style={{ color: 'var(--txt-body)' }}>{page}</strong> من <strong>{totalPages || 1}</strong>
              </span>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-outline"
                style={{ padding: '6px 10px', height: '32px', borderRadius: '8px' }}
              >
                <ChevronRight size={15} />
              </button>
              {Array.from({ length: Math.min(5, Math.max(1, totalPages)) }, (_, i) => {
                let pg = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) pg = i + 1;
                  else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                  else pg = page - 2 + i;
                }
                if (pg < 1 || pg > Math.max(1, totalPages)) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: `1.5px solid ${pg === page ? 'var(--clr-primary-500)' : 'var(--bdr-light)'}`,
                      backgroundColor: pg === page ? 'var(--clr-primary-500)' : '#fff',
                      color: pg === page ? '#fff' : 'var(--txt-secondary)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(Math.max(1, totalPages), p + 1))}
                className="btn-outline"
                style={{ padding: '6px 10px', height: '32px', borderRadius: '8px' }}
              >
                <ChevronLeft size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
