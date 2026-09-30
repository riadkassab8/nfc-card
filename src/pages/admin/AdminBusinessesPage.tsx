import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Badge, Skeleton, Toast, ToastType, EmptyState, ErrorState, ConfirmDialog } from '../../components/ui';
import { CreateBusinessModal } from '../../components/admin/CreateBusinessModal';
import { AdminBusinessDrawer } from '../../components/admin/AdminBusinessDrawer';
import { adminService, businessService } from '../../services';
import { Business } from '../../types';
import { useTranslation } from '../../i18n';
import { Plus, Building2, Eye, PauseCircle, PlayCircle } from 'lucide-react';

export const AdminBusinessesPage: React.FC = () => {
  const { t, formatStatus } = useTranslation();

  const [loading, setLoading] = useState<boolean>(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);

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
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const data = await adminService.getAllTenantBusinesses();
        if (isMounted) setBusinesses(data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load businesses');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusinesses();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleStatus = (bizId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setConfirmDialog({
      isOpen: true,
      title: t('admin.businesses.confirmToggleTitle'),
      message: t('admin.businesses.confirmToggleMsg'),
      action: async () => {
        try {
          const updated = await businessService.updateBusiness(bizId, { status: newStatus as any });
          setBusinesses((prev) => prev.map((b) => (b.id === bizId ? updated : b)));
          if (selectedBiz?.id === bizId) setSelectedBiz(updated);
          setToast({ type: 'warning', message: `${t('common.status')}: ${formatStatus(newStatus)}` });
        } catch (err) {
          setToast({ type: 'error', message: t('common.error') });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
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

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h2 className="text-title">{t('admin.businesses.title')}</h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t('admin.businesses.subtitle')}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} /> {t('admin.businesses.provisionNew')}
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card padding="sm">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder={t('admin.businesses.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {(['ALL', 'ACTIVE', 'DISABLED'] as const).map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? t('common.all') : formatStatus(st)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table / List */}
      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : loading ? (
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Skeleton height="44px" />
            <Skeleton height="44px" />
          </div>
        </Card>
      ) : filteredBusinesses.length === 0 ? (
        <EmptyState
          icon={<Building2 size={48} />}
          title={t('common.noData')}
          description={t('admin.businesses.searchPlaceholder')}
        />
      ) : (
        <Card padding="none" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('admin.businesses.bizName')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('admin.businesses.location')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('admin.businesses.contact')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{t('admin.businesses.status')}</th>
                  <th className="text-label" style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)', textAlign: 'end' }}>{t('admin.businesses.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((biz) => (
                  <tr key={biz.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Building2 size={18} />
                        </div>
                        <span className="text-body-medium">{biz.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }} className="text-body">
                      {biz.address || 'Address pending'}
                    </td>
                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }} className="text-body">
                      {biz.whatsapp || biz.phone || 'N/A'}
                    </td>
                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                      <Badge variant={biz.status === 'ACTIVE' ? 'active' : 'disabled'}>{biz.status}</Badge>
                    </td>
                    <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'end' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-xs)' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBiz(biz);
                            setIsDrawerOpen(true);
                          }}
                          title={t('admin.businesses.viewDetails')}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(biz.id, biz.status)}
                          title={biz.status === 'ACTIVE' ? t('admin.businesses.disable') : t('admin.businesses.activate')}
                        >
                          {biz.status === 'ACTIVE' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
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

      {/* Modals & Drawers */}
      <CreateBusinessModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newBiz) => {
          setBusinesses((prev) => [newBiz, ...prev]);
          setToast({ type: 'success', message: `${t('common.success')}: ${newBiz.name}` });
        }}
      />

      <AdminBusinessDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        business={selectedBiz}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

