import React, { useState } from 'react';
import { CustomerSnapshot, CustomerHistoryAction, fmtDateTime } from '../../types';
import {
  X, User, Phone, Mail, MapPin, FileText,
  CreditCard, Calendar, Sparkles, Edit3, Unlink, Trash2, RotateCcw, Clock, Code, Eye
} from 'lucide-react';

interface CustomerSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: CustomerSnapshot | null;
  action: CustomerHistoryAction;
  recordedAt: string;
  details?: string;
}

export const getActionBadgeConfig = (action: string) => {
  switch (action) {
    case 'created':
      return {
        label: 'تم الإنشاء',
        icon: Sparkles,
        bg: '#ecfdf5',
        color: '#059669',
        border: '#a7f3d0',
      };
    case 'updated':
      return {
        label: 'تعديل بيانات',
        icon: Edit3,
        bg: '#eff6ff',
        color: '#2563eb',
        border: '#bfdbfe',
      };
    case 'cards_assigned':
      return {
        label: 'ربط كروت',
        icon: CreditCard,
        bg: '#faf5ff',
        color: '#7e22ce',
        border: '#e9d5ff',
      };
    case 'card_unassigned':
      return {
        label: 'فك ارتباط كارت',
        icon: Unlink,
        bg: '#fff7ed',
        color: '#c2410c',
        border: '#fed7aa',
      };
    case 'deleted':
      return {
        label: 'نقل للمهملات',
        icon: Trash2,
        bg: '#fef2f2',
        color: '#dc2626',
        border: '#fecaca',
      };
    case 'restored':
      return {
        label: 'استرجاع من المهملات',
        icon: RotateCcw,
        bg: '#f0fdf4',
        color: '#16a34a',
        border: '#bbf7d0',
      };
    default:
      return {
        label: action,
        icon: Clock,
        bg: '#f8fafc',
        color: '#475569',
        border: '#e2e8f0',
      };
  }
};

export const CustomerSnapshotModal: React.FC<CustomerSnapshotModalProps> = ({
  isOpen,
  onClose,
  snapshot,
  action,
  recordedAt,
  details,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen) return null;

  const actionCfg = getActionBadgeConfig(action);
  const ActionIcon = actionCfg.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        padding: '16px',
        animation: 'fadeIn 180ms ease both',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--bdr-light)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalIn 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--bdr-light)',
            backgroundColor: '#ffffff',
          }}
        >
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
              <Eye size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--txt-heading)', margin: 0 }}>
                لقطة بيانات العميل (Snapshot)
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--txt-muted)' }}>
                نسخة البيانات كما كانت مسجلة في لحظة العملية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            style={{
              background: 'var(--bg-subtle)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--txt-secondary)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Action & Time Banner */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '12px',
              border: '1px solid var(--bdr-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: actionCfg.bg,
                  color: actionCfg.color,
                  border: `1px solid ${actionCfg.border}`,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                }}
              >
                <ActionIcon size={14} />
                {actionCfg.label}
              </span>

              {details && (
                <span style={{ fontSize: '13px', color: 'var(--txt-secondary)', fontWeight: 600 }}>
                  ({details})
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--txt-muted)' }}>
              <Calendar size={13} />
              <span>{fmtDateTime(recordedAt)}</span>
            </div>
          </div>

          {!snapshot ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--txt-muted)' }}>
              <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>لا تتوفر لقطة بيانات لهذه الحركة</p>
            </div>
          ) : (
            <>
              {/* Snapshot Data Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                {/* Name */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--bdr-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt-muted)', fontSize: '12px', marginBottom: '4px' }}>
                    <User size={13} />
                    <span>اسم العميل</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                    {snapshot.name || '—'}
                  </div>
                </div>

                {/* Phone */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--bdr-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt-muted)', fontSize: '12px', marginBottom: '4px' }}>
                    <Phone size={13} />
                    <span>رقم الهاتف</span>
                  </div>
                  <div dir="ltr" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--txt-heading)', textAlign: 'right' }}>
                    {snapshot.phone || '—'}
                  </div>
                </div>

                {/* Email */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--bdr-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt-muted)', fontSize: '12px', marginBottom: '4px' }}>
                    <Mail size={13} />
                    <span>البريد الإلكتروني</span>
                  </div>
                  <div dir="ltr" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--txt-heading)', textAlign: 'right' }}>
                    {snapshot.email || '—'}
                  </div>
                </div>

                {/* City */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--bdr-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt-muted)', fontSize: '12px', marginBottom: '4px' }}>
                    <MapPin size={13} />
                    <span>المدينة / المحافظة</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--txt-heading)' }}>
                    {snapshot.city || '—'}
                  </div>
                </div>

                {/* Total Cards (if present) */}
                {snapshot.total_cards !== undefined && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--bdr-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt-muted)', fontSize: '12px', marginBottom: '4px' }}>
                      <CreditCard size={13} />
                      <span>إجمالي الكروت في هذه اللحظة</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--txt-heading)' }}>
                      {snapshot.total_cards}
                    </div>
                  </div>
                )}
              </div>

              {/* Address (Full row) */}
              {snapshot.address && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--bdr-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt-muted)', fontSize: '12px', marginBottom: '4px' }}>
                    <MapPin size={13} />
                    <span>العنوان التفصيلي</span>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--txt-body)' }}>
                    {snapshot.address}
                  </div>
                </div>
              )}

              {/* Notes (Full row) */}
              {snapshot.notes && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--bdr-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt-muted)', fontSize: '12px', marginBottom: '4px' }}>
                    <FileText size={13} />
                    <span>ملاحظات</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--txt-body)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {snapshot.notes}
                  </div>
                </div>
              )}

              {/* Toggle Raw JSON */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--clr-primary-600)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 0',
                  }}
                >
                  <Code size={14} />
                  <span>{showRawJson ? 'إخفاء البيانات الخام (JSON)' : 'عرض البيانات الخام (JSON)'}</span>
                </button>

                {showRawJson && (
                  <pre
                    dir="ltr"
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      color: '#38bdf8',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                      maxHeight: '160px',
                    }}
                  >
                    {JSON.stringify(snapshot, null, 2)}
                  </pre>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--bdr-light)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#ffffff',
          }}
        >
          <button onClick={onClose} className="btn-outline" style={{ padding: '8px 20px', borderRadius: '10px' }}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
