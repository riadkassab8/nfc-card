import React, { useEffect, useState } from 'react';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { Card, Button, Badge, Skeleton, Toast, ToastType, EmptyState, ErrorState, ConfirmDialog } from '../components/ui';
import { CreateQRModal } from '../components/qr/CreateQRModal';
import { QRDetailsDrawer } from '../components/qr/QRDetailsDrawer';
import { qrService, businessService } from '../services';
import { QRCode, Business } from '../types';
import { Plus, Download, PauseCircle, PlayCircle, Eye, QrCode as QrIcon } from 'lucide-react';
import { useTranslation } from '../i18n';

export const QRCodesPage: React.FC = () => {
  const { t, formatStatus, isRtl } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({ isOpen: false, title: '', message: '', action: async () => {} });

  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadQRs = async () => {
      setLoading(true);
      try {
        const biz = await businessService.getCurrentBusiness();
        if (!biz) throw new Error('Business identity not found');

        const qrs = await qrService.getQRCodesByBusinessId(biz.id);
        if (isMounted) {
          setBusiness(biz);
          setQrCodes(qrs);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load QR codes');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadQRs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleStatus = (qrId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    if (newStatus === 'DISABLED') {
      // Require confirmation for disabling
      setConfirmDialog({
        isOpen: true,
        title: t('admin.businesses.confirmToggleTitle'),
        message: t('admin.businesses.confirmToggleMsg'),
        action: async () => {
          await executeStatusChange(qrId, 'DISABLED');
        },
      });
    } else {
      executeStatusChange(qrId, 'ACTIVE');
    }
  };

  const executeStatusChange = async (qrId: string, status: 'ACTIVE' | 'DISABLED') => {
    try {
      const updated = await qrService.setQRStatus(qrId, status);
      setQrCodes((prev) => prev.map((q) => (q.id === qrId ? updated : q)));
      if (selectedQR && selectedQR.id === qrId) {
        setSelectedQR(updated);
      }
      setToast({
        type: 'warning',
        message: `${t('common.status')}: ${formatStatus(status)}`,
      });
    } catch (err) {
      setToast({ type: 'error', message: t('common.error') });
    } finally {
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleArchive = (qrId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('admin.businesses.confirmToggleTitle'),
      message: t('admin.businesses.confirmToggleMsg'),
      action: async () => {
        try {
          await qrService.setQRStatus(qrId, 'ARCHIVED');
          setQrCodes((prev) => prev.filter((q) => q.id !== qrId));
          setIsDrawerOpen(false);
          setToast({ type: 'success', message: formatStatus('ARCHIVED') });
        } catch (err) {
          setToast({ type: 'error', message: t('common.error') });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const downloadPNG = (publicCode: string) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#ffffff"/>
      <rect x="30" y="30" width="80" height="80" fill="#18181b"/>
      <rect x="50" y="50" width="40" height="40" fill="#ffffff"/>
      <rect x="190" y="30" width="80" height="80" fill="#18181b"/>
      <rect x="210" y="50" width="40" height="40" fill="#ffffff"/>
      <rect x="30" y="190" width="80" height="80" fill="#18181b"/>
      <rect x="50" y="210" width="40" height="40" fill="#ffffff"/>
      <text x="150" y="280" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#18181b">${publicCode}</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${publicCode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell title={t('dashboard.qrCodes.title')}>
      {toast && (
        <div style={{ position: 'fixed', top: 'var(--space-2xl)', insetInlineEnd: 'var(--space-2xl)', zIndex: 1100 }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDanger
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h2 className="text-title">{t('dashboard.qrCodes.title')}</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {t('dashboard.qrCodes.subtitle')}
            </p>
          </div>

          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} /> {t('dashboard.qrCodes.createQR')}
          </Button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : loading ? (
          <Card padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <Skeleton height="44px" />
              <Skeleton height="44px" />
              <Skeleton height="44px" />
            </div>
          </Card>
        ) : qrCodes.length === 0 ? (
          <EmptyState
            icon={<QrIcon size={48} />}
            title={t('common.noData')}
            description={t('dashboard.qrCodes.subtitle')}
            action={
              <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} /> {t('dashboard.qrCodes.createQR')}
              </Button>
            }
          />
        ) : (
          /* QR Codes Table & Cards */
          <Card padding="none" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>PREVIEW</th>
                    <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('dashboard.qrCodes.placement')}</th>
                    <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('dashboard.qrCodes.publicCode')}</th>
                    <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('dashboard.qrCodes.status')}</th>
                    <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('dashboard.qrCodes.scansCount')}</th>
                    <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)', textAlign: isRtl ? 'left' : 'right' }}>{t('dashboard.qrCodes.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {qrCodes.map((qr) => (
                    <tr
                      key={qr.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 150ms ease-out' }}
                    >
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#ffffff',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <QrIcon size={24} style={{ color: 'var(--primary-bg)' }} />
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="text-body-medium">{qr.label}</span>
                          <span className="text-caption" style={{ fontFamily: 'monospace' }}>
                            Code: {qr.public_code}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }} className="text-body">
                        {qr.placement || 'General'}
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                        <Badge variant={qr.status === 'ACTIVE' ? 'active' : 'disabled'}>{qr.status}</Badge>
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)' }} className="text-body-medium">
                        {qr.scans_count || 0}
                      </td>
                      <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: isRtl ? 'left' : 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--space-xs)' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedQR(qr);
                              setIsDrawerOpen(true);
                            }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPNG(qr.public_code)}
                            title="Download Graphic"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(qr.id, qr.status)}
                            title={qr.status === 'ACTIVE' ? 'Pause QR' : 'Activate QR'}
                          >
                            {qr.status === 'ACTIVE' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modals & Drawers */}
      <CreateQRModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        businessId={business?.id || 'biz-1'}
        onSuccess={(newQR) => {
          setQrCodes((prev) => [newQR, ...prev]);
          setToast({ type: 'success', message: t('common.success') });
        }}
      />

      <QRDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        qr={selectedQR}
        onToggleStatus={handleToggleStatus}
        onArchive={handleArchive}
      />
    </DashboardShell>
  );
};
