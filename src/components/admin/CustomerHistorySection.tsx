import React, { useState, useEffect } from 'react';
import { customersApi } from '../../services';
import { ApiCustomerHistory, CustomerSnapshot, fmtDateTime } from '../../types';
import { CustomerSnapshotModal, getActionBadgeConfig } from './CustomerSnapshotModal';
import {
  History, RefreshCw, Eye, Calendar, Filter, Clock,
  Search, List, GitCommit, AlertTriangle, FileText
} from 'lucide-react';

interface CustomerHistorySectionProps {
  customerId: string;
  customerName: string;
  onCountUpdate?: (count: number) => void;
}

export const CustomerHistorySection: React.FC<CustomerHistorySectionProps> = ({
  customerId,
  customerName,
  onCountUpdate,
}) => {
  const [historyList, setHistoryList] = useState<ApiCustomerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & display
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Snapshot modal
  const [snapshotTarget, setSnapshotTarget] = useState<{
    snapshot: CustomerSnapshot | null;
    action: string;
    recordedAt: string;
    details?: string;
  } | null>(null);

  const fetchHistory = async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await customersApi.getCustomerHistory(customerId);
      const items = Array.isArray(res) ? res : (res as any)?.data || [];
      // Sort newest first
      items.sort((a: ApiCustomerHistory, b: ApiCustomerHistory) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
      setHistoryList(items);
      if (onCountUpdate) {
        onCountUpdate(items.length);
      }
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل سجل حركات العميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [customerId]);

  const filteredHistory = historyList.filter((item) => {
    // Filter action
    if (filterAction !== 'all' && item.action !== filterAction) {
      return false;
    }
    // Search query in details or snapshot
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inDetails = (item.details || '').toLowerCase().includes(q);
      const inAction = (item.action || '').toLowerCase().includes(q);
      const inSnapshot = item.snapshot ? JSON.stringify(item.snapshot).toLowerCase().includes(q) : false;
      if (!inDetails && !inAction && !inSnapshot) return false;
    }
    return true;
  });

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid var(--bdr-light)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Snapshot Modal */}
      {snapshotTarget && (
        <CustomerSnapshotModal
          isOpen={true}
          onClose={() => setSnapshotTarget(null)}
          snapshot={snapshotTarget.snapshot}
          action={snapshotTarget.action}
          recordedAt={snapshotTarget.recordedAt}
          details={snapshotTarget.details}
        />
      )}

      {/* Header & Controls */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--bdr-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--clr-primary-50)',
                color: 'var(--clr-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <History size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--txt-heading)' }}>
                سجل العمليات والتعديلات (Activity Log)
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--txt-muted)' }}>
                تتبع جميع العمليات التي تمت على حساب العميل {customerName}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Mode Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '10px',
                padding: '3px',
                border: '1px solid var(--bdr-light)',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'timeline' ? '#fff' : 'transparent',
                  color: viewMode === 'timeline' ? 'var(--clr-primary-600)' : 'var(--txt-secondary)',
                  boxShadow: viewMode === 'timeline' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <GitCommit size={14} /> الخط الزمني (Timeline)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'table' ? '#fff' : 'transparent',
                  color: viewMode === 'table' ? 'var(--clr-primary-600)' : 'var(--txt-secondary)',
                  boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <List size={14} /> الجدول (Table)
              </button>
            </div>

            {/* Refresh button */}
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="btn-outline"
              title="تحديث السجل"
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '12.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Action Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'created', label: '🟢 تم الإنشاء' },
              { id: 'updated', label: '🔵 تعديل بيانات' },
              { id: 'cards_assigned', label: '🟣 ربط كروت' },
              { id: 'card_unassigned', label: '🟠 فك ارتباط كارت' },
              { id: 'deleted', label: '🔴 سلة المهملات' },
              { id: 'restored', label: '🟢 استرجاع' },
            ].map((pill) => {
              const active = filterAction === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setFilterAction(pill.id)}
                  style={{
                    border: active ? '1px solid var(--clr-primary-500)' : '1px solid var(--bdr-light)',
                    backgroundColor: active ? 'var(--clr-primary-50)' : 'var(--bg-subtle)',
                    color: active ? 'var(--clr-primary-700)' : 'var(--txt-secondary)',
                    fontWeight: active ? 800 : 600,
                    fontSize: '12px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Search in details */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                right: '12px',
                color: 'var(--txt-muted)',
              }}
            />
            <input
              type="text"
              placeholder="بحث في تفاصيل الحركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 32px 7px 12px',
                fontSize: '12.5px',
                borderRadius: '10px',
                border: '1px solid var(--bdr-light)',
                backgroundColor: 'var(--bg-subtle)',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="shimmer" style={{ height: '45px', borderRadius: '12px' }} />
          <div className="shimmer" style={{ height: '45px', borderRadius: '12px' }} />
          <div className="shimmer" style={{ height: '45px', borderRadius: '12px' }} />
        </div>
      ) : error ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <AlertTriangle size={36} style={{ color: 'var(--clr-error)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--clr-error)', fontSize: '14px', fontWeight: 700, margin: '0 0 12px' }}>{error}</p>
          <button onClick={fetchHistory} className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
            إعادة المحاولة
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
          <History size={44} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
          <p style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: 'var(--txt-secondary)' }}>
            {historyList.length === 0
              ? 'لا توجد حركات أو تعديلات مسجلة لهذا العميل حتى الآن'
              : 'لا توجد نتائج تطابق الفلتر أو البحث'}
          </p>
          <p style={{ fontSize: '13px', margin: 0, color: 'var(--txt-muted)' }}>
            يتم تسجيل حركات العميل تلقائياً عند الإنشاء، تعديل البيانات، ربط أو فك الكروت، والنقل للمهملات.
          </p>
        </div>
      ) : viewMode === 'timeline' ? (
        /* ─── Timeline View ─────────────────────────────────── */
        <div style={{ padding: '24px 28px' }}>
          <div style={{ position: 'relative', paddingRight: '26px' }}>
            {/* Vertical timeline line */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                right: '11px',
                width: '2px',
                backgroundColor: 'var(--bdr-light)',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredHistory.map((item, index) => {
                const cfg = getActionBadgeConfig(item.action);
                const IconComponent = cfg.icon;
                const hasSnapshot = Boolean(item.snapshot && Object.keys(item.snapshot).length > 0);

                return (
                  <div key={item._id || index} style={{ position: 'relative' }}>
                    {/* Timeline Node Icon */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '-26px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        border: `2px solid ${cfg.color}`,
                        color: cfg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 0 3px #fff',
                        zIndex: 2,
                      }}
                    >
                      <IconComponent size={12} />
                    </div>

                    {/* Timeline Event Card */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: '14px',
                        border: '1px solid var(--bdr-light)',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition: 'background-color 0.15s ease, border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr-medium)';
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr-light)';
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-subtle)';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          {/* Badge */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: cfg.bg,
                              color: cfg.color,
                              border: `1px solid ${cfg.border}`,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '12.5px',
                              fontWeight: 800,
                            }}
                          >
                            <IconComponent size={13} />
                            {cfg.label}
                          </span>

                          {/* Recorded At */}
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '12px',
                              color: 'var(--txt-muted)',
                            }}
                          >
                            <Clock size={13} />
                            <span>{fmtDateTime(item.recorded_at)}</span>
                          </div>
                        </div>

                        {/* Snapshot Button */}
                        {hasSnapshot && (
                          <button
                            type="button"
                            onClick={() =>
                              setSnapshotTarget({
                                snapshot: item.snapshot || null,
                                action: item.action,
                                recordedAt: item.recorded_at,
                                details: item.details,
                              })
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--clr-primary-200)',
                              backgroundColor: '#fff',
                              color: 'var(--clr-primary-700)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 700,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Eye size={13} />
                            <span>عرض اللقطة (Snapshot)</span>
                          </button>
                        )}
                      </div>

                      {/* Details text */}
                      {item.details ? (
                        <div
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: 'var(--txt-body)',
                            backgroundColor: '#fff',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid var(--bdr-light)',
                          }}
                        >
                          {item.details}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12.5px', color: 'var(--txt-muted)', fontStyle: 'italic' }}>
                          لا توجد ملاحظات إضافية لهذه الحركة
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ─── Table View ────────────────────────────────────── */
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--bdr-light)' }}>
                <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>نوع العملية</th>
                <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>تفاصيل وملاحظة الحركة</th>
                <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800 }}>تاريخ ووقت الحركة</th>
                <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '12.5px', fontWeight: 800 }}>اللقطة (Snapshot)</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, index) => {
                const cfg = getActionBadgeConfig(item.action);
                const IconComponent = cfg.icon;
                const hasSnapshot = Boolean(item.snapshot && Object.keys(item.snapshot).length > 0);

                return (
                  <tr
                    key={item._id || index}
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
                    <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <IconComponent size={13} />
                        {cfg.label}
                      </span>
                    </td>

                    <td style={{ padding: '12px 18px', fontSize: '13.5px', fontWeight: 600, color: 'var(--txt-body)', verticalAlign: 'middle' }}>
                      {item.details ? item.details : <span style={{ color: 'var(--txt-muted)', fontStyle: 'italic', fontSize: '12.5px' }}>—</span>}
                    </td>

                    <td style={{ padding: '12px 18px', fontSize: '12.5px', color: 'var(--txt-secondary)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} style={{ color: 'var(--txt-muted)' }} />
                        <span>{fmtDateTime(item.recorded_at)}</span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 18px', textAlign: 'center', verticalAlign: 'middle' }}>
                      {hasSnapshot ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSnapshotTarget({
                              snapshot: item.snapshot || null,
                              action: item.action,
                              recordedAt: item.recorded_at,
                              details: item.details,
                            })
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--clr-primary-200)',
                            backgroundColor: 'var(--clr-primary-50)',
                            color: 'var(--clr-primary-700)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 700,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Eye size={13} />
                          <span>عرض اللقطة</span>
                        </button>
                      ) : (
                        <span style={{ color: 'var(--txt-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
